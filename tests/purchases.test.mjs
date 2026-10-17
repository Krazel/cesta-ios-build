import test from 'node:test';
import assert from 'node:assert/strict';
import { privateCopy, migratePurchases, isPurchase } from '../src/purchases.ts';
import { reduceLists } from '../src/domain.ts';
const member = { id: 'me', name: 'Ana', role: 'owner' };
let seq = 0;
const uid = () => `id-${++seq}`;
const saved = {
  id: 'saved',
  name: 'Semanal',
  emoji: '🛒',
  color: 'sage',
  ownerId: 'me',
  members: [member],
  createdAt: '',
  items: [
    {
      id: 'fruit',
      name: 'Fruta',
      category: 'fresh',
      quantity: 2,
      checked: true,
      oneTime: false,
      note: 'Madura',
      image: 'photo',
    },
    { id: 'extra', name: 'Extra', category: 'other', checked: false, oneTime: true },
  ],
};
test('Copies have independent item IDs, progress, quantities, notes and images', () => {
  const copy = privateCopy(saved, 'shop', member, uid);
  assert(copy.items.every((i) => !i.checked && !i.oneTime));
  assert(copy.items.every((i) => !saved.items.some((s) => s.id === i.id)));
  assert.equal(copy.items[0].quantity, 2);
  assert.equal(copy.items[0].note, 'Madura');
  assert.equal(copy.items[0].image, 'photo');
  const edited = reduceLists(
    [copy, saved],
    { id: 'op', type: 'item.check', listId: 'shop', data: { id: copy.items[1].id, checked: true } },
    'me',
  );
  assert.equal(edited.find((l) => l.id === 'saved').items[1].checked, false);
});
test('Upgrade preserves live IDs and original cloud-ready progress; saves only regular content privately', () => {
  const result = migratePurchases([saved], ['saved'], member, uid);
  assert(isPurchase(result.sources, 'saved'));
  assert.equal(result.sources.saved, result.saved[0].id);
  assert.equal(result.saved[0].items.length, 1);
  assert.equal(result.saved[0].items[0].checked, false);
  assert.equal(saved.items[0].checked, true);
});
test('Upgrade does not duplicate inactive saved lists', () => {
  const result = migratePurchases([saved], [], member, uid);
  assert.deepEqual(result, { sources: {}, saved: [] });
});
