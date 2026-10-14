// Issue #264: selection policy, not Imprison mechanics or competitive strength.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'engine.js'), 'utf8');
const start = source.indexOf('  function selectMove(');
const end = source.indexOf('  // EXECUTE ACTION', start);
assert(start >= 0 && end > start, 'production selector must be found');
// Execute the production selector with controlled scores; no copied policy.
const ctx = vm.createContext({
  _movePPRemaining: (mon, move) => mon.pp?.[move] ?? 10,
  _moveType: () => 'Normal',
  _selectionPriorityBlocked: () => false,
  _mcMoveUnavailable: () => false, // This fixture uses baseline actors, not reference-only move bans.
  _moveCategory: move => move === 'Imprison' ? 'status' : 'physical',
  _effectiveFieldWeather: () => 'none', getPriority: () => 0,
  rng: () => 0.5
});
vm.runInContext(source.slice(start, end) + '\nthis.choose = selectMove;', ctx);
let passed = 0;
function test(name, run) { run(); passed++; console.log('PASS ' + name); }
function fixture(side = 'player') {
  const field = {playerSide: {}, oppSide: {}, terrain: 'none'};
  const own = side === 'player' ? field.playerSide : field.oppSide;
  const foe = side === 'player' ? field.oppSide : field.playerSide;
  const actor = {name: 'Gardevoir', moves: ['Imprison', 'Tackle'], side: own,
    hp: 100, maxHp: 100, alive: true, types: ['Psychic'], turnsSinceEntry: 2,
    calcDamage: () => 10};
  const enemy = {name: 'Snorlax', moves: ['Tackle'], side: foe,
    hp: 100, maxHp: 100, alive: true, types: ['Normal']};
  const seal = () => { foe.imprisonedBy = actor.name; foe.imprisonedMoves = new Set(['Tackle']); };
  return {field, actor, enemy, foe, seal,
    choose: () => ctx.choose(actor, [actor], [enemy], field).move};
}
for (const side of ['player', 'opponent']) {
  test(side + ': establish seal, then prefer productive damage', () => {
    const f = fixture(side);
    assert.equal(f.choose(), 'Imprison');
    f.seal();
    assert.equal(f.choose(), 'Tackle');
  });
  test(side + ': expired seal becomes useful again', () => {
    const f = fixture(side); f.seal(); f.foe.imprisonedBy = null; f.foe.imprisonedMoves = null;
    assert.equal(f.choose(), 'Imprison');
  });
  test(side + ': another owner or changed move set is not redundant', () => {
    const f = fixture(side); f.seal(); f.foe.imprisonedBy = 'Alakazam';
    assert.equal(f.choose(), 'Imprison');
    f.foe.imprisonedBy = f.actor.name; f.foe.imprisonedMoves = new Set();
    assert.equal(f.choose(), 'Imprison');
  });
  test(side + ': sole usable move remains selectable without fabricated Struggle', () => {
    const f = fixture(side); f.seal(); f.actor.pp = {Tackle: 0};
    assert.equal(f.choose(), 'Imprison');
  });
  test(side + ': Encore and Choice lock still control selection', () => {
    const f = fixture(side); f.seal(); f.actor.encoredTurns = 2; f.actor.encoredMove = 'Imprison';
    assert.equal(f.choose(), 'Imprison');
    f.actor.encoredTurns = 0; f.actor.item = 'Choice Scarf'; f.actor.choiceLock = 'Imprison';
    assert.equal(f.choose(), 'Imprison');
  });
  test(side + ': redundant scoring does not inspect unrevealed opponent moves', () => {
    const f = fixture(side); f.seal();
    Object.defineProperty(f.enemy, 'moves', {get() {throw new Error('hidden moves read');}});
    assert.equal(f.choose(), 'Tackle');
  });
}
const battle = vm.createContext({console, Math, window: {}});
for (const file of ['data.js', 'generated/pokemon_showdown_legal_data.js', 'runtime_data.js', 'engine.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), battle);
}
const mon = (name, moves) => ({name, moves, item: '', ability: '', nature: 'Hardy', evs: {}});
const team = members => ({name: 'synthetic-policy', format: 'sv', members});
for (const side of ['player', 'opponent']) test(side + ': seeded doubles establishes once and attacks next turn', () => {
  const sourceTeam = team([mon('Gardevoir', ['Imprison', 'Tackle']), mon('Blissey', ['Splash'])]);
  const otherTeam = team([mon('Snorlax', ['Tackle']), mon('Chansey', ['Splash'])]);
  const inputs = [sourceTeam, otherTeam];
  const before = JSON.stringify(inputs);
  const options = {format: 'doubles', seed: [8, 3, 12, 7], maxTurns: 3};
  const run = () => battle.simulateBattle(side === 'player' ? sourceTeam : otherTeam,
    side === 'player' ? otherTeam : sourceTeam, options);
  const result = run();
  assert.equal(result.log.filter(line => line.includes('Gardevoir sealed away')).length, 1);
  assert.ok(result.turnLog[1].damage_events.some(e => e.attacker === 'Gardevoir' && e.move === 'Tackle'));
  assert.equal(JSON.stringify(run()), JSON.stringify(result), 'same teams, selection, policy and seed repeat exactly');
  assert.equal(JSON.stringify(inputs), before, 'registered teams stay unchanged');
});
console.log(`${passed} Imprison policy checks passed.`);
