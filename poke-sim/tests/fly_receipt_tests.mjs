import fs from 'node:fs';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';import {test} from 'node:test';
const root=new URL('../',import.meta.url),receipt=JSON.parse(fs.readFileSync(new URL('reports/fly-repair-2026-10-20/reference.json',root)));
test('Fly receipt binds executed source, bounded fields and retained gaps',()=>{
 assert.equal(receipt.scope.production_admission,false);assert.equal(receipt.scope.client_verified,false);assert.equal(receipt.scope.official_regulation_verified,false);
 assert.equal(receipt.reference.source_attribution_commit,'9b136a8c8cdb860a8ab96fa063f906604e352547');
 for(const [file,expected]of Object.entries(receipt.source_hashes))assert.equal(createHash('sha256').update(fs.readFileSync(new URL(file,root),'utf8').replace(/\r\n/g,'\n')).digest('hex'),expected,file);
 assert.equal(receipt.basic.length,24);assert.equal(receipt.cases.length,168);assert.equal(receipt.gaps.length,4);
 const ids=[...receipt.basic,...receipt.cases,...receipt.gaps].map(row=>row.case_id);assert.equal(new Set(ids).size,ids.length);
 for(const row of receipt.cases){assert.equal(row.status,'reference_agreement');if(row.candidate)for(const key of row.compared_fields)assert.deepEqual(row.candidate[key],row.reference[key]);else for(const sample of [row.air,row.ground])assert.equal(sample.candidate.actor_hp_loss,sample.reference.actor_hp_loss);}
 for(const row of receipt.gaps){assert.equal(row.status,'unsupported_dependency');assert.notEqual(row.candidate.item_consumed,row.reference.item_consumed);}
});
