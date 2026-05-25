// Issue #117 - replay species normalization must not treat gender tokens as species.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const replayCoach = require(path.join(ROOT, 'replay_coach.js'));

const dataCtx = {};
vm.createContext(dataCtx);
vm.runInContext(
  fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8') +
    '\nthis.BASE_STATS = BASE_STATS; this.POKEMON_TYPES_DB = POKEMON_TYPES_DB;',
  dataCtx
);

let pass = 0;
let fail = 0;
const tests = [];
function T(name, fn) {
  tests.push([name, fn]);
}
function eq(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error((msg || 'expected equality') + ': got ' + actual + ', expected ' + expected);
  }
}
function truthy(value, msg) {
  if (!value) throw new Error(msg || 'expected truthy');
}
function includes(list, value, msg) {
  if (!Array.isArray(list) || !list.includes(value)) {
    throw new Error((msg || 'missing value') + ': ' + value);
  }
}
function notStandaloneGender(value, msg) {
  if (/^(F|M|Female|Male)$/i.test(String(value || '').trim())) {
    throw new Error(msg || 'loose gender token became species/display name');
  }
}

console.log('\n=== replay species parser tests ===\n');

T('1. Level 50 Female details keep Kangaskhan as species', () => {
  const parsed = replayCoach.normalizeReplayPokemonDetails('Kangaskhan, Level 50, Female');
  eq(parsed.species, 'Kangaskhan', 'species');
  eq(parsed.gender, 'F', 'gender metadata');
  eq(parsed.level, 50, 'level metadata');
  notStandaloneGender(parsed.displayName, 'display name');
});

T('2. L50 F details keep Kangaskhan as species', () => {
  const parsed = replayCoach.normalizeReplayPokemonDetails('Kangaskhan, L50, F');
  eq(parsed.species, 'Kangaskhan', 'species');
  eq(parsed.gender, 'F', 'gender metadata');
  notStandaloneGender(parsed.species, 'species');
});

T('3. Impossible loose male token still stays metadata, not species', () => {
  const parsed = replayCoach.normalizeReplayPokemonDetails('Kangaskhan, L50, M');
  eq(parsed.species, 'Kangaskhan', 'species');
  eq(parsed.gender, 'M', 'gender metadata');
  notStandaloneGender(parsed.species, 'species');
});

T('4. Nickname pipe details prefer species details over nickname', () => {
  const parsed = replayCoach.normalizeReplayPokemonDetails('Nickname|Kangaskhan, L50, F');
  eq(parsed.species, 'Kangaskhan', 'species');
  eq(parsed.gender, 'F', 'gender metadata');
});

T('5. loose gender tokens alone never become species or display names', () => {
  ['F', 'M', 'Female', 'Male', 'gender: F', 'gender: M'].forEach((token) => {
    const parsed = replayCoach.normalizeReplayPokemonDetails(token);
    eq(parsed.species, '', token + ' species');
    eq(parsed.displayName, '', token + ' display');
  });
});

T('6. real gendered form names are preserved', () => {
  ['Nidoran-F', 'Nidoran-M', 'Indeedee-F', 'Indeedee-M', 'Meowstic-F', 'Meowstic-M', 'Basculegion-F', 'Basculegion-M', 'Oinkologne-F', 'Oinkologne-M'].forEach((species) => {
    const parsed = replayCoach.normalizeReplayPokemonDetails(species + ', L50, F');
    eq(parsed.species, species, species + ' species');
    eq(parsed.displayName, species, species + ' display');
  });
});

T('7. mega replay event resolves Kangaskhan to Kangaskhan-Mega', () => {
  const log = [
    '|player|p1|Alice',
    '|player|p2|Bob',
    '|gametype|doubles',
    '|poke|p1|Kangaskhan, L50, F|',
    '|start',
    '|switch|p1a: Kanga|Kangaskhan, L50, F|100/100',
    '|turn|1',
    '|-mega|p1a: Kanga|Kangaskhanite',
    '|move|p1a: Kanga|Fake Out|p2a: Tyranitar',
    '|win|Alice'
  ].join('\n');
  const parsed = replayCoach.parseShowdownLog(log, { selectedSide: 'p1' });
  includes(parsed.selectedPokemon.p1, 'Kangaskhan-Mega', 'selected mega species');
  truthy(!parsed.selectedPokemon.p1.includes('F'), 'selected Pokemon should not include F');
  const turn1 = parsed.turns.find((turn) => turn.number === 1);
  truthy(turn1.events.some((ev) => ev.type === 'mega' && ev.pokemon === 'Kangaskhan-Mega'), 'mega event recorded');
  truthy(turn1.moves.some((move) => move.pokemon === 'Kangaskhan-Mega'), 'post-mega move uses mega species');
});

T('8. Charizard mega item resolves X/Y without guessing', () => {
  eq(replayCoach.resolveReplayMegaSpecies('Charizard', 'Charizardite X'), 'Charizard-Mega-X', 'Charizard X');
  eq(replayCoach.resolveReplayMegaSpecies('Charizard', 'Charizardite Y'), 'Charizard-Mega-Y', 'Charizard Y');
  eq(replayCoach.resolveReplayMegaSpecies('Charizard', ''), 'Charizard', 'Charizard without item should not guess');
});

T('9. Kangaskhan-Mega stats use standard Pokemon values', () => {
  const base = dataCtx.BASE_STATS.Kangaskhan;
  const mega = dataCtx.BASE_STATS['Kangaskhan-Mega'];
  truthy(base, 'Kangaskhan BASE_STATS exists');
  truthy(mega, 'Kangaskhan-Mega BASE_STATS exists');
  eq([base.hp, base.atk, base.def, base.spa, base.spd, base.spe].join('/'), '105/95/80/40/80/90', 'Kangaskhan stats');
  eq([mega.hp, mega.atk, mega.def, mega.spa, mega.spd, mega.spe].join('/'), '105/125/100/60/100/100', 'Kangaskhan-Mega stats');
});

T('10. parser output is safe for Set Editor display labels', () => {
  const parsed = replayCoach.normalizeReplayPokemonDetails('p1a: Nickname', 'Kangaskhan, L50, F');
  const display = `<div class="editor-poke-name">${parsed.displayName}</div>`;
  truthy(display.includes('Kangaskhan'), 'display includes Kangaskhan');
  truthy(!/<div class="editor-poke-name">F<\/div>/.test(display), 'display should not be standalone F');
});

T('11. Showdown validation report covers required issue rows', () => {
  const csvPath = path.join(ROOT, 'reports/pokemon_stats_validation.csv');
  truthy(fs.existsSync(csvPath), 'validation CSV exists');
  const lines = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/);
  const header = lines[0].split(',');
  const idx = (name) => header.indexOf(name);
  const bySpecies = {};
  lines.slice(1).forEach((line) => {
    const cells = line.split(',');
    bySpecies[cells[idx('species_key')]] = cells;
  });
  ['Kangaskhan', 'Kangaskhan-Mega', 'Nidoran-F', 'Nidoran-M', 'Indeedee-F', 'Indeedee-M', 'Meowstic-F', 'Meowstic-M', 'Charizard-Mega-X', 'Charizard-Mega-Y'].forEach((species) => {
    truthy(bySpecies[species], species + ' validation row');
    eq(bySpecies[species][idx('parser_roundtrip_ok')], 'true', species + ' parser roundtrip');
  });
  eq(bySpecies.Kangaskhan[idx('app_stats_match_source')], 'true', 'Kangaskhan app stats match Showdown');
  eq(bySpecies['Kangaskhan-Mega'][idx('app_stats_match_source')], 'true', 'Mega Kangaskhan app stats match Showdown');
});

(async function run() {
  for (const [name, fn] of tests) {
    try {
      await fn();
      console.log('  PASS', name);
      pass++;
    } catch (e) {
      console.log('  FAIL', name, '-', e.message);
      fail++;
    }
  }
  console.log(`\nreplay species parser: ${pass} pass, ${fail} fail\n`);
  process.exit(fail ? 1 : 0);
})();
