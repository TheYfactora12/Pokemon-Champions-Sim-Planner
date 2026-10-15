// Independent field assertions against the clean, compiled pinned source.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const inventory=require('./audit-mc-release-inventory.cjs').audit(root);
const dex=require(path.join(root,'artifacts/showdown-mc-reference/dist/sim')).Dex.mod('champions');
const packet=JSON.parse(fs.readFileSync(path.join(root,'source/reg-m-c-mega-descriptor-candidates.json')));
assert.equal(packet.pin,inventory.pin);assert.equal(packet.compiled_fingerprint,inventory.compiled_fingerprint);
assert.equal(packet.candidates.length,22);assert.equal(new Set(packet.candidates.map(r=>r.id)).size,22);
assert.equal(packet.competitive_use,false);assert.equal(packet.execution_enabled,false);
let checks=0;
for(const row of packet.candidates) {
  const s=dex.species.get(row.id),base=dex.species.get(s.changesFrom),item=dex.items.get(s.requiredItem);
  assert(s.exists && s.isMega && !s.isNonstandard);assert.equal(row.name,s.name);
  assert.equal(row.registered_form,s.changesFrom);assert.equal(row.registered_form,s.battleOnly);
  assert.equal(row.taxonomic_base_species,s.baseSpecies);assert.equal(row.required_item,s.requiredItem);
  assert.equal(typeof item.megaStone==='string' ? item.megaEvolves : row.registered_form,row.registered_form);
  assert.equal(typeof item.megaStone==='string' ? item.megaStone : item.megaStone[row.registered_form],row.name);
  assert.deepEqual(row.stats,s.baseStats);assert.deepEqual(row.types,s.types);
  assert.equal(row.weightkg,s.weightkg);assert.equal(row.ability,s.abilities['0']);
  assert.equal(row.gender,s.gender || '');assert.deepEqual(row.registered_abilities,base.abilities);
  assert.equal(row.execution_enabled,false);assert.equal(row.competitive_use,false);checks++;
}
assert.equal(inventory.mega.filter(r=>r.status==='missing_runtime_descriptor').length,0);
assert.equal(inventory.mega.filter(r=>r.status==='alias_requires_resolution').length,0);
assert.equal(inventory.candidate_preparation.filter(r=>r.candidate_status==='descriptor_prepared_not_enabled').length,22);
const report={pin:inventory.pin,compiled_fingerprint:inventory.compiled_fingerprint,checks,
  status:'passed',scope:'22 exact historical candidate descriptors; runtime activation has separate lifecycle and mechanics probes; not mechanics parity'};
fs.mkdirSync(path.join(root,'artifacts/mc-mega-candidates'),{recursive:true});
fs.writeFileSync(path.join(root,'artifacts/mc-mega-candidates/verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
