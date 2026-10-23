import assert from 'node:assert/strict';
import {test} from 'node:test';
import {weatherProbe,weatherAbilities,simultaneousWeatherProbe} from '../tools/weather-gas-probes.mjs';
import {localContext} from '../tools/probe-fly-repair.mjs';
export function check(row){
 assert.equal(row.candidate_turns[0].pre.field.weather||'none',row.reference_initial.weather,'initial weather');
 assert.equal(row.candidate_turns[0].pre.field.weather_turns,row.reference_initial.weather_turns,'initial duration');
 assert.deepEqual(row.candidate,row.reference,'weather/charge state must match pinned reference');
}
for(const side of ['player','opponent'])for(const ability of Object.keys(weatherAbilities)){
 for(const shield of ['none','active','consumed'])test(`WEATHER-GAS-entry-${ability}-${side}-${shield}`,()=>{
  const r=weatherProbe({side,ability,shield});
  assert.equal(r.reference_initial.weather,shield==='active'?weatherAbilities[ability][1]:'none');check(r);
 });
 test(`WEATHER-GAS-healthy-${ability}-${side}`,()=>{const r=weatherProbe({side,ability,gas:false});assert.equal(r.reference_initial.weather,weatherAbilities[ability][1]);check(r);});
 for(const mode of ['pivot','faint','reentry'])for(const shield of ['none','active','consumed'])test(`WEATHER-GAS-${mode}-${ability}-${side}-${shield}`,()=>{
  const r=weatherProbe({side,ability,mode,shield});
  assert.equal(r.reference.weather,weatherAbilities[ability][1]);
  if(mode==='faint')assert(r.reference_log.includes(`|faint|${side==='player'?'p1':'p2'}b: ${side==='player'?'p1':'p2'}m2`),'actual Gas KO');
  else assert(r.reference_log.some(l=>l.startsWith('|switch|')&&l.includes('Magikarp')),'actual Gas switch');
  check(r);
 });
 test(`WEATHER-GAS-two-${ability}-${side}`,()=>{const r=weatherProbe({side,ability,mode:'pivot',secondGas:true});assert.equal(r.reference.weather,'none');check(r);});
}
for(const side of ['player','opponent'])for(const gas of [true,false])test(`WEATHER-GAS-order-${side}-${gas}`,()=>{const r=weatherProbe({side,competing:true,gas,mode:gas?'pivot':'entry'});assert.equal(r.reference.weather,'sun');check(r);});
for(const side of ['player','opponent']){
 test(`WEATHER-GAS-simultaneous-${side}`,()=>{const r=simultaneousWeatherProbe(side);assert.deepEqual(r.reference,['rain','sand']);assert.deepEqual(r.candidate,r.reference);});
 for(const ability of Object.keys(weatherAbilities))test(`WEATHER-GAS-residual-${side}-${ability}`,()=>{
  const r=weatherProbe({side,ability,mode:'residual'});assert.equal(r.reference.weather_turns,5);
  const actor=`${side==='player'?'p1':'p2'}b: ${side==='player'?'p1':'p2'}m2`;
  assert(r.reference_log.some(l=>l.startsWith('|-damage|'+actor)&&l.endsWith('[from] brn')));
  assert(r.reference_log.includes('|faint|'+actor));check(r);
 });
 for(const mode of ['last-gas','gas-replace'])test(`WEATHER-GAS-${mode}-${side}`,()=>{
  const r=weatherProbe({side,mode,secondGas:mode==='last-gas'});assert.equal(r.reference.weather,'rain');check(r);
  if(mode==='last-gas')assert.equal(r.reference_turns[0].weather,'none');
 });
 test(`WEATHER-GAS-shield-no-restart-${side}`,()=>{const r=weatherProbe({side,ability:'Drought',competing:true,shield:'active',mode:'pivot'});assert.equal(r.reference_initial.weather,'sun');assert.equal(r.reference.weather,'rain');check(r);});
}

test('WEATHER-GAS-same-weather-does-not-refresh',()=>{
 const c=localContext(),m={name:'Pelipper',alive:true,ability:'Drizzle',item:'',itemConsumed:false},f={weather:'rain',weatherTurns:2,playerSide:{activeMons:[m]},oppSide:{activeMons:[]}};
 assert.equal(c.applyWeatherAbility(m,f,[]),false);assert.equal(f.weatherTurns,2);
});

test('WEATHER-GAS-simultaneous-reversal',()=>{
 const before='for (const mon of endedGas.slice(0,-1)) mon._weatherGasEnded = true;\n      endWeatherGas(endedGas.at(-1));';
 const r=simultaneousWeatherProbe('player',undefined,s=>{assert(s.replaceAll('\r\n','\n').includes(before));return s.replaceAll('\r\n','\n').replace(before,'for (const mon of endedGas) endWeatherGas(mon);');});
 assert.notDeepEqual(r.candidate,r.reference);assert.deepEqual(r.candidate,['rain','sand','rain','sand']);
});

for(const [id,input,before,after] of [
 ['raw-entry',{},"function applyWeatherAbility(mon, field, log) {\n  if (!mon || !mon.alive || !field) return false;\n  const ability = _contactEffects(field).ability(mon);","function applyWeatherAbility(mon, field, log) {\n  if (!mon || !mon.alive || !field) return false;\n  const ability = mon.ability;"],
 ['missing-restoration',{mode:'pivot'},'function endWeatherGas(mon) {','function endWeatherGas(mon) { return;'],
 ['shield-restart',{ability:'Drought',competing:true,shield:'active',mode:'pivot'},"orderedWeather(active.filter(m=>!(m.item==='Ability Shield' && !m.itemConsumed)));",'orderedWeather(active);'],
 ['remaining-gas',{mode:'pivot',secondGas:true},"if (active.some(m=>m.ability==='Neutralizing Gas' && !m._weatherGasEnded)) return;","for (const m of active) if (m.ability==='Neutralizing Gas') m._weatherGasEnded=true;"],
 ['reverse-order',{competing:true,gas:false},'_speedSort(entries,(a,b)=>b.speed-a.speed,rng);','_speedSort(entries,(a,b)=>a.speed-b.speed,rng);'],
 ['residual-duration',{mode:'residual'},'if (!this._weatherStartedInResidual) this.weatherTurns--;','this.weatherTurns--;'],
])test(`WEATHER-GAS-mutant-${id}`,()=>{
 const mutate=s=>{s=s.replaceAll('\r\n','\n');assert.equal(s.split(before).length,2,'unique mutant anchor');return s.replace(before,after);};
 assert.throws(()=>check(weatherProbe(input,undefined,mutate)),/initial weather|weather\/charge/);
});
