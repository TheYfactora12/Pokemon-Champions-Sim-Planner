import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const ui = readFileSync(new URL('../ui.js', import.meta.url), 'utf8');
const download = ui.slice(ui.indexOf('function downloadReplayTurnLog('), ui.indexOf('function csBuildReplayCoachingSummary('));
assert(download.includes('_downloadBlob('), 'Replay export must reuse the retained-URL download helper');
assert(!download.includes('URL.revokeObjectURL'), 'Replay export must not immediately revoke its download');

const start = ui.indexOf('function csReplayCardClick(');
assert(start >= 0, 'Replay expansion needs an independently testable interaction guard');
const end = ui.indexOf('\nfunction ', start + 1);
const ctx = vm.createContext({});
vm.runInContext(ui.slice(start, end), ctx);
let toggles = 0;
const card = { classList: { toggle(name) { assert.equal(name, 'open'); toggles++; } } };
ctx.csReplayCardClick(card, { target: { closest: () => ({}) } });
assert.equal(toggles, 0, 'Nested controls must not toggle the replay');
ctx.csReplayCardClick(card, { target: { closest: () => null } });
assert.equal(toggles, 1, 'Card background still toggles replay');
console.log('Replay download lifecycle and nested interaction guards passed');
