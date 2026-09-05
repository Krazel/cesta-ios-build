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
'es-ES':'Listas personales locales por defecto. Comparte una lista o pulsa Usar en mis dispositivos para sincronizarla por Internet, mediante cambios y sin consultas periódicas. Prueba una invitación entre iPhone y la web, modificaciones simultáneas, modo sin conexión y volver a guardar una lista solo en el dispositivo. Las listas de la versión LAN anterior se conservan como copias locales y necesitan invitaciones nuevas. Alojamiento gratuito con cuotas; no hay sincronización automática de listas personales.',
'en-US':'Personal lists stay local by default. Share a list or select Use on my devices to synchronize it over the internet with event updates and no polling. Test an invitation between iPhone and the website, concurrent edits, offline recovery and keeping a list only on the device again. Previous LAN lists remain as local copies and need new invitations. Free hosting has quotas; personal lists never upload automatically.'
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
