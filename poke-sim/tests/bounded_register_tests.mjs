import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readBoundedRegister,INDEX} from '../tools/bounded-register.mjs';
import {digest} from '../tools/bounded-assertions.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const index=JSON.parse(fs.readFileSync(path.join(root,INDEX))),entry=index.assertions[0];
function modified(changes,fn){
 const original=fs.readFileSync;
 fs.readFileSync=function(file,...args){
  const name=path.relative(root,file instanceof URL?fileURLToPath(file):String(file)).replaceAll('\\','/');
  if(changes.has(name)){const value=changes.get(name);return typeof args[0]==='string'?value.toString(args[0]):value;}
  return original.call(this,file,...args);
 };
 try{return fn();}finally{fs.readFileSync=original;}
}
const bytes=x=>Buffer.from(JSON.stringify(x));
test('historical positive has exact scope and no whole-move/client promotion',()=>{
 const [row]=readBoundedRegister(root);
 assert.equal(row.historical_execution_status,'passed_declared_scope');
 assert.equal(row.independent_target_commit,'146ba91093ad9c0c3c3b7e675850e2e0f5f57475');
 assert.equal(row.implementation_coverage,'unverified');assert.equal(row.client_verification,'unknown');assert.equal(row.competitive_use,false);
 assert.equal(row.scope.regulation_id,null);assert.deepEqual(row.move_ids,['tackle']);
});
test('engine change invalidates current while preserving historical comparison',()=>{
 modified(new Map([['engine.js',Buffer.from('different engine')]]),()=>{
  const [row]=readBoundedRegister(root);assert.equal(row.status,'stale');assert.equal(row.historical_execution_status,'passed_declared_scope');
 });
});
test('tampered independent capture rejects',()=>{
 modified(new Map([[entry.independent_receipts[0].path,Buffer.from('edited audit')]]),()=>assert.throws(()=>readBoundedRegister(root),/hash mismatch/));
});
test('missing independent links reject',()=>{
 const copy=structuredClone(index);copy.assertions[0].independent_receipts=[];
 modified(new Map([[INDEX,bytes(copy)]]),()=>assert.throws(()=>readBoundedRegister(root),/Missing independent/));
});
test('wrong independent target cannot replace historical target',()=>{
 const copy=structuredClone(index);copy.assertions[0].independent_target_commit='0'.repeat(40);
 modified(new Map([[INDEX,bytes(copy)]]),()=>assert.throws(()=>readBoundedRegister(root),/scope mismatch/));
});
test('rehashed local result mismatch still fails historical assertion',()=>{
 const copy=structuredClone(index),r=JSON.parse(fs.readFileSync(path.join(root,entry.receipt.path)));
 const local=JSON.parse(fs.readFileSync(path.join(root,r.local_result.path)));local.observations.bucket_0_damage.value=29;
 const localBytes=bytes(local);r.local_result.sha256=digest(localBytes);
 const receiptBytes=bytes(r);copy.assertions[0].receipt.sha256=digest(receiptBytes);
 modified(new Map([[INDEX,bytes(copy)],[entry.receipt.path,receiptBytes],[r.local_result.path,localBytes]]),()=>{
  assert.equal(readBoundedRegister(root)[0].historical_execution_status,'failed');
 });
});
test('scope promotion rejects even with valid content hashes',()=>{
 const copy=structuredClone(index);copy.assertions[0].scope.oracle_kind='champions-client';
 modified(new Map([[INDEX,bytes(copy)]]),()=>assert.equal(readBoundedRegister(root)[0].status,'invalid'));
});
test('reference pin cannot be relabeled',()=>{
 const copy=structuredClone(index);copy.assertions[0].reference_pin='0'.repeat(40);
 modified(new Map([[INDEX,bytes(copy)]]),()=>assert.throws(()=>readBoundedRegister(root),/scope mismatch/));
});
test('actual Tackle action cannot be labeled Fissure',()=>{
 const copy=structuredClone(index);copy.assertions[0].move_ids=['fissure'];
 modified(new Map([[INDEX,bytes(copy)]]),()=>assert.throws(()=>readBoundedRegister(root),/Move\/action binding/));
});
test('rewriting all result dependencies cannot launder independent historical sources',()=>{
 const copy=structuredClone(index),receipt=JSON.parse(fs.readFileSync(path.join(root,entry.receipt.path)));
 const current=readBoundedRegister(root)[0].current_dependencies;
 // Force an independently wrong engine identity even if current eventually equals historical.
 current.engine='0'.repeat(64);receipt.dependencies=current;
 const changes=new Map();
 for(const role of ['local_result','reference_result']){
  const result=JSON.parse(fs.readFileSync(path.join(root,receipt[role].path)));result.dependencies=current;
  const raw=bytes(result);receipt[role].sha256=digest(raw);changes.set(receipt[role].path,raw);
 }
 const raw=bytes(receipt);copy.assertions[0].receipt.sha256=digest(raw);
 changes.set(entry.receipt.path,raw);changes.set(INDEX,bytes(copy));
 modified(changes,()=>assert.throws(()=>readBoundedRegister(root),/Captured dependency differs/));
});
test('required engine dependency cannot be removed',()=>{
 const copy=structuredClone(index);copy.assertions[0].dependency_files.engine=[];
 modified(new Map([[INDEX,bytes(copy)]]),()=>assert.throws(()=>readBoundedRegister(root),/Dependency inventory/));
});
test('rehashed independent source cannot contradict original audit digest',()=>{
 const copy=structuredClone(index),ref=copy.assertions[0].independent_sources['engine.js'],raw=Buffer.from('fake historical engine');
 ref.sha256=digest(raw);
 modified(new Map([[INDEX,bytes(copy)],[ref.path,raw]]),()=>assert.throws(()=>readBoundedRegister(root),/Independent source bytes/));
});
