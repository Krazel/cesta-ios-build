import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';
import { Platform, AppState } from 'react-native';
import { useSyncExternalStore } from 'react';
import { getLocales } from 'expo-localization';
import { Language, setCurrentLanguage, t } from './i18n';
import { Operation, Product, ShoppingList, Snapshot, reduceLists, normalize } from './domain';
import { products, starterLists } from './catalog';
import type { TextProduct } from './textImport';

export const uid = () =>
  Array.from(Crypto.getRandomBytes(16), (b) => b.toString(16).padStart(2, '0')).join('');
const host =
  Platform.OS === 'web' && typeof location !== 'undefined'
    ? location.hostname
    : Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost';
export const API = process.env.EXPO_PUBLIC_API_URL || `http://${host}:8787`;
export const WEB_URL = process.env.EXPO_PUBLIC_SHARE_URL || `http://${host}:8787`;
const KEY = 'cesta-state-v1';
const SECRET = 'cesta-device-v1';
type State = {
  ready: boolean;
  onboarded: boolean;
  snapshot: Snapshot;
  pending: Operation[];
  online: boolean;
  syncing: boolean;
  error: string;
  favorites: Product[];
  customProducts: Product[];
  language: Language;
  selectedId: string | null;
  activeListIds: string[];
  lastSync: number;
  pendingName?: string | null;
  starterListsVersion?: number;
};
let state: State = {
  ready: false,
  onboarded: false,
  snapshot: { device: { id: 'local-device', name: t('Mi móvil') }, lists: [] },
  pending: [],
  online: false,
  syncing: false,
  error: '',
  favorites: [],
  customProducts: [],
  language: getLocales()[0]?.languageCode === 'en' ? 'en' : 'es',
  selectedId: null,
  activeListIds: [],
  lastSync: 0,
};
let token = '';
setCurrentLanguage(state.language);
let registered = false;
let syncPromise: Promise<void> | null = null;
let storageQueue = Promise.resolve();
const listeners = new Set<() => void>();
const emit = () => {
  state = { ...state };
  listeners.forEach((fn) => fn());
};
export const useCesta = () =>
  useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => state,
  );
export const currentLists = () =>
  state.pending.reduce(
    (ls, op) => reduceLists(ls, op, state.snapshot.device.id, state.snapshot.device.name),
    state.snapshot.lists,
  );
const save = () => {
  const payload = JSON.stringify({
    onboarded: state.onboarded,
    snapshot: state.snapshot,
    pending: state.pending,
    favorites: state.favorites,
    customProducts: state.customProducts,
    language: state.language,
    selectedId: state.selectedId,
    activeListIds: state.activeListIds,
    pendingName: state.pendingName,
    starterListsVersion: state.starterListsVersion,
  });
  const job = storageQueue.then(() => AsyncStorage.setItem(KEY, payload));
  storageQueue = job.catch(() => {
    state.error = t('No queda espacio para guardar los cambios. Libera espacio en el dispositivo.');
    emit();
  });
  return job;
};
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
async function request(path: string, body?: unknown, method = body === undefined ? 'GET' : 'POST') {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(API + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok)
      throw new ApiError(t(data.message || 'No se ha podido conectar.'), response.status);
    return data;
  } finally {
    clearTimeout(timer);
  }
}
export async function initialize() {
  try {
    const cached = await AsyncStorage.getItem(KEY);
    if (cached) {
      const data = JSON.parse(cached);
      if (
        data.snapshot?.device &&
        Array.isArray(data.snapshot.lists) &&
        Array.isArray(data.pending)
      ) {
        state = { ...state, ...data };
        // Keep previously visible lists on the home screen when upgrading.
        state.activeListIds = Array.isArray(data.activeListIds)
          ? data.activeListIds
          : currentLists().map((list) => list.id);
      }
    }
    token =
      (Platform.OS === 'web'
        ? await AsyncStorage.getItem(SECRET)
        : await SecureStore.getItemAsync(SECRET)) || '';
    if (!token) {
      token = uid() + uid();
      if (Platform.OS === 'web') await AsyncStorage.setItem(SECRET, token);
      else await SecureStore.setItemAsync(SECRET, token);
    }
    setCurrentLanguage(state.language);
    if (state.onboarded && ensureStarterLists()) await save();
    state.ready = true;
    emit();
    void synchronize();
  } catch {
    state.error = t('No se han podido abrir tus datos. Cierra y vuelve a abrir la aplicación.');
    state.ready = true;
    emit();
  }
}
export function synchronize(): Promise<void> {
  if (syncPromise) return syncPromise;
  syncPromise = (async () => {
    state.syncing = true;
    emit();
    try {
      await storageQueue;
      if (!registered) {
        const remote = await request('/api/register', { token, name: state.snapshot.device.name });
        state.snapshot = remote;
        registered = true;
      }
      if (state.pendingName) {
        const name = state.pendingName;
        state.snapshot = await request('/api/profile', { name });
        if (state.pendingName === name) state.pendingName = null;
        await save();
      }
      while (state.pending.length) {
        const op = state.pending[0];
        try {
          await request('/api/ops', op);
          state.snapshot = {
            ...state.snapshot,
            lists: reduceLists(
              state.snapshot.lists,
              op,
              state.snapshot.device.id,
              state.snapshot.device.name,
            ),
          };
          state.pending = state.pending.filter((o) => o.id !== op.id);
          await save();
          emit();
        } catch (error) {
          if (error instanceof ApiError && [400, 403, 404, 409].includes(error.status)) {
            state.error = error.message;
            state.pending = state.pending.filter((o) => o.id !== op.id);
            await save();
          } else throw error;
        }
      }
      state.snapshot = await request('/api/snapshot');
      state.online = true;
      state.lastSync = Date.now();
      await save();
    } catch (error) {
      state.online = false;
      if (error instanceof ApiError && error.status === 401) registered = false;
    } finally {
      state.syncing = false;
      syncPromise = null;
      emit();
    }
  })();
  return syncPromise;
}
export function startSync() {
  const timer = setInterval(() => {
    if (AppState.currentState === 'active' || Platform.OS === 'web') void synchronize();
  }, 2500);
  const subscription = AppState.addEventListener('change', (s) => {
    if (s === 'active') void synchronize();
  });
  return () => {
    clearInterval(timer);
    subscription.remove();
  };
}
export function enqueue(type: string, listId: string, data: Record<string, any>) {
  state.pending = [...state.pending, { id: uid(), type, listId, data }];
  emit();
  void save()
    .then(() => synchronize())
    .catch(() => {});
}
export async function onboard(name: string) {
  const chosenName = name.trim() || t('Mi móvil');
  state.pendingName = chosenName;
  state.snapshot = { ...state.snapshot, device: { ...state.snapshot.device, name: chosenName } };
  state.onboarded = true;
  ensureStarterLists();
  emit();
  await save();
  await synchronize();
}
function ensureStarterLists(): boolean {
  if ((state.starterListsVersion || 0) >= 1) return false;
  const existing = currentLists();
  const names = new Set(existing.map((list) => normalize(list.name)));
  const operations: Operation[] = [];
  let count = existing.length;
  for (const list of starterLists) {
    // An upgrade never replaces an existing list or adds a same-name copy.
    if (names.has(normalize(list.name)) || names.has(normalize(list.nameEn)) || count >= 100)
      continue;
    const listId = uid();
    count++;
    operations.push({
      id: uid(),
      type: 'list.create',
      listId,
      data: {
        name: t(list.name),
        emoji: list.emoji,
        color: list.color,
        createdAt: new Date().toISOString(),
      },
    });
    for (const name of list.names) {
      const product = products.find((p) => p.name === name);
      if (product)
        operations.push({
          id: uid(),
          type: 'item.add',
          listId,
          data: { ...product, id: uid(), quantity: 1, note: '' },
        });
    }
  }
  // The marker and queued operations are persisted together, including offline.
  state.pending = [...state.pending, ...operations];
  state.starterListsVersion = 1;
  return true;
}
export function selectList(id: string | null) {
  state.selectedId = id;
  emit();
  void save().catch(() => {});
}
export function clearError() {
  state.error = '';
  emit();
}
export function createList(name: string, emoji: string, color: string, activate = true) {
  const id = uid();
  if (activate) state.activeListIds = [...state.activeListIds, id];
  enqueue('list.create', id, { name, emoji, color, createdAt: new Date().toISOString() });
  selectList(id);
  return id;
}
export function setListActive(listId: string, active: boolean) {
  state.activeListIds = active
    ? Array.from(new Set([...state.activeListIds, listId]))
    : state.activeListIds.filter((id) => id !== listId);
  emit();
  void save().catch(() => {});
}
export function reuseList(list: ShoppingList) {
  // Reset only the items seen when starting this round; preserve simultaneous additions.
  state.activeListIds = Array.from(new Set([...state.activeListIds, list.id]));
  enqueue('items.reset', list.id, { ids: list.items.map((item) => item.id) });
}
export function addProduct(listId: string, product: Product, quantity = 1, note = '') {
  enqueue('item.add', listId, { ...product, id: uid(), quantity, note });
}
export function addTextProducts(listId: string, items: TextProduct[]) {
  const list = currentLists().find((entry) => entry.id === listId);
  if (!list) throw new Error(t('La lista ya no está disponible.'));
  if (list.items.length + items.length > 1000)
    throw new Error(
      t('Esta lista admite hasta 1000 productos. Quita algunos antes de añadir más.'),
    );
  state.pending = [
    ...state.pending,
    ...items.map((item) => ({
      id: uid(),
      type: 'item.add',
      listId,
      data: { ...item.product, id: uid(), quantity: item.quantity, note: item.note },
    })),
  ];
  emit();
  void save()
    .then(() => synchronize())
    .catch(() => {});
}
export function favorite(product: Product) {
  state.favorites = state.favorites.some(
    (p) =>
      (p.productId || p.catalogId || p.name) ===
      (product.productId || product.catalogId || product.name),
  )
    ? state.favorites.filter(
        (p) =>
          (p.productId || p.catalogId || p.name) !==
          (product.productId || product.catalogId || product.name),
      )
    : [...state.favorites, product];
  emit();
  void save().catch(() => {});
}
export function setLanguage(language: Language) {
  state.language = language;
  setCurrentLanguage(language);
  emit();
  void save().catch(() => {});
}
export function saveCustomProduct(product: Product) {
  const value = { ...product, productId: product.productId || uid(), catalogId: undefined };
  if (!value.name.trim() || value.name.length > 80 || !value.unit.trim())
    throw new Error(t('Revisa el nombre y la unidad.'));
  const exists = state.customProducts.some((p) => p.productId === value.productId);
  if (!exists && state.customProducts.length >= 300)
    throw new Error(t('Puedes guardar hasta 300 productos propios.'));
  state.customProducts = exists
    ? state.customProducts.map((p) => (p.productId === value.productId ? value : p))
    : [value, ...state.customProducts];
  state.favorites = state.favorites.map((p) => (p.productId === value.productId ? value : p));
  emit();
  void save().catch(() => {});
  return value;
}
export function deleteCustomProduct(productId: string) {
  state.customProducts = state.customProducts.filter((p) => p.productId !== productId);
  state.favorites = state.favorites.filter((p) => p.productId !== productId);
  emit();
  void save().catch(() => {});
}
export async function connected() {
  await synchronize();
  if (!state.online || state.pending.length)
    throw new Error(
      t('Necesitas conexión para compartir. Tus cambios siguen guardados en este dispositivo.'),
    );
}
export async function invite(listId: string) {
  await connected();
  return request(`/api/lists/${listId}/invite`, {});
}
export async function revoke(listId: string) {
  await connected();
  return request(`/api/lists/${listId}/invite`, undefined, 'DELETE');
}
export async function join(input: string) {
  const value = input.trim();
  let code = value;
  if (value.includes('://')) {
    try {
      const url = new URL(value);
      code =
        url.searchParams.get('code') || new URLSearchParams(url.hash.slice(1)).get('join') || '';
    } catch {
      throw new Error(t('Pega un código o enlace de invitación válido.'));
    }
  }
  if (!/^[a-zA-Z0-9_-]{24}$/.test(code))
    throw new Error(t('El código tiene 24 caracteres. También puedes pegar el enlace completo.'));
  await connected();
  const remote = await request('/api/join', { code });
  state.snapshot = { device: remote.device, lists: remote.lists };
  state.selectedId = remote.joinedListId;
  state.activeListIds = Array.from(new Set([...state.activeListIds, remote.joinedListId]));
  await save();
  emit();
  return remote.joinedListId;
}
export async function removeMember(listId: string, memberId: string) {
  await connected();
  state.snapshot = await request(`/api/lists/${listId}/members/${memberId}`, undefined, 'DELETE');
  await save();
  emit();
}
export async function updateName(name: string) {
  state.pendingName = name;
  state.snapshot = { ...state.snapshot, device: { ...state.snapshot.device, name } };
  emit();
  await save();
  void synchronize();
}
export function exportData() {
  return JSON.stringify(
    {
      format: 'cesta-backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      lists: currentLists(),
      favorites: state.favorites,
      customProducts: state.customProducts,
    },
    null,
    2,
  );
}
export function importData(raw: string) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(t('El archivo no contiene una copia válida de Cesta.'));
  }
  if (
    !data ||
    data.format !== 'cesta-backup' ||
    data.version !== 1 ||
    !Array.isArray(data.lists) ||
    data.lists.length > 100
  )
    throw new Error(t('Esta copia no es compatible con Cesta.'));
  const validLists = data.lists as ShoppingList[];
  const favoriteItems = Array.isArray(data.favorites) ? data.favorites : [];
  const customItems = Array.isArray(data.customProducts) ? data.customProducts : [];
  if (customItems.length > 300) throw new Error(t('Puedes guardar hasta 300 productos propios.'));
  if (
    favoriteItems.length > 1000 ||
    [...favoriteItems, ...customItems].some(
      (p: Product) =>
        !p ||
        typeof p.name !== 'string' ||
        (p.image !== undefined &&
          (typeof p.image !== 'string' ||
            p.image.length > 60000 ||
            !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(p.image))) ||
        !p.name.trim() ||
        p.name.length > 80 ||
        typeof p.emoji !== 'string' ||
        p.emoji.length > 16 ||
        typeof p.unit !== 'string' ||
        p.unit.length > 24 ||
        ![
          'fresh',
          'dairy',
          'bakery',
          'pantry',
          'protein',
          'frozen',
          'drinks',
          'home',
          'other',
        ].includes(p.category),
    )
  )
    throw new Error(t('La copia contiene favoritos no válidos.'));
  for (const l of validLists) {
    if (
      !l ||
      typeof l.name !== 'string' ||
      !l.name.trim() ||
      l.name.length > 60 ||
      !['sage', 'peach', 'lilac', 'butter', 'blue'].includes(l.color) ||
      typeof l.emoji !== 'string' ||
      !l.emoji ||
      l.emoji.length > 16 ||
      !Array.isArray(l.items) ||
      l.items.length > 1000
    )
      throw new Error(t('La copia contiene una lista no válida.'));
    for (const i of l.items)
      if (
        !i ||
        typeof i.name !== 'string' ||
        (i.image !== undefined &&
          (typeof i.image !== 'string' ||
            i.image.length > 60000 ||
            !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(i.image))) ||
        !i.name.trim() ||
        i.name.length > 80 ||
        typeof i.quantity !== 'number' ||
        !Number.isFinite(i.quantity) ||
        i.quantity < 0.1 ||
        i.quantity > 9999 ||
        typeof i.unit !== 'string' ||
        !i.unit ||
        i.unit.length > 24 ||
        typeof i.emoji !== 'string' ||
        !i.emoji ||
        i.emoji.length > 16 ||
        typeof i.note !== 'string' ||
        i.note.length > 300 ||
        ![
          'fresh',
          'dairy',
          'bakery',
          'pantry',
          'protein',
          'frozen',
          'drinks',
          'home',
          'other',
        ].includes(i.category) ||
        typeof i.checked !== 'boolean'
      )
        throw new Error(t('La copia contiene un producto no válido.'));
  }
  if (currentLists().length + validLists.length > 100)
    throw new Error(t('La copia supera el límite de 100 listas.'));
  const customs = new Map(
    [
      ...state.customProducts,
      ...customItems.map((p: Product) => ({ ...p, productId: p.productId || uid() })),
    ].map((p) => [p.productId, p]),
  );
  if (customs.size > 300) throw new Error(t('Puedes guardar hasta 300 productos propios.'));
  // Persist one batch, rather than serializing every embedded photo once per item.
  const operations: Operation[] = [];
  for (const list of validLists) {
    const listId = uid();
    operations.push({
      id: uid(),
      type: 'list.create',
      listId,
      data: {
        name: list.name,
        emoji: list.emoji,
        color: list.color,
        createdAt: new Date().toISOString(),
      },
    });
    for (const item of list.items) {
      const itemId = uid();
      operations.push({ id: uid(), type: 'item.add', listId, data: { ...item, id: itemId } });
      if (item.checked)
        operations.push({
          id: uid(),
          type: 'item.check',
          listId,
          data: { id: itemId, checked: true },
        });
    }
  }
  const favoritesByName = new Map(
    [...state.favorites, ...favoriteItems].map((p) => [p.productId || p.catalogId || p.name, p]),
  );
  state.favorites = Array.from(favoritesByName.values());
  state.customProducts = Array.from(customs.values());
  state.pending = [...state.pending, ...operations];
  emit();
  void save()
    .then(() => synchronize())
    .catch(() => {});
  return validLists.length;
}
export async function eraseDevice() {
  await connected();
  await request('/api/device', undefined, 'DELETE');
  await storageQueue;
  await AsyncStorage.removeItem(KEY);
  if (Platform.OS === 'web') await AsyncStorage.removeItem(SECRET);
  else await SecureStore.deleteItemAsync(SECRET);
  registered = false;
  state = {
    ready: false,
    onboarded: false,
    snapshot: { device: { id: 'local-device', name: t('Mi móvil') }, lists: [] },
    pending: [],
    online: false,
    syncing: false,
    error: '',
    favorites: [],
    customProducts: [],
    language: state.language,
    selectedId: null,
    activeListIds: [],
    lastSync: 0,
  };
  emit();
  await initialize();
}
