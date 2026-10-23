import assert from 'node:assert/strict';
import vm from 'node:vm';
import {test} from 'node:test';
import {mkdirSync,writeFileSync} from 'node:fs';
const artifacts=new URL('../artifacts/scripted-switch/',import.meta.url);mkdirSync(artifacts,{recursive:true});
import {createRequire} from 'node:module';
import {loadLocalEngine,mapTeam,referenceIdentity} from '../tools/showdown-reference.mjs';
const require=createRequire(import.meta.url),{Battle}=require('pokemon-showdown'),helper=require('../tools/preparation/scripted-switch.cjs');
const reference=referenceIdentity();
const format='gen9championsdoublescustomgame',seed=[3,7,11,13];
const mon=(name,move='Splash',ability='Illuminate',item='')=>({name,moves:[move],ability,item,level:50,nature:'Hardy',evs:{hp:32,atk:0,def:0,spa:0,spd:0,spe:0}});
function setup(side,slot,variant){
 const own=[mon('Blissey'),mon('Pikachu'),mon('Snorlax'),mon('Raichu')];if(slot) [own[0],own[1]]=[own[1],own[0]];
 if(variant==='self')own[1-slot].moves=['Protect'];
 if(variant==='ally') own[1-slot].moves=['Seismic Toss'];
 if(variant.startsWith('cure-'))own[slot].ability='Natural Cure';
 if(variant==='regenerator')own[slot].ability='Regenerator';
 if(variant==='entry')own[2].ability='Intimidate';
 if(variant==='consumed')own[slot].item='Sitrus Berry';
 const foe=[mon('Mew',variant==='enemy'?'Seismic Toss':variant==='spread'?'Swift':'Splash'),mon('Magikarp'),mon('Venusaur'),mon('Blastoise')];
 const teams=side==='player'?[own,foe]:[foe,own];
 return teams.map(members=>({format:'champions',members}));
}
for(const side of ['player','opponent'])for(const slot of [0,1])for(const variant of ['enemy','ally','spread','sleep','frozen','paralysis','roundtrip','consumed','regenerator','entry','trickroom','self','cure-sleep','cure-frozen','cure-paralysis'])test(`${variant} ${side} slot${slot}`,()=>{
 const teams=setup(side,slot,variant),loaded=loadLocalEngine(),ctx=loaded.context;ctx.ScriptedSwitchDiagnostic=helper;
 const rid=side==='player'?'p1':'p2',other=rid==='p1'?'p2':'p1';
 const b=new Battle({formatid:format,seed,strictChoices:true,p1:{team:mapTeam(teams[0],'p1',format)},p2:{team:mapTeam(teams[1],'p2',format)}});
 const status={sleep:'slp',frozen:'frz',paralysis:'par'}[variant.replace('cure-','')];
 let original,incoming,all,foeMons;
 const old=ctx.buildTeam;ctx.buildTeam=function(...args){const ms=old(...args);if(args[1]===side){original=ms[slot];incoming=ms[2];all=ms;if(status){original.status=variant.replace('cure-','');original.statusTurns=3;original.sleepTurns=1;original.frozenTurns=1;}if(variant==='regenerator')original.hp=Math.floor(original.maxHp/2);if(variant==='consumed')original.itemConsumed=true;}if(args[1]!==side)foeMons=ms;return ms;};
 try{
  for(const id of ['p1','p2'])b.choose(id,'team 1234');
  const ro=b[rid].active[slot],ri=b[rid].pokemon[2];
  if(variant==='trickroom'){b.field.addPseudoWeather('trickroom',ro);vm.runInContext('var OriginalField = Field; Field = class extends OriginalField {constructor(){super();this.trickRoom=4;}}',ctx);}
  if(status){ro.setStatus(status);if(status==='slp')ro.statusState.time=3;}
  if(variant==='regenerator')ro.hp=Math.floor(ro.maxhp/2);if(variant==='consumed')ro.setItem('');
  const beforeOwn=ro.hp,refPp=ro.moveSlots[0].pp;
  const rounds=['roundtrip','consumed'].includes(variant)?2:1;
  for(let t=1;t<=rounds;t++){
   const ownCmd=[0,1].map(i=>i===slot?'switch 3':variant==='ally'?`move 1 -${slot+1}`:'move 1').join(', ');
   const enemyCmd=variant==='enemy'?`move 1 ${slot+1}, move 1`:'move 1, move 1';
   b.choose(rid,ownCmd);b.choose(other,enemyCmd);
  }
  const ids=teams[side==='player'?0:1].members.map((m,i)=>`${side}:slot:${i}:${m.name}`);
  const switches=[{turn:1,side,actorId:ids[slot],replacementId:ids[2]}];
  if(rounds===2)switches.push({turn:2,side,actorId:ids[2],replacementId:ids[slot]});
  const forced=[];
  for(let t=1;t<=rounds;t++)for(const s of ['player','opponent'])for(let i=0;i<2;i++){
   if(s===side&&i===slot)continue;
   const m=teams[s==='player'?0:1].members[i];forced.push({turn:t,side:s,slot:i,move:m.moves[0],targetSlot:slot,targetSide:s===side?'ally':'enemy'});
  }
  const result=ctx.simulateBattle(...teams,{format:'doubles',maxTurns:rounds,seed,scriptedSwitches:switches,forcedActions:forced});
  assert.notEqual(result.result,'error',result.winCondition);
  assert.equal(original.hp,ro.hp,JSON.stringify({variant,local:result.log,reference:b.log}));
  if(variant!=='spread')assert.equal(incoming.hp,ri.hp,JSON.stringify({variant,local:result.log,reference:b.log}));
  else {assert(incoming.hp<incoming.maxHp);assert(ri.hp<ri.maxhp);}
  assert.equal(original.movePP.Splash.current,refPp);
  assert.equal(original.status, status&&!variant.startsWith('cure-')?variant:null);
  assert.equal(original.itemConsumed,variant==='consumed');
  assert.equal(result.turnLog[0].actions[side].find(a=>a.actor_key===original.stableKey).kind,'switch');
  assert(!result.log.some(l=>l===`${original.name} used Splash!`));
  assert(!result.log.some(l=>l===`${incoming.name} used Splash!`));
  assert.equal(result.switch_diagnostic.trusted_rankings,false);
  assert.equal(result.turnLog.flatMap(t=>t.effect_events).filter(e=>e.effect_kind==='diagnostic-voluntary-switch').length,rounds);
  if(variant==='regenerator')assert.equal(original.hp-beforeOwn,Math.floor(original.maxHp/3));
  if(variant==='entry'){assert.equal(result.log.filter(l=>l==="Snorlax's Intimidate activated!").length,1);assert.equal(result.log.filter(l=>l.includes("Snorlax's Intimidate lowered")).length,2);for(let i=0;i<2;i++)assert.equal(foeMons[i].statBoosts.atk,b[other].active[i].boosts.atk);assert.equal(b.log.filter(l=>l.startsWith("|-ability|")&&l.includes("Intimidate")).length,1);}
  writeFileSync(new URL(`${side}-${slot}-${variant}.json`,artifacts),JSON.stringify({scope:'synthetic pinned-reference diagnostic; not Champions client validation',reference,hashes:loaded.hashes,teams,seed,variant,local:result,reference_log:b.log},null,2));
 }finally{b.destroy();}
});

test('admission rejects unsupported or conflicting scripts without mutating input',()=>{
 const teams=setup('player',0,'roundtrip'),before=JSON.stringify(teams),ctx=loadLocalEngine().context;
 const script=[{turn:1,side:'player',actorId:'player:slot:0:Blissey',replacementId:'player:slot:2:Snorlax'}];
 assert.equal(ctx.simulateBattle(...teams,{format:'doubles',maxTurns:1,scriptedSwitches:script}).result,'error');
 ctx.ScriptedSwitchDiagnostic=helper;
 const base={format:'doubles',maxTurns:1,seed,scriptedSwitches:script};
 for(const patch of [[],[...script,...script],[{...script[0],turn:1.5}],[{...script[0],side:'opp'}],[{...script[0],replacementId:script[0].actorId}],[{...script[0],replacementId:'opponent:slot:2:Venusaur'}],[{...script[0],replacementId:'player:slot:1:Pikachu'}],[{...script[0],replacementId:'missing'}]])assert.throws(()=>ctx.simulateBattle(...teams,{...base,scriptedSwitches:patch}),/Scripted switch/);
 assert.throws(()=>ctx.simulateBattle(...teams,{...base,forcedActions:[{turn:1,side:'player',slot:0,move:'Splash'}]}),/conflicting/);
 for(const ability of ['Shadow Tag','Arena Trap','Magnet Pull','Neutralizing Gas']){const ts=JSON.parse(before);ts[1].members[0].ability=ability;assert.throws(()=>ctx.simulateBattle(...ts,base),/outside allowlist/);}
 const build=ctx.buildTeam;
 for(const flag of ['trappedByMove','chargingMove','substituteHp','perishSongTurns']){ctx.buildTeam=(...a)=>{const m=build(...a);m[0][flag]=1;return m;};assert.throws(()=>ctx.simulateBattle(...teams,base),/outside scope/);}
 ctx.buildTeam=build;assert.equal(JSON.stringify(teams),before);
});

test('delayed switch rejects unsupported earlier moves and injected hazard state',()=>{
 const teams=setup('player',0,'roundtrip'),ctx=loadLocalEngine().context;ctx.ScriptedSwitchDiagnostic=helper;
 const opts={format:'doubles',maxTurns:2,seed,scriptedSwitches:[{turn:2,side:'player',actorId:'player:slot:0:Blissey',replacementId:'player:slot:2:Snorlax'}]};
 teams[1].members[0].moves=['Stealth Rock','Splash'];
 assert.throws(()=>ctx.simulateBattle(...teams,{...opts,forcedActions:[{turn:1,side:'opponent',slot:0,move:'Stealth Rock'}]}),/move lifecycle/);
 vm.runInContext('var BeforeHazardField=Field; Field=class extends BeforeHazardField {constructor(){super();this.playerSide.spikes=1;}}',ctx);
 assert.throws(()=>ctx.simulateBattle(...setup('player',0,'roundtrip'),{...opts,scriptedSwitches:[{...opts.scriptedSwitches[0],turn:1}]}),/hazard context/);
});

test('remaining script rejection boundaries and aggregate exclusion',async()=>{
 const teams=setup('player',0,'roundtrip');
 const opts={format:'doubles',maxTurns:2,seed,scriptedSwitches:[{turn:1,side:'player',actorId:'player:slot:0:Blissey',replacementId:'player:slot:2:Snorlax'}]};
 for(const variant of ['sleep','frozen','dead','duplicate','mega']){
  const ctx=loadLocalEngine().context;ctx.ScriptedSwitchDiagnostic=helper;const build=ctx.buildTeam;
  ctx.buildTeam=(...a)=>{const ms=build(...a);if(a[1]==='player'){if(['sleep','frozen'].includes(variant))ms[2].status=variant;if(variant==='dead'){ms[2].hp=0;ms[2].alive=false;}if(variant==='duplicate')ms[2].stableKey=ms[0].stableKey;if(variant==='mega')ms[0].megaForm={};}return ms;};
  assert.throws(()=>ctx.simulateBattle(...teams,opts),/Scripted switch/);
 }
 const ctx=loadLocalEngine().context;ctx.ScriptedSwitchDiagnostic=helper;
 const changed=setup('player',0,'roundtrip');changed[1].members[0].moves=['Splash','Stealth Rock'];
 assert.throws(()=>ctx.simulateBattle(...changed,{...opts,forcedActions:[{turn:1,side:'opponent',slot:0,move:'Splash'},{turn:2,side:'opponent',slot:0,move:'Stealth Rock'}]}),/move lifecycle/);
 const build=ctx.buildTeam;ctx.buildTeam=(...a)=>{const ms=build(...a);if(a[1]==='opponent')ms.forEach(m=>{m.hp=0;m.alive=false;});return ms;};
 assert.throws(()=>ctx.simulateBattle(...teams,{...opts,scriptedSwitches:[{...opts.scriptedSwitches[0],turn:2}]}),/not executed/);
 await assert.rejects(ctx.runSimulation(1,'player','player',null,{scriptedSwitches:opts.scriptedSwitches}),/direct diagnostic/);
});
