// Issue #151 - public UI surfaces must escape imported/custom team text.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function stubEl() {
  return {
    addEventListener(){},
    removeEventListener(){},
    appendChild(child){ this.children.push(child); return child; },
    removeChild(){},
    setAttribute(){},
    getAttribute(){ return null; },
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    style: {},
    dataset: {},
    innerHTML: '',
    textContent: '',
    value: '',
    options: [],
    children: [],
    selectedOptions: [],
    parentNode: null,
    querySelector: () => stubEl(),
    querySelectorAll: () => [],
    click(){},
    focus(){},
    blur(){}
  };
}

const roster = stubEl();
roster.appendChild = function(child) {
  this.children.push(child);
  this.innerHTML += child && child.innerHTML ? child.innerHTML : '';
  return child;
};
const preview = stubEl();
const previewRoster = stubEl();
previewRoster.appendChild = function(child) {
  this.children.push(child);
  this.innerHTML += child && child.innerHTML ? child.innerHTML : '';
  return child;
};
const editorForm = stubEl();
const oppSelect = stubEl();
oppSelect.value = 'opp_team';

const els = {
  'player-roster': roster,
  'preview-roster': previewRoster,
  'import-preview': preview,
  'editor-form': editorForm,
  'opponent-select': oppSelect
};

const ctx = {
  console, require, module: {}, exports: {}, Math, Object, Array, Set, JSON,
  Promise, setTimeout, setInterval, clearInterval, clearTimeout, Date,
  String, Number, Boolean, RegExp, parseInt, parseFloat,
  window: { matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){} }) },
  matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){} }),
  document: {
    documentElement: stubEl(),
    body: stubEl(),
    activeElement: stubEl(),
    getElementById: (id) => els[id] || stubEl(),
    querySelector: () => stubEl(),
    querySelectorAll: () => [],
    createElement: () => stubEl(),
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
  alert(){},
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
  'this.renderRoster=renderRoster;',
  'this.showImportPreview=showImportPreview;',
  'this.openEditorForm=openEditorForm;',
  'this.buildBringPickerHtml=buildBringPickerHtml;',
  'this.TEAMS=TEAMS;',
  'this.currentPlayerKey=currentPlayerKey;',
  'this.currentFormat=currentFormat;'
].join('\n'), ctx);

let pass = 0, fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}
function inc(hay, needle, msg='') {
  if (String(hay).indexOf(needle) < 0) throw new Error((msg || 'missing') + ': ' + needle);
}
function falsy(v, msg='') { if (v) throw new Error(msg || 'expected falsy'); }

console.log('\n=== public UI XSS tests ===\n');

ctx.TEAMS.player = {
  name: '<img src=x onerror=alert(1)>',
  members: [{
    name: '<svg/onload=alert(2)>',
    item: '"><script>alert(3)</script>',
    ability: '<b>Ability</b>',
    nature: 'Jolly',
    level: 50,
    moves: ['<script>alert(4)</script>'],
    evs: { hp: 4, atk: 252, spe: 252 }
  }]
};
ctx.TEAMS.opp_team = {
  name: 'Opponent',
  members: ctx.TEAMS.player.members
};

T('1. renderRoster escapes hostile member text', () => {
  ctx.renderRoster('player-roster', ctx.TEAMS.player.members);
  inc(roster.innerHTML, '&lt;svg/onload=alert(2)&gt;');
  inc(roster.innerHTML, '&lt;script&gt;alert(4)&lt;/script&gt;');
  falsy(roster.innerHTML.includes('<svg/onload=alert(2)>'), 'raw member name leaked');
});

T('2. showImportPreview escapes hostile preview text', () => {
  ctx.showImportPreview(ctx.TEAMS.player.members);
  inc(previewRoster.innerHTML, '&lt;svg/onload=alert(2)&gt;');
  inc(previewRoster.innerHTML, '&quot;&gt;&lt;script&gt;alert(3)&lt;/script&gt;');
});

T('3. openEditorForm escapes hostile editor fields', () => {
  ctx.TEAMS.player.members[0].name = '<marquee>bad</marquee>';
  ctx.openEditorForm(0);
  inc(editorForm.innerHTML, '&lt;marquee&gt;bad&lt;/marquee&gt;');
  inc(editorForm.innerHTML, '&quot;&gt;&lt;script&gt;alert(3)&lt;/script&gt;');
});

T('4. buildBringPickerHtml escapes hostile names in markup', () => {
  ctx.currentFormat = 'doubles';
  const html = ctx.buildBringPickerHtml('player', { compact: true });
  inc(html, '&lt;marquee&gt;bad&lt;/marquee&gt;');
  falsy(html.includes('<marquee>bad</marquee>'), 'raw marquee leaked');

  const full = ctx.buildBringPickerHtml('player', { compact: false });
  inc(full, '&quot;&gt;&lt;script&gt;alert(3)&lt;/script&gt;');
  falsy(full.includes('"><script>alert(3)</script>'), 'raw script tag leaked');
});

console.log(`\npublic UI XSS: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
