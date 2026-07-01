'use strict';

const fs = require('fs');
const path = require('path');
const helpers = require('./_db_helpers.js');

const ROOT = path.resolve(__dirname, '..');
const adapterSrc = fs.readFileSync(path.join(ROOT, 'supabase_adapter.js'), 'utf8');

let pass = 0;
let fail = 0;
const tests = [];
function T(name, fn) {
  tests.push([name, fn]);
}
async function run() {
  for (const [name, fn] of tests) {
    try {
      await fn();
      pass += 1;
      console.log('  PASS ' + name);
    } catch (err) {
      fail += 1;
      console.error('  FAIL ' + name + ': ' + err.message);
    }
  }
  console.log(`\nreplay import adapter: ${pass} pass, ${fail} fail\n`);
  if (fail) process.exit(1);
}
function truthy(value, message) {
  if (!value) throw new Error(message || 'expected truthy');
}
function eq(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message || 'mismatch'}: expected ${expected}, got ${actual}`);
}
function makeResolvingMockClient(state) {
  state = state || {};
  return {
    from(table) {
      state[table] = state[table] || [];
      let pendingInsert = null;
      const chain = {
        insert(rows) {
          pendingInsert = rows;
          return chain;
        },
        select() {
          return chain;
        },
        single() {
          const inserted = Array.isArray(pendingInsert) ? pendingInsert : [pendingInsert];
          inserted.filter(Boolean).forEach((row) => state[table].push(row));
          return Promise.resolve({ data: inserted[0] || null, error: null });
        },
        then(resolve, reject) {
          try {
            const inserted = Array.isArray(pendingInsert) ? pendingInsert : [pendingInsert];
            inserted.filter(Boolean).forEach((row) => state[table].push(row));
            return Promise.resolve(resolve({ data: inserted, error: null }));
          } catch (err) {
            if (reject) return Promise.resolve(reject(err));
            return Promise.reject(err);
          }
        }
      };
      return chain;
    }
  };
}

console.log('\n=== replay import adapter tests ===\n');

T('1. Supabase adapter exposes private replay import persistence method and tables', () => {
  [
    "TRAINER_REPLAY_IMPORTS_TABLE = 'trainer_replay_imports'",
    "TRAINER_REPLAY_IMPORT_REFS_TABLE = 'trainer_replay_import_refs'",
    "TRAINER_REPLAY_IMPORT_EVENTS_TABLE = 'trainer_replay_import_events'",
    'saveReplayImport',
    'sanitizeReplayImportPayload',
    'normalizeReplayImportChildRows'
  ].forEach((needle) => truthy(adapterSrc.includes(needle), `missing ${needle}`));
});

T('2. saveReplayImport returns null when Supabase is disabled', async () => {
  const adapter = helpers.installAdapter({}, { disable: true });
  const result = await adapter.saveReplayImport({ import_row: { source_type: 'showdown_text' } });
  eq(result, null, 'disabled adapter result');
});

T('3. saveReplayImport inserts parent first, then refs/events with returned import id', async () => {
  const state = {
    trainer_replay_imports: [],
    trainer_replay_import_refs: [],
    trainer_replay_import_events: []
  };
  const adapter = helpers.installAdapter({}, {
    url: 'https://mock.supabase.test',
    key: 'mock-anon-key',
    mockClient: makeResolvingMockClient(state),
    forceMock: true
  });
  const payload = {
    import_row: {
      room_id: 'room-1',
      uploaded_by_user_id: 'user-1',
      source_type: 'showdown_text',
      source_hash: 'hash-1',
      parser_version: 'parser-v1',
      parse_status: 'parsed',
      team_mapping_status: 'needs_review',
      source_gaps: ['PRIVATE_IMPORT_NOT_PROMOTED'],
      confidence_flags: ['private_trainer_import'],
      metadata: { ok: true }
    },
    refs: [
      { import_id: 'import-id-after-insert', ref_type: 'replay_log', ref_id: 'seed-1', verification_status: 'needs_review' }
    ],
    events: [
      { import_id: 'import-id-after-insert', event_index: 0, event_type: 'move', event_payload: { move: 'Fake Out' }, parser_confidence: 'medium' }
    ]
  };
  const saved = await adapter.saveReplayImport(payload);
  truthy(saved && saved.import_row && saved.import_row.id, 'saved import id missing');
  eq(saved.saved_counts.refs, 1, 'saved refs count');
  eq(saved.saved_counts.events, 1, 'saved events count');
  eq(state.trainer_replay_imports.length, 1, 'parent insert count');
  eq(state.trainer_replay_import_refs.length, 1, 'ref insert count');
  eq(state.trainer_replay_import_events.length, 1, 'event insert count');
  eq(state.trainer_replay_import_refs[0].import_id, saved.import_row.id, 'ref import id remap');
  eq(state.trainer_replay_import_events[0].import_id, saved.import_row.id, 'event import id remap');
});

T('4. adapter does not write replay imports to Team Lab rankings or global learning', () => {
  truthy(!adapterSrc.includes("from('team_lab_leaderboard_entries').insert"), 'must not write leaderboard entries');
  truthy(!adapterSrc.includes("from('team_lab_promotion_audits').insert"), 'must not write promotion audits');
  truthy(!adapterSrc.includes("from('global_learning')"), 'must not write global learning');
  truthy(!adapterSrc.includes("from('bot_sessions')"), 'must not write bot sessions');
});

run();
