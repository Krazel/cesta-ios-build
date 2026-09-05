import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, createHash } from 'node:crypto';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
const uid = () => randomBytes(16).toString('hex');
const account = () => {
  const token = randomBytes(32).toString('hex');
  return { token, id: createHash('sha256').update(token).digest('hex').slice(0, 32) };
};
const item = (name = 'Yogur') => ({
  id: uid(),
  name,
  emoji: '🥛',
  category: 'dairy',
  quantity: 1,
  unit: 'ud',
  note: '',
  checked: false,
});
test('Cloud list: invitation, deltas, retries, concurrent edits, revocation and deletion', async () => {
  const mf = new Miniflare(
    convertV4MiniflareOptions({
      workers: [
        {
          name: 'cesta',
          modules: true,
          scriptPath: 'artifacts/cloud-bundle/worker.js',
          compatibilityDate: '2026-09-05',
          durableObjects: { LISTS: { className: 'SharedList', useSQLite: true } },
        },
      ],
    }),
  );
  const owner = account(),
    other = account(),
    stranger = account(),
    listId = uid(),
    product = item();
  const call = async (user, action, body, method = body === undefined ? 'GET' : 'POST') => {
    const r = await mf.dispatchFetch(`http://cesta.test/api/v2/lists/${listId}/${action}`, {
      method,
      headers: { Authorization: 'Bearer ' + user.token, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: r.status, data: await r.json() };
  };
  try {
    let result = await call(owner, 'publish', {
      name: 'Ana',
      list: { id: listId, name: 'Compra', emoji: '🛒', color: 'sage', items: [product] },
    });
    assert.equal(result.status, 200);
    assert.equal(result.data.list.ownerId, owner.id);
    assert.equal((await call(stranger, 'snapshot')).status, 403);
    const code = (await call(owner, 'invite', {})).data.code.split('.')[1];
    assert.equal((await call(other, 'join', { code: 'x'.repeat(24), name: 'Luis' })).status, 404);
    assert.equal((await call(other, 'join', { code, name: 'Luis' })).status, 200);
    const r = await mf.dispatchFetch(`http://cesta.test/api/v2/lists/${listId}/events`, {
      headers: { Upgrade: 'websocket', 'Sec-WebSocket-Protocol': 'cesta, ' + other.token },
    });
    assert.equal(r.status, 101);
    const ws = r.webSocket;
    const messages = [];
    ws.addEventListener('message', (e) => messages.push(JSON.parse(e.data)));
    ws.accept();
    ws.send(JSON.stringify({ pendingIds: [] }));
    await new Promise((r) => setTimeout(r, 40));
    assert.equal(messages[0].type, 'snapshot');
    const add = { id: uid(), seq: 1, type: 'item.add', listId, data: item('Fruta') };
    const inc = {
      id: uid(),
      seq: 2,
      type: 'item.increment',
      listId,
      data: { id: product.id, delta: 1 },
    };
    assert.equal((await call(owner, 'ops', { operations: [add, inc] })).status, 200);
    assert.equal((await call(owner, 'ops', { operations: [add, inc] })).status, 200);
    const opA = { id: uid(), seq: 3, type: 'item.add', listId, data: item('Arroz') },
      opB = {
        id: uid(),
        seq: 1,
        type: 'item.check',
        listId,
        data: { id: product.id, checked: true },
      };
    await Promise.all([
      call(owner, 'ops', { operations: [opA] }),
      call(other, 'ops', { operations: [opB] }),
    ]);
    result = await call(owner, 'snapshot');
    assert.equal(result.data.list.items.length, 3);
    assert.equal(result.data.list.items[0].quantity, 2);
    assert.equal(result.data.list.items[0].checked, true);
    assert.equal(result.data.ackThrough, 3);
    await new Promise((r) => setTimeout(r, 40));
    assert.equal(messages.filter((m) => m.type === 'change').length, 4);
    const count = messages.length;
    await new Promise((r) => setTimeout(r, 100));
    assert.equal(messages.length, count, 'No polling or idle messages');
    assert.equal(
      (
        await call(other, 'ops', {
          operations: [{ id: uid(), seq: 2, listId, type: 'list.delete', data: {} }],
        })
      ).status,
      403,
    );
    const before = (await call(owner, 'snapshot')).data.version;
    assert.equal(
      (
        await call(owner, 'ops', {
          operations: [
            { id: uid(), seq: 4, listId, type: 'item.add', data: item('Pan') },
            { id: uid(), seq: 5, listId, type: 'unknown', data: {} },
          ],
        })
      ).status,
      400,
    );
    assert.equal(
      (await call(owner, 'snapshot')).data.version,
      before,
      'Invalid batch rolls back all writes',
    );
    const extra = { ...item('Solo hoy'), oneTime: true };
    const promoted = { ...item('Ahora habitual'), oneTime: true };
    const later = { ...item('Añadido después'), oneTime: true };
    const send = async (type, data) => {
      const result = await call(owner, 'ops', {
        operations: [{ id: uid(), seq: 10, listId, type, data }],
      });
      assert.equal(result.status, 200);
    };
    await send('item.add', extra);
    await send('item.add', promoted);
    await send('item.edit', { ...promoted, oneTime: false });
    await send('item.add', later);
    await send('items.reset', { ids: [product.id], removeIds: [extra.id, promoted.id] });
    const round = (await call(other, 'snapshot')).data.list.items;
    assert(!round.some((i) => i.id === extra.id), 'One-time extra does not enter the next shop');
    assert(
      round.some((i) => i.id === promoted.id && !i.oneTime),
      'Concurrent promotion to regular survives a delayed reset',
    );
    assert(
      round.some((i) => i.id === later.id),
      'Unseen later additions survive',
    );
    assert.equal(round.find((i) => i.id === product.id).checked, false);
    await new Promise((r) => setTimeout(r, 40));
    assert(messages.some((m) => m.type === 'change' && m.op.type === 'items.reset'));
    assert.equal((await call(owner, 'members/' + other.id, undefined, 'DELETE')).status, 200);
    await new Promise((r) => setTimeout(r, 40));
    assert(messages.some((m) => m.type === 'removed'));
    assert.equal((await call(other, 'snapshot')).status, 403);
    assert.equal(
      (await call(other, 'join', { code, name: 'Luis' })).status,
      404,
      'Removed participant cannot reuse old invitation',
    );
    assert.equal(
      (
        await call(owner, 'ops', {
          operations: [{ id: uid(), seq: 6, listId, type: 'list.delete', data: {} }],
        })
      ).status,
      200,
    );
    assert.equal((await call(owner, 'snapshot')).status, 404);
    assert.equal(
      (
        await call(owner, 'publish', {
          name: 'Ana',
          list: { id: listId, name: 'Compra', emoji: '🛒', color: 'sage', items: [] },
        })
      ).status,
      403,
      'Deleted cloud list cannot reappear',
    );
  } finally {
    await mf.dispose();
  }
});
