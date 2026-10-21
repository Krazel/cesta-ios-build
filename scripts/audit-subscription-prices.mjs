import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {asc} from './asc-client.mjs';
const keys=path.resolve('../APIs/IOS');
process.env.ASC_KEY_ID=fs.readFileSync(path.join(keys,'Key ID.txt'),'utf8').trim();
process.env.ASC_ISSUER_ID=fs.readFileSync(path.join(keys,'Issuer ID.txt'),'utf8').trim();
process.env.ASC_PRIVATE_KEY_PATH=path.join(keys,'Coder Metadata App Manager.p8');
const get=async p=>(await asc('GET',p)).data;
const cfg=JSON.parse(fs.readFileSync('store/monetization.json','utf8'));
const products=await get('/v1/subscriptionGroups/22489005/subscriptions?limit=200');
const groupLocales=await get('/v1/subscriptionGroups/22489005/subscriptionGroupLocalizations?limit=200');
assert.deepEqual(groupLocales.map(l=>l.attributes.locale).sort(),['en-US','es-ES']);
const results=[];
for(const desired of cfg.products) {
 const product=products.find(p=>p.attributes.productId===desired.id);assert(product);
 assert.equal(product.attributes.subscriptionPeriod,'ONE_MONTH');assert.equal(product.attributes.groupLevel,1);
 const prices=await asc('GET',`/v1/subscriptions/${product.id}/prices?include=territory,subscriptionPricePoint&limit=200`);
 const price=prices.data.find(p=>p.relationships.territory.data.id==='ESP'&&!p.attributes.startDate);assert(price);
 const point=prices.included.find(p=>p.type==='subscriptionPricePoints'&&p.id===price.relationships.subscriptionPricePoint.data.id);assert(point);
 assert.equal(Number(point.attributes.customerPrice),Number(desired.eur));
 assert.equal(price.attributes.planType,'UPFRONT');
 results.push({id:product.id,productId:desired.id,period:product.attributes.subscriptionPeriod,groupLevel:product.attributes.groupLevel,priceESP:point.attributes.customerPrice,planType:price.attributes.planType,priceTerritories:prices.data.length,state:product.attributes.state});
}
const receipt={checkedAt:new Date().toISOString(),group:'22489005',groupLocales:groupLocales.map(l=>l.attributes),products:results};
fs.writeFileSync('artifacts/app-review-20261020/subscription-prices.json',JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt));
