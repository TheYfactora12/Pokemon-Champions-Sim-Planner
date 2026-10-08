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
const team = members => ({ name: 'synthetic-shuca', format: 'sv', members });
function run({ target = 'Toxapex', ability = '', attacks = ['Earthquake'], replies = ['Splash'], attackerAbility = '', doubles = false } = {}) {
  const p = [mon('Garchomp', [...new Set(attacks)], '', attackerAbility)];
  const o = [mon(target, [...new Set(replies)], 'Shuca Berry', ability)];
  if (doubles) { p.push(mon('Blissey', ['Splash'])); o.push(mon('Arcanine-Hisui', ['Splash'], 'Shuca Berry')); }
  return ctx.simulateBattle(team(p), team(o), {
    format: doubles ? 'doubles' : 'singles', seed: [8, 3, 12, 7], maxTurns: attacks.length,
    forcedActions: attacks.flatMap((move, i) => [
      { turn: i + 1, side: 'player', slot: 0, move, targetSide: 'enemy', targetSlot: 0 },
      { turn: i + 1, side: 'opponent', slot: 0, move: replies[i] }
    ])
  });
}
const hits = (r, turn = 0) => r.turnLog[turn].damage_events.filter(e => e.attacker === 'Garchomp');
const consumed = (r, turn = 0) => r.turnLog[turn].post.roster.opponent[0].itemConsumed;
let failures = 0;
function test(name, fn) { try { fn(); console.log('PASS ' + name); } catch (e) { failures++; console.error('FAIL ' + name + ': ' + e.stack); } }
test('super-effective Ground hit is halved and consumes once', () => {
  const r = run({ attacks: ['Earthquake', 'Earthquake'], replies: ['Splash', 'Splash'] });
  assert.equal(hits(r)[0].resist_berry_mod, 2048);
  assert.equal(hits(r, 1)[0].resist_berry_mod, 4096);
  assert.equal(consumed(r), true);
});
test('neutral Ground does not consume', () => { const r = run({ target: 'Blissey' }); assert.equal(hits(r)[0].resist_berry_mod, 4096); assert.equal(consumed(r), false); });
test('non-Ground attack does not consume', () => { const r = run({ attacks: ['Dragon Claw'] }); assert.equal(consumed(r), false); });
test('Flying immunity does not consume', () => { const r = run({ target: 'Charizard' }); assert.equal(hits(r).length, 0); assert.equal(consumed(r), false); });
test('Protect does not consume', () => { const r = run({ replies: ['Protect'] }); assert.equal(hits(r).length, 0); assert.equal(consumed(r), false); });
test('Substitute does not consume', () => { const r = run({ attacks: ['Splash', 'Earthquake'], replies: ['Substitute', 'Splash'] }); assert.equal(consumed(r, 1), false); });
test('Infiltrator bypass allows consumption', () => { const r = run({ attacks: ['Splash', 'Earthquake'], replies: ['Substitute', 'Splash'], attackerAbility: 'Infiltrator' }); assert.equal(consumed(r, 1), true); });
test('Klutz disables the berry', () => { const r = run({ ability: 'Klutz' }); assert.equal(hits(r)[0].resist_berry_mod, 4096); assert.equal(consumed(r), false); });
test('opposing Unnerve blocks eating', () => { const r = run({ attackerAbility: 'Unnerve' }); assert.equal(hits(r)[0].resist_berry_mod, 4096); assert.equal(consumed(r), false); });
test('mid-battle Soak removes weakness before Ground damage', () => {
  const r = run({ attacks: ['Soak', 'Earthquake'], replies: ['Splash', 'Splash'] });
  assert.equal(hits(r, 1)[0].type_effectiveness, 1);
  assert.equal(hits(r, 1)[0].resist_berry_mod, 4096);
  assert.equal(consumed(r, 1), false);
});
test('spread attack checks each holder independently', () => {
  const rows = hits(run({ doubles: true }));
  assert.equal(rows.filter(e => e.resist_berry_mod === 2048).length, 2);
  assert.equal(rows.find(e => e.target === 'Blissey').resist_berry_mod, 4096);
});
test('damage previews remain pure and use current typing', () => {
  const a = new ctx.Pokemon(mon('Garchomp', ['Earthquake']), '', 'sv');
  const d = new ctx.Pokemon(mon('Toxapex', ['Splash'], 'Shuca Berry'), '', 'sv');
  const f = new ctx.Field();
  const reduced = a.calcDamage('Earthquake', d, f, null, () => 0.5);
  assert.equal(a.calcDamage('Earthquake', d, f, null, () => 0.5), reduced);
  assert.equal(d.itemConsumed, false);
  d.itemConsumed = true;
  const normal = a.calcDamage('Earthquake', d, f, null, () => 0.5);
  assert.ok(Math.abs(normal / 2 - reduced) <= 1);
});
test('multi-hit Ground consumes on first eligible hit only', () => {
  const r = run({ attacks: ['Bone Rush'], attackerAbility: 'Skill Link' });
  const rows = hits(r);
  assert.equal(rows.length, 5);
  assert.equal(rows[0].resist_berry_mod, 2048);
  assert.ok(rows.slice(1).every(e => e.resist_berry_mod === 4096));
});
test('Ground resistance retains berry', () => { const r = run({ target: 'Rillaboom' }); assert.equal(hits(r)[0].resist_berry_mod, 4096); assert.equal(consumed(r), false); });
test('Levitate immunity retains berry', () => { const r = run({ ability: 'Levitate' }); assert.equal(hits(r).length, 0); assert.equal(consumed(r), false); });
test('consumption activates Unburden through shared item lifecycle', () => {
  const r = run({ ability: 'Unburden' });
  assert.equal(consumed(r), true);
  const speed = r.turnLog[0].post.speed_order_details.find(p => p.pokemon === 'Toxapex');
  assert.equal(speed.effective_speed, 2 * speed.base_speed);
});
test('Substitute breaks before later multi-hit activates berry once', () => {
  const r = ctx.simulateBattle(team([mon('Smeargle', ['Bone Rush'], '', 'Skill Link')]),
    team([{ ...mon('Toxapex', ['Splash'], 'Shuca Berry'), substituteHp: 1 }]),
    { format: 'singles', seed: [8, 3, 12, 7], maxTurns: 1 });
  assert.equal(r.turnLog[0].post.roster.opponent[0].substitute_hp, 0);
  assert.equal(consumed(r), true);
  assert.deepEqual(Array.from(r.turnLog[0].damage_events, e => e.resist_berry_mod), [2048, 4096, 4096, 4096]);
  assert.equal(r.turnLog[0].effect_events.filter(e => e.effect_kind === 'resist-berry-consumed').length, 1);
});
test('consumption stays with holder through switch out and return', () => {
  const r = ctx.simulateBattle(team([mon('Smeargle', ['Earthquake', 'Splash'])]),
    team([mon('Toxapex', ['Teleport'], 'Shuca Berry'), mon('Blissey', ['Teleport'])]), {
      format: 'singles', seed: [8, 3, 12, 7], maxTurns: 3,
      forcedActions: ['Earthquake', 'Splash', 'Earthquake'].map((move, i) => ({ turn: i + 1, side: 'player', slot: 0, move }))
    });
  const holder = i => r.turnLog[i].post.roster.opponent.find(p => p.species === 'Toxapex');
  assert.equal(holder(0).zone, 'bench');
  assert.equal(holder(1).zone, 'active');
  for (let i = 0; i < 3; i++) assert.equal(holder(i).itemConsumed, true);
  assert.equal(r.turnLog[0].damage_events[0].resist_berry_mod, 2048);
  assert.equal(r.turnLog[2].damage_events[0].resist_berry_mod, 4096);
});
if (failures) process.exitCode = 1;
