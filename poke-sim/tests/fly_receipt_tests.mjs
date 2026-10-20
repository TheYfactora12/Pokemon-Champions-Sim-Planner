import fs from 'node:fs';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';import {test} from 'node:test';
import {assertConfusionInterrupted} from '../tools/fly-lifecycle-probes.mjs';
const root=new URL('../',import.meta.url),receipt=JSON.parse(fs.readFileSync(new URL('reports/fly-repair-v2-2026-10-20/reference.json',root)));
test('Fly receipt binds executed source, bounded fields and retained gaps',()=>{
 assert.equal(receipt.scope.production_admission,false);assert.equal(receipt.scope.client_verified,false);assert.equal(receipt.scope.official_regulation_verified,false);
 assert.equal(receipt.reference.source_attribution_commit,'9b136a8c8cdb860a8ab96fa063f906604e352547');
 for(const [file,expected]of Object.entries(receipt.source_hashes))assert.equal(createHash('sha256').update(fs.readFileSync(new URL(file,root),'utf8').replace(/\r\n/g,'\n')).digest('hex'),expected,file);
 assert.equal(receipt.basic.length,24);assert.equal(receipt.cases.length,172);assert.equal(receipt.gaps.length,4);
 const ids=[...receipt.basic,...receipt.cases,...receipt.gaps].map(row=>row.case_id);assert.equal(new Set(ids).size,ids.length);
 for(const row of receipt.cases){assert.equal(row.status,'reference_agreement');if(row.candidate)for(const key of row.compared_fields)assert.deepEqual(row.candidate[key],row.reference[key]);else for(const sample of [row.air,row.ground])assert.equal(sample.candidate.actor_hp_loss,sample.reference.actor_hp_loss);}
 for(const row of receipt.gaps){assert.equal(row.status,'unsupported_dependency');assert.notEqual(row.candidate.item_consumed,row.reference.item_consumed);}
});

test('v2 evidence preserves causal confusion and partial charge outcomes',()=>{
 const confusion=receipt.cases.filter(r=>r.input?.interrupt==='confusion');assert.equal(confusion.length,8);
 for(const row of confusion){assert(row.interruptions);assertConfusionInterrupted(row);}
 for(const row of receipt.charge){for(const field of row.compared_fields)assert.deepEqual(row.candidate[field],row.reference[field]);
 assert.deepEqual(row.unresolved,row.candidate.actor_spa===row.reference.actor_spa?[]:['repeat-charge-SpA-boost']);}
 assert.equal(new Set(receipt.charge.map(r=>r.case_id)).size,80);
});

test('original v1 source bindings remain archived with confusion coverage correction',()=>{
 const old=JSON.parse(fs.readFileSync(new URL('reports/fly-repair-2026-10-20/reference.json',root)));
 for(const [file,expected]of Object.entries(old.source_hashes)){
  const archived=new URL('reports/fly-repair-2026-10-20/source-v1/'+file.replaceAll('/','__')+'.txt',root);
  const source=fs.existsSync(archived)?archived:new URL(file,root);
  assert.equal(createHash('sha256').update(fs.readFileSync(source,'utf8').replace(/\r\n/g,'\n')).digest('hex'),expected,file);
 }
 assert.equal(receipt.schema_version,2);assert(receipt.supersedes_scope_correction.includes('no reference self-hit'));
 assert.equal(receipt.charge.length,80);assert.equal(receipt.charge.filter(row=>row.unresolved.length).length,16);
});
