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
load('generated/pokemon_showdown_legal_data.js');
vm.runInContext('this.TEAMS = TEAMS; this.simulateBattle = simulateBattle; this.MOVE_BP = MOVE_BP; this.MOVE_TYPES = MOVE_TYPES; this._moveAccuracy = _moveAccuracy;', ctx);

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

function customTeam(name, members) {
  return { name, format: 'sv', legality_status: 'legal', members };
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
  const player = customTeam('Recoil Cleanup', [{
    name: 'Arcanine',
    ability: 'Intimidate',
    item: '',
    nature: 'Jolly',
    level: 50,
    currentHp: 20,
    moves: ['Head Smash'],
    evs: { hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 }
  }, {
    name: 'Whimsicott',
    ability: 'Prankster',
    item: 'Focus Sash',
    nature: 'Timid',
    level: 50,
    moves: ['Tailwind'],
    evs: { hp: 4, atk: 0, def: 0, spa: 0, spd: 0, spe: 252 }
  }]);
  const opponent = customTeam('Recoil Dummy', [{
    name: 'Torkoal',
    ability: 'Drought',
    item: '',
    nature: 'Relaxed',
    level: 50,
    moves: ['Tackle'],
    evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 0, spe: 0 }
  }]);
  const battle = ctx.simulateBattle(player, opponent, {
    format: 'singles',
    seed: [3765649682, 915019675, 502668142, 3322095033],
    playerBring: ['Arcanine', 'Whimsicott'],
    opponentBring: ['Torkoal'],
    maxTurns: 1
  });

  const turn1 = battle.turnLog.find(turn => turn.turn === 1);
  truthy(turn1, 'expected turn 1 snapshots');

  const t1Events = eventTexts(turn1);
  const damageLine = t1Events.find(text => text.includes('Arcanine used Head Smash!') && text.includes('dmg'));
  truthy(damageLine, 'Head Smash damage event missing');
  const damageMatch = String(damageLine).match(/\[(\d+) dmg/);
  truthy(damageMatch, 'Head Smash damage amount missing');
  const expectedRecoil = Math.max(1, Math.round(Number(damageMatch[1]) / 2));
  const recoilIdx = t1Events.findIndex(text => text.includes('Arcanine was hurt by recoil!'));
  const faintIdx = t1Events.findIndex(text => text === 'Arcanine fainted!');
  const replaceIdx = t1Events.findIndex(text => text === 'Whimsicott was sent out!');
  truthy(recoilIdx >= 0, 'Arcanine recoil event missing');
  const recoilRow = ((turn1.effect_events || []).find(item => item && item.move === 'Head Smash' && item.effect_kind === 'recoil')) || null;
  truthy(recoilRow, 'Head Smash recoil effect event missing');
  const expectedAppliedRecoil = Math.max(0, recoilRow.hp_before - recoilRow.hp_after);
  eq(recoilRow.calculated_effect_damage, expectedRecoil, 'recoil effect should preserve Showdown formula amount');
  eq(recoilRow.damage_applied_to_user, expectedAppliedRecoil, 'recoil effect should record actual HP lost');
  eq(-recoilRow.hp_delta, expectedAppliedRecoil, 'recoil hp_delta should match actual HP lost');
  truthy(t1Events[recoilIdx].includes('[' + expectedAppliedRecoil + ' dmg'), 'visible recoil log should show actual HP lost');
  if (expectedRecoil !== expectedAppliedRecoil) {
    truthy(t1Events[recoilIdx].includes('calc ' + expectedRecoil), 'visible recoil log should preserve formula recoil when HP-capped');
  }
  truthy(faintIdx > recoilIdx, 'Arcanine should faint immediately after recoil reaches 0 HP');
  truthy(replaceIdx > faintIdx, 'replacement should happen after recoil faint cleanup');

  assertActiveKeysMatch(turn1.post, 'player');
  truthy(!turn1.post.active.player.includes('Arcanine'), 'turn 1 post active list should not include recoil-fainted Arcanine');
  truthy(turn1.post.active.player.includes('Whimsicott'), 'Whimsicott should replace recoil-fainted Arcanine');
});

T('2. imported recoil moves use Showdown primary metadata', () => {
  truthy(!Object.prototype.hasOwnProperty.call(ctx.MOVE_BP, 'Brave Bird'), 'Brave Bird should be absent from local MOVE_BP control table');
  truthy(!Object.prototype.hasOwnProperty.call(ctx.MOVE_TYPES, 'Brave Bird'), 'Brave Bird should be absent from local MOVE_TYPES control table');

  const player = customTeam('Imported Recoil', [{
    name: 'Charizard',
    ability: 'Blaze',
    item: '',
    nature: 'Adamant',
    level: 50,
    moves: ['Brave Bird'],
    evs: { hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 }
  }]);
  const opponent = customTeam('Imported Dummy', [{
    name: 'Abomasnow',
    ability: 'Snow Warning',
    item: '',
    nature: 'Hardy',
    level: 50,
    moves: ['Tackle'],
    evs: { hp: 252, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
  }]);
  const battle = ctx.simulateBattle(player, opponent, {
    format: 'singles',
    seed: [11, 13, 17, 19],
    maxTurns: 1
  });
  const damageLine = battle.log.find(line => String(line).includes('Charizard used Brave Bird!') && String(line).includes('dmg'));
  truthy(damageLine, 'Brave Bird damage line missing');
  const damageMatch = String(damageLine).match(/\[(\d+) dmg/);
  truthy(damageMatch, 'Brave Bird damage amount missing');
  truthy(Number(damageMatch[1]) > 50, 'Brave Bird should use Showdown Flying 120 BP instead of local fallback damage');
  truthy(battle.log.some(line => String(line).includes('Charizard was hurt by recoil!')),
    'Brave Bird recoil line missing');
});

T('3. Showdown accuracy metadata wins over local fallback values', () => {
  eq(ctx._moveAccuracy('Hydro Pump', 0.01), 0.8, 'Hydro Pump should use Showdown 80% accuracy');
  eq(ctx._moveAccuracy('Never Local Move', 0.42), 0.42, 'missing Showdown rows should use local fallback');
});

T('4. overkill damage logs applied HP loss and preserves calculated damage evidence', () => {
  const player = customTeam('Overkill Applied Damage', [{
    name: 'Arcanine',
    ability: 'Intimidate',
    item: '',
    nature: 'Adamant',
    level: 50,
    moves: ['Head Smash'],
    evs: { hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 }
  }]);
  const opponent = customTeam('Low HP Target', [{
    name: 'Torkoal',
    ability: 'Drought',
    item: '',
    nature: 'Relaxed',
    level: 50,
    currentHp: 10,
    moves: ['Tackle'],
    evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 0, spe: 0 }
  }]);
  const battle = ctx.simulateBattle(player, opponent, {
    format: 'singles',
    seed: [101, 103, 107, 109],
    maxTurns: 1
  });

  const turn1 = battle.turnLog.find(turn => turn.turn === 1);
  truthy(turn1, 'expected turn 1 snapshots');
  const row = ((turn1.damage_events || []).find(item => item && item.move === 'Head Smash')) || null;
  truthy(row, 'Head Smash damage_events row missing');
  eq(row.target_hp_before, 10, 'test target should start at 10 HP');
  eq(row.target_hp_after, 0, 'target should be KOed');
  eq(row.applied_damage, 10, 'applied damage should be target HP lost');
  eq(row.damage, row.applied_damage, 'damage field should carry applied damage');
  eq(row.hp_delta, row.applied_damage, 'hp_delta should carry applied damage');
  truthy(row.calculated_damage > row.applied_damage, 'calculated damage should preserve overkill formula result');
  eq(row.overkill_damage, row.calculated_damage - row.applied_damage, 'overkill evidence mismatch');
  eq(row.damage_capped_by_hp, true, 'HP cap flag missing');

  const t1Events = eventTexts(turn1);
  const damageLine = t1Events.find(text => text.includes('Arcanine used Head Smash!') && text.includes('dmg'));
  truthy(damageLine && damageLine.includes('[10 dmg, 0/'), 'visible log should show applied damage');
  truthy(damageLine.includes('calc ' + row.calculated_damage), 'visible log should preserve formula damage evidence');
  const recoilLine = t1Events.find(text => text.includes('Arcanine was hurt by recoil!'));
  truthy(recoilLine, 'recoil line missing');
  truthy(recoilLine.includes('[5 dmg]'), 'recoil should be based on applied damage, not formula overkill');
  const recoilRow = ((turn1.effect_events || []).find(item => item && item.move === 'Head Smash' && item.effect_kind === 'recoil')) || null;
  truthy(recoilRow, 'Head Smash recoil effect event missing');
  eq(recoilRow.calculated_effect_damage, 5, 'effect row should preserve calculated recoil');
  eq(recoilRow.damage_applied_to_user, 5, 'effect row should record actual recoil HP lost');
});

console.log('\nrecoil faint turn-log tests:', pass + ' pass, ' + fail + ' fail\n');
process.exit(fail ? 1 : 0);
