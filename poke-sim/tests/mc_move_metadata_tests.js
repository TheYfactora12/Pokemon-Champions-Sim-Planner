// Pinned M-C metadata differences (efe4948570d5e8189751792136d26e71710c6c66).
// Synthetic accessor probes; not effect parity or official package approval.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const c = vm.createContext({console, Math, window: {}});
for (const file of ['data.js','generated/pokemon_showdown_legal_data.js',
  'generated/champions_move_overrides.js','runtime_data.js','mc_review.js',
  'generated/mc_review_reference.js','engine.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),c);
}
vm.runInContext('this.Pokemon=Pokemon;this.Field=Field;',c);
const actor = {referenceMode:'champions_mc_reference'};
const powers = {'Apple Acid':90,'Beak Blast':120,'Bone Rush':30,'Fire Lash':90,
  'First Impression':100,'Grav Apple':90,'Infernal Parade':65,'Mountain Gale':120,
  'Night Daze':90,'Psyshield Bash':90,'Slash':80,'Snipe Shot':85,'Spirit Shackle':90,'Trop Kick':85};
let count=0;
function check(name, fn) {fn();count++;console.log('PASS '+name);}
for (const [move, expected] of Object.entries(powers)) check(move+' scoped base power',()=>{
  assert.equal(c._moveBasePower(move,actor),expected);
  assert.equal(c._moveBasePower(move),c.ChampionsSim.runtimeData.getMoveBasePower(move),'historical/default metadata unchanged');
});
for (const [move,expected] of [['Crabhammer',.95],['Make It Rain',.95],['Syrup Bomb',.90]]) check(move+' scoped accuracy',()=>{
  assert.equal(c._moveAccuracy(move,undefined,actor),expected);
});
for (const [move,expected] of [['Growth','Grass'],['Snap Trap','Steel']]) check(move+' scoped type',()=>{
  assert.equal(c._moveType(move,actor),expected);
});
check('Clangorous Soul never-miss metadata',()=>assert.equal(c._moveNeverMiss('Clangorous Soul',actor),true));
for (const move of ['Strength Sap','Wish']) check(move+' constructor maximum PP',()=>{
  const set={name:'Smeargle',moves:[move],ability:'Own Tempo',item:'',nature:'Hardy',evs:{}};
  const mon=new c.Pokemon(set,'','champions','champions_mc_reference');
  assert.equal(mon.movePP[move].max,8);
  assert.equal(new c.Pokemon(set,'','champions').movePP[move].max,12,'legacy context unchanged');
});
check('unrecognized reference contexts cannot change metadata',()=>{
  for(const referenceMode of [undefined,'champions_reg_m_b_2026','champions_reg_m_c_2026','other']) {
    assert.equal(c._moveBasePower('Apple Acid',{referenceMode}),80);
  }
});
check('runtime accuracy obeys the M-C threshold rather than stale caller accuracy',()=>{
  const attacker={...actor,statBoosts:{},ability:''},target={ability:'',statBoosts:{}};
  assert.equal(c._moveHits(attacker,target,'Make It Rain',new c.Field(),()=>.96,1),false);
  assert.equal(c._moveHits(attacker,target,'Make It Rain',new c.Field(),()=>.94,1),true);
});
console.log(`${count} scoped M-C metadata checks passed.`);
