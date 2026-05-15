// T163 — Export My Data as JSON
//
// Coverage targets (4 cases):
//   1. HTML exposes the export button in the Saved Analyses header.
//   2. Local export payload includes sim log + cached reports for the active team.
//   3. DB-backed export payload includes analyses + nested analysis logs.
//   4. Click handler downloads a JSON file with the expected prefix.

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function makeStubEl(id) {
  return {
    id: id || '',
    style: {},
    dataset: {},
    innerHTML: '',
    textContent: '',
    value: '',
    options: [],
    selectedIndex: 0,
    className: '',
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    setAttribute(){},
    getAttribute(){ return null; },
    addEventListener(ev, fn) {
      this._listeners = this._listeners || {};
      (this._listeners[ev] = this._listeners[ev] || []).push(fn);
    },
    querySelector() { return makeStubEl('query'); },
    querySelectorAll() { return []; },
    appendChild(){},
    removeChild(){},
    click(){},
  };
}

const document = {
  _els: {},
  getElementById(id) {
    if (!this._els[id]) this._els[id] = makeStubEl(id);
    return this._els[id];
  },
  querySelector() { return makeStubEl('query'); },
  querySelectorAll() { return []; },
  createElement() { return makeStubEl('el'); },
  addEventListener() {},
  removeEventListener() {},
  body: makeStubEl('body'),
  documentElement: makeStubEl('html'),
  head: makeStubEl('head')
};

const ctx = {
  console, require, module: {}, exports: {}, Math, Object, Array, Set, JSON,
  Promise, setTimeout, clearTimeout, Date, String, Number, Boolean, Map, Error,
  RegExp, Symbol, parseFloat, parseInt, isFinite,
  window: {
    matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){} }),
    addEventListener() {},
    removeEventListener() {}
  },
  matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){} }),
  document,
  navigator: { serviceWorker: { register() { return Promise.resolve(); } } },
  localStorage: {
    _s: {},
    getItem(k) { return this._s[k] !== undefined ? this._s[k] : null; },
    setItem(k, v) { this._s[k] = String(v); },
    removeItem(k) { delete this._s[k]; },
    clear() { this._s = {}; }
  },
  URL: { createObjectURL() { return 'blob:stub'; }, revokeObjectURL() {} },
  Blob: function(parts) { this.parts = parts; },
  alert(msg) { ctx._lastAlert = msg; },
  location: { href: 'http://localhost/' }
};
ctx.self = ctx.window;
ctx.globalThis = ctx;
ctx.window.window = ctx.window;
ctx.window.document = document;
ctx.window.navigator = ctx.navigator;
ctx.window.localStorage = ctx.localStorage;
ctx.window.URL = ctx.URL;
ctx.window.Blob = ctx.Blob;
ctx.window.alert = ctx.alert;
ctx.window.location = ctx.location;

vm.createContext(ctx);

function load(file) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
}

[
  'data.js',
  'logger.js',
  'engine.js',
  'storage_adapter.js',
  'supabase_adapter.js',
  'ui.js'
].forEach(load);

vm.runInContext([
  'this.TEAMS = TEAMS;',
  'this.Storage = Storage;',
  'this.teamSignature = teamSignature;',
  'this.csBuildMyDataExport = csBuildMyDataExport;',
  'this.csExportMyDataJson = csExportMyDataJson;'
].join(' '), ctx);

const {
  TEAMS,
  Storage,
  teamSignature,
  csBuildMyDataExport,
  csExportMyDataJson
} = ctx;

let pass = 0, fail = 0;
async function T(name, fn) {
  try {
    await fn();
    console.log('  PASS', name);
    pass++;
  } catch (e) {
    console.log('  FAIL', name, '—', e.message);
    fail++;
  }
}
function eq(a, b, msg='') { if (a !== b) throw new Error(`${msg} expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }
function truthy(v, msg='') { if (!v) throw new Error(msg || 'expected truthy'); }

function seedLocalHistory() {
  const sig = teamSignature(TEAMS.player);
  Storage.set('champions_strategy_report_v1', {
    schema_version: 1,
    reports: {
      [sig]: {
        team_key: 'player',
        theory_report: { team_signature: sig, trend_analysis: { has_data: true } },
        simulation_overlay: null,
        last_built_at: '2026-05-15T10:00:00.000Z',
        last_simmed_at: '2026-05-15T10:00:00.000Z'
      }
    }
  });
  Storage.set('champions_sim_log_v1', {
    schema_version: 1,
    entries: [
      {
        id: 'sim_1',
        ts: 123,
        playerKey: 'player',
        oppKey: 'mega_altaria',
        format: 'doubles',
        bo: 3,
        games: [{ result: 'win', turns: 7, winCondition: 'speed control' }],
        seriesResult: 'win'
      }
    ]
  });
}

async function main() {
  console.log('\nExport my data (T163):');

  await T('1. index.html exposes the export-history-json button', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    truthy(/id="export-history-json-btn"/.test(html), 'export button missing');
    truthy(/Export JSON/.test(html), 'export label missing');
  });

  await T('2. local export payload includes cached reports and sim log', async () => {
    seedLocalHistory();
    ctx.window.SupabaseAdapter = { enabled: false };
    ctx.currentPlayerKey = 'player';
    const payload = await csBuildMyDataExport('player');
    eq(payload.schema_version, 1);
    eq(payload.player_team_id, 'player');
    truthy(payload.local && payload.local.reports, 'reports missing');
    truthy(payload.local && Array.isArray(payload.local.sim_log), 'sim_log missing');
    truthy(payload.local && Array.isArray(payload.local.team_history), 'team_history missing');
    truthy(payload.local.sim_log.length >= 1, 'local sim log not exported');
    truthy(payload.local.current_report, 'current_report missing');
  });

  await T('3. db export payload includes analyses and nested logs', async () => {
    ctx.window.SupabaseAdapter = {
      enabled: true,
      loadAnalysesForPlayer: async function(playerKey, limit) {
        eq(playerKey, 'player');
        eq(limit, 500);
        return [
          { analysis_id: 'a1', created_at: '2026-05-15T10:00:00.000Z', player_team_id: 'player', opp_team_id: 'mega_altaria', bo: 3, win_rate: 0.75, wins: 3, losses: 1, sample_size: 4 }
        ];
      },
      loadAnalysisLogs: async function(analysisId) {
        eq(analysisId, 'a1');
        return [
          { game_number: 1, result: 'win', turns: 8, tr_turns: 2, win_condition: 'setup' }
        ];
      }
    };
    const payload = await csBuildMyDataExport('player');
    truthy(payload.db && payload.db.enabled, 'db not marked enabled');
    eq(payload.db.analyses.length, 1, 'analysis count');
    eq(payload.db.analyses[0].analysis_id, 'a1');
    eq(payload.db.analyses[0].logs.length, 1, 'nested logs missing');
  });

  await T('4. export click downloads a JSON file with the expected prefix', async () => {
    seedLocalHistory();
    ctx.window.SupabaseAdapter = { enabled: false };
    ctx._downloaded = null;
    ctx._downloadBlob = function(filename, mime, text) {
      ctx._downloaded = { filename: filename, mime: mime, text: text };
    };
    const payload = await csExportMyDataJson('player');
    truthy(ctx._downloaded, 'download not triggered');
    truthy(/^champions-sim-my-data-/.test(ctx._downloaded.filename), 'unexpected filename');
    eq(ctx._downloaded.mime, 'application/json');
    const parsed = JSON.parse(ctx._downloaded.text);
    eq(parsed.schema_version, 1);
    eq(parsed.player_team_id, 'player');
    truthy(payload.db && Array.isArray(payload.db.analyses), 'returned payload malformed');
  });
}

main().then(() => {
  if (fail > 0) process.exit(1);
  console.log(`\nT163: ${pass}/${pass + fail} passed`);
}).catch(err => {
  console.log('  FAIL export test harness —', err.message);
  process.exit(1);
});
