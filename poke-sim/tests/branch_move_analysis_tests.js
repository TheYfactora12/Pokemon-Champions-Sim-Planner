'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function makeStubEl() {
  return {
    style: {},
    dataset: {},
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    addEventListener(){},
    removeEventListener(){},
    querySelector(){ return null; },
    querySelectorAll(){ return []; },
    setAttribute(){},
    getAttribute(){ return null; },
    appendChild(){},
    click(){},
    value: '',
    options: [],
    selectedIndex: 0,
    innerHTML: '',
    textContent: ''
  };
}

const document = {
  documentElement: makeStubEl(),
  body: makeStubEl(),
  getElementById(){ return makeStubEl(); },
  querySelector(){ return makeStubEl(); },
  querySelectorAll(){ return []; },
  createElement(){ return makeStubEl(); },
  addEventListener(){},
  removeEventListener(){}
};

const ctx = {
  console, Math, Object, Array, Set, Map, JSON, Date, String, Number, Boolean, RegExp, Error, Symbol, parseFloat, parseInt, isFinite,
  document,
  window: {
    document,
    addEventListener(){},
    removeEventListener(){},
    matchMedia(){ return { matches: false, addEventListener(){}, removeEventListener(){} }; }
  },
  matchMedia(){ return { matches: false, addEventListener(){}, removeEventListener(){} }; },
  localStorage: {
    _s: {},
    getItem(k){ return this._s[k] || null; },
    setItem(k, v){ this._s[k] = String(v); },
    removeItem(k){ delete this._s[k]; }
  }
};
ctx.window.localStorage = ctx.localStorage;
vm.createContext(ctx);

function load(file) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
}

load('data.js');
load('engine.js');
load('ui.js');

vm.runInContext('this.csAnalyzeBranchCoverageRows = csAnalyzeBranchCoverageRows;', ctx);
vm.runInContext('this.csRememberBranchMoveAnalysis = csRememberBranchMoveAnalysis; this.csLoadBranchStrategyMemory = csLoadBranchStrategyMemory; this.csRenderStrategyPriorityBoard = csRenderStrategyPriorityBoard;', ctx);

let pass = 0;
let fail = 0;
function T(name, fn) {
  try {
    fn();
    pass++;
    console.log('  PASS', name);
  } catch (err) {
    fail++;
    console.log('  FAIL', name, '-', err.message);
  }
}
function eq(actual, expected, msg) {
  if (actual !== expected) throw new Error((msg || 'mismatch') + ': expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
}
function truthy(value, msg) {
  if (!value) throw new Error(msg || 'expected truthy');
}

function row(key, result, runCount, move0, move1, opponent) {
  return {
    branch_key: key,
    player_team_id: 'player',
    opponent_team_id: opponent || 'mega_altaria',
    player_leads: ['Incineroar', 'Arcanine'],
    opponent_leads: ['Mega Altaria', 'Whimsicott'],
    run_count: runCount,
    result,
    turns: 1,
    forced_actions: [
      { turn: 1, side: 'player', slot: 0, move: move0, targetSide: 'opponent', targetSlot: 0 },
      { turn: 1, side: 'player', slot: 1, move: move1, targetSide: 'opponent', targetSlot: 1 },
      { turn: 1, side: 'opponent', slot: 0, move: 'Hyper Voice', targetSide: 'player', targetSlot: 0 },
      { turn: 1, side: 'opponent', slot: 1, move: 'Tailwind', targetSide: 'self', targetSlot: 1 }
    ]
  };
}

console.log('\n=== branch move analysis tests ===\n');

T('1. flags repeated losing moves as strong avoid signals', () => {
  const out = ctx.csAnalyzeBranchCoverageRows([
    row('bad-1', 'loss', 8, 'Parting Shot', 'Flare Blitz'),
    row('good-1', 'win', 8, 'Fake Out', 'Flare Blitz')
  ], { minStrongSamples: 8, avoidWinRate: 0.35 });
  const avoid = out.avoid_moves.find((m) => m.actor === 'Incineroar' && m.move === 'Parting Shot');
  truthy(avoid, 'missing avoid move');
  eq(avoid.confidence, 'strong', 'avoid confidence');
  eq(avoid.win_rate_pct, 0, 'avoid win rate');
});

T('2. suggests better legal move seen in the same lead and matchup context', () => {
  const out = ctx.csAnalyzeBranchCoverageRows([
    row('bad-2', 'loss', 8, 'Parting Shot', 'Flare Blitz'),
    row('good-2', 'win', 8, 'Fake Out', 'Flare Blitz')
  ], { minStrongSamples: 8, avoidWinRate: 0.35 });
  const swap = out.move_replacement_candidates.find((m) => m.actor === 'Incineroar' && m.avoid_move === 'Parting Shot');
  truthy(swap, 'missing replacement candidate');
  eq(swap.better_legal_move_seen, 'Fake Out', 'better move');
  eq(swap.confidence, 'strong', 'swap confidence');
});

T('3. keeps low-sample advice marked as early signal', () => {
  const out = ctx.csAnalyzeBranchCoverageRows([
    row('bad-3', 'loss', 1, 'Parting Shot', 'Flare Blitz'),
    row('good-3', 'win', 1, 'Fake Out', 'Flare Blitz')
  ], { minStrongSamples: 8, avoidWinRate: 0.35 });
  const avoid = out.avoid_moves.find((m) => m.move === 'Parting Shot');
  truthy(avoid, 'missing early avoid');
  eq(avoid.confidence, 'early_signal', 'early confidence');
});

T('4. does not mix different opponent matchup contexts', () => {
  const out = ctx.csAnalyzeBranchCoverageRows([
    row('bad-4', 'loss', 8, 'Parting Shot', 'Flare Blitz', 'mega_altaria'),
    row('good-4', 'win', 8, 'Fake Out', 'Flare Blitz', 'mega_dragonite')
  ], { minStrongSamples: 8, avoidWinRate: 0.35 });
  truthy(!out.move_replacement_candidates.some((m) => m.avoid_move === 'Parting Shot' && m.better_legal_move_seen === 'Fake Out'), 'mixed opponent contexts');
});

T('5. branch move overview states QA analysis and priority truth', () => {
  const out = ctx.csAnalyzeBranchCoverageRows([row('bad-5', 'loss', 1, 'Parting Shot', 'Flare Blitz')]);
  truthy(out.overview.some((line) => /does not alter battle mechanics/.test(line)), 'missing mechanics truth');
  truthy(out.overview.some((line) => /Highest priority/.test(line)), 'missing priority line');
});

T('6. trainer report uses competitive language and confidence truth', () => {
  const out = ctx.csAnalyzeBranchCoverageRows([
    row('bad-6', 'loss', 1, 'Parting Shot', 'Flare Blitz'),
    row('good-6', 'win', 1, 'Fake Out', 'Flare Blitz')
  ], { minStrongSamples: 8, avoidWinRate: 0.35 });
  const text = out.trainer_report.join(' ');
  truthy(/lead pair|opposing lead|matchup branch|game plan/.test(text), 'missing competitive trainer language');
  truthy(/Early signals are for stress testing|Early avoid signals/.test(text), 'missing confidence truth');
});

T('7. remembers branch strategy analysis for later Strategy guide rollup', () => {
  const out = ctx.csAnalyzeBranchCoverageRows([
    row('bad-7', 'loss', 8, 'Parting Shot', 'Flare Blitz'),
    row('good-7', 'win', 8, 'Fake Out', 'Flare Blitz')
  ], { minStrongSamples: 8, avoidWinRate: 0.35 });
  ctx.csRememberBranchMoveAnalysis(out);
  const memory = ctx.csLoadBranchStrategyMemory();
  truthy(memory.analyses.length >= 1, 'missing memory entry');
  eq(memory.analyses[0].player_team_id, 'player', 'memory player key');
  truthy(memory.analyses[0].avoid_moves.some((m) => m.move === 'Parting Shot'), 'missing avoid row in memory');
});

T('8. strategy priority board puts player action before evidence rollup', () => {
  const out = ctx.csAnalyzeBranchCoverageRows([
    row('bad-8', 'loss', 8, 'Parting Shot', 'Flare Blitz'),
    row('good-8', 'win', 8, 'Fake Out', 'Flare Blitz')
  ], { minStrongSamples: 8, avoidWinRate: 0.35 });
  const html = ctx.csRenderStrategyPriorityBoard('player', {
    record_total: { n: 16, w: 8, l: 8, win_rate: 0.5 },
    team_confidence_v2: { tier: 'high' },
    lead_performance_v2: [{ lead: ['Incineroar', 'Arcanine'], n: 16, w: 8, l: 8, win_rate: 0.5, confidence: 'high' }]
  }, out);
  truthy(/Coach call/.test(html), 'missing coach call');
  truthy(html.indexOf('1. Click plan') >= 0, 'missing click plan priority');
  truthy(html.indexOf('1. Click plan') < html.indexOf('5. Matchup health'), 'record appeared before action plan');
  truthy(/Next test/.test(html), 'missing next test');
});

console.log(`\nbranch move analysis tests: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
