const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const reportPath = path.join(ROOT, 'reports', 'type_multiplier_audit.md');
const toolPath = path.join(ROOT, 'tools', 'generate-type-multiplier-audit.mjs');

let pass = 0;
let fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (err) { console.log('  FAIL', name, '-', err.message); fail++; }
}
function truthy(value, msg) {
  if (!value) throw new Error(msg || 'expected truthy');
}
function inc(haystack, needle, msg) {
  if (String(haystack).indexOf(needle) < 0) throw new Error((msg || 'missing') + ': ' + needle);
}

console.log('\n=== type multiplier audit tests ===\n');

T('1. generator and report exist', () => {
  truthy(fs.existsSync(toolPath), 'type multiplier generator missing');
  truthy(fs.existsSync(reportPath), 'type multiplier report missing');
});

T('2. report documents source, scope, and fixed chart examples', () => {
  const report = fs.readFileSync(reportPath, 'utf8');
  inc(report, '# Type Multiplier Audit');
  inc(report, 'Source: smogon/pokemon-showdown data/pokedex.ts + learnsets.ts + moves.ts');
  inc(report, 'Shipped move-user rows audited:');
  inc(report, 'Electric move into Pelipper [Water/Flying] | 4x');
  inc(report, 'Ice move into Garchomp [Dragon/Ground] | 4x');
  inc(report, 'Ground move into Flying typing | 0x');
});

T('3. report includes base and declared Tera defender buckets', () => {
  const report = fs.readFileSync(reportPath, 'utf8');
  inc(report, 'Base defender type buckets');
  inc(report, 'Declared Tera defender buckets');
  inc(report, '4x');
  inc(report, '0x');
});

T('4. report names dynamic move-type cases and promoted Tera Blast behavior', () => {
  const report = fs.readFileSync(reportPath, 'utf8');
  inc(report, 'Weather Ball in rain');
  inc(report, 'Terrain Pulse in electric terrain');
  inc(report, 'Pixilate converts Normal damage to Fairy');
  inc(report, 'active Tera Blast uses declared');
  inc(report, 'Category is chosen in the damage engine from the higher boosted Attack vs Special Attack stat');
  inc(report, 'Low Kick / Grass Knot');
  inc(report, 'bp=variable(weight; showdown row 0)');
  inc(report, 'base power selected from target Showdown weight in engine');
});

T('5. generator keeps the engine-equivalent type chart examples visible', () => {
  const tool = fs.readFileSync(toolPath, 'utf8');
  inc(tool, 'Electric: {Electric: 0.5, Grass: 0.5, Dragon: 0.5, Ground: 0, Flying: 2, Water: 2}');
  inc(tool, "if (move === 'Freeze-Dry' && targetType === 'Water') eff = 2;");
  inc(tool, "NORMAL_CONVERSION");
  inc(tool, "VARIABLE_BASE_POWER_DAMAGE");
});

console.log(`\ntype multiplier audit: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
