import fs from 'node:fs';
import assert from 'node:assert/strict';
import { asc } from './asc-client.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const keys = fileURLToPath(new URL('../../APIs/IOS/', import.meta.url));
process.env.ASC_KEY_ID ||= fs.readFileSync(path.join(keys, 'Key ID.txt'), 'utf8').trim();
process.env.ASC_ISSUER_ID ||= fs.readFileSync(path.join(keys, 'Issuer ID.txt'), 'utf8').trim();
process.env.ASC_PRIVATE_KEY_PATH ||= path.join(keys, 'Coder Metadata App Manager.p8');
async function main() {
  const cfg = JSON.parse(fs.readFileSync('store/testflight.json', 'utf8'));
  const groupId = '0bedf097-fcf7-40bc-a367-949b900c4883';
  const response = await asc(
    'GET',
    `/v1/builds?filter[app]=${cfg.appId}&filter[version]=${cfg.buildNumber}&include=preReleaseVersion&limit=20`,
  );
  const build = response.data.find((b) =>
    response.included?.some(
      (v) =>
        v.type === 'preReleaseVersions' &&
        v.id === b.relationships.preReleaseVersion.data.id &&
        v.attributes.version === cfg.marketingVersion,
    ),
  );
  if (!build || build.attributes.processingState !== 'VALID') {
    console.log(
      JSON.stringify({
        ready: false,
        buildId: build?.id,
        processing: build?.attributes.processingState ?? 'NOT_VISIBLE',
      }),
    );
    process.exitCode = 2;
    return;
  }
  assert.equal(build.attributes.expired, false);
  const notes = JSON.parse(fs.readFileSync(cfg.betaNotesFile, 'utf8'));
  const locs = (await asc('GET', `/v1/builds/${build.id}/betaBuildLocalizations`)).data;
  for (const [locale, whatsNew] of Object.entries(notes)) {
    const existing = locs.find((l) => l.attributes.locale === locale);
    if (existing)
      await asc('PATCH', `/v1/betaBuildLocalizations/${existing.id}`, {
        data: { type: 'betaBuildLocalizations', id: existing.id, attributes: { whatsNew } },
      });
    else
      await asc('POST', '/v1/betaBuildLocalizations', {
        data: {
          type: 'betaBuildLocalizations',
          attributes: { locale, whatsNew },
          relationships: { build: { data: { type: 'builds', id: build.id } } },
        },
      });
  }
  const assigned = await asc('GET', `/v1/betaGroups/${groupId}/relationships/builds`);
  if (!assigned.data.some((b) => b.id === build.id))
    await asc('POST', `/v1/betaGroups/${groupId}/relationships/builds`, {
      data: [{ type: 'builds', id: build.id }],
    });
  const membership = await asc('GET', `/v1/betaGroups/${groupId}/relationships/builds`);
  assert(membership.data.some((b) => b.id === build.id));
  const detail = await asc('GET', `/v1/builds/${build.id}/buildBetaDetail`);
  const localized = await asc('GET', `/v1/builds/${build.id}/betaBuildLocalizations`);
  for (const [locale, whatsNew] of Object.entries(notes))
    assert.equal(
      localized.data.find((l) => l.attributes.locale === locale)?.attributes.whatsNew,
      whatsNew,
    );
  const evidence = {
    checkedAt: new Date().toISOString(),
    version: cfg.marketingVersion,
    buildNumber: cfg.buildNumber,
    build,
    groupId,
    membership: membership.data,
    betaDetail: detail.data,
    localizations: localized.data,
  };
  const output = process.env.CESTA_RELEASE_DIR || 'artifacts/testflight-20261016';
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(
    path.join(output, 'apple-complete.json'),
    JSON.stringify(evidence, null, 2) + '\n',
  );
  fs.writeFileSync(
    'artifacts/TESTFLIGHT-VERIFICACION.json',
    JSON.stringify(evidence, null, 2) + '\n',
  );
  console.log(
    JSON.stringify({
      ready: true,
      buildId: build.id,
      processing: build.attributes.processingState,
      groupAssigned: true,
      betaDetail: detail.data.attributes,
    }),
  );
}
await main();
