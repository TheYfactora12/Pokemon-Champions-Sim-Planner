import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {CURRENT_DEPENDENCY_FILES} from './current-bounded-core.mjs';import {digest} from './bounded-assertions.mjs';import {canonical} from './regulation-watch-core.mjs';
export const LIFECYCLE_FILES=[...new Set(Object.values(CURRENT_DEPENDENCY_FILES).flat()),'tools/validation-cycle.mjs','tools/validation-lifecycle.mjs','tools/enroll-current-bounded.mjs','tests/validation_cycle_tests.mjs','tools/record-validation-lifecycle.mjs','../.github/workflows/ci.yml'];
export function lifecycleSource(root,commit){return digest(canonical(Object.fromEntries(LIFECYCLE_FILES.map(file=>{let bytes;if(commit){try{bytes=execFileSync('git',['show',commit+':'+path.posix.normalize('poke-sim/'+file)],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:32*1024*1024});}catch{bytes=null;}}else bytes=fs.existsSync(path.join(root,file))?fs.readFileSync(path.join(root,file),'utf8'):null;return [file,bytes===null?null:digest(bytes.replace(/\r\n/g,'\n'))];}))));}
export function candidateEvidenceBindings(root,facts,local,review){
 const localCommit=local.source_commit||local.fixture_commit||local.candidate_runtime_commit;
 const localBound=/^[a-f0-9]{40}$/.test(localCommit||'')&&lifecycleSource(root,localCommit)===facts.source_digest;
 const expected={};let available=true;
 for(const [role,files]of Object.entries(CURRENT_DEPENDENCY_FILES)){
  const hashes={};for(const file of files){try{const bytes=execFileSync('git',['show',facts.candidate_commit+':poke-sim/'+file],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:32*1024*1024});hashes[file]=digest(bytes.replace(/\r\n/g,'\n'));}catch{available=false;}}
  expected[role]=digest(canonical(hashes));
 }
 expected.reference=review.reference_fingerprint;
 const reviewBound=available&&review.assertions?.length>0&&review.assertions.every(row=>canonical(row.dependencies)===canonical(expected));
 return {localBound,reviewBound};
}
export function lifecycleView(facts,currentSource,{localBound=false,reviewBound=false}={}){
 assert.equal(facts.schema_version,'validation-lifecycle-facts-v1');assert(/^[a-f0-9]{40}$/.test(facts.candidate_commit));assert(/^[a-f0-9]{64}$/.test(facts.source_digest));
 assert.equal(facts.publication.commit,facts.candidate_commit,'Pushed commit mismatch');assert.equal(facts.hosted.headSha,facts.candidate_commit,'Hosted commit mismatch');
 assert(facts.hosted.url?.includes('/actions/runs/'));assert(facts.publication.url?.includes('/pull/'));
 const success=facts.hosted.status==='completed'&&facts.hosted.conclusion==='success';
 const required=['Syntax Check','Test Suite','Detect Engine/Data Changes','Accuracy methodology and readiness report','Candidate browser replay evidence'];
 const jobs=facts.hosted.jobs||[];if(success){for(const name of required)assert(jobs.some(j=>j.name===name&&j.conclusion==='success'),'Missing successful hosted check: '+name);assert(jobs.some(j=>j.name.startsWith('Battle Audit')&&j.conclusion==='success'),'Missing battle audit');}
 assert.equal(facts.local.status,'passed');assert(facts.local.fast_files>0&&facts.local.offline_db_files>0&&facts.local.failures===0);assert(facts.local.evidence);
 assert(facts.review.evidence&&facts.review.reviewed_at);assert.equal(facts.review.status,'passed_bounded_scope');
 assert.equal(facts.merge.status,'not_performed');assert.equal(facts.deployment.status,'not_performed');
 const same=currentSource===facts.source_digest;
 return {schema_version:'validation-lifecycle-view-v1',candidate_commit:facts.candidate_commit,observed_at:facts.observed_at,scope:facts.scope,implementation:{status:'implemented',source_digest:facts.source_digest},local_test:{...facts.local,status:localBound?facts.local.status:'stale',candidate_source_bound:localBound},independent_verification:{...facts.review,status:reviewBound?facts.review.status:'stale',candidate_source_bound:reviewBound},remote_publication:{...facts.publication,status:'pushed'},hosted_checks:{status:success?'passed':facts.hosted.conclusion||facts.hosted.status,run_url:facts.hosted.url,commit:facts.hosted.headSha,started_at:facts.hosted.createdAt,updated_at:facts.hosted.updatedAt},merge:facts.merge,deployment:facts.deployment,current_source_matches:same,current_workflow_state:same?(success&&localBound&&reviewBound?'validated_draft_checkpoint':'awaiting_bound_evidence_or_hosted_checks'):'changed_since_checkpoint',completed:success&&same&&localBound&&reviewBound,competitive_release_ready:false,next_blocker:!same?'Rerun/review, refresh tracker, push changed source and verify exact-head CI':!localBound||!reviewBound?'Local/independent evidence does not bind this candidate source':success?'Open mechanics/client/regulation release gates remain':'Hosted checks not terminal successful'};
}
export function refreshLifecycle(root,{check=false}={}){
 const pointer='source/validation-lifecycle/latest.json';assert(fs.existsSync(path.join(root,pointer)),'Missing lifecycle source facts');
 const ref=JSON.parse(fs.readFileSync(path.join(root,pointer)));assert(!path.isAbsolute(ref.path)&&!ref.path.split(/[\\/]/).includes('..'));
 const raw=fs.readFileSync(path.join(root,ref.path));assert.equal(digest(raw),ref.sha256,'Lifecycle fact hash mismatch');const facts=JSON.parse(raw);
 for(const item of [facts.local.evidence,facts.review.evidence,facts.publication.evidence,facts.hosted.evidence]){assert(item&&!path.isAbsolute(item.path)&&!item.path.split(/[\\/]/).includes('..'),'Missing lifecycle evidence');assert.equal(digest(fs.readFileSync(path.join(root,item.path))),item.sha256,'Lifecycle evidence mismatch');}
 const hosted=JSON.parse(fs.readFileSync(path.join(root,facts.hosted.evidence.path)));for(const k of ['headSha','status','conclusion','url','jobs','createdAt','updatedAt'])assert.deepEqual(facts.hosted[k],hosted[k],'Hosted fact differs from evidence: '+k);
 const remote=JSON.parse(fs.readFileSync(path.join(root,facts.publication.evidence.path)));assert.equal(remote.headRefOid,facts.candidate_commit,'Remote evidence head mismatch');assert.equal(remote.url,facts.publication.url);assert.equal(remote.isDraft,true);assert.equal(remote.state,'OPEN');
 const local=JSON.parse(fs.readFileSync(path.join(root,facts.local.evidence.path)));assert.deepEqual({fast_files:facts.local.fast_files,offline_db_files:facts.local.offline_db_files,failures:facts.local.failures},local.project);
 const review=JSON.parse(fs.readFileSync(path.join(root,facts.review.evidence.path)));assert.equal(facts.review.reviewed_at,review.reviewed_at);assert(review.assertions?.length>0&&review.assertions.every(r=>r.status==='passed_declared_scope'&&r.independent_execution===true));
 assert.equal(lifecycleSource(root,facts.candidate_commit),facts.source_digest,'Candidate source binding mismatch');
 const view=lifecycleView(facts,lifecycleSource(root),candidateEvidenceBindings(root,facts,local,review));const content=JSON.stringify(view,null,2)+'\n',file=path.join(root,'reports/move-register/validation/lifecycle.json');fs.mkdirSync(path.dirname(file),{recursive:true});if(check)assert.equal(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'),content,'Stale lifecycle export');else fs.writeFileSync(file,content);return view;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const[root,flag]=process.argv.slice(2);console.log(JSON.stringify(refreshLifecycle(path.resolve(root),{check:flag==='--check'})));}
