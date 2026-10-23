import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {loadLocalEngine,mapTeam,referenceIdentity} from '../tools/showdown-reference.mjs';
const {Battle}=createRequire(import.meta.url)('pokemon-showdown');
referenceIdentity();
const local=loadLocalEngine().context, seed=[3,7,11,13],format='gen9championsdoublescustomgame';
const member=(name,moves,ability='Natural Cure',item='')=>({name,moves,ability,item,level:50,nature:'Hardy',evs:{hp:32,atk:0,def:0,spa:0,spd:0,spe:0}});
for(const swap of [false,true]) for(const variant of ['contact','noncontact','protect','substitute','consumed','pads','pads-consumed','long-reach','magic-guard','holder-klutz','user-ko','holder-ko','multi-hit','double-hit','multi-ko','skill-double-hit','skill-double-kick','skill-wingbeat','rough-skin','rough-skin-ko','rough-skin-helmet-ko','magic-guard-gas','magic-guard-gas-shield','long-reach-gas','long-reach-gas-shield','holder-klutz-gas','pads-klutz','mold-breaker']) test(`${variant} swap=${swap}`,()=>{
  const move=variant==='skill-double-hit'?'Double Hit':variant==='skill-double-kick'?'Double Kick':variant==='skill-wingbeat'?'Dual Wingbeat':variant==='noncontact'?'Swift':variant==='multi-hit'?'Double Kick':['double-hit','multi-ko'].includes(variant)?'Double Hit':'U-turn';
  const actor=member('Scizor',[move],variant.startsWith('skill-')?'Skill Link':variant.includes('long-reach')?'Long Reach':variant.includes('magic-guard')?'Magic Guard':variant==='mold-breaker'?'Mold Breaker':variant==='pads-klutz'?'Klutz':'Swarm',variant.startsWith('pads')?'Protective Pads':variant.endsWith('shield')?'Ability Shield':'');actor.evs.spe=32;
  const target=member('Snorlax',[variant==='protect'?'Protect':'Splash'],variant.includes('holder-klutz')?'Klutz':variant.includes('rough-skin')?'Rough Skin':'Immunity','Rocky Helmet');
  const own={format:'champions',members:[actor,member('Blissey',['Protect']),member('Pikachu',['Splash']),member('Raichu',['Splash'])]};
  const foe={format:'champions',members:[target,member('Gothitelle',['Protect'],variant.includes('gas')?'Neutralizing Gas':'Frisk'),member('Venusaur',['Splash']),member('Blastoise',['Splash'])]};
  const inputs=swap?[foe,own]:[own,foe],before=JSON.stringify(inputs), side=swap?'opponent':'player',rid=swap?'p2':'p1';
  const b=new Battle({formatid:format,seed,strictChoices:true,p1:{team:mapTeam(inputs[0],'p1',format)},p2:{team:mapTeam(inputs[1],'p2',format)}});
  try {
    for(const id of ['p1','p2']) b.choose(id,'team 1234');
    const ra=b[rid].active[0],rt=b[swap?'p1':'p2'].active[0];
    if(['user-ko','multi-ko','rough-skin-ko'].includes(variant))ra.hp=1;if(variant==='holder-ko')rt.hp=1;
    if(variant==='substitute')rt.volatiles.substitute={id:'substitute',hp:rt.maxhp,target:rt};
    if(variant==='consumed')rt.setItem('');if(variant==='pads-consumed')ra.setItem('');
    // Independently force accuracy; compare item effects, not shared random streams.
    b.randomChance=(n,d)=>n>=d || n/d>.5;
    if(variant==='rough-skin-helmet-ko')ra.hp=Math.floor(ra.maxhp/8)+1;
    const initial=ra.hp;
    b.choose(rid,variant==='noncontact'?'move 1, move 1':'move 1 1, move 1');b.choose(swap?'p1':'p2','move 1, move 1');
    const refLoss=initial-ra.hp,refHelmet=b.log.filter((x,i)=>x.includes('[from] item: Rocky Helmet') && b.log[i-1].startsWith('|split|')).length;
    const build=local.buildTeam,hit=local._moveHits;let la,lt;
    local._moveHits=()=>true;
    local.buildTeam=function(...args){const mons=build(...args);if(args[1]===side){la=mons[0];if(variant==='rough-skin-helmet-ko')la.hp=Math.floor(la.maxHp/8)+1;if(['user-ko','multi-ko','rough-skin-ko'].includes(variant))la.hp=1;if(variant==='pads-consumed')la.itemConsumed=true;}else{lt=mons[0];if(variant==='holder-ko')lt.hp=1;if(variant==='substitute')lt.substituteHp=lt.maxHp;if(variant==='consumed')lt.itemConsumed=true;}return mons;};
    let result;
    try{result=local.simulateBattle(...inputs,{format:'doubles',maxTurns:1,seed,forcedActions:['player','opponent'].flatMap(s=>[0,1].map(slot=>({turn:1,side:s,slot,move:slot?'Protect':s===side?move:target.moves[0],targetSlot:0}))) });}finally{local.buildTeam=build;local._moveHits=hit;}
    assert.notEqual(result.result,'error',result.winCondition);
    const expectedInitial=variant==='rough-skin-helmet-ko'?Math.floor(la.maxHp/8)+1:['user-ko','multi-ko','rough-skin-ko'].includes(variant)?1:la.maxHp;
    assert.equal(la.maxHp,ra.maxhp);
    assert.equal(expectedInitial-la.hp,refLoss,JSON.stringify({variant,local:result.log,reference:b.log}));
    const events=result.turnLog[0].effect_events.filter(e=>e.effect_kind==='item-contact-damage');
    assert.equal(events.length,refHelmet);
    for(const event of events){assert.equal(event.damage_applied,-event.hp_delta);assert.equal(event.rule.denominator,6);assert(event.actor_key&&event.source_actor_key);}
    assert.equal(result.log.filter(x=>x.includes("Rocky Helmet!")).length,refHelmet);
    assert.equal(JSON.stringify(inputs),before);
    assert.equal(lt.item,'Rocky Helmet');
    if(variant==='rough-skin-ko'){assert.equal(result.log.filter(x=>x==='Scizor fainted!').length,1);assert(!result.log.some(x=>x.includes("Rocky Helmet!")));assert(result.log.some(x=>x.includes("hurt by Snorlax's Rough Skin")));}
    if(['user-ko','multi-ko','rough-skin-ko'].includes(variant))assert(!result.log.some(x=>x==='Scizor pivoted out!'));
    if(variant==='contact')assert(result.log.some(x=>x==='Scizor pivoted out!'));
  }finally{b.destroy();}
});
