import test from 'node:test';
import assert from 'node:assert/strict';
import { CloudSync, CloudError } from '../src/syncEngine.ts';

function fixture(closing = true) {
  const state = {
    snapshot: {
      device: { id: 'owner', name: 'Ana' },
      lists: [
        { id: 'shared', items: [], members: [], name: 'Compra' },
        {
          id: 'private-copy',
          items: [{ id: 'extra', oneTime: true }],
          members: [],
          name: 'Compra',
        },
      ],
    },
    cloud: { shared: { version: 1, published: true } },
    pending: closing ? [{ id: 'delete-op', listId: 'shared', type: 'list.delete', data: {} }] : [],
    sequence: 1,
  };
  const sync = new CloudSync({
    get: () => state,
    save: async () => {},
    change: () => {},
    error: () => {},
    status: () => {},
    token: () => '',
    api: () => '',
    uid: () => 'recovery',
  });
  return { sync, state };
}
test('Removal acknowledgement arriving before snapshot keeps local-copy completion successful', async () => {
  const { sync, state } = fixture();
  sync.request = async () => {
    sync.receive('shared', { type: 'deleted' });
    throw new CloudError('No longer available', 404);
  };
  await sync.settle('shared');
  assert.equal(state.cloud.shared, undefined);
  assert.equal(state.pending.length, 0);
  assert.deepEqual(
    state.snapshot.lists.map((l) => l.id),
    ['private-copy'],
  );
  assert.equal(state.snapshot.lists[0].items[0].oneTime, true);
});
test('Closing handles confirmed missing membership; real failures are not hidden', async () => {
  for (const status of [403, 404]) {
    const { sync, state } = fixture();
    sync.request = async () => {
      throw new CloudError('Gone', status);
    };
    await sync.settle('shared');
    assert.equal(state.cloud.shared, undefined);
  }
  for (const [closing, status] of [
    [true, 500],
    [false, 404],
  ]) {
    const { sync } = fixture(closing);
    sync.request = async () => {
      throw new CloudError('Failure', status);
    };
    await assert.rejects(
      () => sync.settle('shared'),
      (e) => e.status === status,
    );
  }
});
