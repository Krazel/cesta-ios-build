import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { asc } from './asc-client.mjs';
const keys = path.resolve('../APIs/IOS');
process.env.ASC_KEY_ID = fs.readFileSync(path.join(keys, 'Key ID.txt'),'utf8').trim();
process.env.ASC_ISSUER_ID = fs.readFileSync(path.join(keys, 'Issuer ID.txt'),'utf8').trim();
process.env.ASC_PRIVATE_KEY_PATH = path.join(keys,'Coder Metadata App Manager.p8');
const get = async url => (await asc('GET',url)).data;
const info = (await get('/v1/apps/6808982515/appInfos')).find(i => i.attributes.appStoreState === 'PREPARE_FOR_SUBMISSION');
assert(info, 'Expected editable Cesta app info');
const age = await get(`/v1/appInfos/${info.id}/ageRatingDeclaration`);
// Private grocery collaboration has no public UGC feed, messaging, unrestricted
// browser, medical advice or age controls. The catalogue includes beer and wine.
const attrs = {
  advertising:true, alcoholTobaccoOrDrugUseOrReferences:'INFREQUENT_OR_MILD',
  contests:'NONE', gambling:false, gamblingSimulated:'NONE', gunsOrOtherWeapons:'NONE',
  healthOrWellnessTopics:false, lootBox:false, medicalOrTreatmentInformation:'NONE',
  messagingAndChat:false, parentalControls:false, profanityOrCrudeHumor:'NONE',
  ageAssurance:false, sexualContentGraphicAndNudity:'NONE', sexualContentOrNudity:'NONE',
  socialMedia:false, socialMediaAgeRestricted:false, horrorOrFearThemes:'NONE',
  matureOrSuggestiveThemes:'NONE', unrestrictedWebAccess:false, userGeneratedContent:false,
  violenceCartoonOrFantasy:'NONE', violenceRealisticProlongedGraphicOrSadistic:'NONE',
  violenceRealistic:'NONE', ageRatingOverrideV2:'NONE', koreaAgeRatingOverride:'NONE',
};
await asc('PATCH',`/v1/ageRatingDeclarations/${age.id}`,{data:{type:'ageRatingDeclarations',id:age.id,attributes:attrs}});
const categories = {};
for (const role of ['primaryCategory','secondaryCategory']) {
  const c = await get(`/v1/appInfos/${info.id}/${role}`);
  categories[role] = c?.id || null;
}
// Preserve existing valid choices. Supply only absent categories.
const missing = Object.fromEntries(Object.entries({primaryCategory:'SHOPPING',secondaryCategory:'PRODUCTIVITY'}).filter(([role])=>!categories[role]).map(([role,id])=>[role,{data:{type:'appCategories',id}}]));
if (Object.keys(missing).length) await asc('PATCH',`/v1/appInfos/${info.id}`,{data:{type:'appInfos',id:info.id,relationships:missing}});
const fresh = await get(`/v1/appInfos/${info.id}/ageRatingDeclaration`);
for (const [key,value] of Object.entries(attrs)) assert.equal(fresh.attributes[key],value);
for (const role of Object.keys(categories)) categories[role] = (await get(`/v1/appInfos/${info.id}/${role}`))?.id;
const result = {checkedAt:new Date().toISOString(),verified:true,age:fresh.attributes,categories};
fs.mkdirSync('artifacts/app-review-20261020',{recursive:true});
fs.writeFileSync('artifacts/app-review-20261020/age-categories.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result));
