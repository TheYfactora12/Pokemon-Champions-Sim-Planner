import assert from 'node:assert/strict';import {test} from 'node:test';
import {createRequire} from 'node:module';
import {loadLocalEngine,mapTeam} from '../tools/showdown-reference.mjs';
const {Battle}=createRequire(import.meta.url)(process.env.CHAMPIONS_REFERENCE_SIM||'pokemon-showdown');
const mon=(name,ability,moves,item='')=>({name,ability,moves,item,level:50,nature:'Hardy',evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0}});
// Audited synthetic shared-mechanics fixtures; no team legality or client certification.
// Numerical constants retained from independent retest and re-executed against current Champions.
for(const swap of [false,true])for(const scenario of ['normal','burn','atk-plus2','technician','hugepower','pixilate','normalize','substitute','roughskin-ko','disguise','taunt','one-usable','imprison','spiky-shield','baneful-bunker','kings-shield','obstruct','gas-technician','unseenfist-protect','spiky-pads','spiky-magicguard','spiky-longreach','gas-shield','gas-consumed-shield','unseen-gas','unseen-gas-shield','disguise-mold','disguise-mold-shield','disguise-gas'])test(`Struggle boundary ${swap}/${scenario}`,()=>{
 const kind=({'spiky-pads':'spiky-shield','spiky-magicguard':'spiky-shield','spiky-longreach':'spiky-shield','gas-shield':'gas-technician','gas-consumed-shield':'gas-technician','unseen-gas':'unseenfist-protect','unseen-gas-shield':'unseenfist-protect','disguise-mold':'disguise','disguise-mold-shield':'disguise','disguise-gas':'disguise'})[scenario]||scenario;
 const ability={technician:'Technician',hugepower:'Huge Power',pixilate:'Pixilate',normalize:'Normalize','gas-technician':'Technician','unseenfist-protect':'Unseen Fist'}[kind]||'Immunity';
 const own={format:'champions',members:[mon('Snorlax',ability,['Amnesia',...(kind==='one-usable'?['Tackle']:[])]),mon('Blastoise','Torrent',['Protect'])]};
 const foe={format:'champions',members:[mon(kind==='roughskin-ko'?'Garchomp':kind==='disguise'?'Mimikyu':kind==='imprison'?'Farigiraf':kind==='taunt'?'Gengar':'Venusaur',kind==='roughskin-ko'?'Rough Skin':kind==='disguise'?'Disguise':kind==='imprison'?'Armor Tail':kind==='taunt'?'Cursed Body':'Overgrow',kind==='imprison'?['Imprison','Amnesia']:kind==='taunt'?['Taunt','Nasty Plot']:['Swords Dance']),mon('Blastoise','Torrent',['Iron Defense'])]}; if(kind==='spiky-shield')foe.members[0].moves=['Spiky Shield'];if(kind==='baneful-bunker')foe.members[0].moves=['Baneful Bunker'];if(kind==='kings-shield')foe.members[0].moves=["King's Shield"];if(kind==='obstruct')foe.members[0].moves=['Obstruct']; const namedShield={'spiky-shield':['Chesnaught','Bulletproof'],'baneful-bunker':['Toxapex','Merciless'],'kings-shield':['Aegislash','Stance Change'],'obstruct':['Obstagoon','Defiant']};if(namedShield[kind]){foe.members[0].name=namedShield[kind][0];foe.members[0].ability=namedShield[kind][1];}if(kind==='gas-technician')foe.members[0]=mon('Weezing','Neutralizing Gas',['Nasty Plot']);if(kind==='unseenfist-protect')foe.members[0].moves=['Protect']; if(scenario==='spiky-pads')own.members[0].item='Protective Pads';if(scenario==='spiky-magicguard')own.members[0].ability='Magic Guard';if(scenario==='spiky-longreach')own.members[0].ability='Long Reach';if(['gas-shield','gas-consumed-shield'].includes(scenario))own.members[0].item='Ability Shield';if(scenario.startsWith('unseen-gas')||scenario==='disguise-gas')foe.members[1]=mon('Weezing','Neutralizing Gas',['Nasty Plot']);if(scenario==='unseen-gas-shield')own.members[0].item='Ability Shield';if(scenario.startsWith('disguise-mold'))own.members[0].ability='Mold Breaker';if(scenario==='disguise-mold-shield')foe.members[0].item='Ability Shield';const inputs=swap?[foe,own]:[own,foe],side=swap?'opponent':'player',rid=swap?'p2':'p1',tid=swap?'p1':'p2',format='gen9championsdoublescustomgame',seed=[3,7,11,13];
 const b=new Battle({formatid:format,seed,strictChoices:true,p1:{team:mapTeam(inputs[0],'p1',format)},p2:{team:mapTeam(inputs[1],'p2',format)}});
 assert.equal(b.dex.currentMod,'champions');const originalTarget=b.getRandomTarget.bind(b);b.getRandomTarget=(pokemon,move)=>(typeof move==='string'?move:move.id)==='struggle'?b[tid].active[0]:originalTarget(pokemon,move);b.randomizer=n=>n;b.randomChance=(n,d)=>n>=d;b.choose('p1','team 12');b.choose('p2','team 12');
 const actor=b[rid].active[0];if(scenario==='gas-consumed-shield')actor.item='';let rounds=['imprison','taunt'].includes(kind)?2:1;
 if(!['taunt','imprison'].includes(kind))actor.moveSlots.forEach((m,i)=>{if(i===0||kind!=='one-usable')m.pp=0;});
 if(kind==='burn')actor.setStatus('brn');
 if(kind==='atk-plus2')actor.boosts.atk=2;
 if(kind==='roughskin-ko')actor.hp=1;
 
 if(kind==='substitute')for(const m of b[tid].active){m.addVolatile('substitute');m.volatiles.substitute.hp=40;}
 const before={actor:actor.hp,targets:b[tid].active.map(m=>m.hp)};
 b.makeRequest('move');
 for(let turn=1;turn<=rounds;turn++){
  b.choose(rid,(kind==='one-usable'?'move 2 1':['imprison','taunt'].includes(kind)&&turn===1?'move 1':'move struggle')+', move 1');
  b.choose(tid,kind==='taunt'?(turn===1?'move 1 1, move 1':'move 2, move 1'):'move 1, move 1');
 }
 const reference={damage:before.targets.reduce((n,hp,i)=>n+hp-b[tid].pokemon[i].hp,0),actorHP:actor.hp,log:b.log};
 const c=loadLocalEngine().context;c._chooseStruggleTarget=enemies=>enemies.find(m=>m.alive);c._sampleDamageRoll=()=>1;c.CRIT_STAGES.fill(0);c._moveHits=()=>true;const build=c.buildTeam;let localActor,localTargets;
 c.buildTeam=function(...args){const mons=build(...args);if(args[1]===side){
  localActor=mons[0];if(scenario==='gas-consumed-shield')localActor.itemConsumed=true;if(!['taunt','imprison'].includes(kind))Object.entries(localActor.movePP).forEach(([m,p])=>{if(m==='Amnesia'||kind!=='one-usable')p.current=0;});
  if(kind==='burn')localActor.status='burn';if(kind==='atk-plus2')localActor.statBoosts.atk=2;if(kind==='roughskin-ko')localActor.hp=1;
 }else {localTargets=mons;if(kind==='substitute')for(const m of mons)m.substituteHp=40;}return mons;};
 const forcedActions=Array.from({length:rounds},(_,i)=>i+1).flatMap(turn=>['player','opponent'].flatMap(s=>[0,1].filter(slot=>s!==side||slot!==0).map(slot=>({turn,side:s,slot,move:s===side?'Protect':slot===1?foe.members[1].moves[0]:kind==='taunt'&&turn===2?'Nasty Plot':foe.members[0].moves[0],targetSlot:0}))));
 const result=c.simulateBattle(...inputs,{format:'doubles',maxTurns:rounds,seed,forcedActions});
 const local={damage:localTargets.reduce((n,m)=>n+m.maxHp-m.hp,0),actorHP:localActor.hp,log:result.log,turnLog:result.turnLog,result:result.result};
 const expected={normal:[29,176],burn:[14,162],'atk-plus2':[57,176],technician:[43,176],hugepower:[57,176],pixilate:[29,176],normalize:[29,176],substitute:[0,176],'roughskin-ko':[26,0],disguise:[16,235],taunt:[37,176],'one-usable':[36,235],imprison:[33,176],'spiky-shield':[0,206],'baneful-bunker':[0,235],'kings-shield':[0,235],obstruct:[0,235],'gas-technician':[22,176],'unseenfist-protect':[7,176],'spiky-pads':[0,235],'spiky-magicguard':[0,235],'spiky-longreach':[0,235],'gas-shield':[32,176],'gas-consumed-shield':[22,176],'unseen-gas':[0,235],'unseen-gas-shield':[7,176],'disguise-mold':[30,176],'disguise-mold-shield':[16,235],'disguise-gas':[16,235]}[scenario];
 assert(!b.log.some(line=>line.startsWith('|error|')),'reference choices accepted');
 assert.deepEqual([reference.damage,reference.actorHP],expected,'independent reference constants');
 assert.deepEqual([local.damage,local.actorHP],expected,'local boundary outcome');
 if(kind==='kings-shield')assert.equal(localActor.statBoosts.atk,-1);
 if(kind==='obstruct')assert.equal(localActor.statBoosts.def,-2);
 if(kind==='disguise'&&scenario!=='disguise-mold')assert(result.turnLog[0].effect_events.some(e=>e.effect_kind==='disguise-break'));
 b.destroy();
});

for(const swap of [false,true])for(const first of ['Struggle','Bite'])test(`Disguise cross-move lifecycle ${swap}/${first}`,()=>{
 const own={format:'champions',members:[mon('Snorlax','Immunity',['Bite']),mon('Blastoise','Torrent',['Protect'])]};
 const foe={format:'champions',members:[mon('Mimikyu','Disguise',['Swords Dance']),mon('Venusaur','Overgrow',['Amnesia'])]};
 const inputs=swap?[foe,own]:[own,foe],rid=swap?'p2':'p1',tid=swap?'p1':'p2',side=swap?'opponent':'player',format='gen9championsdoublescustomgame';
 const b=new Battle({formatid:format,seed:[3,7,11,13],p1:{team:mapTeam(inputs[0],'p1',format)},p2:{team:mapTeam(inputs[1],'p2',format)}});
 b.choose('p1','team 12');b.choose('p2','team 12');b.randomizer=n=>n;b.randomChance=(n,d)=>n>=d;b.getRandomTarget=()=>b[tid].active[0];
 for(let turn=1;turn<=2;turn++){const move=turn===1?first:first==='Bite'?'Struggle':'Bite';b[rid].active[0].moveSlots[0].pp=move==='Struggle'?0:10;b.makeRequest('move');b.choose(rid,(move==='Struggle'?'move struggle':'move 1 1')+', move 1');b.choose(tid,'move 1, move 1');}
 assert(!b.log.some(l=>l.startsWith('|error|')));
 const c=loadLocalEngine().context;c._sampleDamageRoll=()=>1;c.CRIT_STAGES.fill(0);c._moveHits=()=>true;c._chooseStruggleTarget=enemies=>enemies.find(m=>m.alive);const build=c.buildTeam;let actor,target;
 c.buildTeam=function(...args){const mons=build(...args);if(args[1]===side){actor=mons[0];/* Synthetic forced-action registration isolates cross-move lifecycle. */actor.moves.push('Struggle');actor.movePP.Struggle={current:1,max:1};}else target=mons[0];return mons;};
 const forcedActions=[1,2].flatMap(turn=>['player','opponent'].flatMap(s=>[0,1].map(slot=>({turn,side:s,slot,move:s===side?(slot?'Protect':turn===1?first:first==='Bite'?'Struggle':'Bite'):(slot?'Amnesia':'Swords Dance'),targetSlot:0}))));
 const result=c.simulateBattle(...inputs,{format:'doubles',maxTurns:2,seed:[3,7,11,13],forcedActions});
 assert.equal(target.hp,b[tid].active[0].hp,JSON.stringify({reference:b.log,local:result.log}));assert.equal(actor.hp,b[rid].active[0].hp);
 assert.equal(result.turnLog.flatMap(t=>t.effect_events).filter(e=>e.effect_kind==='disguise-break').length,1);
 assert.equal(target.maxHp-target.hp,first==='Bite'?46:52,'one break plus next physical hit');b.destroy();
});
test('Struggle target draws cover eligible slots and exclude fainted targets',()=>{
 const c=loadLocalEngine().context,a={alive:true,hp:10},b={alive:true,hp:10},dead={alive:false,hp:0};
 assert.equal(c._chooseStruggleTarget([a,b],()=>0),a);assert.equal(c._chooseStruggleTarget([a,b],()=>.999),b);
 assert.equal(c._chooseStruggleTarget([dead,b],()=>0),b);assert.equal(c._chooseStruggleTarget([a,dead],()=>.999),a);
 assert.equal(c._chooseStruggleTarget([dead],()=>0),null);
});

for(const side of ['player','opponent'])for(const slot of [0,1])for(const draw of [0,.999])test(`Struggle actual target ${side}/${slot}/${draw}`,()=>{
 const c=loadLocalEngine().context,choose=c._chooseStruggleTarget;let calls=0;
 c._chooseStruggleTarget=(enemies)=>{calls++;return choose(enemies,()=>draw);};c._sampleDamageRoll=()=>1;c.CRIT_STAGES.fill(0);
 let own=[mon('Snorlax','Immunity',['Amnesia']),mon('Blastoise','Torrent',['Protect'])];if(slot)own.reverse();
 const teams=[{format:'champions',members:own},{format:'champions',members:[mon('Venusaur','Overgrow',['Amnesia']),mon('Mimikyu','Frisk',['Swords Dance'])]}];if(side==='opponent')teams.reverse();
 const build=c.buildTeam;let targets;c.buildTeam=function(...args){const mons=build(...args);if(args[1]===side)Object.values(mons[slot].movePP).forEach(p=>p.current=0);else targets=mons;return mons;};
 const forcedActions=['player','opponent'].flatMap(s=>[0,1].filter(n=>s!==side||n!==slot).map(n=>({turn:1,side:s,slot:n,move:teams[s==='player'?0:1].members[n].moves[0]})));
 const result=c.simulateBattle(...teams,{format:'doubles',maxTurns:1,seed:[3,7,11,13],forcedActions});assert.notEqual(result.result,'error');assert.equal(calls,1);
 const selected=draw===0?0:1;assert(targets[selected].hp<targets[selected].maxHp);assert.equal(targets[1-selected].hp,targets[1-selected].maxHp);
 assert.equal(result.turnLog[0].events.find(e=>e.move==='Struggle').target,targets[selected].name);
});

for(const swap of [false,true])for(const kind of ['immune','miss','protect','substitute'])test(`Disguise nonhit ${swap}/${kind}`,()=>{
 const move=kind==='immune'?'Tackle':'Bite',own={format:'champions',members:[mon('Snorlax','Immunity',[move]),mon('Blastoise','Torrent',['Protect'])]},foe={format:'champions',members:[mon('Mimikyu','Disguise',[kind==='protect'?'Protect':'Swords Dance']),mon('Venusaur','Overgrow',['Amnesia'])]};
 const inputs=swap?[foe,own]:[own,foe],rid=swap?'p2':'p1',tid=swap?'p1':'p2',side=swap?'opponent':'player',format='gen9championsdoublescustomgame';
 const b=new Battle({formatid:format,seed:[3,7,11,13],p1:{team:mapTeam(inputs[0],'p1',format)},p2:{team:mapTeam(inputs[1],'p2',format)}});b.choose('p1','team 12');b.choose('p2','team 12');b.randomizer=n=>n;b.randomChance=(n,d)=>kind!=='miss'&&n>=d;
 if(kind==='substitute'){b[tid].active[0].addVolatile('substitute');b[tid].active[0].volatiles.substitute.hp=40;}
 b.choose(rid,'move 1 1, move 1');b.choose(tid,'move 1, move 1');assert(!b.log.some(l=>l.startsWith('|error|')));assert.equal(b[tid].active[0].hp,130);assert.equal(b[tid].active[0].species.id,'mimikyu');
 const c=loadLocalEngine().context;c._moveHits=()=>kind!=='miss';c._sampleDamageRoll=()=>1;c.CRIT_STAGES.fill(0);const build=c.buildTeam;let target;
 c.buildTeam=function(...args){const mons=build(...args);if(args[1]!==side){target=mons[0];if(kind==='substitute')target.substituteHp=40;}return mons;};
 const forcedActions=['player','opponent'].flatMap(s=>[0,1].map(slot=>({turn:1,side:s,slot,move:inputs[s==='player'?0:1].members[slot].moves[0],targetSlot:0})));
 const result=c.simulateBattle(...inputs,{format:'doubles',maxTurns:1,seed:[3,7,11,13],forcedActions});assert.equal(target.hp,130);assert(!target._disguiseBroken);assert(!result.turnLog[0].effect_events.some(e=>e.effect_kind==='disguise-break'));b.destroy();
});
