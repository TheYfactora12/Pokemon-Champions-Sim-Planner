import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {assess,localContext,teams} from '../tools/assess-fly.mjs';
import {LOCAL_FILES} from '../tools/bounded-runtime-capture.mjs';
// Source: pinned 9b136a8 data/moves.ts Fly condition. These are feasibility
// probes of a quarantined patch, NOT evidence that production supports Fly.
const rows=assess(process.env.CHAMPIONS_REFERENCE_SIM);
for(const row of rows)test(row.case_id+' '+row.input.side+' '+row.input.move,()=>{
 const {reference:r,prototype:p,input:i}=row;
 assert.equal(r.pp_spent,1);assert.equal(p.pp_spent,1);
 if(i.move!=='Tackle'){
  assert(r.actor_hp_loss>0,'reference airborne exception must hit');
  assert.equal(p.actor_hp_loss,0,'minimal prototype demonstrably lacks exception');
  assert.equal(row.agrees,false);
  assert.equal(r.charging,!['Smack Down','Thousand Arrows'].includes(i.move));
 }else{
  assert.deepEqual(p,r,'bounded charge/release/item/Protect control');
  assert.equal(r.charging,i.turns===1&&(!i.item||i.ability==='Klutz'));
  assert.equal(r.target_hp_loss,i.protectRelease||r.charging?0:64);
 }
});
function assertRejected(c,forced){
 const input=teams();if(forced)input[0].members[0].moves=['Tackle'];
 const result=c.simulateBattle(...input,{format:'doubles',maxTurns:1,seed:[3,7,11,13],...(forced?{forcedActions:[{turn:1,side:'player',slot:0,move:'Fly',targetSlot:0}]}:{})});
 assert.equal(result.result,'error','unsupported Fly must fail closed');
 assert(result.log.some(line=>line.includes('Fly simulation is not supported')));
}
for(const forced of [false,true]){
 test('production Fly rejection '+forced,()=>assertRejected(localContext(),forced));
 test('admission removal mutant caught '+forced,()=>assert.throws(()=>assertRejected(localContext(true),forced),/unsupported Fly must fail closed/));
}

// Historical receipt must remain tied to its runtime and capture adapter.
test('assessment receipt source binding',()=>{
 const receipt=JSON.parse(fs.readFileSync(new URL('../reports/fly-assessment-2026-10-20/receipt.json',import.meta.url)));
 assert.equal(receipt.scope.production_fly_admitted,false);
 assert.equal(receipt.scope.client_verified,false);
 assert.equal(receipt.cases.length,24);
 assert.equal(receipt.reference.source_attribution_commit,'9b136a8c8cdb860a8ab96fa063f906604e352547');
 assert.deepEqual(Object.keys(receipt.loaded_source_hashes).sort(),[...LOCAL_FILES,'tools/showdown-reference.mjs','tools/bounded-runtime-capture.mjs','tools/assess-fly.mjs'].sort());
 for(const [file,expected]of Object.entries(receipt.loaded_source_hashes)){
  const historic=file==='engine.js'?'reports/fly-assessment-2026-10-20/engine.original.js.txt':file==='tools/assess-fly.mjs'?'reports/fly-assessment-2026-10-20/assess-fly.original.mjs.txt':file;
  const actual=createHash('sha256').update(fs.readFileSync(new URL('../'+historic,import.meta.url),'utf8').replace(/\r\n/g,'\n')).digest('hex');
  assert.equal(actual,expected,'assessment source changed; preserve history and review new capture: '+file);
 }
 for(let i=0;i<rows.length;i++){
  assert.equal(rows[i].case_id,receipt.cases[i].case_id);
  assert.deepEqual(rows[i].input,receipt.cases[i].input);
  assert.deepEqual(rows[i].teams,receipt.cases[i].teams);
  assert.deepEqual(rows[i].actions,receipt.cases[i].actions);
  assert.deepEqual(rows[i].reference,receipt.cases[i].reference);
  assert.deepEqual(rows[i].prototype,receipt.cases[i].prototype);
 }
});
