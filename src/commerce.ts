import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { newHistory, promptDue, type PromptHistory } from './promptPolicy';
export type StoreProduct = { id: string; name: string; price: string; amount: number };
type CommerceState = {
  supported: boolean;
  reviewSupported?: boolean;
  initialized: boolean;
  adsRemoved: boolean;
  adsAllowed: boolean;
  privacyRequired: boolean;
  products: StoreProduct[];
  outcome?: string;
};
type Bridge = {
  refresh(): Promise<CommerceState>;
  loadProducts(): Promise<CommerceState>;
  purchase(id: string): Promise<CommerceState>;
  restore(): Promise<CommerceState>;
  prepareAds(): Promise<CommerceState>;
  privacy(): Promise<CommerceState>;
  requestReview(): Promise<boolean>;
  addListener(event: 'onChange', listener: (value: CommerceState) => void): { remove(): void };
};
const native = Platform.OS === 'ios' ? requireOptionalNativeModule<Bridge>('CestaCommerce') : null;
let state: CommerceState = {
  supported: !!native,
  initialized: !native,
  adsRemoved: false,
  adsAllowed: false,
  privacyRequired: false,
  products: [],
};
const listeners = new Set<() => void>();
const publish = (value: CommerceState) => {
  state = { ...state, ...value };
  listeners.forEach((fn) => fn());
  return state;
};
export const useCommerce = () =>
  useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => state,
  );
export const getCommerce = () => state;
let startup: Promise<unknown> | undefined;
export function initializeCommerce() {
  if (!native) return Promise.resolve(state);
  if (!startup) {
    native.addListener('onChange', publish);
    startup = native
      .refresh()
      .then(publish)
      .catch(() => {
        startup = undefined;
        return state;
      });
  }
  return startup;
}
export const refreshCommerce = async () => (native ? publish(await native.refresh()) : state);
export const loadStoreProducts = async () =>
  native ? publish(await native.loadProducts()) : state;
export const prepareAds = async () => (native ? publish(await native.prepareAds()) : state);
export const buySubscription = async (id: string) => {
  if (!native) throw new Error('Suscripciones disponibles en la app para iPhone.');
  return publish(await native.purchase(id));
};
export const restoreSubscriptions = async () => {
  if (!native) throw new Error('Suscripciones disponibles en la app para iPhone.');
  return publish(await native.restore());
};
export const openAdPrivacy = async () => {
  if (!native) return state;
  publish({ ...state, adsAllowed: false });
  try {
    return publish(await native.privacy());
  } catch (error) {
    await refreshCommerce();
    throw error;
  }
};
const PROMPTS_KEY = 'cesta-prompts-v1';
let history: PromptHistory | undefined;
let queue: Promise<unknown> = Promise.resolve();
async function changeHistory<T>(action: (value: PromptHistory) => T): Promise<T> {
  const task = queue.then(async () => {
    if (!history) {
      const raw = await AsyncStorage.getItem(PROMPTS_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      history = { ...newHistory(Date.now()), ...parsed };
    }
    const result = action(history!);
    await AsyncStorage.setItem(PROMPTS_KEY, JSON.stringify(history));
    return result;
  });
  queue = task.catch(() => {});
  return task;
}
export async function noteUsage() {
  return changeHistory((h) => {
    const today = new Date().toLocaleDateString('sv-SE');
    if (h.lastUseDay !== today) {
      h.lastUseDay = today;
      h.usedDays++;
    }
  });
}
export async function noteCompletedShop() {
  return changeHistory((h) => {
    h.completedShops++;
  });
}
export async function nextPrompt() {
  return changeHistory((h) =>
    promptDue(
      h,
      Date.now(),
      state.adsRemoved,
      !!native && !!state.reviewSupported,
      state.supported && state.products.length > 0,
    ),
  );
}
// Persist before requesting UI, so a cancelled app or StoreKit refusing to display
// never makes the same prompt recur immediately. Never assume a rating was given.
export async function markPrompt(kind: 'review' | 'support', never = false) {
  return changeHistory((h) => {
    const now = Date.now();
    h.lastAny = now;
    if (kind === 'support') {
      h.lastSupport = now;
      h.supportNever ||= never;
    } else h.lastReview = now;
  });
}
export async function requestRating() {
  await markPrompt('review');
  return native ? native.requestReview() : false;
}
export async function setSupportReminders(enabled: boolean) {
  return changeHistory((h) => {
    h.supportNever = !enabled;
  });
}
export async function supportRemindersEnabled() {
  return changeHistory((h) => !h.supportNever);
}
export async function resetPromptHistory() {
  await queue;
  history = undefined;
  await AsyncStorage.removeItem(PROMPTS_KEY);
}
