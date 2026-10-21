import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {loadLocalEngine,mapTeam} from './_item_reference_helpers.mjs';
const historical=!process.env.CHAMPIONS_REFERENCE_SIM;
const {Battle}=createRequire(import.meta.url)(process.env.CHAMPIONS_REFERENCE_SIM || 'pokemon-showdown');
const format='gen9championsdoublescustomgame',seed=[3,7,11,13];
const mon=(name,ability,moves,item='')=>({name,ability,moves,item,nature:'Hardy',level:50,evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0}});
for(const side of ['player','opponent'])for(const slot of [0,1])for(const variant of [
 'normal','status','recoil-ko','protect','immune','substitute','holder-ko','no-bench','dead-bench','klutz','klutz-gas','consumed',
 'suction','guard-dog','suction-gas','shadow-tag','multi','spread','sheer-force','pivot','herb-before-drag','contact-ko','knock-off'
])test(`Red Card ${side}/${slot}/${variant}`,()=>{
 const move=variant==='status'?'Growl':variant==='recoil-ko'?'Double-Edge':variant==='multi'?'Double Kick':variant==='spread'?'Rock Slide':variant==='sheer-force'?'Thunder Punch':variant==='pivot'?'U-turn':variant==='herb-before-drag'?'Close Combat':variant==='knock-off'?'Knock Off':'Seismic Toss';
 const ability=variant==='suction'||variant==='suction-gas'?'Suction Cups':variant==='guard-dog'?'Guard Dog':variant==='sheer-force'?'Sheer Force':'Guts';
 const own={format:'champions',members:[mon('Machamp',ability,[move],variant==='herb-before-drag'?'White Herb':''),mon('Pelipper','Drizzle',['Protect']),mon('Garchomp','Rough Skin',['Protect']),mon('Incineroar','Intimidate',['Protect']),mon('Venusaur','Overgrow',['Protect']),mon('Tyranitar','Sand Stream',['Protect'])]};
 if(slot)[own.members[0],own.members[1]]=[own.members[1],own.members[0]];
 const targetName=variant==='immune'?'Gengar':'Snorlax';
 const foe={format:'champions',members:[mon(targetName,variant.startsWith('klutz')?'Klutz':variant==='contact-ko'?'Rough Skin':'Immunity',[variant==='protect'?'Protect':'Amnesia'],'Red Card'),mon(variant.endsWith('gas')?'Weezing':'Farigiraf',variant.endsWith('gas')?'Neutralizing Gas':variant==='shadow-tag'?'Shadow Tag':'Armor Tail',['Protect']),mon('Gholdengo','Good as Gold',['Protect']),mon('Dragonite','Inner Focus',['Protect']),mon('Raichu','Static',['Protect']),mon('Talonflame','Gale Wings',['Protect'])]};
 const inputs=side==='player'?[own,foe]:[foe,own],id=side==='player'?'p1':'p2',other=id==='p1'?'p2':'p1';
 const length=variant==='no-bench'?2:4;
 const b=new Battle({formatid:format,seed,strictChoices:true,p1:{team:mapTeam(inputs[0],'p1',format).slice(0,side==='player'?length:4)},p2:{team:mapTeam(inputs[1],'p2',format).slice(0,side==='opponent'?length:4)}});
 b.choose('p1','team '+(side==='player'&&length===2?'12':'1234'));b.choose('p2','team '+(side==='opponent'&&length===2?'12':'1234'));
 const ref=b[id].active[slot],holder=b[other].active[0];
 if(variant==='holder-ko')holder.hp=1;
 if(variant==='herb-before-drag')holder.boosts.def=6;
 if(['contact-ko','recoil-ko'].includes(variant))ref.hp=1;
 if(variant==='consumed')holder.item='';
 if(variant==='substitute'){holder.addVolatile('substitute');holder.volatiles.substitute.hp=100;}
 if(variant==='dead-bench')for(const p of b[id].pokemon.slice(2)){p.hp=0;p.fainted=true;}
 const local=loadLocalEngine().context,build=local.buildTeam;let actor,target,team;
 local.buildTeam=function(...args){let mons=build(...args);if(process.env.ITEM_DIAGNOSTIC_MC)for(const m of mons)m.referenceMode='champions_mc_reference';if(args[1]===side){if(length===2)mons=mons.slice(0,2);team=mons;actor=mons[slot];if(['contact-ko','recoil-ko'].includes(variant))actor.hp=1;if(variant==='dead-bench')for(const m of mons.slice(2)){m.hp=0;m.alive=false;}}else {target=mons[0];if(variant==='herb-before-drag')target.statBoosts.def=6;if(variant==='holder-ko')target.hp=1;if(variant==='consumed')target.itemConsumed=true;if(variant==='substitute')target.substituteHp=100;}return mons;};
 // Deterministic hit/noncrit controls; magnitudes are not compared across RNG streams.
 b.randomChance=(n,d)=>n===d||(d===100&&n>=90);local._moveHits=()=>true;local.CRIT_STAGES.fill(0);
 for(const rid of ['p1','p2'])b.choose(rid,rid===id?[0,1].map(k=>k===slot&&!['spread','status'].includes(variant)?'move 1 1':'move 1').join(', '):'move 1, move 1');
 const result=local.simulateBattle(...inputs,{format:'doubles',maxTurns:1,seed,forcedActions:['player','opponent'].flatMap(s=>[0,1].map(k=>({side:s,slot:k,move:s===side?(k===slot?move:'Protect'):(k===0?(variant==='protect'?'Protect':'Amnesia'):'Protect'),targetSlot:0})))});
 assert.notEqual(result.result,'error',result.winCondition);
 const consumed=!['status','recoil-ko','protect','immune','substitute','holder-ko','no-bench','dead-bench','klutz','contact-ko','knock-off'].includes(variant);
 // Historical npm 0.11.11 suppresses the Sheer Force hook and drags before
 // White Herb's after-move check. Record those source differences explicitly;
 // local expectations below always require the current Champions behavior.
 const historicalDifference=historical&&variant==='sheer-force';
 assert.equal(holder.item==='',!historicalDifference&&(consumed||variant==='knock-off'),JSON.stringify(b.log));
 assert.equal(target.itemConsumed,consumed||variant==='knock-off',JSON.stringify(result.log));
 const dragged=consumed&&!['suction','guard-dog','consumed'].includes(variant);
 assert.equal(b.log.some(x=>x.startsWith('|drag|')),dragged&&!historicalDifference,JSON.stringify(b.log));
 assert.equal(result.log.some(x=>x.includes('was forced out by Red Card')),dragged,JSON.stringify(result.log));
 if(variant==='multi')assert.equal(result.turnLog[0].damage_events.filter(e=>e.move==='Double Kick').length,2,'both hits before drag');
 if(dragged){
  const active=actor.side.activeMons;assert(!active.includes(actor));assert(active.includes(team[2])||active.includes(team[3]));
  assert(!active.some(m=>['Venusaur','Tyranitar'].includes(m.name)),'unselected reserves excluded');
  const switchIndex=result.log.findIndex(x=>x.includes('was forced out by Red Card'));
  assert(switchIndex>result.log.findLastIndex(x=>x.includes('hit')&&x.includes('dmg')),'drag after hits');
  if(variant==='herb-before-drag'){assert(actor.itemConsumed);assert.equal(ref.item,historical?'whiteherb':'');assert(result.log.findIndex(x=>x.includes('White Herb'))<switchIndex);}
 }
 b.destroy();
});
