import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { asc } from './asc-client.mjs';
const apply = process.argv.includes('--apply');
const cfg = JSON.parse(fs.readFileSync('store/monetization.json', 'utf8'));
assert.equal(cfg.appId, '6808982515');
assert.equal(cfg.products.length, 6);
const keys = path.resolve('../APIs/IOS');
process.env.ASC_KEY_ID = fs.readFileSync(path.join(keys, 'Key ID.txt'), 'utf8').trim();
process.env.ASC_ISSUER_ID = fs.readFileSync(path.join(keys, 'Issuer ID.txt'), 'utf8').trim();
process.env.ASC_PRIVATE_KEY_PATH = path.join(keys, 'Coder Metadata App Manager.p8');
const dir = 'artifacts/monetization-20261018';
fs.mkdirSync(dir, { recursive: true });
const collect = async (endpoint) => {
  const data = [];
  while (endpoint) {
    const r = await asc('GET', endpoint);
    data.push(...r.data);
    endpoint = r.links?.next;
    if (endpoint) {
      const u = new URL(endpoint);
      assert.equal(u.origin, 'https://api.appstoreconnect.apple.com');
      endpoint = u.pathname + u.search;
    }
  }
  return data;
};
const write = async (endpoint, data) => {
  assert(apply, 'Use --apply only for the owner-authorized Cesta setup');
  return (await asc('POST', endpoint, { data })).data;
};
const groups = await collect(`/v1/apps/${cfg.appId}/subscriptionGroups?limit=200`);
assert(groups.length <= 1, 'Unexpected group; review before mutating');
let group = groups.find((g) => g.attributes.referenceName === cfg.groupReferenceName);
if (!apply) {
  console.log(JSON.stringify({ apply: false, group: group?.id, products: cfg.products }));
  process.exit(0);
}
if (!group)
  group = await write('/v1/subscriptionGroups', {
    type: 'subscriptionGroups',
    attributes: { referenceName: cfg.groupReferenceName },
    relationships: { app: { data: { type: 'apps', id: cfg.appId } } },
  });
for (const [locale, name] of Object.entries({
  'es-ES': 'Cesta sin anuncios',
  'en-US': 'Cesta ad-free',
})) {
  const locs = await collect(
    `/v1/subscriptionGroups/${group.id}/subscriptionGroupLocalizations?limit=200`,
  );
  if (!locs.some((l) => l.attributes.locale === locale))
    await write('/v1/subscriptionGroupLocalizations', {
      type: 'subscriptionGroupLocalizations',
      attributes: { locale, name },
      relationships: { subscriptionGroup: { data: { type: 'subscriptionGroups', id: group.id } } },
    });
}
const existing = await collect(`/v1/subscriptionGroups/${group.id}/subscriptions?limit=200`);
const results = [];
for (const [order, desired] of cfg.products.entries()) {
  assert(/^com\.dmkr\.cesta\.noads\.monthly\.\d+$/.test(desired.id));
  let sub = existing.find((s) => s.attributes.productId === desired.id);
  if (!sub)
    sub = await write('/v1/subscriptions', {
      type: 'subscriptions',
      attributes: {
        name: `Cesta sin anuncios mensual ${order + 1}`,
        productId: desired.id,
        subscriptionPeriod: 'ONE_MONTH',
        familySharable: false,
        groupLevel: 1,
        reviewNote:
          'All six monthly subscription options provide the same ad-removal benefit. Higher prices are optional additional support. Core shopping features remain available without subscribing. No free trial or introductory offer. Owner requested EUR prices from1.99 to24.99.',
      },
      relationships: { group: { data: { type: 'subscriptionGroups', id: group.id } } },
    });
  assert(
    !['APPROVED', 'IN_REVIEW', 'WAITING_FOR_REVIEW'].includes(sub.attributes.state),
    'Do not alter a reviewed subscription',
  );
  console.log('Configure', desired.id, desired.eur, 'EUR');
  const localizations = await collect(
    `/v1/subscriptions/${sub.id}/subscriptionLocalizations?limit=200`,
  );
  for (const locale of ['es-ES', 'en-US'])
    if (!localizations.some((l) => l.attributes.locale === locale))
      await write('/v1/subscriptionLocalizations', {
        type: 'subscriptionLocalizations',
        attributes: {
          locale,
          name:
            locale === 'es-ES'
              ? `Sin anuncios · Opción ${order + 1}`
              : `No ads · Option ${order + 1}`,
          description:
            locale === 'es-ES'
              ? 'Quita anuncios mientras esté activa. Mismo beneficio.'
              : 'Removes ads while active. Same benefit at every price.',
        },
        relationships: { subscription: { data: { type: 'subscriptions', id: sub.id } } },
      });
  const points = await collect(
    `/v1/subscriptions/${sub.id}/pricePoints?filter[territory]=ESP&filter[planType]=UPFRONT&include=territory&limit=8000`,
  );
  const point = points.find((p) => Number(p.attributes.customerPrice) === Number(desired.eur));
  assert(point, 'Requested Spanish price unavailable');
  const equivalents = await collect(
    `/v1/subscriptionPricePoints/${point.id}/equalizations?filter[planType]=UPFRONT&include=territory&limit=8000`,
  );
  const all = new Map([point, ...equivalents].map((p) => [p.relationships.territory.data.id, p]));
  assert(all.size > 150);
  let availability;
  try {
    availability = (await asc('GET', `/v1/subscriptions/${sub.id}/subscriptionAvailability`)).data;
  } catch (e) {
    if (!String(e.message).includes(': 404')) throw e;
  }
  if (!availability)
    availability = await write('/v1/subscriptionAvailabilities', {
      type: 'subscriptionAvailabilities',
      attributes: { availableInNewTerritories: true },
      relationships: {
        subscription: { data: { type: 'subscriptions', id: sub.id } },
        availableTerritories: { data: [...all.keys()].map((id) => ({ type: 'territories', id })) },
      },
    });
  const prices = await collect(
    `/v1/subscriptions/${sub.id}/prices?include=territory,subscriptionPricePoint&limit=200`,
  );
  for (const [territory, p] of all) {
    const active = prices.find(
      (v) => v.relationships.territory.data.id === territory && !v.attributes.startDate,
    );
    if (active) {
      assert.equal(
        active.relationships.subscriptionPricePoint.data.id,
        p.id,
        'Existing price differs; stop',
      );
      continue;
    }
    await write('/v1/subscriptionPrices', {
      type: 'subscriptionPrices',
      attributes: { preserveCurrentPrice: false, planType: 'UPFRONT' },
      relationships: {
        subscription: { data: { type: 'subscriptions', id: sub.id } },
        territory: { data: { type: 'territories', id: territory } },
        subscriptionPricePoint: { data: { type: 'subscriptionPricePoints', id: p.id } },
      },
    });
  }
  const verified = (await asc('GET', `/v1/subscriptions/${sub.id}`)).data;
  assert.equal(verified.attributes.subscriptionPeriod, 'ONE_MONTH');
  assert.equal(verified.attributes.groupLevel, 1);
  const freshPrices = await collect(
    `/v1/subscriptions/${sub.id}/prices?include=territory,subscriptionPricePoint&limit=200`,
  );
  assert.equal(freshPrices.length, all.size);
  for (const p of freshPrices)
    assert.equal(
      p.relationships.subscriptionPricePoint.data.id,
      all.get(p.relationships.territory.data.id)?.id,
    );
  const locs = await collect(`/v1/subscriptions/${sub.id}/subscriptionLocalizations?limit=200`);
  assert(
    locs.some((l) => l.attributes.locale === 'es-ES') &&
      locs.some((l) => l.attributes.locale === 'en-US'),
  );
  results.push({
    id: sub.id,
    productId: desired.id,
    spainEUR: desired.eur,
    groupLevel: 1,
    period: 'ONE_MONTH',
    territories: freshPrices.length,
    state: verified.attributes.state,
    availability: availability.id,
  });
  fs.writeFileSync(
    `${dir}/apple-products-progress.json`,
    JSON.stringify(
      { checkedAt: new Date().toISOString(), groupId: group.id, products: results },
      null,
      2,
    ),
  );
  console.log('Verified', desired.id, freshPrices.length, 'territories');
}
const receipt = {
  checkedAt: new Date().toISOString(),
  appId: cfg.appId,
  groupId: group.id,
  products: results,
  submittedForReview: false,
};
fs.writeFileSync(`${dir}/apple-products-verified.json`, JSON.stringify(receipt, null, 2));
console.log(JSON.stringify(receipt));
