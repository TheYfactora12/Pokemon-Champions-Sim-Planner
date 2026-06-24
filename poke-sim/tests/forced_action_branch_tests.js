'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const ctx = { console, Math, Object, Array, Set, Map, JSON, Date, String, Number, Boolean, RegExp, Error, Symbol, parseFloat, parseInt, isFinite, window: {} };
vm.createContext(ctx);

function load(file) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
}

load('data.js');
load('engine.js');

vm.runInContext('this.simulateBattle = simulateBattle;', ctx);

let pass = 0;
let fail = 0;
function T(name, fn) {
  try {
    fn();
    pass++;
    console.log('  PASS', name);
  } catch (err) {
    fail++;
    console.log('  FAIL', name, '-', err.message);
  }
}
function truthy(value, msg) {
  if (!value) throw new Error(msg || 'expected truthy');
}

function team(name, members) {
  return { name, format: 'champions', legality_status: 'legal', members };
}

function mon(name, moves, extra) {
  return Object.assign({
    name,
    ability: '',
    item: '',
    nature: 'Hardy',
    level: 50,
    moves,
    evs: { hp: 32, atk: 32, def: 0, spa: 0, spd: 0, spe: 2 }
  }, extra || {});
}

console.log('\n=== forced action branch tests ===\n');

T('1. simulateBattle forcedActions can override greedy move selection', () => {
  const player = team('Forced Player', [
    mon('Kommo-o', ['Clangorous Soul', 'Clanging Scales'], {
      nature: 'Modest',
      evs: { hp: 32, atk: 0, def: 0, spa: 32, spd: 0, spe: 2 }
    })
  ]);
  const opponent = team('Forced Opponent', [
    mon('Pelipper', ['Tackle'])
  ]);
  const battle = ctx.simulateBattle(player, opponent, {
    format: 'singles',
    seed: [1, 2, 3, 4],
    maxTurns: 1,
    forcedActions: [
      { turn: 1, side: 'player', slot: 0, move: 'Clangorous Soul', targetSide: 'self' }
    ]
  });
  const first = battle.turnLog && battle.turnLog[0];
  truthy(first && /Kommo-o:Clangorous Soul/.test(first.action || ''), 'forced move was not selected');
  truthy((first.effect_events || []).some((row) => row.move === 'Clangorous Soul' && String(row.effect_kind || '').includes('hp-cost')),
    'forced move did not execute expected HP-cost effect');
});

T('2. forcedActions can pick a non-greedy target slot', () => {
  const player = team('Forced Player', [
    mon('Pikachu', ['Tackle'])
  ]);
  const opponent = team('Forced Opponent', [
    mon('Pelipper', ['Tackle']),
    mon('Gardevoir', ['Tackle'])
  ]);
  const battle = ctx.simulateBattle(player, opponent, {
    format: 'doubles',
    seed: [1, 2, 3, 4],
    maxTurns: 1,
    forcedActions: [
      { turn: 1, side: 'player', slot: 0, move: 'Tackle', targetSide: 'enemy', targetSlot: 1 }
    ]
  });
  const actions = (((battle.turnLog || [])[0] || {}).actions || {}).player || [];
  truthy(actions.some((row) => row.actor === 'Pikachu' && row.move === 'Tackle' && row.target === 'Gardevoir'),
    'forced target slot was not recorded');
});

T('3. illegal forced move falls back to normal selector', () => {
  const player = team('Forced Player', [
    mon('Pikachu', ['Tackle'])
  ]);
  const opponent = team('Forced Opponent', [
    mon('Pelipper', ['Tackle'])
  ]);
  const battle = ctx.simulateBattle(player, opponent, {
    format: 'singles',
    seed: [1, 2, 3, 4],
    maxTurns: 1,
    forcedActions: [
      { turn: 1, side: 'player', slot: 0, move: 'Recover', targetSide: 'self' }
    ]
  });
  const first = battle.turnLog && battle.turnLog[0];
  truthy(first && /Pikachu:Tackle/.test(first.action || ''), 'illegal forced move should fall back to legal move');
});

console.log(`\nforced action branch tests: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
