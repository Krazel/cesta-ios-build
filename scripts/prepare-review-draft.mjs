// Assemble an UNsubmitted review draft. Never set submitted:true or release an app.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { asc } from './asc-client.mjs';
const keys=path.resolve('../APIs/IOS');
process.env.ASC_KEY_ID=fs.readFileSync(path.join(keys,'Key ID.txt'),'utf8').trim();
process.env.ASC_ISSUER_ID=fs.readFileSync(path.join(keys,'Issuer ID.txt'),'utf8').trim();
process.env.ASC_PRIVATE_KEY_PATH=path.join(keys,'Coder Metadata App Manager.p8');
const get=async p=>(await asc('GET',p)).data;
const appId='6808982515',groupId='22489005';
const receipt=JSON.parse(fs.readFileSync('artifacts/app-review-20261020/candidate-apple.json','utf8'));
assert.equal(receipt.version,'1.5.1');
assert.equal(receipt.buildNumber,JSON.parse(fs.readFileSync('store/app-review.json','utf8')).buildNumber);
assert.equal(receipt.selectedBuild,receipt.build.id);
const version=await get(`/v1/appStoreVersions/${receipt.draft.id}`);
assert(['PREPARE_FOR_SUBMISSION','READY_FOR_REVIEW'].includes(version.attributes.appStoreState));
assert.equal(version.attributes.releaseType,'MANUAL');
assert.equal((await get(`/v1/appStoreVersions/${version.id}/build`)).id,receipt.build.id);
const products=await get(`/v1/subscriptionGroups/${groupId}/subscriptions?limit=200`);
const config=JSON.parse(fs.readFileSync('store/monetization.json','utf8'));
assert.deepEqual(products.map(p=>p.attributes.productId).sort(),config.products.map(p=>p.id).sort());
assert(products.every(p=>p.attributes.state==='READY_TO_SUBMIT'));
for(const product of products) {
  const image=await get(`/v1/subscriptions/${product.id}/appStoreReviewScreenshot`);
  assert.equal(image.attributes.assetDeliveryState.state,'COMPLETE');
}
const locales=await get(`/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations`);
assert.deepEqual(locales.map(l=>l.attributes.locale).sort(),['en-US','es-ES']);
for(const locale of locales) {
  const sets=await get(`/v1/appStoreVersionLocalizations/${locale.id}/appScreenshotSets`);
  for(const kind of ['APP_IPHONE_67','APP_IPHONE_61','APP_IPAD_PRO_3GEN_129']) {
    const set=sets.find(s=>s.attributes.screenshotDisplayType===kind);assert(set);
    const images=await get(`/v1/appScreenshotSets/${set.id}/appScreenshots`);
    assert(images.length>=4&&images.every(i=>i.attributes.assetDeliveryState.state==='COMPLETE'));
  }
}
const targets=[{type:'appStoreVersions',relationship:'appStoreVersion',id:version.id}];
for(const [type,parent,resource,id] of [
  ['subscriptionGroupVersions','subscriptionGroup','subscriptionGroups',groupId],
  ...products.map(p=>['subscriptionVersions','subscription','subscriptions',p.id]),
]) {
  const versions=await get(`/v1/${resource}/${id}/versions`);
  let current=versions.find(v=>['PREPARE_FOR_SUBMISSION','READY_FOR_REVIEW'].includes(v.attributes.state));
  if(!current) current=(await asc('POST',`/v1/${type}`,{data:{type,relationships:{[parent]:{data:{type:resource,id}}}}})).data;
  targets.push({type,relationship:type==='subscriptionVersions'?'subscriptionVersion':'subscriptionGroupVersion',id:current.id});
}
const drafts=await get(`/v1/apps/${appId}/reviewSubmissions`);
assert(!drafts.some(d=>['WAITING_FOR_REVIEW','IN_REVIEW'].includes(d.attributes.state)),'Never interfere with a submission in review');
let draft=drafts.find(d=>d.attributes.state==='READY_FOR_REVIEW'&&d.attributes.platform==='IOS');
if(!draft) draft=(await asc('POST','/v1/reviewSubmissions',{data:{type:'reviewSubmissions',attributes:{platform:'IOS'},relationships:{app:{data:{type:'apps',id:appId}}}}})).data;
const readItems=()=>get(`/v1/reviewSubmissions/${draft.id}/items?include=appStoreVersion,subscriptionVersion,subscriptionGroupVersion`);
const initialItems=await readItems();
assert(initialItems.every(item=>targets.some(t=>item.relationships[t.relationship]?.data?.id===t.id)),'Unexpected existing draft contents require inspection before adding items');
for(const target of targets) {
  const items=await readItems();
  if(!items.some(i=>i.relationships[target.relationship]?.data?.id===target.id))
    await asc('POST','/v1/reviewSubmissionItems',{data:{type:'reviewSubmissionItems',relationships:{reviewSubmission:{data:{type:'reviewSubmissions',id:draft.id}},[target.relationship]:{data:{type:target.type,id:target.id}}}}});
}
const fresh=await get(`/v1/reviewSubmissions/${draft.id}`);
const items=await readItems();
assert.equal(fresh.attributes.state,'READY_FOR_REVIEW');
assert(!fresh.attributes.submittedDate);
for(const target of targets) assert(items.some(i=>i.relationships[target.relationship]?.data?.id===target.id));
fs.writeFileSync('artifacts/app-review-20261020/unsubmitted-review-draft.json',JSON.stringify({checkedAt:new Date().toISOString(),draft:fresh,items,targets,submitted:false,physicalQAStillRequired:true},null,2));
console.log(JSON.stringify({id:draft.id,state:fresh.attributes.state,items:items.length,submitted:false}));
