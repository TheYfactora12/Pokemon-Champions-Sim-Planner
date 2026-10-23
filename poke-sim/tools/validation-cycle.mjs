import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {captureCurrent,caseCatalog} from './bounded-runtime-capture.mjs';
import {enrollCurrent} from './enroll-current-bounded.mjs';
import {readBoundedRegister} from './bounded-register.mjs';
import {exportBoundedMoveAssertions} from './move-register.mjs';
import {digest} from './bounded-assertions.mjs';
import {canonical} from './regulation-watch-core.mjs';

const json=value=>JSON.stringify(value,null,2)+'\n';
const ATTEMPTS='source/bounded-assertions/attempts.json';
export function readAttempts(root){
 if(!fs.existsSync(path.join(root,ATTEMPTS)))return [];
 const index=JSON.parse(fs.readFileSync(path.join(root,ATTEMPTS)));assert.equal(index.schema_version,'validation-attempt-index-v1');
 const seen=new Set();return index.records.map(ref=>{
  assert(!path.isAbsolute(ref.path)&&!ref.path.split(/[\\/]/).includes('..'),'Unsafe attempt path');
  const bytes=fs.readFileSync(path.join(root,ref.path));assert.equal(digest(bytes),ref.sha256,'Attempt evidence mismatch');
  const row=JSON.parse(bytes);assert.equal(row.schema_version,'validation-attempt-v1');assert(!seen.has(row.cycle),'Duplicate attempt');seen.add(row.cycle);
  assert(['capture_blocked','awaiting_independent_review'].includes(row.status));assert(/^[a-f0-9]{40}$/.test(row.simulator_commit));
  assert(Number.isFinite(Date.parse(row.started_at))&&Date.parse(row.started_at)<=Date.parse(row.finished_at)&&Date.parse(row.finished_at)<=Date.now(),'Attempt timestamp invalid');
  assert.equal(new Set(row.cases.map(c=>c.case_id)).size,row.cases.length);assert.equal(row.cases.length,caseCatalog().length);
  for(const c of row.cases){const spec=caseCatalog().find(s=>s.case_id===c.case_id);assert(spec);assert.deepEqual(c.scope,spec.scope);}
  if(row.capture_index){const capture=fs.readFileSync(path.join(root,row.capture_index.path));assert.equal(digest(capture),row.capture_index.sha256);const entries=JSON.parse(capture).entries;assert.deepEqual(entries.map(e=>e.assertion_id),row.cases.map(c=>c.assertion_id));}
  return {...row,evidence:ref};
 });
}
function recordAttempt(root,record){
 const name='source/bounded-assertions/cycles/'+record.cycle+'/attempt.json',content=json(record);immutable(path.join(root,name),content);
 const index=fs.existsSync(path.join(root,ATTEMPTS))?JSON.parse(fs.readFileSync(path.join(root,ATTEMPTS))):{schema_version:'validation-attempt-index-v1',records:[]};
 assert(!index.records.some(ref=>ref.path===name),'Attempt already recorded');index.records.push({path:name,sha256:digest(content)});fs.writeFileSync(path.join(root,ATTEMPTS),json(index));
}
function immutable(file,content){fs.mkdirSync(path.dirname(file),{recursive:true});if(fs.existsSync(file))assert.equal(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'),content.replace(/\r\n/g,'\n'),'Immutable validation history differs');else fs.writeFileSync(file,content);}
export function stageValidation(root,upstream,commit,cycle){
 assert(/^[a-z0-9][a-z0-9-]{2,70}$/.test(cycle),'Unique lower-case validation cycle required');
 const prefix='source/bounded-assertions/cycles/'+cycle;
 assert(!fs.existsSync(path.join(root,prefix)),'Validation cycle already exists; preserve history');
 const version=cycle.match(/-v([1-9][0-9]*)$/)?.[1];assert(version,'Cycle must end in a new -vN assertion version');
 const catalog=caseCatalog().map(row=>({...row,assertion_id:row.case_id+'.current-runtime.v'+version}));
 const enrolled=JSON.parse(fs.readFileSync(path.join(root,'source/bounded-assertions/index.json'))).assertions;
 assert(catalog.every(row=>!enrolled.some(prior=>prior.assertion_id===row.assertion_id)),'Assertion version already enrolled');
 assert(/^[a-f0-9]{40}$/.test(commit),'Exact runtime commit required');const started_at=new Date().toISOString();
 const attempt={schema_version:'validation-attempt-v1',cycle,simulator_commit:commit,started_at,cases:catalog.map(({case_id,assertion_id,scope})=>({case_id,assertion_id,scope}))};
 let capture;try{capture=captureCurrent(root,upstream,{prefix,catalog,runtimeSourceCommit:commit});}catch(error){recordAttempt(root,{...attempt,finished_at:new Date().toISOString(),status:'capture_blocked',error:String(error)});throw error;}
 for(const [name,bytes]of capture.files)immutable(path.join(root,name),bytes.toString());
 const index=path.join(root,prefix,'capture-index.json');immutable(index,json({schema_version:'bounded-validation-cycle-v1',cycle,entries:capture.entries,provenance:capture.provenance}));
 recordAttempt(root,{...attempt,finished_at:new Date().toISOString(),status:'awaiting_independent_review',capture_index:{path:prefix+'/capture-index.json',sha256:digest(fs.readFileSync(index))}});
 return {cycle,capture_index:index,status:'awaiting_independent_review',cases:capture.entries.length};
}
export function trackerView(rows,attempts=[]){
 const history=rows.map(row=>{
  assert(['passed_declared_scope','stale','blocked','failed'].includes(row.status),'Unknown validation result');
  const result=row.status==='passed_declared_scope'?'pass':row.status;
  assert(result!=='pass'||(row.executed_at&&row.independent_audited_at&&row.independent_receipts?.length),'Pass requires dated execution and review');
  return {scope_key:digest(canonical(row.scope)),case_id:row.case_id,assertion_id:row.assertion_id,result,checked:result==='pass',latest_validation_at:row.executed_at,reviewed_at:row.independent_audited_at,simulator_commit:row.simulator_commit,source_revision:row.reference_pin,reference_fingerprint:row.reference_fingerprint,regulation_id:row.scope.regulation_id,client_version:row.scope.client_version,format:row.scope.format,boundaries:row.scope.boundaries,receipt:row.receipt,review_evidence:row.independent_receipts,stale_dependencies:row.stale,blockers:[...(row.errors||[]),...(row.mismatches||[])],client_verified:false,competitive_use:false};
 });
 for(const attempt of attempts)for(const c of attempt.cases){
  if(rows.some(row=>row.assertion_id===c.assertion_id)){assert.equal(attempt.status,'awaiting_independent_review','Blocked capture cannot be enrolled');continue;}
  history.push({scope_key:digest(canonical(c.scope)),case_id:c.case_id,assertion_id:c.assertion_id,result:'blocked',checked:false,latest_validation_at:attempt.started_at,attempt_finished_at:attempt.finished_at,reviewed_at:null,simulator_commit:attempt.simulator_commit,source_revision:null,regulation_id:c.scope.regulation_id,client_version:c.scope.client_version,format:c.scope.format,boundaries:c.scope.boundaries,receipt:attempt.evidence,review_evidence:[],blockers:[attempt.status,attempt.error||'Independent review and enrollment pending'],client_verified:false,competitive_use:false});
 }
 const grouped=new Map();for(const row of history){const key=row.case_id+':'+row.scope_key,prior=grouped.get(key);if(!prior||String(row.latest_validation_at||'')>String(prior.latest_validation_at||''))grouped.set(key,row);else if(row.latest_validation_at===prior.latest_validation_at)assert.equal(row.assertion_id,prior.assertion_id,'Ambiguous latest validation');}
 return {schema_version:'bounded-validation-tracker-v1',current:[...grouped.values()].sort((a,b)=>a.case_id.localeCompare(b.case_id)),history:history.sort((a,b)=>a.assertion_id.localeCompare(b.assertion_id)),limitations:['Reference-backed bounded assertions only','No automatic workbook refresh','No merge or deployment authorization','Missing evidence stops export; failed captures cannot be enrolled as passes']};
}
const csv=rows=>{const keys=[...new Set(rows.flatMap(Object.keys))];const quote=v=>'"'+String(v===null||v===undefined?'':typeof v==='object'?JSON.stringify(v):v).replaceAll('"','""')+'"';return [keys,...rows.map(r=>keys.map(k=>r[k]))].map(r=>r.map(quote).join(',')).join('\n')+'\n';};
export function refreshTracker(root,{check=false}={}){
 const bounded=exportBoundedMoveAssertions(root,{check}),view=trackerView(readBoundedRegister(root),readAttempts(root));
 const identity=digest(canonical(view)),directory=path.join(root,'reports/move-register/validation',identity);
 const outputs={'current.json':json(view.current),'current.csv':csv(view.current),'history.json':json(view.history),'history.csv':csv(view.history),'manifest.json':json({identity,bounded_identity:bounded.identity,...view,history:undefined,current:undefined})};
 for(const[name,content]of Object.entries(outputs)){const file=path.join(directory,name);if(check)assert(fs.existsSync(file),'Missing generated tracker export');immutable(file,content);}
 const pointer=json({identity,path:identity+'/current.json',history:identity+'/history.json',current_cases:view.current.length,current_passes:view.current.filter(r=>r.checked).length,history_rows:view.history.length});const latest=path.join(root,'reports/move-register/validation/latest.json');
 if(check)assert.equal(fs.readFileSync(latest,'utf8').replace(/\r\n/g,'\n'),pointer,'Stale tracker export');else fs.writeFileSync(latest,pointer);
 return JSON.parse(pointer);
}
export function finishValidation(root,capture,review){const enrollment=enrollCurrent(root,capture,review);return {enrollment,export:refreshTracker(root)};}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [action,root,...args]=process.argv.slice(2);assert(root,'Usage: validation-cycle.mjs stage ROOT UPSTREAM COMMIT CYCLE | enroll ROOT CAPTURE REVIEW | export ROOT [--check]');
 const result=action==='stage'?stageValidation(path.resolve(root),path.resolve(args[0]),args[1],args[2]):action==='enroll'?finishValidation(path.resolve(root),path.resolve(args[0]),path.resolve(args[1])):action==='export'?refreshTracker(path.resolve(root),{check:args.includes('--check')}):assert.fail('Unknown validation action');console.log(json(result));
}
