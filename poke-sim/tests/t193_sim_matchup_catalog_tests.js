// T193 - simulator opponent catalog + exhaustive plan coverage

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
  'this.rebuildTeamSelects = rebuildTeamSelects;',
  'this.getOrderedTeamKeys = getOrderedTeamKeys;',
  'this.getOrderedOpponentTeamKeys = getOrderedOpponentTeamKeys;',
  'this.buildFormatAwareTeamPlans = buildFormatAwareTeamPlans;',
  'this.runAllMatchupsUI = runAllMatchupsUI;',
  'this.setCurrentFormat = setCurrentFormat;',
  'this.ChampionsSim = ChampionsSim;'
].join(' '), ctx);

const playerSel = ctx.document.getElementById('player-select');
const oppSel = ctx.document.getElementById('opponent-select');
playerSel.value = 'player';
oppSel.value = 'mega_altaria';

function addCustomTeam(key, name, memberSourceKey) {
  const sourceTeam = ctx.TEAMS[memberSourceKey];
  ctx.TEAMS[key] = {
    name,
    source: 'custom',
    members: sourceTeam.members.map((m) => Object.assign({}, m))
  };
}

addCustomTeam('custom_alpha', 'Alpha Custom', 'player');
addCustomTeam('custom_beta', 'Beta Custom', 'mega_altaria');

const {
  TEAMS,
  rebuildTeamSelects,
  getOrderedTeamKeys,
  getOrderedOpponentTeamKeys,
  buildFormatAwareTeamPlans,
  runAllMatchupsUI,
  setCurrentFormat,
  ChampionsSim
} = ctx;

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

async function TA(name, fn) {
  try {
    await fn();
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

async function main() {
  console.log('\n=== simulator matchup catalog tests ===\n');

  T('1. player and opponent dropdowns list custom teams first', () => {
    rebuildTeamSelects();
    const playerKeys = playerSel.options.map((opt) => opt.value);
    const opponentKeys = oppSel.options.map((opt) => opt.value);
    eq(playerKeys[0], 'custom_alpha', 'custom team should lead player dropdown');
    eq(playerKeys[1], 'custom_beta', 'second custom team should follow');
    eq(opponentKeys[0], 'custom_alpha', 'custom team should lead opponent dropdown');
    eq(opponentKeys[1], 'custom_beta', 'second custom team should follow');
    truthy(!opponentKeys.includes('player'), 'opponent dropdown should exclude current player team');
  });

  T('2. opponent dropdown excludes whichever team is selected as the player', () => {
    playerSel.value = 'custom_alpha';
    rebuildTeamSelects();
    const opponentKeys = oppSel.options.map((opt) => opt.value);
    truthy(!opponentKeys.includes('custom_alpha'), 'selected player team must not appear as opponent');
    eq(opponentKeys[0], 'custom_beta', 'next custom team should remain first');
  });

  T('3. format-aware team plans enumerate full legal bring/lead combinations', () => {
    setCurrentFormat('doubles');
    const doublesPlans = buildFormatAwareTeamPlans('player', 'doubles');
    eq(doublesPlans.length, 90, 'doubles plan count');
    eq(doublesPlans[0].lead.length, 2, 'doubles lead size');
    eq(doublesPlans[0].bring.length, 4, 'doubles bring size');

    setCurrentFormat('singles');
    const singlesPlans = buildFormatAwareTeamPlans('player', 'singles');
    eq(singlesPlans.length, 60, 'singles plan count');
    eq(singlesPlans[0].lead.length, 1, 'singles lead size');
    eq(singlesPlans[0].bring.length, 3, 'singles bring size');
  });

  await TA('4. run-all iterates the full ordered opponent catalog and forwards exhaustive player plans', async () => {
    setCurrentFormat('singles');
    playerSel.value = 'player';
    rebuildTeamSelects();
    const expectedOpponents = getOrderedOpponentTeamKeys('player', { includePlayer: false, ladderOnly: false });
    vm.runInContext([
      '__runAllCalls = [];',
      'runBoSeries = async function(numSeries, playerTeamKey, oppTeamKey, bo, onProgress, opts) {',
      '  __runAllCalls.push({',
      '    numSeries: numSeries,',
      '    playerTeamKey: playerTeamKey,',
      '    oppTeamKey: oppTeamKey,',
      '    bo: bo,',
      '    format: opts && opts.format,',
      '    playerPlanCount: Array.isArray(opts && opts.playerPlans) ? opts.playerPlans.length : 0',
      '  });',
      '  if (onProgress) onProgress(1, 1, 0, 0);',
      '  return { winRate: 0.5, wins: 1, losses: 1, draws: 0, avgTurns: 5, avgTrTurns: 0 };',
      '};'
    ].join('\n'), ctx);

    const completed = [];
    await runAllMatchupsUI(1, 3, null, (oppKey) => completed.push(oppKey));

    eq(ctx.__runAllCalls.length, expectedOpponents.length, 'run-all should visit every eligible opponent');
    eq(completed.length, expectedOpponents.length, 'completion callback should fire per opponent');
    eq(ctx.__runAllCalls[0].oppTeamKey, expectedOpponents[0], 'first opponent should match ordered catalog');
    eq(ctx.__runAllCalls[1].oppTeamKey, expectedOpponents[1], 'second opponent should match ordered catalog');
    eq(ctx.__runAllCalls[0].playerPlanCount, 60, 'singles exhaustive plan count should be forwarded');
    eq(ctx.__runAllCalls[0].format, 'singles', 'run-all should preserve active format');
    eq(ChampionsSim.state.lastRunAllOpponentKeys.join('|'), expectedOpponents.join('|'), 'state should store full opponent sweep');
    eq(ChampionsSim.state.lastRunAllPlayerPlans.length, 60, 'state should store full singles plan catalog');
  });

  console.log(`\nsimulator matchup catalog tests: ${pass} pass, ${fail} fail\n`);
  process.exitCode = fail ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
