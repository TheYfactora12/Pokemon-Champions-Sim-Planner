// Audit live accessor behavior, not only mirrored rows. No promotion or writes.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {audit} = require('./audit-mc-release-inventory.cjs');
function inspect(root) {
  const inventory = audit(root); // Enforces source pin and compiled fingerprint.
  const c = vm.createContext({console, Math, window: {}});
  for (const file of ['data.js', 'generated/pokemon_showdown_legal_data.js',
    'generated/champions_move_overrides.js', 'runtime_data.js', 'mc_review.js',
    'generated/mc_review_reference.js', 'engine.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), c);
  }
  const {Dex} = require(path.join(root, 'artifacts/showdown-mc-reference/dist/sim'));
  const dex = Dex.mod('champions');
  const actor = {referenceMode: 'champions_mc_reference'};
  const rows = inventory.categories.moves.filter(row => row.differences.length).map(row => {
    const ref = dex.moves.get(row.id);
    const expected = {type: ref.type, category: ref.category.toLowerCase(), basePower: ref.basePower,
      accuracy: ref.accuracy === true ? 1 : ref.accuracy / 100, neverMiss: ref.accuracy === true, maxPP: ref.pp === 1 ? 1 : Math.floor((ref.pp / 5 + 1) * 4)};
    const actual = {type: c._moveType(row.name, actor), category: c._moveCategory(row.name),
      basePower: c._moveBasePower(row.name, actor), accuracy: c._moveAccuracy(row.name, undefined, actor),
      neverMiss: c._moveNeverMiss(row.name, actor), maxPP: c._moveMaxPP(row.name, actor)};
    return {id: row.id, name: row.name, expected, actual,
      differences: Object.keys(expected).filter(key => expected[key] !== actual[key]),
      scope: 'metadata accessors only; effect, lifecycle and legality not certified'};
  });
  return {pin: inventory.pin, compiled_fingerprint: inventory.compiled_fingerprint,
    competitive_use: false, rows};
}
module.exports = {inspect};
if (require.main === module) {
  const report=inspect(path.resolve(__dirname, '..'));
  console.log(JSON.stringify(report, null, 2));
  if(report.rows.some(row=>row.differences.length)) process.exitCode=1;
}
