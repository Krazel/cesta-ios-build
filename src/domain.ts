export const COLORS = ['sage', 'peach', 'lilac', 'butter', 'blue'] as const;
export type ListColor = (typeof COLORS)[number];
export type Category =
  'fresh' | 'dairy' | 'bakery' | 'pantry' | 'protein' | 'frozen' | 'drinks' | 'home' | 'other';
export interface Product {
  productId?: string;
  catalogId?: string;
  image?: string;
  name: string;
  emoji: string;
  category: Category;
  unit: string;
}
export interface Item extends Product {
  id: string;
  quantity: number;
  checked: boolean;
  note: string;
  addedBy: string;
}
export const productIdentity = (product: Product) =>
  product.productId || product.catalogId || product.name;
export interface Member {
  id: string;
  name: string;
  role: 'owner' | 'editor';
}
export interface ShoppingList {
  id: string;
  name: string;
  emoji: string;
  color: ListColor;
  ownerId: string;
  items: Item[];
  members: Member[];
  createdAt: string;
}
export interface Snapshot {
  device: { id: string; name: string };
  lists: ShoppingList[];
}
export interface Operation {
  id: string;
  type: string;
  listId: string;
  data: Record<string, any>;
}
export const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

// The same operation reducer runs on the phone and server. We transmit intentions,
// never entire client documents, so simultaneous additions do not overwrite peers.
export function reduceLists(
  lists: ShoppingList[],
  op: Operation,
  deviceId: string,
  name = 'Tú',
): ShoppingList[] {
  const d = op.data;
  if (op.type === 'list.create') {
    if (lists.some((l) => l.id === op.listId)) return lists;
    return [
      {
        id: op.listId,
        name: d.name,
        emoji: d.emoji,
        color: d.color,
        ownerId: deviceId,
        items: [],
        members: [{ id: deviceId, name, role: 'owner' }],
        createdAt: d.createdAt,
      },
      ...lists,
    ];
  }
  if (op.type === 'list.delete' || op.type === 'list.leave')
    return lists.filter((l) => l.id !== op.listId);
  return lists.map((list) => {
    if (list.id !== op.listId) return list;
    let next = { ...list, items: [...list.items] };
    switch (op.type) {
      case 'list.update':
        next = { ...next, name: d.name, emoji: d.emoji, color: d.color };
        break;
      case 'item.add': {
        if (next.items.some((i) => i.id === d.id)) break;
        next.items.push({
          id: d.id,
          name: d.name,
          emoji: d.emoji,
          category: d.category,
          productId: d.productId,
          catalogId: d.catalogId,
          image: d.image,
          unit: d.unit,
          quantity: d.quantity,
          checked: false,
          note: d.note || '',
          addedBy: name,
        });
        break;
      }
      case 'item.check':
        next.items = next.items.map((i) => (i.id === d.id ? { ...i, checked: d.checked } : i));
        break;
      case 'item.edit':
        next.items = next.items.map((i) =>
          i.id === d.id
            ? {
                ...i,
                name: d.name,
                emoji: d.emoji,
                quantity: d.quantity,
                unit: d.unit,
                category: d.category,
                productId: d.productId,
                catalogId: d.catalogId,
                image: d.image,
                note: d.note,
              }
            : i,
        );
        break;
      case 'item.increment':
        next.items = next.items.map((i) =>
          i.id === d.id
            ? {
                ...i,
                quantity: Math.max(
                  0.1,
                  Math.min(9999, Math.round((i.quantity + d.delta) * 100) / 100),
                ),
              }
            : i,
        );
        break;
      case 'item.delete':
        next.items = next.items.filter((i) => i.id !== d.id);
        break;
      // Capture item IDs at the moment of tapping. A peer's subsequent check is
      // not accidentally cleared by a delayed offline operation.
      case 'items.clear':
        next.items = next.items.filter((i) => !d.ids.includes(i.id));
        break;
      case 'items.reset':
        next.items = next.items.map((i) => (d.ids.includes(i.id) ? { ...i, checked: false } : i));
        break;
    }
    return next;
  });
}
