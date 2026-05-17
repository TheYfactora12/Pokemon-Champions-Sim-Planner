// T198 - Minimal auth state + persistence scoping

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
    options: [],
    selectedOptions: [],
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    appendChild(child) { this._children.push(child); return child; },
    addEventListener(type, fn) { (this._listeners[type] = this._listeners[type] || []).push(fn); },
    querySelector(){ return makeStubEl(); },
    querySelectorAll(){ return []; },
    getAttribute(name){ return this[name] || null; },
    setAttribute(name, value){ this[name] = value; }
  };
}

function makeDocument() {
  const els = {};
  return {
    _els: els,
    documentElement: makeStubEl('html'),
    body: makeStubEl('body'),
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
  'this.csRememberAuthState = csRememberAuthState;',
  'this.csGetAuthState = csGetAuthState;',
  'this.csStoreTeamRunSnapshot = csStoreTeamRunSnapshot;',
  'this.csBuildPersistableTeamRunSnapshot = csBuildPersistableTeamRunSnapshot;',
  'this.csBuildSourcesProvenanceModel = csBuildSourcesProvenanceModel;',
  'this.setCurrentFormat = setCurrentFormat;'
].join(' '), ctx);

const { csRememberAuthState, csGetAuthState, csStoreTeamRunSnapshot, csBuildPersistableTeamRunSnapshot, csBuildSourcesProvenanceModel, setCurrentFormat } = ctx;

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

console.log('\n=== auth session tests ===\n');

T('1. auth state is stored and exposes premium tier', () => {
  csRememberAuthState({
    authenticated: true,
    user_id: 'user-123',
    email: 'premium@test.local',
    access_tier: 'premium',
    is_premium: true
  });
  const auth = csGetAuthState();
  eq(auth.user_id, 'user-123', 'user id');
  eq(auth.is_premium, true, 'premium flag');
});

T('1b. premium must not be inferred from client-controlled user metadata', () => {
  const adapterSrc = fs.readFileSync(path.join(ROOT, 'supabase_adapter.js'), 'utf8');
  if (adapterSrc.includes('userMeta.subscription_tier') || adapterSrc.includes('userMeta.role')) {
    throw new Error('resolveAccessTier still trusts user_metadata');
  }
});

T('2. team profile persistence bundle is scoped to signed-in user', () => {
  setCurrentFormat('doubles');
  const snapshot = csStoreTeamRunSnapshot('player', 'rin_sand', 'doubles', 3, 'test');
  const bundle = csBuildPersistableTeamRunSnapshot(snapshot);
  truthy(bundle && bundle.teamProfile, 'team profile bundle');
  eq(bundle.teamProfile.user_id, 'user-123', 'team profile should inherit authenticated user');
});

T('3. Sources provenance exposes guest vs signed-in profile access', () => {
  let model = csBuildSourcesProvenanceModel('player');
  let card = (model.cards || []).find((row) => row.title === 'Profile access');
  truthy(card, 'profile access card');
  eq(card.status, 'premium', 'signed-in premium status');
  csRememberAuthState(null);
  model = csBuildSourcesProvenanceModel('player');
  card = (model.cards || []).find((row) => row.title === 'Profile access');
  eq(card.status, 'guest', 'guest status');
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
