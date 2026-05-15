// t153_tailwind_speed_tests.js
// Regression coverage for Tailwind speed control.
// Tailwind should double effective Speed for the side that set it.

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ctx = {
  console, require, module: { exports: {} }, exports: {},
  Math, Object, Array, Set, JSON, Promise, setTimeout,
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

function load(f) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
}

load('data.js');
load('engine.js');

vm.runInContext([
  'this.Pokemon = Pokemon;',
  'this.Field = Field;'
].join('\n'), ctx);

const { Pokemon, Field } = ctx;

let pass = 0, fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '—', e.message); fail++; }
}
function eq(a, b, msg='') {
  if (a !== b) throw new Error(`${msg} expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

T('Tailwind doubles effective Speed for the active side', () => {
  const field = new Field();
  const mon = new Pokemon({
    name: 'Whimsicott',
    level: 50,
    ability: '',
    item: '',
    moves: ['Tailwind'],
    evs: { hp:0, atk:0, def:0, spa:0, spd:0, spe:0 },
    ivs: { hp:31, atk:31, def:31, spa:31, spd:31, spe:31 }
  }, field, 'player');
  mon.side = field.playerSide;
  field.playerSide.tailwind = true;

  const base = mon.getStat('spe', field);
  const eff = mon.getEffSpeed(field);

  eq(base * 2, eff, 'tailwind speed boost');
});

if (fail > 0) {
  process.exitCode = 1;
}
