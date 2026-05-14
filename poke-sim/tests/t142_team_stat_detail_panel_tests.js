// Issue #142 - Teams tab read-only Pokemon stat detail panel.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function makeStubEl() {
  return {
    addEventListener(){}, removeEventListener(){}, appendChild(){}, removeChild(){},
    setAttribute(){}, getAttribute(){ return null; },
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    style: {}, dataset: {}, innerHTML: '', textContent: '', value: '',
    options: [], children: [], selectedOptions: [], parentNode: null,
    firstElementChild: null,
    querySelector: () => makeStubEl(),
    querySelectorAll: () => [],
    click(){}, focus(){}, blur(){}
  };
}

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

function load(file) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
}

load('data.js');
load('engine.js');
load('storage_adapter.js');
load('ui.js');
vm.runInContext([
  'this.TEAMS=TEAMS;',
  'this.Pokemon=Pokemon;',
  'this.buildTeamStatDetailModel=buildTeamStatDetailModel;',
  'this.renderTeamStatDetailHtml=renderTeamStatDetailHtml;'
].join('\n'), ctx);

const buildTeamStatDetailModel = ctx.buildTeamStatDetailModel;
const renderTeamStatDetailHtml = ctx.renderTeamStatDetailHtml;
const ui = fs.readFileSync(path.join(ROOT, 'ui.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');

ctx.TEAMS.__detail_fixture = {
  name: 'Detail Fixture',
  style: 'balance',
  format: 'sv',
  members: [{
    name: 'Garchomp',
    item: 'Choice Scarf',
    ability: 'Rough Skin',
    nature: 'Jolly',
    level: 50,
    evs: { hp:4, atk:252, def:0, spa:0, spd:0, spe:252 },
    ivs: { hp:31, atk:31, def:31, spa:31, spd:31, spe:31 },
    moves: ['Earthquake', 'Dragon Claw', 'Protect', 'Rock Slide']
  }]
};

let pass = 0, fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}
function eq(a, b, msg) {
  if (a !== b) throw new Error((msg || 'expected equality') + ': got ' + a + ', expected ' + b);
}
function truthy(v, msg) {
  if (!v) throw new Error(msg || 'expected truthy');
}
function inc(hay, needle, msg='') {
  if (String(hay).indexOf(needle) < 0) throw new Error((msg || 'missing') + ': ' + needle);
}

console.log('\n=== team stat detail panel tests ===\n');

T('1. model includes all required stat fields', () => {
  const model = buildTeamStatDetailModel('__detail_fixture', 'Garchomp');
  truthy(model, 'model should exist');
  ['baseStats', 'evs', 'ivs', 'finalStats'].forEach(group => {
    ['hp', 'atk', 'def', 'spa', 'spd', 'spe'].forEach(key => truthy(model[group][key] !== undefined, group + '.' + key));
  });
});

T('2. final stats use engine Pokemon formula', () => {
  const model = buildTeamStatDetailModel('__detail_fixture', 'Garchomp');
  const mon = new ctx.Pokemon(ctx.TEAMS.__detail_fixture.members[0], 'balance', 'sv');
  eq(model.finalStats.hp, mon.maxHp, 'hp');
  eq(model.finalStats.atk, mon.baseAtk, 'atk');
  eq(model.finalStats.spe, mon.baseSpe, 'spe');
  eq(model.finalStats.total, mon.maxHp + mon.baseAtk + mon.baseDef + mon.baseSpa + mon.baseSpd + mon.baseSpe, 'total');
});

T('3. rendered modal exposes all acceptance fields', () => {
  const html = renderTeamStatDetailHtml(buildTeamStatDetailModel('__detail_fixture', 'Garchomp'));
  ['Base', 'EV', 'IV', 'Final', 'Ability', 'Item', 'BST', 'Total', 'Moves', 'Roles', 'Dragon / Ground', 'Garchomp'].forEach(s => inc(html, s));
  ['Earthquake', 'Dragon Claw', 'Protect', 'Rock Slide', 'Rough Skin', 'Choice Scarf', 'Jolly'].forEach(s => inc(html, s));
});

T('4. Teams tab rows render Details buttons', () => {
  inc(ui, 'team-mon-detail-btn');
  inc(ui, 'openTeamStatDetailPanel(btn.dataset.team, btn.dataset.mon, btn)');
});

T('5. modal supports close button, Escape, and focus trap wiring', () => {
  inc(ui, 'id="team-detail-close"');
  inc(ui, "ev.key === 'Escape'");
  inc(ui, "ev.key !== 'Tab'");
  inc(ui, 'aria-modal="true"');
});

T('6. stylesheet includes responsive modal classes', () => {
  ['.team-detail-backdrop', '.team-detail-modal', '.team-detail-table', '@media(max-width:620px)'].forEach(s => inc(css, s));
});

console.log(`\nteam stat detail panel: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
