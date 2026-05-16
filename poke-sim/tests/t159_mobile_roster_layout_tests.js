// Issue #159 - mobile roster rows must wrap cleanly without type-chip overlap.

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

console.log('\n=== mobile roster layout tests ===\n');

T('1. roster rows wrap on narrow screens', () => {
  inc(css, '@media(max-width:620px){');
  inc(css, '.poke-row{flex-wrap:wrap;align-items:flex-start;padding:10px 10px}');
});

T('2. type chips become a wrapped horizontal row on mobile', () => {
  inc(css, '.type-chips{flex-direction:row;flex-wrap:wrap;justify-content:flex-start;align-items:flex-start;gap:4px;flex:1 1 100%;margin-left:46px;margin-top:2px}');
  inc(css, '.type-chip{font-size:9px;line-height:1.2;padding:2px 6px;white-space:nowrap;max-width:100%}');
});

T('3. stats button becomes full width on mobile roster rows', () => {
  inc(css, '.team-mon-detail-btn{width:100%;margin-top:8px}');
});

T('4. compact bring chips can wrap long names on mobile', () => {
  inc(css, '.bring-pool-chip{flex:0 0 auto;max-width:100%}');
  inc(css, '.bring-pool-chip-name{white-space:normal;overflow-wrap:break-word;line-height:1.1}');
});

console.log(`\nmobile roster layout: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
