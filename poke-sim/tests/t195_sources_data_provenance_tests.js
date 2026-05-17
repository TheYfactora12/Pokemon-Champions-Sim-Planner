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
  'this.setCurrentFormat = setCurrentFormat;'
].join(' '), ctx);

const { TEAMS, ChampionsSim, renderSourcesTab, _activateTab, setCurrentFormat } = ctx;
const host = ctx.document.getElementById('sources-list');

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

console.log(`\nsources data provenance render tests: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
