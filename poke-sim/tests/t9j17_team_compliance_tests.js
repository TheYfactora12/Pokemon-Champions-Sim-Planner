// Team compliance tests for Battle IQ / Champion gating.

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function makeStubEl() {
  return {
    _children: [],
    _listeners: {},
    innerHTML: '',
    textContent: '',
    value: '',
    style: {},
    dataset: {},
    options: [],
    selectedOptions: [],
    selectedIndex: 0,
    hidden: false,
    disabled: false,
    classList: {
      _set: new Set(),
      add(c){ this._set.add(c); },
      remove(c){ this._set.delete(c); },
      toggle(c, on){ on === undefined ? (this._set.has(c) ? this._set.delete(c) : this._set.add(c)) : (on ? this._set.add(c) : this._set.delete(c)); },
      contains(c){ return this._set.has(c); }
    },
    appendChild(c){ this._children.push(c); return c; },
    addEventListener(){},
    querySelector(){ return makeStubEl(); },
    querySelectorAll(){ return []; },
    getAttribute(){ return null; },
    setAttribute(){},
    focus(){},
    blur(){},
    click(){},
    dispatchEvent(){}
  };
}

const ctx = {
  console,
  require,
  module: {},
  exports: {},
  Math,
  Object,
  Array,
  Set,
  JSON,
  Promise,
  setTimeout,
  setInterval,
  clearInterval,
  clearTimeout,
  Date,
  window: { matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} }), print: () => {} },
  matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} }),
  document: {
    _els: {},
    getElementById(id) { if (!this._els[id]) this._els[id] = makeStubEl(); return this._els[id]; },
    querySelector(){ return makeStubEl(); },
    querySelectorAll(){ return []; },
    createElement(){ return makeStubEl(); },
    body: makeStubEl(),
    addEventListener(){},
    documentElement: makeStubEl()
  },
  localStorage: { _s: {}, getItem(k){ return this._s[k] !== undefined ? this._s[k] : null; }, setItem(k, v){ this._s[k] = String(v); }, removeItem(k){ delete this._s[k]; }, clear(){ this._s = {}; } },
  URL: { createObjectURL(){ return 'blob:stub'; }, revokeObjectURL(){} },
  Blob: function(parts){ this.parts = parts; },
  FileReader: function(){},
  alert: () => {},
  navigator: { userAgent: 'node' },
  location: { href: 'http://localhost/' },
  fetch: () => Promise.reject(new Error('no network in tests'))
};
ctx.self = ctx.window;
ctx.globalThis = ctx;
vm.createContext(ctx);

function load(f) { vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }); }
load('data.js');
load('legality.js');
load('engine.js');
load('storage_adapter.js');
load('ui.js');

vm.runInContext([
  'this.TEAMS=TEAMS;',
  'this.csInferRulesetProfile=csInferRulesetProfile;',
  'this.csEvaluateTeamCompliance=csEvaluateTeamCompliance;',
  'this.csCapConfidenceTierByCompliance=csCapConfidenceTierByCompliance;'
].join(' '), ctx);

const { TEAMS, csInferRulesetProfile, csEvaluateTeamCompliance, csCapConfidenceTierByCompliance } = ctx;

let pass = 0;
let fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}
function eq(actual, expected, msg) {
  if (actual !== expected) throw new Error((msg || 'expected equality') + ': got ' + actual + ', expected ' + expected);
}
function truthy(value, msg) {
  if (!value) throw new Error(msg || 'expected truthy');
}

console.log('\n=== Battle IQ compliance tests ===\n');

T('approved Champion teams pass compliance checks', () => {
  TEAMS.__temp_ok__ = {
    format: 'champions',
    legality_status: 'legal',
    members: [
      { name: 'Dragonite', item: 'Dragoninite', ability: 'Multiscale', moves: ['Tailwind', 'Protect'] },
      { name: 'Archaludon', item: 'Leftovers', ability: 'Stamina', moves: ['Electro Shot', 'Protect'] }
    ]
  };
  const compliance = csEvaluateTeamCompliance('__temp_ok__', csInferRulesetProfile('champions', TEAMS.__temp_ok__), {
    sample_size: 12,
    log_source: 'team_grid'
  });
  eq(compliance.status, 'approved', 'approved status');
  eq(compliance.confidence, 'high', 'approved confidence');
  truthy(compliance.gating.allow_champion_coaching, 'approved gating');
  truthy(compliance.gating.allow_champion_norm_training, 'approved gating norms');
  delete TEAMS.__temp_ok__;
});

T('provisional Champion teams stay guarded', () => {
  TEAMS.__temp_prov__ = {
    format: 'champions',
    legality_status: 'legal_inferred',
    members: [
      { name: 'Dragonite', item: 'Dragoninite', ability: 'Multiscale', moves: ['Tailwind', 'Protect'] }
    ]
  };
  const compliance = csEvaluateTeamCompliance('__temp_prov__', csInferRulesetProfile('champions', TEAMS.__temp_prov__), {
    sample_size: 3,
    log_source: 'team_grid'
  });
  eq(compliance.status, 'provisional', 'provisional status');
  eq(compliance.confidence, 'medium', 'provisional confidence');
  eq(csCapConfidenceTierByCompliance('elite', compliance), 'high', 'confidence cap');
  delete TEAMS.__temp_prov__;
});

T('generic teams cannot be treated as Champion-legal', () => {
  TEAMS.__temp_bad__ = {
    format: 'sv',
    legality_status: 'legal',
    members: [
      { name: 'Incineroar', item: 'Sitrus Berry', ability: 'Intimidate', moves: ['Fake Out', 'Protect'] }
    ]
  };
  const compliance = csEvaluateTeamCompliance('__temp_bad__', csInferRulesetProfile('champions', TEAMS.__temp_bad__), {
    sample_size: 12,
    log_source: 'team_grid'
  });
  eq(compliance.status, 'noncompliant', 'noncompliant status');
  truthy(compliance.violations.some((v) => v.code === 'generic_gen9_as_champion'), 'generic champion violation');
  eq(compliance.gating.allow_champion_coaching, false, 'champion coaching blocked');
  delete TEAMS.__temp_bad__;
});

T('unknown teams stay unknown', () => {
  const compliance = csEvaluateTeamCompliance('__missing__', csInferRulesetProfile('champions', null), {
    sample_size: 0,
    log_source: 'parser_only'
  });
  eq(compliance.status, 'unknown', 'unknown status');
  eq(compliance.confidence, 'low', 'unknown confidence');
});

if (fail) {
  console.error('\n' + fail + ' failed, ' + pass + ' passed');
  process.exit(1);
}

console.log('\nAll Battle IQ compliance tests passed (' + pass + ').');
