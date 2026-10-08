// Offline, pinned inventory comparison. No data promotion or mechanics certification.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createHash} = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {isDeepStrictEqual} = require('node:util');
const PIN = 'efe4948570d5e8189751792136d26e71710c6c66';
const id = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

function compareRows(expected, actual, fields) {
  if (!expected.length || !fields.length) throw new Error('Empty inventory or field contract');
  const index = new Map();
  const expectedIds = new Set();
  for (const row of expected) {
    if (!row.id || expectedIds.has(row.id)) throw new Error('Missing or duplicate expected identity');
    expectedIds.add(row.id);
  }
  for (const row of Object.values(actual)) {
    if (!row.id || index.has(row.id)) throw new Error('Missing or duplicate mirror identity');
    index.set(row.id, row);
  }
  return expected.map(row => {
    const found = index.get(row.id);
    const differences = found ? fields.filter(key => row[key] === undefined || found[key] === undefined || !isDeepStrictEqual(row[key],found[key])) : fields;
    return {id:row.id, name:row.name, status:!found ? 'missing_mirror_row' : differences.length ? 'mirror_field_difference' : 'mirror_fields_match', differences,
      values:Object.fromEntries(differences.map(key=>[key,{reference:row[key] ?? null,mirror:found?.[key] ?? null}]))};
  });
}

function audit(root) {
  const upstream = path.join(root, 'artifacts/showdown-mc-reference');
  const git = args => execFileSync('git', ['-C', upstream, ...args], {encoding:'utf8'}).trim();
  if (git(['rev-parse','HEAD']) !== PIN || git(['status','--porcelain','--untracked-files=no'])) throw new Error('Reference source must match clean pinned revision');
  const {Dex} = require(path.join(upstream,'dist/sim'));
  const dex = Dex.mod('champions');
  const mirror = require(path.join(root,'generated/pokemon_showdown_legal_data.js'));
  const c = vm.createContext({console});
  const paths = ['data.js','mc_review.js','generated/mc_review_reference.js'];
  for (const file of paths) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c);
  const species = dex.species.all().filter(s => s.exists && !s.isNonstandard);
  const items = dex.items.all().filter(s => s.exists && !s.isNonstandard);
  const moveIds = new Set(species.flatMap(s => [...dex.species.getMovePool(s.id)]));
  const moves = [...moveIds].sort().map(key => dex.moves.get(key));
  const abilityIds = new Set(species.flatMap(s => Object.values(s.abilities).map(id)));
  const abilities = [...abilityIds].sort().map(key => dex.abilities.get(key));
  const categories = {
    species: compareRows(species.map(s => ({id:s.id,name:s.name,stats:s.baseStats,types:s.types,abilities:s.abilities,weightkg:s.weightkg})),mirror.species,['stats','types','abilities','weightkg']),
    moves: compareRows(moves,mirror.moves,['type','category','basePower','accuracy','pp','priority']),
    items: compareRows(items,mirror.items,['name']),
    abilities: compareRows(abilities,mirror.abilities,['name'])
  };
  const mega = species.filter(s => s.isMega).map(s => {
    const row = c.CHAMPIONS_MEGAS[s.name] || c.getMcReferenceMega(s.name);
    const aliases = {'Floette-Mega':'Floette (Eternal Flower)-Mega','Meowstic-M-Mega':'Meowstic (Male)-Mega','Meowstic-F-Mega':'Meowstic (Female)-Mega'};
    const alias = aliases[s.name] && c.CHAMPIONS_MEGAS[aliases[s.name]];
    return {id:s.id,name:s.name,status:row ? 'descriptor_present_not_lifecycle_proof' : alias ? 'alias_requires_resolution' : 'missing_runtime_descriptor',runtime_alias:alias ? aliases[s.name] : null};
  });
  const intake = JSON.parse(fs.readFileSync(path.join(root,'source/reg-m-c-reference-intake.json')));
  if (intake.upstream_commit !== PIN) throw new Error('Intake pin mismatch');
  const sourcePaths = [...paths,'source/reg-m-c-official-roster.json','source/reg-m-c-source-review.json','source/reg-m-c-reference-intake.json','generated/pokemon_showdown_legal_data.js'];
  const fingerprints = Object.fromEntries(sourcePaths.map(file => [file,hash(fs.readFileSync(path.join(root,file)))]));
  const compiledFiles = fs.readdirSync(path.join(upstream,'dist'),{recursive:true}).filter(f=>f.endsWith('.js')).sort();
  const compiledHashes = Object.fromEntries(compiledFiles.map(f=>[f.replaceAll('\\','/'),hash(fs.readFileSync(path.join(upstream,'dist',f)))]));
  if (hash(JSON.stringify(compiledHashes)) !== intake.compiled_fingerprint) throw new Error('Compiled reference differs from captured intake');
  return {schema_version:'champions-mc-release-inventory-v1',generated_at:new Date().toISOString(),pin:PIN,
    competitive_use:false,release_verified:false,
    scope:'Reference availability, mirror field comparison and Mega descriptor inventory. Not official legality, effective engine parity, item hooks, move effects or ability behavior certification.',
    fingerprints,compiled_fingerprint:intake.compiled_fingerprint,
    counts:Object.fromEntries(Object.entries(categories).map(([key,rows])=>[key,{total:rows.length,matched:rows.filter(r=>r.status==='mirror_fields_match').length,missing:rows.filter(r=>r.status==='missing_mirror_row').length,different:rows.filter(r=>r.status==='mirror_field_difference').length}])),
    official_mapping:{total:intake.official_identity_candidates.length,unresolved:intake.official_identity_candidates.filter(r=>r.status!=='baseline_identity_candidate')},
    mega, categories};
}

module.exports = {compareRows,audit};
if (require.main === module) {
  const root=path.resolve(__dirname,'..'),report=audit(root);
  fs.mkdirSync(path.join(root,'artifacts/mc-release-inventory'),{recursive:true});
  fs.writeFileSync(path.join(root,'artifacts/mc-release-inventory/report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({counts:report.counts,unresolved:report.official_mapping.unresolved,missing_mega:report.mega.filter(r=>r.status==='missing_runtime_descriptor'),release_verified:false},null,2));
}
