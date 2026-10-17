import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const endpoint = 'repos/Krazel/krazel.github.io/contents/cesta/privacy/index.html';
function gh(args, input) {
  const r = spawnSync('gh', args, {
    encoding: 'utf8',
    input: input ? JSON.stringify(input) : undefined,
  });
  if (r.status !== 0) throw Error(r.stderr);
  return JSON.parse(r.stdout);
}
const before = gh(['api', endpoint]);
assert(
  Buffer.from(before.content, 'base64').equals(
    fs.readFileSync('artifacts/monetization-20261018/privacy-before.html'),
  ),
  'Concurrent privacy change; merge first',
);
const content = fs.readFileSync('store/privacy-1.5.html');
const result = gh(['api', endpoint, '--method', 'PUT', '--input', '-'], {
  message: 'Explain Cesta1.5 AdMob and optional monthly subscriptions',
  sha: before.sha,
  content: content.toString('base64'),
  branch: 'main',
});
const after = gh(['api', endpoint]);
assert(Buffer.from(after.content, 'base64').equals(content));
const receipt = {
  verifiedAt: new Date().toISOString(),
  repository: 'Krazel/krazel.github.io',
  path: after.path,
  commit: result.commit.sha,
  blob: after.sha,
  sha256: crypto.createHash('sha256').update(content).digest('hex'),
  onlyCestaPolicy: true,
};
fs.writeFileSync(
  'artifacts/monetization-20261018/privacy-published.json',
  JSON.stringify(receipt, null, 2),
);
console.log(JSON.stringify(receipt));
