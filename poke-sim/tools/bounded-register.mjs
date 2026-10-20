import fs from 'node:fs';
import path from 'node:path';
import {assessBoundedAssertion,digest} from './bounded-assertions.mjs';
import {canonical} from './regulation-watch-core.mjs';

export const INDEX='source/bounded-assertions/index.json';
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
export function readBoundedRegister(root){
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
    if(receipt.assertion_id!==entry.assertion_id)throw Error('Enrollment assertion mismatch');
    if(canonical(entry.dependency_files)!==canonical(DEPENDENCY_FILES))throw Error('Dependency inventory mismatch');
    const current={scope:entry.scope,contract_sha256:entry.contract.sha256,inputs_sha256:entry.inputs.sha256,
      dependencies:{...Object.fromEntries(Object.entries(entry.dependency_files).map(([role,files])=>[role,fileDependency(root,files)])),reference:entry.reference_fingerprint}};
    load(entry.contract);const inputs=JSON.parse(load(entry.inputs));
    const moveIds=[...new Set(inputs.actions.map(a=>String(a.move||'').toLowerCase().replace(/[^a-z0-9]/g,'')))].sort();
    if(moveIds.includes('')||canonical(moveIds)!==canonical(entry.move_ids))throw Error('Move/action binding mismatch');
    if(!entry.independent_receipts?.length)throw Error('Missing independent receipt links');
    const independent=new Map(entry.independent_receipts.map(ref=>[path.basename(ref.path),load(ref)]));
    const audit=JSON.parse(independent.get('focused-receipt.json')),reference=JSON.parse(independent.get('candidate-check.json'));
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
    const status=assessBoundedAssertion(receipt,{current,read});
    const captured=assessBoundedAssertion(receipt,{current:{scope:receipt.scope,contract_sha256:receipt.contract.sha256,inputs_sha256:receipt.inputs.sha256,dependencies:receipt.dependencies},read});
    return {assertion_id:entry.assertion_id,case_id:receipt.case_id,move_ids:entry.move_ids,status:status.status,
      scope:receipt.scope,expected_contract:entry.contract,inputs:entry.inputs,receipt:entry.receipt,
      current_dependencies:current.dependencies,captured_dependencies:receipt.dependencies,
      reference_pin:entry.reference_pin,reference_fingerprint:entry.reference_fingerprint,
      executed_at:entry.executed_at,simulator_commit:entry.simulator_commit,independent_target_commit:entry.independent_target_commit,
      historical_execution_status:captured.status,independent_receipts:entry.independent_receipts,
      independent_review:'linked retained audit; authorship not cryptographically authenticated',
      adapter_review:'runner/checker hashes identify local adaptation, not independently audited execution',
      errors:status.errors,stale:status.stale,mismatches:status.mismatches,
      implementation_coverage:'unverified',client_verification:'unknown',competitive_use:false,
      exclusions:['Whole-move correctness','Current-client parity','Official eligibility','Complete-set legality','PRNG sequence alignment']};
  });
}
