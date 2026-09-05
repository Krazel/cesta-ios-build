import { DurableObject } from 'cloudflare:workers';
import { reduceLists } from '../src/domain.ts';
import { fail, text, id, product, metadata, validateOperation } from './validation.mjs';
const json = (data, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    },
  });
const hash = async (s) =>
  Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))),
    (b) => b.toString(16).padStart(2, '0'),
  ).join('');
const credential = async (token) => {
  if (!/^[a-f0-9]{64}$/.test(token || '')) fail(401, 'No se reconoce este dispositivo.');
  return (await hash(token)).slice(0, 32);
};
const random = () =>
  btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(18))))
    .replaceAll('+', '-')
    .replaceAll('/', '_');
const MAX_BYTES = 2_000_000;
const MAX_LIST_BYTES = 750_000;
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    try {
      const origin = request.headers.get('Origin');
      if (
        origin &&
        origin !== url.origin &&
        !(env.ALLOWED_ORIGINS || '').split(',').includes(origin)
      )
        fail(403, 'Origen no permitido.');
      if (url.pathname === '/api/health')
        return json({ ok: true, app: 'Cesta', protocol: 2, mode: 'local-first-events' });
      const match = url.pathname.match(
        /^\/api\/v2\/lists\/([a-f0-9]{32})\/(publish|snapshot|ops|events|invite|join|members\/[a-f0-9]{32})$/,
      );
      if (!match) fail(404, 'No encontrado.');
      if (
        env.REQUEST_LIMITER &&
        !(
          await env.REQUEST_LIMITER.limit({
            key: request.headers.get('CF-Connecting-IP') || 'local',
          })
        ).success
      )
        fail(429, 'Demasiados intentos. Prueba de nuevo en un minuto.');
      const response = await env.LISTS.get(env.LISTS.idFromName(match[1])).fetch(request);
      if (origin && response.status !== 101) {
        const copy = new Response(response.body, response);
        copy.headers.set('Access-Control-Allow-Origin', origin);
        copy.headers.set('Vary', 'Origin');
        return copy;
      }
      return response;
    } catch (e) {
      return json(
        { message: e.status ? e.message : 'No se ha podido completar. Inténtalo de nuevo.' },
        e.status || 500,
      );
    }
  },
};
export class SharedList extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(
      'CREATE TABLE IF NOT EXISTS state (key INTEGER PRIMARY KEY, data TEXT, version INTEGER NOT NULL, deleted INTEGER NOT NULL DEFAULT 0); CREATE TABLE IF NOT EXISTS members (id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL, seq INTEGER NOT NULL DEFAULT 0); CREATE TABLE IF NOT EXISTS invites (hash TEXT PRIMARY KEY, expires INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS operations (actor TEXT NOT NULL, id TEXT NOT NULL, PRIMARY KEY(actor,id));',
    );
  }
  row() {
    return this.sql.exec('SELECT * FROM state WHERE key=1').toArray()[0];
  }
  member(actor) {
    const member = this.sql.exec('SELECT * FROM members WHERE id=?', actor).toArray()[0];
    if (!member) fail(403, 'Ya no tienes acceso a esta lista.');
    return member;
  }
  live() {
    const row = this.row();
    if (!row || row.deleted) fail(404, 'La lista ya no está disponible.');
    return row;
  }
  snapshot(actor, pendingIds = []) {
    const row = this.live(),
      member = this.member(actor),
      acknowledgedIds = [];
    if (!Array.isArray(pendingIds) || pendingIds.length > 10000) fail(400, 'Operación no válida.');
    pendingIds.forEach(id);
    for (let offset = 0; offset < pendingIds.length; offset += 500) {
      const ids = pendingIds.slice(offset, offset + 500);
      acknowledgedIds.push(
        ...this.sql
          .exec(
            'SELECT id FROM operations WHERE actor=? AND id IN (' +
              ids.map(() => '?').join(',') +
              ')',
            actor,
            ...ids,
          )
          .toArray()
          .map((row) => row.id),
      );
    }
    return {
      type: 'snapshot',
      version: row.version,
      list: {
        ...JSON.parse(row.data),
        members: this.sql.exec('SELECT id,name,role FROM members ORDER BY role DESC,id').toArray(),
      },
      ackThrough: member.seq,
      acknowledgedIds,
    };
  }
  send(ws, message) {
    try {
      ws.send(JSON.stringify(message));
    } catch {
      try {
        ws.close(1011, 'Connection ended');
      } catch {}
    }
  }
  broadcast(message) {
    for (const ws of this.ctx.getWebSockets()) {
      const attachment = ws.deserializeAttachment();
      if (attachment?.actor) {
        try {
          this.member(attachment.actor);
          this.send(
            ws,
            message || {
              type: 'members',
              members: this.sql
                .exec('SELECT id,name,role FROM members ORDER BY role DESC,id')
                .toArray(),
            },
          );
        } catch {
          this.send(ws, { type: 'removed' });
          ws.close(4003, 'Access removed');
        }
      }
    }
  }
  async fetch(request) {
    try {
      const url = new URL(request.url);
      const listId = url.pathname.split('/')[4];
      const action = url.pathname.split('/').slice(5).join('/');
      if (request.method === 'OPTIONS')
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Headers': 'Authorization,Content-Type',
            'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
          },
        });
      if (action === 'events' && request.headers.get('Upgrade')?.toLowerCase() === 'websocket') {
        const protocols = (request.headers.get('Sec-WebSocket-Protocol') || '')
          .split(',')
          .map((p) => p.trim());
        const actor = await credential(protocols[1]);
        this.member(actor);
        this.live();
        if (this.ctx.getWebSockets().length >= 128)
          fail(429, 'Demasiadas conexiones para esta lista.');
        const pair = new WebSocketPair();
        this.ctx.acceptWebSocket(pair[1]);
        pair[1].serializeAttachment({ actor, ready: false });
        return new Response(null, {
          status: 101,
          webSocket: pair[0],
          headers: { 'Sec-WebSocket-Protocol': 'cesta' },
        });
      }
      const actor = await credential(request.headers.get('Authorization')?.replace(/^Bearer /, ''));
      let body = {};
      if (request.method === 'POST') {
        if (!request.headers.get('Content-Type')?.startsWith('application/json'))
          fail(415, 'Se requiere JSON.');
        if (Number(request.headers.get('Content-Length')) > MAX_BYTES)
          fail(
            413,
            'Esta lista tiene demasiadas fotos para sincronizar. Reduce las fotos o conserva la lista local.',
          );
        const raw = await request.text();
        if (new TextEncoder().encode(raw).length > MAX_BYTES)
          fail(
            413,
            'Esta lista tiene demasiadas fotos para sincronizar. Reduce las fotos o conserva la lista local.',
          );
        try {
          body = JSON.parse(raw);
        } catch {
          fail(400, 'JSON no válido.');
        }
        if (!body || typeof body !== 'object' || Array.isArray(body))
          fail(400, 'Datos no válidos.');
      }
      if (action === 'publish' && request.method === 'POST') {
        if (this.row()) {
          this.member(actor);
          return json(this.snapshot(actor));
        }
        const list = body.list;
        metadata(list || {});
        if (
          list.id !== listId ||
          !Array.isArray(list.items) ||
          list.items.length > 1000 ||
          new Set(list.items.map((i) => i.id)).size !== list.items.length
        )
          fail(400, 'La lista no es válida.');
        list.items.forEach((i) => {
          product(i);
          if (typeof i.checked !== 'boolean') fail(400, 'Marcado no válido.');
        });
        const name = text(body.name, 30);
        const safe = {
          id: listId,
          name: list.name,
          emoji: list.emoji,
          color: list.color,
          ownerId: actor,
          createdAt: new Date().toISOString(),
          members: [],
          items: list.items.map((i) => ({ ...i, addedBy: name })),
        };
        if (new TextEncoder().encode(JSON.stringify(safe)).length > MAX_LIST_BYTES)
          fail(
            413,
            'Esta lista tiene demasiadas fotos para sincronizar. Reduce las fotos o conserva la lista local.',
          );
        this.ctx.storage.transactionSync(() => {
          this.sql.exec('INSERT INTO state VALUES (1,?,0,0)', JSON.stringify(safe));
          this.sql.exec('INSERT INTO members VALUES (?,?,?,0)', actor, name, 'owner');
        });
        return json(this.snapshot(actor));
      }
      this.live();
      if (action === 'join' && request.method === 'POST') {
        const code = text(body.code, 24);
        const invite = this.sql
          .exec('SELECT * FROM invites WHERE hash=? AND expires>?', await hash(code), Date.now())
          .toArray()[0];
        if (!invite) fail(404, 'La invitación ha caducado o no es válida. Pide un enlace nuevo.');
        if (
          this.sql.exec('SELECT count(*) n FROM members').one().n >= 32 &&
          !this.sql.exec('SELECT id FROM members WHERE id=?', actor).toArray().length
        )
          fail(400, 'Esta lista admite hasta 32 participantes.');
        this.sql.exec(
          'INSERT OR IGNORE INTO members VALUES (?,?,?,0)',
          actor,
          text(body.name, 30),
          'editor',
        );
        this.broadcast();
        return json(this.snapshot(actor));
      }
      const member = this.member(actor);
      if (action === 'snapshot' && ['GET', 'POST'].includes(request.method))
        return json(this.snapshot(actor, body.pendingIds || []));
      if (action === 'ops' && request.method === 'POST') {
        if (
          !Array.isArray(body.operations) ||
          !body.operations.length ||
          body.operations.length > 50
        )
          fail(400, 'Operación no válida.');
        const events = [];
        this.ctx.storage.transactionSync(() => {
          let row = this.live(),
            list = JSON.parse(row.data),
            seq = member.seq,
            version = row.version;
          for (const op of body.operations) {
            validateOperation(op, listId);
            if (
              this.sql
                .exec('SELECT 1 FROM operations WHERE actor=? AND id=?', actor, op.id)
                .toArray().length
            )
              continue;
            if (op.type === 'list.delete' && member.role !== 'owner')
              fail(403, 'Solo quien creó la lista puede hacer esto.');
            if (op.type === 'list.leave' && member.role === 'owner')
              fail(400, 'No puedes quitarte de tu propia lista.');
            if (
              op.type === 'item.add' &&
              list.items.length >= 1000 &&
              !list.items.some((i) => i.id === op.data.id)
            )
              fail(400, 'La lista tiene el máximo de 1000 productos.');
            if (op.type === 'member.rename')
              this.sql.exec('UPDATE members SET name=? WHERE id=?', op.data.name, actor);
            if (op.type === 'list.leave') {
              this.sql.exec('DELETE FROM members WHERE id=?', actor);
              this.sql.exec('DELETE FROM invites');
              seq = op.seq;
              break;
            }
            list = reduceLists([list], op, actor, member.name)[0];
            version++;
            seq = Math.max(seq, op.seq);
            this.sql.exec('INSERT INTO operations VALUES (?,?)', actor, op.id);
            events.push({
              type: list ? 'change' : 'deleted',
              version,
              op,
              actor,
              name: member.name,
            });
            if (!list) break;
          }
          const serialized = JSON.stringify(list || {});
          if (new TextEncoder().encode(serialized).length > MAX_LIST_BYTES)
            fail(
              413,
              'Esta lista tiene demasiadas fotos para sincronizar. Reduce las fotos o conserva la lista local.',
            );
          this.sql.exec(
            'UPDATE state SET data=?,version=?,deleted=? WHERE key=1',
            serialized,
            version,
            list ? 0 : 1,
          );
          this.sql.exec('UPDATE members SET seq=? WHERE id=?', seq, actor);
          if (!list) this.sql.exec('DELETE FROM invites');
        });
        for (const event of events) this.broadcast(event);
        if (events.some((event) => event.type === 'deleted')) {
          this.sql.exec('DELETE FROM members');
          this.sql.exec('DELETE FROM operations');
        }
        if (body.operations.some((op) => op.type === 'list.leave')) this.broadcast();
        return json({ events, acknowledgedIds: body.operations.map((op) => op.id) });
      }
      if (action === 'invite') {
        if (member.role !== 'owner') fail(403, 'Solo quien creó la lista puede hacer esto.');
        if (request.method === 'DELETE') {
          this.sql.exec('DELETE FROM invites');
          return json({ ok: true });
        }
        if (request.method === 'POST') {
          const secret = random(),
            expires = Date.now() + 7 * 86400_000;
          this.sql.exec('DELETE FROM invites');
          this.sql.exec('INSERT INTO invites VALUES (?,?)', await hash(secret), expires);
          const code = listId + '.' + secret;
          return json({ code, expires, url: url.origin + '/#join=' + code });
        }
      }
      if (action.startsWith('members/') && request.method === 'DELETE') {
        if (member.role !== 'owner') fail(403, 'Solo quien creó la lista puede hacer esto.');
        const target = id(action.slice(8));
        if (target === actor) fail(400, 'No puedes quitarte de tu propia lista.');
        this.ctx.storage.transactionSync(() => {
          this.sql.exec('DELETE FROM members WHERE id=?', target);
          this.sql.exec('DELETE FROM invites');
        });
        this.broadcast();
        return json(this.snapshot(actor));
      }
      fail(404, 'No encontrado.');
    } catch (e) {
      return json(
        { message: e.status ? e.message : 'No se ha podido completar. Inténtalo de nuevo.' },
        e.status || 500,
      );
    }
  }
  async webSocketMessage(ws, raw) {
    try {
      const attachment = ws.deserializeAttachment();
      if (!attachment?.actor || attachment.ready || typeof raw !== 'string' || raw.length > 500000)
        fail(400, 'Operación no válida.');
      const hello = JSON.parse(raw);
      this.member(attachment.actor);
      this.live();
      this.send(ws, this.snapshot(attachment.actor, hello.pendingIds || []));
      ws.serializeAttachment({ ...attachment, ready: true });
    } catch {
      this.send(ws, { type: 'denied' });
      ws.close(4003, 'Access denied');
    }
  }
  webSocketClose(ws, code, reason) {
    try {
      ws.close(code, reason);
    } catch {}
  }
  webSocketError(ws) {
    try {
      ws.close(1011, 'Connection error');
    } catch {}
  }
}
