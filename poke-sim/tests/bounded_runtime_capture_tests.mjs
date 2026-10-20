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
