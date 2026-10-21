import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import {evioliteDamageProbe,validDamageVector} from '../tools/eviolite-order-probes.mjs';
import {verifyEvioliteReference} from '../tools/eviolite-reference-pin.mjs';
verifyEvioliteReference();
const contract=JSON.parse(fs.readFileSync(new URL('./fixtures/eviolite_order_v1.json',import.meta.url)));
for(const c of contract.cases)test(`${c.id} ${c.input.side}/${c.input.move}/${c.input.weather}/${c.input.def}/${c.input.stage}`,()=>{
 const r=evioliteDamageProbe(c.input);validDamageVector(c.expected);
 assert.deepEqual(r.reference,c.expected,'pinned oracle drift: review sources; never refresh automatically');
 assert.deepEqual(r.candidate,c.expected);
 if(c.expected_stat!==undefined){assert.equal(r.reference_stat,c.expected_stat);assert.equal(r.candidate_stat,c.expected_stat);}
});
test('EVIO-NEG original fractional-stage defect is detected',()=>{
 const c=contract.cases.find(c=>c.input.def===95&&c.input.stage===-1&&c.input.weather==='none'&&c.input.stat==='def');
 const r=evioliteDamageProbe(c.input,s=>s.replace('if (evioliteDefense) val = Math.floor(val);','').replace('if (evioliteDefense) val = _applyStatMod(Math.floor(val), 6144);',"if (evioliteDefense) val *= 1.5;"));
 assert.notDeepEqual(r.candidate,c.expected);
});
test('EVIO-NEG rounding stage to nearest instead of truncation is detected',()=>{
 const c=contract.cases.find(c=>c.input.def===97&&c.input.stage===-1&&c.input.weather==='none'&&c.input.stat==='def');
 const r=evioliteDamageProbe(c.input,s=>s.replace('if (evioliteDefense) val = Math.floor(val);','if (evioliteDefense) val = Math.round(val);'));
 assert.notDeepEqual(r.candidate,c.expected);
});
test('EVIO-NEG combining sand and item modifiers is detected',()=>{
 const c=contract.cases.at(-1);
 const r=evioliteDamageProbe(c.input,s=>s.replace('if (evioliteDefense) val = _applyStatMod(Math.floor(val), 6144);','if (evioliteDefense) val *= 1.5;'));
 assert.equal(r.reference_stat,c.expected_stat);assert.notEqual(r.candidate_stat,c.expected_stat);
});
test('EVIO-NEG dropping item modifier is detected',()=>{
 const c=contract.cases.find(c=>c.input.def===95&&c.input.stage===0&&c.input.weather==='none'&&c.input.stat==='def');
 const r=evioliteDamageProbe(c.input,s=>s.replace('if (evioliteDefense) val = _applyStatMod(Math.floor(val), 6144);',''));
 assert.notDeepEqual(r.candidate,c.expected);
});
test('EVIO invalid oracle inputs reject',()=>{
 for(const x of [{def:1},{def:256},{def:NaN},{def:Infinity},{stage:-7},{stage:7},{stat:'atk'},{format:'singles'}])assert.throws(()=>evioliteDamageProbe(x),/Unsupported|supports doubles/);
 for(const x of [NaN,Infinity,null,undefined,-1,.5])assert.throws(()=>validDamageVector(Array(16).fill(x)),/Invalid numerical/);
});
