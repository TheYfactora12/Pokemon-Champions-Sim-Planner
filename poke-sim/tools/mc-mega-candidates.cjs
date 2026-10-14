// Offline candidate preparation only. Never imported by the battle engine.
const {isDeepStrictEqual} = require('node:util');
const CANDIDATE_NAMES = [
  'Sceptile-Mega','Blaziken-Mega','Swampert-Mega','Mawile-Mega','Absol-Mega-Z',
  'Metagross-Mega','Staraptor-Mega','Garchomp-Mega-Z','Lucario-Mega-Z',
  'Scolipede-Mega','Scrafty-Mega','Eelektross-Mega','Pyroar-Mega','Floette-Mega',
  'Meowstic-M-Mega','Meowstic-F-Mega','Malamar-Mega','Barbaracle-Mega',
  'Dragalge-Mega','Golisopod-Mega','Falinks-Mega','Baxcalibur-Mega'
];
const ALIASES = {
  'Floette-Mega':'Floette (Eternal Flower)-Mega',
  'Meowstic-M-Mega':'Meowstic (Male)-Mega',
  'Meowstic-F-Mega':'Meowstic (Female)-Mega'
};
function registeredForm(dex, row) {
  // changesFrom and battleOnly identify the registered form; baseSpecies may
  // instead identify the whole family (female Meowstic, Eternal Floette).
  const name = row.changesFrom || row.battleOnly || row.baseSpecies;
  if (typeof name !== 'string' || !name ||
      (row.changesFrom && row.battleOnly && row.changesFrom !== row.battleOnly)) {
    throw Error('Ambiguous registered form: '+row.name);
  }
  const base = dex.species.get(name), stone = dex.items.get(row.requiredItem);
  if (!base.exists || base.isMega || !stone.exists) throw Error('Missing registered form/stone: '+row.name);
  const target = typeof stone.megaStone === 'object' && stone.megaStone
    ? stone.megaStone[base.name] : stone.megaEvolves === base.name ? stone.megaStone : null;
  if (target !== row.name) throw Error('Stone does not bind exact registered form: '+row.name);
  return base;
}
function buildCandidates(dex, legacy) {
  legacy=JSON.parse(JSON.stringify(legacy)); // VM prototypes are not data differences.
  return CANDIDATE_NAMES.map(name => {
    const row=dex.species.get(name);
    if (!row.exists || !row.isMega || row.isNonstandard || row.name !== name) throw Error('Missing pinned Mega: '+name);
    const base=registeredForm(dex,row), alias=ALIASES[name] || null, old=alias && legacy[alias];
    if (alias && !old) throw Error('Missing legacy alias: '+alias);
    const candidate={id:row.id,name:row.name,taxonomic_base_species:row.baseSpecies,
      registered_form:base.name,required_item:row.requiredItem,gender:row.gender || '',
      types:row.types,stats:row.baseStats,ability:row.abilities['0'],weightkg:row.weightkg,
      registered_abilities:base.abilities,legacy_alias:alias,competitive_use:false,
      execution_enabled:false,review_status:'descriptor_candidate_not_lifecycle_proof'};
    candidate.legacy_differences=old ? Object.entries({baseSpecies:base.name,megaStone:row.requiredItem,
      types:row.types,megaBaseStats:row.baseStats,ability:row.abilities['0'],weightkg:row.weightkg})
      .filter(([key,value])=>!isDeepStrictEqual(old[key],value))
      .map(([field,value])=>({field,legacy:old[field] ?? null,reference:value})) : [];
    return candidate;
  });
}
function reviewCandidates(packet, expected, pin, compiledFingerprint) {
  const valid=packet && packet.schema_version==='champions-mc-mega-candidates-v1' &&
    packet.regulation==='champions_reg_m_c_2026' && packet.pin===pin &&
    packet.compiled_fingerprint===compiledFingerprint && packet.competitive_use===false &&
    packet.execution_enabled===false && Array.isArray(packet.candidates) &&
    packet.candidates.length===expected.length &&
    new Set(packet.candidates.map(r=>r && r.id)).size===expected.length;
  return expected.map(row=>({name:row.name,candidate_status:valid &&
    packet.candidates.filter(c=>c && c.name===row.name).length===1 &&
    isDeepStrictEqual(packet.candidates.find(c=>c && c.name===row.name),row)
    ? 'descriptor_prepared_not_enabled' : 'missing_or_stale_candidate'}));
}
module.exports={CANDIDATE_NAMES,ALIASES,registeredForm,buildCandidates,reviewCandidates};
