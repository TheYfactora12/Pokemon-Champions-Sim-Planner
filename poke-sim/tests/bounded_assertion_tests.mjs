import assert from 'node:assert/strict';
import {test} from 'node:test';
import {assessBoundedAssertion,digest} from '../tools/bounded-assertions.mjs';

function fixture(){
  const files=new Map(),put=(name,value)=>{const b=Buffer.from(JSON.stringify(value));files.set(name,b);return {path:name,sha256:digest(b)};};
  const scope={oracle_kind:'shared_reference',format:'gen9championsdoublescustomgame',regulation_id:null,client_version:null,boundaries:['normal-stage']};
  const dependencies=Object.fromEntries(['engine','data','runner','test','reference','checker'].map(k=>[k,'a'.repeat(64)]));
  const identity={assertion_id:'amnesia-stage',case_id:'MOVE-AMNESIA',scope};
  const contract=put('contract',{schema_version:'bounded-contract-v1',...identity,fields:[{field:'spd',type:'number',unit:'stage',min:-6,max:6,expected:2}]});
  const inputs=put('inputs',{schema_version:'bounded-inputs-v1',...identity,contract_sha256:contract.sha256,
    teams:[{species:'Snorlax'},{species:'Blissey'}],actions:[{move:'Amnesia'}],seed:[1,2,3,4],initial_state:{spd:0},rng_controls:{critical:false}});
  const receipt={schema_version:'champions-bounded-assertion-v1',...identity,dependencies,contract,inputs};
  for(const role of ['local_result','reference_result'])receipt[role]=put(role,{schema_version:'bounded-result-v1',...identity,
    role,status:'complete',dependencies,inputs_sha256:inputs.sha256,contract_sha256:contract.sha256,
    observations:{spd:{pointer:'/observations/spd/value',unit:'stage',value:2}}});
  const current={scope,dependencies:structuredClone(dependencies),contract_sha256:contract.sha256,inputs_sha256:inputs.sha256};
  return {receipt,current,files,put,edit(role,fn){const value=JSON.parse(files.get(receipt[role].path));fn(value);receipt[role]=put(role,value);},
    run(){return assessBoundedAssertion(receipt,{current,read:p=>files.get(p)});}};
}
test('bounded matching bytes pass only declared scope without authenticity',()=>{
  const r=fixture().run();assert.equal(r.status,'passed_declared_scope');assert.equal(r.competitive_use,false);assert.equal(r.authenticity,'not_established');
});
test('actual mismatch derives failure',()=>{const f=fixture();f.edit('local_result',v=>v.observations.spd.value=1);assert.equal(f.run().status,'failed');});
for(const [name,mutate] of [
  ['contradictory success',f=>{f.receipt.status='passed_declared_scope';f.edit('local_result',v=>v.observations.spd.value=1);}],
  ['empty observations',f=>f.edit('local_result',v=>v.observations={})],
  ['wrong pointer',f=>f.edit('reference_result',v=>v.observations.spd.pointer='/expected/spd')],
  ['wrong unit',f=>f.edit('local_result',v=>v.observations.spd.unit='hp')],
  ['outside bounds',f=>f.edit('local_result',v=>v.observations.spd.value=7)],
  ['wrong case',f=>f.edit('reference_result',v=>v.case_id='other')],
  ['wrong input identity',f=>f.edit('local_result',v=>v.inputs_sha256='b'.repeat(64))],
  ['scope promotion',f=>f.receipt.scope={...f.receipt.scope,oracle_kind:'champions-client'}],
  ['empty inputs',f=>f.edit('inputs',v=>v.actions=[])],
  ['empty action object',f=>f.edit('inputs',v=>v.actions=[{}])],
  ['contradictory result metadata',f=>f.edit('local_result',v=>{v.errors=['simulationfailed'];v.success=false;})],
  ['contradictory observation metadata',f=>f.edit('local_result',v=>v.observations.spd.success=false)],
  ['byte tamper',f=>f.files.set('local_result',Buffer.from('{}'))],
  ['missing reference',f=>f.files.delete('reference_result')],
  ['traversal',f=>f.receipt.inputs.path='../private'],
])test(name,()=>{const f=fixture();mutate(f);assert.equal(f.run().status,'invalid');});
for(const dep of ['engine','data','runner','test','reference','checker'])test(`changed ${dep} becomes stale`,()=>{
  const f=fixture();f.current.dependencies[dep]='b'.repeat(64);assert.equal(f.run().status,'stale');
});
test('changed authoritative contract becomes stale',()=>{const f=fixture();f.current.contract_sha256='b'.repeat(64);assert.equal(f.run().status,'stale');});
test('rebound results cannot hide changed input from current pin',()=>{
  const f=fixture();f.edit('inputs',v=>v.seed=[9,8,7,6]);
  for(const role of ['local_result','reference_result'])f.edit(role,v=>v.inputs_sha256=f.receipt.inputs.sha256);
  assert.equal(f.run().status,'stale');
});
test('missing current input pin rejects',()=>{const f=fixture();delete f.current.inputs_sha256;assert.equal(f.run().status,'invalid');});
test('future captures bind one execution timestamp in receipt and both raw results',()=>{
 const f=fixture();f.receipt.executed_at='2026-10-20T18:37:54.117Z';
 for(const role of ['local_result','reference_result'])f.edit(role,v=>v.executed_at=f.receipt.executed_at);
 assert.equal(f.run().status,'passed_declared_scope');
});
for(const [name,mutate]of [
 ['future timestamp',f=>{f.receipt.executed_at='2099-01-01T00:00:00.000Z';for(const role of ['local_result','reference_result'])f.edit(role,v=>v.executed_at=f.receipt.executed_at);}],
 ['invalid timestamp',f=>f.receipt.executed_at='not-a-date'],
 ['missing result timestamp',f=>f.receipt.executed_at='2026-10-20T18:37:54.117Z'],
 ['result-only timestamp',f=>f.edit('local_result',v=>v.executed_at='2026-10-20T18:37:54.117Z')],
 ['mismatched result timestamp',f=>{f.receipt.executed_at='2026-10-20T18:37:54.117Z';for(const role of ['local_result','reference_result'])f.edit(role,v=>v.executed_at='2026-10-20T18:38:00.000Z');}]
])test(name,()=>{const f=fixture();mutate(f);assert.equal(f.run().status,'invalid');});
