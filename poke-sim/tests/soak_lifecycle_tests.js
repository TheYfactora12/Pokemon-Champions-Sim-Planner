const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ctx = vm.createContext({ console, Math, window: {} });
for (const f of ['data.js', 'generated/pokemon_showdown_legal_data.js', 'runtime_data.js', 'engine.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx);
}
const mon = (name, ability = '', moves = ['Splash']) => ({ name, ability, moves, item: '', nature: 'Hardy', evs: {} });
const team = members => ({ name: 'synthetic-soak', format: 'sv', members });
vm.runInContext('this.Pokemon = Pokemon; this.Field = Field;', ctx);
function run(target, extra = {}) {
  return ctx.simulateBattle(team([mon('Bellibolt', '', ['Soak'])]), team([target]), {
    format: 'singles', seed: [8, 3, 12, 7], maxTurns: 1,
    forcedActions: [{ turn: 1, side: 'player', slot: 0, move: 'Soak' }], ...extra
  });
}
const types = (r, side, index = 0, turn = 0) => Array.from(r.turnLog[turn].post.roster[side][index].types || []);
let failed = 0;
function test(name, fn) {
  try { fn(); console.log('PASS ' + name); }
  catch (e) { failed++; console.error('FAIL ' + name + ': ' + e.message); }
}
test('actual Soak replaces both types and records the state', () => {
  assert.deepEqual(types(run(mon('Charizard')), 'opponent'), ['Water']);
});
test('Protect blocks Soak', () => {
  const r = run(mon('Charizard', '', ['Protect']));
  assert.deepEqual(types(r, 'opponent'), ['Fire', 'Flying']);
});
test('Substitute blocks Soak', () => {
  const r = run(mon('Charizard', '', ['Substitute']));
  assert.deepEqual(types(r, 'opponent'), ['Fire', 'Flying']);
});
test('Infiltrator bypasses Substitute', () => {
  const r = ctx.simulateBattle(team([mon('Bellibolt', 'Infiltrator', ['Soak'])]),
    team([mon('Charizard', '', ['Substitute'])]), { format: 'singles', seed: [8,3,12,7], maxTurns: 1 });
  assert.deepEqual(types(r, 'opponent'), ['Water']);
});
test('Magic Bounce redirects the type change to its source', () => {
  const r = run(mon('Espeon', 'Magic Bounce'));
  assert.deepEqual(types(r, 'player'), ['Water']);
  assert.deepEqual(types(r, 'opponent'), ['Psychic']);
});
test('Good as Gold blocks the type change', () => {
  assert.deepEqual(types(run(mon('Gholdengo', 'Good as Gold')), 'opponent'), ['Steel', 'Ghost']);
});
for (const ability of ['Water Absorb', 'Dry Skin', 'Storm Drain']) {
  test(ability + ' blocks Soak', () => {
    assert.deepEqual(types(run(mon('Charizard', ability)), 'opponent'), ['Fire', 'Flying']);
  });
}
test('successful switch restores original types', () => {
  const r = ctx.simulateBattle(team([mon('Bellibolt', '', ['Soak'])]),
    team([mon('Charizard', '', ['Teleport']), mon('Blissey', '', ['Splash'])]),
    { format: 'singles', seed: [8,3,12,7], maxTurns: 1 });
  assert.deepEqual(types(r, 'opponent'), ['Fire', 'Flying']);
});
test('failed pivot retains temporary type', () => {
  assert.deepEqual(types(run(mon('Charizard', '', ['Teleport'])), 'opponent'), ['Water']);
});
test('locked species cannot be soaked', () => {
  assert.deepEqual(types(run(mon('Arceus', 'Multitype')), 'opponent'), ['Normal']);
});
test('Magic Bounce still works behind Substitute', () => {
  const r = run(mon('Espeon', 'Magic Bounce', ['Substitute']));
  assert.deepEqual(types(r, 'player'), ['Water']);
  assert.deepEqual(types(r, 'opponent'), ['Psychic']);
});
test('dual Water loses its second type', () => {
  assert.deepEqual(types(run(mon('Pelipper')), 'opponent'), ['Water']);
});
test('Mold Breaker bypasses Water Absorb', () => {
  const r = ctx.simulateBattle(team([mon('Bellibolt', 'Mold Breaker', ['Soak'])]),
    team([mon('Charizard', 'Water Absorb')]), { format: 'singles', seed: [8,3,12,7], maxTurns: 1 });
  assert.deepEqual(types(r, 'opponent'), ['Water']);
});
function direct(target, source = new ctx.Pokemon(mon('Bellibolt'), '', 'sv')) {
  const field = new ctx.Field();
  field._ctx = {};
  const result = ctx._applySoak(source, target, field, [], () => 0.5, false, () => true);
  return { result, field };
}
test('pure Water fails without a type-change event', () => {
  const { result, field } = direct(new ctx.Pokemon(mon('Blastoise'), '', 'sv'));
  assert.equal(result, false);
  assert.ok(field._ctx.turnEffectEvents.every(e => e.effect_kind !== 'type-change'));
});
test('Silvally type lock does not depend on its ability', () => {
  assert.equal(direct(new ctx.Pokemon(mon('Silvally', 'None'), '', 'sv')).result, false);
});
test('Tera type is locked', () => {
  const p = new ctx.Pokemon(mon('Charizard'), '', 'sv');
  p.teraActivated = true;
  assert.equal(direct(p).result, false);
});
test('removing Flying changes grounding but preserves HP/status/item', () => {
  const p = new ctx.Pokemon(mon('Charizard'), '', 'sv');
  p.hp -= 10; p.status = 'burn'; p.item = 'Magnet';
  const before = p.hp;
  const { field } = direct(p);
  assert.equal(ctx._isGrounded(p), true);
  assert.equal(p.hp, before); assert.equal(p.status, 'burn'); assert.equal(p.item, 'Magnet');
  const event = field._ctx.turnEffectEvents.find(e => e.effect_kind === 'type-change');
  assert.deepEqual(Array.from(event.types_before), ['Fire', 'Flying']);
  assert.deepEqual(Array.from(event.types_after), ['Water']);
});
test('Levitate still prevents grounding after Soak', () => {
  const p = new ctx.Pokemon(mon('Charizard', 'Levitate'), '', 'sv');
  direct(p);
  assert.equal(ctx._isGrounded(p), false);
});
for (const ability of ['Water Absorb', 'Dry Skin']) test(ability + ' heals on Soak', () => {
  const p = new ctx.Pokemon(mon('Charizard', ability), '', 'sv');
  p.hp = 1;
  assert.equal(direct(p).result, false);
  assert.equal(p.hp, 1 + Math.floor(p.maxHp / 4));
});
test('Storm Drain grants a special Attack stage', () => {
  const p = new ctx.Pokemon(mon('Charizard', 'Storm Drain'), '', 'sv');
  direct(p); assert.equal(p.statBoosts.spa, 1);
});
test('doubles Storm Drain redirects Soak away from selected target', () => {
  const r = ctx.simulateBattle(team([mon('Bellibolt', '', ['Soak']), mon('Blissey')]),
    team([mon('Charizard'), mon('Gastrodon', 'Storm Drain')]), {
      format: 'doubles', seed: [8,3,12,7], maxTurns: 1,
      forcedActions: [{ turn: 1, side: 'player', slot: 0, move: 'Soak', targetSide: 'enemy', targetSlot: 0 }]
    });
  assert.deepEqual(types(r, 'opponent', 0), ['Fire', 'Flying']);
  assert.deepEqual(types(r, 'opponent', 1), ['Water', 'Ground']);
  assert.ok(JSON.stringify(r.turnLog).includes('Storm Drain absorbed Soak'));
});
test('allied Magic Bounce can reflect Soak', () => {
  const r = ctx.simulateBattle(team([mon('Bellibolt', '', ['Soak']), mon('Espeon', 'Magic Bounce')]),
    team([mon('Charizard'), mon('Blissey')]), {
      format: 'doubles', seed: [8,3,12,7], maxTurns: 1,
      forcedActions: [{ turn: 1, side: 'player', slot: 0, move: 'Soak', targetSide: 'ally', targetSlot: 1 }]
    });
  assert.deepEqual(types(r, 'player', 0), ['Water']);
  assert.deepEqual(types(r, 'player', 1), ['Psychic']);
});
test('following Electric attack uses replaced Water typing', () => {
  const r = ctx.simulateBattle(team([mon('Bellibolt', '', ['Soak', 'Thunderbolt'])]),
    team([mon('Garchomp')]), {
      format: 'singles', seed: [8,3,12,7], maxTurns: 2,
      forcedActions: [{ turn: 1, side: 'player', slot: 0, move: 'Soak' },
        { turn: 2, side: 'player', slot: 0, move: 'Thunderbolt' }]
    });
  const hit = r.turnLog[1].damage_events.find(e => e.move === 'Thunderbolt');
  assert.ok(hit, 'Electric move must no longer be blocked by Ground typing');
  assert.ok(JSON.stringify(hit).includes('"type_effectiveness":2'));
});
test('Prankster Soak reflects off Dark Magic Bounce', () => {
  const r = ctx.simulateBattle(team([mon('Bellibolt', 'Prankster', ['Soak'])]),
    team([mon('Sableye', 'Magic Bounce')]), { format: 'singles', seed: [8,3,12,7], maxTurns: 1 });
  assert.deepEqual(types(r, 'player'), ['Water']);
});
test('reflected Soak honors Follow Me on the new recipient side', () => {
  const r = ctx.simulateBattle(team([mon('Bellibolt', '', ['Soak']), mon('Clefable', '', ['Follow Me'])]),
    team([mon('Charizard', 'Magic Bounce'), mon('Blissey')]), {
      format: 'doubles', seed: [8,3,12,7], maxTurns: 1,
      forcedActions: [{ turn: 1, side: 'player', slot: 0, move: 'Soak', targetSide: 'enemy', targetSlot: 0 }]
    });
  assert.deepEqual(types(r, 'player', 0), ['Electric']);
  assert.deepEqual(types(r, 'player', 1), ['Water']);
});
test('Storm Drain respects Trick Room action ordering', () => {
  const r = ctx.simulateBattle(team([mon('Bellibolt', '', ['Soak', 'Splash']), mon('Farigiraf', '', ['Trick Room', 'Splash'])]),
    team([mon('Jolteon', 'Storm Drain'), mon('Gastrodon', 'Storm Drain')]), {
      format: 'doubles', seed: [8,3,12,7], maxTurns: 2,
      forcedActions: [
        { turn: 1, side: 'player', slot: 0, move: 'Splash' },
        { turn: 1, side: 'player', slot: 1, move: 'Trick Room' },
        { turn: 2, side: 'player', slot: 0, move: 'Soak', targetSide: 'enemy', targetSlot: 0 },
        { turn: 2, side: 'player', slot: 1, move: 'Splash' }
      ]
    });
  assert.ok(JSON.stringify(r.turnLog[1]).includes('Gastrodon\'s Storm Drain absorbed Soak'));
  assert.ok(!JSON.stringify(r.turnLog[1]).includes('Jolteon\'s Storm Drain absorbed Soak'));
});
test('Water Absorb on Dark behind Substitute precedes Prankster rejection', () => {
  const r = ctx.simulateBattle(team([mon('Bellibolt', 'Prankster', ['Protect', 'Soak']), mon('Blissey')]),
    team([mon('Cacturne', 'Water Absorb', ['Substitute', 'Splash']), mon('Charizard')]), {
      format: 'doubles', seed: [8,3,12,7], maxTurns: 2,
      forcedActions: [
        { turn: 1, side: 'player', slot: 0, move: 'Protect' },
        { turn: 1, side: 'opponent', slot: 0, move: 'Substitute' },
        { turn: 2, side: 'player', slot: 0, move: 'Soak', targetSide: 'enemy', targetSlot: 0 },
        { turn: 2, side: 'opponent', slot: 0, move: 'Splash' }
      ]
    });
  const before = r.turnLog[0].post.roster.opponent[0];
  const after = r.turnLog[1].post.roster.opponent[0];
  assert.equal(after.hp_current, before.hp_current + Math.floor(before.hp_max / 4));
  assert.deepEqual(types(r, 'opponent', 0, 1), ['Grass', 'Dark']);
});
test('nonabsorbing Dark target still rejects Prankster Soak', () => {
  const r = ctx.simulateBattle(team([mon('Bellibolt', 'Prankster', ['Soak'])]),
    team([mon('Cacturne', 'Sand Veil')]), { format: 'singles', seed: [8,3,12,7], maxTurns: 1 });
  assert.deepEqual(types(r, 'opponent'), ['Grass', 'Dark']);
});
console.log(`Soak lifecycle: ${failed} failure(s)`);
process.exitCode = failed ? 1 : 0;
