// Issue #96 follow-up - phones should use a compact tab picker instead of the desktop tab row.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'ui.js'), 'utf8');

let pass = 0, fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}
function inc(hay, needle, msg='') {
  if (String(hay).indexOf(needle) < 0) throw new Error((msg || 'missing') + ': ' + needle);
}

console.log('\n=== mobile tab picker tests ===\n');

T('1. phone widths hide the tab strip and show the picker', () => {
  inc(css, '@media(max-width:480px){');
  inc(css, '.tab-nav{display:none}');
  inc(css, '.mobile-tab-picker{display:block;padding:0 var(--sp3) var(--sp3)}');
  inc(css, '.mobile-tab-picker .select-input{font-size:12px;font-weight:700}');
});

T('2. the picker includes every main section', () => {
  inc(html, '<div class="mobile-tab-picker" aria-label="Main sections">');
  ['simulator','overview','teams','editor','strategy','replay-coach','replays','sources','pilot'].forEach(function(tab) {
    inc(html, '<option value="' + tab + '">');
  });
});

T('3. tab activation keeps the picker and tab state synced', () => {
  inc(js, "var mobileTabSelect = document.getElementById('mobile-tab-select');");
  inc(js, "if (mobileTabSelect && mobileTabSelect.value !== activeTabId) mobileTabSelect.value = activeTabId;");
  inc(js, "mobileTabSelect.addEventListener('change', function() {");
});

console.log(`\nmobile tab picker: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
