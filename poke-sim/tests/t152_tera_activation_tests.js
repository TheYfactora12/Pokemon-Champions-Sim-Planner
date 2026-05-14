// Issue #152 - Tera activation should happen on the first action.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

const ctx = {
  console, require, module: {}, exports: {}, Math, Object, Array, Set, JSON,
  Promise, setTimeout, clearTimeout, Date, String, Number, Boolean, RegExp,
  parseInt, parseFloat
};
vm.createContext(ctx);

function load(file) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
}

load('data.js');
load('engine.js');
vm.runInContext([
  'this.simulateBattle = simulateBattle;',
  'this.Field = Field;',
  'this.Pokemon = Pokemon;'
].join('\n'), ctx);

let pass = 0, fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}
function truthy(v, msg='') { if (!v) throw new Error(msg || 'expected truthy'); }

console.log('\n=== Tera activation tests ===\n');

const playerTeam = {
  name: 'Tera User',
  format: 'champions',
  legality_status: 'legal',
  members: [{
    name: 'Garchomp',
    item: '',
    ability: '',
    nature: 'Jolly',
    level: 50,
    teraType: 'Fire',
    moves: ['Tackle'],
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 252 }
  }]
};

const oppTeam = {
  name: 'Slow Target',
  format: 'champions',
  legality_status: 'legal',
  members: [{
    name: 'Blissey',
    item: '',
    ability: '',
    nature: 'Sassy',
    level: 50,
    moves: ['Tackle'],
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 252, spe: 0 }
  }]
};

T('1. first action triggers Tera activation log', () => {
  const battle = ctx.simulateBattle(playerTeam, oppTeam, { format: 'singles', seed: [7, 8, 9, 10] });
  truthy(Array.isArray(battle.log), 'battle log missing');
  truthy(battle.log.some(line => String(line).includes('Terastallized into Fire')), 'tera activation log missing');
});

console.log(`\ntera activation: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
