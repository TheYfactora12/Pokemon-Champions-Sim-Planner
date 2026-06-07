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
vm.runInContext('this.TEAMS = TEAMS; this.simulateBattle = simulateBattle;', ctx);

let pass = 0;
let fail = 0;

function T(name, fn) {
  try {
    fn();
    console.log('  PASS', name);
    pass += 1;
  } catch (err) {
    console.log('  FAIL', name, '-', err.message);
    fail += 1;
  }
}

function truthy(v, msg) {
  if (!v) throw new Error(msg || 'expected truthy');
}

function eq(a, b, msg) {
  if (a !== b) throw new Error((msg || 'not equal') + ' expected=' + JSON.stringify(b) + ' got=' + JSON.stringify(a));
}

function selectedTeam(team, names) {
  return {
    name: team.name,
    format: team.format,
    legality_status: team.legality_status,
    members: names.map(name => {
      const row = (team.members || []).find(member => member && member.name === name);
      if (!row) throw new Error('missing team member ' + name);
      return row;
    })
  };
}

function eventTexts(turn) {
  return (turn.events || []).map(event => String(event && event.text || ''));
}

function assertActiveKeysMatch(snapshot, side) {
  const expected = ((snapshot.roster && snapshot.roster[side]) || [])
    .filter(row => row && row.status === 'active')
    .map(row => String(row.key));
  const actual = ((snapshot.active_keys && snapshot.active_keys[side]) || []).map(String);
  eq(JSON.stringify(actual), JSON.stringify(expected), side + ' active_keys should match active roster rows');
}

console.log('\n=== recoil faint turn-log tests ===\n');

T('1. recoil KO marks attacker fainted before replacement snapshots', () => {
  const player = selectedTeam(ctx.TEAMS.player, ['Incineroar', 'Arcanine', 'Garchomp', 'Whimsicott']);
  const opponent = selectedTeam(ctx.TEAMS.fire_ice_fullroom, ['Torkoal', 'Cofagrigus', 'Typhlosion-Hisui', 'Ursaluna-Bloodmoon']);
  const battle = ctx.simulateBattle(player, opponent, {
    format: 'doubles',
    seed: [3765649682, 915019675, 502668142, 3322095033],
    maxTurns: 5
  });

  const turn2 = battle.turnLog.find(turn => turn.turn === 2);
  const turn3 = battle.turnLog.find(turn => turn.turn === 3);
  truthy(turn2 && turn3, 'expected turn 2 and turn 3 snapshots');

  const t2Events = eventTexts(turn2);
  const recoilIdx = t2Events.findIndex(text => text.includes('Arcanine was hurt by recoil!'));
  const faintIdx = t2Events.findIndex(text => text === 'Arcanine fainted!');
  const replaceIdx = t2Events.findIndex(text => text === 'Whimsicott was sent out!');
  truthy(recoilIdx >= 0, 'Arcanine recoil event missing');
  truthy(faintIdx > recoilIdx, 'Arcanine should faint immediately after recoil reaches 0 HP');
  truthy(replaceIdx > faintIdx, 'replacement should happen after recoil faint cleanup');

  assertActiveKeysMatch(turn2.post, 'player');
  assertActiveKeysMatch(turn3.pre, 'player');
  truthy(!turn2.post.active.player.includes('Arcanine'), 'turn 2 post active list should not include recoil-fainted Arcanine');
  truthy(turn2.post.active.player.includes('Whimsicott'), 'Whimsicott should replace recoil-fainted Arcanine');

  const t3Events = eventTexts(turn3).join(' | ');
  truthy(!t3Events.includes('-> Arcanine') && !t3Events.includes('Arcanine fainted!'),
    'turn 3 should not target or faint an already recoil-fainted Arcanine');
});

console.log('\nrecoil faint turn-log tests:', pass + ' pass, ' + fail + ' fail\n');
process.exit(fail ? 1 : 0);
