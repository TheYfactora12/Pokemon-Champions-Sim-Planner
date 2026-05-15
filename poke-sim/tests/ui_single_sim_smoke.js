// UI smoke test: real script order + Run Simulation button.
// This catches bundle/preview regressions where the engine works but the page does not simulate.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { runMechanicsSmoke } = require('./mechanics_audit_cases');

const ROOT = path.resolve(__dirname, '..');

function stubEl(id) {
  const el = {
    id: id || '',
    style: {},
    dataset: {},
    options: [],
    children: [],
    value: id === 'sim-count' ? '10' : (id === 'opponent-select' ? 'mega_altaria' : ''),
    textContent: '',
    innerHTML: '',
    disabled: false,
    className: '',
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    addEventListener(ev, fn) { this['on' + ev] = fn; },
    removeEventListener() {},
    appendChild(child) { this.children.push(child); return child; },
    prepend(child) { this.children.unshift(child); return child; },
    setAttribute() {},
    getAttribute() { return null; },
    querySelector() { return stubEl('query'); },
    querySelectorAll() { return []; },
    focus() {},
    blur() {},
    click() { if (this.onclick) return this.onclick.call(this, { target: this }); },
    getContext() {
      return {
        clearRect(){}, fillRect(){}, beginPath(){}, roundRect(){}, fill(){}, stroke(){},
        fillText(){}, moveTo(){}, lineTo(){}, arc(){}, closePath(){}, save(){}, restore(){},
        setTransform(){}, measureText(){ return { width: 10 }; }
      };
    }
  };
  return el;
}

const ids = {};
const document = {
  getElementById(id) { return ids[id] || (ids[id] = stubEl(id)); },
  querySelector() { return stubEl('query'); },
  querySelectorAll() { return []; },
  addEventListener() {},
  removeEventListener() {},
  body: stubEl('body'),
  documentElement: stubEl('html'),
  head: stubEl('head'),
  createElement(tag) { return stubEl(tag); },
  createTextNode(text) { return { nodeType: 3, textContent: text }; }
};
document.documentElement.dataset = { theme: 'dark' };

const window = {
  __SUPABASE_URL__: '',
  __SUPABASE_KEY__: '',
  matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){} })
};
window.window = window;
window.document = document;

const ctx = {
  console, require, module: {}, exports: {}, Math, Object, Array, Set, JSON,
  Promise, setTimeout, clearTimeout, Date, String, Number, Boolean, Map, Error, RegExp,
  Symbol, parseFloat, parseInt, isFinite,
  window,
  document,
  navigator: { serviceWorker: { register() { return Promise.resolve(); } } },
  localStorage: {
    _s: {},
    getItem(k) { return this._s[k] || null; },
    setItem(k, v) { this._s[k] = String(v); },
    removeItem(k) { delete this._s[k]; }
  },
  addEventListener() {},
  removeEventListener() {},
  matchMedia: window.matchMedia,
  Blob: function(parts) { this.parts = parts; },
  URL: { createObjectURL() { return 'blob:test'; }, revokeObjectURL() {} }
};

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
  'ui.js',
  'legality.js',
  'strategy-injectable.js'
].forEach(load);

vm.runInContext('this.runButton = document.getElementById("run-sim-btn");', ctx);

async function main() {
  const btn = ctx.runButton;
  if (!btn || typeof btn.onclick !== 'function') throw new Error('Run Simulation click handler missing');
  await btn.onclick.call(btn, { target: btn });
  await new Promise(resolve => setTimeout(resolve, 80));

  const progress = ids['progress-label'] && ids['progress-label'].textContent;
  const winPct = ids['win-pct'] && ids['win-pct'].textContent;
  const resultsDisplay = ids['results-section'] && ids['results-section'].style.display;

  if (/^Simulation failed/.test(progress || '')) throw new Error(progress);
  if (!winPct || !/%$/.test(winPct)) throw new Error('win percentage did not render');
  if (resultsDisplay === 'none') throw new Error('results section stayed hidden');

  runMechanicsSmoke(ctx.simulateBattle);

  const auditPanel = ids['audit-panel'] && ids['audit-panel'].innerHTML;
  if (!auditPanel || !/Battle Audit/.test(auditPanel)) throw new Error('audit panel did not render');

  console.log('  PASS UI Run Simulation smoke rendered', winPct);
}

main().catch(err => {
  console.log('  FAIL UI Run Simulation smoke -', err.message);
  process.exit(1);
});
