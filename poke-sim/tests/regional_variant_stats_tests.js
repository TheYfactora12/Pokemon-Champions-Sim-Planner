const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const dataSource = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
const engineSource = fs.readFileSync(path.join(ROOT, 'engine.js'), 'utf8');

const ctx = {
  console,
  require,
  module: { exports: {} },
  exports: {},
  Math,
  Object,
  Array,
  Set,
  JSON,
  Promise,
  setTimeout,
  window: {},
  document: { getElementById: () => null, querySelectorAll: () => [] },
  localStorage: {
    _s: {},
    getItem(k) { return this._s[k] || null; },
    setItem(k, v) { this._s[k] = String(v); },
    removeItem(k) { delete this._s[k]; }
  }
};
ctx.window.matchMedia = () => ({ matches: false });
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(dataSource, ctx, { filename: 'data.js' });
vm.runInContext(engineSource, ctx, { filename: 'engine.js' });
vm.runInContext([
  'this.BASE_STATS = BASE_STATS;',
  'this.POKEMON_TYPES_DB = POKEMON_TYPES_DB;',
  'this.TEAMS = TEAMS;',
  'this.Pokemon = Pokemon;',
  'this.validateTeam = validateTeam;'
].join('\n'), ctx);

const { BASE_STATS, POKEMON_TYPES_DB, TEAMS, Pokemon, validateTeam } = ctx;

let pass = 0;
let fail = 0;

function T(name, fn) {
  try {
    fn();
    console.log('  PASS', name);
    pass++;
  } catch (e) {
    console.log('  FAIL', name, '-', e.message);
    fail++;
  }
}

function eq(a, b, msg = '') {
  if (a !== b) throw new Error(`${msg} expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

function arrEq(a, b, msg = '') {
  const left = JSON.stringify(a);
  const right = JSON.stringify(b);
  if (left !== right) throw new Error(`${msg} expected ${right}, got ${left}`);
}

console.log('\n=== regional variant stat tests ===\n');

T('1. Typhlosion-Hisui matches Showdown canonical base stats and types', () => {
  const s = BASE_STATS['Typhlosion-Hisui'];
  eq(s.hp, 73, 'hp');
  eq(s.atk, 84, 'atk');
  eq(s.def, 78, 'def');
  eq(s.spa, 119, 'spa');
  eq(s.spd, 85, 'spd');
  eq(s.spe, 95, 'spe');
  arrEq(s.types, ['Fire', 'Ghost'], 'types');
});

T('2. Ursaluna-Bloodmoon matches Showdown canonical base stats and types', () => {
  const s = BASE_STATS['Ursaluna-Bloodmoon'];
  eq(s.hp, 113, 'hp');
  eq(s.atk, 70, 'atk');
  eq(s.def, 120, 'def');
  eq(s.spa, 135, 'spa');
  eq(s.spd, 65, 'spd');
  eq(s.spe, 52, 'spe');
  arrEq(s.types, ['Ground', 'Normal'], 'types');
});

T('3. Ninetales-Alola no longer falls back to placeholder stats', () => {
  const mon = new Pokemon({
    name: 'Ninetales-Alola',
    level: 50,
    ability: 'Snow Warning',
    item: 'Focus Sash',
    nature: 'Modest',
    moves: ['Aurora Veil', 'Blizzard', 'Moonblast', 'Encore'],
    evs: { hp: 2, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 }
  }, '', 'champions');
  eq(mon._base.hp, 73, 'base hp');
  eq(mon._base.spa, 81, 'base spa');
  eq(mon._base.spd, 100, 'base spd');
  eq(mon._base.spe, 109, 'base spe');
  arrEq(mon.types, ['Ice', 'Fairy'], 'types');
});

T('4. Corrected regional-form stats flow into derived battle stats', () => {
  const typh = new Pokemon({
    name: 'Typhlosion-Hisui',
    level: 50,
    ability: '',
    item: '',
    nature: 'Serious',
    moves: ['Protect'],
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
  }, '', 'champions');
  const bear = new Pokemon({
    name: 'Ursaluna-Bloodmoon',
    level: 50,
    ability: '',
    item: '',
    nature: 'Serious',
    moves: ['Protect'],
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
  }, '', 'champions');

  eq(typh.baseAtk, 104, 'Typhlosion-Hisui atk');
  eq(typh.maxHp, 148, 'Typhlosion-Hisui hp');
  eq(bear.baseDef, 140, 'Ursaluna-Bloodmoon def');
  eq(bear.baseSpd, 85, 'Ursaluna-Bloodmoon spd');
  eq(bear.baseSpe, 72, 'Ursaluna-Bloodmoon spe');
});

T('5. Arcanine-Hisui is distinct from normal Arcanine in stats and typing', () => {
  const normal = BASE_STATS.Arcanine;
  const hisui = BASE_STATS['Arcanine-Hisui'];
  eq(hisui.hp, 95, 'Arcanine-Hisui hp');
  eq(hisui.atk, 115, 'Arcanine-Hisui atk');
  eq(hisui.spa, 95, 'Arcanine-Hisui spa');
  eq(hisui.spe, 90, 'Arcanine-Hisui spe');
  arrEq(hisui.types, ['Fire', 'Rock'], 'BASE_STATS Arcanine-Hisui types');
  arrEq(POKEMON_TYPES_DB['Arcanine-Hisui'], ['Fire', 'Rock'], 'POKEMON_TYPES_DB Arcanine-Hisui types');
  if (JSON.stringify(normal) === JSON.stringify(hisui)) throw new Error('Arcanine-Hisui must not share normal Arcanine stats');
});

T('6. Supported Hisui forms have concrete BASE_STATS instead of 80-all fallback', () => {
  [
    'Growlithe-Hisui', 'Arcanine-Hisui', 'Typhlosion-Hisui', 'Samurott-Hisui',
    'Decidueye-Hisui', 'Zorua-Hisui', 'Zoroark-Hisui', 'Braviary-Hisui',
    'Sliggoo-Hisui', 'Goodra-Hisui', 'Avalugg-Hisui', 'Lilligant-Hisui',
    'Voltorb-Hisui', 'Electrode-Hisui', 'Qwilfish-Hisui', 'Sneasel-Hisui'
  ].forEach((key) => {
    const s = BASE_STATS[key];
    if (!s) throw new Error(key + ' missing BASE_STATS');
    const line = [s.hp, s.atk, s.def, s.spa, s.spd, s.spe].join('/');
    if (line === '80/80/80/80/80/80') throw new Error(key + ' still uses placeholder fallback stats');
  });
});

T('7. Mega Altaria shipped team no longer has invalid Typhlosion-Hisui SP total', () => {
  const typh = TEAMS.mega_altaria.members.find((m) => m.name === 'Typhlosion-Hisui');
  const total = Object.values(typh.evs || {}).reduce((sum, value) => sum + value, 0);
  eq(total, 66, 'Typhlosion-Hisui SP total');
  const validation = validateTeam(TEAMS.mega_altaria, 'vgc');
  if (!validation.valid) throw new Error(validation.errors.join('; '));
});

console.log(`\nregional variant stat tests: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
