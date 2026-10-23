import assert from 'node:assert/strict';import fs from 'node:fs';import {test} from 'node:test';
import {evioliteDamageProbe} from '../tools/eviolite-activation-probes.mjs';import {verifyEvioliteReference} from '../tools/eviolite-reference-pin.mjs';
console.log('EVIO activation reference:',verifyEvioliteReference().identity);
const contract=JSON.parse(fs.readFileSync(new URL('./fixtures/eviolite_activation_v1.json',import.meta.url)));
for(const c of contract.cases)test(`${c.id} ${c.input.side}/${c.input.target}/${c.input.move}/${c.input.targetAbility}/${c.input.consumed}/${c.input.gas}`,()=>{const r=evioliteDamageProbe(c.input);assert.deepEqual(r.reference,c.expected,'oracle drift: review, never silently refresh');assert.deepEqual(r.candidate,c.expected);});
import vm from 'node:vm';import {createRequire} from 'node:module';import {localContext} from '../tools/probe-fly-repair.mjs';
const pick=predicate=>contract.cases.find(c=>predicate(c.input));
const mutation=(name,predicate,from,to)=>test(name,()=>{const c=pick(predicate);assert(c);const r=evioliteDamageProbe(c.input,s=>{assert.equal(s.split(from).length-1,1,'unique mutation anchor');return s.replace(from,to);});assert.notDeepEqual(r.candidate,c.expected);});
mutation('EVIO-ACT-NEG ineligible holder',x=>x.target==='Abomasnow'&&x.item==='Eviolite'&&x.targetAbility==='Pressure'&&!x.consumed,
 'EVIOLITE_ELIGIBLE_SPECIES.has(_moveId(mon.name))','true');
for(const consumed of [false,true])mutation(`EVIO-ACT-NEG effective item ${consumed?'consumed':'Klutz'}`,x=>x.target==='Snover'&&x.item==='Eviolite'&&(consumed?x.consumed:x.targetAbility==='Klutz'&&!x.gas),
 "_contactEffects(field).item(mon) === 'Eviolite'","mon.item === 'Eviolite'");
mutation('EVIO-ACT-NEG raw Klutz under Gas',x=>x.target==='Snover'&&x.targetAbility==='Klutz'&&x.gas,
 "_contactEffects(field).item(mon) === 'Eviolite'","mon.ability !== 'Klutz' && _contactEffects(field).item(mon) === 'Eviolite'");
mutation('EVIO-ACT-NEG exact form eligibility',x=>x.target==='Basculin-White-Striped'&&x.item==='Eviolite'&&x.targetAbility==='Pressure'&&!x.consumed,
 'EVIOLITE_ELIGIBLE_SPECIES.has(_moveId(mon.name))','EVIOLITE_ELIGIBLE_SPECIES.has(_moveId((_showdownSpeciesRow(mon.name) || {}).baseSpecies))');
mutation('EVIO-ACT-NEG Body Press offensive Eviolite',x=>x.move==='Body Press'&&x.attackerItem==='Eviolite'&&x.attackerDef===null,
 "if (offensiveDefense && stat === 'def') return Math.floor(val);",'');
mutation('EVIO-ACT-NEG Body Press target still receives Eviolite',x=>x.move==='Body Press'&&x.item==='Eviolite'&&!x.crit,
 'def = target.getStat(dStatKey, field);',"def = target.getStat(dStatKey, field, move === 'Body Press');");
test('EVIO-ACT exact eligibility metadata and fail-closed unknown identity',()=>{
 const c=localContext(false),meta=JSON.parse(fs.readFileSync(new URL('../source/eviolite-eligibility.json',import.meta.url)));
 assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify([...EVIOLITE_ELIGIBLE_SPECIES].sort())',c)),meta.ids);
 assert.equal(vm.runInContext("_evioliteActive({name:'Unrecognized',item:'Eviolite'}, {})",c),false);
 const require=createRequire(import.meta.url),{Dex}=require(process.env.CHAMPIONS_REFERENCE_SIM||'pokemon-showdown');
 const ids=Dex.forFormat('gen9championsdoublescustomgame').species.all().filter(s=>s.nfe).map(s=>s.id).sort();
 if(process.env.CHAMPIONS_REFERENCE_SIM)assert.deepEqual(ids,meta.ids);
 else{assert.deepEqual(meta.ids.filter(id=>!ids.includes(id)),['scraptor']);assert.deepEqual(ids.filter(id=>!meta.ids.includes(id)),[]);}
});
test('EVIO-ACT malformed fixture controls reject',()=>{for(const input of [{consumed:'yes'},{attackerConsumed:1},{attackerDef:1},{attackerDef:NaN},{attackerStage:7}])assert.throws(()=>evioliteDamageProbe(input),/Unsupported/);});
