// T9j.18 Section A (Refs #138) - data.js shipped placeholder guard.
//
// The app can still accept messy user imports, but the curated TEAMS catalog
// must not ship placeholder members, placeholder moves, or malformed member
// records that would quietly fall into engine defaults.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const dataSource = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
const ctx = { console, module: {}, exports: {}, Object, Array, RegExp, String };
vm.createContext(ctx);
vm.runInContext(dataSource, ctx, { filename: 'data.js' });
vm.runInContext([
  'this.BASE_STATS=BASE_STATS;',
  'this.POKEMON_TYPES_DB=POKEMON_TYPES_DB;',
  'this.DEX_NUM_MAP=DEX_NUM_MAP;',
  'this.TEAMS=TEAMS;',
  'this.validateChampionsDataPlaceholders=validateChampionsDataPlaceholders;',
  'this.CHAMPIONS_DATA_PLACEHOLDER_ISSUES=CHAMPIONS_DATA_PLACEHOLDER_ISSUES;'
].join(' '), ctx);

const {
  BASE_STATS,
  POKEMON_TYPES_DB,
  DEX_NUM_MAP,
  TEAMS,
  validateChampionsDataPlaceholders,
  CHAMPIONS_DATA_PLACEHOLDER_ISSUES
} = ctx;

const KNOWN_TEAMS = [
  'player', 'mega_altaria', 'mega_dragonite', 'mega_houndoom',
  'rin_sand', 'suica_sun', 'cofagrigus_tr',
  'champions_arena_1st', 'champions_arena_2nd', 'champions_arena_3rd',
  'chuppa_balance', 'aurora_veil_froslass', 'kingambit_sneasler',
  'fabulous_sunroom', 'sand_bulky_offense', 'fire_ice_fullroom', 'zardx_snow_setup'
];

let pass = 0, fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}
function eq(a, b, msg='') {
  if (a !== b) throw new Error(`${msg} expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}
function truthy(v, msg='') { if (!v) throw new Error(msg || 'expected truthy'); }

console.log('\n=== T9j.18 data placeholder guard tests ===\n');

T('1. data.js is not the literal placeholder stub', () => {
  truthy(dataSource.trim() !== 'placeholder', 'data.js must not be placeholder stub');
});

T('2. BASE_STATS covers shipped sim team members', () => {
  truthy(Object.keys(BASE_STATS || {}).length >= 50, 'BASE_STATS below shipped-team coverage floor');
  for (const key of KNOWN_TEAMS) {
    for (const member of TEAMS[key].members) {
      truthy(BASE_STATS[member.name], key + ' member missing BASE_STATS: ' + member.name);
    }
  }
});

T('3. POKEMON_TYPES_DB has real catalog coverage', () => {
  truthy(Object.keys(POKEMON_TYPES_DB || {}).length >= 400, 'POKEMON_TYPES_DB below 400 entries');
});

T('4. DEX_NUM_MAP has real National Dex coverage', () => {
  truthy(Object.keys(DEX_NUM_MAP || {}).length >= 1000, 'DEX_NUM_MAP below 1000 entries');
});

T('5. all known tournament teams are populated', () => {
  for (const key of KNOWN_TEAMS) {
    truthy(TEAMS[key], key + ' missing');
    truthy(Array.isArray(TEAMS[key].members), key + '.members missing');
    truthy(TEAMS[key].members.length >= 4, key + ' has fewer than 4 members');
  }
});

T('6. guard function is exported from data.js', () => {
  eq(typeof validateChampionsDataPlaceholders, 'function');
});

T('7. shipped TEAMS catalog has zero placeholder issues', () => {
  eq(CHAMPIONS_DATA_PLACEHOLDER_ISSUES.length, 0, CHAMPIONS_DATA_PLACEHOLDER_ISSUES.join('; '));
});

T('8. guard catches placeholder species names', () => {
  const issues = validateChampionsDataPlaceholders({
    bad: { members: [{ name: 'TODO_MON', item: 'Leftovers', ability: 'Static', moves: ['Tackle'] }] }
  });
  truthy(issues.some(i => i.includes('TODO_MON')), issues.join('; '));
});

T('9. guard catches placeholder item and ability values', () => {
  const issues = validateChampionsDataPlaceholders({
    bad: { members: [{ name: 'Pikachu', item: 'FILL_ME', ability: '__ABILITY__', moves: ['Tackle'] }] }
  });
  truthy(issues.some(i => i.includes('FILL_ME')), issues.join('; '));
  truthy(issues.some(i => i.includes('__ABILITY__')), issues.join('; '));
});

T('10. guard catches placeholder moves', () => {
  const issues = validateChampionsDataPlaceholders({
    bad: { members: [{ name: 'Pikachu', item: '', ability: 'Static', moves: ['PLACEHOLDER_MOVE'] }] }
  });
  truthy(issues.some(i => i.includes('PLACEHOLDER_MOVE')), issues.join('; '));
});

T('11. guard catches malformed shipped member shape', () => {
  const issues = validateChampionsDataPlaceholders({
    bad: { members: [{ item: 'Leftovers', ability: 'Static', moves: [] }] }
  });
  truthy(issues.some(i => i.includes('.name missing')), issues.join('; '));
  truthy(issues.some(i => i.includes('.moves missing or empty')), issues.join('; '));
});

T('12. guard catches an empty shipped catalog', () => {
  const issues = validateChampionsDataPlaceholders({});
  truthy(issues.some(i => i.includes('TEAMS catalog is empty')), issues.join('; '));
});

T('13. real catalog still exposes teams for downstream tests', () => {
  truthy(TEAMS.player && Array.isArray(TEAMS.player.members), 'player team missing');
});

console.log(`\nT9j.18 data guard: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
