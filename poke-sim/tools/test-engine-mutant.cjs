// Test-process-only source transform. Never writes engine.js or golden fixtures.
const fs=require('node:fs'),path=require('node:path');
const original=fs.readFileSync, engine=path.resolve(__dirname,'../engine.js');
const mutations={
  encore_unburden:["_consumeHeldItem(target);target.encoredMove=null;target.encoredTurns=0;","target.itemConsumed=true;target.encoredMove=null;target.encoredTurns=0;"],
  encore_queue:["} else if (queued && queued.move!==last) {","} else if (false && queued && queued.move!==last) {"],
  encore_herb:["if (effects.item(target)==='Mental Herb') {","if (false && effects.item(target)==='Mental Herb') {"],
  encore_duration:["target.encoredTurns = queued ? 3 : 4;","target.encoredTurns = 3;"],
  encore_priority:["queued.dynamicPriority=true;","queued.dynamicPriority=false;queued.priority=0;"],
  rest_leaf_guard:["(ability === 'Leaf Guard' && _effectiveFieldWeather(field) === 'sun') || (grounded", "false || (grounded"],
  rest_admission:["if (sleepBlocked || attacker.status === 'sleep'", "if (false || attacker.status === 'sleep'"],
  struggle_fixed:["const _stDmg = captureBattleDamage(attacker, move, _struggleTgt, field, rng);","const _stDmg = Math.max(1, Math.floor(_struggleTgt.maxHp / 4));"],
  struggle_floor:["const _stRecoil = Math.max(1, Math.round(attacker.maxHp / 4));","const _stRecoil = Math.max(1, Math.floor(attacker.maxHp / 4));"],
  struggle_normal:["if (move === 'Struggle') return {type:'???',bpMult:1};","if (move === 'Struggle') return {type:'Normal',bpMult:1};"],
  tantrum_150_percent:["if (move === 'Stomping Tantrum' && (this.lastMoveFailed || this._previousMoveFailedForDamage)) {\n      bp *= 2;", "if (move === 'Stomping Tantrum' && (this.lastMoveFailed || this._previousMoveFailedForDamage)) {\n      bp *= 1.5;"],
  half_damage:['return finalDamage;','return Math.max(1, Math.floor(finalDamage / 2));'],
  hidden_read:['function _prepareDefaultDecision(actor, allies, enemies, field) {',
    'function _prepareDefaultDecision(actor, allies, enemies, field) { globalThis.__hiddenRead = enemies[0].moves;'],
  switch_noop:["const done = _switchOutActiveMon(switchPlan.actor, switchPlan.side==='player'?'player':'opp', field, log,\n        {cause:'scriptedDiagnostic',explicitReplacement:switchPlan.replacement});",'const done = true;']
};
const mutation=mutations[process.env.CHAMPIONS_TEST_MUTANT];
if(!mutation)throw Error('Unknown explicit test mutant');
let applied=0;
fs.readFileSync=function(file,...args){
  const value=original.call(this,file,...args);
  const name=file instanceof URL?require('node:url').fileURLToPath(file):String(file);
  if(path.resolve(name)!==engine)return value;
  const text=String(value).replace(/\r\n/g,'\n');
  if(text.split(mutation[0]).length!==2)throw Error('Mutation anchor missing or ambiguous');
  applied++;
  const changed=text.replace(mutation[0],mutation[1]);
  return typeof value==='string'?changed:Buffer.from(changed);
};
require('node:module').syncBuiltinESMExports();
process.on('exit',()=>{if(!applied){console.error('MUTATION_NOT_APPLIED');process.exitCode=97;}else console.error('MUTATION_APPLIED:'+process.env.CHAMPIONS_TEST_MUTANT);});
