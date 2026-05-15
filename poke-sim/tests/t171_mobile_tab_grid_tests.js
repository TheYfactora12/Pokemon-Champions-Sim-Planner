// Issue #96 follow-up - mobile tabs should wrap instead of requiring horizontal swipe.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');

let pass = 0, fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}
function inc(hay, needle, msg='') {
  if (String(hay).indexOf(needle) < 0) throw new Error((msg || 'missing') + ': ' + needle);
}

console.log('\n=== mobile tab grid tests ===\n');

T('1. phone-width tabs switch to a wrapped grid', () => {
  inc(css, '@media(max-width:560px){');
  inc(css, '.tab-nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));padding:0;overflow-x:visible}');
  inc(css, '.tab-btn{white-space:normal;text-align:center;padding:8px 6px;min-height:44px;font-size:11px;border-bottom:1px solid var(--border)}');
});

T('2. mobile tabs no longer depend on swipe scrolling', () => {
  inc(css, '.tab-nav::-webkit-scrollbar{display:none}');
  inc(css, '.tab-nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))');
});

T('3. mobile title stack and tab grid can coexist', () => {
  inc(css, '.site-title{display:flex;flex-wrap:wrap;align-items:center;gap:4px}');
  inc(css, '.build-version,.db-offline-chip{margin-left:0}');
});

console.log(`\nmobile tab grid: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
