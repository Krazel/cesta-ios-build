import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { asc } from './asc-client.mjs';

// Read-only Apple audit. Reuse authorized local access; do not copy signing keys.
const keys = fileURLToPath(new URL('../../APIs/IOS/', import.meta.url));
process.env.ASC_KEY_ID ||= fs.readFileSync(path.join(keys, 'Key ID.txt'), 'utf8').trim();
process.env.ASC_ISSUER_ID ||= fs.readFileSync(path.join(keys, 'Issuer ID.txt'), 'utf8').trim();
process.env.ASC_PRIVATE_KEY_PATH ||= path.join(keys, 'Coder Metadata App Manager.p8');
const appId = '6808982515';
const groupId = '0bedf097-fcf7-40bc-a367-949b900c4883';
const collection = async (endpoint) => {
  const data = [],
    included = [];
  for (let pages = 0; endpoint; pages++) {
    assert(pages < 20, 'Unexpected pagination');
    const result = await asc('GET', endpoint);
    data.push(...result.data);
    included.push(...(result.included || []));
    endpoint = result.links?.next;
    if (endpoint) {
      const url = new URL(endpoint, 'https://api.appstoreconnect.apple.com');
      assert.equal(url.origin, 'https://api.appstoreconnect.apple.com');
      endpoint = url.pathname + url.search;
    }
  }
  return { data, included };
};
const app = (await asc('GET', `/v1/apps/${appId}`)).data;
assert.equal(app.attributes.bundleId, 'com.dmkr.cesta.B2X6D3A9J9');
const builds = await collection(
  `/v1/builds?filter[app]=${appId}&include=preReleaseVersion&limit=200`,
);
const versions = await collection(`/v1/apps/${appId}/appStoreVersions`);
const group = (await asc('GET', `/v1/betaGroups/${groupId}`)).data;
assert.equal(group.attributes.isInternalGroup, true);
const testers = await collection(`/v1/betaGroups/${groupId}/betaTesters`);
const receipt = {
  checkedAt: new Date().toISOString(),
  appId,
  bundleId: app.attributes.bundleId,
  builds: builds.data.map((b) => ({
    id: b.id,
    build: b.attributes.version,
    version: builds.included.find((v) => v.id === b.relationships.preReleaseVersion.data.id)
      ?.attributes.version,
    processing: b.attributes.processingState,
    expired: b.attributes.expired,
  })),
  storeVersions: versions.data.map((v) => ({
    version: v.attributes.versionString,
    state: v.attributes.appStoreState,
  })),
  groupId,
  internalGroup: true,
  testerStates: testers.data.map((t) => t.attributes.state),
};
const output = process.env.CESTA_RELEASE_DIR || 'artifacts/testflight-20261013';
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'apple-preflight.json'), JSON.stringify(receipt, null, 2));
console.log(JSON.stringify(receipt));
