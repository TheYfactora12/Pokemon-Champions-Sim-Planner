// Issue #94 - renderTeamsGrid must escape imported team text.

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

const teamsGrid = makeStubEl();
teamsGrid.appendChild = function(child) {
  this.children.push(child);
  this.innerHTML += child && child.innerHTML ? child.innerHTML : '';
  return child;
};
const banner = makeStubEl();
const filterRow = makeStubEl();
const ctx = {
  console, require, module: {}, exports: {}, Math, Object, Array, Set, JSON,
  Promise, setTimeout, setInterval, clearInterval, clearTimeout, Date,
  String, Number, Boolean, RegExp, parseInt, parseFloat,
  window: { matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){} }) },
  matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){} }),
  document: {
    documentElement: makeStubEl(),
    body: makeStubEl(),
    activeElement: makeStubEl(),
    getElementById: (id) => {
      if (id === 'teams-grid') return teamsGrid;
      if (id === 'teams-persistence-banner') return banner;
      if (id === 'teams-filter-row') return filterRow;
      return makeStubEl();
    },
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

function load(file) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
}

load('data.js');
load('engine.js');
load('storage_adapter.js');
load('ui.js');
vm.runInContext([
  'this.renderTeamsGrid=renderTeamsGrid;',
  'this.TEAMS=TEAMS;'
].join('\n'), ctx);

const renderTeamsGrid = ctx.renderTeamsGrid;

let pass = 0, fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}
function inc(hay, needle, msg='') {
  if (String(hay).indexOf(needle) < 0) throw new Error((msg || 'missing') + ': ' + needle);
}
function falsy(v, msg='') { if (v) throw new Error(msg || 'expected falsy'); }

console.log('\n=== team grid XSS tests ===\n');

ctx.TEAMS.__xss_fixture = {
  name: '<img src=x onerror=alert(1)>',
  style: 'balance',
  description: '"><script>alert(1)</script>',
  label: '<svg/onload=alert(2)>',
  source: 'custom',
  legality_status: 'legal',
  format: 'champions',
  members: [{
    name: 'Garchomp',
    item: 'Leftovers',
    ability: 'Rough Skin',
    nature: 'Jolly',
    level: 50,
    evs: { hp: 4, atk: 252, spe: 252 },
    moves: ['Earthquake', 'Protect']
  }]
};

T('1. renderTeamsGrid escapes hostile team name and description', () => {
  vm.runInContext('TEAMS_FILTER = "custom";', ctx);
  renderTeamsGrid();
  inc(teamsGrid.innerHTML, '&lt;img src=x onerror=alert(1)&gt;');
  inc(teamsGrid.innerHTML, '&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;');
  inc(teamsGrid.innerHTML, '&lt;svg/onload=alert(2)&gt;');
  falsy(teamsGrid.innerHTML.includes('<img src=x onerror=alert(1)>'), 'raw image tag leaked');
});

console.log(`\nteam grid XSS: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
