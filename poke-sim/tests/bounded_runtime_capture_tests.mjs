import assert from 'node:assert/strict';import {test} from 'node:test';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {caseCatalog,executeLocal,executeReference,captureCurrent} from '../tools/bounded-runtime-capture.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
for(const spec of caseCatalog())test('current capture local '+spec.case_id,()=>{
 assert.deepEqual(executeLocal(root,spec).observations,spec.expected);
});
test('capture catalog returns isolated copies',()=>{const a=caseCatalog();a[0].teams[0].members[0].name='Missingno';assert.equal(caseCatalog()[0].teams[0].members[0].name,'Snorlax');});
const upstream=process.env.CHAMPIONS_CAPTURE_REFERENCE;
if(upstream)for(const spec of caseCatalog())test('current capture exact-reference '+spec.case_id,()=>{assert.deepEqual(executeReference(path.resolve(upstream),spec).observations,spec.expected);});
if(upstream)test('six envelopes bind separately executed observations',()=>{const capture=captureCurrent(root,path.resolve(upstream));assert.equal(capture.entries.length,6);for(const entry of capture.entries){const local=JSON.parse(capture.files.get(entry.local_result.path)),reference=JSON.parse(capture.files.get(entry.reference_result.path));assert.notEqual(entry.local_result.sha256,entry.reference_result.sha256);assert.deepEqual(local.observations,reference.observations);assert.equal(local.executed_at,reference.executed_at);}});

test('serialized initial state is executed, not reconstructed from catalog',()=>{
 const spec=caseCatalog().find(c=>c.kind==='whiteherb');spec.initial_state.player_slot0_stages.spa=5;
 assert.equal(executeLocal(root,JSON.parse(JSON.stringify(spec))).observations.special_attack_stage,5);
 if(upstream)assert.equal(executeReference(path.resolve(upstream),JSON.parse(JSON.stringify(spec))).observations.special_attack_stage,5);
});
test('unsupported RNG controls are rejected rather than silently replaced',()=>{
 const spec=caseCatalog()[0];spec.rng_controls.damage='minimum';assert.throws(()=>executeLocal(root,spec));
 if(upstream)assert.throws(()=>executeReference(path.resolve(upstream),spec));
});

// Fail closed before any runtime loading: these adapters intentionally support only
// the catalog's action/RNG mappings, not arbitrary actor/target configurations.
for(const original of caseCatalog())test('fixed mapping rejects ignored fields '+original.kind,()=>{
 const changes=[
  ['targetSlot',s=>{s.actions[0].targetSlot=1;}],
  ['actor slot',s=>{s.actions[0].slot=1;}],
  ['actor identity',s=>{s.actions[0].actor='another actor';}],
  ['side',s=>{s.actions[0].side='opponent';}],
  ['turn',s=>{s.actions[0].turn=2;}],
  ['method',s=>{s.actions[0].method='execute_arbitrary';}],
  ['bucket',s=>{s.actions[0].bucket=99;}],
  ['move',s=>{s.actions[0].move='Splash';}],
  ['extra action',s=>{s.actions.push({...s.actions[0]});}],
  ['extra RNG field',s=>{s.rng_controls.ignored_target_slot=1;}],
  ['critical hit control',s=>{s.rng_controls.critical_hits=true;}]
 ];
 if(original.kind==='discrete')changes.push(
  ['local draw mapping',s=>{s.rng_controls.local_draws.reverse();}],
  ['reference draw mapping',s=>{s.rng_controls.reference_random16.reverse();}],
  ['bucket order',s=>{[s.actions[0],s.actions[1]]=[s.actions[1],s.actions[0]];}]);
 for(const [label,change]of changes){
  const input=structuredClone(original);change(input);
  for(const execute of [executeLocal,executeReference])assert.throws(()=>execute('/must-not-load-unsupported-input',input),/Unsupported bounded input: (actions|rng_controls)/,original.kind+' '+label);
 }
});
if(upstream)test('independent target-slot-one calculation differs; contradictory capture is rejected',async()=>{
 const {createRequire}=await import('node:module');const {mapTeam}=await import('../tools/showdown-reference.mjs');
 const {Battle}=createRequire(import.meta.url)(path.join(path.resolve(upstream),'dist/sim'));
 const input=caseCatalog().find(c=>c.kind==='discrete');input.actions.forEach(a=>{a.targetSlot=1;});
 const b=new Battle({formatid:input.scope.format,seed:input.seed,p1:{team:mapTeam(input.teams[0],'p1',input.scope.format)},p2:{team:mapTeam(input.teams[1],'p2',input.scope.format)}});
 try{
  b.choose('p1','team 12');b.choose('p2','team 12');assert.equal(b.dex.currentMod,'champions');b.randomChance=()=>false;
  const vector=Array.from({length:16},(_,k)=>{b.random=n=>{assert.equal(n,16);return 15-k;};const move=b.dex.getActiveMove('tackle');move.willCrit=false;return b.actions.getDamage(b.p1.active[0],b.p2.active[1],move);});
  assert.deepEqual(vector,[25,27,27,27,27,27,28,28,28,28,28,30,30,30,30,31]);
  assert.equal(input.expected.damage_bucket_15,36);assert.equal(vector[15],31);
 }finally{b.destroy();}
 assert.throws(()=>executeLocal(root,input),/Unsupported bounded input: actions/);
 assert.throws(()=>executeReference(path.resolve(upstream),input),/Unsupported bounded input: actions/);
 assert.throws(()=>captureCurrent(root,path.resolve(upstream),{catalog:[input]}),/Unsupported bounded input: actions/);
});

test('versioned assertion metadata preserves the fixed case behavior',()=>{
 const input=caseCatalog()[0];input.assertion_id=input.case_id+'.current-runtime.v2';
 assert.deepEqual(executeLocal(root,input).observations,input.expected);
 if(upstream)assert.deepEqual(executeReference(path.resolve(upstream),input).observations,input.expected);
});
test('assertion metadata rejects unrelated IDs and invalid versions before loading',()=>{
 const base=caseCatalog()[0];
 for(const id of ['unrelated.current-runtime.v2',base.case_id+'.current-runtime.v0',base.case_id+'.current-runtime.v-1',base.case_id+'.current-runtime.v02',base.case_id+'.current-runtime.v2junk',base.case_id+'.current-runtime.v2.1']){
  const input={...base,assertion_id:id};
  for(const execute of [executeLocal,executeReference])assert.throws(()=>execute('/must-not-load-unsupported-input',input),/Unsupported bounded input: assertion_id/);
 }
});
