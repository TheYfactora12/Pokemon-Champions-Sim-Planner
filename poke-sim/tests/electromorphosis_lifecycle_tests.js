const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ctx = vm.createContext({ console, Math, window: {} });
const root = path.resolve(__dirname, '..');
for (const f of ['data.js', 'generated/pokemon_showdown_legal_data.js', 'runtime_data.js', 'engine.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx);
}
const mon = (name, ability, moves) => ({ name, ability, moves, item: '', nature: 'Hardy', evs: {} });
const team = members => ({ name: 'synthetic-charge', format: 'sv', members });
function run(playerMoves, foeMoves, foeName = 'Blissey') {
  return ctx.simulateBattle(team([mon('Bellibolt', 'Electromorphosis', [...new Set(playerMoves)])]),
    team([mon(foeName, '', [...new Set(foeMoves)])]), {
      format: 'singles', seed: [8,3,12,7], maxTurns: playerMoves.length,
      forcedActions: playerMoves.flatMap((move, i) => [
        { turn: i + 1, side: 'player', slot: 0, move },
        { turn: i + 1, side: 'opponent', slot: 0, move: foeMoves[i] }
      ])
    });
}
const charge = (r, turn) => r.turnLog[turn].post.roster.player[0].electric_charge;
const hits = (r, turn, move) => r.turnLog[turn].damage_events.filter(e => e.move === move);
let failures = 0;
function test(name, fn) {
  try { fn(); console.log('PASS ' + name); }
  catch (e) { failures++; console.error('FAIL ' + name + ': ' + e.message); }
}
test('real hit doubles next Electric attack once', () => {
  const r = run(['Thunderbolt','Thunderbolt'], ['Tackle','Splash']);
  assert.equal(hits(r, 0, 'Thunderbolt')[0].base_power_modified, 180);
  assert.equal(hits(r, 1, 'Thunderbolt')[0].base_power_modified, 90);
  assert.equal(charge(r, 0), false);
});
test('non-Electric Soak preserves charge for following attack', () => {
  const r = run(['Soak','Thunderbolt'], ['Tackle','Splash']);
  assert.equal(charge(r, 0), true);
  assert.equal(hits(r, 1, 'Thunderbolt')[0].base_power_modified, 180);
});
test('Parabolic Charge boosts all spread targets before consumption', () => {
  const r = ctx.simulateBattle(team([mon('Bellibolt','Electromorphosis',['Parabolic Charge']),mon('Blissey','',['Splash'])]),
    team([mon('Blissey','',['Tackle']),mon('Chansey','',['Splash'])]), {
      format: 'doubles', seed: [8,3,12,7], maxTurns: 1,
      forcedActions: [{ turn: 1, side: 'opponent', slot: 0, move: 'Tackle', targetSide: 'enemy', targetSlot: 0 }]
    });
  const rows = hits(r, 0, 'Parabolic Charge');
  assert.equal(rows.length, 3);
  for (const row of rows) assert.equal(row.base_power_modified, 130);
  assert.equal(charge(r, 0), false);
});
test('Substitute damage does not activate Electromorphosis', () => {
  const r = run(['Substitute','Thunderbolt'], ['Splash','Tackle']);
  assert.equal(hits(r, 1, 'Thunderbolt')[0].base_power_modified, 90);
  assert.equal(charge(r, 1), false);
});
test('protected Electric move consumes charge', () => {
  const r = run(['Splash','Thunderbolt','Thunderbolt'], ['Tackle','Protect','Splash']);
  assert.equal(charge(r, 0), true);
  assert.equal(charge(r, 1), false);
  assert.equal(hits(r, 2, 'Thunderbolt')[0].base_power_modified, 90);
});
test('Electric immunity still consumes charge', () => {
  const r = run(['Splash','Thunderbolt'], ['Tackle','Splash'], 'Garchomp');
  assert.equal(charge(r, 0), true);
  assert.equal(charge(r, 1), false);
});
test('successful pivot clears charge', () => {
  const r = ctx.simulateBattle(team([mon('Bellibolt','Electromorphosis',['Teleport']),mon('Blissey','',['Splash'])]),
    team([mon('Blissey','',['Tackle'])]), { format: 'singles', seed: [8,3,12,7], maxTurns: 1 });
  assert.equal(charge(r, 0), false);
});
test('Electric status moves consume charge too', () => {
  const r = run(['Splash','Thunder Wave'], ['Tackle','Splash']);
  assert.equal(charge(r, 0), true);
  assert.equal(charge(r, 1), false);
});
test('sleep denial of selected Electric move consumes charge', () => {
  const r = run(['Soak','Thunderbolt'], ['Tackle','Spore']);
  assert.equal(charge(r, 0), true);
  assert.equal(hits(r, 1, 'Thunderbolt').length, 0);
  assert.equal(charge(r, 1), false);
});
test('failed pivot retains charge', () => {
  const r = run(['Teleport'], ['Tackle']);
  assert.equal(charge(r, 0), true);
});
test('multiple damaging hits do not stack charge', () => {
  const r = run(['Thunderbolt'], ['Double Hit']);
  assert.equal(hits(r, 0, 'Thunderbolt')[0].base_power_modified, 180);
});
test('pure previews do not spend charge or grant Special Defense', () => {
  vm.runInContext('this.Pokemon = Pokemon; this.Field = Field;', ctx);
  const attacker = new ctx.Pokemon(mon('Bellibolt','Electromorphosis',['Thunderbolt']), '', 'sv');
  const target = new ctx.Pokemon(mon('Blissey','',['Splash']), '', 'sv');
  const field = new ctx.Field();
  attacker._electricCharge = true;
  const first = attacker.calcDamage('Thunderbolt', target, field, null, () => 0.5);
  assert.equal(attacker.calcDamage('Thunderbolt', target, field, null, () => 0.5), first);
  assert.equal(attacker._electricCharge, true);
  assert.equal(attacker.statBoosts.spd, 0);
});
test('fainting removes an existing charge', () => {
  const r = run(['Splash','Splash'], ['Tackle','Earthquake'], 'Garchomp');
  assert.equal(charge(r, 0), true);
  assert.equal(r.turnLog[1].post.roster.player[0].hp_current, 0);
  assert.equal(charge(r, 1), false);
});
for (const move of ['Terrain Pulse', 'Thunderbolt']) test('sleep abort uses original type: ' + move, () => {
  const asleep = { ...mon('Bellibolt','Electromorphosis',[move]), status: 'sleep', statusTurns: 3 };
  const r = ctx.simulateBattle(team([asleep, mon('Tapu Koko','Electric Surge',['Splash'])]),
    team([mon('Blissey','',['Tackle']),mon('Chansey','',['Splash'])]), {
      format: 'doubles', seed: [8,3,12,7], maxTurns: 1,
      forcedActions: [{ turn: 1, side: 'opponent', slot: 0, move: 'Tackle', targetSide: 'enemy', targetSlot: 0 }]
    });
  assert.equal(hits(r, 0, move).length, 0);
  assert.equal(charge(r, 0), move === 'Terrain Pulse');
});
test('completed Terrain Pulse uses resolved Electric type and consumes charge', () => {
  const r = ctx.simulateBattle(team([mon('Bellibolt','Electromorphosis',['Terrain Pulse']), mon('Tapu Koko','Electric Surge',['Splash'])]),
    team([mon('Blissey','',['Tackle']),mon('Chansey','',['Splash'])]), {
      format: 'doubles', seed: [8,3,12,7], maxTurns: 1,
      forcedActions: [{ turn: 1, side: 'opponent', slot: 0, move: 'Tackle', targetSide: 'enemy', targetSlot: 0 }]
    });
  assert.equal(hits(r, 0, 'Terrain Pulse')[0].move_type, 'Electric');
  assert.equal(charge(r, 0), false);
});
test('Electro Shot windup consumes charge before the following turn', () => {
  const r = run(['Electro Shot','Electro Shot'], ['Tackle','Splash']);
  assert.equal(hits(r, 0, 'Electro Shot').length, 0);
  assert.equal(charge(r, 0), false);
  assert.equal(hits(r, 1, 'Electro Shot')[0].base_power_modified, 130);
});
test('Sleep Talk called Electric move consumes charge', () => {
  const asleep = { ...mon('Bellibolt','Electromorphosis',['Sleep Talk','Thunderbolt']), status: 'sleep', statusTurns: 3 };
  const r = ctx.simulateBattle(team([asleep]), team([mon('Blissey','',['Tackle'])]), {
    format: 'singles', seed: [8,3,12,7], maxTurns: 1,
    forcedActions: [{ turn: 1, side: 'player', slot: 0, move: 'Sleep Talk' }]
  });
  assert.equal(hits(r, 0, 'Thunderbolt')[0].base_power_modified, 180);
  assert.equal(charge(r, 0), false);
});
console.log(`Electromorphosis lifecycle: ${failures} failure(s)`);
process.exitCode = failures ? 1 : 0;
