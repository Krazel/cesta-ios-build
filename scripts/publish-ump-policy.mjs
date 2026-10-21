// Cesta-only purpose clarification authorized by the user on 21 October.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const gh=(args,input)=>{const r=spawnSync('gh',args,{encoding:'utf8',input:input?JSON.stringify(input):undefined});if(r.status!==0)throw Error(r.stderr);return JSON.parse(r.stdout);};
const endpoint='repos/Krazel/krazel.github.io/contents/cesta/privacy/index.html';
const before=gh(['api',endpoint]);
const original=Buffer.from(before.content,'base64').toString('utf8');
assert.equal(original,fs.readFileSync('store/privacy-1.5.1.html','utf8'),'Merge concurrent edits first');
const html=original.replace('UMP solicita las opciones de privacidad', 'UMP utiliza ubicación aproximada, interacciones y rendimiento para gestionar las opciones de consentimiento; esos datos de UMP no se vinculan con tu identidad ni se usan para seguimiento. UMP solicita las opciones de privacidad')
 .replace('UMP obtains applicable privacy choices','UMP uses approximate location, interactions and performance data to manage consent choices; this UMP data is not linked to your identity or used for tracking. UMP obtains applicable privacy choices');
assert.notEqual(html,original);assert(html.includes('this UMP data')&&html.includes('esos datos de UMP'));
if(!process.argv.includes('--apply')){console.log('Prepared Cesta-only UMP purpose clarification');process.exit(0);}
const result=gh(['api',endpoint,'--method','PUT','--input','-'],{message:'Clarify Cesta consent-management data purposes',sha:before.sha,content:Buffer.from(html).toString('base64'),branch:'main'});
const after=gh(['api',endpoint]);assert.equal(Buffer.from(after.content,'base64').toString('utf8'),html);
fs.writeFileSync('store/privacy-1.5.1.html',html);
const sha256=crypto.createHash('sha256').update(html).digest('hex');
const response=await fetch('https://krazel.github.io/cesta/privacy/',{cache:'no-store'});
const publicVerified=response.ok&&crypto.createHash('sha256').update(await response.text()).digest('hex')===sha256;
const receipt={verifiedAt:new Date().toISOString(),commit:result.commit.sha,sha256,onlyCestaPolicy:true,publicVerified};
fs.writeFileSync('artifacts/app-review-20261020/privacy-ump-public.json',JSON.stringify(receipt,null,2));
console.log(JSON.stringify(receipt));
