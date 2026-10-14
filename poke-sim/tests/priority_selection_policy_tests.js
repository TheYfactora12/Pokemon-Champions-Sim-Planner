const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const s=fs.readFileSync(path.join(__dirname,'..','engine.js'),'utf8');
const c=vm.createContext({_movePPRemaining:()=>10,_moveType:()=> 'Normal',_moveCategory:()=> 'physical',_mcMoveUnavailable:()=>false,
 _isGrounded:m=>!m.flying,getPriority:move=>['Fake Out','Feint','Quick Attack'].includes(move)?3:0,rng:()=>.5});
vm.runInContext(s.slice(s.indexOf('function _selectionPriorityBlocked'),s.indexOf('function _mcMoveUnavailable'))+s.slice(s.indexOf('  function selectMove('),s.indexOf('  // EXECUTE ACTION'))+'\nthis.choose=selectMove;',c);
let count=0;
for(const ability of ['Armor Tail','Dazzling','Queenly Majesty']) for(const swap of [false,true]) {
 const field={playerSide:{},oppSide:{},terrain:'none'},own=swap?field.oppSide:field.playerSide,other=swap?field.playerSide:field.oppSide;
 const attacker={name:'Incineroar',side:own,moves:['Fake Out','Tackle'],hp:100,maxHp:100,alive:true,turnsSinceEntry:1,calcDamage:()=>20};
 const target={name:'Farigiraf',side:other,ability,alive:true,hp:100,maxHp:100};other.activeMons=[target];
 assert.equal(c.choose(attacker,[attacker],[target],field).move,'Tackle');
 attacker.moves=['Fake Out'];assert.equal(c.choose(attacker,[attacker],[target],field).move,'Fake Out');
 attacker.moves=['Fake Out','Tackle'];target.ability='';assert.equal(c.choose(attacker,[attacker],[target],field).move,'Fake Out');
 other.quickGuard=true;assert.equal(c.choose(attacker,[attacker],[target],field).move,'Tackle');
 other.quickGuard=false;field.terrain='psychic';assert.equal(c.choose(attacker,[attacker],[target],field).move,'Tackle');
 target.flying=true;assert.equal(c.choose(attacker,[attacker],[target],field).move,'Fake Out');count++;
}
assert.equal(c._selectionPolicyProvenance(true).information_model,'full_registered_state');assert.equal(c._selectionPolicyProvenance(true).forced_actions,true);
console.log(count+' side-swapped priority policy scenarios and provenance passed');

const full=vm.createContext({console,Math,window:{}});
for(const f of ['data.js','engine.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),full);
const legacy={wins:1,losses:0};
assert.equal(full.buildAnalysisPayload(legacy).policy_provenance,null);
const supplied={id:'historical-custom',information_model:'unknown'};
assert.equal(full.buildAnalysisPayload({...legacy,policy_provenance:supplied}).policy_provenance,supplied);
console.log('Legacy unknown and supplied policy provenance preserved');

for(const swap of [false,true]) {
 const field={playerSide:{},oppSide:{},terrain:'psychic'},own=swap?field.oppSide:field.playerSide,other=swap?field.playerSide:field.oppSide;
 const attacker={name:'Mew',side:own,moves:['Fake Out','Tackle'],hp:100,maxHp:100,alive:true,turnsSinceEntry:1,calcDamage:()=>20};
 const grounded={name:'Snorlax',side:other,alive:true,hp:100,maxHp:100},flying={...grounded,name:'Charizard',flying:true};other.activeMons=[grounded,flying];
 assert.equal(c.choose(attacker,[attacker],[grounded,flying],field).target,flying);
 attacker.item='Choice Scarf';attacker.choiceLock='Fake Out';assert.equal(c.choose(attacker,[attacker],[grounded],field).move,'Fake Out');
 attacker.item='';attacker.encoredTurns=2;attacker.encoredMove='Fake Out';assert.equal(c.choose(attacker,[attacker],[grounded],field).move,'Fake Out');attacker.encoredTurns=0;
 field.terrain='none';other.quickGuard=true;assert.equal(c._selectionPriorityBlocked(attacker,'Feint',grounded,field),false);
 attacker.moves=['Quick Attack','Tackle'];assert.equal(c.choose(attacker,[attacker],[grounded],field).move,'Tackle');
 other.quickGuard=false;other.activeMons=[grounded,{ability:'Armor Tail',alive:false}];assert.equal(c._selectionPriorityBlocked(attacker,'Quick Attack',grounded,field),false);
}
console.log('Side-swapped target, locks, Feint, other priority and fainted-blocker boundaries passed');
