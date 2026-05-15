// t157_protect_family_tests.js
// Regression coverage for Protect-family failure chaining and Endure.

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
vm.runInContext('this.simulateBattle = simulateBattle;', ctx);

let pass = 0, fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}
function truthy(v, msg='') { if (!v) throw new Error(msg || 'expected truthy'); }

console.log('\n=== Protect family tests ===\n');

function team(members) {
  return { name: 'Test', format: 'champions', legality_status: 'legal', members };
}

T('1. Protect success drops on consecutive use', () => {
  const playerTeam = team([{
    name: 'Cresselia',
    item: '',
    ability: 'Levitate',
    nature: 'Calm',
    level: 50,
    moves: ['Protect'],
    evs: { hp: 252, atk: 0, def: 0, spa: 0, spd: 252, spe: 4 }
  }]);
  const oppTeam = team([{
    name: 'Incineroar',
    item: '',
    ability: '',
    nature: 'Careful',
    level: 50,
    moves: ['Tackle'],
    evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 0, spe: 0 }
  }]);
  const battle = ctx.simulateBattle(playerTeam, oppTeam, { format: 'doubles', seed: [1, 3, 5, 7], maxTurns: 2 });
  truthy(battle.log.some(line => String(line).includes('Cresselia used Protect!')),
    'first Protect should resolve');
  truthy(battle.log.some(line => String(line).includes('Cresselia used Protect! But it failed!')),
    'second Protect should fail on the same stay');
});

T('2. Endure leaves the user braced for the turn', () => {
  const playerTeam = team([{
    name: 'Magikarp',
    item: '',
    ability: 'Swift Swim',
    nature: 'Serious',
    level: 50,
    moves: ['Endure'],
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
  }]);
  const oppTeam = team([{
    name: 'Electrode',
    item: '',
    ability: 'Static',
    nature: 'Timid',
    level: 50,
    moves: ['Explosion'],
    evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 }
  }]);
  const battle = ctx.simulateBattle(playerTeam, oppTeam, { format: 'doubles', seed: [1, 3, 5, 7], maxTurns: 1 });
  const endureIdx = battle.log.findIndex(line => String(line).includes('braced itself with Endure!'));
  const explosionIdx = battle.log.findIndex(line => String(line).includes('used Explosion!'));
  truthy(endureIdx >= 0, 'Endure should resolve and set the stance');
  truthy(explosionIdx >= 0, 'opponent damage path should still run');
  truthy(endureIdx < explosionIdx, 'Endure should act before the attack lands');
});

T('3. Source wiring exists for Endure and endurance survival', () => {
  const src = fs.readFileSync(path.join(ROOT, 'engine.js'), 'utf8');
  truthy(/'Endure':4/.test(src), 'Endure priority missing');
  truthy(/move === 'Endure'[\s\S]*?attacker\.enduring = true/.test(src),
    'Endure stance setter missing');
  truthy(/target\.enduring && finalDmg >= target\.hp/.test(src),
    'Endure survival branch missing');
  truthy(/Math\.pow\(1\/3, attacker\.protectChain \|\| 0\)/.test(src),
    'Protect chain chance missing');
});

if (fail > 0) {
  process.exitCode = 1;
}
