import assert from 'node:assert/strict';
import {test} from 'node:test';
import {localContext} from '../tools/probe-fly-repair.mjs';
import {lifecycleProbe} from '../tools/fly-lifecycle-probes.mjs';
for(const owner of ['attacker','target'])for(const [label,gas,item,consumed,expected]of [
 ['normal',false,'',false,true],['gas',true,'',false,false],['shield',true,'Ability Shield',false,true],['spent-shield',true,'Ability Shield',true,false]
])test(`FLY-ACCURACY-${owner}-${label}`,()=>{
 const c=localContext(true),a={ability:'Rock Head',alive:true,types:['Rock','Flying'],stages:{}},t={ability:'Torrent',alive:true,types:['Water'],stages:{}};
 Object.assign(owner==='attacker'?a:t,{ability:'No Guard',item,itemConsumed:consumed});
 const field={playerSide:{activeMons:[a,...(gas?[{alive:true,ability:'Neutralizing Gas'}]:[])]},oppSide:{activeMons:[t]}};
 assert.equal(c._moveHits(a,t,'Fly',field,()=>.99),expected);
});
const replace=(before,after)=>source=>{assert.equal(source.split(before).length,2,'unique mutant anchor');return source.replace(before,after);};
const mutants=[
 ['exception-gust',{move:'Gust'},replace("'Gust','Twister','Sky Uppercut'","'Twister','Sky Uppercut'")],
 ['double-final',{move:'Gust'},replace("finalMods.push(8192)","finalMods.push(4096)")],
 ['abort-sleep',{move:'Protect',turns:2,interrupt:'sleep'},replace("if (move === 'Phantom Force' || move === 'Fly') return true;","if (move === 'Phantom Force') return true;")],
 ['ground-cancel',{move:'Protect',foeMove2:'Smack Down',foeFirst:true,turns:3},replace("target._flyInterrupted = true;","target._flyInterrupted = false;")],
 ['effective-herb',{item:'Power Herb',ability:'Klutz',gas:true},replace("move === 'Fly' ? _contactEffects(field).item(mon) === 'Power Herb'","false ? _contactEffects(field).item(mon) === 'Power Herb'")],
 ['effective-no-guard',{ability:'No Guard',gas:true},replace("effects.ability(target) === 'No Guard'","target.ability === 'No Guard'")]
];
for(const [id,input,mutate]of mutants)test('FLY-MUTANT-'+id,()=>{
 const row=lifecycleProbe(input,process.env.CHAMPIONS_REFERENCE_SIM,mutate);
 assert.notDeepEqual(row.candidate,row.reference,'owning outcome must catch reversal');
});
