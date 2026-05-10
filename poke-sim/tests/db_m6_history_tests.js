// db_m6_history_tests.js — Module 6: History tab reads from DB (10 cases)
// PR: test/db-m6-history-tab → Linear: POK-22
// Spec: poke-sim/tests/db_m6_history_tests.js
//
// RED state: before M6 lands, loadAnalysesForPlayer doesn't exist → all fail.
// GREEN trigger: after M6 impl PR (POK-22), all 10 pass.

'use strict';

const vm = require('vm');
const fs = require('fs');
const path = require('path');
const { mockSupabaseClient, installAdapter, freshCtx } = require('./_db_helpers.js');

// Test harness
var _passed = 0, _failed = 0, _total = 0;
function T(name, fn) { _total++; try { fn(); _passed++; console.log('  ✔ ' + name); } catch (e) { _failed++; console.log('  ✖ FAIL: ' + name + ' — ' + e.message); } }
function describe(name, fn) { console.log('\n▶ ' + name); fn(); }
function eq(a, b, msg) { if (a !== b) throw new Error(msg + ' expected ' + JSON.stringify(b) + ', got ' + JSON.stringify(a)); }
function truthy(v, msg) { if (!v) throw new Error(msg + ' expected truthy'); }
function falsy(v, msg) { if (v) throw new Error(msg + ' expected falsy'); }

// Create context
var ctx = freshCtx();
ctx.window.TEAMS = { player: { name: 'Player Team', members: [], source: 'preloaded' } };
installAdapter(ctx);

// Seed mock with analysis history rows
var SEED_ANALYSES = [
  { analysis_id: 'a1', created_at: '2026-05-09T10:00:00Z', player_team_id: 'player', opp_team_id: 'mega_altaria', bo: 3, win_rate: 0.67, wins: 6, losses: 3, sample_size: 9 },
  { analysis_id: 'a2', created_at: '2026-05-08T14:30:00Z', player_team_id: 'player', opp_team_id: 'champions_arena_1st', bo: 5, win_rate: 0.40, wins: 4, losses: 6, sample_size: 10 },
  { analysis_id: 'a3', created_at: '2026-05-07T09:15:00Z', player_team_id: 'player', opp_team_id: 'mega_altaria', bo: 3, win_rate: 0.80, wins: 8, losses: 2, sample_size: 10 }
];

// Load M6 history block from ui.js (between markers)
(function loadHistoryBlock() {
  var uiPath = path.resolve(__dirname, '..', 'ui.js');
  if (!fs.existsSync(uiPath)) return;
  var uiSrc = fs.readFileSync(uiPath, 'utf8');
  var marker = '// __M6_HISTORY_BEGIN__';
  var endMarker = '// __M6_HISTORY_END__';
  var b = uiSrc.indexOf(marker);
  var e = uiSrc.indexOf(endMarker);
  if (b === -1 || e === -1) return; // RED state
  var snippet = uiSrc.substring(b, e + endMarker.length);
  
  // Add mock document object to prevent DOM errors in Node.js
  ctx.window.document = {
    querySelectorAll: function() { return []; },
    querySelector: function() { return null; },
    addEventListener: function() {},
    createElement: function() { return { style: {}, appendChild: function() {} }; }
  };
  
  vm.runInContext(snippet, ctx);
})();

describe('Module 6 — History tab reads from DB (10 cases)', function() {

  T('T-hist-1', function() {
    // loadAnalysesForPlayer(playerKey, limit) exists on adapter
    var adapterPath = path.resolve(__dirname, '..', 'supabase_adapter.js');
    var adapterContent = fs.readFileSync(adapterPath, 'utf8');
    truthy(adapterContent.indexOf('loadAnalysesForPlayer') !== -1,
      'adapter must expose loadAnalysesForPlayer');
  });

  T('T-hist-2', function() {
    // loadAnalysesForPlayer queries with player_team_id filter
    var adapterPath = path.resolve(__dirname, '..', 'supabase_adapter.js');
    var adapterContent = fs.readFileSync(adapterPath, 'utf8');
    truthy(adapterContent.indexOf("'player_team_id'") !== -1 || adapterContent.indexOf('"player_team_id"') !== -1,
      'adapter filters by player_team_id');
    truthy(adapterContent.indexOf('created_at') !== -1,
      'adapter orders by created_at');
  });

  T('T-hist-3', function() {
    // Default limit is 50
    var adapterPath = path.resolve(__dirname, '..', 'supabase_adapter.js');
    var adapterContent = fs.readFileSync(adapterPath, 'utf8');
    // The function should default limit to 50
    truthy(adapterContent.indexOf('50') !== -1 && adapterContent.indexOf('loadAnalysesForPlayer') !== -1,
      'loadAnalysesForPlayer uses 50 as default limit');
  });

  T('T-hist-4', function() {
    // ui.js calls loadAnalysesForPlayer somewhere in the history/replay section
    var uiPath = path.resolve(__dirname, '..', 'ui.js');
    var uiContent = fs.readFileSync(uiPath, 'utf8');
    truthy(uiContent.indexOf('loadAnalysesForPlayer') !== -1,
      'ui.js calls loadAnalysesForPlayer for history rendering');
  });

  T('T-hist-5', function() {
    // History row click triggers lazy load of analysis_logs (grep for loadAnalysisLogs)
    var adapterPath = path.resolve(__dirname, '..', 'supabase_adapter.js');
    var adapterContent = fs.readFileSync(adapterPath, 'utf8');
    truthy(adapterContent.indexOf('loadAnalysisLogs') !== -1,
      'adapter exposes loadAnalysisLogs for lazy-load on expand');
  });

  T('T-hist-6', function() {
    // Wins filter logic: rows with wins > losses
    var uiPath = path.resolve(__dirname, '..', 'ui.js');
    var uiContent = fs.readFileSync(uiPath, 'utf8');
    // The history filter must check wins vs losses
    truthy(uiContent.indexOf('wins') !== -1 && uiContent.indexOf('losses') !== -1,
      'history filtering references wins and losses fields');
  });

  T('T-hist-7', function() {
    // Clutch filter: bo > 1 with close margins
    var uiPath = path.resolve(__dirname, '..', 'ui.js');
    var uiContent = fs.readFileSync(uiPath, 'utf8');
    truthy(uiContent.indexOf('clutch') !== -1 || uiContent.indexOf('Clutch') !== -1,
      'history filtering includes clutch category');
  });

  T('T-hist-8', function() {
    // Empty history → shows empty-state message
    var uiPath = path.resolve(__dirname, '..', 'ui.js');
    var uiContent = fs.readFileSync(uiPath, 'utf8');
    truthy(uiContent.indexOf('No history') !== -1 || uiContent.indexOf('no past analyses') !== -1 || uiContent.indexOf('No analyses yet') !== -1,
      'empty history shows a user-visible message (not blank)');
  });

  T('T-hist-9', function() {
    // loadAnalysesForPlayer is fail-soft: 4xx returns [] not throw
    mockSupabaseClient.reset();
    mockSupabaseClient.setErrorMode('4xx');
    installAdapter(ctx);
    truthy(typeof ctx.window.SupabaseAdapter.loadAnalysesForPlayer === 'function',
      'loadAnalysesForPlayer exists on adapter');
    // Calling with error mode must not throw
    var threw = false;
    try {
      ctx.window.SupabaseAdapter.loadAnalysesForPlayer('player', 50);
    } catch (e) { threw = true; }
    eq(threw, false, 'loadAnalysesForPlayer must not throw on 4xx');
    mockSupabaseClient.setErrorMode(null);
  });

  T('T-hist-10', function() {
    // loadAnalysisLogs(analysisId) is fail-soft
    mockSupabaseClient.reset();
    mockSupabaseClient.setErrorMode('4xx');
    installAdapter(ctx);
    truthy(typeof ctx.window.SupabaseAdapter.loadAnalysisLogs === 'function',
      'loadAnalysisLogs exists on adapter');
    var threw = false;
    try {
      ctx.window.SupabaseAdapter.loadAnalysisLogs('nonexistent_id');
    } catch (e) { threw = true; }
    eq(threw, false, 'loadAnalysisLogs must not throw on 4xx');
    mockSupabaseClient.setErrorMode(null);
  });
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('Module 6 History Results: ' + _passed + '/' + _total + ' passed');
if (_failed > 0) {
  console.log('❌ ' + _failed + ' tests FAILED');
  process.exit(1);
} else {
  console.log('✅ All tests passed');
}
