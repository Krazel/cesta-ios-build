import fs from 'node:fs';
import assert from 'node:assert/strict';
import {asc} from './asc-client.mjs';
async function main(){
const cfg=JSON.parse(fs.readFileSync('store/testflight.json','utf8'));
const groupId='0bedf097-fcf7-40bc-a367-949b900c4883';
const response=await asc('GET',`/v1/builds?filter[app]=${cfg.appId}&filter[version]=${cfg.buildNumber}&include=preReleaseVersion&limit=20`);
const build=response.data.find(b=>response.included?.some(v=>v.type==='preReleaseVersions' && v.id===b.relationships.preReleaseVersion.data.id && v.attributes.version===cfg.marketingVersion));
if(!build || build.attributes.processingState!=='VALID'){
  console.log(JSON.stringify({ready:false,buildId:build?.id,processing:build?.attributes.processingState??'NOT_VISIBLE'}));
  process.exitCode=2;
  return;
}
assert.equal(build.attributes.expired,false);
const notes={
 'es-ES':'Primera beta interna de Cesta. Comprueba las listas guardadas y su activación en Inicio, el marcado de productos, el autocompletado, pegar texto para crear una lista, los productos genéricos, las fotos, el tamaño de los productos y los idiomas español e inglés. Revisa especialmente el teclado y los carruseles en iPhone. Puedes usar tus listas sin conexión. Compartir y sincronizar requieren la misma red local y el servidor de pruebas encendido en http://192.168.1.35:8787. Esta beta no dispone de sincronización por Internet.',
 'en-US':'First internal Cesta beta. Test saved lists and adding them to Home, checking off items, autocomplete, pasting text into a shopping list, generic products, photos, item sizes, and Spanish/English. Pay particular attention to the keyboard and horizontal scrolling on iPhone. Lists work offline. Sharing and syncing require the same local network and the test server running at http://192.168.1.35:8787. Internet synchronization is not available in this beta.'
};
const locs=(await asc('GET',`/v1/builds/${build.id}/betaBuildLocalizations`)).data;
for(const [locale,whatsNew] of Object.entries(notes)){
  const existing=locs.find(l=>l.attributes.locale===locale);
  if(existing) await asc('PATCH',`/v1/betaBuildLocalizations/${existing.id}`,{data:{type:'betaBuildLocalizations',id:existing.id,attributes:{whatsNew}}});
  else await asc('POST','/v1/betaBuildLocalizations',{data:{type:'betaBuildLocalizations',attributes:{locale,whatsNew},relationships:{build:{data:{type:'builds',id:build.id}}}}});
}
const assigned=await asc('GET',`/v1/betaGroups/${groupId}/relationships/builds`);
if(!assigned.data.some(b=>b.id===build.id)) await asc('POST',`/v1/betaGroups/${groupId}/relationships/builds`,{data:[{type:'builds',id:build.id}]});
const membership=await asc('GET',`/v1/betaGroups/${groupId}/relationships/builds`);
assert(membership.data.some(b=>b.id===build.id));
const detail=await asc('GET',`/v1/builds/${build.id}/buildBetaDetail`);
const localized=await asc('GET',`/v1/builds/${build.id}/betaBuildLocalizations`);
for(const [locale,whatsNew] of Object.entries(notes)) assert.equal(localized.data.find(l=>l.attributes.locale===locale)?.attributes.whatsNew,whatsNew);
const evidence={checkedAt:new Date().toISOString(),version:cfg.marketingVersion,buildNumber:cfg.buildNumber,build,groupId,membership:membership.data,betaDetail:detail.data,localizations:localized.data};
fs.writeFileSync('artifacts/TESTFLIGHT-VERIFICACION.json',JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({ready:true,buildId:build.id,processing:build.attributes.processingState,groupAssigned:true,betaDetail:detail.data.attributes}));
}
await main();
