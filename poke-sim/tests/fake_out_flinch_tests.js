const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ctx = vm.createContext({ console, Math, window: {} });
for (const file of ['data.js', 'generated/pokemon_showdown_legal_data.js', 'runtime_data.js', 'engine.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), ctx);
}
const mon = (name, moves, extra = {}) => ({ name, moves, item: '', ability: '', nature: 'Hardy', evs: {}, ...extra });
const team = members => ({ name: 'synthetic-flinch', format: 'sv', members });
function run({ side = 'player', ability = '', item = '', sourceAbility = '', substituteHp = 0, reply = 'Tackle', target = 'Charizard', turns = 1 } = {}) {
  const other = side === 'player' ? 'opponent' : 'player';
  const source = team([mon('Liepard', ['Fake Out', 'Splash'], { ability: sourceAbility }), mon('Blissey', ['Splash'])]);
  const victim = team([mon(target, [reply], { ability, item, substituteHp }), mon('Blissey', ['Splash'])]);
  return ctx.simulateBattle(side === 'player' ? source : victim, side === 'player' ? victim : source, {
    format: 'doubles', seed: [8, 3, 12, 7], maxTurns: turns,
    forcedActions: Array.from({ length: turns }, (_, i) => [
      { turn: i + 1, side, slot: 0, move: i ? 'Splash' : 'Fake Out', targetSide: 'enemy', targetSlot: 0 },
      { turn: i + 1, side: other, slot: 0, move: reply, targetSide: 'enemy', targetSlot: 0 }
    ]).flat()
  });
}
const effects = r => r.turnLog[0].effect_events;
const skips = r => effects(r).filter(e => e.effect_kind === 'flinch-skip');
let failures = 0;
function test(name, fn) { try { fn(); console.log('PASS ' + name); } catch (e) { failures++; console.error('FAIL ' + name + ': ' + e.stack); } }
for (const side of ['player', 'opponent']) {
  test('Fake Out denies action on ' + side, () => {
    const r = run({ side });
    assert.equal(skips(r).length, 1);
    assert.equal(effects(r).filter(e => e.effect_kind === 'flinch-applied').length, 1);
    assert.ok(!r.turnLog[0].damage_events.some(e => e.attacker === 'Charizard'));
    assert.ok(skips(r)[0].source_actor_key.includes(side + ':slot:0:'));
    const other = side === 'player' ? 'opponent' : 'player';
    const pp = r.turnLog[0].post.roster[other][0].move_pp.Tackle;
    assert.equal(pp.current, pp.max, 'denied action must not spend PP');
  });
}
for (const [name, options] of [
  ['Inner Focus', { ability: 'Inner Focus' }],
  ['Shield Dust', { ability: 'Shield Dust' }],
  ['Covert Cloak', { item: 'Covert Cloak' }],
  ['Substitute', { substituteHp: 100 }],
  ['broken Substitute', { substituteHp: 1 }],
  ['Sheer Force', { sourceAbility: 'Sheer Force' }],
  ['Protect', { reply: 'Protect' }],
  ['Ghost immunity', { target: 'Gengar' }]
]) test(name + ' prevents flinch', () => assert.equal(skips(run(options)).length, 0));
for (const [name, options] of [
  ['Mold Breaker / Inner Focus', { sourceAbility: 'Mold Breaker', ability: 'Inner Focus' }],
  ['Mold Breaker / Shield Dust', { sourceAbility: 'Mold Breaker', ability: 'Shield Dust' }],
  ['Klutz / Covert Cloak', { ability: 'Klutz', item: 'Covert Cloak' }],
  ['Infiltrator / Substitute', { sourceAbility: 'Infiltrator', substituteHp: 100 }]
]) test(name + ' permits flinch', () => assert.equal(skips(run(options)).length, 1));
test('Ability Shield preserves Inner Focus against Mold Breaker', () => {
  assert.equal(skips(run({ sourceAbility: 'Mold Breaker', ability: 'Inner Focus', item: 'Ability Shield' })).length, 0);
});
test('flinch clears next turn', () => {
  const r = run({ turns: 2 });
  assert.equal(skips(r).length, 1);
  assert.ok(r.turnLog[1].damage_events.some(e => e.attacker === 'Charizard'));
  assert.equal(r.turnLog[1].effect_events.filter(e => e.effect_kind === 'flinch-skip').length, 0);
});
test('Sheer Force boosts Fake Out base power while removing flinch', () => {
  const r = run({ sourceAbility: 'Sheer Force' });
  const hit = r.turnLog[0].damage_events.find(e => e.attacker === 'Liepard');
  assert.equal(hit.base_power_modified, 52);
  assert.equal(skips(r).length, 0);
});
test('spread flinch guards are independent per target', () => {
  const chance = ctx.FLINCH_MOVES['Rock Slide'].chance;
  // Force the secondary roll to isolate target eligibility, not RNG frequency.
  ctx.FLINCH_MOVES['Rock Slide'].chance = 1;
  try {
    const r = ctx.simulateBattle(team([mon('Aerodactyl', ['Rock Slide']), mon('Blissey', ['Splash'])]),
      team([mon('Snorlax', ['Tackle'], { item: 'Covert Cloak' }), mon('Slowbro', ['Tackle'])]),
      { format: 'doubles', seed: [8, 3, 12, 7], maxTurns: 1 });
    assert.ok(r.turnLog[0].damage_events.some(e => e.attacker === 'Snorlax'));
    assert.ok(!r.turnLog[0].damage_events.some(e => e.attacker === 'Slowbro'));
    assert.equal(skips(r).length, 1);
  } finally { ctx.FLINCH_MOVES['Rock Slide'].chance = chance; }
});
if (failures) process.exitCode = 1;
