// Issue #96 follow-up - the simulator shell should be mobile-first, not desktop-first.

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

console.log('\n=== mobile sim structure tests ===\n');

T('1. controls lead the phone layout before team cards', () => {
  inc(css, '@media(hover:none) and (pointer:coarse) and (max-width:900px){.sim-layout{grid-template-columns:1fr}');
  inc(css, '.sim-layout .sim-controls{order:1}.sim-layout .player-card{order:2}.sim-layout .opp-card{order:3}');
  inc(css, '.team-card,.player-card,.opp-card,.sim-controls{min-width:0}');
});

T('1b. fine-pointer desktop keeps a compact split-screen layout', () => {
  inc(css, '@media(max-width:900px) and (hover:hover) and (pointer:fine){');
  inc(css, '.sim-layout{grid-template-columns:minmax(0,1fr) 180px;gap:var(--sp3)}');
  inc(css, '.sim-layout .sim-controls{grid-column:2;grid-row:1 / span 2;position:sticky;top:var(--sp4)}');
});

T('2. coverage is secondary on phones', () => {
  inc(html, '<div class="coverage-widget" id="coverage-widget">');
  inc(css, '@media(max-width:560px){');
  inc(css, '.coverage-widget{display:none}');
});

T('3. mobile controls still keep full-width action affordances', () => {
  inc(css, '.card-action-btn,.btn-secondary,.btn-primary,.export-card-btn{width:100%;justify-content:center}');
  inc(css, '.sim-controls{gap:var(--sp3)}');
});

console.log(`\nmobile sim structure: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
