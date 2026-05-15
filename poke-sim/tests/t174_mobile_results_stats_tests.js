// Narrow-window results summary must collapse instead of stretching horizontally.

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

console.log('\n=== mobile results stats tests ===\n');

T('1. results header and grid collapse on narrow windows', () => {
  inc(css, '@media(max-width:700px){');
  inc(css, '.results-header{flex-direction:column;align-items:flex-start}');
  inc(css, '.results-grid{display:grid;grid-template-columns:1fr;gap:var(--sp3)}');
  inc(css, '.win-circle-wrap{width:100%;display:flex;justify-content:center}');
  inc(css, '.charts-row{display:grid;grid-template-columns:1fr;gap:var(--sp3)}');
});

T('2. stats cards reflow into compact columns', () => {
  inc(css, '.stats-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}');
  inc(css, '.stat-card{min-width:0;padding:10px 8px}');
  inc(css, '.stat-card .stat-value{font-size:clamp(16px,4vw,24px);line-height:1.05;word-break:break-word}');
  inc(css, '.stat-card .stat-label{font-size:10px;line-height:1.2}');
});

T('3. tiny screens fall back to a single stat column', () => {
  inc(css, '@media(max-width:420px){');
  inc(css, '.stats-grid{grid-template-columns:1fr}');
  inc(css, '.stat-card{display:flex;align-items:baseline;justify-content:space-between;gap:8px}');
  inc(css, '.stat-card .stat-value{font-size:18px}');
});

console.log(`\nmobile results stats: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
