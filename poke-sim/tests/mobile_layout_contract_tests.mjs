import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
assert.match(css, /@media\(max-width:700px\)\{\s*\.sim-layout\{grid-template-columns:minmax\(0,1fr\)\}/);
assert.match(css, /grid-column:auto;grid-row:auto;order:unset;position:static/);
assert.match(css, /\.bring-slots\{display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
assert.doesNotMatch(css, /\.audit-table\{[^}]*min-width:520px/);
console.log('Mobile CSS contracts passed (browser geometry verification remains required).');
