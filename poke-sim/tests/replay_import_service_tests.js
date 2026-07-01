'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
globalThis.ChampionsSim = globalThis.ChampionsSim || {};
globalThis.SimEvidence = require(path.join(ROOT, 'sim_evidence.js'));
globalThis.ChampionsSim.replayCoach = require(path.join(ROOT, 'replay_coach.js'));
const ReplayImportService = require(path.join(ROOT, 'replay_import_service.js'));
const sample = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'showdown_replay_sample.txt'), 'utf8');

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
  console.log(`\nreplay import service: ${pass} pass, ${fail} fail\n`);
  if (fail) process.exit(1);
}
function eq(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message || 'mismatch'}: expected ${expected}, got ${actual}`);
}
function truthy(value, message) {
  if (!value) throw new Error(message || 'expected truthy');
}

console.log('\n=== replay import service tests ===\n');

const baseOpts = {
  room_id: 'room-1',
  uploaded_by_user_id: 'user-1',
  regulation_id: 'champions_reg_m_b_2026',
  ruleset_version: 'rules-v1',
  engine_version: 'engine-v1',
  now: '2026-07-01T00:00:00.000Z'
};

T('1. detects supported private import source types', () => {
  eq(ReplayImportService.sourceTypeForText(sample, 'battle.txt'), 'showdown_text', 'showdown text');
  eq(ReplayImportService.sourceTypeForText('<html><pre class="battle-log-data">&#124;player&#124;p1&#124;A</pre></html>', 'battle.html'), 'showdown_html', 'showdown html');
  eq(ReplayImportService.sourceTypeForText(JSON.stringify({ schema_version: 'champions-turn-log-v2' }), 'champions-turn-log.json'), 'champions_turn_log', 'turn log');
  eq(ReplayImportService.sourceTypeForText(JSON.stringify({ schema_version: 'champions-qa-artifact-v1' }), 'champions-sim-qa-artifact.json'), 'qa_artifact', 'qa artifact');
});

T('2. converts Showdown text into private import row and event rows', () => {
  const payload = ReplayImportService.buildReplayImportPayload(sample, Object.assign({}, baseOpts, { filename: 'battle.txt' }));
  eq(payload.ok, true, 'showdown payload ok');
  eq(payload.import_row.source_type, 'showdown_text', 'source type');
  eq(payload.import_row.parse_status, 'parsed', 'parse status');
  eq(payload.import_row.team_mapping_status, 'needs_review', 'mapping status');
  eq(payload.import_row.format, 'doubles', 'format');
  truthy(payload.import_row.source_hash, 'source hash');
  truthy(payload.import_row.source_gaps.includes('PRIVATE_IMPORT_NOT_PROMOTED'), 'promotion block gap');
  truthy(payload.import_row.source_gaps.includes('TEAM_MAPPING_NEEDS_REVIEW'), 'team mapping gap');
  truthy(payload.import_row.source_gaps.includes('SHOWDOWN_REPLAY_NOT_CHAMPION_RULE_TRUTH'), 'showdown truth gap');
  truthy(payload.events.length >= 10, 'event rows generated');
  truthy(payload.events.some((row) => row.event_type === 'move' && row.turn === 1), 'move event row');
  truthy(payload.events.every((row) => row.import_id === 'import-id-after-insert'), 'placeholder import ids');
});

T('3. converts Showdown HTML into the same private parser path', () => {
  const html = [
    '<!doctype html><html><body>',
    '<pre class="battle-log-data">',
    '&#124;player&#124;p1&#124;Alice<br>',
    '&#124;player&#124;p2&#124;Bob<br>',
    '&#124;gametype&#124;doubles<br>',
    '&#124;turn&#124;1<br>',
    '&#124;move&#124;p1a: Incineroar&#124;Fake Out&#124;p2a: Indeedee-F<br>',
    '&#124;win&#124;Alice',
    '</pre></body></html>'
  ].join('');
  const payload = ReplayImportService.buildReplayImportPayload(html, Object.assign({}, baseOpts, { filename: 'battle.html' }));
  eq(payload.ok, true, 'html payload ok');
  eq(payload.import_row.source_type, 'showdown_html', 'source type');
  eq(payload.import_row.parse_status, 'partial', 'minimal html should stay partial when parser warnings exist');
  truthy(payload.events.some((row) => row.event_type === 'move'), 'html move event');
});

T('4. converts Champions turn-log JSON through SimEvidence without promoting it', () => {
  const turnLog = {
    schema_version: 'champions-turn-log-v2',
    build_id: 'v-test',
    ruleset_version: 'rules-v1',
    regulation_id: 'champions_reg_m_b_2026',
    format: 'doubles',
    seed: 'seed-1',
    player_team_id: 'team-a',
    opponent_team_id: 'team-b',
    result: 'win',
    turnLog: [
      {
        turn: 1,
        log: ['A used Fake Out.'],
        damage_events: [{ move: 'Fake Out', damage: 20 }],
        effect_events: [{ effect: 'flinch' }]
      }
    ]
  };
  const payload = ReplayImportService.buildReplayImportPayload(JSON.stringify(turnLog), Object.assign({}, baseOpts, { filename: 'champions-turn-log.json' }));
  eq(payload.ok, true, 'turn log payload ok');
  eq(payload.import_row.source_type, 'champions_turn_log', 'source type');
  eq(payload.import_row.parse_status, 'parsed', 'parse status');
  truthy(payload.refs.length >= 1, 'replay refs generated');
  truthy(payload.events.some((row) => row.event_type === 'turn_snapshot'), 'turn snapshot event');
  truthy(payload.import_row.source_gaps.includes('PRIVATE_IMPORT_NOT_PROMOTED'), 'promotion block gap');
});

T('5. unsupported files fail closed as needs review and do not create events', () => {
  const payload = ReplayImportService.buildReplayImportPayload('not a battle file', Object.assign({}, baseOpts, { filename: 'notes.txt' }));
  eq(payload.ok, false, 'unsupported ok');
  eq(payload.import_row.source_type, 'unknown', 'source type');
  eq(payload.import_row.parse_status, 'failed', 'parse status');
  truthy(payload.import_row.source_gaps.includes('SOURCE_TYPE_UNSUPPORTED'), 'unsupported source gap');
  eq(payload.events.length, 0, 'no events');
});

T('6. service wrapper returns built payload when no DB adapter is supplied', () => {
  const service = ReplayImportService.createReplayImportService();
  return service.saveReplayImport(sample, Object.assign({}, baseOpts, { filename: 'battle.txt' })).then((payload) => {
    eq(payload.ok, true, 'service payload ok');
    eq(payload.import_row.source_type, 'showdown_text', 'service source type');
  });
});

run();
