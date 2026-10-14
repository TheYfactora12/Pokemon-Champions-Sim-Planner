const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {test}=require('node:test');
function harness(){
  const c=vm.createContext({console,Math,window:{}}),root=path.join(__dirname,'..');
  for(const f of ['data.js','generated/pokemon_showdown_legal_data.js','runtime_data.js','move_legality.js','generated/mc_review_reference.js','mc_review.js','legality.js','rulesets.js','engine.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);
  c.ChampionsSim.pokemonDataAudit=require('../generated/pokemon_showdown_legal_data.js');
  vm.runInContext('this.Pokemon=Pokemon;this.Field=Field;',c);return c;
}
const member=(name,item,ability)=>({name,item,ability,nature:'Hardy',level:50,evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0},moves:['Protect']});
function team(){return {name:'Synthetic reference fixture',format:'champions',import_context:{draft_only:true,regulation_id:'champions_reg_m_c_2026'},members:[
  member('Raichu-Mega-X','Raichunite X','Electric Surge'),member('Sneasler','Electric Seed','Unburden'),
  member('Pelipper','','Drizzle'),member('Farigiraf','Sitrus Berry','Armor Tail')]};}
const opts={format:'doubles',bo:1,rulesetId:'champions_mc_reference',maxTurns:2,seed:[3,7,11,13]};


test('practice and full registered-team scope are explicit',()=>{
 const c=harness(),small=team(),practice=c.checkMcReferenceExecution(small,opts);
 assert.equal(practice.allowed,true);assert.equal(practice.registration_scope,'reduced_roster_practice');
 assert.ok(practice.source_gaps.some(x=>x.includes('six registered')));
 assert.equal(c.checkMcReferenceExecution(small,{...opts,requireFullTeam:true}).allowed,false);
 const full=team();full.members.push(member('Rillaboom','Miracle Seed','Grassy Surge'),member('Incineroar','Leftovers','Intimidate'));
 for(const bo of [1,3]) {
  const check=c.checkMcReferenceExecution(full,{...opts,bo,requireFullTeam:true});assert.equal(check.allowed,true,check.errors.join(';'));
  assert.equal(check.registration_scope,'six_registered_reference');assert.equal(check.competitive_eligible,false);
  const bring=full.members.slice(0,4).map(m=>m.name);
  assert.equal(c.checkMcReferenceExecution(full,{...opts,bo,requireFullTeam:true,bring}).allowed,true);
  assert.equal(c.checkMcReferenceExecution(full,{...opts,bo,requireFullTeam:true,bring:[bring[0],bring[0],bring[1],bring[2]]}).allowed,false);
 }
 assert.equal(c.simulateBattle(small,full,{...opts,requireFullTeam:true}).result,'error');
 assert.equal(c.simulateBattle(full,small,{...opts,requireFullTeam:true}).result,'error');
});
