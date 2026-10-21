import fs from 'node:fs';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const root=new URL('../',import.meta.url);
const {loadLocalEngine,mapTeam,referenceIdentity}=await import('../tools/showdown-reference.mjs');
const {Battle}=createRequire(new URL('package.json',root))('pokemon-showdown');
const member=(name,moves,ability,item='')=>({name,moves,ability,item,level:50,nature:'Hardy',evs:{hp:32,atk:0,def:0,spa:0,spd:0,spe:32}});
referenceIdentity();
// Synthetic custom-game contact probes, not Champions legality or full-game parity.
for(const swap of [false,true])for(const variant of ['normal','pads','gas','gas-shield','magic-guard','long-reach','pads-consumed','pads-klutz','gas-shield-consumed','magic-guard-gas','long-reach-gas','pads-klutz-gas','magic-guard-gas-actor-shield','magic-guard-gas-actor-shield-consumed','pads-mutant']) test(`${variant} swap=${swap}`,()=>{
 const actor=member(variant.startsWith('magic-guard')?'Clefable':variant.startsWith('long-reach')?'Decidueye':'Scizor',[variant.startsWith('magic-guard')?'Body Slam':'U-turn'],variant.startsWith('magic-guard')?'Magic Guard':variant.startsWith('long-reach')?'Long Reach':variant.startsWith('pads-klutz')?'Klutz':'Swarm',variant.startsWith('pads')?'Protective Pads':variant.includes('actor-shield')?'Ability Shield':'');
 const target=member('Garchomp',['Swords Dance'],'Rough Skin',variant.includes('gas')&&variant!=='gas'?'Ability Shield':'');
 const own={format:'champions',members:[actor,member('Blissey',['Protect'],'Natural Cure'),member('Pikachu',['Splash'],'Static'),member('Raichu',['Splash'],'Static')]};
 const foe={format:'champions',members:[target,member('Weezing',['Protect'],variant.includes('gas')?'Neutralizing Gas':'Levitate'),member('Venusaur',['Splash'],'Overgrow'),member('Blastoise',['Splash'],'Torrent')]};
 const inputs=swap?[foe,own]:[own,foe],side=swap?'opponent':'player',rid=swap?'p2':'p1',enemy=swap?'p1':'p2';
 const format='gen9championsdoublescustomgame',seed=[3,7,11,13];
 const canonical=inputs.map((team,i)=>mapTeam(team,'p'+(i+1),format));
 const b=new Battle({formatid:format,seed,strictChoices:true,p1:{team:canonical[0]},p2:{team:canonical[1]}});
 for(const id of ['p1','p2'])b.choose(id,'team 1234');
 const ra=b[rid].active[0],initial=ra.hp;
 if(variant==='pads-consumed'||variant.endsWith('actor-shield-consumed'))ra.setItem('');
 if(variant==='gas-shield-consumed')b[enemy].active[0].setItem('');b.randomChance=(n,d)=>n>=d||n/d>.5;
 b.choose(rid,'move 1 1, move 1');b.choose(enemy,'move 1, move 1');
 const local=loadLocalEngine().context,build=local.buildTeam;
 if(variant==='pads-mutant'){const real=local._contactEffects;local._contactEffects=field=>{const value=real(field);return {...value,item:mon=>value.item(mon)==='Protective Pads'?'':value.item(mon)};};}let la;local._moveHits=()=>true;
 local.buildTeam=function(...args){const mons=build(...args);if(args[1]===side){la=mons[0];if(variant==='pads-consumed'||variant.endsWith('actor-shield-consumed'))la.itemConsumed=true;}else if(variant==='gas-shield-consumed')mons[0].itemConsumed=true;return mons;};
 const result=local.simulateBattle(...inputs,{format:'doubles',maxTurns:1,seed,forcedActions:['player','opponent'].flatMap(s=>[0,1].map(slot=>({turn:1,side:s,slot,move:slot?'Protect':s===side?actor.moves[0]:'Swords Dance',targetSlot:0}))) });
 assert.notEqual(result.result,'error',result.winCondition);
 assert.equal(la.maxHp,ra.maxhp);
 const compare=()=>assert.equal(la.maxHp-la.hp,initial-ra.hp,JSON.stringify({variant,swap,local:result.log,reference:b.log}));
 if(variant==='pads-mutant') { assert.equal(initial-ra.hp,0); assert(la.maxHp-la.hp>0); assert.throws(compare,assert.AssertionError); }
 else compare();
 const rough=result.turnLog[0].effect_events.filter(e=>e.effect_kind==='ability-contact-damage');
 assert.equal(rough.length,la.maxHp>la.hp?1:0);
 for(const event of rough){assert.equal(event.damage_applied,-event.hp_delta);assert.equal(event.rule.denominator,8);assert(event.actor_key&&event.source_actor_key);}
 b.destroy();
});
