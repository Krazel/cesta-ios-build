import fs from 'node:fs';
import assert from 'node:assert/strict';

// Authorised library access: hidden stdin, token in memory only.
const input = await new Promise((resolve) => {
  let raw = '';
  if (process.stdin.isTTY) process.stdin.setRawMode(true);
  process.stderr.write('Ready for library input on hidden stdin.\n');
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    raw += chunk;
    if (/[\r\n]/.test(raw)) {
      process.stdin.removeAllListeners('data');
      if (process.stdin.isTTY) process.stdin.setRawMode(false);
      process.stdin.pause();
      resolve(JSON.parse(raw));
    }
  });
});
const base = 'https://krazel-studio.krazel.chatgpt.site';
const api = async (method = 'GET', body) => {
  const r = await fetch(base + '/api/projects', {
    method,
    headers: {
      'OAI-Sites-Authorization': 'Bearer ' + input.token,
      Origin: base,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) throw Error('Library HTTP ' + r.status);
  return r.json();
};
const current = (await api()).projects.find((p) => p.id === 'PR-016');
assert(current && /Cesta/i.test(current.name));
const changes = input.changes || {};
assert(Object.keys(changes).every((k) => ['detail', 'next', 'stage'].includes(k)));
if (Object.keys(changes).length) {
  await api('PUT', { revision: current.revision, project: { ...current, ...changes } });
}
const fresh = (await api()).projects.find((p) => p.id === current.id);
for (const [k, v] of Object.entries(changes)) assert.deepEqual(fresh[k], v);
for (const [k, v] of Object.entries(current))
  if (!(k in changes) && !['revision', 'updatedAt'].includes(k)) assert.deepEqual(fresh[k], v);
const output =
  input.review === 'implementation'
    ? 'artifacts/ui-implementation-20261016'
    : 'artifacts/ui-review-20261016';
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(
  `${output}/library-${Object.keys(changes).length ? 'updated' : 'read'}.json`,
  JSON.stringify({ verifiedAt: new Date().toISOString(), project: fresh }, null, 2),
);
console.log(
  JSON.stringify({
    id: fresh.id,
    revision: fresh.revision,
    detail: fresh.detail,
    next: fresh.next,
    tracking: fresh.tracking,
  }),
);
