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
      ability: 'Rough Skin',
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
      ability: 'Rough Skin',
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

console.log('\nability damage parity:', pass + ' pass, ' + fail + ' fail\n');
process.exit(fail ? 1 : 0);
