// T195 - Sources/Data Provenance render path regression coverage

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function makeStubEl(tagName) {
  const el = {
    tagName: String(tagName || 'div').toUpperCase(),
    _children: [],
    _listeners: {},
    style: {},
    dataset: {},
    className: '',
    innerHTML: '',
    textContent: '',
    value: '',
    disabled: false,
    hidden: false,
    checked: false,
    selectedIndex: 0,
    options: [],
    selectedOptions: [],
    classList: {
      _set: new Set(),
      add(c){ this._set.add(c); },
      remove(c){ this._set.delete(c); },
      toggle(c, on){
        if (on === undefined) {
          this._set.has(c) ? this._set.delete(c) : this._set.add(c);
        } else if (on) {
          this._set.add(c);
        } else {
          this._set.delete(c);
        }
      },
      contains(c){ return this._set.has(c); }
    },
    appendChild(child) {
      this._children.push(child);
      if (Array.isArray(this.options) && child && String(child.tagName || '').toUpperCase() === 'OPTION') {
        this.options.push(child);
      }
      return child;
    },
    removeChild(child) {
      const idx = this._children.indexOf(child);
      if (idx >= 0) this._children.splice(idx, 1);
      const optIdx = this.options.indexOf(child);
      if (optIdx >= 0) this.options.splice(optIdx, 1);
      return child;
    },
    addEventListener(type, fn) {
      (this._listeners[type] = this._listeners[type] || []).push(fn);
    },
    removeEventListener(){},
    dispatchEvent(evt) {
      const type = evt && evt.type;
      const listeners = (type && this._listeners[type]) || [];
      listeners.forEach((fn) => fn.call(this, evt));
    },
    querySelector(){ return makeStubEl(); },
    querySelectorAll(){ return []; },
    getAttribute(){ return null; },
    setAttribute(){},
    focus(){},
    blur(){},
    click(){}
  };
  return el;
}

function makeDocument() {
  const els = {};
  return {
    _els: els,
    documentElement: makeStubEl('html'),
    body: makeStubEl('body'),
    activeElement: makeStubEl('button'),
    createElement(tag) { return makeStubEl(tag); },
    getElementById(id) {
      if (!els[id]) {
        els[id] = makeStubEl(id && id.indexOf('select') >= 0 ? 'select' : 'div');
      }
      return els[id];
    },
    querySelector(){ return makeStubEl(); },
    querySelectorAll(){ return []; },
    addEventListener(){},
    removeEventListener(){}
  };
}

const ctx = {
  console, require, module: {}, exports: {}, Math, Object, Array, Set, JSON,
  Promise, setTimeout, setInterval, clearTimeout, clearInterval, Date,
  String, Number, Boolean, RegExp, parseInt, parseFloat,
  document: makeDocument(),
  window: {
    matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} })
  },
  matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} }),
  navigator: { userAgent: 'node' },
  location: { href: 'http://localhost/' },
  localStorage: {
    _s: {},
    getItem(k){ return Object.prototype.hasOwnProperty.call(this._s, k) ? this._s[k] : null; },
    setItem(k, v){ this._s[k] = String(v); },
    removeItem(k){ delete this._s[k]; },
    clear(){ this._s = {}; }
  },
  URL: { createObjectURL(){ return 'blob:stub'; }, revokeObjectURL(){} },
  Blob: function(parts){ this.parts = parts; },
  FileReader: function(){},
  alert(){},
  fetch: () => Promise.reject(new Error('no network in tests')),
  Event: function(type){ this.type = type; }
};
ctx.self = ctx.window;
ctx.globalThis = ctx;
vm.createContext(ctx);

function load(file) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
}

load('data.js');
load('engine.js');
load('storage_adapter.js');
load('ui.js');

vm.runInContext([
  'this.TEAMS = TEAMS;',
  'this.ChampionsSim = ChampionsSim;',
  'this.renderSourcesTab = renderSourcesTab;',
  'this._activateTab = _activateTab;',
  'this.csBuildReplayTeamMatch = csBuildReplayTeamMatch;',
  'this.csBuildBattleSenseiSimPlan = csBuildBattleSenseiSimPlan;',
  'this.csStoreTeamRunSnapshot = csStoreTeamRunSnapshot;',
  'this.setCurrentFormat = setCurrentFormat;'
].join(' '), ctx);

const { TEAMS, ChampionsSim, renderSourcesTab, _activateTab, csBuildReplayTeamMatch, csBuildBattleSenseiSimPlan, csStoreTeamRunSnapshot, setCurrentFormat } = ctx;
const host = ctx.document.getElementById('sources-list');
const opponentSelect = ctx.document.getElementById('opponent-select');

let pass = 0;
let fail = 0;

function T(name, fn) {
  try {
    fn();
    console.log('  PASS', name);
    pass++;
  } catch (err) {
    console.log('  FAIL', name, '-', err.message);
    fail++;
  }
}

function eq(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error((msg || 'values differ') + ` expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function truthy(value, msg) {
  if (!value) throw new Error(msg || 'expected truthy');
}

function inc(hay, needle, msg) {
  if (String(hay).indexOf(needle) < 0) {
    throw new Error((msg || 'missing substring') + `: ${needle}`);
  }
}

function notInc(hay, needle, msg) {
  if (String(hay).indexOf(needle) >= 0) {
    throw new Error((msg || 'unexpected substring') + `: ${needle}`);
  }
}

function makeScopedSimResult() {
  return {
    wins: 3,
    losses: 1,
    draws: 0,
    allLogs: [
      {
        result: 'win',
        turns: 5,
        leads: { player: ['Whimsicott', 'Garchomp'], opponent: ['Tyranitar', 'Excadrill'] },
        bring: { player: ['Whimsicott', 'Garchomp', 'Incineroar', 'Rotom-Wash'], opponent: ['Tyranitar', 'Excadrill'] },
        log: ['[TURN 1]', 'Whimsicott used Tailwind', '[TURN 2]', 'Garchomp used Earthquake']
      }
    ],
    winConditions: { 'Tailwind cleanup': 3, 'Opponent Win': 1 }
  };
}

function makeReplayParsedForTeam(teamKey, formatKind) {
  const members = (TEAMS[teamKey] && TEAMS[teamKey].members) ? TEAMS[teamKey].members.map((m) => m.name) : [];
  return {
    selectedSide: 'p1',
    formatKind: formatKind || 'doubles',
    rulesetProfile: { compatibilityClass: 'champion_exact' },
    teamPreview: { p1: members.slice(0, 6), p2: ['Tyranitar', 'Excadrill', 'Rotom-Heat', 'Amoonguss', 'Dragonite', 'Gholdengo'] },
    selectedPokemon: { p1: members.slice(0, 4), p2: ['Tyranitar', 'Excadrill', 'Rotom-Heat', 'Amoonguss'] }
  };
}

console.log('\n=== sources data provenance render tests ===\n');

T('1. live Sources renderer explains data boundaries', () => {
  setCurrentFormat('doubles');
  const model = renderSourcesTab('player');
  truthy(model && Array.isArray(model.cards), 'renderer should return a provenance model');
  inc(host.innerHTML, 'Data Provenance Control Room', 'control room heading should render');
  inc(host.innerHTML, 'Simulation data', 'simulation card should render');
  inc(host.innerHTML, 'Replay data', 'replay card should render');
  inc(host.innerHTML, 'Champion compliance', 'compliance card should render');
  inc(host.innerHTML, 'Free local memory', 'local memory card should render');
  inc(host.innerHTML, 'Premium saved memory', 'premium card should render');
  inc(host.innerHTML, 'Raw logs are not silently stored', 'privacy boundary should render');
  inc(host.innerHTML, 'Generic Showdown logs remain format-limited', 'format boundary should render');
  inc(host.innerHTML, 'Verified Champion artifacts can calibrate Champion confidence', 'Champion calibration boundary should render');
  inc(host.innerHTML, 'Replay team vs edited team improvement requires the same opponent, format, and sim baseline', 'team-tweak loop boundary should render');
});

T('2. Sources table uses trainer-facing team names instead of internal keys', () => {
  renderSourcesTab('player');
  inc(host.innerHTML, 'Team Catalog Sources', 'team source table should render');
  inc(host.innerHTML, TEAMS.rin_sand.name, 'trainer-facing team name should render');
  inc(host.innerHTML, 'Trainer UI should show team names and source quality, not internal team IDs.', 'internal-id guardrail should render');
  if (TEAMS.rin_sand.name !== 'rin_sand') {
    notInc(host.innerHTML, '<td>rin_sand</td>', 'internal team key should not render as a table label');
  }
});

T('3. Sources tab activation refreshes the provenance renderer', () => {
  host.innerHTML = '';
  _activateTab('sources', { persist: false });
  inc(host.innerHTML, 'Data Provenance Control Room', 'tab activation should render Sources content');
});

T('4. Replay provenance reflects the latest local replay analysis without saving raw logs', () => {
  ChampionsSim.state.lastReplayCoachAnalysis = {
    parsed: { format: 'gen9championsvgc2026', turns: [{ turn: 1 }, { turn: 2 }], winner: 'p1' },
    review: {
      summary: {
        rulesetProfile: 'champion_exact',
        coachingMode: 'champion-ready',
        confidence: 'medium'
      }
    }
  };
  const model = renderSourcesTab('player');
  const replay = model.cards.find((card) => card.title === 'Replay data');
  truthy(replay, 'replay data card should exist');
  inc(host.innerHTML, 'champion-ready', 'latest replay coaching mode should render');
  inc(host.innerHTML, 'Raw logs are not silently stored', 'raw log privacy reminder should remain visible');
});

T('5. Sources exposes Replay-to-sim comparison provenance without model rewrite claims', () => {
  ChampionsSim.state.lastReplayCoachAnalysis = {
    parsed: { format: 'gen9championsvgc2026', turns: [{ turn: 1 }, { turn: 2 }], winner: 'p1' },
    review: {
      summary: {
        rulesetProfile: 'champion_exact',
        coachingMode: 'champion-ready',
        confidence: 'medium'
      },
      learningReport: {
        simComparison: {
          status: 'matched',
          comparisonStatus: 'simulator_confirmed',
          calibrationAction: 'none',
          confidence: 'medium',
          evidenceLabel: 'Strong inference'
        }
      }
    }
  };
  const model = renderSourcesTab('player');
  const card = model.cards.find((row) => row.title === 'Replay-to-sim comparison');
  truthy(card, 'comparison card should exist');
  eq(card.status, 'available', 'matched comparison should be available');
  inc(host.innerHTML, 'Replay-to-sim comparison', 'comparison card should render');
  inc(host.innerHTML, 'simulator_confirmed', 'classification should render');
  inc(host.innerHTML, 'one replay or one team tweak does not rewrite sim models or Battle IQ', 'single-replay/team-tweak guardrail should render');
});

T('6. Battle Sensei sim plan uses scoped Strategy V2 evidence only', () => {
  setCurrentFormat('doubles');
  opponentSelect.value = 'rin_sand';
  csStoreTeamRunSnapshot('player', 'rin_sand', 'doubles', 3, 'test');
  ChampionsSim.state.lastResults = { rin_sand: makeScopedSimResult() };
  ChampionsSim.state.lastResultsPlayerKey = 'wrong_team';
  ChampionsSim.state.lastResultsFormat = 'doubles';
  const replayTeamMatch = csBuildReplayTeamMatch(makeReplayParsedForTeam('player', 'doubles'), 'p1');
  const blocked = csBuildBattleSenseiSimPlan({
    formatKind: 'doubles',
    selectedSide: 'p1',
    teamPreview: { p2: ['Tyranitar', 'Excadrill'] }
  }, 'p1', replayTeamMatch);
  eq(blocked, null, 'mismatched team scope should not become sim evidence');

  ChampionsSim.state.lastResultsPlayerKey = 'player';
  const plan = csBuildBattleSenseiSimPlan({
    formatKind: 'doubles',
    selectedSide: 'p1',
    teamPreview: { p2: ['Tyranitar', 'Excadrill'] }
  }, 'p1', replayTeamMatch);
  truthy(plan, 'matching scoped results should produce a sim plan');
  eq(plan.matchedOpponentKey, 'rin_sand', 'matched opponent');
  inc(plan.expectedWinPath, 'Tailwind cleanup', 'win path should come from corrected Strategy evidence');
  notInc(plan.expectedWinPath, 'Opponent Win', 'loss labels should not become replay sim win paths');
});

T('7. replay team matching distinguishes same, possible, and different teams in-session', () => {
  setCurrentFormat('doubles');
  csStoreTeamRunSnapshot('player', 'rin_sand', 'doubles', 3, 'test');
  const same = csBuildReplayTeamMatch(makeReplayParsedForTeam('player', 'doubles'), 'p1');
  truthy(['same_team', 'similar_team'].includes(same.status), 'active player team should strongly match');
  eq(same.allowsSimComparison, true, 'same/similar team should allow comparison');

  const possible = csBuildReplayTeamMatch({
    selectedSide: 'p1',
    formatKind: 'doubles',
    rulesetProfile: { compatibilityClass: 'champion_exact' },
    teamPreview: { p1: (TEAMS.player.members || []).slice(0, 4).map((m) => m.name), p2: [] },
    selectedPokemon: { p1: (TEAMS.player.members || []).slice(0, 3).map((m) => m.name), p2: [] }
  }, 'p1');
  eq(possible.status, 'possible_match', 'partial overlap should stay provisional');
  eq(possible.allowsSimComparison, false, 'possible match should not unlock comparison');

  const different = csBuildReplayTeamMatch(makeReplayParsedForTeam('rin_sand', 'doubles'), 'p1');
  eq(different.status, 'different_team', 'different roster should be blocked');
  eq(different.allowsSimComparison, false, 'different team should block comparison');
});

console.log(`\nsources data provenance render tests: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
