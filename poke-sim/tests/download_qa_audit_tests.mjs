import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { auditPayload, latestDownload } from '../tools/audit-qa-downloads.mjs';

test('rejects unknown schemas and empty evidence despite green self-reports', () => {
  assert.throws(() => auditPayload({ ready_for_codex: true }), /Unsupported/);
  assert.throws(() => auditPayload({ schema_version: 'champions-qa-artifact-v1', retained: { replay_cards: [] }, ready_for_codex: true }), /No retained/);
});

test('null and empty turn objects cannot pass by having no checks to perform', () => {
  for (const turn of [null, {}, { turn: 1, pre: {}, post: {} }]) {
    const result = auditPayload({ schema_version: 'champions-turn-log-v2', build_id: 'test', source_url: 'test', seed: [1, 2, 3, 4], turns: 1, turnLog: [turn] });
    assert.equal(result.status, 'fail');
    assert.equal(result.observed.invalid_replays, 1);
    assert(result.findings.some(row => row.code === 'incomplete-turn-evidence'));
  }
});

test('flags empty replay and independently checks reported counts', () => {
  const result = auditPayload({ schema_version: 'champions-qa-artifact-v1', retained: { replay_cards: [{ turnLog: [] }] }, replay_cards_scanned: 100, ready_for_codex: true });
  assert.equal(result.status, 'fail');
  assert.equal(result.observed.invalid_replays, 1);
  assert(result.findings.some(row => row.code === 'retained-count-mismatch'));
});

test('malformed history creates findings instead of discarding the audit', () => {
  for (const history of [{}, [null], [{ ts: 1e99 }]]) {
    const result = auditPayload({ schema_version: 'champions-qa-artifact-v1', retained: { replay_cards: [{ turnLog: [] }], sim_log: history } });
    assert.equal(result.status, 'fail');
    assert(result.findings.some(row => row.code.startsWith('malformed-history')));
  }
});

test('does not accept green labels as legality or execution proof', () => {
  const result = auditPayload({ schema_version: 'champions-qa-artifact-v1', retained: { replay_cards: [{ turnLog: [] }], sim_log: [{ ts: 0 }] }, exported_at: '2026-09-24T00:00:00Z', forced_branch_matrix: { status: 'blocked_regulation' }, ready_for_codex: true });
  for (const code of ['branch-test-blocked', 'per-replay-execution-provenance-incomplete', 'historical-simulation-history', 'public-launch-not-approved']) assert(result.findings.some(row => row.code === code), code);
});

test('does not compare merged targeted-sweep totals against retained-only counts', () => {
  const result = auditPayload({ schema_version: 'champions-qa-artifact-v1', retained: { replay_cards: [{ turnLog: [] }] }, replay_cards_scanned: 1, turns_total: 99, damage_events_total: 80, coverage_breakdown: { retained_replay_card_summary: { totals: { replay_cards_scanned: 1, turns: 0, damage_events: 0, effect_events: 0 } } } });
  assert(!result.findings.some(row => row.code === 'retained-count-mismatch'));
});

test('Downloads lookup only selects matching direct files by modification time', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'champions-qa-'));
  try {
    const old = path.join(directory, 'champions-turn-log-old.json');
    const recent = path.join(directory, 'champions-sim-qa-artifact-new.json');
    fs.writeFileSync(old, '{}'); fs.utimesSync(old, 1, 1);
    fs.writeFileSync(recent, '{}');
    fs.writeFileSync(path.join(directory, 'unrelated.json'), '{}');
    fs.mkdirSync(path.join(directory, 'champions-turn-log-directory.json'));
    assert.equal(latestDownload(directory), recent);
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});
