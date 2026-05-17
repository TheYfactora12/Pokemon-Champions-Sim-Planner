// T196 - Coach Recommends state machine + live render coverage

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
        if (on === undefined) this._set.has(c) ? this._set.delete(c) : this._set.add(c);
        else if (on) this._set.add(c);
        else this._set.delete(c);
      },
      contains(c){ return this._set.has(c); }
    },
    appendChild(child) {
      this._children.push(child);
      if (Array.isArray(this.options) && child && String(child.tagName || '').toUpperCase() === 'OPTION') this.options.push(child);
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
    getAttribute(name){ return this[name] || null; },
    setAttribute(name, value){ this[name] = value; },
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
      if (!els[id]) els[id] = makeStubEl(id && id.indexOf('select') >= 0 ? 'select' : 'div');
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
  'this.renderStrategyTab = renderStrategyTab;',
  'this.csBuildCoachRecommendation = csBuildCoachRecommendation;',
  'this.csRenderCoachRecommendationCard = csRenderCoachRecommendationCard;',
  'this.csStoreTeamRunSnapshot = csStoreTeamRunSnapshot;',
  'this.setCurrentFormat = setCurrentFormat;'
].join(' '), ctx);

const { TEAMS, ChampionsSim, renderSourcesTab, renderStrategyTab, csBuildCoachRecommendation, csRenderCoachRecommendationCard, csStoreTeamRunSnapshot, setCurrentFormat } = ctx;
const sourcesHost = ctx.document.getElementById('sources-list');
const strategyHost = ctx.document.getElementById('strategy-content');

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
  if (actual !== expected) throw new Error((msg || 'values differ') + ` expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function truthy(value, msg) {
  if (!value) throw new Error(msg || 'expected truthy');
}

function inc(hay, needle, msg) {
  if (String(hay).indexOf(needle) < 0) throw new Error((msg || 'missing substring') + `: ${needle}`);
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
    winConditions: { 'Tailwind cleanup': 3 }
  };
}

function makeReplayMatch(status, allowsSimComparison) {
  return {
    status,
    allowsSimComparison,
    confidence: 'medium',
    summary: status === 'different_team'
      ? 'Replay does not look like the current simulated team.'
      : 'Replay looks like the same team as the current simulated team.',
    recommendedNextStep: allowsSimComparison
      ? 'Sim comparison can use this session team snapshot.'
      : 'Run a sim with this team first.'
  };
}

console.log('\n=== coach recommends tests ===\n');

T('1. no sim snapshot recommends running a sim first', () => {
  const rec = csBuildCoachRecommendation();
  eq(rec.id, 'run_sim_first', 'recommendation id');
  eq(rec.actionTarget, 'simulator', 'action target');
  inc(rec.message, 'simulation', 'message should explain why');
});

T('2. sim snapshot without replay recommends uploading a replay next', () => {
  setCurrentFormat('doubles');
  csStoreTeamRunSnapshot('player', 'rin_sand', 'doubles', 3, 'test');
  const rec = csBuildCoachRecommendation();
  eq(rec.id, 'upload_replay_next', 'recommendation id');
  eq(rec.actionTarget, 'replay-coach', 'target');
});

T('3. different-team replay recommends returning to simulator', () => {
  ChampionsSim.state.lastReplayCoachAnalysis = {
    review: {
      learningReport: {
        simComparison: {
          replayTeamMatch: makeReplayMatch('different_team', false),
          confidence: 'medium'
        }
      }
    }
  };
  const rec = csBuildCoachRecommendation();
  eq(rec.id, 'replay_wrong_team', 'recommendation id');
  eq(rec.actionTarget, 'simulator', 'target');
});

T('4. stale snapshot after team change recommends rerun before claiming improvement', () => {
  vm.runInContext('currentPlayerKey = "rin_sand";', ctx);
  const rec = csBuildCoachRecommendation();
  eq(rec.id, 'rerun_after_team_change', 'stale snapshot should win');
  eq(rec.actionTarget, 'simulator', 'target');
  vm.runInContext('currentPlayerKey = "player";', ctx);
});

T('5. matched replay recommends reviewing sim vs replay', () => {
  ChampionsSim.state.lastReplayCoachAnalysis = {
    review: {
      learningReport: {
        simComparison: {
          replayTeamMatch: makeReplayMatch('same_team', true),
          confidence: 'medium'
        }
      }
    }
  };
  const rec = csBuildCoachRecommendation();
  eq(rec.id, 'review_sim_vs_replay', 'recommendation id');
  eq(rec.actionTarget, 'replay-coach', 'target');
  inc(csRenderCoachRecommendationCard(rec), 'Coach Recommends', 'card should render shared title');
});

T('6. live Sources and Strategy renders include Coach Recommends', () => {
  ChampionsSim.state.lastResults = { rin_sand: makeScopedSimResult() };
  ChampionsSim.state.lastResultsPlayerKey = 'player';
  ChampionsSim.state.lastResultsFormat = 'doubles';
  renderSourcesTab('player');
  renderStrategyTab('player');
  inc(sourcesHost.innerHTML, 'Coach Recommends', 'sources should render card');
  inc(strategyHost.innerHTML, 'Coach Recommends', 'strategy should render card');
});

console.log(`\ncoach recommends: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
