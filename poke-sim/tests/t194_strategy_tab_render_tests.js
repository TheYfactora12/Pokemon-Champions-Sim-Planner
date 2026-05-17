// T194 - Strategy tab V2 report + render path regression coverage

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
  'this.csBuildStrategyReportV2 = csBuildStrategyReportV2;',
  'this.renderStrategyTab = renderStrategyTab;',
  'this.csClearStrategyData = csClearStrategyData;',
  'this.csGetScopedStrategyResults = csGetScopedStrategyResults;',
  'this.csSimLogAppendSeries = csSimLogAppendSeries;',
  'this.csSimLogForTeamBothSides = csSimLogForTeamBothSides;',
  'this.setCurrentFormat = setCurrentFormat;',
  'this.ChampionsSim = ChampionsSim;'
].join(' '), ctx);

const { TEAMS, csBuildStrategyReportV2, renderStrategyTab, csClearStrategyData, csGetScopedStrategyResults, csSimLogAppendSeries, csSimLogForTeamBothSides, setCurrentFormat, ChampionsSim } = ctx;

const host = ctx.document.getElementById('strategy-content');
const oppSel = ctx.document.getElementById('opponent-select');
oppSel.value = 'rin_sand';

function makeLossLog(oppKey, lead, finisher, trTurns, twTurnsOpp) {
  return {
    result: 'loss',
    oppKey,
    turns: 6,
    trTurns: trTurns || 0,
    twTurnsOpp: twTurnsOpp || 0,
    leads: { player: lead.slice(), opponent: ['Tyranitar', 'Excadrill'] },
    log: [
      '[TURN 1]',
      lead[0] + ' fainted',
      finisher + ' used Rock Slide',
      '[TURN 2]',
      lead[1] + ' fainted',
      finisher + ' used Earthquake'
    ]
  };
}

function makeWinLog(oppKey, lead) {
  return {
    result: 'win',
    oppKey,
    turns: 5,
    trTurns: 0,
    twTurnsOpp: 0,
    leads: { player: lead.slice(), opponent: ['Charizard', 'Venusaur'] },
    log: [
      '[TURN 1]',
      lead[0] + ' used Fake Out',
      '[TURN 2]',
      lead[1] + ' used Tailwind'
    ]
  };
}

const testResults = {
  rin_sand: {
    wins: 1,
    losses: 5,
    draws: 0,
    allLogs: [
      makeLossLog('rin_sand', ['Incineroar', 'Garchomp'], 'Tyranitar', 0, 1),
      makeLossLog('rin_sand', ['Incineroar', 'Garchomp'], 'Excadrill', 0, 1),
      makeLossLog('rin_sand', ['Incineroar', 'Whimsicott'], 'Tyranitar', 0, 1),
      makeLossLog('rin_sand', ['Incineroar', 'Whimsicott'], 'Excadrill', 0, 1),
      makeLossLog('rin_sand', ['Incineroar', 'Whimsicott'], 'Tyranitar', 0, 1),
      makeWinLog('rin_sand', ['Whimsicott', 'Garchomp'])
    ],
    winConditions: { 'tailwind cleanup': 1 }
  },
  suica_sun: {
    wins: 5,
    losses: 1,
    draws: 0,
    allLogs: [
      makeWinLog('suica_sun', ['Whimsicott', 'Garchomp']),
      makeWinLog('suica_sun', ['Whimsicott', 'Garchomp']),
      makeWinLog('suica_sun', ['Whimsicott', 'Garchomp']),
      makeWinLog('suica_sun', ['Whimsicott', 'Incineroar']),
      makeWinLog('suica_sun', ['Whimsicott', 'Incineroar']),
      makeLossLog('suica_sun', ['Incineroar', 'Garchomp'], 'Charizard', 0, 0)
    ],
    winConditions: { 'tailwind cleanup': 5 }
  }
};

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

console.log('\n=== strategy tab V2 render tests ===\n');

T('1. V2 report exposes matchup intelligence and BO3 adaptation', () => {
  setCurrentFormat('doubles');
  const report = csBuildStrategyReportV2('player', testResults, 'doubles');
  truthy(report.matchup_intelligence, 'matchup_intelligence should exist');
  truthy(report.bo3_adaptation, 'bo3_adaptation should exist');
  truthy(report.team_compliance, 'team_compliance should exist');
  truthy(['approved', 'provisional', 'noncompliant', 'unknown'].includes(report.team_compliance.status), 'team compliance status should be normalized');
  eq(report.matchup_intelligence.grade, 'even', 'grade should derive from aggregate results');
  truthy(report.bo3_adaptation.game1_lead, 'game1 lead should be present');
});

T('1b. V2 identity ignores loss labels when selecting the team win condition', () => {
  const mixed = {
    rin_sand: {
      wins: 1,
      losses: 4,
      draws: 0,
      allLogs: [],
      winConditions: {
        'Opponent Win': 4,
        'Tailwind cleanup': 1
      }
    }
  };
  const report = csBuildStrategyReportV2('player', mixed, 'doubles');
  eq(report.team_identity.primary_win_condition, 'Tailwind cleanup', 'loss labels must not become the team win condition');
});

T('2. trainer-facing matchup lists use names instead of internal team keys', () => {
  const report = csBuildStrategyReportV2('player', testResults, 'doubles');
  eq(report.what_is_weak.bad_matchups[0], TEAMS.rin_sand.name, 'bad matchup should use team name');
  eq(report.stress_test.worst_matchups[0], TEAMS.rin_sand.name, 'stress test worst matchup should use team name');
  eq(report.trend_analysis.failed_matchups[0], TEAMS.rin_sand.name, 'trend analysis failed matchup should use team name');
});

T('3. live Strategy tab renders Matchup Intelligence and BO3 sections after sims', () => {
  ChampionsSim.state.lastResults = testResults;
  ChampionsSim.state.lastResultsPlayerKey = 'player';
  ChampionsSim.state.lastResultsFormat = 'doubles';
  renderStrategyTab('player');
  inc(host.innerHTML, 'Matchup Intelligence', 'matchup intelligence section should render');
  inc(host.innerHTML, 'BO3 Adaptation', 'bo3 section should render');
  inc(host.innerHTML, 'Team compliance', 'team compliance note should render');
  inc(host.innerHTML, 'Data Sources', 'data source section should render');
  inc(host.innerHTML, 'Clear Strategy data', 'fresh-data clear action should render');
  inc(host.innerHTML, TEAMS.rin_sand.name, 'rendered HTML should use trainer-facing matchup names');
  if (TEAMS.rin_sand.name !== 'rin_sand') {
    notInc(host.innerHTML, 'rin_sand', 'internal team key should not leak into trainer UI');
  }
});

T('4. Strategy results are scoped to the active player team and format', () => {
  ChampionsSim.state.lastResults = testResults;
  ChampionsSim.state.lastResultsPlayerKey = 'rin_sand';
  ChampionsSim.state.lastResultsFormat = 'doubles';
  eq(Object.keys(csGetScopedStrategyResults('player', 'doubles')).length, 0, 'mismatched team results should be ignored');
  ChampionsSim.state.lastResultsPlayerKey = 'player';
  ChampionsSim.state.lastResultsFormat = 'singles';
  eq(Object.keys(csGetScopedStrategyResults('player', 'doubles')).length, 0, 'mismatched format results should be ignored');
  ChampionsSim.state.lastResultsFormat = 'doubles';
  truthy(Object.keys(csGetScopedStrategyResults('player', 'doubles')).length > 0, 'matching scoped results should be used');
});

T('5. Strategy clear removes this team from both-side local sim history', () => {
  csSimLogAppendSeries({
    playerKey: 'player',
    oppKey: 'rin_sand',
    format: 'doubles',
    bo: 1,
    battleResults: [{ result: 'win', turns: 3, leads: { player: ['A'], opponent: ['B'] }, bring: { player: ['A'], opponent: ['B'] } }],
    seriesResult: 'win'
  });
  csSimLogAppendSeries({
    playerKey: 'rin_sand',
    oppKey: 'player',
    format: 'doubles',
    bo: 1,
    battleResults: [{ result: 'loss', turns: 3, leads: { player: ['B'], opponent: ['A'] }, bring: { player: ['B'], opponent: ['A'] } }],
    seriesResult: 'loss'
  });
  truthy(csSimLogForTeamBothSides('player').length >= 2, 'precondition: player has both-side sim history');
  const cleared = csClearStrategyData('player', { render: false });
  eq(cleared.ok, true, 'clear result');
  eq(csSimLogForTeamBothSides('player').length, 0, 'player history should be fully cleared');
});

console.log(`\nstrategy tab V2 render tests: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
