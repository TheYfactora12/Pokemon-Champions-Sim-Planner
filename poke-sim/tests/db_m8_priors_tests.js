// db_m8_priors_tests.js — Module 8: Prior snapshots for hidden-info inference (10 cases)
// PR: test/db-m8-priors → Linear: POK-24
// Spec: poke-sim/tests/db_m8_priors_tests.js
//
// RED state: before M8 lands, loadPriorSnapshot doesn't exist → all fail.
// GREEN trigger: after M8 impl PR (POK-24), all 10 pass.

'use strict';

const vm = require('vm');
const fs = require('fs');
const path = require('path');
const { mockSupabaseClient, installAdapter, freshCtx } = require('./_db_helpers.js');

// Test harness — supports both sync and async (Promise-returning) test functions
var _passed = 0, _failed = 0, _total = 0;
var _queue = [];
function T(name, fn) { _queue.push({ name: name, fn: fn }); }
function eq(a, b, msg) { if (a !== b) throw new Error(msg + ' expected ' + JSON.stringify(b) + ', got ' + JSON.stringify(a)); }
function truthy(v, msg) { if (!v) throw new Error(msg + ' expected truthy'); }
function falsy(v, msg) { if (v) throw new Error(msg + ' expected falsy'); }

// Paths
var ADAPTER_PATH = path.resolve(__dirname, '..', 'supabase_adapter.js');
var ENGINE_PATH = path.resolve(__dirname, '..', 'engine.js');
var UI_PATH = path.resolve(__dirname, '..', 'ui.js');
var FIXTURE_PATH = path.resolve(__dirname, 'fixtures', 'prior_snapshot_sample.json');

// Load fixture
var FIXTURE = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'));

// Seed mock with prior_snapshots from fixture
var SEED_PRIORS = FIXTURE.snapshots.map(function(s) {
  return {
    prior_id: s.prior_id,
    source:   s.source,
    format:   s.format,
    cutoff:   s.cutoff,
    month:    s.month,
    location: s.location,
    usage_data: s.usage_data
  };
});

// Create context and install adapter
var ctx = freshCtx();
ctx.window.TEAMS = {
  player:         { name: 'Player Team',    members: [], source: 'preloaded' },
  mega_altaria:   { name: 'Mega Altaria',   members: [], source: 'preloaded' },
  mega_metagross: { name: 'Mega Metagross', members: [], source: 'preloaded' }
};

// Install adapter first (resets mock state internally), then seed prior_snapshots
installAdapter(ctx);
mockSupabaseClient.getState().prior_snapshots = SEED_PRIORS.slice();

// Load M4 _buildAnalysisPayload from ui.js (T-prior-9, T-prior-10 depend on it)
(function loadBuildPayload() {
  if (!fs.existsSync(UI_PATH)) return;
  var uiSrc = fs.readFileSync(UI_PATH, 'utf8');
  var marker = '// __M4_BUILD_PAYLOAD_BEGIN__';
  var endMarker = '// __M4_BUILD_PAYLOAD_END__';
  var b = uiSrc.indexOf(marker);
  var e = uiSrc.indexOf(endMarker);
  if (b === -1 || e === -1) return; // M4 not implemented
  var snippet = uiSrc.substring(b, e + endMarker.length);
  vm.runInContext(snippet, ctx);
})();

console.log('\n\u25B6 Module 8 \u2014 Prior snapshots for hidden-info inference (10 cases)');

T('T-prior-1', function() {
  // loadPriorSnapshot exists on the adapter
  var adapterContent = fs.readFileSync(ADAPTER_PATH, 'utf8');
  truthy(adapterContent.indexOf('loadPriorSnapshot') !== -1,
    'adapter must expose loadPriorSnapshot');
});

T('T-prior-2', async function() {
  // loadPriorSnapshot(format, month) returns a snapshot object or null
  var adapter = ctx.window.SupabaseAdapter;
  truthy(typeof adapter.loadPriorSnapshot === 'function',
    'SupabaseAdapter.loadPriorSnapshot must be a function');

  var result = await adapter.loadPriorSnapshot('vgc2026regm', '2026-05-15');
  truthy(result !== undefined, 'loadPriorSnapshot must return a value');
  // Should return the May snapshot (latest ≤ 2026-05-15)
  if (result) {
    truthy(result.prior_id, 'returned snapshot must have prior_id');
    truthy(result.source, 'returned snapshot must have source');
    truthy(result.format, 'returned snapshot must have format');
    truthy(result.month, 'returned snapshot must have month');
  }
});

T('T-prior-3', async function() {
  // Snapshot contains usage_data with species, items, moves
  var adapter = ctx.window.SupabaseAdapter;
  var result = await adapter.loadPriorSnapshot('vgc2026regm', '2026-05-15');

  truthy(result, 'must return a snapshot for vgc2026regm');
  truthy(result.usage_data, 'snapshot must contain usage_data');
  truthy(Array.isArray(result.usage_data.species), 'usage_data.species must be array');
  truthy(Array.isArray(result.usage_data.items), 'usage_data.items must be array');
  truthy(Array.isArray(result.usage_data.moves), 'usage_data.moves must be array');
  truthy(result.usage_data.species.length > 0, 'usage_data.species must have entries');
});

T('T-prior-4', async function() {
  // No matching snapshot → returns null (not error)
  var adapter = ctx.window.SupabaseAdapter;
  var result = await adapter.loadPriorSnapshot('nonexistent_format', '2026-01-01');
  eq(result, null, 'missing format must return null');
});

T('T-prior-5', async function() {
  // Load fails (DB error) → fail-soft returns null
  mockSupabaseClient.setErrorMode('4xx');
  var freshContext = freshCtx();
  freshContext.window.TEAMS = ctx.window.TEAMS;
  mockSupabaseClient.reset({ prior_snapshots: SEED_PRIORS.slice() });
  mockSupabaseClient.setErrorMode('4xx');
  installAdapter(freshContext);

  var adapter = freshContext.window.SupabaseAdapter;
  if (typeof adapter.loadPriorSnapshot !== 'function') {
    throw new Error('loadPriorSnapshot must exist for fail-soft test');
  }
  var result = await adapter.loadPriorSnapshot('vgc2026regm', '2026-05-15');
  eq(result, null, 'DB error must return null (fail-soft)');

  // Reset error mode
  mockSupabaseClient.setErrorMode(null);
});

T('T-prior-6', function() {
  // Engine buildAnalysisPayload includes prior_id when prior loaded
  var engineContent = fs.readFileSync(ENGINE_PATH, 'utf8');
  truthy(engineContent.indexOf('applyPrior') !== -1 || engineContent.indexOf('ctx.prior') !== -1,
    'engine must have applyPrior function or ctx.prior handling');

  var engineCtx = freshCtx();
  var dataPath = path.resolve(__dirname, '..', 'data.js');
  var dataSrc = fs.readFileSync(dataPath, 'utf8');
  vm.runInContext(dataSrc, engineCtx);

  var engineSrc = fs.readFileSync(ENGINE_PATH, 'utf8');
  vm.runInContext(engineSrc, engineCtx);

  truthy(typeof engineCtx.buildAnalysisPayload === 'function',
    'buildAnalysisPayload must be accessible');

  var mockPrior = SEED_PRIORS[2]; // May snapshot
  var mockRawResult = {
    winRate: 0.6, wins: 6, losses: 4, draws: 0,
    sampleSize: 10, allLogs: [], seeds: []
  };
  var result = engineCtx.buildAnalysisPayload(mockRawResult, { prior: mockPrior });
  truthy(result.prior_id, 'result must include prior_id when prior is loaded');
  eq(result.prior_id, mockPrior.prior_id, 'prior_id must match the loaded prior');
});

T('T-prior-7', function() {
  // Engine hidden_info_priors.source changes when prior loaded
  var engineCtx = freshCtx();
  var dataPath = path.resolve(__dirname, '..', 'data.js');
  var dataSrc = fs.readFileSync(dataPath, 'utf8');
  vm.runInContext(dataSrc, engineCtx);
  var engineSrc = fs.readFileSync(ENGINE_PATH, 'utf8');
  vm.runInContext(engineSrc, engineCtx);

  var mockPrior = SEED_PRIORS[2];
  var mockRawResult = {
    winRate: 0.6, wins: 6, losses: 4, draws: 0,
    sampleSize: 10, allLogs: [], seeds: []
  };
  var result = engineCtx.buildAnalysisPayload(mockRawResult, { prior: mockPrior });
  truthy(result.hidden_info_priors, 'result must have hidden_info_priors');
  eq(result.hidden_info_priors.source, 'smogon-usage',
    'hidden_info_priors.source must be smogon-usage when prior loaded');
});

T('T-prior-8', function() {
  // Engine without prior → identical behavior (no regression)
  var engineCtx = freshCtx();
  var dataPath = path.resolve(__dirname, '..', 'data.js');
  var dataSrc = fs.readFileSync(dataPath, 'utf8');
  vm.runInContext(dataSrc, engineCtx);
  var engineSrc = fs.readFileSync(ENGINE_PATH, 'utf8');
  vm.runInContext(engineSrc, engineCtx);

  var mockRawResult = {
    winRate: 0.6, wins: 6, losses: 4, draws: 0,
    sampleSize: 10, allLogs: [], seeds: []
  };
  var result = engineCtx.buildAnalysisPayload(mockRawResult, {});
  truthy(result.hidden_info_priors, 'result must have hidden_info_priors');
  eq(result.hidden_info_priors.source, 'exact-input',
    'without prior, source must remain exact-input');
  eq(result.prior_id || null, null, 'without prior, prior_id must be null');
});

T('T-prior-9', function() {
  // saveAnalysis payload includes prior_id when prior was used
  if (typeof ctx.window._buildAnalysisPayload !== 'function') {
    throw new Error('_buildAnalysisPayload must exist (M4 wiring)');
  }
  var simResultWithPrior = {
    prior_id: 'smogon-vgc2026-regm-2026-05',
    hidden_info_model: 'smogon-usage-2026-05',
    winRate: 0.65,
    wins: 65, losses: 35, draws: 0,
    sampleSize: 100,
    allLogs: [], seeds: [],
    avgTurns: 8.5, avgTrTurns: 1.2,
    policy: 'greedy-vs-greedy'
  };
  var payload = ctx.window._buildAnalysisPayload('player', 'mega_altaria', 3, simResultWithPrior);
  eq(payload.prior_id, 'smogon-vgc2026-regm-2026-05',
    'payload prior_id must match sim result');
});

T('T-prior-10', function() {
  // hidden_info_model populated in payload
  if (typeof ctx.window._buildAnalysisPayload !== 'function') {
    throw new Error('_buildAnalysisPayload must exist (M4 wiring)');
  }
  var simResultWithModel = {
    prior_id: 'smogon-vgc2026-regm-2026-05',
    hidden_info_model: 'smogon-usage-2026-05',
    winRate: 0.65,
    wins: 65, losses: 35, draws: 0,
    sampleSize: 100,
    allLogs: [], seeds: [],
    avgTurns: 8.5, avgTrTurns: 1.2,
    policy: 'greedy-vs-greedy'
  };
  var payload = ctx.window._buildAnalysisPayload('player', 'mega_altaria', 3, simResultWithModel);
  eq(payload.hidden_info_model, 'smogon-usage-2026-05',
    'payload hidden_info_model must match sim result');
});

// ── Async test runner ────────────────────────────────────────────────────────
async function runAll() {
  for (var i = 0; i < _queue.length; i++) {
    var t = _queue[i];
    _total++;
    try {
      var ret = t.fn();
      if (ret && typeof ret.then === 'function') await ret;
      _passed++;
      console.log('  \u2714 ' + t.name);
    } catch (e) {
      _failed++;
      console.log('  \u2716 FAIL: ' + t.name + ' \u2014 ' + e.message);
    }
  }
  console.log('\n==================================================');
  console.log('Module 8 Prior Snapshots Results: ' + _passed + '/' + _total + ' passed');
  if (_failed === 0) {
    console.log('\u2705 All tests passed');
  } else {
    console.log('\u274C ' + _failed + ' test(s) FAILED');
  }
  process.exit(_failed > 0 ? 1 : 0);
}
runAll();
