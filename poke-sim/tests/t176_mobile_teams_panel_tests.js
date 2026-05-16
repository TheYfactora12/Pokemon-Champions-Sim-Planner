// Narrow windows should present the Teams panel as a single-column, scan-friendly layout.

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

console.log('\n=== mobile teams panel tests ===\n');

T('1. Teams panel content exists in the app shell', () => {
  inc(html, '<section class="tab-panel" id="tab-teams">');
  inc(html, '<div class="teams-tab-header">');
  inc(html, '<div class="teams-grid" id="teams-grid"></div>');
});

T('1b. narrow phone teams use the compact picker path', () => {
  inc(String(fs.readFileSync(path.join(ROOT, 'ui.js'), 'utf8')), 'function shouldUseCompactTeamsPicker()');
  inc(String(fs.readFileSync(path.join(ROOT, 'ui.js'), 'utf8')), 'buildBringPickerHtml(key, { compact: compactTeamsPicker })');
});

T('2. narrow widths collapse the Teams panel into one column', () => {
  inc(css, '@media(max-width:760px){');
  inc(css, '.teams-actions{');
  inc(css, 'flex-direction:column;');
  inc(css, '.teams-grid{');
  inc(css, 'grid-template-columns:1fr;');
  inc(css, '.team-full-card{');
  inc(css, 'padding:var(--sp3);');
});

T('3. team cards and controls reflow for narrow cards', () => {
  inc(css, '.tfcard-header{');
  inc(css, 'flex-direction:column;');
  inc(css, '.tfcard-badges{');
  inc(css, 'flex-wrap:wrap;');
  inc(css, '.poke-full-row{');
  inc(css, 'flex-wrap:wrap;');
  inc(css, '.poke-full-name{');
  inc(css, 'flex-direction:column;');
  inc(css, '.poke-full-item,');
  inc(css, 'overflow-wrap:break-word;');
  inc(css, '.team-mon-detail-btn{');
  inc(css, 'width:100%;');
});

console.log(`\nmobile teams panel: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
