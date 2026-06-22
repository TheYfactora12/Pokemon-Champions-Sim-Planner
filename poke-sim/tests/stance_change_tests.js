'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const dataSource = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
const runtimeSource = fs.readFileSync(path.join(ROOT, 'runtime_data.js'), 'utf8');
const showdownSource = fs.readFileSync(path.join(ROOT, 'generated/pokemon_showdown_legal_data.js'), 'utf8');
const engineSource = fs.readFileSync(path.join(ROOT, 'engine.js'), 'utf8');

const ctx = {
  console, require, module: {}, exports: {}, Math, Object, Array, Set, JSON,
  Promise, setTimeout, clearTimeout, Date, String, Number, Boolean, RegExp,
  window: {}
};
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(dataSource, ctx, { filename: 'data.js' });
vm.runInContext(showdownSource, ctx, { filename: 'generated/pokemon_showdown_legal_data.js' });
vm.runInContext(runtimeSource, ctx, { filename: 'runtime_data.js' });
vm.runInContext(engineSource + '\nthis.Pokemon = Pokemon; this.Field = Field; this.simulateBattle = simulateBattle;', ctx, { filename: 'engine.js' });

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

function member(name, overrides) {
  return Object.assign({
    name,
    level: 50,
    item: '',
    ability: 'Stance Change',
    nature: 'Serious',
    moves: ['Iron Head'],
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

console.log('\n=== stance change tests ===\n');

T('1. Aegislash starts in Shield Forme stats', function() {
  const aegislash = new ctx.Pokemon(member('Aegislash'), '', 'champions');
  eq(aegislash.stanceForm, 'shield', 'starting form');
  eq(aegislash.baseAtk, 70, 'shield atk should reflect 50 base');
  eq(aegislash.baseDef, 160, 'shield def should reflect 140 base');
});

T('2. imported Aegislash-Blade hydrates Blade Forme stats under the canonical name', function() {
  const aegislash = new ctx.Pokemon(member('Aegislash-Blade'), '', 'champions');
  eq(aegislash.name, 'Aegislash', 'canonical engine name');
  eq(aegislash.stanceForm, 'blade', 'starting imported form');
  eq(aegislash.baseAtk, 160, 'blade atk should reflect 140 base');
  eq(aegislash.baseDef, 70, 'blade def should reflect 50 base');
});

T('3. setStanceForm swaps to Blade Forme and preserves HP', function() {
  const aegislash = new ctx.Pokemon(member('Aegislash', { nature: 'Adamant', evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 0 } }), '', 'champions');
  const beforeHp = aegislash.maxHp - 12;
  aegislash.hp = beforeHp;
  truthy(aegislash.setStanceForm('blade'), 'should swap to blade');
  eq(aegislash.stanceForm, 'blade', 'form after swap');
  eq(aegislash.hp, beforeHp, 'HP should be preserved');
  truthy(aegislash.baseAtk > aegislash.baseDef, 'blade should favor offense');
});

T('4. setStanceForm swaps back to Shield Forme and preserves HP', function() {
  const aegislash = new ctx.Pokemon(member('Aegislash'), '', 'champions');
  aegislash.setStanceForm('blade');
  aegislash.hp = aegislash.maxHp - 9;
  truthy(aegislash.setStanceForm('shield'), 'should swap back to shield');
  eq(aegislash.stanceForm, 'shield', 'form after swap back');
  eq(aegislash.hp, aegislash.maxHp - 9, 'HP should stay fixed');
  truthy(aegislash.baseDef > aegislash.baseAtk, 'shield should favor defense');
});

T('5. using an attacking move in battle logs the Blade Forme shift', function() {
  const battle = ctx.simulateBattle(
    team([member('Aegislash', { nature: 'Adamant', moves: ['Iron Head'], evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 } })]),
    team([member('Snorlax', { ability: 'Immunity', moves: ['Tackle'], evs: { hp: 32, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 } })]),
    { format: 'singles', seed: [4, 3, 2, 1], maxTurns: 1 }
  );
  truthy(battle.log.some(line => String(line).includes('Aegislash shifted into Blade Forme!')),
    'battle log should show the offensive form shift');
});

T('6. engine resets Aegislash to Shield Forme on switch-in', function() {
  truthy(engineSource.includes("if (replacement.stanceChangeForms) replacement.setStanceForm('shield');"),
    'switch-in reset should restore Shield Forme');
});

T("7. engine wires King's Shield to Shield Forme before resolution", function() {
  truthy(engineSource.includes('if (move === "King\'s Shield") {') && engineSource.includes("attacker.setStanceForm('shield')"),
    "King's Shield should route the user back into Shield Forme");
});

console.log('\nstance change:', pass + ' pass, ' + fail + ' fail\n');
process.exit(fail ? 1 : 0);
