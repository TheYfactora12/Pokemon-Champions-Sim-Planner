const assert=require('node:assert/strict');
const {test}=require('node:test');
const {decisionObservation,validateSwitchIntent}=require('../tools/preparation/decision-contract.cjs');
const input=()=>({viewer:'player',turn:2,observedThrough:10,own:[{id:'p0',activeSlot:0,hp:90,maxHp:100,moves:['Protect'],item:'Leftovers',ability:'Intimidate'}],opponents:[{id:'o0',visibleSpecies:'Incineroar',activeSlot:0,hpPercent:50,visibleStatus:null}],field:{visibleWeather:'rain'},reveals:[]});
test('unrevealed engine fields cannot enter preparation observation',()=>{
 const baseline=decisionObservation(input());
 for(let i=0;i<100;i++) {
  const data=input();Object.assign(data.opponents[0],{moves:['Secret'+i],ability:'Secret'+i,item:'Secret'+i,hp:i,maxHp:100+i,stats:{spe:i},evs:{hp:i},_chosenMove:'Secret'+i,side:{activeMons:[{secret:i}]},calcDamage:()=>i});
  assert.deepEqual(decisionObservation(data),baseline);
 }
 assert.equal(baseline.opponents[0].ability,null);assert.deepEqual(baseline.opponents[0].moves,[]);
});
test('facts require observer, identity, event cutoff and evidence',()=>{
 const data=input(),fact={viewer:'player',subject:'o0',kind:'move',value:'Fake Out',turn:1,sequence:5,evidenceId:'event5'};
 for(const change of [{viewer:'opponent'},{subject:'p0'},{turn:3},{sequence:11},{evidenceId:''},{kind:'stats'}]) {
  data.reveals=[{...fact,...change}];assert.deepEqual(decisionObservation(data).opponents[0].moves,[]);
 }
 data.reveals=[fact];assert.deepEqual(decisionObservation(data).opponents[0].moves,['Fake Out']);
});
test('observations are detached and recursively immutable',()=>{
 const data=input(),before=JSON.stringify(data),view=decisionObservation(data);
 data.own[0].moves.push('Taunt');assert.deepEqual(view.own[0].moves,['Protect']);
 assert.throws(()=>view.own[0].moves.push('Leak'),TypeError);assert.equal(JSON.stringify(input()),before);
 assert.equal(view.game_visibility_verified,false);
});
test('same public information has symmetric observer behavior',()=>{
 for(const viewer of ['player','opponent']) {const data=input();data.viewer=viewer;assert.equal(decisionObservation(data).opponents[0].item,null);}
});
test('invalid visibility context does not infer a default',()=>{
 for(const changes of [{viewer:'unknown'},{turn:0},{observedThrough:undefined}]) assert.throws(()=>decisionObservation({...input(),...changes}));
});
const switchInput=(side='player',slot=0)=>({side,turn:2,actorId:'a',replacementId:'b',otherSwitches:0,megaPlanned:false,availability:{allowed:true,evidenceId:'fixture-only'},roster:[{id:'a',side,activeSlot:slot,alive:true,brought:true},{id:'b',side,activeSlot:null,alive:true,brought:true}]});
test('explicit switch intent accepts both sides and both slots without mutation',()=>{
 for(const side of ['player','opponent'])for(const slot of [0,1]) {const data=switchInput(side,slot),before=JSON.stringify(data),result=validateSwitchIntent(data);assert.equal(result.allowed,true);assert.equal(result.execution_supported,false);assert.equal(JSON.stringify(data),before);}
});
test('switch intent rejects active, fainted, omitted, foreign and unknown replacements',()=>{
 for(const changes of [{activeSlot:1},{alive:false},{brought:false},{side:'opponent'},{id:'unknown'}]) {const data=switchInput();Object.assign(data.roster[1],changes);assert.equal(validateSwitchIntent(data).allowed,false);}
});
test('switch intent rejects duplicate identity and self replacement',()=>{
 const data=switchInput();data.roster.push({...data.roster[1]});assert.equal(validateSwitchIntent(data).allowed,false);
 data.replacementId='a';assert.equal(validateSwitchIntent(data).allowed,false);
});
test('unproved trapping, simultaneous switch and Mega contexts fail closed',()=>{
 for(const change of [{availability:null},{availability:{allowed:false,evidenceId:'trap'}},{otherSwitches:1},{megaPlanned:true},{turn:0},{side:'unknown'}]) assert.equal(validateSwitchIntent({...switchInput(),...change}).allowed,false);
});
test('missing identity, omitted actor and duplicate active slots are rejected',()=>{
 const data=switchInput();delete data.actorId;delete data.roster[0].id;assert.equal(validateSwitchIntent(data).allowed,false);
 const omitted=switchInput();omitted.roster[0].brought=false;assert.equal(validateSwitchIntent(omitted).allowed,false);
 const duplicate=switchInput();duplicate.roster.push({...duplicate.roster[0],id:'c'});assert.equal(validateSwitchIntent(duplicate).allowed,false);
 for(const entry of [null,42,{}]) {const malformed=switchInput();malformed.roster.push(entry);assert.equal(validateSwitchIntent(malformed).allowed,false);}
});
test('reveal chronology is independent of array order and permits observed removal',()=>{
 const data=input();const fact={viewer:'player',subject:'o0',kind:'item',turn:1,evidenceId:'e'};
 data.reveals=[{...fact,sequence:2,value:'Old'},{...fact,sequence:7,value:'New'}];const first=decisionObservation(data);
 data.reveals.reverse();assert.deepEqual(decisionObservation(data),first);
 data.reveals.push({...fact,sequence:10,value:null});assert.equal(decisionObservation(data).opponents[0].item,null);
 data.reveals.push({...fact,sequence:10,value:'Conflict'});assert.throws(()=>decisionObservation(data),/conflict/i);
});
test('ability changes, cutoff inclusion and duplicate observation identities',()=>{
 const data=input();data.reveals=[{viewer:'player',subject:'o0',kind:'ability',turn:2,sequence:10,evidenceId:'e10',value:'New'},{viewer:'player',subject:'o0',kind:'ability',turn:1,sequence:1,evidenceId:'e1',value:'Old'}];
 assert.equal(decisionObservation(data).opponents[0].ability,'New');data.opponents.push({...data.opponents[0]});assert.throws(()=>decisionObservation(data),/identity/i);
 const denied=validateSwitchIntent({...switchInput(),turn:0});assert.equal(denied.execution_supported,false);assert.equal(Object.isFrozen(denied),true);
});
