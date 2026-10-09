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

test('Mega admission is invariant to case and normalized identifiers',()=>{
  const c=harness();
  for(const name of ['Raichu-Mega-Y','raichu-mega-y','RAICHU-MEGA-Y','raichumegay','  RaIcHu-MeGa-Y  ']) {
    const t=team();t.members[0]=member(name,'Raichunite Y','No Guard');
    const result=c.checkMcReferenceExecution(t,opts);
    assert.equal(result.allowed,false,name);
    assert.match(result.errors.join(' '),/Mega lifecycle not implemented/);
    assert.equal(c.simulateBattle(t,team(),opts).result,'error');
    assert.equal(c.simulateBattle(team(),t,opts).result,'error');
  }
  for(const name of ['Raichu-Mega-X','raichu-mega-x','RAICHUMEGAX']) {
    const t=team();t.members[0]=member(name,'Raichunite X','Electric Surge');
    assert.equal(c.checkMcReferenceExecution(t,opts).allowed,true,name);
    const before=JSON.stringify(t),p=new c.Pokemon(t.members[0],'','champions',opts.rulesetId);
    assert.equal(p.name,'Raichu');assert.equal(p._base.atk,90);
    assert.equal(p.megaEvolve([]),true);assert.equal(p.name,'Raichu-Mega-X');
    assert.equal(p.megaEvolve([]),false);assert.equal(JSON.stringify(t),before);
  }
});

test('null stone metadata does not crash ordinary non-Mega admission',()=>{
  const c=harness();c.ChampionsSim.pokemonDataAudit.items.magnet.megaStone=null;
  assert.equal(c.resolveMcMega('Pelipper','Magnet').required,false);
  assert.equal(c.resolveMcMega('Pelipper','Magnet').form,null);
});

test('base plus stone resolves supported lifecycle or explicitly rejects unsupported form',()=>{
  const c=harness();
  for(const [name,item,ability] of [['Raichu','Raichunite Y','Static']]) {
    const t=team();t.members[0]=member(name,item,ability);
    assert.match(c.checkMcReferenceExecution(t,opts).errors.join(' '),/Mega lifecycle not implemented/);
  }
  const t=team();t.members[0]=member('Charizard','Charizardite X','Blaze');
  assert.equal(c.checkMcReferenceExecution(t,opts).allowed,true);
  const p=new c.Pokemon(t.members[0],'','champions',opts.rulesetId);
  assert.equal(p.name,'Charizard');assert.equal(p.ability,'Blaze');
  assert.equal(p.megaEvolve([]),true);assert.equal(p.name,'Charizard-Mega-X');
  assert.equal(p.ability,'Tough Claws');assert.equal(p.megaEvolve([]),false);
  const y=new c.Pokemon(member('Charizard','Charizardite Y','Blaze'),'','champions',opts.rulesetId);
  assert.equal(y.megaEvolve([]),true);assert.equal(y.name,'Charizard-Mega-Y');
  assert.equal(y.ability,'Drought');
  for(const [name,item,ability] of [['Dragonite','Dragoninite','Inner Focus'],['Clefable','Clefablite','Magic Guard']]) {
    const set=member(name,item,ability),mon=new c.Pokemon(set,'','champions',opts.rulesetId);
    assert.equal(mon.name,name);assert.equal(mon.ability,ability);
    assert.equal(mon.megaEvolve([]),true);assert.equal(mon.name,name+'-Mega');
  }
  const ordinary=new c.Pokemon(member('Pelipper','Charizardite X','Drizzle'),'','champions',opts.rulesetId);
  assert.equal(ordinary.megaForm,null,'wrong species cannot use another species stone');
});

test('base/stone battle keeps registration, delays evolution and limits each side to one',()=>{
  const c=harness(),t=team();t.members[0]=member('Charizard','Charizardite X','Blaze');
  const before=JSON.stringify(t),r=c.simulateBattle(t,t,{...opts,_megaPolicyOverride:{side:'player',policy:'at_turn',triggerTurn:2}});
  assert.notEqual(r.result,'error',r.winCondition);
  assert.equal(r.turnLog[0].post.roster.player[0].ability,'Blaze');
  assert.equal(r.turnLog[1].post.roster.player[0].ability,'Tough Claws');
  assert.equal(r.log.filter(s=>s.includes('Mega Evolved')).length,2);
  assert.equal(JSON.stringify(t),before);
  t.members[1]=member('Raichu','Raichunite X','Static');
  const two=c.simulateBattle(t,t,opts);
  assert.notEqual(two.result,'error',two.winCondition);
  assert.equal(two.log.filter(s=>s.includes('Mega Evolved')).length,2);
});
test('reference selection allows checked draft but official, historical and missing opt-in do not',()=>{
  const c=harness(),t=team(),before=JSON.stringify(t);
  assert.equal(c.checkTeamForSelectedRegulation(t,opts.rulesetId,opts).allowed,true);
  for(const id of ['champions_reg_m_c_2026','champions_custom_practice','champions_reg_m_a_2026','unknown'])assert.equal(c.checkTeamForSelectedRegulation(t,id,opts).allowed,false);
  assert.equal(c.simulateBattle(t,t,{format:'doubles',maxTurns:1}).result,'error');
  assert.equal(JSON.stringify(t),before);
  assert.equal(c.getRulesetEvidencePolicy(opts.rulesetId).data_policy,'do_not_write_trusted_stats');
});
test('Raichu reference transition preserves registration and activates terrain/seed once',()=>{
  const c=harness(),t=team(),before=JSON.stringify(t);
  const p=new c.Pokemon(t.members[0],'','champions',opts.rulesetId);
  assert.equal(p.name,'Raichu');assert.equal(p.ability,'Static');assert.equal(p._base.atk,90);
  const field=new c.Field();p.megaEvolve([],field);assert.equal(p.name,'Raichu-Mega-X');assert.equal(p.ability,'Electric Surge');assert.equal(p._base.atk,135);
  assert.equal(p.megaEvolve([],field),false);
  assert.equal(p.weightkg,38);
  assert.equal(c.CHAMPIONS_MEGAS['Raichu-Mega-X'],undefined);
  const r=c.simulateBattle(t,t,opts);
  assert.notEqual(r.result,'error',r.winCondition);assert.equal(r.reference_policy.trusted_rankings,false);
  assert.ok(r.log.some(s=>s.includes('Raichu-Mega-X Mega Evolved')));
  assert.ok(r.log.some(s=>s.includes('Electric Seed')));
  assert.equal(r.turnLog[0].post.roster.player[0].ability,'Electric Surge');
  assert.equal(r.turnLog[0].post.roster.player[1].itemConsumed,true);
  assert.equal(JSON.stringify(t),before);
});
test('invalid sets, unsupported Mega, wrong stone, scope and missing pin fail closed',()=>{
  const c=harness();
  for(const mutation of [t=>t.members[0].item='Magnet',t=>t.members[0].name='Unknown',t=>t.members[1].evs.atk=33,t=>t.members[1].moves=['Spore'],t=>t.members[1].nature='Invented',t=>t.import_context.regulation_id='unknown',t=>t.members[1].species='Rillaboom',t=>t.members[1].moves=['Protect','protect']]){
    const t=team();mutation(t);assert.equal(c.checkMcReferenceExecution(t,opts).allowed,false);assert.equal(c.simulateBattle(t,team(),opts).result,'error');
  }
  assert.equal(c.checkMcReferenceExecution(team(),{...opts,format:'singles'}).allowed,false);
  assert.equal(c.checkMcReferenceExecution(team(),{...opts,bring:['Raichu-Mega-X']}).allowed,false);
  c.MC_REVIEW_REFERENCE.pin='changed';assert.equal(c.checkMcReferenceExecution(team(),opts).allowed,false);
  c.MC_REVIEW_REFERENCE=null;assert.equal(c.checkMcReferenceExecution(team(),opts).allowed,false);
});
test('base Raichu registration retains selected base ability until Mega',()=>{
  const c=harness();
  for(const ability of ['Static','Lightning Rod']) {
    const m=member('Raichu','Raichunite X',ability),before=JSON.stringify(m);
    const p=new c.Pokemon(m,'','champions',opts.rulesetId);
    assert.equal(p.name,'Raichu');assert.equal(p.ability,ability);
    assert.equal(p.megaEvolve([]),true);assert.equal(p.name,'Raichu-Mega-X');assert.equal(p.ability,'Electric Surge');
    assert.equal(JSON.stringify(m),before);
  }
});
test('reference replay is repeatable and caller cannot enable trusted evidence',()=>{
  const c=harness(),t=team(),a=c.simulateBattle(t,t,opts),b=c.simulateBattle(t,t,opts);
  assert.equal(JSON.stringify(a.turnLog),JSON.stringify(b.turnLog));
  assert.equal(a.legality.player.valid,false);
  assert.equal(c.getSimulationEvidencePolicy({ruleset_id:opts.rulesetId},[]).data_policy,'do_not_write_trusted_stats');
});
test('run-all partitions opponents, reports skips and avoids database writes',async()=>{
  const file=path.join(__dirname,'t9j11_tests.js'),src=fs.readFileSync(file,'utf8');
  const host=vm.createContext({require:require('node:module').createRequire(file),__dirname,console,setTimeout,setInterval,clearTimeout,clearInterval});
  vm.runInContext(src.slice(0,src.indexOf('// Expose ctx-scoped'))+'\nthis.context=ctx;',host);
  const c=host.context;
  let calls=0,writes=0,note='';
  c.getSelectedRegulationId=()=>opts.rulesetId;
  const catalogKeys=vm.runInContext('Object.keys(TEAMS)',c);
  assert.deepEqual(Array.from(c.getRunAllOpponentKeys('subject',{simScope:'all'})),Array.from(catalogKeys));
  assert.equal(c.isVisibleTeamInCatalog('hidden',{name:'Hidden historical set',format:'champions',legality_status:'illegal',members:[]},{includeCustom:true}),true);
  c.getSelectedRegulationId=()=> 'champions_custom_practice';
  assert.equal(c.isVisibleTeamInCatalog('hidden',{name:'Hidden historical set',format:'champions',legality_status:'illegal',members:[]},{includeCustom:true}),false);
  c.getSelectedRegulationId=()=>opts.rulesetId;c.getRunAllOpponentKeys=()=>['good','bad'];
  c.checkTeamForSelectedRegulation=t=>({allowed:t.name!=='bad',errors:t.name==='bad'?['fixture conflict']:[],source_gaps:[]});
  c.csSetSimBudgetNote=s=>{note=s;};c.getWindowValue=()=>({enabled:true,saveAnalysis:()=>{writes++;}});
  vm.runInContext("TEAMS.good={name:'good'};TEAMS.bad={name:'bad'};TEAMS.subject={name:'subject'};",c);
  c.runBoSeries=async()=>{calls++;return {provenance:{},logs:[{provenance:{}}]};};
  const results=[];
  await c.runAllMatchupsUI(1,1,null,(key,r)=>results.push(r),{playerKey:'subject'});
  assert.equal(calls,1);assert.equal(writes,0);assert.match(note,/1 opponents included; 1 excluded/);
  assert.equal(results[0].provenance.reference_exclusions[0].team_id,'bad');
  assert.equal(results[0].logs[0].provenance.reference_exclusions.length,1);
  c.getSelectedRegulationId=()=> 'champions_custom_practice';c.getRunAllOpponentKeys=()=>['good'];
  c._buildAnalysisPayload=()=>({test:true});
  await c.runAllMatchupsUI(1,1,null,()=>{},{playerKey:'subject'});
  assert.equal(writes,1,'ordinary path is a working positive adapter control');
});
test('delayed Mega does not activate terrain or seed on the earlier turn',()=>{
  const c=harness(),p=team(),o=team();o.members[0]=member('Raichu','','Static');
  const r=c.simulateBattle(p,o,{...opts,_megaPolicyOverride:{side:'player',policy:'at_turn',triggerTurn:2}});
  assert.notEqual(r.result,'error',r.winCondition);
  assert.equal(r.turnLog[0].post.roster.player[0].ability,'Static');
  assert.equal(r.turnLog[0].post.roster.player[1].itemConsumed,false);
  assert.equal(r.turnLog[1].post.roster.player[0].ability,'Electric Surge');
  assert.equal(r.turnLog[1].post.roster.player[1].itemConsumed,true);
});
