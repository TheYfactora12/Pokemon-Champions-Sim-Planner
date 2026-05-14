// t158_shield_family_tests.js
// Regression coverage for King's Shield / Spiky Shield / Baneful Bunker / Obstruct.

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

console.log('\n=== Shield family tests ===\n');

function team(members) {
  return { name: 'Test', format: 'champions', legality_status: 'legal', members };
}

function fastShield(move, name) {
  return {
    name,
    item: '',
    ability: 'Prankster',
    nature: 'Timid',
    level: 50,
    moves: [move],
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 252 }
  };
}

function contactAttacker(name) {
  return {
    name,
    item: '',
    ability: 'Intimidate',
    nature: 'Careful',
    level: 50,
    moves: ['Tackle'],
    evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 0, spe: 0 }
  };
}

T("1. King's Shield blocks contact and drops Attack", () => {
  const battle = ctx.simulateBattle(
    team([fastShield("King's Shield", 'Aegislash')]),
    team([contactAttacker('Incineroar')]),
    { format: 'doubles', seed: [2, 4, 6, 8], maxTurns: 1 }
  );
  truthy(battle.log.some(line => String(line).includes("used King's Shield!")), 'King\'s Shield should resolve');
  truthy(battle.log.some(line => String(line).includes("Attack fell due to King's Shield")),
    'contact rider should lower Attack');
  truthy(battle.log.some(line => String(line).includes('protected itself')),
    'shield should block the hit');
});

T('2. Spiky Shield blocks contact and pings the attacker', () => {
  const battle = ctx.simulateBattle(
    team([fastShield('Spiky Shield', 'Chesnaught')]),
    team([contactAttacker('Incineroar')]),
    { format: 'doubles', seed: [3, 5, 7, 9], maxTurns: 1 }
  );
  truthy(battle.log.some(line => String(line).includes('used Spiky Shield!')), 'Spiky Shield should resolve');
  truthy(battle.log.some(line => String(line).includes('hurt by Spiky Shield')),
    'contact rider should damage the attacker');
  truthy(battle.log.some(line => String(line).includes('protected itself')),
    'shield should block the hit');
});

T('3. Baneful Bunker poisons contact attackers', () => {
  const battle = ctx.simulateBattle(
    team([fastShield('Baneful Bunker', 'Toxapex')]),
    team([contactAttacker('Incineroar')]),
    { format: 'doubles', seed: [4, 6, 8, 10], maxTurns: 1 }
  );
  truthy(battle.log.some(line => String(line).includes('used Baneful Bunker!')), 'Baneful Bunker should resolve');
  truthy(battle.log.some(line => String(line).includes('was poisoned by Baneful Bunker')),
    'contact rider should poison the attacker');
});

T('4. Obstruct harshly lowers Defense on contact', () => {
  const battle = ctx.simulateBattle(
    team([fastShield('Obstruct', 'Grimmsnarl')]),
    team([contactAttacker('Incineroar')]),
    { format: 'doubles', seed: [5, 7, 9, 11], maxTurns: 1 }
  );
  truthy(battle.log.some(line => String(line).includes('used Obstruct!')), 'Obstruct should resolve');
  truthy(battle.log.some(line => String(line).includes('Defense harshly fell due to Obstruct')),
    'contact rider should lower Defense');
});

T('5. Source wiring exists for all shield riders', () => {
  const src = fs.readFileSync(path.join(ROOT, 'engine.js'), 'utf8');
  truthy(src.includes("King's Shield"), 'King\'s Shield string missing');
  truthy(src.includes('Spiky Shield'), 'Spiky Shield string missing');
  truthy(src.includes('Baneful Bunker'), 'Baneful Bunker string missing');
  truthy(src.includes('Obstruct'), 'Obstruct string missing');
  truthy(/hurt by Spiky Shield/.test(src), 'Spiky Shield rider missing');
  truthy(/poisoned by Baneful Bunker/.test(src), 'Baneful Bunker rider missing');
  truthy(/Defense harshly fell due to Obstruct/.test(src), 'Obstruct rider missing');
});

if (fail > 0) {
  process.exitCode = 1;
}
