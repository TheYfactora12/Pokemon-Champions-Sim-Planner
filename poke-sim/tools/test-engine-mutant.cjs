// Test-process-only source transform. Never writes engine.js or golden fixtures.
const fs=require('node:fs'),path=require('node:path');
const original=fs.readFileSync, engine=path.resolve(__dirname,'../engine.js');
const mutations={
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
