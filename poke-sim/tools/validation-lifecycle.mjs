import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {isUtf8} from 'node:buffer';
import {CURRENT_DEPENDENCY_FILES} from './current-bounded-core.mjs';import {digest} from './bounded-assertions.mjs';import {canonical} from './regulation-watch-core.mjs';
export const LIFECYCLE_FILES=[...new Set(Object.values(CURRENT_DEPENDENCY_FILES).flat()),'tools/validation-cycle.mjs','tools/validation-lifecycle.mjs','tools/enroll-current-bounded.mjs','tests/validation_cycle_tests.mjs','tools/record-validation-lifecycle.mjs','../.github/workflows/ci.yml'];
function legacySource(root,commit){return digest(canonical(Object.fromEntries(LIFECYCLE_FILES.map(file=>{let bytes;if(commit){try{bytes=execFileSync('git',['show',commit+':'+path.posix.normalize('poke-sim/'+file)],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:32*1024*1024});}catch{bytes=null;}}else bytes=fs.existsSync(path.join(root,file))?fs.readFileSync(path.join(root,file),'utf8'):null;return [file,bytes===null?null:digest(bytes.replace(/\r\n/g,'\n'))];}))));}
// Aggregate inputs are discovered, not a hand-picked list of six case owners.
// Receipt/output history is verified by its own content-addressed gates, and is
// excluded here so recording a result cannot change the source it describes.
export function isLifecycleInput(file){
 // audit.js writes this ignored result; it is not a runner/fixture input.
 if(file==='tests/audit_matrix.json')return false;
 return LIFECYCLE_FILES.includes(file)||
  /^(tests|tools|db|generated)\//.test(file)&&!/\.(md|log)$/i.test(file)||
  /^[^/]+\.(js|mjs|cjs|json|py|sh|html|css)$/.test(file)||
  /^source\//.test(file)&&!/^source\/(bounded-assertions|validation-lifecycle)\//.test(file)&&!/\.md$/i.test(file)||
  /^\.\.\/\.github\/workflows\//.test(file);
}
const inputDigest=(file,bytes)=>digest(/\.(js|mjs|cjs|json|py|sh|html|css|sql|ts|txt|csv|yml|yaml|toml)$/i.test(file)?bytes.toString('utf8').replace(/\r\n/g,'\n'):bytes);
const committedSources=new Map();
function lifecycleSourceV2(root,commit,version='aggregate-inputs-v2'){
 if(version==='selected-inputs-v1')return legacySource(root,commit);
 assert.equal(version,'aggregate-inputs-v2','Unknown lifecycle fingerprint version');
 const cacheKey=root+':'+commit;
 if(commit&&committedSources.has(cacheKey))return committedSources.get(cacheKey);
 let entries;
 if(commit){
  const listing=execFileSync('git',['ls-tree','-r','-z',commit,'--','poke-sim','.github/workflows'],{cwd:path.resolve(root,'..'),encoding:'utf8',maxBuffer:16*1024*1024});
  const rows=listing.split('\0').filter(Boolean).map(row=>{const [meta,name]=row.split('\t');return {id:meta.split(' ')[2],file:name.startsWith('poke-sim/')?name.slice(9):'../'+name};}).filter(row=>isLifecycleInput(row.file));
  const bytes=execFileSync('git',['cat-file','--batch'],{cwd:root,input:rows.map(row=>row.id+'\n').join(''),maxBuffer:256*1024*1024});let offset=0;
  entries=rows.map(row=>{const end=bytes.indexOf(10,offset),header=bytes.subarray(offset,end).toString();assert(/ blob \d+$/.test(header),'Missing lifecycle blob');const size=Number(header.split(' ')[2]);offset=end+1;const content=bytes.subarray(offset,offset+size);offset+=size+1;return [row.file,inputDigest(row.file,content)];});
 }else{
  const files=[];const walk=(directory,prefix)=>{if(!fs.existsSync(directory))return;for(const item of fs.readdirSync(directory,{withFileTypes:true})){const file=prefix+item.name;if(item.isDirectory()){if(['tests','tools','db','generated','source'].includes(file)||prefix)walk(path.join(directory,item.name),file+'/');}else if(isLifecycleInput(file))files.push(file);}};
  walk(root,'');walk(path.resolve(root,'../.github/workflows'),'../.github/workflows/');
  entries=files.map(file=>[file,inputDigest(file,fs.readFileSync(path.join(root,file)))]);
 }
 entries.sort(([a],[b])=>a.localeCompare(b));const result=digest(canonical(Object.fromEntries(entries)));
 if(commit)committedSources.set(cacheKey,result);return result;
}
// Whole-suite claims bind the repository, including asserted documentation and
// arbitrary fixture/config extensions. Only this ledger's own facts and rendered
// view are outside the tested input tree; their hashes and semantics are checked
// by refreshLifecycle. Bounded mechanics retain CURRENT_DEPENDENCY_FILES instead.
export const isAggregateLedgerOutput=file=>file.startsWith('poke-sim/source/validation-lifecycle/')||file==='poke-sim/reports/move-register/validation/lifecycle.json';
// Extensionless configuration is text too; invalid UTF-8/NUL-bearing fixtures
// retain raw bytes rather than collapsing through replacement characters.
const repoDigest=(file,bytes)=>digest(!/\.(bin|png|gif|jpe?g|webp|ico|pdf|zip|gz|woff2?|ttf|mp[34]|wasm)$/i.test(file)&&isUtf8(bytes)&&!bytes.includes(0)?bytes.toString('utf8').replace(/\r\n/g,'\n'):bytes);
export function lifecycleSource(root,commit,version='repository-inputs-v3'){
 if(version!=='repository-inputs-v3')return lifecycleSourceV2(root,commit,version);
 const repo=path.resolve(root,'..'),key='v3:'+repo+':'+commit;
 if(commit&&committedSources.has(key))return committedSources.get(key);
 let entries=[];
 if(commit){
  const listing=execFileSync('git',['ls-tree','-r','-l','-z',commit],{cwd:repo,encoding:'utf8',maxBuffer:16*1024*1024});
  const rows=listing.split('\0').filter(Boolean).map(row=>{const [meta,file]=row.split('\t'),[mode,type,id,size]=meta.trim().split(/\s+/);assert.equal(type,'blob','Aggregate tree contains unsupported submodule');return {file,mode,id,size:Number(size)};}).filter(row=>!isAggregateLedgerOutput(row.file));
  // Bound memory independently of total repository/history size.
  for(let start=0;start<rows.length;){let end=start,total=0;while(end<rows.length&&(end===start||total+rows[end].size<128*1024*1024)){total+=rows[end++].size;}
   const batch=rows.slice(start,end),bytes=execFileSync('git',['cat-file','--batch'],{cwd:repo,input:batch.map(row=>row.id+'\n').join(''),maxBuffer:Math.max(256*1024*1024,total+batch.length*256)});let offset=0;
   for(const row of batch){const line=bytes.indexOf(10,offset),header=bytes.subarray(offset,line).toString();assert(/ blob \d+$/.test(header),'Missing aggregate input');const size=Number(header.split(' ')[2]);offset=line+1;entries.push([row.file,{mode:row.mode,sha256:repoDigest(row.file,bytes.subarray(offset,offset+size))}]);offset+=size+1;}start=end;
  }
 }else{
  let files,modes={};
  if(fs.existsSync(path.join(repo,'.git'))){
   files=execFileSync('git',['ls-files','-z','--cached','--others','--exclude-standard'],{cwd:repo,encoding:'utf8',maxBuffer:16*1024*1024}).split('\0').filter(Boolean);
   const index=execFileSync('git',['ls-files','-s','-z'],{cwd:repo,encoding:'utf8',maxBuffer:16*1024*1024});for(const row of index.split('\0').filter(Boolean)){const[meta,file]=row.split('\t');modes[file]=meta.split(' ')[0];}
  }else{files=[];const walk=(directory,prefix='')=>{for(const item of fs.readdirSync(directory,{withFileTypes:true})){if(['.git','node_modules'].includes(item.name))continue;const file=prefix+item.name;if(item.isDirectory())walk(path.join(directory,item.name),file+'/');else files.push(file);}};walk(repo);}
  entries=[...new Set(files)].filter(file=>!isAggregateLedgerOutput(file)).map(file=>{const target=path.join(repo,file);if(!fs.existsSync(target))return[file,null];const link=fs.lstatSync(target).isSymbolicLink();return[file,{mode:link?'120000':modes[file]||'100644',sha256:repoDigest(file,link?Buffer.from(fs.readlinkSync(target)):fs.readFileSync(target))}];});
 }
 entries.sort(([a],[b])=>a.localeCompare(b));const result=digest(canonical(Object.fromEntries(entries)));if(commit)committedSources.set(key,result);return result;
}
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
export function localExecutionDates(local){
 const start=local.started_at,end=local.completed_at;
 if(start===undefined&&end===undefined)return {executed_at:null,date_limitation:'Retained aggregate logs lack execution timestamp; observation time is not execution time'};
 const valid=value=>typeof value==='string'&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString()===value;
 assert(valid(start)&&valid(end)&&Date.parse(start)<=Date.parse(end)&&Date.parse(end)<=Date.now(),'Invalid local execution timestamps');
 return {executed_at:end,started_at:start,completed_at:end,date_limitation:null};
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
 if(['aggregate-inputs-v2','repository-inputs-v3'].includes(facts.fingerprint_version))for(const[key,value]of Object.entries(localExecutionDates(local)))assert.equal(facts.local[key],value,'Local execution date differs from retained evidence');
 const review=JSON.parse(fs.readFileSync(path.join(root,facts.review.evidence.path)));assert.equal(facts.review.reviewed_at,review.reviewed_at);assert(review.assertions?.length>0&&review.assertions.every(r=>r.status==='passed_declared_scope'&&r.independent_execution===true));
 assert.equal(lifecycleSource(root,facts.candidate_commit,facts.fingerprint_version||'selected-inputs-v1'),facts.source_digest,'Candidate source binding mismatch');
 const view=lifecycleView(facts,lifecycleSource(root),candidateEvidenceBindings(root,facts,local,review));const content=JSON.stringify(view,null,2)+'\n',file=path.join(root,'reports/move-register/validation/lifecycle.json');fs.mkdirSync(path.dirname(file),{recursive:true});if(check)assert.equal(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'),content,'Stale lifecycle export');else fs.writeFileSync(file,content);return view;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const[root,flag]=process.argv.slice(2);console.log(JSON.stringify(refreshLifecycle(path.resolve(root),{check:flag==='--check'})));}
