import type { ShoppingList, Member } from './domain.ts';

// Device-local links: cloud documents never carry another device's saved-list ID.
export type PurchaseSources = Record<string, string | null>;
export const isPurchase = (sources: PurchaseSources, id: string) => Object.hasOwn(sources, id);
export function privateCopy(
  list: ShoppingList,
  id: string,
  member: Member,
  uid: () => string,
): ShoppingList {
  return {
    ...list,
    id,
    ownerId: member.id,
    members: [member],
    createdAt: new Date().toISOString(),
    items: list.items.map((item) => ({
      ...item,
      id: uid(),
      checked: false,
      oneTime: false,
      addedBy: member.name,
    })),
  };
}

export function migratePurchases(
  lists: ShoppingList[],
  activeIds: string[],
  member: Member,
  uid: () => string,
) {
  const sources: PurchaseSources = {};
  const saved: ShoppingList[] = [];
  // Preserve original IDs, progress, queued operations and cloud memberships.
  for (const list of lists)
    if (activeIds.includes(list.id)) {
      const copy = privateCopy(
        { ...list, items: list.items.filter((item) => !item.oneTime) },
        uid(),
        member,
        uid,
      );
      sources[list.id] = copy.id;
      saved.push(copy);
    }
  return { sources, saved };
}
