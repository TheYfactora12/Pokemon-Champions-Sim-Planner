const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const reportPath = path.join(ROOT, 'reports', 'champion_parity_100_checklist.md');

let pass = 0;
let fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (err) { console.log('  FAIL', name, '-', err.message); fail++; }
}
function inc(haystack, needle, msg) {
  if (String(haystack).indexOf(needle) < 0) throw new Error((msg || 'missing') + ': ' + needle);
}

console.log('\n=== Champion parity checklist tests ===\n');

T('1. checklist defines practical 100 percent gate and current status', () => {
  const report = fs.readFileSync(reportPath, 'utf8');
  inc(report, '# Champion Parity 100 Checklist');
  inc(report, 'release gate, not a claim');
  inc(report, 'v2.1.37-damage-log-team-catalog');
  inc(report, '56/56');
  inc(report, '120 verified');
  inc(report, '0 baseline');
  inc(report, '0 incomplete');
});

T('2. checklist keeps source-truth architecture and open proof gaps visible', () => {
  const report = fs.readFileSync(reportPath, 'utf8');
  inc(report, 'Mechanics live in `engine.js`');
  inc(report, 'Supabase should not be used as the live damage calculator');
  inc(report, 'GitHub Pages `?v=<new-sha>`');
  inc(report, 'single-run log');
  inc(report, 'Run All log');
  inc(report, 'QA Artifact');
  inc(report, 'Alfredo Pages deployment remains blocked');
});

console.log(`\nChampion parity checklist: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
