import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { asc } from './asc-client.mjs';
const keys=path.resolve('../APIs/IOS');
process.env.ASC_KEY_ID=fs.readFileSync(path.join(keys,'Key ID.txt'),'utf8').trim();
process.env.ASC_ISSUER_ID=fs.readFileSync(path.join(keys,'Issuer ID.txt'),'utf8').trim();
process.env.ASC_PRIVATE_KEY_PATH=path.join(keys,'Coder Metadata App Manager.p8');
const cfg=JSON.parse(fs.readFileSync('store/app-review.json','utf8'));
assert.equal(cfg.appId,'6808982515');
const get=async endpoint=>(await asc('GET',endpoint)).data;
const response=await asc('GET',`/v1/builds?filter[app]=${cfg.appId}&filter[version]=${cfg.buildNumber}&include=preReleaseVersion&limit=100`);
const build=response.data.find(b=>response.included?.some(v=>v.type==='preReleaseVersions'&&v.id===b.relationships.preReleaseVersion.data.id&&v.attributes.version===cfg.marketingVersion));
const uploads=await get(`/v1/apps/${cfg.appId}/buildUploads?filter[cfBundleShortVersionString]=${cfg.marketingVersion}&filter[cfBundleVersion]=${cfg.buildNumber}`);
const versions=await get(`/v1/apps/${cfg.appId}/appStoreVersions`);
const draft=versions.find(v=>v.attributes.versionString===cfg.marketingVersion&&v.attributes.appStoreState==='PREPARE_FOR_SUBMISSION');
assert(draft,'Expected editable version; never alter a submitted version');
if(!build||build.attributes.processingState!=='VALID') {
  console.log(JSON.stringify({ready:false,processing:build?.attributes.processingState||'NOT_VISIBLE',uploads:uploads.map(u=>({id:u.id,state:u.attributes.state}))}));
  process.exit(2);
}
assert.equal(build.attributes.expired,false);
// buildUploads does not expose a build relationship. Match the exact uploaded
// marketing/build tuple already used to find the VALID pre-release build.
const matchingUploads=uploads.filter(u=>u.attributes.cfBundleShortVersionString===cfg.marketingVersion&&u.attributes.cfBundleVersion===cfg.buildNumber);
assert.equal(matchingUploads.length,1,'Expected one exact candidate delivery');
const delivery=matchingUploads[0];
assert.equal(delivery?.attributes.state.state,'COMPLETE');
assert.equal(delivery.attributes.state.errors?.length||0,0);
if(process.argv.includes('--select')) {
  const dir=process.argv[process.argv.indexOf('--select')+1];
  assert(dir,'Supply independently verified IPA directory');
  const verified=JSON.parse(fs.readFileSync(path.join(dir,'ipa-verification.json'),'utf8'));
  assert.equal(verified.version,cfg.marketingVersion);
  assert.equal(verified.build,cfg.buildNumber);
  assert(verified.codesignVerifiedInCI&&verified.zipCRCVerified&&verified.profileIdentityAndExpiryVerified);
  await asc('PATCH',`/v1/appStoreVersions/${draft.id}`,{data:{type:'appStoreVersions',id:draft.id,attributes:{releaseType:'MANUAL'},relationships:{build:{data:{type:'builds',id:build.id}}}}});
}
const selected=await get(`/v1/appStoreVersions/${draft.id}/build`);
const freshDraft=await get(`/v1/appStoreVersions/${draft.id}`);
const betaDetail=await get(`/v1/builds/${build.id}/buildBetaDetail`);
const groups=await get(`/v1/betaGroups?filter[builds]=${build.id}&limit=200`);
if(process.argv.includes('--select')) assert.equal(selected.id,build.id);
assert.equal(freshDraft.attributes.releaseType,'MANUAL');
const evidence={checkedAt:new Date().toISOString(),version:cfg.marketingVersion,buildNumber:cfg.buildNumber,build,delivery,draft:freshDraft,selectedBuild:selected?.id||null,betaDetail,betaGroups:groups.map(g=>({id:g.id,name:g.attributes.name,isInternalGroup:g.attributes.isInternalGroup})),submitted:false,physicalSandboxQA:false};
fs.writeFileSync('artifacts/app-review-20261020/candidate-apple.json',JSON.stringify(evidence,null,2));
console.log(JSON.stringify({ready:true,buildId:build.id,processing:build.attributes.processingState,delivery:delivery.attributes.state,selectedBuild:evidence.selectedBuild,state:freshDraft.attributes.appStoreState,internalState:betaDetail.attributes.internalBuildState,groups:evidence.betaGroups,submitted:false}));
