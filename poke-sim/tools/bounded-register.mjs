import fs from 'node:fs';
import path from 'node:path';
import {assessBoundedAssertion,digest} from './bounded-assertions.mjs';
import {canonical} from './regulation-watch-core.mjs';

export const INDEX='source/bounded-assertions/index.json';
// This enrollment adapts one retained audit. The anchor is a reviewed byte
// identity, not a verifier key or a claim of cryptographic authorship.
export const CORROBORATING_ROLES=Object.freeze({
 audit_manifest:{name:'focused-receipt.json',sha256:'351b3108e14adf3c08953447d516e79b96067b21e2debb03722d3e89129cf077'},
 report:{name:'FOCUSED_RETEST_146BA91.md',audit_path:'FOCUSED_RETEST_146BA91.md'},
 sampler_script:{name:'focused-buckets.mjs',audit_path:'focused-buckets.mjs'},
 sampler_grid:{name:'buckets.json',audit_path:'focused-retest-evidence/buckets.json'},
 execution_log:{name:'discrete.log',audit_path:'focused-retest-evidence/discrete.log'},
 reference_check:{name:'candidate-check.json',audit_path:'focused-retest-evidence/candidate-check.json'}
});
export function readCorroboratingEvidence(refs,load){
 if(!Array.isArray(refs)||refs.length!==Object.keys(CORROBORATING_ROLES).length)throw Error('Missing independent receipt roles');
 const roles=new Map(),paths=new Set();
 for(const ref of refs){
  const expected=CORROBORATING_ROLES[ref.role];
  if(!expected||roles.has(ref.role)||paths.has(ref.path)||path.basename(ref.path)!==expected.name)throw Error('Duplicate or invalid independent receipt role');
  roles.set(ref.role,{ref,bytes:load(ref)});paths.add(ref.path);
 }
 const anchor=roles.get('audit_manifest');
 if(digest(anchor.bytes)!==CORROBORATING_ROLES.audit_manifest.sha256)throw Error('Independent audit anchor mismatch');
 const audit=JSON.parse(anchor.bytes);
 for(const [role,expected]of Object.entries(CORROBORATING_ROLES)){
  if(role==='audit_manifest')continue;
  const {ref,bytes}=roles.get(role);
  if(audit.evidence_hashes?.[expected.audit_path]!==ref.sha256||digest(bytes)!==audit.evidence_hashes[expected.audit_path])throw Error('Corroborating evidence differs from original audit: '+role);
 }
 return {audit,reference:JSON.parse(roles.get('reference_check').bytes)};
}
export const DEPENDENCY_FILES=Object.freeze({
 engine:['engine.js','outcome_policy.js'],
 data:['data.js','runtime_data.js','generated/pokemon_showdown_legal_data.js','generated/pokemon_showdown_species_weights.js','generated/champions_move_overrides.js','package-lock.json'],
 runner:['tools/capture-discrete-assertion.mjs','tools/showdown-reference.mjs'],
 test:['tests/discrete_damage_reference_tests.mjs'],
 checker:['tools/bounded-assertions.mjs','tools/bounded-register.mjs']
});
export function fileDependency(root,files){
  const hashes=Object.fromEntries(files.map(name=>[name,digest(fs.readFileSync(path.join(root,name),'utf8').replace(/\r\n/g,'\n'))]));
  return digest(canonical(hashes));
}
export function readBoundedRegister(root,{now=Date.now()}={}){
  if(!fs.existsSync(path.join(root,INDEX)))return [];
  const index=JSON.parse(fs.readFileSync(path.join(root,INDEX)));
  if(index.schema_version!=='bounded-assertion-index-v1')throw Error('Unknown assertion index');
  const safe=name=>{if(typeof name!=='string'||path.isAbsolute(name)||/^[A-Za-z]:/.test(name)||name.split(/[\\/]/).includes('..'))throw Error('Unsafe assertion reference');return path.join(root,name);};
  const read=name=>fs.readFileSync(safe(name));
  const load=ref=>{const bytes=read(ref.path);if(digest(bytes)!==ref.sha256)throw Error('Independent/enrollment content hash mismatch');return bytes;};
  const seen=new Set();
  return index.assertions.map(entry=>{
    if(seen.has(entry.assertion_id))throw Error('Duplicate bounded assertion');seen.add(entry.assertion_id);
    const receipt=JSON.parse(load(entry.receipt));
    if(receipt.assertion_id!==entry.assertion_id||receipt.case_id!==entry.case_id)throw Error('Enrollment assertion/case mismatch');
    if(canonical(entry.dependency_files)!==canonical(DEPENDENCY_FILES))throw Error('Dependency inventory mismatch');
    const current={scope:entry.scope,contract_sha256:entry.contract.sha256,inputs_sha256:entry.inputs.sha256,
      dependencies:{...Object.fromEntries(Object.entries(entry.dependency_files).map(([role,files])=>[role,fileDependency(root,files)])),reference:entry.reference_fingerprint}};
    load(entry.contract);const inputs=JSON.parse(load(entry.inputs));
    const moveIds=[...new Set(inputs.actions.map(a=>String(a.move||'').toLowerCase().replace(/[^a-z0-9]/g,'')))].sort();
    if(moveIds.includes('')||canonical(moveIds)!==canonical(entry.move_ids))throw Error('Move/action binding mismatch');
    const {audit,reference}=readCorroboratingEvidence(entry.independent_receipts,load);
    const validTime=value=>typeof value==='string'&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString()===value&&Date.parse(value)<=now;
    if(!validTime(audit.time_utc))throw Error('Invalid or future independent audit time');
    const hasExecutionTime=Object.hasOwn(receipt,'executed_at');
    if(hasExecutionTime?(!validTime(receipt.executed_at)||entry.executed_at!==receipt.executed_at):entry.executed_at!==null)throw Error('Invalid, future or unbound execution timestamp');
    for(const role of ['local_result','reference_result']){
      const result=JSON.parse(load(receipt[role]));
      if(Object.hasOwn(result,'executed_at')!==hasExecutionTime||result.executed_at!==receipt.executed_at)throw Error('Result execution timestamp mismatch');
    }
    if(audit.head!==entry.independent_target_commit||audit.head!==entry.simulator_commit||
      audit.reference?.head!==entry.reference_pin||audit.reference?.compiled_identity!==entry.reference_fingerprint||
      reference.compiled_fingerprint!==entry.reference_fingerprint)throw Error('Independent receipt scope mismatch');
    for(const role of ['engine','data','test']){
      const hashes=Object.fromEntries(DEPENDENCY_FILES[role].map(file=>{
        const raw=load(entry.independent_sources?.[file]);
        if(digest(raw)!==audit.source_hashes?.['poke-sim/'+file])throw Error('Independent source bytes differ from audit');
        return [file,digest(raw.toString('utf8').replace(/\r\n/g,'\n'))];
      }));
      if(digest(canonical(hashes))!==receipt.dependencies[role])throw Error('Captured dependency differs from independent audit: '+role);
    }
    if(receipt.dependencies.reference!==audit.reference.compiled_identity)throw Error('Captured reference differs from independent audit');
    const status=assessBoundedAssertion(receipt,{current,read,now});
    const captured=assessBoundedAssertion(receipt,{current:{scope:receipt.scope,contract_sha256:receipt.contract.sha256,inputs_sha256:receipt.inputs.sha256,dependencies:receipt.dependencies},read,now});
    return {assertion_id:entry.assertion_id,case_id:receipt.case_id,move_ids:entry.move_ids,status:status.status,
      scope:receipt.scope,expected_contract:entry.contract,inputs:entry.inputs,receipt:entry.receipt,
      current_dependencies:current.dependencies,captured_dependencies:receipt.dependencies,
      reference_pin:entry.reference_pin,reference_fingerprint:entry.reference_fingerprint,
      executed_at:hasExecutionTime?receipt.executed_at:null,execution_timestamp_status:hasExecutionTime?'bound_local_capture_time':'unknown_legacy_capture',
      independent_audited_at:audit.time_utc,simulator_commit:entry.simulator_commit,independent_target_commit:entry.independent_target_commit,
      historical_execution_status:captured.status,independent_receipts:entry.independent_receipts,
      independent_review:'linked retained audit; authorship not cryptographically authenticated',
      adapter_review:'runner/checker hashes identify local adaptation, not independently audited execution',
      errors:status.errors,stale:status.stale,mismatches:status.mismatches,
      implementation_coverage:'unverified',client_verification:'unknown',competitive_use:false,
      exclusions:['Whole-move correctness','Current-client parity','Official eligibility','Complete-set legality','PRNG sequence alignment']};
  });
}
