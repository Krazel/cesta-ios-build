import fs from 'node:fs';
import assert from 'node:assert/strict';
import { asc } from './asc-client.mjs';

// Prepare the editable store version. Do not alter the older TestFlight beta,
// select a build, submit a review or change public availability.
const cfg = JSON.parse(fs.readFileSync('store/release-metadata.json', 'utf8'));
const app = (await asc('GET', `/v1/apps/${cfg.appId}`)).data;
assert.equal(app.attributes.bundleId, cfg.bundleId);
const versions = (await asc('GET', `/v1/apps/${cfg.appId}/appStoreVersions`)).data;
const version = versions.find(v => v.attributes.appStoreState === 'PREPARE_FOR_SUBMISSION');
assert(version, 'An editable store draft is required');
const selected = (await asc('GET', `/v1/appStoreVersions/${version.id}/build`)).data;
assert(!selected, 'Do not rewrite the version of a draft with a selected build');
const localizations = (await asc('GET', `/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations`)).data;
for (const [locale, content] of Object.entries(cfg.locales)) {
  assert(localizations.some(l => l.attributes.locale === locale), `Missing localization ${locale}`);
  assert(content.description.length <= 4000 && content.keywords.length <= 100);
}
const support = await fetch(cfg.supportUrl);
const privacy = await fetch(cfg.privacyPolicyUrl);
assert(support.ok && privacy.ok, 'Public support and privacy must be reachable');
await asc('PATCH', `/v1/appStoreVersions/${version.id}`, {
  data: { type: 'appStoreVersions', id: version.id,
    attributes: { versionString: cfg.version, copyright: '2026 Krazel Studio', releaseType: 'MANUAL' } },
});
for (const [locale, content] of Object.entries(cfg.locales)) {
  const loc = localizations.find(l => l.attributes.locale === locale);
  await asc('PATCH', `/v1/appStoreVersionLocalizations/${loc.id}`, {
    data: { type: 'appStoreVersionLocalizations', id: loc.id,
      attributes: { ...content, supportUrl: cfg.supportUrl } },
  });
}
const review = (await asc('GET', `/v1/appStoreVersions/${version.id}/appStoreReviewDetail`)).data;
assert(review, 'Missing app review details resource');
let contact = review.attributes;
if (process.env.ASC_REVIEW_CONTACT_SOURCE_ID) {
  contact = (await asc('GET', `/v1/appStoreReviewDetails/${process.env.ASC_REVIEW_CONTACT_SOURCE_ID}`)).data.attributes;
}
const reviewContactComplete = ['contactFirstName', 'contactLastName', 'contactEmail', 'contactPhone']
  .every(key => !!contact[key]);
// Apple requires the private review contact even when patching only the notes.
// Keep the draft notes locally until a verified contact is available.
if (reviewContactComplete) await asc('PATCH', `/v1/appStoreReviewDetails/${review.id}`, {
  data: { type: 'appStoreReviewDetails', id: review.id,
    attributes: { demoAccountRequired: false, notes: cfg.reviewNotes,
      ...Object.fromEntries(['contactFirstName', 'contactLastName', 'contactEmail', 'contactPhone'].map(key => [key, contact[key]])) } },
});
const freshVersion = (await asc('GET', `/v1/appStoreVersions/${version.id}`)).data;
const freshLocs = (await asc('GET', `/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations`)).data;
const freshReview = (await asc('GET', `/v1/appStoreReviewDetails/${review.id}`)).data;
assert.equal(freshVersion.attributes.versionString, cfg.version);
assert.equal(freshVersion.attributes.appStoreState, 'PREPARE_FOR_SUBMISSION');
assert.equal(freshVersion.attributes.releaseType, 'MANUAL');
for (const [locale, content] of Object.entries(cfg.locales)) {
  const loc = freshLocs.find(l => l.attributes.locale === locale);
  for (const [key, value] of Object.entries({ ...content, supportUrl: cfg.supportUrl }))
    assert.equal(loc.attributes[key], value);
}
if (reviewContactComplete) {
  assert.equal(freshReview.attributes.notes, cfg.reviewNotes);
  assert.equal(freshReview.attributes.demoAccountRequired, false);
  for (const key of ['contactFirstName', 'contactLastName', 'contactEmail', 'contactPhone'])
    assert.equal(freshReview.attributes[key], contact[key]);
}
fs.mkdirSync('artifacts', { recursive: true });
fs.writeFileSync('artifacts/RELEASE-METADATA-VERIFICACION-2026-10-01.json', JSON.stringify({
  checkedAt: new Date().toISOString(), verified: true, appId: cfg.appId,
  version: freshVersion, localizations: freshLocs,
  review: { id: freshReview.id, reviewContactComplete, notesSaved: reviewContactComplete,
    notes: freshReview.attributes.notes, preparedNotes: cfg.reviewNotes },
}, null, 2) + '\n');
console.log(JSON.stringify({ verified: true, appId: cfg.appId, version: cfg.version,
  state: freshVersion.attributes.appStoreState, locales: freshLocs.map(l => l.attributes.locale),
  reviewContactComplete, notesSaved: reviewContactComplete }));
