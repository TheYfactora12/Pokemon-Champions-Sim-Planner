// t156_move_lock_tests.js
// Regression coverage for move-choice locks and support-move suppression.

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

console.log('\n=== Move lock tests ===\n');

function team(members) {
  return { name: 'Test', format: 'champions', legality_status: 'legal', members };
}

T('1. Taunt blocks status-only move choices and forces Struggle', () => {
  const playerTeam = team([{
    name: 'Whimsicott',
    item: '',
    ability: 'Prankster',
    nature: 'Timid',
    level: 50,
    moves: ['Taunt', 'Protect', 'Encore', 'Haze'],
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 252 }
  }]);
  const oppTeam = team([{
    name: 'Cofagrigus',
    item: '',
    ability: 'Mummy',
    nature: 'Quiet',
    level: 50,
    moves: ['Haze', 'Protect', 'Encore', 'Defog'],
    evs: { hp: 252, atk: 0, def: 0, spa: 0, spd: 252, spe: 0 }
  }]);
  const battle = ctx.simulateBattle(playerTeam, oppTeam, { format: 'doubles', seed: [7, 8, 9, 10], maxTurns: 2 });
  truthy(battle.log.some(line => String(line).includes('fell for the Taunt!')), 'Taunt infliction missing');
  truthy(battle.log.some(line => String(line).includes('used Struggle!')), 'taunted target should fall back to Struggle');
});

T('2. Sucker Punch fails when the target selected a status move', () => {
  const playerTeam = team([{
    name: 'Absol',
    item: '',
    ability: 'Super Luck',
    nature: 'Jolly',
    level: 50,
    moves: ['Sucker Punch', 'Protect', 'Taunt', 'Haze'],
    evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 0, spe: 4 }
  }]);
  const oppTeam = team([{
    name: 'Cofagrigus',
    item: '',
    ability: 'Mummy',
    nature: 'Quiet',
    level: 50,
    moves: ['Haze', 'Protect', 'Encore', 'Defog'],
    evs: { hp: 252, atk: 0, def: 0, spa: 0, spd: 252, spe: 0 }
  }]);
  const battle = ctx.simulateBattle(playerTeam, oppTeam, { format: 'doubles', seed: [3, 4, 5, 6], maxTurns: 1 });
  truthy(battle.log.some(line => String(line).includes('used Sucker Punch! But it failed!')),
    'Sucker Punch should fail against a status move');
});

T('3. Encore repeats the last move and can flip Trick Room back off', () => {
  const playerTeam = team([{
    name: 'RuleMon',
    item: '',
    ability: 'Prankster',
    nature: 'Timid',
    level: 50,
    moves: ['Will-O-Wisp', 'Encore', 'Protect', 'Haze'],
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 252 }
  }]);
  const oppTeam = team([{
    name: 'Cofagrigus',
    item: '',
    ability: 'Mummy',
    nature: 'Quiet',
    level: 50,
    moves: ['Trick Room', 'Tackle', 'Protect', 'Shadow Ball'],
    evs: { hp: 252, atk: 0, def: 0, spa: 0, spd: 252, spe: 0 }
  }]);
  const battle = ctx.simulateBattle(playerTeam, oppTeam, { format: 'doubles', seed: [11, 12, 13, 14], maxTurns: 2 });
  truthy(battle.log.some(line => String(line).includes('got an Encore!')), 'Encore should lock the target');
  truthy(battle.log.some(line => String(line).includes('Trick Room returned to NORMAL!')),
    'encored Trick Room should flip the field back off on the repeat use');
});

T('4. Source wiring exists for Haze, Defog, and Sucker Punch', () => {
  const src = fs.readFileSync(path.join(ROOT, 'engine.js'), 'utf8');
  truthy(/move === 'Haze'[\s\S]*statBoosts = \{ atk:0, def:0, spa:0, spd:0, spe:0, acc:0, eva:0 \}/.test(src),
    'Haze reset block missing');
  truthy(/move === 'Defog'[\s\S]*terrain = 'none'[\s\S]*terrainTurns = 0/.test(src),
    'Defog field reset block missing');
  truthy(/move === 'Sucker Punch'[\s\S]*targetMove/.test(src),
    'Sucker Punch target-intent gate missing');
});

if (fail > 0) {
  process.exitCode = 1;
}
