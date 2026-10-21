import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { asc } from './asc-client.mjs';
const keys=path.resolve('../APIs/IOS');
process.env.ASC_KEY_ID=fs.readFileSync(path.join(keys,'Key ID.txt'),'utf8').trim();
process.env.ASC_ISSUER_ID=fs.readFileSync(path.join(keys,'Issuer ID.txt'),'utf8').trim();
process.env.ASC_PRIVATE_KEY_PATH=path.join(keys,'Coder Metadata App Manager.p8');
const cfg=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
assert.equal(cfg.appId,'6808982515');
const get=async p=>(await asc('GET',p)).data;
const version=(await get('/v1/apps/6808982515/appStoreVersions')).find(v=>v.attributes.appStoreState==='PREPARE_FOR_SUBMISSION');
assert(version);
const locales=await get(`/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations`);
async function upload(type, relationship, relatedType, relatedId, file) {
  const bytes=fs.readFileSync(file), name=path.basename(file);
  const md5=crypto.createHash('md5').update(bytes).digest('hex');
  const resource=(await asc('POST',`/v1/${type}`,{data:{type,attributes:{fileName:name,fileSize:bytes.length},relationships:{[relationship]:{data:{type:relatedType,id:relatedId}}}}})).data;
  for(const op of resource.attributes.uploadOperations) {
    const headers=Object.fromEntries(op.requestHeaders.map(h=>[h.name,h.value]));
    const r=await fetch(op.url,{method:op.method,headers,body:bytes.subarray(op.offset,op.offset+op.length)});
    assert(r.ok,`Asset chunk failed ${r.status}`);
  }
  await asc('PATCH',`/v1/${type}/${resource.id}`,{data:{type,id:resource.id,attributes:{uploaded:true,sourceFileChecksum:md5}}});
  const result=await get(`/v1/${type}/${resource.id}`);
  return {id:resource.id,file,md5,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),state:result.attributes.assetDeliveryState};
}
const receipts=[];
const save = () => fs.writeFileSync('artifacts/app-review-20261020/uploaded-assets.json',JSON.stringify({checkedAt:new Date().toISOString(),receipts},null,2));
for(const set of cfg.gallery || []) {
  const locale=locales.find(l=>l.attributes.locale===set.locale);assert(locale);
  const current=await get(`/v1/appStoreVersionLocalizations/${locale.id}/appScreenshotSets`);
  let resource=current.find(s=>s.attributes.screenshotDisplayType===set.type);
  if(!resource) resource=(await asc('POST','/v1/appScreenshotSets',{data:{type:'appScreenshotSets',attributes:{screenshotDisplayType:set.type},relationships:{appStoreVersionLocalization:{data:{type:'appStoreVersionLocalizations',id:locale.id}}}}})).data;
  const existing=await get(`/v1/appScreenshotSets/${resource.id}/appScreenshots`);
  for(const file of set.files) {
    const dimensions=await sharp(file).metadata();
    assert(dimensions.width && dimensions.height && !dimensions.hasAlpha,'Use opaque, real simulator captures');
    const name=path.basename(file);
    const complete=existing.find(e=>e.attributes.fileName===name && e.attributes.assetDeliveryState?.state==='COMPLETE');
    if(complete) {
      const bytes=fs.readFileSync(file);
      assert.equal(complete.attributes.fileSize,bytes.length,'Existing screenshot differs; inspect before replacing');
      if(complete.attributes.sourceFileChecksum) assert.equal(complete.attributes.sourceFileChecksum,crypto.createHash('md5').update(bytes).digest('hex'));
      continue;
    }
    assert(!existing.some(e=>e.attributes.fileName===name),'Existing incomplete asset must be diagnosed, not duplicated');
    receipts.push({resourceType:'appScreenshots',locale:set.locale,type:set.type,...await upload('appScreenshots','appScreenshotSet','appScreenshotSets',resource.id,file)});
    save();
  }
}
for(const item of cfg.subscriptions || []) {
  const sub=await get(`/v1/subscriptions/${item.id}`);
  assert.equal(sub.attributes.productId,item.productId);
  let existing;
  try {existing=await get(`/v1/subscriptions/${item.id}/appStoreReviewScreenshot`);}catch(e){if(!String(e).includes(': 404'))throw e;}
  if(existing?.attributes.assetDeliveryState?.state==='COMPLETE')continue;
  assert(!existing,'Diagnose incomplete subscription screenshot before retry');
  receipts.push({resourceType:'subscriptionAppStoreReviewScreenshots',productId:item.productId,...await upload('subscriptionAppStoreReviewScreenshots','subscription','subscriptions',item.id,item.file)});
  save();
}
const deadline=Date.now()+120000;
while(receipts.some(r=>r.state?.state!=='COMPLETE')) {
  for(const receipt of receipts.filter(r=>r.state?.state!=='COMPLETE')) {
    const fresh=await get(`/v1/${receipt.resourceType}/${receipt.id}`);
    receipt.state=fresh.attributes.assetDeliveryState;
    assert.notEqual(receipt.state?.state,'FAILED',JSON.stringify(receipt));
  }
  save();
  if(receipts.every(r=>r.state?.state==='COMPLETE'))break;
  assert(Date.now()<deadline,'Apple still processing assets; inspect saved receipts before retrying');
  await new Promise(resolve=>setTimeout(resolve,3000));
}
save();
console.log(JSON.stringify({uploads:receipts.length,receipts}));
