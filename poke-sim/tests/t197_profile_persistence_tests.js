// T197 - Team profile persistence bundle contract

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function makeStubEl(tagName) {
  return {
    tagName: String(tagName || 'div').toUpperCase(),
    _listeners: {},
    _children: [],
    style: {},
    dataset: {},
    innerHTML: '',
    textContent: '',
    value: '',
    disabled: false,
    hidden: false,
    checked: false,
    selectedIndex: 0,
    options: [],
    selectedOptions: [],
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    appendChild(child) { this._children.push(child); return child; },
    removeChild(){},
    addEventListener(type, fn) { (this._listeners[type] = this._listeners[type] || []).push(fn); },
    removeEventListener(){},
    dispatchEvent(evt) {
      const list = (evt && evt.type && this._listeners[evt.type]) || [];
      list.forEach((fn) => fn.call(this, evt));
    },
    querySelector(){ return makeStubEl(); },
    querySelectorAll(){ return []; },
    getAttribute(name){ return this[name] || null; },
    setAttribute(name, value){ this[name] = value; },
    focus(){},
    blur(){},
    click(){}
  };
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
load('replay_learning.js');
load('ui.js');

vm.runInContext([
  'this.ChampionsSim = ChampionsSim;',
  'this.csStoreTeamRunSnapshot = csStoreTeamRunSnapshot;',
  'this.csBuildReplayHistoryBundle = csBuildReplayHistoryBundle;',
  'this.csPersistReplayHistoryBundle = csPersistReplayHistoryBundle;',
  'this.setCurrentFormat = setCurrentFormat;'
].join(' '), ctx);

const { ChampionsSim, csStoreTeamRunSnapshot, csBuildReplayHistoryBundle, csPersistReplayHistoryBundle, setCurrentFormat } = ctx;

let pass = 0;
let fail = 0;

function T(name, fn) {
  Promise.resolve().then(fn).then(() => {
    console.log('  PASS', name);
    pass++;
  }).catch((err) => {
    console.log('  FAIL', name, '-', err.message);
    fail++;
  });
}

function eq(actual, expected, msg) {
  if (actual !== expected) throw new Error((msg || 'values differ') + ` expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function truthy(value, msg) {
  if (!value) throw new Error(msg || 'expected truthy');
}

async function run() {
  console.log('\n=== profile persistence tests ===\n');

  setCurrentFormat('doubles');
  csStoreTeamRunSnapshot('player', 'rin_sand', 'doubles', 3, 'test');

  const analysis = {
    parsed: {
      battleId: 'champions-123',
      result: 'loss',
      winner: 'Opponent'
    },
    review: {
      summary: {
        format: 'doubles',
        rulesetProfile: 'champions_reg_m',
        result: 'loss',
        winner: 'Opponent',
        confidence: 'high',
        criticalTurn: 5,
        mainIssue: 'Field Control Failure',
        yourPlayer: 'You',
        opponentPlayer: 'Opponent',
        yourLead: ['Whimsicott', 'Garchomp'],
        opponentLead: ['Tyranitar', 'Excadrill'],
        yourFour: ['Whimsicott', 'Garchomp', 'Incineroar', 'Rotom-Wash'],
        opponentFour: ['Tyranitar', 'Excadrill', 'Amoonguss', 'Gholdengo']
      },
      learningReport: {
        confidence: 'high',
        battleSummary: { majorTurningPoint: 'Turn 5' },
        battleIq: { standardScore: 108, band: 'Strong', confidence: 'medium', status: 'Provisional' },
        practicePlan: { drills: [{ skill: 'Protect Timing Drill' }] },
        criticalTurns: { fatalMistake: { category: 'Field Control Failure' } },
        simComparison: {
          status: 'matched',
          comparisonStatus: 'player_execution_loss',
          calibrationAction: 'create_fixture',
          confidence: 'medium',
          evidenceTier: 'high_signal',
          evidenceLabel: 'High signal',
          leadMatch: 100,
          fourMatch: 100,
          predictedWinner: 'player',
          actualWinner: 'opponent',
          expectedWinPath: 'Tailwind cleanup',
          actualPath: 'Field Control Failure',
          firstDeviation: 'Lead/four matched; sequencing slipped later.',
          teamVsPilotDiagnosis: 'Pilot issue more likely than team issue.',
          replayTeamMatch: {
            status: 'same_team',
            similarityScore: 1,
            speciesOverlap: 1,
            formatMatch: true,
            rulesetMatch: true,
            confidence: 'high',
            overlapNames: ['Whimsicott', 'Garchomp'],
            blockers: [],
            evidence: ['6/6 species match'],
            summary: 'Replay matches the current team snapshot.',
            recommendedNextStep: 'Use Battle Sensei to compare sequencing.',
            allowsSimComparison: true
          },
          battleFacts: {
            replay: {
              playerTeamFingerprint: 'garchomp|incineroar|rotom-wash|whimsicott',
              opponentTeamFingerprint: 'amoonguss|excadrill|gholdengo|tyranitar'
            }
          },
          factComparison: { classification: 'player_execution_loss' }
        }
      }
    }
  };

  T('1. replay history bundle is summary-only and profile scoped', () => {
    const bundle = csBuildReplayHistoryBundle(analysis);
    truthy(bundle, 'bundle');
    truthy(bundle.teamProfile, 'team profile');
    truthy(bundle.teamVersion, 'team version');
    truthy(bundle.teamRunSnapshot, 'team run snapshot');
    truthy(bundle.replayArtifact, 'replay artifact');
    truthy(bundle.replaySimComparison, 'comparison');
    truthy(bundle.coachingReport, 'coaching report');
    eq(bundle.replayArtifact.raw_log_saved, false, 'raw logs must stay opt-in');
    eq(typeof bundle.replayArtifact.normalized_summary.raw, 'undefined', 'raw replay text must not be persisted');
    eq(bundle.replaySimComparison.team_profile_id, bundle.teamProfile.team_profile_id, 'comparison should be team scoped');
  });

  T('2. persistence uses adapter bundle path and records sync state', async () => {
    let captured = null;
    ctx.window.SupabaseAdapter = {
      enabled: true,
      saveReplayHistoryBundle(payload) {
        captured = payload;
        return Promise.resolve({ replay_artifact_id: payload.replayArtifact.replay_artifact_id });
      }
    };
    await csPersistReplayHistoryBundle(analysis);
    truthy(captured, 'adapter should receive bundle');
    truthy(ChampionsSim.state.lastProfilePersistence, 'profile persistence state');
    eq(ChampionsSim.state.lastProfilePersistence.status, 'replay_history_saved', 'sync state');
  });

  await new Promise((resolve) => setTimeout(resolve, 0));
  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
