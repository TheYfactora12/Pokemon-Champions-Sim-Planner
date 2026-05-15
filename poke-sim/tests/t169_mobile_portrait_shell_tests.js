// Issue #96 follow-up - portrait mobile shell must stack before it overflows.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

let pass = 0, fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}
function inc(hay, needle, msg='') {
  if (String(hay).indexOf(needle) < 0) throw new Error((msg || 'missing') + ': ' + needle);
}

console.log('\n=== mobile portrait shell tests ===\n');

T('1. top header stacks on narrow portrait widths', () => {
  inc(css, '@media(max-width:560px){');
  inc(css, '.header-right{display:flex;flex-direction:column;align-items:stretch;width:100%;gap:8px}');
  inc(css, '.format-toggle{width:100%;flex-wrap:wrap}');
  inc(css, '.fmt-btn{flex:1 1 calc(50% - 4px);min-width:0;white-space:normal;line-height:1.15}');
  inc(css, '.btn-icon{align-self:flex-end}');
});

T('2. format banner becomes a full-width stack', () => {
  inc(css, '.format-banner-inner{flex-direction:column;align-items:flex-start}');
  inc(css, '.fmt-indicator,.fmt-source,.fmt-pill-btn{width:100%}');
  inc(css, '.fmt-pill-btn{white-space:normal;line-height:1.2}');
  inc(css, '.fmt-div{display:none}');
});

T('3. title chips wrap instead of forcing one line', () => {
  inc(css, '.site-title{display:flex;flex-wrap:wrap;align-items:center;gap:4px}');
  inc(css, '.build-version,.db-offline-chip{margin-left:0}');
  inc(html, 'id="db-offline-chip"');
});

console.log(`\nmobile portrait shell: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
