import fs from 'node:fs';
import path from 'node:path';
import { asc } from './asc-client.mjs';
const keys = path.resolve('../APIs/IOS');
process.env.ASC_KEY_ID = fs.readFileSync(path.join(keys, 'Key ID.txt'), 'utf8').trim();
process.env.ASC_ISSUER_ID = fs.readFileSync(path.join(keys, 'Issuer ID.txt'), 'utf8').trim();
process.env.ASC_PRIVATE_KEY_PATH = path.join(keys, 'Coder Metadata App Manager.p8');
const dir = 'artifacts/app-review-20261020';
fs.mkdirSync(dir + '/private', { recursive: true });
const get = async (endpoint) => (await asc('GET', endpoint)).data;
const app = await get('/v1/apps/6808982515');
const infos = await get('/v1/apps/6808982515/appInfos');
const versions = await get('/v1/apps/6808982515/appStoreVersions');
const draft = versions.find(v => ['PREPARE_FOR_SUBMISSION','READY_FOR_REVIEW'].includes(v.attributes.appStoreState));
if (!draft) throw Error('Expected editable Cesta version');
const info = infos.find(i => i.attributes.appStoreState === 'PREPARE_FOR_SUBMISSION') || infos[0];
const infoLocales = await get(`/v1/appInfos/${info.id}/appInfoLocalizations`);
const age = await get(`/v1/appInfos/${info.id}/ageRatingDeclaration`);
const locales = await get(`/v1/appStoreVersions/${draft.id}/appStoreVersionLocalizations`);
const contact = await get(`/v1/appStoreVersions/${draft.id}/appStoreReviewDetail`);
const selectedBuild = await get(`/v1/appStoreVersions/${draft.id}/build`);
const screenshots = [];
for (const locale of locales) {
  const sets = await get(`/v1/appStoreVersionLocalizations/${locale.id}/appScreenshotSets`);
  for (const set of sets) {
    const images = await get(`/v1/appScreenshotSets/${set.id}/appScreenshots`);
    screenshots.push({ locale: locale.attributes.locale, id: set.id, type: set.attributes.screenshotDisplayType, images });
  }
}
const subs = await get('/v1/subscriptionGroups/22489005/subscriptions?limit=200');
const products = [];
for (const sub of subs) {
  const localizations = await get(`/v1/subscriptions/${sub.id}/subscriptionLocalizations?limit=200`);
  let screenshot;
  try { screenshot = await get(`/v1/subscriptions/${sub.id}/appStoreReviewScreenshot`); }
  catch (error) { if (!String(error).includes(': 404')) throw error; }
  products.push({ ...sub, localizations, screenshot });
}
const privateAudit = { checkedAt: new Date().toISOString(), app, infos, draft, infoLocales, age, locales, contact, selectedBuild, screenshots, products };
fs.writeFileSync(dir + '/private/apple-audit.json', JSON.stringify(privateAudit, null, 2));
const summary = {
  checkedAt: privateAudit.checkedAt,
  appId: app.id, bundleId: app.attributes.bundleId,
  infoId: info.id, categories: info.relationships,
  draft: { id: draft.id, version: draft.attributes.versionString, state: draft.attributes.appStoreState, releaseType: draft.attributes.releaseType },
  infoLocales: infoLocales.map(l => ({ id: l.id, ...l.attributes })),
  age: age?.attributes,
  locales: locales.map(l => ({ id: l.id, locale: l.attributes.locale, descriptionLength: l.attributes.description?.length, supportUrl: l.attributes.supportUrl, marketingUrl: l.attributes.marketingUrl })),
  reviewContactComplete: ['contactFirstName','contactLastName','contactEmail','contactPhone'].every(k => !!contact?.attributes[k]),
  selectedBuild: selectedBuild?.id || null,
  screenshots: screenshots.map(s => ({ locale: s.locale, type: s.type, count: s.images.length })),
  products: products.map(s => ({ id: s.id, productId: s.attributes.productId, state: s.attributes.state, locales: s.localizations.map(l => l.attributes.locale), hasReviewScreenshot: !!s.screenshot })),
};
fs.writeFileSync(dir + '/apple-audit-summary.json', JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary));
