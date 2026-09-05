import { reduceLists, type Operation, type ShoppingList, type Snapshot } from './domain.ts';
export type CloudRef = { version: number; published: boolean; seed?: ShoppingList };
export type SyncState = {
  snapshot: Snapshot;
  pending: Operation[];
  cloud: Record<string, CloudRef>;
  sequence: number;
};
type Host = {
  get: () => SyncState;
  token: () => string;
  api: () => string;
  uid: () => string;
  save: () => Promise<unknown>;
  change: () => void;
  error: (message: string) => void;
  status: (online: boolean) => void;
};
type Channel = { socket: WebSocket; ready: boolean; flushing: boolean; attempt: number };
export class CloudError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
// No interval polling. Reads occur on connection/reconnection; edits travel as operations.
export class CloudSync {
  private host: Host;
  private sockets = new Map<string, Channel>();
  private retries = new Map<string, ReturnType<typeof setTimeout>>();
  private attempts = new Map<string, number>();
  private publishing = new Map<string, Promise<void>>();
  private active = false;
  constructor(host: Host) {
    this.host = host;
  }
  async request(
    id: string,
    action: string,
    body?: unknown,
    method = body === undefined ? 'GET' : 'POST',
  ) {
    const controller = new AbortController(),
      timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${this.host.api()}/api/v2/lists/${id}/${action}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.host.token()}`,
          'Content-Type': 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok)
        throw new CloudError(data.message || 'No se ha podido conectar.', response.status);
      return data;
    } finally {
      clearTimeout(timeout);
    }
  }
  async publish(id: string) {
    if (this.publishing.has(id)) return this.publishing.get(id)!;
    const ref = this.host.get().cloud[id];
    if (!ref || ref.published) return;
    const task = (async () => {
      await this.host.save();
      const data = await this.request(id, 'publish', {
        list: ref.seed,
        name: this.host.get().snapshot.device.name,
      });
      if (!this.host.get().cloud[id]) return;
      this.host.get().cloud[id].published = true;
      delete this.host.get().cloud[id].seed;
      this.receive(id, data);
      await this.host.save();
    })()
      .catch(async (error) => {
        if (error instanceof CloudError && [400, 413].includes(error.status)) {
          const state = this.host.get();
          state.snapshot.lists = state.pending
            .filter((op) => op.listId === id)
            .reduce(
              (lists, op) =>
                reduceLists(lists, op, state.snapshot.device.id, state.snapshot.device.name),
              state.snapshot.lists,
            );
          state.pending = state.pending.filter((op) => op.listId !== id);
          delete state.cloud[id];
          this.host.change();
          await this.host.save();
        }
        throw error;
      })
      .finally(() => this.publishing.delete(id));
    this.publishing.set(id, task);
    return task;
  }
  receive(id: string, message: any) {
    const state = this.host.get(),
      ref = state.cloud[id];
    if (!ref) return;
    if (message.type === 'removed' || message.type === 'deleted') {
      // Keep unsent work as a separate private recovery copy when access is revoked.
      if (
        state.pending.some(
          (op) => op.listId === id && !['list.delete', 'list.leave'].includes(op.type),
        )
      ) {
        const base = state.snapshot.lists.find((list) => list.id === id);
        if (base) {
          const copy = state.pending
            .filter((op) => op.listId === id)
            .reduce(
              (lists, op) =>
                reduceLists(lists, op, state.snapshot.device.id, state.snapshot.device.name),
              [base],
            )[0];
          if (copy) {
            const newId = this.host.uid();
            state.snapshot.lists.push({
              ...copy,
              id: newId,
              ownerId: state.snapshot.device.id,
              members: [{ ...state.snapshot.device, role: 'owner' }],
            });
          }
        }
        this.host.error(
          'Se ha cerrado el acceso compartido. Tus cambios pendientes se han conservado en una copia local.',
        );
      }
      state.snapshot.lists = state.snapshot.lists.filter((list) => list.id !== id);
      state.pending = state.pending.filter((op) => op.listId !== id);
      delete state.cloud[id];
      this.disconnect(id);
    } else if (message.type === 'snapshot') {
      if (message.version < ref.version) return;
      state.snapshot.lists = [
        ...state.snapshot.lists.filter((list) => list.id !== id),
        message.list,
      ];
      ref.version = message.version;
      state.pending = state.pending.filter(
        (op) => op.listId !== id || !message.acknowledgedIds?.includes(op.id),
      );
    } else if (message.type === 'members') {
      state.snapshot.lists = state.snapshot.lists.map((list) =>
        list.id === id ? { ...list, members: message.members } : list,
      );
    } else if (message.type === 'change') {
      if (message.version <= ref.version) return;
      if (message.version !== ref.version + 1) {
        this.disconnect(id);
        this.connect(id);
        return;
      }
      state.snapshot.lists = reduceLists(
        state.snapshot.lists,
        message.op,
        message.actor,
        message.name,
      );
      ref.version = message.version;
      if (message.actor === state.snapshot.device.id)
        state.pending = state.pending.filter((op) => op.listId !== id || op.id !== message.op.id);
    } else return;
    this.host.change();
    void this.host.save().catch(() => {});
  }
  start() {
    this.active = true;
    for (const id of Object.keys(this.host.get().cloud)) this.kick(id);
  }
  stop() {
    this.active = false;
    for (const id of [...this.sockets.keys(), ...this.retries.keys()]) this.disconnect(id);
  }
  disconnect(id: string) {
    const timer = this.retries.get(id);
    if (timer) clearTimeout(timer);
    this.retries.delete(id);
    const channel = this.sockets.get(id);
    this.sockets.delete(id);
    if (channel) {
      channel.socket.onclose = null;
      channel.socket.onmessage = null;
      channel.socket.close();
    }
  }
  private retry(id: string) {
    if (!this.active || !this.host.get().cloud[id] || this.retries.has(id)) return;
    const attempt = (this.attempts.get(id) || 0) + 1;
    this.attempts.set(id, attempt);
    // Back off only after a failed connection, never when an idle connection is healthy.
    const delay = Math.min(60000, 1000 * 2 ** Math.min(attempt, 6)) + Math.random() * 500;
    this.retries.set(
      id,
      setTimeout(() => {
        this.retries.delete(id);
        this.connect(id);
      }, delay),
    );
  }
  async connect(id: string) {
    if (!this.active || this.sockets.has(id) || !this.host.get().cloud[id]) return;
    try {
      await this.publish(id);
      if (!this.active || this.sockets.has(id) || !this.host.get().cloud[id]) return;
      const socket = new WebSocket(
        `${this.host.api().replace(/^http/, 'ws')}/api/v2/lists/${id}/events`,
        ['cesta', this.host.token()],
      );
      const channel: Channel = { socket, ready: false, flushing: false, attempt: 0 };
      this.sockets.set(id, channel);
      socket.onopen = () =>
        socket.send(
          JSON.stringify({
            pendingIds: this.host
              .get()
              .pending.filter((op) => op.listId === id)
              .map((op) => op.id),
          }),
        );
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(String(event.data));
          if (message.type === 'denied') {
            this.receive(id, { type: 'removed' });
            return;
          }
          this.receive(id, message);
          if (message.type === 'snapshot') {
            channel.ready = true;
            this.attempts.delete(id);
            this.host.status(true);
            void this.flush(id);
          }
        } catch {
          socket.close();
        }
      };
      socket.onerror = () => {
        this.host.status(false);
        socket.close();
        // An upgrade cannot carry a JSON error to the browser. Resolve revoked/deleted
        // access once on failure, rather than retrying a dead list forever.
        void this.request(id, 'snapshot').catch((error) => {
          if (error instanceof CloudError && [403, 404].includes(error.status))
            this.receive(id, { type: 'removed' });
        });
      };
      socket.onclose = () => {
        if (this.sockets.get(id) === channel) {
          this.sockets.delete(id);
          this.host.status(false);
          this.retry(id);
        }
      };
    } catch (error) {
      this.host.status(false);
      if (error instanceof CloudError && [400, 413].includes(error.status)) {
        this.host.error(error.message);
        return;
      }
      this.retry(id);
    }
  }
  async flush(id: string) {
    const channel = this.sockets.get(id);
    if (!channel?.ready || channel.flushing) return;
    channel.flushing = true;
    try {
      while (this.active && this.host.get().cloud[id]) {
        const batch = this.host
          .get()
          .pending.filter((op) => op.listId === id)
          .slice(0, 25);
        if (!batch.length) break;
        await this.host.save();
        try {
          const response = await this.request(id, 'ops', { operations: batch });
          for (const event of response.events) this.receive(id, event);
          const state = this.host.get();
          state.pending = state.pending.filter(
            (op) => op.listId !== id || !response.acknowledgedIds.includes(op.id),
          );
          if (batch.some((op) => op.type === 'list.leave')) this.receive(id, { type: 'removed' });
          this.host.change();
          await this.host.save();
        } catch (error) {
          if (error instanceof CloudError && [403, 404].includes(error.status)) {
            this.receive(id, { type: 'removed' });
            break;
          }
          if (error instanceof CloudError && [400, 413].includes(error.status)) {
            this.host.error(error.message);
            break;
          }
          throw error;
        }
      }
    } catch {
      this.host.status(false);
      this.disconnect(id);
      this.retry(id);
    } finally {
      channel.flushing = false;
    }
  }
  kick(id: string) {
    if (this.sockets.get(id)?.ready) void this.flush(id);
    else if (this.active) this.connect(id);
  }
  async settle(id: string) {
    const closing = this.host
      .get()
      .pending.some((op) => op.listId === id && ['list.delete', 'list.leave'].includes(op.type));
    try {
      if (!this.host.get().cloud[id]) return;
      await this.publish(id);
      // Explicit actions such as sharing must also work before the listener has connected.
      const snapshot = await this.request(id, 'snapshot', {
        pendingIds: this.host
          .get()
          .pending.filter((op) => op.listId === id)
          .map((op) => op.id),
      });
      this.receive(id, snapshot);
      while (this.host.get().pending.some((op) => op.listId === id)) {
        if (this.sockets.get(id)?.flushing) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          continue;
        }
        const batch = this.host
          .get()
          .pending.filter((op) => op.listId === id)
          .slice(0, 25);
        const response = await this.request(id, 'ops', { operations: batch });
        for (const event of response.events) this.receive(id, event);
        this.host.get().pending = this.host
          .get()
          .pending.filter((op) => op.listId !== id || !response.acknowledgedIds.includes(op.id));
        await this.host.save();
      }
      this.host.change();
      this.connect(id);
    } catch (error) {
      // The event stream may confirm removal before this explicit request finishes.
      // A subsequent 403/404 is then confirmation, not a failed local-copy action.
      if (
        error instanceof CloudError &&
        [403, 404].includes(error.status) &&
        (closing || !this.host.get().cloud[id])
      ) {
        this.receive(id, { type: 'removed' });
        await this.host.save();
        return;
      }
      throw error;
    }
  }
}
