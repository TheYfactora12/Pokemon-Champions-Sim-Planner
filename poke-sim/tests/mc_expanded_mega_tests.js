const assert=require('node:assert/strict');
const {c,set,team,opts}=require('./mc_mega_lifecycle_tests.js');
const catalog=require('../source/reg-m-c-mega-descriptor-candidates.json');
const legacy=JSON.stringify(c.CHAMPIONS_MEGAS);
let checks=0;
for(const spec of catalog.candidates) {
 const descriptor=c.getMcReferenceMega(spec.name);
 assert(descriptor,spec.name);
 assert.equal(descriptor.baseSpecies,spec.registered_form);
 assert.deepEqual(JSON.parse(JSON.stringify(descriptor.megaBaseStats)),spec.stats);
 for(const name of [spec.name,spec.registered_form,spec.legacy_alias].filter(Boolean)) {
  const input=set(name,spec.required_item,spec.registered_abilities['0']);
  const snapshot=JSON.stringify(input), result=c.checkMcReferenceExecution(team(input),opts);
  const p=new c.Pokemon(input,'','champions',opts.rulesetId);
  if(!descriptor.execution_enabled) {
   assert.equal(result.allowed,false,name);assert(result.errors.some(e=>e.includes('Mega lifecycle not implemented')),JSON.stringify(result.errors));
   assert.equal(p.megaForm,null);
  } else {
   assert.equal(result.allowed,true,JSON.stringify({name,errors:result.errors}));
   assert.equal(p.name,spec.registered_form);assert.equal(p.ability,spec.registered_abilities['0']);
   p.hp-=19;const hp=p.hp;assert.equal(p.megaEvolve([]),true);
   assert.equal(p.hp,hp);assert.equal(p.name,spec.name);assert.equal(p.ability,spec.ability);
   assert.equal(p.weightkg,spec.weightkg);assert.deepEqual(Array.from(p.types),spec.types);
   for(const stat of Object.keys(spec.stats))assert.equal(p._base[stat],spec.stats[stat]);
   assert.equal(p.megaEvolve([]),false);
  }
  assert.equal(JSON.stringify(input),snapshot);checks++;
 }
 const wrong=team(set(spec.name,'Magnet',spec.ability));
 assert.equal(c.checkMcReferenceExecution(wrong,opts).allowed,false);checks++;
}
assert.equal(JSON.stringify(c.CHAMPIONS_MEGAS),legacy);
assert.equal(c.CHAMPIONS_MEGAS['Meowstic (Female)-Mega'].megaBaseStats.spa,83);
assert.equal(c.getMcReferenceMega('Meowstic (Female)-Mega').megaBaseStats.spa,143);
assert.equal(c.mcSpeciesId('Meowstic (Female)-Mega'),'meowsticfmega');
assert.notEqual(c.mcSpeciesId('Meowstic (Female)-Mega'),c.mcSpeciesId('Meowstic (Male)-Mega'));
assert.notEqual(c.mcSpeciesId('Floette'),c.mcSpeciesId('Floette (Eternal Flower)'));
console.log(checks+' expanded descriptor/lifecycle/admission checks passed; unsupported abilities remain gated');
module.exports={c,set,team,opts,catalog};
