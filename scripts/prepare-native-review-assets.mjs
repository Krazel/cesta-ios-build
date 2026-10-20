// Copy actual XCTest screenshots, byte for byte. Never repaint or mock up UI.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const [run,commit]=process.argv.slice(2);
assert(/^\d+$/.test(run)&&/^[a-f0-9]{40}$/.test(commit),'Supply QA run and source commit');
const output='store/screenshots/1.5.1';
fs.mkdirSync(output,{recursive:true});
const gallery=[],provenance=[],review={};
for(const device of ['phone','tablet']) {
  const root=`artifacts/native-qa-${run}-${device}`;
  const result=JSON.parse(fs.readFileSync(`${root}/results.json`,'utf8'));
  assert.equal(result.length,2);
  assert(result.every(r=>r.ok),'Finish the native QA before selecting final store assets');
  for(const language of ['spanish','english']) {
    const locale=language==='spanish'?'es-ES':'en-US',short=locale.slice(0,2);
    const folder=`${root}/captures/${device}-${language}`;
    const attachments=JSON.parse(fs.readFileSync(`${folder}/manifest.json`,'utf8')).flatMap(t=>t.attachments);
    const copy=async (name,filename)=>{
      const attachment=attachments.find(a=>a.suggestedHumanReadableName.startsWith(`store-${short}-${name}_`));
      assert(attachment,`Missing native screenshot ${device}/${locale}/${name}`);
      const source=path.join(folder,attachment.exportedFileName),target=path.join(output,filename);
      const image=await sharp(source).metadata();
      assert.equal(image.width,device==='phone'?1320:2064);
      assert.equal(image.height,device==='phone'?2868:2752);
      assert.equal(image.hasAlpha,false);
      const bytes=fs.readFileSync(source);
      fs.writeFileSync(target,bytes);
      const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
      assert.equal(crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex'),sha256);
      provenance.push({run,commit,device,locale,name,source,target,width:image.width,height:image.height,sha256,unchangedNativeCapture:true});
      return target;
    };
    const files=[];
    for(const [name,label] of [['23-gallery-shop','shop'],['20-gallery-lists','lists'],['21-gallery-products','products'],['22-gallery-home','home']])
      files.push(await copy(name,`${short}-${device}-${label}.png`));
    // Apple's API retains the APP_IPHONE_67 enum for the current largest display.
    gallery.push({locale,type:device==='phone'?'APP_IPHONE_67':'APP_IPAD_PRO_3GEN_129',files});
    if(device==='phone'&&language==='spanish') {
      review.top=await copy('07-subscriptions-top','review-subscriptions-top.png');
      review.bottom=await copy('08-subscriptions-bottom','review-subscriptions-bottom.png');
    }
  }
}
const products=JSON.parse(fs.readFileSync('artifacts/app-review-20261020/apple-audit-summary.json','utf8')).products;
assert.equal(products.length,6);
const subscriptions=products.map((p,i)=>({id:p.id,productId:p.productId,file:i<3?review.top:review.bottom}));
fs.writeFileSync('artifacts/app-review-20261020/assets-manifest.json',JSON.stringify({appId:'6808982515',gallery,subscriptions},null,2));
fs.writeFileSync(`${output}/provenance.json`,JSON.stringify({createdAt:new Date().toISOString(),version:'1.5.1',build:JSON.parse(fs.readFileSync('store/app-review.json','utf8')).buildNumber,galleryState:'Verified StoreKit test entitlement active; the real app removes its banner. No pixels edited.',provenance},null,2));
console.log(JSON.stringify({files:provenance.length,gallery:gallery.map(g=>({locale:g.locale,type:g.type,count:g.files.length})),review:subscriptions}));
