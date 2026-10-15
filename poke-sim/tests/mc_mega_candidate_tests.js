const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const root = path.resolve(__dirname, '..');
function reference() {
  const c = vm.createContext({console});
  for (const file of ['data.js','generated/pokemon_showdown_legal_data.js','runtime_data.js','move_legality.js','generated/mc_review_reference.js','mc_review.js','legality.js','rulesets.js','engine.js']) {
    vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c);
  }
  return c;
}
test('Mega ability pools use the exact registered form rather than taxonomic base', () => {
  const c=reference(), rows=c.MC_REVIEW_REFERENCE.species;
  assert(rows.meowsticfmega.abilities.includes('competitive'));
  assert(!rows.meowsticfmega.abilities.includes('prankster'));
  assert(rows.meowsticmmega.abilities.includes('prankster'));
  assert(!rows.meowsticmmega.abilities.includes('competitive'));
  assert.deepEqual(Array.from(rows.floettemega.abilities),['fairyaura','flowerveil','symbiosis']);
  for (const [name,good,bad] of [['Meowstic-F-Mega','Competitive','Prankster'],['Meowstic-M-Mega','Prankster','Competitive']]) {
    const team=ability=>({format:'champions',members:[{name,ability,item:'Meowsticite',moves:['Protect']}]});
    assert.deepEqual(Array.from(c.reviewMcTeam(team(good),c.MC_REVIEW_REFERENCE)[0].issues),[]);
    assert(c.reviewMcTeam(team(bad),c.MC_REVIEW_REFERENCE)[0].issues.includes('Ability outside reference pool'));
  }
});
const catalog=()=>JSON.parse(fs.readFileSync(path.join(root,'source/reg-m-c-mega-descriptor-candidates.json'),'utf8'));
test('candidate inventory is complete, unique, quarantined and keeps exact starting identities', () => {
  const packet=catalog(), rows=packet.candidates;
  assert.equal(rows.length,22); assert.equal(new Set(rows.map(r=>r.id)).size,22);
  assert.equal(packet.execution_enabled,false); assert.equal(packet.competitive_use,false);
  assert.equal(rows.filter(r=>r.legacy_alias).length,3);
  for(const r of rows) {
    assert.equal(r.execution_enabled,false);assert.equal(r.competitive_use,false);
    assert.equal(r.review_status,'descriptor_candidate_not_lifecycle_proof');
    assert(r.required_item && r.registered_form && r.weightkg>0);
    assert.deepEqual(Object.keys(r.stats).sort(),['atk','def','hp','spa','spd','spe']);
  }
  const byName=name=>rows.find(r=>r.name===name);
  assert.equal(byName('Floette-Mega').registered_form,'Floette-Eternal');
  assert.equal(byName('Meowstic-F-Mega').registered_form,'Meowstic-F');
  assert.equal(byName('Meowstic-M-Mega').registered_form,'Meowstic');
  assert.equal(byName('Meowstic-F-Mega').registered_abilities.H,'Competitive');
  assert.equal(byName('Meowstic-M-Mega').registered_abilities.H,'Prankster');
  assert.deepEqual(byName('Meowstic-F-Mega').stats,{hp:74,atk:48,def:76,spa:143,spd:101,spe:124});
  assert(byName('Meowstic-F-Mega').legacy_differences.some(r=>r.field==='megaBaseStats'));
  assert(!byName('Floette-Mega').legacy_differences.some(r=>r.field==='types'||r.field==='megaBaseStats'));
});
test('candidate preparation cannot activate missing Mega lifecycles, including gender-prefixed forms', () => {
  const c=reference(), before=JSON.stringify(c.CHAMPIONS_MEGAS);
  // Remove executable descriptors to prove the offline candidate packet alone
  // cannot grant runtime admission, even after reviewed lifecycles are added.
  c.MC_REVIEW_REFERENCE.megas = {};
  c.MC_REVIEW_REFERENCE.mega_candidates=catalog().candidates;
  c.ChampionsSim.pokemonDataAudit=require('../generated/pokemon_showdown_legal_data.js');
  for(const r of catalog().candidates) {
    assert.equal(c.getMcReferenceMega(r.name),null,r.name);
    const resolved=c.resolveMcMega(r.name,r.required_item);
    assert.equal(resolved.required,true,r.name);assert.equal(resolved.form,null,r.name);
  }
  const member=(name,item,ability)=>({name,item,ability,nature:'Hardy',level:50,moves:['Protect']});
  for(const [name,ability] of [['Meowstic-F-Mega','Competitive'],['Meowstic-M-Mega','Prankster']]) {
    const team={format:'champions',members:[member(name,'Meowsticite',ability),member('Snorlax','','Immunity'),member('Vaporeon','','Water Absorb'),member('Charizard','','Blaze')]};
    const result=c.checkMcReferenceExecution(team,{format:'doubles',bo:1});
    assert.equal(result.allowed,false);assert(result.errors.some(e=>e.includes('Mega lifecycle not implemented')));
    assert.equal(result.competitive_eligible,false);
  }
  assert.equal(JSON.stringify(c.CHAMPIONS_MEGAS),before);
});
test('candidate generator rejects ambiguous identity or stone bindings', () => {
  const {registeredForm}=require('../tools/mc-mega-candidates.cjs');
  const row={name:'Meowstic-F-Mega',baseSpecies:'Meowstic',changesFrom:'Meowstic-F',battleOnly:'Meowstic-F',requiredItem:'Meowsticite'};
  const base={name:'Meowstic-F',exists:true,isMega:false};
  const dex={species:{get:()=>base},items:{get:()=>({exists:true,megaStone:{'Meowstic-F':'Meowstic-F-Mega'}})}};
  assert.equal(registeredForm(dex,row),base);
  assert.throws(()=>registeredForm(dex,{...row,battleOnly:'Meowstic'}),/Ambiguous/);
  assert.throws(()=>registeredForm(dex,{...row,changesFrom:['Meowstic-F']}),/Ambiguous/);
  assert.throws(()=>registeredForm({...dex,species:{get:()=>({exists:false})}},row),/Missing/);
  assert.throws(()=>registeredForm({...dex,items:{get:()=>({exists:true,megaStone:{Meowstic:'Meowstic-M-Mega'}})}},row),/Stone/);
});
test('candidate audit rejects altered identity, metadata and package context', () => {
  const {reviewCandidates}=require('../tools/mc-mega-candidates.cjs'), packet=catalog();
  const review=p=>reviewCandidates(p,packet.candidates,packet.pin,packet.compiled_fingerprint);
  assert(review(packet).every(r=>r.candidate_status==='descriptor_prepared_not_enabled'));
  for(const delta of [{id:'meowsticmmega'},{gender:'M'},{registered_abilities:{H:'Prankster'}},
    {taxonomic_base_species:'Floette'},{registered_form:'Meowstic'}, {legacy_alias:null},
    {types:['Normal']},{execution_enabled:true},{competitive_use:true},{legacy_differences:[]}]) {
    const changed=JSON.parse(JSON.stringify(packet));
    Object.assign(changed.candidates.find(r=>r.name==='Meowstic-F-Mega'),delta);
    assert.equal(review(changed).find(r=>r.name==='Meowstic-F-Mega').candidate_status,'missing_or_stale_candidate',JSON.stringify(delta));
  }
  for(const delta of [{schema_version:'wrong'},{regulation:'historical'},{pin:'master'},
    {compiled_fingerprint:'changed'},{competitive_use:true},{execution_enabled:true},{candidates:[]}]) {
    assert(review({...packet,...delta}).every(r=>r.candidate_status==='missing_or_stale_candidate'));
  }
});
