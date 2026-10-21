import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const execute=(cmd,args)=>{const r=spawnSync(cmd,args,{encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);return r.stdout.trim();};
const candidate='dba5c2219dd6b437d3cb0b3f6b541cd1987f8cbd';
const mirror=path.resolve('../Cesta-iOS-build').replaceAll('\\','/');
const targets={phone:'39515832517','phone-medium':'39516687846',tablet:'39512770525'};
const results=[];
for(const [device,run] of Object.entries(targets)) {
 const info=JSON.parse(execute('gh',['run','view',run,'--repo','Krazel/cesta-ios-build','--json','headSha,status,conclusion,jobs']));
 const job=info.jobs.find(j=>j.name===`native (${device})`);assert.equal(job?.conclusion,'success');
 const changed=execute('git',['-c',`safe.directory=${mirror}`,'-C',mirror,'diff','--name-only',candidate,info.headSha]).split(/\r?\n/).filter(Boolean);
 assert(changed.every(p=>['tests/native/CestaUITests.swift','.github/workflows/app-review-qa.yml','scripts/run-native-qa.mjs'].includes(p)),'QA and candidate runtime sources must match');
 results.push({device,run,commit:info.headSha,jobConclusion:job.conclusion,onlyTestAndWorkflowDifferences:changed,runtimeEquivalent:true});
}
const evidence={candidateCommit:candidate,results,checkedAt:new Date().toISOString()};
fs.writeFileSync('artifacts/app-review-20261020/native-source-equivalence.json',JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence));
