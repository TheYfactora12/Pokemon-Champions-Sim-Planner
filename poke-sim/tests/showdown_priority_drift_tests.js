'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const ctx = {
  console, require, module: {}, exports: {}, Math, Object, Array, Set, JSON,
  Promise, setTimeout, clearTimeout, Date, String, Number, Boolean, RegExp,
  parseInt, parseFloat,
  ChampionsSim: {}
};
vm.createContext(ctx);

function load(file) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
}

function toId(value) {
  return String(value == null ? '' : value).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

load('data.js');
load('engine.js');
load('generated/pokemon_showdown_legal_data.js');
vm.runInContext('this.TEAMS = TEAMS; this.getPriority = getPriority; this.isStatusMoveName = isStatusMoveName;', ctx);

const SHOWDOWN = ctx.ChampionsSim.pokemonDataAudit || {};
const SHOWDOWN_MOVES = SHOWDOWN.moves || {};

const CHAMPIONS_PRIORITY_OVERRIDES = {
  // Keep intentional format differences here, with a source note in docs/code.
};

function shippedMoves() {
  const out = new Set();
  for (const team of Object.values(ctx.TEAMS || {})) {
    for (const mon of team.members || []) {
      for (const move of mon.moves || []) out.add(move);
    }
  }
  return Array.from(out).sort();
}

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
  if (a !== b) throw new Error((msg || 'not equal') + ' expected=' + b + ' got=' + a);
}

console.log('\n=== Showdown priority drift tests ===\n');

T('1. generated Showdown move metadata is available', () => {
  truthy(Object.keys(SHOWDOWN_MOVES).length > 500, 'Showdown move table too small or missing');
  truthy(SHOWDOWN_MOVES[toId('Trick Room')], 'Trick Room missing from Showdown move table');
});

T('2. shipped move base priorities match Showdown unless explicitly overridden', () => {
  const mismatches = [];
  const missing = [];
  for (const move of shippedMoves()) {
    const id = toId(move);
    const row = SHOWDOWN_MOVES[id];
    if (!row) {
      missing.push(move);
      continue;
    }
    const expected = Object.prototype.hasOwnProperty.call(CHAMPIONS_PRIORITY_OVERRIDES, move)
      ? CHAMPIONS_PRIORITY_OVERRIDES[move]
      : Number(row.priority || 0);
    const actual = ctx.getPriority(move, { ability: '' });
    if (actual !== expected) {
      mismatches.push(move + ' expected=' + expected + ' actual=' + actual);
    }
  }
  eq(missing.length, 0, 'moves missing from generated Showdown data: ' + missing.join(', '));
  eq(mismatches.length, 0, 'priority mismatches: ' + mismatches.join('; '));
});

T('3. Trick Room keeps Showdown priority -7', () => {
  const row = SHOWDOWN_MOVES[toId('Trick Room')];
  eq(Number(row.priority || 0), -7, 'Showdown Trick Room priority');
  eq(ctx.getPriority('Trick Room', { ability: '' }), -7, 'local Trick Room priority');
});

T('4. Prankster adds one stage on top of Showdown base status priority', () => {
  const row = SHOWDOWN_MOVES[toId('Tailwind')];
  eq(Number(row.priority || 0), 0, 'Showdown Tailwind base priority');
  eq(ctx.getPriority('Tailwind', { ability: 'Prankster' }), 1, 'Prankster Tailwind priority');
  truthy(ctx.isStatusMoveName('Tailwind'), 'Tailwind should be classified as status');
});

console.log('\nShowdown priority drift:', pass + ' pass, ' + fail + ' fail\n');
process.exit(fail ? 1 : 0);
