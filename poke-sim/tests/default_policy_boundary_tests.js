const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),source=fs.readFileSync(path.join(root,'engine.js'),'utf8');
const c=vm.createContext({console,_movePPRemaining:(m,n)=>m.pp?.[n]??10,_moveCategory:n=>['Recover','Taunt','Tailwind','Imprison'].includes(n)?'status':'physical',
 _moveType:()=> 'Normal',_moveBasePower:n=>n==='Earthquake'?100:40,getPriority:()=>0,_mcMoveUnavailable:()=>false});
vm.runInContext(source.slice(source.indexOf('  function selectMove('),source.indexOf('  // EXECUTE ACTION'))+';this.prepare=_prepareDefaultDecision;this.decide=_chooseDefaultDecision;',c);
let groups=0;
for(const swap of [false,true]) {
 const field={playerSide:{},oppSide:{},weather:'none'},side=swap?field.oppSide:field.playerSide;
 const actor={name:'Observer',side,moves:['Tackle','Earthquake'],hp:100,maxHp:100,alive:true,turnsSinceEntry:2};
 const enemy={alive:true};
 for(const key of ['moves','item','ability','hp','maxHp','types','statBoosts','lastMoveUsed','getStat','calcDamage','side','baseDef','baseSpd','_chosenMove','bench'])Object.defineProperty(enemy,key,{get(){throw Error('Hidden read '+key);}});
 Object.defineProperty(actor,'calcDamage',{get(){throw Error('Damage preview');}});
 const dto=c.prepare(actor,[actor],[enemy],field),serialized=JSON.stringify(dto);
 assert(Object.isFrozen(dto)&&Object.isFrozen(dto.moves)&&dto.moves.every(Object.isFrozen)&&Object.isFrozen(dto.slots));
 const first=c.decide(dto);assert.equal(first.move,'Earthquake');assert.equal(first.targetSlot,0);
 actor.moves.reverse();actor.pp={Earthquake:0};assert.equal(JSON.stringify(dto),serialized);assert.deepEqual(c.decide(dto),first);
 assert.equal(c.selectMove(actor,[actor],[enemy],field).move,'Tackle');
 actor.item='Choice Scarf';actor.choiceLock='Tackle';assert.equal(c.selectMove(actor,[actor],[enemy],field).move,'Tackle');
 actor.item='';actor.encoredTurns=2;actor.encoredMove='Earthquake';assert.equal(c.selectMove(actor,[actor],[enemy],field).move,'Struggle');
 actor.encoredTurns=0;actor.moves=['Recover','Tackle'];actor.hp=20;assert.equal(c.selectMove(actor,[actor],[enemy],field).move,'Recover');
 actor.tauntedTurns=2;assert.equal(c.selectMove(actor,[actor],[enemy],field).move,'Tackle');
 // Both orientations retain poisoned enemy getters. Only the actor's known
 // availability mask changes; no opponent inventory reaches the policy DTO.
 actor.tauntedTurns=0;actor.moves=['Tackle','Earthquake'];actor.pp={};actor.hp=100;
 side.imprisonedMoves=new Set(['Earthquake']);
 assert.equal(c.selectMove(actor,[actor],[enemy],field).move,'Tackle');
 const restricted=c.prepare(actor,[actor],[enemy],field);
 assert.equal(restricted.moves.find(m=>m.name==='Earthquake').unavailable,true);
 side.imprisonedMoves.add('Tackle');
 assert.equal(c.selectMove(actor,[actor],[enemy],field).move,'Struggle');
 side.imprisonedMoves=null;
 assert.equal(c.selectMove(actor,[actor],[enemy],field).move,'Earthquake');
 // Champions late Fake Out availability applies before Encore/Choice selection.
 actor.moves=['Fake Out'];actor.pp={};actor.turnsSinceEntry=2;
 assert.equal(c.selectMove(actor,[actor],[enemy],field).move,'Struggle');
 actor.encoredTurns=2;actor.encoredMove='Fake Out';
 assert.equal(c.selectMove(actor,[actor],[enemy],field).move,'Struggle');
 actor.turnsSinceEntry=1;actor._fakeDone=false;
 assert.equal(c.selectMove(actor,[actor],[enemy],field).move,'Fake Out');
 actor._fakeDone=true;
 assert.equal(c.selectMove(actor,[actor],[enemy],field).move,'Struggle');
 actor.encoredTurns=0;actor.item='Choice Scarf';actor.choiceLock='Fake Out';actor.moves=['Fake Out','Tackle'];
 assert.equal(c.selectMove(actor,[actor],[enemy],field).move,'Struggle');
 actor._fakeDone=false;actor.turnsSinceEntry=1;
 assert.equal(c.selectMove(actor,[actor],[enemy],field).move,'Fake Out');
 actor.turnsSinceEntry=2;actor.itemConsumed=true;
 assert.equal(c.selectMove(actor,[actor],[enemy],field).move,'Tackle');
 actor.itemConsumed=false;actor.ability='Klutz';
 assert.equal(c.selectMove(actor,[actor],[enemy],field).move,'Tackle');
 groups++;
}
const full=vm.createContext({console,Math,setTimeout,window:{}});let records=[];
full.capture=input=>{records.push(JSON.parse(JSON.stringify(input)));};
for(const f of ['data.js','generated/pokemon_showdown_legal_data.js','outcome_policy.js','runtime_data.js','engine.js']) {
 let text=fs.readFileSync(path.join(root,f),'utf8');if(f==='engine.js')text=text.replace('function _chooseDefaultDecision(input) {','function _chooseDefaultDecision(input) { globalThis.capture(input);');vm.runInContext(text,full,{filename:f});
}
const mon=(name,moves,ability='Pressure',item='')=>({name,moves,ability,item,nature:'Hardy',evs:{}}),team=members=>({format:'champions',members});
const observer=team([mon('Garchomp',['Earthquake','Dragon Claw'],'Sand Veil'),mon('Blissey',['Splash'],'Natural Cure')]);
for(const swap of [false,true]) {let baseline;
 for(let i=0;i<20;i++) {
  const other=team([mon('Snorlax',i%2?['Protect']:['Tackle'],i%2?'Levitate':'Armor Tail',i%2?'Focus Sash':'Leftovers'),mon('Chansey',['Splash'],'Natural Cure'),mon('Gengar',['Shadow Ball'],'Cursed Body')]);other.members[0].evs={hp:i,def:i,spd:i};
  records=[];const inputs=swap?[other,observer]:[observer,other];const before=JSON.stringify(inputs);
  const result=full.simulateBattle(...inputs,{format:'doubles',maxTurns:1,seed:[8,3,12,7]});
  assert.notEqual(result.result,'error');assert.equal(records.length,4);
  const mine=JSON.stringify(records.slice(swap?2:0,swap?4:2));baseline??=mine;assert.equal(mine,baseline);
  assert.equal(result.policy_provenance.id,'own-public-heuristic-v4');assert.equal(JSON.stringify(inputs),before);
 }
 groups++;
}
assert(source.indexOf('const preparedChoices =')<source.indexOf('new Map(preparedChoices.map'));
assert(!source.slice(source.indexOf('function _chooseDefaultDecision'),source.indexOf('  // EXECUTE ACTION')).match(/rng|Math.random|calcDamage|_selectionPriorityBlocked|_effectiveFieldWeather/));
assert.equal(full.simulateBattle(observer,observer,{decisionPolicy:'greedy-state-aware-v3'}).result,'error');
// Mega candidate policy is own active-slot order, independent of weather speed.
const phase=source.slice(source.indexOf('    function tryMegaPhase('),source.indexOf("    tryMegaPhase(playerActive"));
for(const hidden of ['Cloud Nine','Air Lock','Pressure']) {
 const chosen=[], first={alive:true,megaForm:'X',megaEvolve(){chosen.push('first');}},second={alive:true,megaForm:'Y',megaEvolve(){chosen.push('second');}};
 for(const m of [first,second])Object.defineProperty(m,'getEffSpeed',{get(){throw Error('Hidden weather speed preview');}});
 const phaseContext=vm.createContext({field:{},turn:1,log:[],shouldMegaThisTurn:m=>m.alive,applyEntryAbility(){},activateWhiteHerbs(){},rng(){throw Error('Policy consumed battle RNG');},_speedSort(){throw Error('Policy speed sort');}});
 vm.runInContext(phase+';this.run=tryMegaPhase;',phaseContext);phaseContext.run([first,second],'used','player');assert.deepEqual(chosen,['first']);
}
full.observer=observer;vm.runInContext('TEAMS.boundaryA=observer;TEAMS.boundaryB=observer;',full);
full.runSimulation(1,'boundaryA','boundaryB',null,{format:'doubles'}).then(result=>{
 assert.equal(result.policy_provenance.id,'own-public-heuristic-v4');assert.equal(result.policy,'own-public-heuristic-v4-vs-own-public-heuristic-v4');
 console.log(groups+' default boundary groups, 40 production mutation runs, aggregate default/provenance passed');
}).catch(error=>{console.error(error);process.exitCode=1;});
