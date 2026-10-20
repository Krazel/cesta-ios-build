// Authorized Cesta-only correction; preserves concurrent edits with GitHub SHA.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const gh=(args,input)=>{const r=spawnSync('gh',args,{encoding:'utf8',input:input?JSON.stringify(input):undefined});if(r.status!==0)throw Error(r.stderr);return JSON.parse(r.stdout);};
const endpoint='repos/Krazel/krazel.github.io/contents/cesta/privacy/index.html';
const before=gh(['api',endpoint]);
const original=Buffer.from(before.content,'base64').toString('utf8');
assert.equal(original,fs.readFileSync('store/privacy-1.5.1.html','utf8'),'Merge concurrent policy edits first');
const html=original
 .replace('Actualizado / Updated: 2026-10-18.','Actualizado / Updated: 2026-10-21.')
 .replace('datos de fallos/rendimiento. Google los utiliza','datos de fallos/rendimiento y otros datos de diagnóstico. Los diagnósticos no se vinculan con la identidad del usuario ni se usan para seguimiento. El seguimiento declarado se limita al identificador del dispositivo cuando se conceden los permisos aplicables. Google los utiliza')
 .replace('crash/performance information. Google uses','crash/performance information and other diagnostic data. Diagnostics are not linked to the user’s identity or used for tracking. Declared tracking is limited to the device identifier when the applicable permissions are granted. Google uses')
 .replace('Los anuncios se filtran para público general.','Fuera de señales TCF verificables no se habilita la personalización. Los anuncios se filtran para público general.')
 .replace('Ads are filtered for a general audience.','Personalization is not enabled without verifiable TCF signals. Ads are filtered for a general audience.');
assert.notEqual(html,original);
assert(html.includes('otros datos de diagnóstico')&&html.includes('other diagnostic data'));
if(!process.argv.includes('--apply')) {console.log('Correction prepared; --apply publishes only the existing Cesta policy');process.exit(0);}
const result=gh(['api',endpoint,'--method','PUT','--input','-'],{message:'Align Cesta privacy policy with pinned SDK diagnostics disclosure',sha:before.sha,content:Buffer.from(html).toString('base64'),branch:'main'});
const after=gh(['api',endpoint]);assert.equal(Buffer.from(after.content,'base64').toString('utf8'),html);
fs.writeFileSync('store/privacy-1.5.1.html',html);
const expected=crypto.createHash('sha256').update(html).digest('hex');
let publicVerified=false;
const until=Date.now()+120000;
while(Date.now()<until) {
  const r=await fetch('https://krazel.github.io/cesta/privacy/',{cache:'no-store'});
  if(r.ok&&crypto.createHash('sha256').update(await r.text()).digest('hex')===expected){publicVerified=true;break;}
  await new Promise(resolve=>setTimeout(resolve,5000));
}
const receipt={verifiedAt:new Date().toISOString(),commit:result.commit.sha,path:after.path,sha256:expected,onlyCestaPolicy:true,publicVerified};
fs.writeFileSync('artifacts/app-review-20261020/privacy-correction-public.json',JSON.stringify(receipt,null,2));
assert(publicVerified,'GitHub saved the correction but public Pages is still updating; recheck before claiming live');
console.log(JSON.stringify(receipt));
