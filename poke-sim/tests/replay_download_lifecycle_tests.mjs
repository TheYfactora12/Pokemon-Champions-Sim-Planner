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

const elements = new Map();
function element(tag) {
  return { tagName: tag.toUpperCase(), style: {}, children: [],
    appendChild(child) {
      if (child.parentNode) child.parentNode.removeChild(child);
      this.children.push(child); child.parentNode = this;
      if (child.id) elements.set(child.id, child);
    },
    removeChild(child) { this.children.splice(this.children.indexOf(child), 1); child.parentNode = null; elements.delete(child.id); },
    click() {}, setAttribute() {}
  };
}
const body = element('body'), hiddenProgress = element('div'), replayPanel = element('section');
elements.set('progress-wrap', hiddenProgress);
let activePanel = replayPanel;
const revoked = [];
let sequence = 0;
const exportCtx = vm.createContext({
  CS_LAST_DOWNLOAD_URL: null,
  document: { body, createElement: element, getElementById: id => elements.get(id), querySelector: () => activePanel },
  URL: { createObjectURL: () => 'blob:' + (++sequence), revokeObjectURL: url => revoked.push(url) },
  Blob: class { constructor(parts) { this.parts = parts; } }, setTimeout() {},
  UILog: { warn() {} }, alert(message) { throw new Error(message); },
  csQaDropFolderSupported: () => true, csSaveTextToQaDropFolder: async () => true
});
const exportStart = ui.indexOf('function _downloadBlob(');
const helperStart = ui.indexOf('function csDownloadNotice(');
vm.runInContext(ui.slice(helperStart >= 0 ? helperStart : exportStart,
  ui.indexOf("document.getElementById('bulk-export-json-btn')", exportStart)), exportCtx);
exportCtx._downloadBlob('first.json', 'application/json', '{}');
assert.equal(elements.get('download-ready-link').parentNode, replayPanel, 'Fallback belongs in the active tab, not hidden progress');
await exportCtx._saveQaArtifactBlob('folder.json', 'application/json', '{}');
assert.equal(elements.get('download-ready-link').tagName, 'SPAN', 'Folder success is not an old download link');
activePanel = element('section');
exportCtx._downloadBlob('second.json', 'application/json', '{}');
const link = elements.get('download-ready-link');
assert.equal(link.tagName, 'A');
assert.equal(link.parentNode, activePanel);
assert.equal(link.download, 'second.json');
assert.equal(link.href, 'blob:2');
assert.deepEqual(revoked, ['blob:1']);
console.log('Download fallback placement, folder/browser transition and URL lifetime passed');
