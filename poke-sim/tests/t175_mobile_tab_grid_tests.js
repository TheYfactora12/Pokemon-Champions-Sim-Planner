// Narrow windows should see wrapped tab navigation instead of a sideways scroll rail.

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

T('1. narrow windows use a wrapped tab grid', () => {
  inc(css, '@media(max-width:760px){');
  inc(css, '.tab-nav{');
  inc(css, 'display:grid;');
  inc(css, 'grid-template-columns:repeat(auto-fit,minmax(96px,1fr));');
  inc(css, 'overflow:visible;');
  inc(css, '.tab-btn{');
  inc(css, 'white-space:normal;');
  inc(css, 'text-align:center;');
});

T('2. the phone picker still takes over only on true phone widths', () => {
  inc(css, '@media(max-width:480px){');
  inc(css, '.tab-nav{display:none}');
  inc(css, '.mobile-tab-picker{display:block;padding:0 var(--sp3) var(--sp3)}');
});

console.log(`\nmobile tab grid: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
