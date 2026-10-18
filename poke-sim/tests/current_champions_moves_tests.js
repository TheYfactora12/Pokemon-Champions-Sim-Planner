const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const c=vm.createContext({console,Math,window:{}}),root=path.join(__dirname,'..');
for(const f of ['data.js','generated/pokemon_showdown_legal_data.js','generated/champions_move_overrides.js','generated/champions_move_pools.js','runtime_data.js','move_legality.js','generated/mc_review_reference.js','mc_review.js','legality.js','rulesets.js','engine.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c,{filename:f});
const make=(name,ability,moves=['Protect'])=>({name,ability,moves,item:'',nature:'Hardy',level:50,evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0}});
const fillers=()=>[make('Pelipper','Drizzle'),make('Farigiraf','Armor Tail'),make('Garchomp','Rough Skin'),make('Incineroar','Intimidate'),make('Gholdengo','Good as Gold')];
const team=(m)=>({format:'champions',members:[m,...fillers()]});
let count=0;
function test(name,fn){try{fn();count++;console.log('PASS '+name);}catch(e){console.error('FAIL '+name+': '+e.message);process.exitCode=1;}}
for(const [name,ability,move,allowed] of [['Politoed','Drizzle','Pound',false],['Archaludon','Stamina','Mirror Coat',false],['Archaludon','Stamina','Metal Burst',false],['Archaludon','Stamina','Slash',true],['Clefable','Magic Guard','Wish',true],['Vileplume','Chlorophyll','Strength Sap',true]])test(name+' '+move,()=>{
 const t=team(make(name,ability,[move,'Protect'])),before=JSON.stringify(t);
 for(const lane of ['champions_custom_practice','champions_mc_reference'])assert.equal(c.checkTeamForSelectedRegulation(t,lane,{format:'doubles',bo:1}).allowed,allowed,lane);
 assert.equal(JSON.stringify(t),before);
});
for(const move of ['Wish','Strength Sap'])test(move+' explicit current PP',()=>{
 const m=make('Clefable','Magic Guard',[move]);
 const current=c.buildTeam(team(m),'player',null,'champions_custom_practice')[0];
 assert.equal(current.movePP[move].max,8);
 c._consumeSelectedMovePP(current,move,null,[]);assert.equal(current.movePP[move].current,7);
 assert.equal(c.buildTeam(team(m),'player')[0].movePP[move].max,12);
});
for(const side of ['player','opp'])for(const lane of [undefined,'champions_custom_practice','champions_mc_reference'])test(side+' Fly '+lane,()=>{
 const t=team(make('Dragonite','Inner Focus',['Fly','Sleep Talk'])),safe=team(make('Clefable','Magic Guard'));
 const r=c.simulateBattle(side==='player'?t:safe,side==='opp'?t:safe,{format:'doubles',bo:1,rulesetId:lane,maxTurns:1});
 assert.equal(r.result,'error');assert.equal(r.turns,0);assert.match(r.winCondition,/Fly.*not supported/);
});
console.log(count+' current move regressions passed');
test('overlay preserves historical pools and labels species evidence',()=>{
 const api=c.ChampionsSim.moveLegality;
 assert.equal(api.isMoveLegalForSpecies('Politoed','Pound',{learnsetContext:'champions'}).legal,true);
 assert.equal(api.isMoveLegalForSpecies('Archaludon','Slash',{learnsetContext:'champions'}).legal,false);
 const pool=api.resolveLearnsetPool('Archaludon',{learnsetContext:'champions_current'});
 assert.equal(pool.provenance.slash_species,'pinned_mc_reference_only');
 assert.equal(pool.sourceVersion,'2026-09-09');
 for(const [species,move,present] of [['Archaludon','Slash',true],['Archaludon','Metal Burst',false],['Politoed','Pound',false]]) {
  const choices=c.getRegulationChoices('move',species,'champions_custom_practice',false);
  assert.equal(choices.some(r=>r.name===move&&r.status==='reference_only'),present);
 }
});
test('simulation passes explicit current PP context to constructed battlers',()=>{
 const original=c.buildTeam,captured=[];
 c.buildTeam=function(...args){const mons=original(...args);captured.push(...mons);return mons;};
 try {
  const t=team(make('Clefable','Magic Guard',['Wish']));
  const r=c.simulateBattle(t,team(make('Vileplume','Chlorophyll')),{format:'doubles',rulesetId:'champions_custom_practice',maxTurns:1,seed:[3,7,11,13]});
  assert.notEqual(r.result,'error');assert.equal(captured.find(m=>m.name==='Clefable').movePP.Wish.max,8);
 }finally{c.buildTeam=original;}
});
for(const alias of ['Fly',' fly ','FLY'])for(const strict of [false,true])test('bench/omitted Fly '+alias+' strict='+strict,()=>{
 const t=team(make('Clefable','Magic Guard'));t.members[5]=make('Dragonite','Inner Focus',[alias]);
 const before=JSON.stringify(t),r=c.simulateBattle(t,team(make('Vileplume','Chlorophyll')),{format:'doubles',strict,playerBring:t.members.slice(0,4).map(m=>m.name)});
 assert.equal(r.result,'error');assert.equal(r.turns,0);assert.match(r.winCondition,/Fly simulation is not supported/);assert.equal(JSON.stringify(t),before);
 assert.equal(r.playerSurvivors,0);assert.equal(r.oppSurvivors,0);
});
test('saved draft remains intact and admission explains capability',()=>{
 const t=team(make('Dragonite','Inner Focus',['Fly']));t.import_context={draft_only:true,regulation_id:'champions_reg_m_c_2026'};
 const before=JSON.stringify(t);
 for(const lane of ['champions_custom_practice','champions_mc_reference']) {
  const r=c.checkTeamForSelectedRegulation(t,lane,{format:'doubles',bo:1});
  assert.equal(r.allowed,false);assert.ok(r.errors.some(e=>e.includes('Fly simulation is not supported')));
 }
 assert.equal(JSON.stringify(t),before);
});
test('forced Fly cannot fabricate a battle',()=>{
 const t=team(make('Clefable','Magic Guard'));
 const r=c.simulateBattle(t,t,{format:'doubles',forcedActions:[{move:'Fly',turn:1}]});
 assert.equal(r.result,'error');assert.equal(r.turns,0);assert.match(r.winCondition,/Fly simulation is not supported/);
});
console.log('TOTAL '+count+' current move regressions passed');
test('missing/malformed reference fails closed without throwing',()=>{
 const saved=c.MC_REVIEW_REFERENCE;
 try{for(const ref of [null,{}, {pin:saved.pin,species:{archaludon:{moves:null}}}]){
  c.MC_REVIEW_REFERENCE=ref;
  assert.equal(c.ChampionsSim.moveLegality.resolveLearnsetPool('Archaludon',{learnsetContext:'champions_current'}).status,'unchecked');
 }}finally{c.MC_REVIEW_REFERENCE=saved;}
 const verdict=c.ChampionsSim.moveLegality.isMoveLegalForSpecies('Archaludon','Slash',{learnsetContext:'champions_current'});
 assert.equal(verdict.provenance.slash_species,'pinned_mc_reference_only');
 assert.equal(c.getRegulationChoices('move','Archaludon','champions_custom_practice',false).find(r=>r.name==='Slash').provenance.slash_species,'pinned_mc_reference_only');
});
test('sweeps cannot convert unsupported battles into draw samples',()=>{
 const t=team(make('Dragonite','Inner Focus',['Fly']));
 assert.throws(()=>c.runMegaSweepCell(t,t,1,'at_turn',1,2),/Fly simulation is not supported/);
 assert.throws(()=>c.runMegaTriggerSweep(t,t,1,{}),/Fly simulation is not supported/);
});
console.log('FINAL '+count+' current move regressions passed');
test('UI intake context follows Practice while preserving explicit historical and SV teams',()=>{
 const ui=fs.readFileSync(path.join(root,'ui.js'),'utf8');
 const start=ui.indexOf('function csLearnsetOptionsForTeam('),end=ui.indexOf('\nfunction buildImportedTeamValidation',start);
 vm.runInContext(ui.slice(start,end),c);
 c.getSelectedRegulationId=()=> 'champions_custom_practice';
 assert.equal(c.csLearnsetOptionsForTeam({format:'champions'}).learnsetContext,'champions_current');
 assert.equal(c.csLearnsetOptionsForTeam({format:'champions',regulation_id:'champions_reg_m_a_2026'}).learnsetContext,'champions');
 assert.equal(c.csLearnsetOptionsForTeam({format:'sv'}).learnsetContext,'historical');
});
console.log('COMPLETE '+count+' current move regressions passed');
