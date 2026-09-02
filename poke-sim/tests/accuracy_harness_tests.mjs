import assert from 'node:assert/strict';
import { checkState, seedFor } from '../tools/run-accuracy-validation.mjs';
assert.deepEqual(seedFor('fixed'), seedFor('fixed'));
assert.notDeepEqual(seedFor('fixed'), seedFor('other'));
const mon = side => ({ stableKey: side + ':slot:0:Pikachu', teamSlot: 0, hp: 100, zone: 'active' });
const snapshot = { roster: { player: [mon('player')], opponent: [mon('opponent')] } };
const valid = { result: 'draw', turnLog: [{ pre: snapshot, post: snapshot, damage_events: [] }] };
checkState(valid, 'singles', 3);
for (const hp of [undefined, NaN, -1, 101]) {
  const bad = structuredClone(valid);
  bad.turnLog[0].pre.roster.player[0].hp = hp;
  assert.throws(() => checkState(bad, 'singles', 3));
}
const duplicate = structuredClone(valid);
duplicate.turnLog[0].pre.roster.player.push(mon('player'));
assert.throws(() => checkState(duplicate, 'doubles', 4));
console.log('Accuracy harness: deterministic seeds and non-vacuous HP/identity checks passed.');
