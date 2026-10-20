import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const gh=(args,input)=>{
  const r=spawnSync('gh',args,{encoding:'utf8',input:input?JSON.stringify(input):undefined});
  if(r.status!==0)throw Error(r.stderr);return JSON.parse(r.stdout);
};
const endpoint='repos/Krazel/krazel.github.io/contents/cesta/privacy/index.html';
const before=gh(['api',endpoint]);
const original=Buffer.from(before.content,'base64').toString('utf8');
assert.equal(original,fs.readFileSync('store/privacy-1.5.html','utf8'),'Merge concurrent public policy edits first');
let html=original
 .replace(' Hasta la versión1.4 no se integra publicidad ni analítica de terceros.','')
 .replace(' Versions through1.4 have no ads or third-party analytics.','')
 .replace('La candidata1.5 incorpora Google Mobile Ads12.14 y Google UMP3.1. La beta1.4 distribuida anteriormente no incorpora estos SDKs. El desarrollo utiliza banners de prueba; crear los identificadores no significa que existan impresiones o ingresos reales. La web no integra anuncios de AdMob ni compras.',
 'La app para iPhone y iPad integra Google Mobile Ads12.14 y Google UMP3.1 para mostrar un banner inferior. Las pruebas usan anuncios de prueba; la versión comercial utiliza el bloque propio de Cesta. La disponibilidad de anuncios e ingresos depende de la verificación y aprobación de Google. La web no integra anuncios de AdMob ni compras.')
 .replace('The1.5 candidate integrates Google Mobile Ads12.14 and Google UMP3.1. The previously distributed1.4 beta does not include them. Development uses test banners; registered ad IDs do not imply real impressions or revenue. The web version has no AdMob ads or purchases.',
 'The iPhone and iPad app integrates Google Mobile Ads12.14 and Google UMP3.1 to display a bottom banner. Testing uses test ads; the commercial version uses Cesta’s own ad unit. Ad availability and revenue depend on Google verification and approval. The web version has no AdMob ads or purchases.')
 .replace('Las reglas de Google determinan los modos de anuncio permitidos.',
 'Sin los permisos aplicables de personalización y seguimiento, Cesta desactiva la personalización y solicita anuncios no personalizados y tratamiento restringido de datos. Las señales GPP regionales no reconocidas y las negativas de privacidad no se interpretan como permiso de seguimiento. Los anuncios se filtran para público general. Las reglas de Google determinan los modos de anuncio permitidos.')
 .replace("Google's rules determine permitted ad modes.",
 'Without the applicable personalization and tracking permissions, Cesta disables personalization and requests non-personalized ads with restricted data processing. Unrecognized regional GPP signals and privacy refusals are not treated as tracking permission. Ads are filtered for a general audience. Google’s rules determine permitted ad modes.');
assert.notEqual(html,original);
fs.writeFileSync('store/privacy-1.5.1.html',html);
if(!process.argv.includes('--apply')) {console.log('Definitive policy prepared locally; use --apply for the authorized Cesta-only update');process.exit(0);}
const result=gh(['api',endpoint,'--method','PUT','--input','-'],{message:'Finalize Cesta privacy policy for App Review candidate',sha:before.sha,content:Buffer.from(html).toString('base64'),branch:'main'});
const after=gh(['api',endpoint]);assert.equal(Buffer.from(after.content,'base64').toString('utf8'),html);
const receipt={verifiedAt:new Date().toISOString(),commit:result.commit.sha,path:after.path,sha256:crypto.createHash('sha256').update(html).digest('hex'),onlyCestaPolicy:true};
fs.writeFileSync('artifacts/app-review-20261020/privacy-published.json',JSON.stringify(receipt,null,2));
console.log(JSON.stringify(receipt));
