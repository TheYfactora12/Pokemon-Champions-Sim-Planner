// T9j.17 — mobile content-fit tests
//
// Coverage targets:
//   1. images scale down instead of forcing horizontal scroll
//   2. team cards and badge stacks wrap on narrow screens
//   3. replay / audit / strategy text breaks before overflowing
//   4. compact chips and tags can wrap instead of stretching a row
//   5. narrow modal/table views keep a fallback escape hatch

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

console.log('\n=== mobile content-fit tests ===\n');

T('1. images use fluid sizing by default', () => {
  inc(css, 'img{max-width:100%;height:auto;display:block}');
});

T('2. card headers and badge stacks can wrap on mobile', () => {
  inc(css, '.tfcard-badges{width:100%;align-items:flex-start;flex-wrap:wrap;gap:4px}');
  inc(css, '.tfcard-badges .export-card-btn,.tfcard-badges .edit-card-btn,.tfcard-badges .reset-card-btn,.tfcard-badges .delete-card-btn{width:100%;margin-left:0}');
});

T('3. long text is forced to break before it can overflow', () => {
  inc(css, '.replay-title,.replay-meta,.tfcard-name,.tfcard-meta,.pilot-card-title,.pilot-leads,.cs-summary-line,.cs-explain,.cs-champ-pov,.audit-meta-row,.audit-table,.cs-threat-why,.cs-threat-play{overflow-wrap:anywhere;word-break:break-word}');
  inc(css, '.move-tag,.rchip,.team-detail-chip,.cs-chip,.teams-filter-chip,.team-mon-detail-btn,.stat-panel-pill,.speed-val{white-space:normal}');
});

T('4. dense grids collapse to one column on small screens', () => {
  inc(css, '.audit-grid{grid-template-columns:1fr}');
  inc(css, '.cs-cat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}');
});

T('5. narrow modal/table views retain overflow escape hatches', () => {
  inc(css, '.table-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}');
  inc(css, '.team-detail-table{min-width:0}');
});

console.log(`\nmobile content-fit: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
