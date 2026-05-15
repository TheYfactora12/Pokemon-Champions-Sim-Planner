// Phase 4e (Refs PHASE4E_POLICY_AUDIT_SPEC.md) - policy audit / T5 gate.

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
    querySelector: () => stubEl(),
    querySelectorAll: () => [],
    click: () => {},
    focus: () => {},
    blur: () => {}
  };
}

const ctx = {
  console, require, module: {}, exports: {}, Math, Object, Array, Set, JSON,
  Promise, setTimeout, clearTimeout, Date, String, Number, Boolean, Map, Error, RegExp,
  Symbol, parseFloat, parseInt, isFinite,
  window: {},
  document: {
    getElementById: () => stubEl(),
    querySelector: () => stubEl(),
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    body: stubEl(),
    documentElement: stubEl(),
    head: stubEl(),
    createElement: () => stubEl()
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
  'this.auditPolicyOutput = auditPolicyOutput;',
  'this.detectFakeGoodPlays = detectFakeGoodPlays;',
  'this.detectPlayerBehaviorPatterns = detectPlayerBehaviorPatterns;',
  'this.auditCoachingDelta = auditCoachingDelta;',
  'this.renderStaticAdviceWarning = renderStaticAdviceWarning;',
  'this.csRenderPolicyAuditSection = csRenderPolicyAuditSection;',
  'this.buildWeaknessDashboard = buildWeaknessDashboard;',
  'this.csRenderWeaknessDashboard = csRenderWeaknessDashboard;'
].join(' '), ctx);

let pass = 0, fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}
function truthy(v, msg) { if (!v) throw new Error(msg || 'expected truthy'); }
function eq(a, b, msg) {
  if (a !== b) throw new Error((msg || 'mismatch') + ': expected ' + JSON.stringify(b) + ', got ' + JSON.stringify(a));
}

function mkGame(i, pattern) {
  const game = {
    result: pattern === 'loss' || pattern === 'tr_unanswered' || pattern === 'protect_overuse_loss' ? 'loss' : 'win',
    turns: 6,
    leads: { player: i < 100 ? ['Arcanine', 'Incineroar'] : ['Garchomp', 'Whimsicott'] },
    koEvents: [],
    movesUsed: {},
    protectStreakMax: {},
    log: [],
    lossPattern: pattern
  };
  if (pattern === 'tr_unanswered') {
    game.log.push('Garchomp knocked out Hatterene!');
    game.log.push('Opponent set Trick Room!');
    game.koEvents.push({ side: 'opponent', victim: 'Hatterene', turn: 2, bySide: 'player' });
    game.koEvents.push({ side: 'player', victim: 'Arcanine', turn: 3 });
  }
  if (pattern === 'protect_overuse_loss') {
    game.protectStreakMax = { Whimsicott: 3 };
    game.koEvents.push({ side: 'player', victim: 'Whimsicott', turn: 4 });
  }
  if (i < 100) {
    game.movesUsed = { Arcanine: { 'Flare Blitz': 1 }, Incineroar: { 'Fake Out': 1 } };
  } else {
    game.movesUsed = { Garchomp: { Earthquake: 1 }, Whimsicott: { Tailwind: 1 } };
  }
  return game;
}

console.log('\n=== Phase 4e policy regression tests ===\n');

T('T5-1 auditPolicyOutput flags speed-tie coinflip advice', () => {
  const out = ctx.auditPolicyOutput(['Treat this speed tie coinflip as a reliable strategy.']);
  eq(out.fakeGoodCount, 1);
  truthy(out.flagged[0].reason.includes('speed-tie'));
});

T('T5-2 auditPolicyOutput flags TR advice with KOed setter', () => {
  const out = ctx.auditPolicyOutput(['Use Trick Room even though the setter is KO and gone.']);
  eq(out.fakeGoodCount, 1);
  truthy(out.flagged[0].reason.includes('Trick Room'));
});

T('T5-3 auditPolicyOutput flags redundant coverage recommendation', () => {
  const out = ctx.auditPolicyOutput(['Add type coverage for an already covered slot.']);
  eq(out.fakeGoodCount, 1);
  truthy(out.flagged[0].reason.includes('coverage'));
});

T('T5-4 auditPolicyOutput flags generic aggression', () => {
  const out = ctx.auditPolicyOutput(['Be aggressive.']);
  eq(out.fakeGoodCount, 1);
  truthy(out.flagged[0].reason.includes('aggression'));
});

T('T5-5 clean advice returns zero fake-good flags', () => {
  const out = ctx.auditPolicyOutput([
    'Lead Incineroar + Whimsicott; Fake Out the setter and Tailwind if they Protect.',
    'Preserve Garchomp until Rotom-Wash is below half HP.'
  ]);
  eq(out.fakeGoodCount, 0);
});

T('T5-6 static warning banner renders only when fakeGoodCount > 0', () => {
  const bad = ctx.renderStaticAdviceWarning({ fakeGoodCount: 1, flagged: [{ advice: 'Be aggressive.', reason: 'generic' }] }, 'strategy');
  const clean = ctx.renderStaticAdviceWarning({ fakeGoodCount: 0, flagged: [] }, 'strategy');
  truthy(bad.includes('Some advice is based on static patterns'), 'missing warning text');
  eq(clean, '');
});

T('T5-7 detectFakeGoodPlays flags KO plus Trick Room allowed', () => {
  const games = [];
  for (let i = 0; i < 30; i++) games.push(mkGame(i, i < 10 ? 'tr_unanswered' : 'win'));
  const out = ctx.detectFakeGoodPlays(games, 'player');
  const row = out.find(x => x.pattern === 'ko_but_tr_dropped');
  truthy(row, 'missing ko_but_tr_dropped');
  eq(row.occurrences, 10);
});

T('T5-8 detectPlayerBehaviorPatterns flags overprotect', () => {
  const games = [];
  for (let i = 0; i < 20; i++) games.push(mkGame(100 + i, i < 8 ? 'protect_overuse_loss' : 'win'));
  const out = ctx.detectPlayerBehaviorPatterns(games, 'player');
  const row = out.find(x => x.pattern === 'overprotect');
  truthy(row, 'missing overprotect');
  eq(row.occurrences, 8);
});

T('T5-9 auditCoachingDelta detects static advice after 50 new games', () => {
  const a = { recommended_line: 'safe', dominant_loss_condition: 'tr_unanswered', dead_moves: ['Beat Up'] };
  const b = { recommended_line: 'safe', dominant_loss_condition: 'tr_unanswered', dead_moves: ['Beat Up'] };
  const out = ctx.auditCoachingDelta(a, b, 50, 100);
  eq(out.verdict, 'static');
  eq(out.surfaces_changed, 0);
});

T('T5-10 same-advice regression fixture adapts across 100 new battles', () => {
  const first100 = [];
  const all200 = [];
  for (let i = 0; i < 100; i++) first100.push(mkGame(i, i < 60 ? 'tr_unanswered' : 'win'));
  for (let i = 0; i < 200; i++) all200.push(mkGame(i, i < 100 ? (i < 60 ? 'tr_unanswered' : 'win') : (i < 160 ? 'protect_overuse_loss' : 'win')));
  const adviceA = {
    recommended_line: 'Arcanine + Incineroar',
    dominant_loss_condition: 'tr_unanswered',
    dead_moves: ['Whimsicott:Beat Up']
  };
  const adviceB = {
    recommended_line: 'Garchomp + Whimsicott',
    dominant_loss_condition: 'protect_overuse_loss',
    dead_moves: ['Arcanine:Will-O-Wisp']
  };
  const out = ctx.auditCoachingDelta(adviceA, adviceB, first100.length, all200.length);
  if (out.surfaces_changed < 2) {
    throw new Error('Advice did not adapt across 100 new battles: ' + JSON.stringify(out.diffs));
  }
  eq(out.verdict, 'adaptive');
});

T('T5-11 Policy Audit section renders static/adaptive state', () => {
  const html = ctx.csRenderPolicyAuditSection({
    total_battles: 100,
    policy_audit: {
      fake_good_plays: [],
      player_behavior_patterns: [],
      policy_output_audit: { fakeGoodCount: 0, flagged: [] },
      coaching_delta: ctx.auditCoachingDelta(
        { recommended_line: 'safe', dominant_loss_condition: 'x', dead_moves: [] },
        { recommended_line: 'safe', dominant_loss_condition: 'x', dead_moves: [] },
        50,
        100
      )
    }
  });
  truthy(html.includes('Policy Audit'), 'missing title');
  truthy(html.includes('STATIC ADVICE WARNING'), 'missing static warning');
});

T('T5-12 buildWeaknessDashboard returns the top 3 default sections', () => {
  const dash = ctx.buildWeaknessDashboard(
    { members: [{ name: 'Incineroar', moves: ['Fake Out'] }] },
    {
      mega_altaria: { wins: 2, losses: 8, draws: 0 },
      player: { wins: 7, losses: 3, draws: 0 },
      kingambit_sneasler: { wins: 1, losses: 6, draws: 0 }
    },
    'doubles',
    {},
    { safe: 'Whimsicott + Arcanine', speed: 'Garchomp + Whimsicott', pressure: 'Incineroar + Garchomp' },
    { worst_lead: { lead: ['Incineroar', 'Garchomp'], win_rate: 0.25, n: 8 } },
    [{ owner: 'Incineroar', move: 'Will-O-Wisp', times_used: 0, games_sampled: 18 }],
    [{ category: 'Speed control', note: 'No Tailwind or Trick Room - faster meta teams will outpace you.' }]
  );
  eq(Array.isArray(dash.sections) ? dash.sections.length : 0, 3);
  truthy(dash.summary && dash.summary.length > 0, 'missing summary');
  truthy(dash.sections[0].title.includes('Matchup'), 'matchup section missing');
  truthy(dash.sections[1].title.includes('Lead'), 'lead section missing');
  truthy(dash.sections[2].title.includes('Dead'), 'dead move section missing');
});

T('T5-13 weakness dashboard renders actionable copy', () => {
  const html = ctx.csRenderWeaknessDashboard({
    weakness_dashboard: {
      summary: 'Start with the matchup gap, then clean up the weakest opening pair, then prune dead moves.',
      rule_violations: ['Speed control'],
      sections: [
        { title: 'Matchup win-rate gaps', headline: 'Worst current matchup: Mega Altaria at 20% over 10 games.', rows: [{ label: 'Mega Altaria', value: '20% over 10 games' }], fix: 'Try leading Whimsicott + Arcanine into this archetype.' },
        { title: 'Lead-pair issues', headline: 'Weakest lead pair: Incineroar + Garchomp at 25% over 8 games.', rows: [{ label: 'Incineroar + Garchomp', value: '25% over 8 games' }], fix: 'Shift your default into Whimsicott + Arcanine and keep the weak lead as a matchup-specific exception.' },
        { title: 'Dead moves', headline: 'Incineroar - Will-O-Wisp has 0 calls in the sample.', rows: [{ label: 'Incineroar - Will-O-Wisp', value: '0 calls over 18 games' }], fix: 'Open these slots on turn 1 when they are support tools, or replace them with coverage that patches your worst matchup.' }
      ]
    }
  });
  truthy(html.includes('Personal Weakness Dashboard'), 'missing dashboard title');
  truthy(html.includes('Matchup win-rate gaps'), 'missing matchup card');
  truthy(html.includes('Lead-pair issues'), 'missing lead card');
  truthy(html.includes('Dead moves'), 'missing dead move card');
  truthy(html.includes('Try leading Whimsicott + Arcanine'), 'missing matchup fix');
});

console.log(`\nPhase 4e policy regression: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
