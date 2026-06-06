'use strict';

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
vm.runInContext(
  'this.Pokemon = Pokemon; this.Field = Field; this.simulateBattle = simulateBattle; this._compareTurnActionOrder = _compareTurnActionOrder;',
  ctx
);

const Pokemon = ctx.Pokemon;
const Field = ctx.Field;
const simulateBattle = ctx.simulateBattle;
const compareTurnActionOrder = ctx._compareTurnActionOrder;

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

function truthy(v, msg) {
  if (!v) throw new Error(msg || 'expected truthy');
}

function eq(a, b, msg) {
  if (a !== b) throw new Error((msg || 'expected equality') + ' expected ' + JSON.stringify(b) + ', got ' + JSON.stringify(a));
}

function mk(name, overrides) {
  return new Pokemon(Object.assign({
    name,
    item: '',
    ability: '',
    nature: 'Hardy',
    level: 50,
    moves: ['Tackle'],
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
  }, overrides || {}));
}

function team(members) {
  return { name: 'Turn Order Test', format: 'champions', legality_status: 'legal', members };
}

function action(mon, priority) {
  return { attacker: mon, move: 'Tackle', priority: priority || 0 };
}

function indexAfter(log, needle, after) {
  for (let i = Math.max(0, after + 1); i < log.length; i += 1) {
    if (String(log[i]).includes(needle)) return i;
  }
  return -1;
}

console.log('\n=== turn order / priority tests ===\n');

T('1. move priority acts before speed', function() {
  const field = new Field();
  const slow = mk('Cofagrigus', { evs: { hp: 32, atk: 0, def: 0, spa: 0, spd: 32, spe: 0 } });
  const fast = mk('Dragapult', { nature: 'Jolly', evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 32 } });
  truthy(compareTurnActionOrder(action(slow, 1), action(fast, 0), field, function() { return 0.75; }) < 0,
    'higher-priority move should act first even when user is slower');
});

T('2. normal turn order uses boosted Speed from getEffSpeed', function() {
  const field = new Field();
  const slow = mk('Cofagrigus', { evs: { hp: 32, atk: 0, def: 0, spa: 0, spd: 32, spe: 0 } });
  const fast = mk('Dragapult', { nature: 'Jolly', evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 32 } });
  truthy(compareTurnActionOrder(action(fast, 0), action(slow, 0), field, function() { return 0.75; }) < 0,
    'faster Pokemon should act first outside Trick Room');
});

T('3. Trick Room makes the slower same-priority Pokemon act first', function() {
  const field = new Field();
  field.trickRoom = true;
  field.trickRoomTurns = 5;
  const slow = mk('Cofagrigus', { evs: { hp: 32, atk: 0, def: 0, spa: 0, spd: 32, spe: 0 } });
  const fast = mk('Dragapult', { nature: 'Jolly', evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 32 } });
  truthy(compareTurnActionOrder(action(slow, 0), action(fast, 0), field, function() { return 0.75; }) < 0,
    'slower Pokemon should act first under Trick Room');
});

T('4. Speed boosts, Tailwind, and Choice Scarf feed turn order', function() {
  const field = new Field();
  const boosted = mk('Garchomp', { item: 'Choice Scarf', evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 32 } });
  const baseline = mk('Dragapult', { nature: 'Jolly', evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 32 } });
  boosted.side = field.playerSide;
  field.playerSide.tailwind = true;
  boosted.statBoosts.spe = 1;
  truthy(boosted.getEffSpeed(field) > baseline.getEffSpeed(field), 'boosted effective Speed should exceed baseline');
  truthy(compareTurnActionOrder(action(boosted, 0), action(baseline, 0), field, function() { return 0.75; }) < 0,
    'boosted Pokemon should act first outside Trick Room');
});

T('5. exact Speed ties use seeded RNG as the final tiebreak', function() {
  const field = new Field();
  const a = mk('Garchomp', { evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 32 } });
  const b = mk('Garchomp', { evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 32 } });
  eq(compareTurnActionOrder(action(a, 0), action(b, 0), field, function() { return 0.25; }), -1,
    'low RNG roll should put first action first');
  eq(compareTurnActionOrder(action(a, 0), action(b, 0), field, function() { return 0.75; }), 1,
    'high RNG roll should put second action first');
});

T('6. live battle order respects Trick Room after it is set', function() {
  const playerTeam = team([{
    name: 'Cofagrigus',
    item: '',
    ability: 'Mummy',
    nature: 'Relaxed',
    level: 50,
    moves: ['Trick Room'],
    evs: { hp: 32, atk: 0, def: 32, spa: 0, spd: 0, spe: 0 }
  }, {
    name: 'Torkoal',
    item: '',
    ability: 'Drought',
    nature: 'Quiet',
    level: 50,
    moves: ['Tackle'],
    evs: { hp: 32, atk: 0, def: 32, spa: 0, spd: 0, spe: 0 }
  }]);
  const oppTeam = team([{
    name: 'Garchomp',
    item: '',
    ability: 'Rough Skin',
    nature: 'Jolly',
    level: 50,
    moves: ['Tackle'],
    evs: { hp: 32, atk: 0, def: 0, spa: 0, spd: 0, spe: 32 }
  }, {
    name: 'Arcanine',
    item: '',
    ability: 'Flash Fire',
    nature: 'Jolly',
    level: 50,
    moves: ['Tackle'],
    evs: { hp: 32, atk: 0, def: 0, spa: 0, spd: 0, spe: 32 }
  }]);
  const battle = simulateBattle(playerTeam, oppTeam, { format: 'doubles', seed: [101, 102, 103, 104], maxTurns: 2 });
  const trIdx = battle.log.findIndex(line => String(line).includes('Trick Room was set'));
  const slowIdx = indexAfter(battle.log, 'Torkoal used Tackle!', trIdx);
  const fastIdx = indexAfter(battle.log, 'Garchomp used Tackle!', trIdx);
  truthy(trIdx >= 0, 'Trick Room should be set on turn 1');
  truthy(slowIdx >= 0 && fastIdx >= 0, 'both same-priority attackers should move after Trick Room is set');
  truthy(slowIdx < fastIdx, 'Torkoal should move before Garchomp under Trick Room');
});

console.log('\nturn order / priority:', pass + ' pass, ' + fail + ' fail\n');
process.exit(fail ? 1 : 0);
