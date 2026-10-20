import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {loadLocalEngine,mapTeam,itemContract} from './_item_reference_helpers.mjs';
const {Battle,TeamValidator}=createRequire(import.meta.url)(process.env.CHAMPIONS_REFERENCE_SIM || 'pokemon-showdown');
const custom='gen9championsdoublescustomgame',seed=[3,7,11,13];
const mon=(name,ability,moves,item='')=>({name,ability,moves,item,nature:'Hardy',level:50,evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0}});
for(const side of ['player','opponent'])for(const item of ['Red Card','White Herb'])test(`Full-six admitted ${side} ${item}`,()=>{
 const fixture=itemContract.cases.find(c=>c.id==='ITEM-'+item.replace(' ','-').toUpperCase()+'-FULL-SIX');
 const [own,foe]=structuredClone(fixture.setup);
 assert.equal(own.members.length,fixture.registered);assert.equal(foe.members.length,fixture.registered);
 assert.deepEqual(seed,fixture.seed);assert.deepEqual(fixture.leads,[0,1]);
 const inputs=side==='player'?[own,foe]:[foe,own],id=side==='player'?'p1':'p2',other=id==='p1'?'p2':'p1';
 const local=loadLocalEngine().context;
 for(const t of inputs)assert.equal(local.checkMcReferenceExecution(t,{format:'doubles',bo:1,requireFullTeam:true}).allowed,true);
 const format=process.env.CHAMPIONS_REFERENCE_SIM?'gen9championsvgc2026regmc':custom;
 const teams=inputs.map((t,i)=>mapTeam(t,'p'+(i+1),custom));
 if(format!==custom)for(const t of teams)assert.equal(new TeamValidator(format).validateTeam(t),null,'current M-C team validator');
 const b=new Battle({formatid:format,seed,strictChoices:true,p1:{team:teams[0]},p2:{team:teams[1]}});
 const selection='team '+fixture.brought.map(slot=>slot+1).join('');
 b.choose('p1',selection);b.choose('p2',selection);
 // Shared custom reference receives six registered but explicitly selects four.
 if(format===custom){for(const rid of ['p1','p2']){b[rid].pokemon.splice(4);b[rid].pokemonLeft=4;}}
 const ref=b[id].active[0],holder=b[other].active[0];
 for(const rid of ['p1','p2'])b.choose(rid,rid===id?'move 1 1, move 1':'move 1, move 1');
 const build=local.buildTeam;let actor,target;
 local.buildTeam=function(...args){const mons=build(...args);if(args[1]===side)actor=mons[0];else target=mons[0];return mons;};
 const result=local.simulateBattle(...inputs,{format:'doubles',bo:1,rulesetId:'champions_mc_reference',requireFullTeam:true,maxTurns:1,seed:fixture.seed,
  playerBring:fixture.brought.map(i=>inputs[0].members[i].name),opponentBring:fixture.brought.map(i=>inputs[1].members[i].name),
  forcedActions:['player','opponent'].flatMap(s=>fixture.leads.map(slot=>({side:s,slot,move:slot?'Protect':s===side?'Seismic Toss':'Amnesia',targetSlot:0})))});
 assert.notEqual(result.result,'error',result.winCondition);
 if(item==='White Herb'){assert.equal(actor.itemConsumed,fixture.expected.holder_item_consumed);assert.equal(actor.statBoosts.atk,fixture.expected.attack_stage);assert.equal(ref.item,'');assert.equal(ref.boosts.atk,0);}
 else {assert.equal(target.itemConsumed,fixture.expected.holder_item_consumed);assert.equal(holder.item,'');assert.equal(actor.side.activeMons.includes(actor),fixture.expected.attacker_remains_active);assert.equal(target.maxHp-target.hp,fixture.expected.holder_hp_loss);assert(b.log.some(x=>x.startsWith('|drag|')));}
 if(item==='Red Card')assert(fixture.expected.replacement_in.includes(actor.side.activeMons[0].name));
 if(process.env.ITEM_EVIDENCE_DIR){
  fs.mkdirSync(process.env.ITEM_EVIDENCE_DIR,{recursive:true});
  fs.writeFileSync(path.join(process.env.ITEM_EVIDENCE_DIR,`${side}-${item.replace(' ','-')}.json`),
   JSON.stringify({inputs,seed,reference_format:format,local_ruleset:'champions_mc_reference',full_six:true,
    local:result,reference_log:b.log,current_client_proof:false},null,2));
 }
 b.destroy();
});
for(const side of ['player','opponent'])test(`Parting Shot Herb precedes replacement Intimidate ${side}`,()=>{
 const own={format:'champions',members:[mon('Incineroar','Blaze',['Parting Shot']),mon('Pelipper','Drizzle',['Protect']),mon('Arcanine','Intimidate',['Protect'])]};
 const foe={format:'champions',members:[mon('Snorlax','Immunity',['Amnesia'],'White Herb'),mon('Farigiraf','Armor Tail',['Protect'])]};
 const inputs=side==='player'?[own,foe]:[foe,own],id=side==='player'?'p1':'p2',other=id==='p1'?'p2':'p1';
 const b=new Battle({formatid:custom,seed,strictChoices:true,p1:{team:mapTeam(inputs[0],'p1',custom)},p2:{team:mapTeam(inputs[1],'p2',custom)}});
 b.choose('p1','team '+(id==='p1'?'123':'12'));b.choose('p2','team '+(id==='p2'?'123':'12'));
 const ref=b[other].active[0];for(const rid of ['p1','p2'])b.choose(rid,rid===id?'move 1 1, move 1':'move 1, move 1');b.choose(id,'switch 3, pass');
 const local=loadLocalEngine().context,build=local.buildTeam;let target;
 local.buildTeam=function(...args){const mons=build(...args);if(args[1]!==side)target=mons[0];return mons;};
 const result=local.simulateBattle(...inputs,{format:'doubles',maxTurns:1,seed,forcedActions:['player','opponent'].flatMap(s=>[0,1].map(slot=>({side:s,slot,move:slot?'Protect':s===side?'Parting Shot':'Amnesia',targetSlot:0})))});
 assert.equal(ref.boosts.atk,-1);assert.equal(target.statBoosts.atk,-1,JSON.stringify(result.log));assert.equal(target.statBoosts.spa,0);assert(target.itemConsumed);b.destroy();
});
test('Red Card spread handler uses pre-action speed despite Icy Wind drop',()=>{
 const inputs=[{format:'champions',members:[mon('Snorlax','Immunity',['Icy Wind']),mon('Pelipper','Drizzle',['Protect']),mon('Machamp','Guts',['Protect'])]},
 {format:'champions',members:[mon('Incineroar','Clear Body',['Protect'],'Red Card'),mon('Dragonite','Inner Focus',['Protect'],'Red Card')]}];
 const b=new Battle({formatid:custom,seed,strictChoices:true,p1:{team:mapTeam(inputs[0],'p1',custom)},p2:{team:mapTeam(inputs[1],'p2',custom)}});
 b.choose('p1','team 123');b.choose('p2','team 12');
 // Diagnostic inert actions: permit both holders to take spread damage.
 b.p2.active.forEach(p=>{p.moveSlots[0].id='splash';p.moveSlots[0].move='Splash';});
 b.randomChance=(n,d)=>n===d||(d===100&&n>=90);
 b.choose('p1','move 1, move 1');b.choose('p2','move 1, move 1');
 const local=loadLocalEngine().context,build=local.buildTeam;let holders;
 local._moveHits=()=>true;local.CRIT_STAGES.fill(0);
 const localInputs=structuredClone(inputs);localInputs[1].members.forEach(p=>p.moves=['Splash']);
 local.buildTeam=function(...args){const mons=build(...args);if(args[1]==='opponent')holders=mons;return mons;};
 const result=local.simulateBattle(...localInputs,{format:'doubles',seed,maxTurns:1,forcedActions:[
  {side:'player',slot:0,move:'Icy Wind'},{side:'player',slot:1,move:'Protect'},
  {side:'opponent',slot:0,move:'Splash'},{side:'opponent',slot:1,move:'Splash'}]});
 assert.equal(b.p2.active[0].item,'redcard');assert.equal(b.p2.active[1].item,'');
 assert(!holders[0].itemConsumed,JSON.stringify(result.log));assert(holders[1].itemConsumed);
 b.destroy();
});
test('Red Card samples both eligible reserves across deterministic seeds',()=>{
 const local=loadLocalEngine().context,build=local.buildTeam,seen=new Set();
 const a={format:'champions',members:[mon('Machamp','Guts',['Seismic Toss']),mon('Pelipper','Drizzle',['Protect']),mon('Garchomp','Rough Skin',['Protect']),mon('Incineroar','Intimidate',['Protect'])]};
 const b={format:'champions',members:[mon('Snorlax','Immunity',['Amnesia'],'Red Card'),mon('Farigiraf','Armor Tail',['Protect'])]};
 let actor;local.buildTeam=function(...args){const mons=build(...args);if(args[1]==='player')actor=mons[0];return mons;};
 for(let n=1;n<=12;n++){
  local.simulateBattle(a,b,{format:'doubles',maxTurns:1,seed:[n*10000019,n*123456789,n*97531,n*64871],forcedActions:[
   {side:'player',slot:0,move:'Seismic Toss',targetSlot:0},{side:'player',slot:1,move:'Protect'},
   {side:'opponent',slot:0,move:'Amnesia'},{side:'opponent',slot:1,move:'Protect'}]});
  seen.add(actor.side.activeMons[0].name);
 }
 assert.deepEqual([...seen].sort(),['Garchomp','Incineroar']);
});


