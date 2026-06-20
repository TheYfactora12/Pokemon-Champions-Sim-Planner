const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ctx = {
  console, require, module: {}, exports: {}, Math, Object, Array, Set, JSON,
  Number, String, Boolean, RegExp, Date
};
ctx.globalThis = ctx;
vm.createContext(ctx);

function load(file) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
}

load('data.js');
load('generated/pokemon_showdown_legal_data.js');
load('runtime_data.js');
load('engine.js');
vm.runInContext([
  'this.runtimeData = ChampionsSim.runtimeData;',
  'this.overrides = ChampionsSim.overrides;',
  'this.Pokemon = Pokemon;',
  'this.Field = Field;'
].join('\n'), ctx);

const runtimeData = ctx.runtimeData;
const overrides = ctx.overrides;
const Pokemon = ctx.Pokemon;
const Field = ctx.Field;

let pass = 0;
let fail = 0;

function T(name, fn) {
  try {
    fn();
    console.log('  PASS', name);
    pass++;
  } catch (err) {
    console.log('  FAIL', name, '-', err.message);
    fail++;
  }
}

function eq(a, b, msg) {
  if (a !== b) throw new Error((msg || 'not equal') + ' expected=' + JSON.stringify(b) + ' got=' + JSON.stringify(a));
}

function truthy(value, msg) {
  if (!value) throw new Error(msg || 'expected truthy');
}

function mk(name, overrides) {
  return new Pokemon(Object.assign({
    name: name,
    item: '',
    ability: '',
    nature: 'Hardy',
    moves: ['Thunderbolt'],
    evs: {}
  }, overrides || {}), '', 'champions');
}

console.log('\n=== runtime data bridge tests ===\n');

T('1. runtime bridge exposes generated move/species lookups', () => {
  truthy(runtimeData, 'runtimeData missing');
  const move = runtimeData.getMoveRow('Thunderbolt');
  const species = runtimeData.getSpeciesRow('Arcanine-Hisui');
  truthy(move && move.type === 'Electric', 'Thunderbolt move row missing');
  truthy(species && species.types && species.types[0] === 'Fire', 'Arcanine-Hisui species row missing');
});

T('2. champions damage roll window is explicit in runtime overrides', () => {
  const win = runtimeData.getDamageRollWindow({ statFormat: 'champions' });
  eq(win.mode, 'discrete_percent', 'champions roll mode');
  eq(win.min, 86, 'champions min roll');
  eq(win.max, 100, 'champions max roll');
  eq(runtimeData.sampleDamageRoll({ statFormat: 'champions' }, function() { return 0; }), 0.86, 'low champions roll');
  eq(runtimeData.sampleDamageRoll({ statFormat: 'champions' }, function() { return 0.999999; }), 1.0, 'high champions roll');
});

T('3. engine damage uses runtime roll override instead of DB-side logic', () => {
  const attacker = mk('Raichu', { nature: 'Modest', moves: ['Thunderbolt'], evs: { spa: 31 } });
  const target = mk('Pelipper');
  const field = new Field({ format: 'doubles' });
  attacker.side = field.playerSide;
  target.side = field.oppSide;
  field._ctx.forceNoCrit = true;

  const original = JSON.parse(JSON.stringify(overrides.damage.rollWindows));
  try {
    overrides.damage.rollWindows.champions = { mode: 'discrete_percent', min: 86, max: 86 };
    const low = attacker.calcDamage('Thunderbolt', target, field, null, function() { return 0; });
    overrides.damage.rollWindows.champions = { mode: 'discrete_percent', min: 100, max: 100 };
    const high = attacker.calcDamage('Thunderbolt', target, field, null, function() { return 0; });
    truthy(high > low, 'engine should reflect runtime override roll window');
  } finally {
    overrides.damage.rollWindows = original;
  }
});

console.log('\nruntime data bridge:', pass + ' pass, ' + fail + ' fail\n');
process.exit(fail ? 1 : 0);
