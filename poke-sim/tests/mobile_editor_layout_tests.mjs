import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';

const css = fs.readFileSync(new URL('../style.css', import.meta.url), 'utf8');
test('editor tracks and controls can shrink without clipping content', () => {
  assert.match(css, /grid-template-columns:260px minmax\(0,1fr\)/);
  assert.match(css, /\.editor-layout>\*\{min-width:0\}/);
  assert.match(css, /\.editor-form \.form-input\{min-width:0;width:100%;box-sizing:border-box\}/);
  assert.match(css, /\.ev-6col\{display:grid;grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
  assert.match(css, /\.ev-6col\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
});
