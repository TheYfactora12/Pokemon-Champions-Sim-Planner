import assert from 'node:assert/strict';
import {test} from 'node:test';
import {snowDamageProbe,validDamageVector} from '../tools/snow-defense-probes.mjs';
import {weatherProbe} from '../tools/weather-gas-probes.mjs';
// SNOW-DEF-001: exact pinned Champions reference damage, not whole-weather proof.
const expected=[42,42,42,44,44,44,44,46,46,46,46,48,48,48,48,50];
for(const side of ['player','opponent'])test(`SNOW-DEF-001 original U-turn ${side}`,()=>{
 const r=snowDamageProbe({side});assert.deepEqual(r.reference,expected);assert.deepEqual(r.candidate,expected);
});
for(const move of ['U-turn','Psyshock','Psystrike','Secret Sword','Body Press','Ice Beam'])
 for(const weather of ['snow','none','sun'])test(`SNOW-DEF-002 ${move}/${weather}`,()=>{
  const r=snowDamageProbe({move,weather});assert.deepEqual(r.candidate,r.reference);
 });
for(const def of [94,95,96,97])for(const stage of [-2,-1,0,1,2])test(`SNOW-DEF-003 rounding ${def}/${stage}`,()=>{
 const r=snowDamageProbe({def,stage});assert.deepEqual(r.candidate,r.reference);
});
for(const suppressor of ['Cloud Nine','Air Lock','Neutralizing Gas'])test(`SNOW-DEF-004 ${suppressor}`,()=>{
 const r=snowDamageProbe({suppressor});assert.deepEqual(r.candidate,r.reference);
});
test('SNOW-DEF-005 non-Ice target receives no snow bonus',()=>{
 const r=snowDamageProbe({target:'Snorlax'});assert.deepEqual(r.candidate,r.reference);
});
test('SNOW-DEF-006 Ice Body Press user receives no offensive snow bonus',()=>{
 const r=snowDamageProbe({attacker:'Abomasnow',target:'Snorlax',move:'Body Press'});assert.deepEqual(r.candidate,r.reference);
});
for(const stage of [-2,0,2])test(`SNOW-DEF-007 critical stage ${stage}`,()=>{
 const r=snowDamageProbe({crit:true,stage});assert.deepEqual(r.candidate,r.reference);
});
for(const types of [['Ice'],['Normal']])test(`SNOW-DEF-008 current typing ${types}`,()=>{
 const r=snowDamageProbe({types});assert.deepEqual(r.candidate,r.reference);
});
for(const def of [94,95,101])test(`SNOW-DEF-009 Eviolite order ${def}`,()=>{
 const r=snowDamageProbe({target:'Snover',item:'Eviolite',def});assert.deepEqual(r.candidate,r.reference);
});
test('SNOW-DEF-010 reversal removing snow modifier is caught',()=>{
 const r=snowDamageProbe({},s=>s.replace("dStatKey === 'def' && _effectiveFieldWeather(field) === 'snow'","false && _effectiveFieldWeather(field) === 'snow'"));
 assert.notDeepEqual(r.candidate,expected);
});
for(const side of ['player','opponent'])for(const suppressor of ['Cloud Nine','Air Lock'])for(const shield of ['none','active','consumed'])test(`SNOW-DEF-011 Gas ${side}/${suppressor}/${shield}`,()=>{
 const r=snowDamageProbe({side,suppressor,shield,gas:true});assert.deepEqual(r.candidate,r.reference);
});
test('SNOW-DEF-012 raw suppression reversal caught',()=>{
 const r=snowDamageProbe({suppressor:'Cloud Nine',gas:true},s=>s.replace("return ability === 'Cloud Nine' || ability === 'Air Lock';","return mon.ability === 'Cloud Nine' || mon.ability === 'Air Lock';"));
 assert.notDeepEqual(r.candidate,r.reference);
});
for(const side of ['player','opponent'])for(const mode of ['pivot','reentry'])for(const shield of ['active','none'])test(`SNOW-DEF-013 preserved actual turn ${side}/${mode}/${shield}`,()=>{
 const r=weatherProbe({side,ability:'Snow Warning',mode,shield,pivotTarget:'setter'});
 assert.equal(r.reference.weather_hp,shield==='active'?115:91);
 assert.deepEqual(r.candidate,r.reference);
 assert(r.reference_log.some(l=>l.includes('|U-turn|')),'actual U-turn required');
});
test('SNOW-DEF-014 unsupported singles and extreme stats reject before runtime load',()=>{
 for(const input of [{format:'singles'},{def:1,stage:-6},{def:Infinity},{def:NaN},{def:256},{stage:7}])assert.throws(()=>snowDamageProbe(input),/supports doubles|Unsupported/);
});
test('SNOW-DEF-015 nonnumerical oracle cannot count as agreement',()=>{
 validDamageVector(Array(16).fill(0));
 assert.throws(()=>validDamageVector(Array(16)),/Invalid numerical/);
 for(const bad of [NaN,Infinity,-Infinity,null,false,undefined,-1,.5])assert.throws(()=>validDamageVector(Array(16).fill(bad)),/Invalid numerical/);
 assert.throws(()=>snowDamageProbe({},s=>s.replace('let atk, def;','return NaN; let atk, def;')),/Invalid numerical/);
});
