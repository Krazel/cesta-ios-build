import test from 'node:test';
import assert from 'node:assert/strict';
import { CloudSync, CloudError } from '../src/syncEngine.ts';
import { reduceLists } from '../src/domain.ts';

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
    recoveryName: (name) => `${name} (recuperada)`,
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

test('A permanent rejection preserves offline work privately and releases the shared queue', async () => {
  for (const status of [400, 413]) {
    const { sync, state } = fixture(false);
    const photo = 'data:image/jpeg;base64,/9j/';
    const operation = {
      id: 'offline-add',
      listId: 'shared',
      type: 'item.add',
      data: {
        id: 'bread',
        name: 'Pan',
        emoji: '🥖',
        category: 'bakery',
        unit: 'ud',
        quantity: 2,
        note: 'Integral',
        image: photo,
        oneTime: true,
      },
    };
    state.pending.push(operation);
    let reject = true;
    sync.request = async (_id, action, body) => {
      if (action === 'snapshot')
        return {
          type: 'snapshot',
          version: 1,
          list: state.snapshot.lists.find((l) => l.id === 'shared'),
          acknowledgedIds: [],
        };
      if (reject) throw new CloudError('Too large or invalid', status);
      return {
        events: body.operations.map((op) => ({
          type: 'change',
          version: 2,
          op,
          actor: 'owner',
          name: 'Ana',
        })),
        acknowledgedIds: body.operations.map((op) => op.id),
      };
    };
    await assert.rejects(
      () => sync.settle('shared'),
      (error) => error.status === status,
    );
    assert.equal(state.pending.length, 0);
    assert.equal(state.cloud.recovery, undefined, 'Recovery must stay private');
    assert.equal(state.cloud.shared.published, true);
    const recovered = state.snapshot.lists.find((l) => l.id === 'recovery');
    assert.equal(recovered.name, 'Compra (recuperada)');
    assert.equal(recovered.items[0].image, photo);
    assert.equal(recovered.items[0].quantity, 2);
    assert.equal(recovered.items[0].oneTime, true);
    assert.equal(recovered.ownerId, 'owner');
    assert.equal(state.snapshot.lists.find((l) => l.id === 'shared').items.length, 0);
    reject = false;
    state.pending.push({
      ...operation,
      id: 'next-add',
      data: { ...operation.data, id: 'milk', name: 'Leche' },
    });
    await sync.settle('shared');
    assert.equal(state.pending.length, 0);
    assert.equal(state.snapshot.lists.find((l) => l.id === 'shared').items[0].name, 'Leche');
  }
});

test('Transient network failures retain pending increments; reconnect acknowledgement avoids duplicates', async () => {
  const { sync, state } = fixture(false);
  const list = state.snapshot.lists.find((l) => l.id === 'shared');
  list.items = [{ id: 'milk', name: 'Leche', quantity: 1 }];
  const op = {
    id: 'increment',
    listId: 'shared',
    type: 'item.increment',
    data: { id: 'milk', delta: 1 },
  };
  state.pending.push(op);
  sync.request = async (_id, action) => {
    if (action === 'snapshot') return { type: 'snapshot', version: 1, list, acknowledgedIds: [] };
    throw new CloudError('Server unavailable', 503);
  };
  await assert.rejects(
    () => sync.settle('shared'),
    (error) => error.status === 503,
  );
  assert.equal(state.pending.length, 1);
  assert.equal(state.snapshot.lists.length, 2, 'No recovery copy for transient errors');
  sync.receive('shared', {
    type: 'snapshot',
    version: 2,
    list: reduceLists([list], op, 'owner', 'Ana')[0],
    acknowledgedIds: [op.id],
  });
  assert.equal(state.pending.length, 0);
  assert.equal(state.snapshot.lists.find((l) => l.id === 'shared').items[0].quantity, 2);
});

test('Background rejection does not strand an edit queued while the recovery copy is saved', async () => {
  const { sync, state } = fixture(false);
  const op = {
    id: 'bad-add',
    listId: 'shared',
    type: 'item.add',
    data: {
      id: 'bread',
      name: 'Pan',
      emoji: '🥖',
      category: 'bakery',
      quantity: 2,
      unit: 'ud',
      note: '',
    },
  };
  const later = { ...op, id: 'later-add', data: { ...op.data, id: 'milk', name: 'Leche' } };
  state.pending.push(op);
  let queued = false,
    calls = 0;
  sync.host.save = async () => {
    if (!queued && state.snapshot.lists.some((l) => l.id === 'recovery')) {
      state.pending.push(later);
      queued = true;
    }
  };
  sync.request = async (_id, _action, body) => {
    if (++calls === 1) throw new CloudError('Too large', 413);
    return {
      events: body.operations.map((op) => ({
        type: 'change',
        version: 2,
        op,
        actor: 'owner',
        name: 'Ana',
      })),
      acknowledgedIds: body.operations.map((op) => op.id),
    };
  };
  sync.active = true;
  sync.sockets.set('shared', { socket: { close() {} }, ready: true, flushing: false, attempt: 0 });
  try {
    await sync.flush('shared');
    assert.equal(calls, 2);
    assert.equal(state.pending.length, 0);
    assert.equal(state.snapshot.lists.find((l) => l.id === 'recovery').items[0].name, 'Pan');
    assert.equal(state.snapshot.lists.find((l) => l.id === 'shared').items[0].name, 'Leche');
  } finally {
    sync.stop();
  }
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
