// Species/form learnset legality checks from generated Pokemon Showdown data.

require('../generated/pokemon_showdown_legal_data.js');
const moveLegality = require('../move_legality.js');
const auditData = require('../generated/pokemon_showdown_legal_data.js');

let pass = 0;
let fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}
function eq(actual, expected, msg) {
  if (actual !== expected) throw new Error((msg || 'expected equality') + ': got ' + actual + ', expected ' + expected);
}
function truthy(value, msg) {
  if (!value) throw new Error(msg || 'expected truthy');
}

console.log('\n=== move legality tests ===\n');

T('1. Arcanine and Arcanine-Hisui have distinct learnset data', () => {
  const regular = Object.keys(auditData.species.Arcanine.moves || {}).sort().join(',');
  const hisui = Object.keys(auditData.species['Arcanine-Hisui'].moves || {}).sort().join(',');
  truthy(regular.length > 0, 'Arcanine moves missing');
  truthy(hisui.length > 0, 'Arcanine-Hisui moves missing');
  truthy(regular !== hisui, 'Arcanine forms should not share identical generated move lists');
});

T('2. Hisuian Arcanine alias resolves to Arcanine-Hisui', () => {
  eq(moveLegality.canonicalSpeciesKey('Hisuian Arcanine'), 'Arcanine-Hisui', 'Hisuian alias');
  eq(moveLegality.canonicalSpeciesKey('Arcanine Hisui'), 'Arcanine-Hisui', 'space suffix alias');
  eq(moveLegality.canonicalSpeciesKey('Arcanine-Hisui'), 'Arcanine-Hisui', 'dash alias');
});

T('3. Hisuian-only move is not borrowed by plain Arcanine', () => {
  eq(moveLegality.isMoveLegalForSpecies('Arcanine-Hisui', 'Raging Fury').legal, true, 'Raging Fury should be legal for Hisui');
  eq(moveLegality.isMoveLegalForSpecies('Arcanine', 'Raging Fury').legal, false, 'Raging Fury should not be legal for plain Arcanine');
});

T('4. Illegal known move returns legal=false with reason', () => {
  const out = moveLegality.isMoveLegalForSpecies('Arcanine-Hisui', 'Surf');
  eq(out.legal, false, 'Surf legal flag');
  eq(out.reason, 'not_in_species_form_learnset', 'Surf reason');
});

T('5. Unknown move returns legal=false with reason', () => {
  const out = moveLegality.isMoveLegalForSpecies('Arcanine', 'Definitely Not A Move');
  eq(out.legal, false, 'unknown legal flag');
  eq(out.reason, 'unknown_move', 'unknown reason');
});

T('6. Mega Kangaskhan uses Kangaskhan learnset', () => {
  const out = moveLegality.isMoveLegalForSpecies('Kangaskhan-Mega', 'Fake Out');
  eq(out.legal, true, 'Fake Out legal');
  eq(out.inheritedFrom, 'Kangaskhan', 'Mega learnset inheritance');
});

T('7. gendered forms remain distinct', () => {
  eq(moveLegality.canonicalSpeciesKey('Nidoran-F'), 'Nidoran-F', 'Nidoran-F');
  eq(moveLegality.canonicalSpeciesKey('Nidoran-M'), 'Nidoran-M', 'Nidoran-M');
  eq(moveLegality.canonicalSpeciesKey('Indeedee-F'), 'Indeedee-F', 'Indeedee-F');
  eq(moveLegality.canonicalSpeciesKey('Indeedee-M'), 'Indeedee-M', 'Indeedee-M');
  eq(moveLegality.canonicalSpeciesKey('Meowstic-F'), 'Meowstic-F', 'Meowstic-F');
  eq(moveLegality.canonicalSpeciesKey('Meowstic-M'), 'Meowstic-M', 'Meowstic-M');
});

console.log(`\nmove legality: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
