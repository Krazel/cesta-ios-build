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
import { productSizes, type ProductSize } from './appearance';
import { CloudSync, CloudError, type CloudRef } from './syncEngine';

export const uid = () =>
  Array.from(Crypto.getRandomBytes(16), (b) => b.toString(16).padStart(2, '0')).join('');
const host =
  Platform.OS === 'web' && typeof location !== 'undefined'
    ? location.hostname
    : Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost';
export const API =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'web' ? location.origin : "https://cesta.krazel-zodiac-daily.workers.dev");
export const WEB_URL = process.env.EXPO_PUBLIC_SHARE_URL || API;
const KEY = 'cesta-state-v2';
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
  productSize: ProductSize;
  selectedId: string | null;
  activeListIds: string[];
  lastSync: number;
  pendingName?: string | null;
  starterListsVersion?: number;
  cloud: Record<string, CloudRef>;
  sequence: number;
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
  productSize: 'comfortable',
  selectedId: null,
  activeListIds: [],
  lastSync: 0,
  cloud: {},
  sequence: 0,
};
let token = '';
setCurrentLanguage(state.language);
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
    productSize: state.productSize,
    selectedId: state.selectedId,
    activeListIds: state.activeListIds,
    pendingName: state.pendingName,
    starterListsVersion: state.starterListsVersion,
    cloud: state.cloud,
    sequence: state.sequence,
  });
  const job = storageQueue.then(() => AsyncStorage.setItem(KEY, payload));
  storageQueue = job.catch(() => {
    state.error = t('No queda espacio para guardar los cambios. Libera espacio en el dispositivo.');
    emit();
  });
  return job;
};
const cloudSync = new CloudSync({
  get: () => state,
  token: () => token,
  api: () => API,
  save,
  change: emit,
  uid,
  error: (message) => {
    state.error = t(message);
    emit();
  },
  status: (online) => {
    state.online = online;
    if (online) state.lastSync = Date.now();
    emit();
  },
});
let started = false;
export async function initialize() {
  try {
    const cached = await AsyncStorage.getItem(KEY);
    const legacy = cached ? null : await AsyncStorage.getItem('cesta-state-v1');
    const raw = cached || legacy;
    if (raw) {
      const data = JSON.parse(raw);
      if (
        data.snapshot?.device &&
        Array.isArray(data.snapshot.lists) &&
        Array.isArray(data.pending)
      ) {
        state = { ...state, ...data };
        state.cloud = data.cloud || {};
        state.sequence = data.sequence || 0;
        state.productSize = Object.hasOwn(productSizes, data.productSize)
          ? data.productSize
          : 'comfortable';
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
    const deviceId = (
      await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, token)
    ).slice(0, 32);
    if (legacy) {
      // Keep the v1 record untouched for recovery. Old LAN lists become private copies;
      // never silently upload an existing device's personal data to a new provider.
      const lists = currentLists();
      state.snapshot.lists = lists.map((list) => ({
        ...list,
        ownerId: deviceId,
        members: [{ id: deviceId, name: state.snapshot.device.name, role: 'owner' }],
      }));
      state.pending = [];
      state.cloud = {};
      state.sequence = 0;
      if (lists.some((list) => list.members.length > 1))
        state.error = t(
          'Tus listas anteriores se han conservado aquí. Crea una invitación nueva para compartirlas por Internet.',
        );
    }
    state.snapshot.device.id = deviceId;
    setCurrentLanguage(state.language);
    if (state.onboarded) ensureStarterLists();
    await save();
    state.ready = true;
    emit();
    if (started) cloudSync.start();
  } catch {
    state.error = t('No se han podido abrir tus datos. Cierra y vuelve a abrir la aplicación.');
    state.ready = true;
    emit();
  }
}
export async function synchronize() {
  for (const id of Object.keys(state.cloud)) await cloudSync.settle(id);
}
export function startSync() {
  started = true;
  if (state.ready) cloudSync.start();
  const resume = () => {
    if (state.ready) cloudSync.start();
  };
  const subscription = AppState.addEventListener('change', (s) => {
    if (s === 'active') resume();
    else cloudSync.stop();
  });
  const visibility = () => {
    if (document.hidden) cloudSync.stop();
    else resume();
  };
  if (Platform.OS === 'web') {
    window.addEventListener('online', resume);
    document.addEventListener('visibilitychange', visibility);
  }
  return () => {
    started = false;
    cloudSync.stop();
    subscription.remove();
    if (Platform.OS === 'web') {
      window.removeEventListener('online', resume);
      document.removeEventListener('visibilitychange', visibility);
    }
  };
}
function applyOperations(operations: Operation[]) {
  for (const op of operations) {
    if (state.cloud[op.listId]) state.pending.push({ ...op, seq: ++state.sequence });
    else
      state.snapshot.lists = reduceLists(
        state.snapshot.lists,
        op,
        state.snapshot.device.id,
        state.snapshot.device.name,
      );
  }
}
function persistOperations(operations: Operation[]) {
  applyOperations(operations);
  emit();
  void save()
    .then(() => {
      for (const id of new Set(operations.map((op) => op.listId)))
        if (state.cloud[id]) cloudSync.kick(id);
    })
    .catch(() => {});
}
export function enqueue(type: string, listId: string, data: Record<string, any>) {
  persistOperations([{ id: uid(), type, listId, data }]);
}
export async function onboard(name: string) {
  state.snapshot.device.name = name.trim() || t('Mi móvil');
  state.onboarded = true;
  ensureStarterLists();
  emit();
  await save();
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
  applyOperations(operations);
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
  persistOperations(
    items.map((item) => ({
      id: uid(),
      type: 'item.add',
      listId,
      data: { ...item.product, id: uid(), quantity: item.quantity, note: item.note },
    })),
  );
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
export function setProductSize(size: ProductSize) {
  state.productSize = size;
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
export async function enableCloud(listId: string) {
  const list = currentLists().find((list) => list.id === listId);
  if (!list) throw new Error(t('La lista ya no está disponible.'));
  if (!state.cloud[listId]) {
    state.cloud[listId] = { published: false, version: 0, seed: JSON.parse(JSON.stringify(list)) };
    await save();
    emit();
  }
  try {
    await cloudSync.settle(listId);
  } catch (error) {
    if (error instanceof CloudError) throw new Error(t(error.message));
    throw new Error(
      t('Necesitas conexión para compartir. Tus cambios siguen guardados en este dispositivo.'),
    );
  }
}
export async function invite(listId: string) {
  await enableCloud(listId);
  return cloudSync.request(listId, 'invite', {});
}
export async function revoke(listId: string) {
  if (!state.cloud[listId]?.published) return;
  return cloudSync.request(listId, 'invite', undefined, 'DELETE');
}
export async function join(input: string) {
  let code = input.trim();
  if (code.includes('://')) {
    try {
      const url = new URL(code);
      code =
        url.searchParams.get('code') || new URLSearchParams(url.hash.slice(1)).get('join') || '';
    } catch {
      throw new Error(t('Pega un código o enlace de invitación válido.'));
    }
  }
  const parts = code.replace(/\s/g, '').match(/^([a-f0-9]{32})\.([a-zA-Z0-9_-]{24})$/);
  if (!parts) throw new Error(t('Pega el enlace o código de la nueva invitación de Cesta.'));
  if (currentLists().length >= 100 && !state.cloud[parts[1]])
    throw new Error(t('Puedes guardar hasta 100 listas.'));
  const remote = await cloudSync.request(parts[1], 'join', {
    code: parts[2],
    name: state.snapshot.device.name,
  });
  const listId = parts[1];
  state.cloud[listId] ??= { published: true, version: 0 };
  cloudSync.receive(listId, remote);
  state.selectedId = listId;
  state.activeListIds = Array.from(new Set([...state.activeListIds, listId]));
  await save();
  emit();
  cloudSync.kick(listId);
  return listId;
}
export async function removeMember(listId: string, memberId: string) {
  const remote = await cloudSync.request(listId, 'members/' + memberId, undefined, 'DELETE');
  cloudSync.receive(listId, remote);
  await save();
}
export async function makeLocal(listId: string) {
  await cloudSync.settle(listId);
  const copy = currentLists().find((list) => list.id === listId);
  if (!copy) return;
  const nextId = uid();
  // Persist the private replacement before removing the shared copy.
  state.snapshot.lists.push({
    ...copy,
    id: nextId,
    ownerId: state.snapshot.device.id,
    members: [{ ...state.snapshot.device, role: 'owner' }],
  });
  if (state.activeListIds.includes(listId)) state.activeListIds.push(nextId);
  state.selectedId = nextId;
  await save();
  enqueue(copy.ownerId === state.snapshot.device.id ? 'list.delete' : 'list.leave', listId, {});
  await cloudSync.settle(listId);
  return nextId;
}
export async function updateName(name: string) {
  state.snapshot.device.name = name;
  for (const list of state.snapshot.lists)
    if (!state.cloud[list.id])
      list.members = list.members.map((member) =>
        member.id === state.snapshot.device.id ? { ...member, name } : member,
      );
  emit();
  await save();
  for (const listId of Object.keys(state.cloud)) enqueue('member.rename', listId, { name });
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
  persistOperations(operations);
  return validLists.length;
}
export async function eraseDevice() {
  // Cloud deletion requires a confirmed server response; never pretend an offline
  // deletion removed a remotely shared list.
  for (const id of Object.keys(state.cloud)) {
    await cloudSync.settle(id);
    const list = currentLists().find((list) => list.id === id);
    if (list) {
      enqueue(list.ownerId === state.snapshot.device.id ? 'list.delete' : 'list.leave', id, {});
      await cloudSync.settle(id);
    }
  }
  cloudSync.stop();
  await storageQueue;
  await AsyncStorage.multiRemove([KEY, 'cesta-state-v1']);
  if (Platform.OS === 'web') await AsyncStorage.removeItem(SECRET);
  else await SecureStore.deleteItemAsync(SECRET);
  state = {
    ...state,
    ready: false,
    onboarded: false,
    snapshot: { device: { id: 'local-device', name: t('Mi móvil') }, lists: [] },
    pending: [],
    cloud: {},
    sequence: 0,
    favorites: [],
    customProducts: [],
    activeListIds: [],
    selectedId: null,
    online: false,
    syncing: false,
    error: '',
    lastSync: 0,
    starterListsVersion: 0,
  };
  emit();
  await initialize();
}
