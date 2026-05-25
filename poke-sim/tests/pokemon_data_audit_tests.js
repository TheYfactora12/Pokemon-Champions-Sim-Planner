// Generated Pokemon data audit CSV/XLSX contract tests.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const csvPath = path.join(ROOT, 'reports/pokemon_data_audit.csv');
const xlsxPath = path.join(ROOT, 'reports/pokemon_data_audit.xlsx');
const runtimePath = path.join(ROOT, 'generated/pokemon_showdown_legal_data.js');

let pass = 0;
let fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}
function truthy(value, msg) {
  if (!value) throw new Error(msg || 'expected truthy');
}

console.log('\n=== Pokemon data audit tests ===\n');

T('1. CSV, XLSX, and runtime generated data exist', () => {
  truthy(fs.existsSync(csvPath), 'audit CSV missing');
  truthy(fs.existsSync(xlsxPath), 'audit XLSX missing');
  truthy(fs.existsSync(runtimePath), 'runtime legality data missing');
  truthy(fs.statSync(xlsxPath).size > 100000, 'XLSX looks too small');
});

const csv = fs.readFileSync(csvPath, 'utf8');

T('2. CSV fallback exposes required sheet names and source version', () => {
  ['README', 'Species_Stats', 'Learnsets', 'Moves', 'Form_Differences', 'Validation_Errors', 'Replay_Turn0_Sample'].forEach((sheet) => {
    truthy(csv.includes(sheet + ','), 'missing sheet ' + sheet);
  });
  truthy(/[0-9a-f]{40} \(\d{4}-\d{2}-\d{2}\)/.test(csv), 'source commit/version missing');
});

T('3. required example species/forms exist separately', () => {
  ['Arcanine', 'Arcanine-Hisui', 'Growlithe', 'Growlithe-Hisui', 'Kangaskhan', 'Kangaskhan-Mega', 'Charizard-Mega-X', 'Charizard-Mega-Y', 'Nidoran-F', 'Nidoran-M', 'Indeedee-F', 'Indeedee-M', 'Meowstic-F', 'Meowstic-M'].forEach((species) => {
    truthy(csv.includes(',' + species + ','), 'missing species ' + species);
  });
});

T('4. Form_Differences includes Arcanine vs Arcanine-Hisui', () => {
  truthy(csv.includes('Form_Differences') && csv.includes('Arcanine-Hisui'), 'missing Arcanine form difference');
  truthy(csv.includes('Raging Fury') || csv.includes('RagingFury'), 'missing Hisuian move difference evidence');
});

T('5. XLSX has a valid zip container signature', () => {
  const buf = fs.readFileSync(xlsxPath);
  truthy(buf[0] === 0x50 && buf[1] === 0x4b, 'xlsx missing PK signature');
});

console.log(`\nPokemon data audit: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
