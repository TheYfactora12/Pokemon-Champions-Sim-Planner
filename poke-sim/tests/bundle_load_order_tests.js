// Bundle load-order regression tests.
// Ensures legality globals are initialized before UI initial render calls validateTeam().

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function makeStubEl() {
  return {
    addEventListener(){}, removeEventListener(){}, appendChild(child){ this.children.push(child); return child; }, removeChild(){},
    setAttribute(){}, getAttribute(){ return null; },
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    style: {}, dataset: {}, innerHTML: '', textContent: '', value: '',
    options: [], children: [], selectedOptions: [], parentNode: null,
    querySelector: () => makeStubEl(),
    querySelectorAll: () => [],
    click(){}, focus(){}, blur(){}
  };
}

const ctx = {
  console, require, module: {}, exports: {}, Math, Object, Array, Set, JSON,
  Promise, setTimeout, setInterval, clearInterval, clearTimeout, Date,
  String, Number, Boolean, RegExp, parseInt, parseFloat, isFinite,
  window: {
    __DISABLE_SUPABASE__: true,
    __SUPABASE_URL__: '',
    __SUPABASE_KEY__: '',
    matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){} })
  },
  matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){} }),
  document: {
    documentElement: makeStubEl(),
    body: makeStubEl(),
    activeElement: makeStubEl(),
    getElementById: () => makeStubEl(),
    querySelector: () => makeStubEl(),
    querySelectorAll: () => [],
    createElement: () => makeStubEl(),
    addEventListener(){},
    removeEventListener(){}
  },
  localStorage: { getItem(){ return null; }, setItem(){}, removeItem(){}, clear(){} },
  navigator: { userAgent: 'node' },
  location: { href: 'http://localhost/' },
  fetch: () => Promise.reject(new Error('no network in tests')),
  URL: { createObjectURL(){ return 'blob:stub'; }, revokeObjectURL(){} },
  Blob: function(parts){ this.parts = parts; },
  FileReader: function(){},
  alert(){}
};
ctx.self = ctx.window;
ctx.globalThis = ctx;
vm.createContext(ctx);

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function runBundleLike(files) {
  vm.runInContext(files.map(read).join('\n\n'), ctx, { filename: 'bundle-load-order.js' });
}

let pass = 0;
let fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}
function truthy(value, msg) {
  if (!value) throw new Error(msg || 'expected truthy');
}

console.log('\n=== bundle load-order tests ===\n');

T('1. bundled load initializes legality before UI initial render', () => {
  runBundleLike([
    'data.js',
    'logger.js',
    'engine.js',
    'storage_adapter.js',
    'supabase_adapter.js',
    'generated/pokemon_showdown_legal_data.js',
    'move_legality.js',
    'replay_coach.js',
    'replay_learning.js',
    'legality.js',
    'ui.js',
    'strategy-injectable.js'
  ]);
  truthy(typeof ctx.validateChampionsLegality === 'function', 'Champions legality function missing');
  truthy(vm.runInContext('FAKEMON_BLOCKLIST instanceof Set', ctx), 'FAKEMON_BLOCKLIST not initialized');
  truthy(vm.runInContext('CHAMPIONS_BANNED_ITEMS instanceof Set', ctx), 'CHAMPIONS_BANNED_ITEMS not initialized');
  const verdict = vm.runInContext('validateTeam(TEAMS.player, "vgc")', ctx);
  truthy(verdict && Array.isArray(verdict.errors), 'validateTeam did not return expected shape');
});

console.log(`\nbundle load-order: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
