import fs from 'node:fs';
import assert from 'node:assert/strict';
import {asc} from './asc-client.mjs';
const cfg=JSON.parse(fs.readFileSync('store/testflight.json'));
const app=(await asc('GET',`/v1/apps/${cfg.appId}`)).data;
assert.equal(app.attributes.bundleId,cfg.bundleId);
const info=(await asc('GET',`/v1/apps/${cfg.appId}/appInfos`)).data.find(x=>x.attributes.state==='PREPARE_FOR_SUBMISSION');
const version=(await asc('GET',`/v1/apps/${cfg.appId}/appStoreVersions`)).data.find(x=>x.attributes.appStoreState==='PREPARE_FOR_SUBMISSION');
assert(info && version,'An editable app record is required');
await asc('PATCH',`/v1/appStoreVersions/${version.id}`,{data:{type:'appStoreVersions',id:version.id,attributes:{versionString:cfg.marketingVersion,copyright:'2026 Krazel Studio',releaseType:'MANUAL'}}});
await asc('GET','/v1/appCategories/SHOPPING');
await asc('PATCH',`/v1/appInfos/${info.id}`,{data:{type:'appInfos',id:info.id,relationships:{primaryCategory:{data:{type:'appCategories',id:'SHOPPING'}}}}});
const base='https://github.com/Krazel/cesta-ios-build/blob/main/docs';
const privacyPolicyUrl=`${base}/privacy.md`, supportUrl=`${base}/support.md`;
const locales={
 'es-ES':{name:'Cesta: Lista de la compra',subtitle:'Prepara, guarda y compra',keywords:'supermercado,productos,despensa,organizar,listas,compartir,alimentos',description:'Organiza tu compra con listas visuales que puedes guardar y volver a usar.\n\nPrepara tus listas, llévalas a Inicio cuando quieras comprar y marca los productos que ya tienes. Busca en el catálogo mientras escribes, añade cantidades y notas, o crea productos con tus propias fotos. Pega un texto para convertirlo en una lista y ajusta el tamaño de los productos a tu gusto.\n\nCesta está disponible en castellano e inglés y permite usar tus listas sin conexión. En esta versión de prueba, compartir y sincronizar requiere conexión al servidor de pruebas en la misma red local.'},
 'en-US':{name:'Cesta: Grocery Shopping List',subtitle:'Prepare, save and shop',keywords:'groceries,supermarket,products,pantry,organize,lists,shared,food',description:'Organize your shopping with visual lists you can save and use again.\n\nPrepare a list, move it to Home when you are ready to shop and tick off the products you have bought. Find catalogue suggestions as you type, add quantities and notes, or create products with your own photos. Paste shopping text to turn it into a list and adjust product sizes to suit you.\n\nCesta is available in Spanish and English and supports offline shopping. In this beta version, sharing and synchronization require the test server on the same local network.'},
};
async function upsert(type,existing,attributes,relation,parentType,parentId){
 if(existing){const {locale,...updates}=attributes;return (await asc('PATCH',`/v1/${type}/${existing.id}`,{data:{type,id:existing.id,attributes:updates}})).data;}
 return (await asc('POST',`/v1/${type}`,{data:{type,attributes,relationships:{[relation]:{data:{type:parentType,id:parentId}}}}})).data;
}
const infoLocs=(await asc('GET',`/v1/appInfos/${info.id}/appInfoLocalizations`)).data;
const versionLocs=(await asc('GET',`/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations`)).data;
const betaLocs=(await asc('GET',`/v1/apps/${cfg.appId}/betaAppLocalizations`)).data;
for(const [locale,content]of Object.entries(locales)){
 assert(content.name.length<=30&&content.subtitle.length<=30&&content.keywords.length<=100);
 await upsert('appInfoLocalizations',infoLocs.find(x=>x.attributes.locale===locale),{locale,name:content.name,subtitle:content.subtitle,privacyPolicyUrl},'appInfo','appInfos',info.id);
 await upsert('appStoreVersionLocalizations',versionLocs.find(x=>x.attributes.locale===locale),{locale,description:content.description,keywords:content.keywords,supportUrl},'appStoreVersion','appStoreVersions',version.id);
 await upsert('betaAppLocalizations',betaLocs.find(x=>x.attributes.locale===locale),{locale,description:content.description,feedbackEmail:'coderappskrazel@gmail.com',privacyPolicyUrl},'app','apps',cfg.appId);
}
await asc('PATCH',`/v1/betaAppReviewDetails/${cfg.appId}`,{data:{type:'betaAppReviewDetails',id:cfg.appId,attributes:{demoAccountRequired:false,notes:'Internal beta. No account or password is needed: enter a display name to start. Offline lists and catalogue work without a server. Sharing/sync require the local test server at 192.168.1.35:8787 and the same network. No public backend is deployed. This build is intended for internal testing; it is not submitted for external Beta App Review or public App Store review.'}}});
const groups=(await asc('GET',`/v1/apps/${cfg.appId}/betaGroups`)).data;
let group=groups.find(g=>g.attributes.name==='Cesta — Pruebas internas');
if(!group)group=(await asc('POST','/v1/betaGroups',{data:{type:'betaGroups',attributes:{name:'Cesta — Pruebas internas',isInternalGroup:true,hasAccessToAllBuilds:false},relationships:{app:{data:{type:'apps',id:cfg.appId}}}}})).data;
const verification={appId:cfg.appId,version:(await asc('GET',`/v1/appStoreVersions/${version.id}`)).data.attributes,infoLocalizations:(await asc('GET',`/v1/appInfos/${info.id}/appInfoLocalizations`)).data.map(x=>x.attributes),versionLocalizations:(await asc('GET',`/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations`)).data.map(x=>x.attributes),betaLocalizations:(await asc('GET',`/v1/apps/${cfg.appId}/betaAppLocalizations`)).data.map(x=>x.attributes),internalGroupId:group.id};
fs.writeFileSync('artifacts/APP-STORE-PREPARACION.json',JSON.stringify(verification,null,2)+'\n');
console.log(JSON.stringify({appId:cfg.appId,version:verification.version.versionString,locales:verification.infoLocalizations.map(x=>x.locale),internalGroupId:group.id}));

