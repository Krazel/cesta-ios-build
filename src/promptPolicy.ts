export const DAY = 86_400_000;
export type PromptHistory = {
  firstUse: number;
  lastUseDay: string;
  usedDays: number;
  completedShops: number;
  lastSupport: number;
  lastReview: number;
  lastAny: number;
  supportNever: boolean;
};
export const newHistory = (now: number): PromptHistory => ({
  firstUse: now,
  lastUseDay: '',
  usedDays: 0,
  completedShops: 0,
  lastSupport: 0,
  lastReview: 0,
  lastAny: 0,
  supportNever: false,
});
export function promptDue(
  history: PromptHistory,
  now: number,
  subscribed: boolean,
  reviewSupported: boolean,
  canSubscribe: boolean,
): 'review' | 'support' | null {
  if (now < history.firstUse || now - history.lastAny < DAY) return null;
  if (
    reviewSupported &&
    history.completedShops >= 2 &&
    history.usedDays >= 3 &&
    now - history.firstUse >= 7 * DAY &&
    (!history.lastReview || now - history.lastReview >= 120 * DAY)
  )
    return 'review';
  if (
    canSubscribe &&
    !subscribed &&
    !history.supportNever &&
    history.usedDays >= 3 &&
    now - history.firstUse >= 7 * DAY &&
    (!history.lastSupport || now - history.lastSupport >= 14 * DAY)
  )
    return 'support';
  return null;
}
