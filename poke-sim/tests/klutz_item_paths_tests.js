const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ctx = vm.createContext({ console, Math, window: {} });
for (const file of ['data.js', 'generated/pokemon_showdown_legal_data.js', 'runtime_data.js', 'engine.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), ctx);
}
vm.runInContext('this.Pokemon = Pokemon; this.Field = Field;', ctx);
const mon = (name, moves, item = '', ability = '') => ({ name, moves, item, ability, nature: 'Hardy', evs: {} });
const team = members => ({ name: 'synthetic-klutz', format: 'sv', members });
let failures = 0;
function test(name, fn) { try { fn(); console.log('PASS ' + name); } catch (e) { failures++; console.error('FAIL ' + name + ': ' + e.stack); } }
for (const klutz of [false, true]) {
  test('Choice Scarf move lock, Klutz=' + klutz, () => {
    const r = ctx.simulateBattle(team([mon('Lopunny', ['Splash', 'Tackle'], 'Choice Scarf', klutz ? 'Klutz' : '')]),
      team([mon('Blissey', ['Splash'])]), { format: 'singles', seed: [8, 3, 12, 7], maxTurns: 2,
        forcedActions: [{ turn: 1, side: 'player', slot: 0, move: 'Splash' }] });
    assert.equal(r.turnLog[1].damage_events.some(e => e.attacker === 'Lopunny'), klutz);
  });
  test('Choice Scarf speed, Klutz=' + klutz, () => {
    const p = new ctx.Pokemon(mon('Lopunny', ['Tackle'], '', klutz ? 'Klutz' : ''), '', 'sv');
    const f = new ctx.Field();
    const base = p.getStat('spe', f);
    p.item = 'Choice Scarf';
    assert.equal(p.getStat('spe', f), klutz ? base : Math.floor(base * 1.5));
  });
  test('Power Herb charging and consumption, Klutz=' + klutz, () => {
    const r = ctx.simulateBattle(team([mon('Lopunny', ['Solar Beam'], 'Power Herb', klutz ? 'Klutz' : '')]),
      team([mon('Blissey', ['Splash'])]), { format: 'singles', seed: [8, 3, 12, 7], maxTurns: 1 });
    assert.equal(r.turnLog[0].damage_events.length > 0, !klutz);
    assert.equal(r.turnLog[0].post.roster.player[0].itemConsumed, !klutz);
  });
  test('Focus Sash survival and consumption, Klutz=' + klutz, () => {
    const r = ctx.simulateBattle(team([mon('Garchomp', ['Earthquake'])]),
      team([mon('Magnemite', ['Splash'], 'Focus Sash', klutz ? 'Klutz' : '')]),
      { format: 'singles', seed: [8, 3, 12, 7], maxTurns: 1 });
    const target = r.turnLog[0].post.roster.opponent[0];
    assert.equal(target.hp, klutz ? 0 : 1);
    assert.equal(target.itemConsumed, !klutz);
  });
}
test('natural sunlight still skips Solar Beam charge under Klutz', () => {
  const p = new ctx.Pokemon(mon('Lopunny', ['Solar Beam'], 'Power Herb', 'Klutz'), '', 'sv');
  const f = new ctx.Field();
  assert.equal(ctx._moveSkipsChargeTurn(p, 'Solar Beam', f), false);
  f.weather = 'sun';
  assert.equal(ctx._moveSkipsChargeTurn(p, 'Solar Beam', f), true);
});
test('Klutz Solar Beam completes on turn two without consuming Herb', () => {
  const r = ctx.simulateBattle(team([mon('Lopunny', ['Solar Beam'], 'Power Herb', 'Klutz')]),
    team([mon('Blissey', ['Splash'])]), { format: 'singles', seed: [8, 3, 12, 7], maxTurns: 2 });
  assert.equal(r.turnLog[0].damage_events.length, 0);
  assert.ok(r.turnLog[1].damage_events.some(e => e.attacker === 'Lopunny'));
  assert.equal(r.turnLog[1].post.roster.player[0].itemConsumed, false);
});
test('sunlight executes Solar Beam immediately without consuming suppressed Herb', () => {
  const r = ctx.simulateBattle(team([mon('Lopunny', ['Solar Beam'], 'Power Herb', 'Klutz')]),
    team([mon('Blissey', ['Splash'], '', 'Drought')]), { format: 'singles', seed: [8, 3, 12, 7], maxTurns: 1 });
  assert.ok(r.turnLog[0].damage_events.some(e => e.attacker === 'Lopunny'));
  assert.equal(r.turnLog[0].post.roster.player[0].itemConsumed, false);
});
if (failures) process.exitCode = 1;
