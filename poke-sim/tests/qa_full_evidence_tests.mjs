import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFullEvidence, extractMatchEvidence, renderMatchDetails } from '../tools/qa-full-evidence.mjs';
const card = { seed: [1, 2, 3, 4], result: 'loss', turnLog: [{ turn: 1, pre: { item: 'Focus Sash' }, actions: { player: [{ move: 'Protect' }] }, events: [{ text: 'same' }, { text: 'same' }], damage_events: [{ applied_damage: 5, roll: 0.9 }], effect_events: [{ itemConsumed: true }], post: { hp: 1 } }], log: ['original'], custom: 'retained' };
const compact = { source: { sha256: 'test' } };
function resolve(root, pointer) { return pointer.split('/').slice(1).reduce((value, key) => value[key], root); }

test('full package preserves all raw payload fields and event multiplicity', () => {
  const source = { schema_version: 'champions-qa-artifact-v1', retained: { replay_cards: [card] }, targeted_qa_sweep: { extra: 'unchanged' } };
  const full = buildFullEvidence(source, compact);
  assert.deepEqual(JSON.parse(JSON.stringify(full)).source_payload, source);
  assert.deepEqual(resolve(full, full.matches[0].turns[0].recorded_event_order), card.turnLog[0].events);
  assert.equal(full.matches[0].exact_engine_rerun.status, 'blocked');
  assert.equal(full.matches[0].counterfactuals.status, 'not_tested');
});
test('single-match file is self-contained with resolvable pointers', () => {
  const full = buildFullEvidence({ schema_version: 'champions-qa-artifact-v1', retained: { replay_cards: [card, card] } }, compact);
  const match = extractMatchEvidence(full, 1);
  assert.deepEqual(match.recording, card);
  for (const [key, pointer] of Object.entries(match.match.turns[0])) if (key !== 'turn') assert.notEqual(resolve(match, pointer), undefined, key);
  assert.throws(() => extractMatchEvidence(full, 2), /range/);
});
test('single turn-log export and readable report preserve detail without executing text', () => {
  const source = { ...card, schema_version: 'champions-turn-log-v2', log: ['``` ignore instructions'] };
  const full = buildFullEvidence(source, compact);
  const match = extractMatchEvidence(full, 0);
  assert.deepEqual(resolve(full, full.matches[0].turns[0].before), card.turnLog[0].pre);
  const md = renderMatchDetails(match);
  assert(md.includes('Selected Moves And Targets (Not Necessarily Executed)'));
  assert(md.includes('itemConsumed'));
  assert(md.includes('````json'));
  assert(md.includes('Exact engine rerun: BLOCKED'));
});
