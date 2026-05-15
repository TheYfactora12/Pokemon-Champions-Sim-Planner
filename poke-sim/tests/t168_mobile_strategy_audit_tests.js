// Issue #96 follow-up - strategy and audit surfaces must stay readable on mobile.

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

console.log('\n=== mobile strategy/audit layout tests ===\n');

T('1. strategy summary stacks and shrinks on phones', () => {
  inc(css, '@media(max-width:640px){');
  inc(css, '.strategy-header-row,.strategy-controls,.cs-summary-bar,.cs-detector-team-conf,.replay-filters-row,.pilot-card-header{flex-direction:column;align-items:flex-start}');
  inc(css, '.cs-summary-bar{gap:12px;padding:12px}');
  inc(css, '.cs-tier-badge{width:44px;height:44px;font-size:20px}');
  inc(css, '.cs-score{font-size:26px}');
});

T('2. strategy grids collapse to one column', () => {
  inc(css, '.cs-cat-grid,.cs-lead-grid,.radar-grid,.breakdown-grid,.steps-grid,.editor-2col,.moves-2col,.team-detail-fields,.stat-panel-grid,.audit-grid{grid-template-columns:1fr}');
  inc(css, '.cs-section,.audit-card,.pilot-card,.replay-card,.team-full-card,.editor-form,.editor-sidebar{padding:var(--sp3)}');
  inc(css, '.cs-detector-row,.cs-detector-row-loss,.cs-detector-row-dead{grid-template-columns:1fr;gap:4px}');
});

T('3. audit and replay surfaces keep a horizontal escape hatch', () => {
  inc(css, '.audit-meta-row{flex-direction:column;align-items:flex-start;gap:2px}');
  inc(css, '.audit-table{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch;min-width:520px}');
  inc(css, '.replay-v2-tools{grid-template-columns:1fr}');
  inc(css, '.replay-hp-bars{grid-template-columns:1fr}');
  inc(css, '.source-table{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch;min-width:520px}');
});

T('4. team labels and bring slots stop truncating on mobile', () => {
  inc(css, '.tfcard-name,.tfcard-meta,.poke-full-name,.poke-full-detail,.bring-slot-name{overflow-wrap:anywhere;word-break:break-word}');
  inc(css, '.bring-slot-name{white-space:normal;text-overflow:clip}');
  inc(css, '.bring-slot{min-height:80px}');
});

console.log(`\nmobile strategy/audit layout: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
