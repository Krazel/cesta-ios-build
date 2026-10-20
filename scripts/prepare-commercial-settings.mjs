import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { asc } from './asc-client.mjs';
const keys=path.resolve('../APIs/IOS');
process.env.ASC_KEY_ID=fs.readFileSync(path.join(keys,'Key ID.txt'),'utf8').trim();
process.env.ASC_ISSUER_ID=fs.readFileSync(path.join(keys,'Issuer ID.txt'),'utf8').trim();
process.env.ASC_PRIVATE_KEY_PATH=path.join(keys,'Coder Metadata App Manager.p8');
const get=async p=>(await asc('GET',p)).data;
const prior=JSON.parse(fs.readFileSync('artifacts/app-review-20261020/commercial-settings.json'));
assert.equal(prior.priceSchedule.id,'6808982515');
if(prior.manualPrices.missing) {
  const points=await get('/v1/apps/6808982515/appPricePoints?filter[territory]=ESP&limit=200');
  const free=points.find(p=>Number(p.attributes.customerPrice)===0);
  assert(free,'Apple must provide the zero price point');
  await asc('POST','/v1/appPriceSchedules',{data:{type:'appPriceSchedules',relationships:{
    app:{data:{type:'apps',id:'6808982515'}},baseTerritory:{data:{type:'territories',id:'ESP'}},
    manualPrices:{data:[{type:'appPrices',id:'${free-download}'}]}}},
    included:[{type:'appPrices',id:'${free-download}',attributes:{startDate:null,endDate:null},relationships:{appPricePoint:{data:{type:'appPricePoints',id:free.id}}}}]});
}
if(prior.availability.missing) {
  const territories=await get('/v1/territories?limit=200');
  // No preorders or automatic future-market expansion. Mainland China remains
  // excluded until the local online-service filing requirements are confirmed.
  const included=territories.map((t,i)=>({type:'territoryAvailabilities',id:'${territory-'+i+'}',attributes:{available:t.id!=='CHN',preOrderEnabled:false},relationships:{territory:{data:{type:'territories',id:t.id}}}}));
  await asc('POST','/v2/appAvailabilities',{data:{type:'appAvailabilities',attributes:{availableInNewTerritories:false},relationships:{app:{data:{type:'apps',id:'6808982515'}},territoryAvailabilities:{data:included.map(({type,id})=>({type,id}))}}},included});
}
// Product visuals are original code; third-party Google ad content is delivered
// under the existing authorized AdMob account and SDK terms.
const app=await get('/v1/apps/6808982515');
if(!app.attributes.contentRightsDeclaration) await asc('PATCH','/v1/apps/6808982515',{data:{type:'apps',id:'6808982515',attributes:{contentRightsDeclaration:'USES_THIRD_PARTY_CONTENT'}}});
await import('./audit-commercial-settings.mjs');
