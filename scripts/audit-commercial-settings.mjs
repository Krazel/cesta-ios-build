import fs from 'node:fs';
import path from 'node:path';
import { asc } from './asc-client.mjs';
const keys=path.resolve('../APIs/IOS');
process.env.ASC_KEY_ID=fs.readFileSync(path.join(keys,'Key ID.txt'),'utf8').trim();
process.env.ASC_ISSUER_ID=fs.readFileSync(path.join(keys,'Issuer ID.txt'),'utf8').trim();
process.env.ASC_PRIVATE_KEY_PATH=path.join(keys,'Coder Metadata App Manager.p8');
const get=async p=>(await asc('GET',p)).data;
const price=await get('/v1/apps/6808982515/appPriceSchedule');
let manual;
try {manual=await asc('GET',`/v1/appPriceSchedules/${price.id}/manualPrices?include=appPricePoint,territory&limit=200`);}
catch(e){if(!String(e).includes(': 404'))throw e;manual={data:[],missing:true};}
let availability, territories=[];
try {availability=await get('/v1/apps/6808982515/appAvailabilityV2');territories=await get(`/v2/appAvailabilities/${availability.id}/territoryAvailabilities?limit=200`);}
catch(e){if(!String(e).includes(': 404'))throw e;availability={missing:true};}
const app=await get('/v1/apps/6808982515');
const result={checkedAt:new Date().toISOString(),priceSchedule:price,manualPrices:manual,availability,territories,contentRightsDeclaration:app.attributes.contentRightsDeclaration};
fs.writeFileSync('artifacts/app-review-20261020/commercial-settings.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({priceSchedule:price,pricePoints:manual.included?.filter(i=>i.type==='appPricePoints').map(i=>i.attributes),missingPrices:manual.missing,territories:territories.length,availability:availability.attributes,contentRights:result.contentRightsDeclaration}));
