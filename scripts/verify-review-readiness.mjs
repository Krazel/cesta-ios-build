// Cross-check actual Apple receipts; do not turn simulator evidence into physical QA.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const folder='artifacts/app-review-20261020';
const read=n=>JSON.parse(fs.readFileSync(`${folder}/${n}.json`,'utf8'));
const apple=read('apple-audit-summary'),candidate=read('candidate-apple'),review=read('unsubmitted-review-draft');
const policy=read('privacy-ump-public'),inventory=read('candidate-privacy-data');
const sources=read('native-source-equivalence'),commercial=read('commercial-settings');
const cfg=JSON.parse(fs.readFileSync('store/app-review.json','utf8'));
assert.equal(apple.draft.version,cfg.marketingVersion);
assert.equal(apple.selectedBuild,candidate.build.id);
assert.equal(candidate.build.attributes.processingState,'VALID');
assert.equal(candidate.buildNumber,cfg.buildNumber);
assert.equal(candidate.delivery.attributes.state.state,'COMPLETE');
assert.equal(candidate.draft.attributes.releaseType,'MANUAL');
assert.equal(review.draft.attributes.state,'READY_FOR_REVIEW');
assert.equal(review.submitted,false);assert(!review.draft.attributes.submittedDate);
assert.equal(review.items.length,8);assert.equal(review.targets.length,8);
assert.equal(apple.products.length,6);
assert(apple.products.every(p=>p.hasReviewScreenshot&&['READY_TO_SUBMIT','READY_FOR_REVIEW'].includes(p.state)));
assert.equal(apple.screenshots.length,6);assert(apple.screenshots.every(s=>s.count===4));
assert.equal(apple.reviewContactComplete,true);
assert.equal(commercial.territories.filter(t=>t.attributes.available).length,174);
assert.equal(commercial.availability.attributes.availableInNewTerritories,false);
assert(commercial.manualPrices.included.some(p=>p.type==='appPricePoints'&&Number(p.attributes.customerPrice)===0));
assert(policy.publicVerified);
assert.equal(crypto.createHash('sha256').update(fs.readFileSync('store/privacy-1.5.1.html')).digest('hex'),policy.sha256);
assert.equal(inventory.manifestCount,13);assert.equal(inventory.uniqueTypes,12);
const tracking=Object.entries(inventory.types).filter(([,v])=>v.tracking).map(([key])=>key);
assert.deepEqual(tracking,['NSPrivacyCollectedDataTypeDeviceID']);
const qaRuns={phone:'39515832517','phone-medium':'39516687846',tablet:'39512770525'};
const qa=Object.keys(qaRuns).flatMap(device=>JSON.parse(fs.readFileSync(`artifacts/native-qa-${qaRuns[device]}-${device}/results.json`,'utf8')));
assert.equal(qa.length,6);assert(qa.every(t=>t.ok));
const provenance=JSON.parse(fs.readFileSync('store/screenshots/1.5.1/provenance.json','utf8'));
assert.equal(provenance.provenance.length,25);
assert(provenance.provenance.every(p=>p.unchangedNativeCapture&&p.run===qaRuns[p.device]));
assert.equal(sources.results.length,3);assert(sources.results.every(s=>s.runtimeEquivalent));
assert(provenance.provenance.every(p=>sources.results.some(s=>s.device===p.device&&s.run===p.run&&s.commit===p.commit)));
const report={checkedAt:new Date().toISOString(),appId:cfg.appId,version:cfg.marketingVersion,build:cfg.buildNumber,
 candidateBuild:candidate.build.id,candidateCommit:sources.candidateCommit,
 ipaSHA256:inventory.ipaSHA256,reviewDraft:review.draft.id,reviewState:review.draft.attributes.state,reviewItems:review.items.length,
 submitted:false,releaseType:'MANUAL',galleryScreenshots:24,subscriptionProducts:6,privacyTypes:12,privacyManifestCount:13,freeDownload:true,availableTerritories:174,autoNewTerritories:false,
 privacyPolicySHA256:policy.sha256,nativeSimulatorQA:{runs:qaRuns,results:qa,storeKitLocalPurchasePersistenceExpiryRestore:true},
 physicalDeviceQA:false,physicalSandboxQA:false,googleAppApproved:false,lastDistributedBeta:'1.5(1) internal',
 pendingBeforeRealSubmission:['Physical iPhone: keyboard and consent including refusal','Physical Sandbox/TestFlight: purchase, cancellation, restore, offline and unavailable products','Native cross-network sharing and reconnect on physical device'],
 pendingAfterPublicListing:['Link and verify App Store listing in AdMob; verify app readiness and real banner delivery']};
fs.writeFileSync(`${folder}/readiness.json`,JSON.stringify(report,null,2));
fs.mkdirSync('store/release-evidence',{recursive:true});
fs.writeFileSync('store/release-evidence/1.5.1-build3.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
