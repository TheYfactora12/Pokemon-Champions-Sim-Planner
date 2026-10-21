import assert from 'node:assert/strict';
import {test} from 'node:test';
import {typeMatrix,mismatches} from '../tools/type-effectiveness-probes.mjs';
import {snowDamageProbe} from '../tools/snow-defense-probes.mjs';
test('TYPE-MATRIX-001 all324 single and5508 ordered dual baseline factors and damage match reference',()=>{
 const rows=typeMatrix();assert.equal(rows.filter(r=>r.defender_types.length===1).length,324);
 const bad=mismatches(rows);assert.equal(bad.length,0,JSON.stringify(bad.slice(0,8)));
 for(const value of [0,.25,.5,1,2,4])assert(rows.some(r=>r.reference===value),'Missing factor '+value);
});
for(const side of ['player','opponent'])test('TYPE-BUG-POISON-001 original U-turn Venusaur16rolls '+side,()=>{
 const r=snowDamageProbe({target:'Venusaur',def:95,stage:0,weather:'none',side});
 const expected=[31,31,32,32,32,33,33,34,34,34,35,35,35,36,36,37];
 assert.deepEqual(r.reference,expected);assert.deepEqual(r.candidate,expected);
});

function replaceOnce(source, before, after) {
 assert.equal(source.split(before).length,2,'Mutation anchor must occur once: '+before);
 return source.replace(before,after);
}
const dataMutants=[
 ['Bug resistance removal','Bug:      { Grass:2, Psychic:2, Dark:2, Poison:0.5,','Bug:      { Grass:2, Psychic:2, Dark:2,'],
 ['Ice Fire reversal','Ice:      { Water:0.5, Ice:0.5, Fire:0.5,','Ice:      { Water:0.5, Ice:0.5, Fire:2,'],
 ['Ice Fighting reversal','Ice:      { Water:0.5, Ice:0.5,','Ice:      { Fighting:2, Water:0.5, Ice:0.5,'],
 ['Ice Rock reversal','Ice:      { Water:0.5, Ice:0.5,','Ice:      { Rock:2, Water:0.5, Ice:0.5,'],
 ['Ice Steel reversal','Ice:      { Water:0.5, Ice:0.5, Fire:0.5, Steel:0.5,','Ice:      { Water:0.5, Ice:0.5, Fire:0.5, Steel:2,'],
];
for(const [name,before,after] of dataMutants)test('TYPE-MATRIX mutation caught: '+name,()=>{
 assert(mismatches(typeMatrix({mutateData:s=>replaceOnce(s,before,after)})).length>0);
});
for(const [name,before,after] of [
 ['dual factors added','typeEff *= eff;','typeEff += eff;'],
 ['second defensive type ignored','for (const t of targetTypes) {','for (const t of targetTypes.slice(0,1)) {'],
])test('TYPE-MATRIX runtime mutation caught: '+name,()=>{
 assert(mismatches(typeMatrix({mutateEngine:s=>replaceOnce(s,before,after)})).length>0);
});
test('TYPE-MATRIX immunity removal caught',()=>{
 const rows=typeMatrix({mutateData:s=>replaceOnce(s,'Normal:   { Ghost:0, Rock:0.5, Steel:0.5 }','Normal:   { Ghost:1, Rock:0.5, Steel:0.5 }')});
 assert(mismatches(rows).some(r=>r.reference===0&&r.damage>0));
});
