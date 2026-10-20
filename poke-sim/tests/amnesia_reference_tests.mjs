import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {loadLocalEngine,mapTeam,referenceIdentity} from '../tools/showdown-reference.mjs';
const {Battle}=createRequire(import.meta.url)('pokemon-showdown');
referenceIdentity();
// Synthetic ability/state boundaries, not legal-team or current-client certification.
// Independently specified stages also match pinned data/moves.ts Amnesia boosts:{spd:2}.
const vectors=[
 ['normal','Immunity',0,2],['cap5','Immunity',5,6],['cap6','Immunity',6,6],
 ['contrary','Contrary',0,-2],['simple','Simple',0,4],
 ['contrary-gas','Contrary',0,2],['simple-gas','Simple',0,2],
 ['contrary-gas-shield','Contrary',0,-2],['simple-gas-shield','Simple',0,4],
 ['contrary-gas-shield-consumed','Contrary',0,2],['simple-gas-shield-consumed','Simple',0,2],
 ['contrary-cap','Contrary',-6,-6],['simple-cap5','Simple',5,6]
];
const mon=(name,ability,moves,item='')=>({name,ability,moves,item,level:50,nature:'Hardy',evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0}});
for(const swap of [false,true])for(const [variant,ability,start,expected] of vectors)test(`${variant} swap=${swap}`,()=>{
 const own={format:'champions',members:[mon('Snorlax',ability,['Amnesia'],variant.includes('shield')?'Ability Shield':''),mon('Blissey','Natural Cure',['Protect']),mon('Pikachu','Static',['Protect']),mon('Raichu','Static',['Protect'])]};
 const foe={format:'champions',members:[mon('Garchomp','Rough Skin',['Swords Dance']),mon('Weezing',variant.includes('gas')?'Neutralizing Gas':'Levitate',['Protect']),mon('Venusaur','Overgrow',['Protect']),mon('Blastoise','Torrent',['Protect'])]};
 const inputs=swap?[foe,own]:[own,foe],rid=swap?'p2':'p1',side=swap?'opponent':'player',format='gen9championsdoublescustomgame',seed=[3,7,11,13];
 const canonical=inputs.map((team,i)=>mapTeam(team,'p'+(i+1),format));
 const b=new Battle({formatid:format,seed,strictChoices:true,p1:{team:canonical[0]},p2:{team:canonical[1]}});
 b.choose('p1','team 1234');b.choose('p2','team 1234');
 const ref=b[rid].active[0];ref.boosts.spd=start;if(variant.endsWith('consumed'))ref.setItem('');
 const pp=ref.moveSlots[0].pp;b.choose('p1','move 1, move 1');b.choose('p2','move 1, move 1');
 assert.equal(ref.boosts.spd,expected,'independent expected stage vs reference');assert.equal(ref.moveSlots[0].pp,pp-1);
 const local=loadLocalEngine().context,build=local.buildTeam;let actor,initialPP;
 local.buildTeam=function(...args){const mons=build(...args);if(args[1]===side){actor=mons[0];actor.statBoosts.spd=start;initialPP=actor.movePP.Amnesia.current;if(variant.endsWith('consumed'))actor.itemConsumed=true;}return mons;};
 const result=local.simulateBattle(...inputs,{format:'doubles',maxTurns:1,seed,forcedActions:['player','opponent'].flatMap(s=>[0,1].map(slot=>({turn:1,side:s,slot,move:slot?'Protect':s===side?'Amnesia':'Swords Dance',targetSlot:0})))});
 assert.notEqual(result.result,'error',result.winCondition);
 assert.equal(actor.statBoosts.spd,expected,JSON.stringify({local:result.log,reference:b.log}));
 assert.equal(actor.movePP.Amnesia.current,initialPP-1,'one PP even at stage cap');
 assert.equal(actor.lastMoveFailed,start===expected,'cap failure state');
 const turn=result.turnLog[0],action=turn.events.find(e=>e.move==='Amnesia');
 assert(action,'self action is observable');assert.equal(action.actor_key,action.target_key);assert.equal(action.side,action.target_side);
 for(const [key,stages] of Object.entries(turn.post.stat_boosts_stable))assert.equal(stages.spd||0,key===action.actor_key?expected:0,'only actor Special Defense changes');
 if(start===expected){assert(result.log.some(line=>line.includes('Amnesia! But it failed!')));assert(b.log.some(line=>/^\|-(?:un)?boost\|/.test(line)&&line.includes('|spd|0')));}
 b.destroy();
});

for(const swap of [false,true])for(const capped of [false,true])test(`next Stomping Tantrum capped=${capped} swap=${swap}`,()=>{
 const own={format:'champions',members:[mon('Snorlax','Immunity',['Amnesia','Stomping Tantrum']),mon('Blissey','Natural Cure',['Protect'])]};
 const foe={format:'champions',members:[mon('Garchomp','Sand Veil',['Swords Dance']),mon('Venusaur','Overgrow',['Protect'])]};
 const inputs=swap?[foe,own]:[own,foe],rid=swap?'p2':'p1',side=swap?'opponent':'player',format='gen9championsdoublescustomgame';
 const teams=inputs.map((t,i)=>mapTeam(t,'p'+(i+1),format));
 const b=new Battle({formatid:format,seed:[3,7,11,13],strictChoices:true,p1:{team:teams[0]},p2:{team:teams[1]}});
 b.choose('p1','team 12');b.choose('p2','team 12');const ref=b[rid].active[0];ref.boosts.spd=capped?6:0;
 b.choose('p1','move 1, move 1');b.choose('p2','move 1, move 1');
 const move=b.dex.moves.get('Stomping Tantrum');
 assert.equal(move.basePowerCallback.call(b,ref,b[rid==='p1'?'p2':'p1'].active[0],move),capped?150:75);
 const local=loadLocalEngine().context,build=local.buildTeam;let observed;
 local.buildTeam=function(...args){const mons=build(...args);if(args[1]===side){const actor=mons[0];actor.statBoosts.spd=capped?6:0;const damage=actor.calcDamage;actor.calcDamage=function(move,...rest){if(move==='Stomping Tantrum')observed=this._previousMoveFailedForDamage;return damage.call(this,move,...rest);};}return mons;};
 const result=local.simulateBattle(...inputs,{format:'doubles',maxTurns:2,seed:[3,7,11,13],forcedActions:[1,2].flatMap(turn=>['player','opponent'].flatMap(s=>[0,1].map(slot=>({turn,side:s,slot,move:slot?'Protect':s===side?(turn===1?'Amnesia':'Stomping Tantrum'):'Swords Dance',targetSlot:0}))))});
 assert.notEqual(result.result,'error');assert.equal(observed,capped,'failed action reaches next damage calculation');
 assert.equal(result.turnLog[0].effect_events.some(e=>e.effect_kind==='move-failure'&&e.failed_move==='Amnesia'&&e.failure_reason==='stage-cap'),capped);
 b.destroy();
});
