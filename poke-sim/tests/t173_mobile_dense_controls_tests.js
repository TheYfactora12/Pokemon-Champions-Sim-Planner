// Issue #96 follow-up - dense phone controls should collapse into one column.

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

console.log('\n=== mobile dense controls tests ===\n');

T('1. teams and bring controls collapse into single-column rows', () => {
  inc(css, '.teams-filter-row,.bring-mode-row,.replay-filters-row,.team-detail-head,.strategy-header-row,.pilot-card-header,.cs-summary-bar,.cs-detector-team-conf{flex-direction:column;align-items:flex-start}');
  inc(css, '.teams-filter-row,.bring-mode-row,.replay-filters-row,.strategy-controls,.pilot-card-body{width:100%}');
  inc(css, '.teams-filter-chip,.bring-mode-btn,.team-mon-detail-btn{width:100%;justify-content:center}');
});

T('2. bring slots and grids compress hard on narrow phones', () => {
  inc(css, '.bring-slots{grid-template-columns:repeat(2,minmax(0,1fr))}');
  inc(css, '@media(max-width:420px){');
  inc(css, '.tab-nav{grid-template-columns:1fr}');
  inc(css, '.bring-slots{grid-template-columns:1fr}');
});

T('3. tables and detail cards keep a narrow-phone fallback', () => {
  inc(css, '.team-detail-fields{grid-template-columns:1fr}');
  inc(css, '.team-detail-table{min-width:0}');
  inc(css, '.team-detail-table th,.team-detail-table td{padding:6px 4px;font-size:9px}');
  inc(css, '.team-full-card,.replay-card,.pilot-card,.cs-section,.editor-form,.editor-sidebar{padding:var(--sp2)}');
});

console.log(`\nmobile dense controls: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
