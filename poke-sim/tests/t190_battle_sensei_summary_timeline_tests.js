// Issue #190 - Battle Sensei summary and turn timeline stay mobile-safe and raw log is collapsed.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
const ui = fs.readFileSync(path.join(ROOT, 'ui.js'), 'utf8');

let pass = 0;
let fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}
function inc(hay, needle, msg='') {
  if (String(hay).indexOf(needle) < 0) throw new Error((msg || 'missing') + ': ' + needle);
}

console.log('\n=== Battle Sensei summary/timeline UI tests ===\n');

T('1. Battle Sensei remains a separate tab from Strategy', () => {
  inc(html, 'data-tab="replay-coach">Battle Sensei');
  inc(html, '<section class="tab-panel" id="tab-replay-coach">');
  inc(html, '<section class="tab-panel" id="tab-strategy">');
  inc(html, '<script src="replay_learning.js"></script>');
});

T('2. summary renders selected-four confidence and team preview read', () => {
  inc(ui, '<strong>Bring Confidence</strong>');
  inc(ui, '<h3 class="replay-coach-h3">Team Preview Read</h3>');
  inc(ui, '<strong>Opponent Four</strong>');
  inc(ui, 'selectedFourConfidence');
});

T('3. timeline renders coaching read, better line, severity, and confidence', () => {
  inc(ui, 'review.turnTimeline');
  inc(ui, 'replay-coach-turn-read');
  inc(ui, 'replay-coach-better-line');
  inc(ui, "turn.severity || 'neutral'");
  inc(ui, "turn.confidence || 'medium'");
});

T('4. coaching tags explain decision impact, not just labels', () => {
  inc(ui, '<b>What happened:</b>');
  inc(ui, '<b>Why it mattered:</b>');
  inc(ui, '<b>Do instead:</b>');
  inc(ui, 'Confidence:');
  inc(ui, 'Evidence:');
});

T('5. learning report renders scorecard, critical turns, win path, and practice plan', () => {
  inc(ui, 'learningReport');
  inc(ui, '<h3 class="replay-coach-h3">Battle IQ Score</h3>');
  inc(ui, '<strong>Battle IQ</strong>');
  inc(ui, '<strong>What this means</strong>');
  inc(ui, '<h3 class="replay-coach-h3">Critical Turn Engine</h3>');
  inc(ui, '<h3 class="replay-coach-h3">Decision Quality Scorecard</h3>');
  inc(ui, '<h3 class="replay-coach-h3">Win Path + Opponent Plan</h3>');
  inc(ui, '<h3 class="replay-coach-h3">Practice Plan</h3>');
  inc(ui, '<h3 class="replay-coach-h3">Battle IQ Memory Preview</h3>');
  inc(ui, 'Privacy boundary');
});

T('6. raw log preview is collapsed and hidden by default', () => {
  inc(ui, '<details class="replay-coach-raw"><summary>Raw log preview hidden by default');
  inc(ui, 'rawLogPreview');
  inc(css, '.replay-coach-raw-log{margin-top:10px;white-space:pre-wrap;max-height:260px}');
});

T('7. timeline styles stay card-based and mobile-safe', () => {
  inc(css, '.replay-coach-turn.high');
  inc(css, '.replay-coach-turn.medium');
  inc(css, '.replay-coach-turn.low');
  inc(css, '@media(max-width:900px){.replay-coach-grid{grid-template-columns:1fr}');
  inc(css, '.replay-coach-summary-grid{grid-template-columns:1fr}');
});

console.log(`\nBattle Sensei summary/timeline UI: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
