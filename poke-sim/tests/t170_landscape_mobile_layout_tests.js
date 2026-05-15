// Issue #96 follow-up - landscape phones and small tablets need a compact shell.

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

console.log('\n=== landscape mobile layout tests ===\n');

T('1. simulator keeps horizontal structure on landscape tablets/phones', () => {
  inc(css, '@media(min-width:701px) and (max-width:900px) and (orientation:landscape){');
  inc(css, '.sim-layout{grid-template-columns:minmax(0,1fr) 180px minmax(0,1fr);gap:var(--sp3)}');
  inc(css, '.sim-controls{position:sticky;top:var(--sp4)}');
});

T('2. header compresses instead of squashing the app bar', () => {
  inc(css, '.header-inner{padding:10px var(--sp3)}');
  inc(css, '.logo-block{gap:10px}');
  inc(css, '.site-title{font-size:var(--text-base);line-height:1.12}');
  inc(css, '.format-toggle{max-width:420px}');
});

T('3. landscape still trims card padding and tab spacing', () => {
  inc(css, '.tab-nav{padding:0 var(--sp3)}');
  inc(css, '.tab-btn{padding:10px 10px;min-height:40px;font-size:12px}');
  inc(css, '.team-card,.results-section,.about-card,.pilot-card,.team-full-card,.replay-card,.cs-section,.stat-panel,.editor-sidebar,.editor-form{padding:var(--sp3)}');
});

console.log(`\nlandscape mobile layout: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
