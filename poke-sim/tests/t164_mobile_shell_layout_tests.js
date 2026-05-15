// T9j.16 — mobile shell layout tests
//
// Coverage targets:
//   1. header stacks and the format toggle spans full width on mobile
//   2. tabs compress their spacing and remain finger-friendly
//   3. dense cards stack their headers and full-width actions on small screens
//   4. summary tables keep a horizontal scroll escape hatch
//   5. strategy / audit grids collapse on narrow viewports

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

console.log('\n=== mobile shell layout tests ===\n');

T('1. header and format controls stack cleanly on mobile', () => {
  inc(css, '@media(max-width:720px){');
  inc(css, '.header-right{width:100%;display:grid;grid-template-columns:minmax(0,1fr) 34px;gap:8px;align-items:stretch}');
  inc(css, '.format-toggle{width:100%;min-width:0}');
  inc(css, '.fmt-pill-btn{width:100%;justify-content:center}');
});

T('2. tab bar keeps touch-friendly spacing on narrow screens', () => {
  inc(css, '.tab-nav{padding:0 var(--sp2)}');
  inc(css, '.tab-btn{padding:10px 12px;min-height:40px;font-size:12px}');
});

T('3. dense cards and actions collapse to one column on mobile', () => {
  inc(css, '@media(max-width:620px){');
  inc(css, '.card-header,.results-header,.replay-card-hdr,.tfcard-header,.pilot-card-header,.strategy-header-row,.strategy-controls,.cs-summary-bar,.cs-adaptive-row,.team-detail-head,.replay-filters-row{flex-direction:column;align-items:flex-start}');
  inc(css, '.card-action-btn,.btn-secondary,.btn-primary,.export-card-btn{width:100%;justify-content:center}');
});

T('4. summary tables and detail views keep an overflow escape hatch', () => {
  inc(css, '.series-summary-table{min-width:540px}');
  inc(css, '.table-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}');
  inc(css, '.team-detail-fields{grid-template-columns:1fr}');
});

T('5. strategy and audit grids collapse on narrow screens', () => {
  inc(css, '.cs-cat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}');
  inc(css, '.engine-row{grid-template-columns:1fr;gap:4px}');
  inc(css, '.audit-grid {');
});

console.log(`\nmobile shell layout: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
