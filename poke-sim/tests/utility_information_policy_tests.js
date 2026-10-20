'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'engine.js'), 'utf8');
const utilities = ['Imprison', 'Quick Guard', "King's Shield", 'Spiky Shield', 'Baneful Bunker', 'Obstruct', 'Taunt'];
const c = vm.createContext({
  _movePPRemaining: (mon, move) => mon.empty === move ? 0 : 10,
  _moveType: () => 'Normal',
  _moveCategory: move => utilities.includes(move) || move === 'Protect' ? 'status' : 'physical',
  _mcMoveUnavailable: () => false, _effectiveFieldWeather: () => 'none',
  _isGrounded: () => true, _isContactMove: move => move === 'Tackle',
  getPriority: move => move === 'Quick Attack' ? 1 : 0, rng: () => { throw Error('Utility policy consumed combat RNG'); }
});
vm.runInContext(source.slice(source.indexOf('function _selectionPriorityBlocked'), source.indexOf('function _mcMoveUnavailable')) +
  source.slice(source.indexOf('  function selectMove('), source.indexOf('  // EXECUTE ACTION')) + '\nthis.choose=selectMove;', c);
let checks = 0;
for (const swap of [false, true]) for (const move of utilities) {
  const field = { playerSide: {}, oppSide: {}, terrain: 'none' };
  const own = swap ? field.oppSide : field.playerSide, other = swap ? field.playerSide : field.oppSide;
  const attacker = { name: 'Observer', side: own, moves: [move, 'Tackle'], hp: 100, maxHp: 100, alive: true, turnsSinceEntry: 2, calcDamage: () => 5 };
  const enemy = { name: 'Same visible opponent', side: other, hp: 100, maxHp: 100, alive: true, types: ['Normal'] };
  own.activeMons = [attacker]; other.activeMons = [enemy];
  let baseline;
  for (const hidden of [['Tackle'], ['Scratch'], ['Quick Attack'], ['Protect'], [], null]) {
    enemy.moves = hidden;
    const choice = c.choose(attacker, [attacker], [enemy], field);
    baseline ??= choice.move;
    assert.equal(choice.move, baseline, `${move} side=${swap} hidden=${hidden}`);
    assert.equal(choice.target, enemy);
    checks++;
  }
  Object.defineProperty(enemy, 'moves', { get() { throw Error('Unrevealed inventory read'); }, configurable: true });
  assert.equal(c.choose(attacker, [attacker], [enemy], field).move, baseline);
  attacker.empty = move;
  assert.equal(c.choose(attacker, [attacker], [enemy], field).move, 'Tackle');
  attacker.empty = null; attacker.tauntedTurns = 2;
  assert.equal(c.choose(attacker, [attacker], [enemy], field).move, 'Tackle');
  attacker.tauntedTurns = 0; attacker.item = 'Choice Scarf'; attacker.choiceLock = 'Tackle';
  assert.equal(c.choose(attacker, [attacker], [enemy], field).move, 'Tackle');
  attacker.item = ''; attacker.encoredTurns = 2; attacker.encoredMove = 'Tackle';
  assert.equal(c.choose(attacker, [attacker], [enemy], field).move, 'Tackle');
  attacker.encoredTurns = 0; attacker.calcDamage = () => {throw Error('Hidden damage preview');}; c._moveBasePower = () => 200;
  assert.equal(c.choose(attacker, [attacker], [enemy], field).move, 'Tackle', 'static own-move score can outrank a fixed utility prior');
  c._moveBasePower = () => 40; checks += 6;
}
const provenance = c._selectionPolicyProvenance(false);
assert.equal(provenance.id, 'own-public-heuristic-v4');
assert.equal(provenance.information_model, 'own_state_public_field_target_slots');
assert.equal(provenance.competitive_strength_verified, false);
console.log(`${checks} utility inventory-invariance and lock checks passed; conservative default provenance preserved.`);
