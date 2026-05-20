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
  'this.TEAMS = TEAMS;',
  'this.Pokemon = Pokemon;'
].join('\n'), ctx);

const { BASE_STATS, TEAMS, Pokemon } = ctx;

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

console.log(`\nregional variant stat tests: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
