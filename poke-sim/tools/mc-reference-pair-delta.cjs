// Bounded reference admission correction; this does not repin the base inventory.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const hash=bytes=>require('node:crypto').createHash('sha256').update(bytes).digest('hex');
function applyPairDelta(root,species,basePin){
  const delta=JSON.parse(fs.readFileSync(path.join(root,'source/mc-reference-pair-delta.json'),'utf8'));
  assert.equal(delta.schema_version,'mc-reference-pair-delta-v1');
  assert.equal(delta.base_pin,basePin);
  assert.equal(delta.source_pin,'9b136a8c8cdb860a8ab96fa063f906604e352547');
  assert.equal(delta.reference_format,'gen9championsvgc2026regmc');
  assert.equal(delta.official_eligibility,'unknown');
  assert.equal(delta.competitive_use,false);
  assert.deepEqual(delta.add_pairs,[{species:'sirfetchd',move:'meteorassault'}]);
  assert.equal(delta.receipt_file,'mc-meteor-assault-independent-receipt.json');
  const bytes=fs.readFileSync(path.join(root,'source',delta.receipt_file));
  assert.equal(hash(bytes),delta.receipt_sha256,'Independent receipt digest mismatch');
  const receipt=JSON.parse(bytes);
  assert.equal(receipt.reference.pin,delta.source_pin);
  assert.equal(receipt.reference.format,delta.reference_format);
  assert.equal(receipt.reference.source_clean,true);
  assert.deepEqual(receipt.runtime_mc_reference_diffs.pairs,{missing:['sirfetchd:meteorassault'],extra:[]});
  assert.equal(receipt.validator_probes.sirfetchd_meteor_assault_reference,null);
  assert.equal(receipt.validator_probes.sirfetchd_meteor_assault_runtime.allowed,false);
  assert.equal(species.sirfetchd.available,true);
  assert.equal(species.sirfetchd.moves.includes('meteorassault'),false,'Base changed: review delta before regenerating');
  species.sirfetchd.moves.push('meteorassault');
  species.sirfetchd.moves.sort();
  return {...delta,receipt_sha256:hash(bytes)};
}
module.exports={applyPairDelta};
