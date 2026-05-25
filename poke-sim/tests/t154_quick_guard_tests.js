// Issue #154 - Quick Guard should block opposing priority moves on its side.

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

console.log('\n=== Quick Guard tests ===\n');

const playerTeam = {
  name: 'Guard Team',
  format: 'champions',
  legality_status: 'legal',
  members: [{
    name: 'Whimsicott',
    item: '',
    ability: 'Prankster',
    nature: 'Timid',
    level: 50,
    moves: ['Quick Guard'],
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 4, spe: 252 }
  }, {
    name: 'Incineroar',
    item: '',
    ability: 'Intimidate',
    nature: 'Careful',
    level: 50,
    moves: ['Tackle'],
    evs: { hp: 252, atk: 0, def: 0, spa: 0, spd: 252, spe: 4 }
  }]
};

const oppTeam = {
  name: 'Priority Threat',
  format: 'champions',
  legality_status: 'legal',
  members: [{
    name: 'Incineroar',
    item: '',
    ability: 'Intimidate',
    nature: 'Adamant',
    level: 50,
    moves: ['Fake Out'],
    evs: { hp: 32, atk: 32, def: 0, spa: 0, spd: 0, spe: 4 }
  }, {
    name: 'Smeargle',
    item: '',
    ability: 'Own Tempo',
    nature: 'Serious',
    level: 50,
    moves: ['Protect'],
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
  }]
};

T('1. AI uses Quick Guard when facing a priority threat', () => {
  const battle = ctx.simulateBattle(playerTeam, oppTeam, { format: 'doubles', seed: [11, 12, 13, 14] });
  truthy(Array.isArray(battle.log), 'battle log missing');
  truthy(battle.log.some(line => String(line).includes('used Quick Guard!')), 'Quick Guard was not chosen');
  truthy(battle.log.some(line => String(line).includes('Quick Guard blocked Fake Out')), 'priority block did not occur');
});

console.log(`\nquick guard: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
