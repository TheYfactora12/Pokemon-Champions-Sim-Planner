const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const s=fs.readFileSync(path.join(__dirname,'..','engine.js'),'utf8');
const c=vm.createContext({_movePPRemaining:()=>10,_moveType:()=> 'Normal',_moveCategory:()=> 'physical',_mcMoveUnavailable:()=>false,
 _isGrounded:m=>!m.flying,getPriority:move=>['Fake Out','Feint','Quick Attack'].includes(move)?3:0,rng:()=>.5});
vm.runInContext(s.slice(s.indexOf('function _selectionPriorityBlocked'),s.indexOf('function _mcMoveUnavailable'))+s.slice(s.indexOf('  function selectMove('),s.indexOf('  // EXECUTE ACTION'))+'\nthis.choose=selectMove;',c);
let count=0;
for(const ability of ['Armor Tail','Dazzling','Queenly Majesty']) for(const swap of [false,true]) {
 const field={playerSide:{},oppSide:{},terrain:'none'},own=swap?field.oppSide:field.playerSide,other=swap?field.playerSide:field.oppSide;
 const attacker={name:'Incineroar',side:own,moves:['Fake Out','Tackle'],hp:100,maxHp:100,alive:true,turnsSinceEntry:1};
 const target={side:other,ability,alive:true};other.activeMons=[target];
 assert.equal(c.choose(attacker,[attacker],[target],field).move,'Fake Out');
 assert.equal(c._selectionPriorityBlocked(attacker,'Fake Out',target,field),true,'execution blocker remains available');
 target.ability='';assert.equal(c._selectionPriorityBlocked(attacker,'Fake Out',target,field),false);
 other.quickGuard=true;assert.equal(c._selectionPriorityBlocked(attacker,'Fake Out',target,field),true);
 assert.equal(c.choose(attacker,[attacker],[target],field).move,'Fake Out','no live target protection preview');count++;
}
assert.equal(c._selectionPolicyProvenance(true).information_model,'own_state_public_field_target_slots');
assert.equal(c._selectionPolicyProvenance(true).forced_actions,true);
console.log(count+' side-swapped conservative priority decisions and execution helpers passed');

const full=vm.createContext({console,Math,window:{}});
for(const f of ['data.js','engine.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),full);
const legacy={wins:1,losses:0};
assert.equal(full.buildAnalysisPayload(legacy).policy_provenance,null);
const supplied={id:'historical-custom',information_model:'unknown'};
assert.equal(full.buildAnalysisPayload({...legacy,policy_provenance:supplied}).policy_provenance,supplied);
console.log('Legacy unknown and supplied policy provenance preserved');

// Full execution suppression parity is retained in priority_blocker_reference_tests.mjs.
for (const ability of ['Armor Tail', 'Dazzling', 'Queenly Majesty']) for (const swap of [false, true]) {
 const field={playerSide:{},oppSide:{},terrain:'none'},own=swap?field.oppSide:field.playerSide,other=swap?field.playerSide:field.oppSide;
 const attacker={name:'Liepard',side:own,ability:'Mold Breaker',moves:['Fake Out','Tackle'],hp:100,maxHp:100,alive:true,turnsSinceEntry:1,calcDamage:()=>20};
 const target={name:'Charizard',side:other,ability:'Blaze',alive:true,hp:100,maxHp:100};
 const blocker={name:'Snorlax',side:other,ability,alive:true};
 const gas={name:'Weezing',side:own,ability:'Neutralizing Gas',alive:true};
 own.activeMons=[attacker];other.activeMons=[target,blocker];
 assert.equal(c._selectionPriorityBlocked(attacker,'Fake Out',target,field),false);
 target.item='Ability Shield';assert.equal(c._selectionPriorityBlocked(attacker,'Fake Out',target,field),false);
 blocker.item='Ability Shield';assert.equal(c._selectionPriorityBlocked(attacker,'Fake Out',target,field),true);
 blocker.itemConsumed=true;assert.equal(c._selectionPriorityBlocked(attacker,'Fake Out',target,field),false);
 blocker.item='';blocker.itemConsumed=false;attacker.ability='Limber';
 assert.equal(c._selectionPriorityBlocked(attacker,'Fake Out',target,field),true);
 own.activeMons.push(gas);assert.equal(c._selectionPriorityBlocked(attacker,'Fake Out',target,field),false);
 blocker.item='Ability Shield';assert.equal(c._selectionPriorityBlocked(attacker,'Fake Out',target,field),true);
 blocker.item='';gas.alive=false;assert.equal(c._selectionPriorityBlocked(attacker,'Fake Out',target,field),true);
 gas.alive=true;own.activeMons=[attacker];assert.equal(c._selectionPriorityBlocked(attacker,'Fake Out',target,field),true);
 own.activeMons.push(gas);assert.equal(c._selectionPriorityBlocked(attacker,'Fake Out',target,field),false);
 other.quickGuard=true;assert.equal(c._selectionPriorityBlocked(attacker,'Fake Out',target,field),true);
 other.quickGuard=false;field.terrain='psychic';assert.equal(c._selectionPriorityBlocked(attacker,'Fake Out',target,field),true);
 field.terrain='none';own.activeMons=[attacker];blocker.alive=false;
 assert.equal(c._selectionPriorityBlocked(attacker,'Fake Out',target,field),false);
}
console.log('78 execution-helper suppression assertions passed across three blockers and both sides');
