// Phase 5 (Refs PHASE5_TURN_LOG_SPEC_DRAFT.md) - turnLog, positionScore, Replay Log v2.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function stubEl() {
  return {
    addEventListener: () => {},
    removeEventListener: () => {},
    appendChild: () => {},
    setAttribute: () => {},
    getAttribute: () => null,
    classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
    style: {},
    innerHTML: '',
    textContent: '',
    value: 'mega_altaria',
    options: [],
    children: [],
    querySelector: () => null,
    querySelectorAll: () => [],
    click: () => {},
    focus: () => {},
    blur: () => {}
  };
}

const replayListEl = stubEl();
const created = [];
const ctx = {
  console, require, module: {}, exports: {}, Math, Object, Array, Set, JSON,
  Promise, setTimeout, clearTimeout, Date, String, Number, Boolean, Map, Error, RegExp,
  Symbol, parseFloat, parseInt, isFinite,
  window: {},
  Blob: function(parts, opts) { this.parts = parts; this.opts = opts; },
  URL: { createObjectURL: () => 'blob:test', revokeObjectURL: () => {} },
  document: {
    getElementById: (id) => id === 'replay-list' ? replayListEl : stubEl(),
    querySelector: () => stubEl(),
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    body: stubEl(),
    documentElement: stubEl(),
    head: stubEl(),
    createElement: () => {
      const el = stubEl();
      created.push(el);
      return el;
    }
  },
  localStorage: {
    _s: {},
    getItem(k) { return this._s[k] || null; },
    setItem(k, v) { this._s[k] = String(v); },
    removeItem(k) { delete this._s[k]; }
  }
};
ctx.window.matchMedia = () => ({ matches: false });
ctx.matchMedia = () => ({ matches: false });
ctx.addEventListener = () => {};
ctx.removeEventListener = () => {};
vm.createContext(ctx);

function load(file) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
}

load('data.js');
try { load('legality.js'); } catch (_) {}
load('engine.js');
try { load('strategy-injectable.js'); } catch (_) {}
load('ui.js');

vm.runInContext([
  'this.TEAMS = TEAMS;',
  'this.simulateBattle = simulateBattle;',
  'this.positionScore = positionScore;',
  'this.winProbabilityDelta = winProbabilityDelta;',
  'this.csReplaySparkline = csReplaySparkline;',
  'this.csRenderTurnLogRows = csRenderTurnLogRows;',
  'this.csBuildDecisionAudit = csBuildDecisionAudit;',
  'this.csBuildReplayCoachingSummary = csBuildReplayCoachingSummary;',
  'this.csRenderReplayCoachingSummary = csRenderReplayCoachingSummary;',
  'this.downloadReplayTurnLog = downloadReplayTurnLog;'
].join(' '), ctx);

let pass = 0, fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}
function truthy(v, msg) { if (!v) throw new Error(msg || 'expected truthy'); }
function eq(a, b, msg) { if (a !== b) throw new Error((msg || 'not equal') + ' expected=' + b + ' got=' + a); }

console.log('\n=== Phase 5 turn log tests ===\n');

let battleA;
T('T5a-1 turnLog is populated after simulateBattle', () => {
  battleA = ctx.simulateBattle(ctx.TEAMS.player, ctx.TEAMS.mega_altaria, {});
  truthy(Array.isArray(battleA.turnLog), 'turnLog array missing');
  truthy(battleA.turnLog.length > 0, 'turnLog empty');
  truthy(battleA.turnLog[0].pre && battleA.turnLog[0].post, 'pre/post state missing');
  truthy(Array.isArray(battleA.turnLog[0].pre.roster.player), 'player roster snapshot missing');
  truthy(Array.isArray(battleA.turnLog[0].pre.roster.opponent), 'opponent roster snapshot missing');
  const payload = ctx.ChampionsSim.internal.buildAnalysisPayload('player', 'mega_altaria', 1, {
    wins: 1, losses: 0, draws: 0, avgTurns: 1, avgTrTurns: 0, allLogs: [battleA]
  });
  truthy(!payload.logs[0].turnLog, 'turnLog must not be persisted in save payload logs');
  truthy(Array.isArray(payload.logs[0].position_path), 'summary position path should persist');
});

T('T5a-2 turnLog clears on new sim run', () => {
  const battleB = ctx.simulateBattle(ctx.TEAMS.player, ctx.TEAMS.mega_charizard_y, {});
  truthy(Array.isArray(battleB.turnLog), 'second turnLog missing');
  truthy(battleB.turnLog !== battleA.turnLog, 'turnLog reused across runs');
  eq(ctx.window.ChampionsSim.turnLog, battleB.turnLog, 'latest namespace turnLog not refreshed');
});

T('T5b-1 positionScore returns 0..1', () => {
  const score = ctx.positionScore({
    player: { hp_total: 2, alive_count: 2, max_count: 4, active: ['A'], bench: ['B'] },
    opponent: { hp_total: 2, alive_count: 2, max_count: 4, active: ['C'], bench: ['D'] },
    speed_control: { player: {}, opponent: {} },
    status: {}
  });
  truthy(score >= 0 && score <= 1, 'score outside range: ' + score);
});

T('T5b-2 positionScore favors higher player HP', () => {
  const score = ctx.positionScore({
    player: { hp_total: 3, alive_count: 2, max_count: 4, active: ['A'], bench: ['B'] },
    opponent: { hp_total: 1, alive_count: 2, max_count: 4, active: ['C'], bench: ['D'] },
    speed_control: { player: {}, opponent: {} },
    status: {}
  });
  truthy(score > 0.5, 'expected player-favored score, got ' + score);
});

T('T5b-2a positionScore uses actual turn order under Trick Room', () => {
  const playerAhead = ctx.positionScore({
    player: { hp_total: 2, alive_count: 1, max_count: 2, active: ['Slowmon'], active_keys: ['player:active:0:Slowmon'], bench: [], bench_keys: [] },
    opponent: { hp_total: 2, alive_count: 1, max_count: 2, active: ['Fastmon'], active_keys: ['opponent:active:0:Fastmon'], bench: [], bench_keys: [] },
    field: { trick_room: 1 },
    speed_control: { player: {}, opponent: {} },
    speed_order_keys: ['player:active:0:Slowmon', 'opponent:active:0:Fastmon'],
    status: {}
  });
  const opponentAhead = ctx.positionScore({
    player: { hp_total: 2, alive_count: 1, max_count: 2, active: ['Slowmon'], active_keys: ['player:active:0:Slowmon'], bench: [], bench_keys: [] },
    opponent: { hp_total: 2, alive_count: 1, max_count: 2, active: ['Fastmon'], active_keys: ['opponent:active:0:Fastmon'], bench: [], bench_keys: [] },
    field: { trick_room: 1 },
    speed_control: { player: {}, opponent: {} },
    speed_order_keys: ['opponent:active:0:Fastmon', 'player:active:0:Slowmon'],
    status: {}
  });
  truthy(playerAhead > opponentAhead, 'expected Trick Room score to follow actual order');
});

T('T5b-3 winProbabilityDelta length is turnLog.length - 1', () => {
  const deltas = ctx.winProbabilityDelta(battleA.turnLog);
  eq(deltas.length, Math.max(0, battleA.turnLog.length - 1), 'delta length mismatch');
});

T('T5b-4 swing turn is flagged on known fixture', () => {
  const fixture = [
    { turn: 1, post: { position_score: 0.52 } },
    { turn: 2, post: { position_score: 0.55 } },
    { turn: 3, post: { position_score: 0.31 } },
    { turn: 4, post: { position_score: 0.35 } }
  ];
  ctx.winProbabilityDelta(fixture);
  truthy(fixture[2].swingTurn === true, 'largest swing turn not flagged');
});

T('T5c-1 Replay Log v2 renders turn rows', () => {
  const html = ctx.csRenderTurnLogRows(battleA.turnLog);
  truthy(html.includes('replay-turn-row'), 'turn rows missing');
});

T('T5c-1a Replay Log v2 renders Turn 0 and both board sides', () => {
  const html = ctx.csRenderTurnLogRows([{
    turn: 1,
    pre: {
      roster: {
        player: [
          { displayName: 'Kangaskhan', species: 'Kangaskhan', status: 'active', hp: 100, hpLabel: '100%', moves: ['Fake Out'], baseStatsLabel: '105/95/80/40/80/90' },
          { displayName: 'Milotic', species: 'Milotic', status: 'bench', hp: 100, hpLabel: '100%', moves: ['Recover'] }
        ],
        opponent: [
          { displayName: 'Tyranitar', species: 'Tyranitar', status: 'active', hp: 100, hpLabel: '100%', moves: ['Rock Slide'] }
        ]
      }
    },
    post: {
      roster: {
        player: [
          { displayName: 'Kangaskhan', species: 'Kangaskhan', status: 'active', hp: 70, hpLabel: '70%', moves: ['Fake Out'] },
          { displayName: 'Milotic', species: 'Milotic', status: 'bench', hp: 100, hpLabel: '100%', moves: ['Recover'] }
        ],
        opponent: [
          { displayName: 'Tyranitar', species: 'Tyranitar', status: 'fainted', hp: 0, hpLabel: '0%', faintTurn: 1, moves: ['Rock Slide'] }
        ]
      },
      position_score: 0.6
    },
    actions: { player: [{ actor: 'Kangaskhan', move: 'Fake Out', target: 'Tyranitar' }], opponent: [] },
    delta: { position_score: 0.1 }
  }]);
  truthy(html.includes('Turn 0 — Starting State'), 'Turn 0 block missing');
  truthy(html.includes('Turn 0 · Your team'), 'your Turn 0 board missing');
  truthy(html.includes('Turn 0 · Their team'), 'their Turn 0 board missing');
  truthy(html.includes('After T1 · Your team'), 'your per-turn board missing');
  truthy(html.includes('After T1 · Their team'), 'their per-turn board missing');
  truthy(html.includes('Tyranitar'), 'opponent mon missing');
  truthy(html.includes('fainted'), 'fainted status missing');
  truthy(html.includes('0%'), 'zero HP missing');
});

T('T5c-2 swing turn row is highlighted', () => {
  const rows = [
    { turn: 1, post: { position_score: 0.5 }, delta: { position_score: 0 }, actions: { player: [], opponent: [] } },
    { turn: 2, swingTurn: true, post: { position_score: 0.3 }, delta: { position_score: -0.2 }, actions: { player: [], opponent: [] } }
  ];
  truthy(ctx.csRenderTurnLogRows(rows).includes('replay-turn-row swing'), 'swing class missing');
});

T('T5c-3 JSON download produces valid parseable file', () => {
  let parsed = null;
  ctx.Blob = function(parts) { parsed = JSON.parse(parts[0]); };
  ctx.downloadReplayTurnLog({ seed: 'abc', result: 'win', turnLog: battleA.turnLog, position_path: battleA.position_path });
  truthy(parsed && Array.isArray(parsed.turnLog), 'download JSON did not parse');
});

T('T5c-4 Sparkline renders without error on 1-turn game', () => {
  const html = ctx.csReplaySparkline([{ turn: 1, post: { position_score: 0.5 } }]);
  truthy(html.includes('polyline'), 'sparkline missing polyline');
});

T('T5c-4a replay HP bars hide snapshot side prefixes on mirror species', () => {
  const html = ctx.csRenderHpBars({
    post: {
      hp_pct: {
        'player:active:0:Incineroar': 0.55,
        'opponent:active:0:Incineroar': 0.25
      }
    }
  });
  truthy(!html.includes('player:active:0:'), 'snapshot key leaked into HP bars');
  truthy(!html.includes('opponent:active:0:'), 'snapshot key leaked into HP bars');
  truthy((html.match(/Incineroar/g) || []).length >= 2, 'expected mirrored species labels to render');
});

const DECISION_PLAYER = [{ name: 'Hero', moves: ['Earthquake', 'Recover'], item: 'Leftovers', ability: 'Tough Claws', types: ['Ground'] }];
const DECISION_OPP = [{ name: 'Dummy', moves: ['Tackle'], item: 'Sitrus Berry', ability: 'Run Away', types: ['Flying'] }];
const DECISION_TURN_LOG = [{
  turn: 1,
  pre: {
    active: { player: ['Hero'], opponent: ['Dummy'] },
    hp_pct: { Hero: 0.22, Dummy: 1 },
    field: { weather: null, weather_turns: 0, terrain: null, terrain_turns: 0, trick_room: 0 },
    speed_order: ['Dummy', 'Hero'],
    legal_options: {
      Hero: ['Earthquake -> Dummy', 'Recover -> Dummy']
    }
  },
  actions: {
    player: [{ actor: 'Hero', move: 'Earthquake', target: 'Dummy' }],
    opponent: [{ actor: 'Dummy', move: 'Tackle', target: 'Hero' }]
  },
  post: { position_score: 0.3 },
  delta: { position_score: -0.2 }
}];

T('T5c-5 csBuildDecisionAudit flags a clearly worse line', () => {
  const audit = ctx.csBuildDecisionAudit(DECISION_TURN_LOG, {
    playerKey: 'player',
    oppKey: 'opp',
    teamLookup: DECISION_PLAYER,
    oppLookup: DECISION_OPP,
    threshold: 10
  });
  truthy(audit && audit.total_flags === 1, 'expected one flagged turn');
  eq(audit.flagged_turns[0].best_move, 'Recover');
  truthy(audit.flagged_turns[0].score_gap >= 10, 'expected a meaningful score gap');
});

T('T5c-6 Replay Log v2 renders decision gap chip', () => {
  const html = ctx.csRenderTurnLogRows(DECISION_TURN_LOG, {
    playerKey: 'player',
    oppKey: 'opp',
    teamLookup: DECISION_PLAYER,
    oppLookup: DECISION_OPP
  });
  truthy(html.includes('decision-gap'), 'missing decision gap class');
  truthy(html.includes('Better line: Recover'), 'missing best-line chip');
});

T('T5c-7 replay coaching summary flags execution from turn-log evidence', () => {
  const out = ctx.csBuildReplayCoachingSummary({
    result: 'loss',
    oppKey: 'opp',
    turnLog: DECISION_TURN_LOG,
    turning_point: { turn: 1 }
  }, {
    playerKey: 'player',
    oppKey: 'opp',
    teamLookup: DECISION_PLAYER,
    oppLookup: DECISION_OPP
  });
  eq(out.issue_category, 'execution', 'expected execution issue');
  eq(out.evidence_label, 'replay + turn log', 'expected turn-log evidence label');
  truthy(/Review T1/.test(out.next_action), 'expected turn review action');
});

T('T5c-8 replay coaching summary does not fall back to strategy context in v1', () => {
  const out = ctx.csBuildReplayCoachingSummary({
    result: 'loss',
    oppKey: 'mega_altaria',
    turnLog: [{
      turn: 1,
      pre: {},
      actions: { player: [{ actor: 'Hero', move: 'Protect', target: 'Dummy' }], opponent: [] },
      post: { position_score: 0.4 },
      delta: { position_score: -0.1 }
    }],
    turning_point: { turn: 2 }
  });
  eq(out.issue_category, 'not enough evidence', 'expected conservative fallback');
  eq(out.evidence_label, 'not enough evidence', 'expected conservative evidence label');
  truthy(!/Protect the speed-control turn/.test(out.next_action), 'unexpected strategy-context action');
});

T('T5c-9 replay coaching summary supports not enough evidence', () => {
  const out = ctx.csBuildReplayCoachingSummary({
    result: 'loss',
    oppKey: 'mega_altaria',
    log: ['Turn 1']
  });
  eq(out.issue_category, 'not enough evidence', 'expected not-enough-evidence issue');
  eq(out.evidence_label, 'not enough evidence', 'expected not-enough-evidence label');
});

T('T5c-10 replay coaching summary renderer prints the bounded output rows', () => {
  const html = ctx.csRenderReplayCoachingSummary({
    issue_category: 'execution',
    evidence_label: 'replay + turn log',
    next_action: 'Review T1',
    detail: 'Replay shows a clearer line on the turning turn.'
  });
  truthy(html.includes('Coaching Summary'), 'summary title missing');
  truthy(html.includes('Issue'), 'issue row missing');
  truthy(html.includes('Evidence'), 'evidence row missing');
  truthy(html.includes('Next action'), 'next action row missing');
});

console.log(`\nPhase 5 turn log: ${pass} pass, ${fail} fail\n`);
if (fail) process.exit(1);
