'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const ctx = {
  console, require, module: {}, exports: {}, Math, Object, Array, Set, JSON,
  Promise, setTimeout, clearTimeout, Date, String, Number, Boolean, RegExp
};
ctx.globalThis = ctx;
ctx.window = {};
vm.createContext(ctx);

function load(file) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
}

load('data.js');
load('generated/pokemon_showdown_legal_data.js');
load('runtime_data.js');
load('engine.js');
vm.runInContext('this.Pokemon = Pokemon; this.simulateBattle = simulateBattle;', ctx);

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

function eq(actual, expected, msg) {
  if (actual !== expected) throw new Error((msg || 'not equal') + ' expected=' + JSON.stringify(expected) + ' got=' + JSON.stringify(actual));
}

function truthy(value, msg) {
  if (!value) throw new Error(msg || 'expected truthy');
}

function falsy(value, msg) {
  if (value) throw new Error(msg || 'expected falsy');
}

function member(name, overrides) {
  return Object.assign({
    name,
    level: 50,
    item: '',
    ability: '',
    nature: 'Serious',
    moves: ['Tackle'],
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
  }, overrides || {});
}

function team(members) {
  return {
    name: 'Test',
    format: 'champions',
    legality_status: 'legal',
    members
  };
}

console.log('\n=== ability damage parity tests ===\n');

T('1. Sturdy survives a lethal hit from full HP', function() {
  const probe = new ctx.Pokemon(member('Magnemite', { ability: 'Sturdy' }), '', 'champions');
  const battle = ctx.simulateBattle(
    team([member('Magnemite', { ability: 'Sturdy', hp: probe.maxHp })]),
    team([member('Garchomp', {
      ability: '',
      nature: 'Adamant',
      moves: ['Earthquake'],
      evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }
    })]),
    { format: 'singles', seed: [1, 2, 3, 4], maxTurns: 1 }
  );
  truthy(battle.log.some(line => String(line).includes('Magnemite hung on with Sturdy!')),
    'Sturdy activation log missing');
  eq(battle.playerSurvivors, 1, 'Sturdy holder should still be alive after the hit');
});

T('2. Sturdy does not trigger once the holder is chipped below full HP', function() {
  const probe = new ctx.Pokemon(member('Magnemite', { ability: 'Sturdy' }), '', 'champions');
  const battle = ctx.simulateBattle(
    team([member('Magnemite', { ability: 'Sturdy', hp: probe.maxHp - 1 })]),
    team([member('Garchomp', {
      ability: '',
      nature: 'Adamant',
      moves: ['Earthquake'],
      evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }
    })]),
    { format: 'singles', seed: [1, 2, 3, 4], maxTurns: 1 }
  );
  falsy(battle.log.some(line => String(line).includes('Magnemite hung on with Sturdy!')),
    'Sturdy should not trigger after prior chip damage');
  eq(battle.playerSurvivors, 0, 'Chipped Sturdy holder should faint to the lethal hit');
});

T('3. Rough Skin damages a contact attacker by one eighth max HP', function() {
  const attackerProbe = new ctx.Pokemon(member('Ninjask', { moves: ['Tackle'] }), '', 'champions');
  const expectedChip = Math.max(1, Math.floor(attackerProbe.maxHp / 8));
  const battle = ctx.simulateBattle(
    team([member('Ninjask', {
      moves: ['Tackle'],
      evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }
    })]),
    team([member('Garchomp', {
      ability: 'Rough Skin',
      moves: ['Splash'],
      evs: { hp: 32, atk: 0, def: 32, spa: 0, spd: 0, spe: 0 }
    })]),
    { format: 'singles', seed: [1, 2, 3, 4], maxTurns: 1 }
  );
  truthy(battle.log.some(line => String(line).includes("Ninjask was hurt by Garchomp's Rough Skin! [" + expectedChip + ' dmg]')),
    'Rough Skin contact chip log missing');
});

T('4. Rough Skin does not damage non-contact attackers', function() {
  const battle = ctx.simulateBattle(
    team([member('Garchomp', {
      moves: ['Earthquake'],
      evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }
    })]),
    team([member('Garchomp', {
      ability: 'Rough Skin',
      moves: ['Splash'],
      evs: { hp: 32, atk: 0, def: 32, spa: 0, spd: 0, spe: 0 }
    })]),
    { format: 'singles', seed: [1, 2, 3, 4], maxTurns: 1 }
  );
  falsy(battle.log.some(line => String(line).includes('Rough Skin')),
    'Rough Skin should not trigger on Earthquake');
});

T('5. Rough Skin can KO a weakened contact attacker after damage is dealt', function() {
  const battle = ctx.simulateBattle(
    team([member('Ninjask', {
      hp: 1,
      moves: ['Tackle'],
      evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }
    })]),
    team([member('Garchomp', {
      ability: 'Rough Skin',
      moves: ['Splash'],
      evs: { hp: 32, atk: 0, def: 32, spa: 0, spd: 0, spe: 0 }
    })]),
    { format: 'singles', seed: [1, 2, 3, 4], maxTurns: 1 }
  );
  truthy(battle.log.some(line => String(line).includes("Ninjask was hurt by Garchomp's Rough Skin!")),
    'Rough Skin KO chip log missing');
  truthy(battle.log.some(line => String(line).includes('Ninjask fainted!')),
    'Rough Skin should faint the weakened attacker');
  eq(battle.playerSurvivors, 0, 'Rough Skin should leave no player survivors when it KOs the only attacker');
});

T('6. Earth Eater blocks Ground damage and heals the target', function() {
  const orthwormEvs = { hp: 31, atk: 1, def: 1, spa: 0, spd: 32, spe: 1 };
  const probe = new ctx.Pokemon(member('Orthworm', { ability: 'Earth Eater', evs: orthwormEvs }), '', 'champions');
  const expectedHeal = Math.max(1, Math.floor(probe.maxHp / 4));
  const startingHp = probe.maxHp - expectedHeal;
  const battle = ctx.simulateBattle(
    team([member('Orthworm', {
      ability: 'Earth Eater',
      hp: startingHp,
      moves: ['Splash'],
      evs: orthwormEvs
    })]),
    team([member('Garchomp', {
      ability: '',
      nature: 'Adamant',
      moves: ['Earthquake'],
      evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }
    })]),
    { format: 'singles', seed: [1, 2, 3, 4], maxTurns: 1 }
  );
  truthy(battle.log.some(line => String(line).includes("Orthworm's Earth Eater restored HP! [+" + expectedHeal + ' HP]')),
    'Earth Eater heal log missing');
  falsy(battle.log.some(line => String(line).includes('Garchomp used Earthquake!') && String(line).includes('Orthworm')),
    'Earth Eater should block normal Earthquake damage application');
  eq(battle.playerSurvivors, 1, 'Earth Eater holder should survive the Ground hit');
});

console.log('\nability damage parity:', pass + ' pass, ' + fail + ' fail\n');
process.exit(fail ? 1 : 0);
