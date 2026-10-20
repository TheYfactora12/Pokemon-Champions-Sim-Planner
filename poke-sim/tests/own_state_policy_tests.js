'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const policy=require('../own_state_policy.js');
const mon=()=>({moves:['Tackle','Imprison'],movePP:{Tackle:{current:10},Imprison:{current:10}},
  item:'',ability:'',itemConsumed:false,turnsSinceEntry:2});
const status=name=>name==='Imprison'||name==='Sleep Talk'?'status':'physical';
let count=0;
function test(name,run){run();count++;console.log('PASS '+name);}
test('detached inputs, no live side/callback/method references and no RNG',()=>{
  const m=mon();Object.defineProperty(m,'side',{get(){throw Error('Live side read');}});
  Object.defineProperty(m,'calcDamage',{get(){throw Error('Damage method read');}});
  const slots=[0,1],input=policy.prepare(m,slots,status),before=JSON.stringify(input);
  m.moves.reverse();m.movePP.Tackle.current=0;slots.reverse();
  assert.equal(JSON.stringify(input),before);
  assert(Object.isFrozen(input)&&Object.isFrozen(input.moves)&&Object.isFrozen(input.moves[0]));
  const result=policy.choose(input);
  assert.equal(result.move,'Tackle');assert.equal(result.targetSlot,0);assert(Object.isFrozen(result));
  for(let i=0;i<100;i++) assert.deepEqual(policy.choose(input),result);
  assert.throws(()=>policy.choose({...input}),/frozen/);
});
test('own PP, locks, charge, Taunt, entry turn and sleep are explicit',()=>{
  const m=mon(),choose=()=>policy.choose(policy.prepare(m,[1],status));
  m.movePP.Tackle.current=0;assert.equal(choose().move,'Imprison');
  m.tauntedTurns=2;assert.equal(choose().move,'Struggle');
  m.tauntedTurns=0;m.movePP.Tackle.current=10;m.item='Choice Scarf';m.choiceLock='Imprison';assert.equal(choose().move,'Imprison');
  m.itemConsumed=true;assert.equal(choose().move,'Tackle');
  m.encoredTurns=2;m.encoredMove='Imprison';assert.equal(choose().move,'Imprison');
  m.movePP.Imprison.current=0;assert.equal(choose().move,'Struggle');
  m.chargingMove='Solar Beam';m.chargingTargetSide='ally';m.chargingTargetSlot=1;
  assert.deepEqual(choose(),{move:'Solar Beam',targetSide:'ally',targetSlot:1});
  m.chargingMove=null;m.encoredTurns=0;m.moves=['Fake Out','Tackle'];m.movePP['Fake Out']={current:10};
  assert.equal(choose().move,'Tackle');m.turnsSinceEntry=1;assert.equal(choose().move,'Fake Out');
  m._fakeDone=true;assert.equal(choose().move,'Tackle');
  m.moves=['Tackle','Sleep Talk'];m.movePP['Sleep Talk']={current:10};m.status='sleep';assert.equal(choose().move,'Sleep Talk');
});
test('side order and hidden live fields do not influence the pure turn adapter',()=>{
  const a=mon(),b=mon();a.alive=b.alive=true;
  for(const m of [a,b]) for(const key of ['side','calcDamage','baseDef','baseSpd','_chosenMove'])
    Object.defineProperty(m,key,{get(){throw Error('Forbidden live field '+key);}});
  const first=policy.turn([a],[b],status),reversed=policy.turn([b],[a],status);
  assert.deepEqual(first.get(a),reversed.get(a));assert.deepEqual(first.get(b),reversed.get(b));
  const original=Math.random;Math.random=()=>{throw Error('Decision consumed random draw');};
  try{assert.deepEqual(policy.turn([a],[b],status).get(a),first.get(a));}finally{Math.random=original;}
  a.chargingMove={hidden:'must not cross boundary'};
  assert.equal(policy.prepare(a,[0],status).charge,null);
  assert.throws(()=>policy.prepare(a,[{}],status),/Invalid/);
});
const c=vm.createContext({console,Math,window:{}});
for(const f of ['data.js','generated/pokemon_showdown_legal_data.js','runtime_data.js','own_state_policy.js','engine.js'])
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),c,{filename:f});
const member=(name,moves,ability='Pressure',item='')=>({name,moves,ability,item,nature:'Hardy',evs:{}});
const team=members=>({format:'champions',members});
const observer=team([member('Garchomp',['Earthquake','Dragon Claw'],'Sand Veil'),member('Blissey',['Splash'],'Natural Cure'),
  member('Pikachu',['Protect'],'Static'),member('Gengar',['Protect'],'Cursed Body')]);
test('both sides are snapshotted before the first choice',()=>{
  const a=mon(),b=mon();a.alive=b.alive=true;
  const api=c.OwnStatePolicy;let decisions=0;
  c.OwnStatePolicy={...api,choose(input){if(decisions++===0)b.movePP.Tackle.current=0;return api.choose(input);}};
  try{assert.equal(c.OwnStatePolicy.turn([a],[b],status).get(b).move,'Tackle');}
  finally{c.OwnStatePolicy=api;}
});
for(const swap of [false,true]) test('actual engine hidden-state mutation invariant side='+swap,()=>{
  let baseline;
  for(let i=0;i<20;i++){
    const other=team([member('Snorlax',i%2?['Protect']:['Tackle'],i%2?'Levitate':'Immunity',i%2?'Focus Sash':'Leftovers'),
      member('Chansey',['Splash'],'Natural Cure'),member('Charizard',[i%2?'Protect':'Tackle'],'Blaze'),member('Venusaur',['Protect'],'Overgrow')]);
    other.members[0].evs={hp:i,def:i,spd:i};
    const inputs=swap?[other,observer]:[observer,other],original=JSON.stringify(inputs),records=[];
    const api=c.OwnStatePolicy;
    c.OwnStatePolicy={...api,choose(input){records.push({input,choice:api.choose(input)});return api.choose(input);}};
    let result;
    try {result=c.simulateBattle(...inputs,{format:'doubles',decisionPolicy:policy.id,maxTurns:1,seed:[8,3,12,7]});}
    finally{c.OwnStatePolicy=api;}
    assert.notEqual(result.result,'error');assert.equal(records.length,4,'both sides use isolated chooser');
    const mine=records.slice(swap?2:0,swap?4:2);
    baseline??=JSON.stringify(mine);assert.equal(JSON.stringify(mine),baseline);
    assert.equal(result.policy_provenance.id,policy.id);
    assert.equal(result.policy_provenance.information_model,'own_registered_state_and_active_target_slots');
    assert.equal(JSON.stringify(inputs),original);
  }
});
test('default uses conservative own/public policy; unknown or missing diagnostic module fails closed',()=>{
  const opts={format:'doubles',maxTurns:1,seed:[8,3,12,7]};
  assert.equal(c.simulateBattle(observer,observer,opts).policy_provenance.id,'own-public-heuristic-v4');
  const wrong=c.simulateBattle(observer,observer,{...opts,decisionPolicy:'typo'});
  assert.equal(wrong.result,'error');assert.equal(wrong.turns,0);
  const api=c.OwnStatePolicy;c.OwnStatePolicy=undefined;
  try {assert.equal(c.simulateBattle(observer,observer,{...opts,decisionPolicy:policy.id}).result,'error');}
  finally {c.OwnStatePolicy=api;}
});
test('explicit forced action is labeled and overrides only its selected actor',()=>{
  const result=c.simulateBattle(observer,observer,{format:'doubles',maxTurns:1,seed:[8,3,12,7],
    decisionPolicy:policy.id,forcedActions:[{turn:1,side:'player',slot:0,move:'Dragon Claw',targetSlot:0}]});
  assert.equal(result.policy_provenance.forced_actions,true);
  assert(result.turnLog[0].damage_events.some(e=>e.move==='Dragon Claw'));
});
// No UI/batch admission: prevent a requested diagnostic run being relabeled greedy.
assert.rejects(c.runSimulation(1,'unused','unused',null,{decisionPolicy:policy.id}),/direct simulateBattle/)
  .then(()=>console.log(count+' own-state diagnostic groups passed; aggregate rejection passed'))
  .catch(error=>{console.error(error);process.exitCode=1;});
