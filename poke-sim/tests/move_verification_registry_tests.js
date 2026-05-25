const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const ctx = {
  console,
  require,
  module: { exports: {} },
  exports: {},
  Math,
  Object,
  Array,
  Set,
  JSON
};
vm.createContext(ctx);

function load(file) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
}

load('data.js');
load('engine.js');
load('generated/pokemon_showdown_legal_data.js');
load('move_support.js');
vm.runInContext('this.Pokemon = Pokemon; this.Field = Field; this.simulateBattle = simulateBattle;', ctx);

const { Pokemon, Field, simulateBattle } = ctx;
const moveSupport = ctx.ChampionsSim.moveSupport;

let pass = 0;
let fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}
function truthy(value, msg) {
  if (!value) throw new Error(msg || 'expected truthy');
}
function eq(actual, expected, msg) {
  if (actual !== expected) throw new Error((msg || 'expected equality') + ': got ' + actual + ', expected ' + expected);
}

function mk(name, overrides) {
  const d = Object.assign({ name, level: 50, moves: ['Tackle'], ability: '', item: '', nature: 'Hardy' }, overrides || {});
  return new Pokemon(d);
}

function mkField(overrides) {
  return new Field(Object.assign({ format: 'doubles' }, overrides || {}));
}

function team(name, members) {
  return { name, format: 'champions', legality_status: 'legal', members };
}

const rngAlwaysLo = () => 0.0;

console.log('\n=== move verification registry tests ===\n');

T('1. Freeze-Dry keeps Water targets super effective', () => {
  const attacker = mk('Ninetales-Alola', { moves: ['Freeze-Dry'], nature: 'Modest', evs: { spa: 31 } });
  const target = mk('Pelipper');
  const field = mkField();
  attacker.side = field.playerSide;
  target.side = field.oppSide;
  field._ctx.forceNoCrit = true;
  target.types = ['Fire'];
  const neutralishDamage = attacker.calcDamage('Freeze-Dry', target, field, null, rngAlwaysLo);
  target.types = ['Water'];
  const waterDamage = attacker.calcDamage('Freeze-Dry', target, field, null, rngAlwaysLo);
  truthy(waterDamage > neutralishDamage, 'Water typing should increase Freeze-Dry damage');
});

T('2. Giga Drain heals after dealing damage', () => {
  const player = team('Drain Test', [{
    name: 'Amoonguss',
    ability: 'Regenerator',
    item: '',
    nature: 'Calm',
    level: 50,
    moves: ['Giga Drain'],
    evs: { hp: 252, def: 252, spd: 4, atk: 0, spa: 0, spe: 0 }
  }]);
  const opp = team('Chip Test', [{
    name: 'Jolteon',
    ability: 'Volt Absorb',
    item: '',
    nature: 'Timid',
    level: 50,
    moves: ['Tackle'],
    evs: { hp: 0, atk: 4, def: 0, spa: 0, spd: 0, spe: 252 }
  }]);
  const battle = simulateBattle(player, opp, { format: 'singles', seed: [1, 3, 5, 7], maxTurns: 1 });
  truthy(battle.log.some((line) => String(line).includes('used Tackle!') && String(line).includes('Amoonguss')),
    'opponent should chip the Giga Drain user first');
  truthy(battle.log.some((line) => String(line).includes('restored HP with Giga Drain')),
    'Giga Drain heal log missing');
});

T('3. Rock Tomb lowers target Speed after damage', () => {
  const player = team('Speed Drop Test', [{
    name: 'Garchomp',
    ability: 'Rough Skin',
    item: '',
    nature: 'Jolly',
    level: 50,
    moves: ['Rock Tomb'],
    evs: { atk: 252, spe: 252, hp: 4, def: 0, spa: 0, spd: 0 }
  }]);
  const opp = team('Dummy', [{
    name: 'Charizard',
    ability: 'Blaze',
    item: '',
    nature: 'Timid',
    level: 50,
    moves: ['Protect'],
    evs: { hp: 252, def: 0, spa: 0, spd: 0, spe: 252, atk: 0 }
  }]);
  const battle = simulateBattle(player, opp, { format: 'singles', seed: [9, 7, 5, 3], maxTurns: 1 });
  truthy(battle.log.some((line) => String(line).includes("Charizard's Speed fell!")),
    'Rock Tomb speed-drop log missing');
});

T('4. Light Screen reduces special damage', () => {
  const attacker = mk('Gardevoir', { moves: ['Moonblast'], nature: 'Modest', evs: { spa: 31 } });
  const target = mk('Incineroar');
  const field = mkField();
  attacker.side = field.playerSide;
  target.side = field.oppSide;
  field._ctx.forceNoCrit = true;
  const openDamage = attacker.calcDamage('Moonblast', target, field, null, rngAlwaysLo);
  target.side.lightScreen = true;
  const screenedDamage = attacker.calcDamage('Moonblast', target, field, null, rngAlwaysLo);
  truthy(openDamage > screenedDamage, 'Light Screen should reduce special damage');
});

T('5. Reflect reduces physical damage', () => {
  const attacker = mk('Garchomp', { moves: ['Earthquake'], nature: 'Adamant', evs: { atk: 31 } });
  const target = mk('Incineroar');
  const field = mkField();
  attacker.side = field.playerSide;
  target.side = field.oppSide;
  field._ctx.forceNoCrit = true;
  const openDamage = attacker.calcDamage('Earthquake', target, field, null, rngAlwaysLo);
  target.side.reflect = true;
  const screenedDamage = attacker.calcDamage('Earthquake', target, field, null, rngAlwaysLo);
  truthy(openDamage > screenedDamage, 'Reflect should reduce physical damage');
});

T('6. verified registry exposes sources and tests for the promoted move slice', () => {
  ['Freeze-Dry', 'Giga Drain', 'Rock Tomb', 'Light Screen', 'Reflect'].forEach((move) => {
    const row = moveSupport.getLocalMoveSupport(move);
    truthy(row, move + ' support row missing');
    eq(row.supportLevel, 'verified', move + ' support level');
    truthy(row.verification, move + ' verification metadata missing');
    truthy(Array.isArray(row.verification.sources) && row.verification.sources.length > 0, move + ' source refs missing');
    truthy(Array.isArray(row.verification.tests) && row.verification.tests.length > 0, move + ' test refs missing');
  });
});

console.log(`\nmove verification registry: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
