import fs from 'node:fs';
import path from 'node:path';
import {isDeepStrictEqual as equal} from 'node:util';
import {digest,assessBoundedAssertion} from './bounded-assertions.mjs';
import {canonical} from './regulation-watch-core.mjs';

export const CURRENT_REFERENCE='source/bounded-assertions/reference-target.json';
export const CURRENT_ANCHORS='source/bounded-assertions/current-review-anchors.json';
// Data-only enrollment/review pointers and Git commit IDs are not runtime inputs.
// Validator implementation, fixtures, rules and source targets remain dependencies.
export const CURRENT_DEPENDENCY_FILES=Object.freeze({
 engine:['engine.js','outcome_policy.js','rulesets.js','move_legality.js','mc_review.js','legality.js'],
 data:['data.js','runtime_data.js','generated/pokemon_showdown_legal_data.js','generated/pokemon_showdown_species_weights.js','generated/champions_move_overrides.js','generated/champions_move_pools.js','generated/mc_review_reference.js','package-lock.json',CURRENT_REFERENCE],
 runner:['tools/bounded-runtime-capture.mjs','tools/showdown-reference.mjs','tools/prepare-mc-reference-candidate.mjs'],
 test:['tests/fixtures/bounded_runtime_cases.mjs'],
 checker:['tools/bounded-assertions.mjs','tools/bounded-register.mjs','tools/current-bounded-core.mjs','tools/regulation-watch-core.mjs']
});
export function currentDependencies(root,referenceFingerprint){
 const rows=Object.entries(CURRENT_DEPENDENCY_FILES).map(([role,files])=>{
  const hashes=Object.fromEntries(files.map(file=>[file,digest(fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n'))]));
  return [role,digest(canonical(hashes))];
 });
 return {...Object.fromEntries(rows),reference:referenceFingerprint};
}
const requireValue=(ok,message)=>{if(!ok)throw Error(message);};
const values=result=>Object.fromEntries(Object.entries(result.observations).map(([key,row])=>[key,row.value]));
const validTime=(value,now)=>typeof value==='string'&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString()===value&&Date.parse(value)<=now;
export function readCurrentBoundedEntry(root,entry,{load,read,now=Date.now()}){
 requireValue(entry.enrollment_kind==='current-capture-v1','Unknown current enrollment profile');
 requireValue(equal(entry.dependency_files,CURRENT_DEPENDENCY_FILES),'Current dependency inventory mismatch');
 const receipt=JSON.parse(load(entry.receipt));
 requireValue(receipt.assertion_id===entry.assertion_id&&receipt.case_id===entry.case_id,'Current assertion identity mismatch');
 requireValue(validTime(receipt.executed_at,now)&&entry.executed_at===receipt.executed_at,'Current capture timestamp mismatch');
 requireValue(equal(receipt.scope,entry.scope)&&entry.contract.sha256===receipt.contract.sha256&&entry.inputs.sha256===receipt.inputs.sha256,'Current scope/input/contract mismatch');
 const contract=JSON.parse(load(receipt.contract)),inputs=JSON.parse(load(receipt.inputs));
 const moveIds=[...new Set(inputs.actions.map(action=>String(action.move||'').toLowerCase().replace(/[^a-z0-9]/g,'')))].sort();
 requireValue(!moveIds.includes('')&&equal(moveIds,[...entry.move_ids].sort()),'Current move/action binding mismatch');
 const itemIds=[...new Set(inputs.teams.flatMap(team=>team.members||[]).map(mon=>String(mon.item||'').toLowerCase().replace(/[^a-z0-9]/g,'')).filter(Boolean))].sort();
 requireValue(equal(itemIds,[...(entry.item_ids||[])].sort()),'Current item/input binding mismatch');
 const target=JSON.parse(read(CURRENT_REFERENCE));
 requireValue(target.schema_version==='bounded-reference-target-v1'&&/^[a-f0-9]{40}$/.test(target.pin)&&/^[a-f0-9]{64}$/.test(target.compiled_fingerprint),'Current reference target invalid');
 const current={scope:entry.scope,contract_sha256:entry.contract.sha256,inputs_sha256:entry.inputs.sha256,dependencies:currentDependencies(root,target.compiled_fingerprint)};
 const captured=assessBoundedAssertion(receipt,{read,now,current:{...current,dependencies:receipt.dependencies}});
 requireValue(captured.status==='passed_declared_scope','Captured current comparison does not pass');
 const anchors=JSON.parse(read(CURRENT_ANCHORS));
 requireValue(anchors.schema_version==='current-bounded-review-anchors-v1'&&Array.isArray(anchors.reviews),'Current review anchor registry invalid');
 const keys=anchors.reviews.map(anchor=>anchor.path);
 requireValue(new Set(keys).size===keys.length,'Duplicate current review anchor');
 const anchor=anchors.reviews.find(value=>value.path===entry.independent_review?.path);
 requireValue(anchor&&anchor.sha256===entry.independent_review.sha256,'Unreviewed independent receipt');
 const review=JSON.parse(load(entry.independent_review));
 requireValue(review.schema_version==='current-bounded-independent-review-v1'&&validTime(review.reviewed_at,now)&&Date.parse(review.reviewed_at)>=Date.parse(receipt.executed_at),'Current independent review time/schema');
 requireValue(review.runtime_source_commit===entry.simulator_commit&&review.reference_pin===entry.reference_pin&&review.reference_fingerprint===entry.reference_fingerprint&&receipt.dependencies.reference===entry.reference_fingerprint,'Current independent source identity mismatch');
 requireValue(Array.isArray(review.assertions)&&new Set(review.assertions.map(row=>row.assertion_id)).size===review.assertions.length,'Duplicate current review assertion');
 const decision=review.assertions.find(row=>row.assertion_id===entry.assertion_id);
 requireValue(decision&&decision.status==='passed_declared_scope'&&decision.independent_execution===true&&decision.case_id===entry.case_id,'Missing independent case decision');
 for(const [field,ref]of Object.entries({receipt_sha256:entry.receipt,contract_sha256:receipt.contract,inputs_sha256:receipt.inputs,local_result_sha256:receipt.local_result,reference_result_sha256:receipt.reference_result}))requireValue(decision[field]===ref.sha256,'Independent case artifact mismatch: '+field);
 requireValue(equal(decision.scope,receipt.scope)&&equal(decision.dependencies,receipt.dependencies),'Independent case scope/dependency mismatch');
 requireValue(equal(decision.move_ids,entry.move_ids)&&equal(decision.item_ids||[],entry.item_ids||[]),'Independent entity binding mismatch');
 const local=JSON.parse(load(receipt.local_result)),reference=JSON.parse(load(receipt.reference_result));
 const expected=Object.fromEntries(contract.fields.map(field=>[field.field,field.expected]));
 requireValue(equal(decision.expected_observations,expected)&&equal(decision.local_observations,values(local))&&equal(decision.reference_observations,values(reference)),'Independent outcome mismatch');
 requireValue(Array.isArray(review.evidence)&&review.evidence.length===2&&new Set(review.evidence.map(ref=>ref.path)).size===2&&equal(review.evidence.map(ref=>ref.role).sort(),['execution_results','execution_script']),'Missing/duplicate independent execution evidence');
 review.evidence.forEach(load);
 const replay=JSON.parse(load(review.evidence.find(ref=>ref.role==='execution_results')));
 requireValue(replay.schema_version==='current-bounded-independent-execution-v1'&&replay.runtime_source_commit===review.runtime_source_commit&&replay.reference_pin===review.reference_pin&&replay.reference_fingerprint===review.reference_fingerprint,'Independent replay identity mismatch');
 requireValue(validTime(replay.executed_at,now)&&Date.parse(replay.executed_at)>=Date.parse(receipt.executed_at)&&Date.parse(review.reviewed_at)>=Date.parse(replay.executed_at),'Independent replay time mismatch');
 requireValue(Array.isArray(replay.cases)&&new Set(replay.cases.map(row=>row.assertion_id)).size===replay.cases.length,'Duplicate independent replay case');
 const replayCase=replay.cases.find(row=>row.assertion_id===entry.assertion_id);
 requireValue(replayCase&&replayCase.case_id===entry.case_id&&replayCase.inputs_sha256===receipt.inputs.sha256&&equal(replayCase.dependencies,receipt.dependencies),'Independent replay input/dependency mismatch');
 for(const field of ['expected_observations','local_observations','reference_observations'])requireValue(equal(replayCase[field],decision[field]),'Independent replay outcome mismatch: '+field);
 const status=assessBoundedAssertion(receipt,{read,current,now});
 return {assertion_id:entry.assertion_id,case_id:entry.case_id,move_ids:entry.move_ids,item_ids:entry.item_ids||[],status:status.status,
 scope:entry.scope,expected_contract:receipt.contract,inputs:receipt.inputs,receipt:entry.receipt,current_dependencies:current.dependencies,captured_dependencies:receipt.dependencies,
 reference_pin:entry.reference_pin,reference_fingerprint:entry.reference_fingerprint,executed_at:receipt.executed_at,execution_timestamp_status:'bound_local_capture_time',
 independent_audited_at:review.reviewed_at,simulator_commit:entry.simulator_commit,independent_target_commit:review.runtime_source_commit,
 historical_execution_status:captured.status,independent_receipts:[entry.independent_review,...review.evidence],independent_review:'per-assertion independent execution; authorship not cryptographically authenticated',
 adapter_review:'exact capture inputs and structured outcomes independently reviewed',errors:status.errors,stale:status.stale,mismatches:status.mismatches,
 implementation_coverage:'bounded_assertion_only',client_verification:'unknown',competitive_use:false,
 exclusions:['Whole-move correctness','Current-client parity','Official eligibility','Complete-set legality','PRNG sequence alignment']};
}
