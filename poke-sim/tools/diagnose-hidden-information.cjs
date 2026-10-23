'use strict';
// Diagnostic only: records current leakage; does not bless it as desired behavior.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const engine=fs.readFileSync(path.join(__dirname,'..','engine.js'),'utf8');
const ctx=vm.createContext({_movePPRemaining:()=>10,_moveType:()=> 'Normal',_moveCategory:m=>m==='Imprison'?'status':'physical',_mcMoveUnavailable:()=>false,_effectiveFieldWeather:()=>null,_isGrounded:()=>true,getPriority:()=>0,rng:()=>.5});
vm.runInContext(engine.slice(engine.indexOf('function _selectionPriorityBlocked'),engine.indexOf('function _mcMoveUnavailable'))+engine.slice(engine.indexOf('  function selectMove('),engine.indexOf('  // EXECUTE ACTION'))+'\nthis.choose=selectMove;',ctx);
const rows=[];
for(const side of ['player','opponent']) {
 const field={playerSide:{},oppSide:{}},own=side==='player'?field.playerSide:field.oppSide,other=side==='player'?field.oppSide:field.playerSide;
 const attacker={name:'Observer',side:own,moves:['Imprison','Tackle'],hp:100,maxHp:100,alive:true,turnsSinceEntry:2,calcDamage:()=>5};
 const enemy={name:'Same visible opponent',side:other,moves:['Tackle'],hp:100,maxHp:100,alive:true,types:['Normal']};other.activeMons=[enemy];own.activeMons=[attacker];
 const matching=ctx.choose(attacker,[attacker],[enemy],field).move;
 enemy.moves=['Scratch'];const nonmatching=ctx.choose(attacker,[attacker],[enemy],field).move;
 rows.push({side,public_state_unchanged:true,unrevealed_moves_changed:true,matching,nonmatching,hidden_move_invariant:matching===nonmatching});
}
console.log(JSON.stringify({scope:'isolated current selector; synthetic fixture, not Champions gameplay proof',policy:ctx._selectionPolicyProvenance(false),cases:rows},null,2));
