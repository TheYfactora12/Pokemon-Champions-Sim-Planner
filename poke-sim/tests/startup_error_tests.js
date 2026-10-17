const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const shell = fs.readFileSync(path.join(__dirname, '..', 'app_shell.js'), 'utf8');
function load(available) {
  const nodes = { 'runtime-error-banner': { style: { display: 'none' } }, 'runtime-error-text': { textContent: '' } };
  const listeners = {};
  const root = { document: { getElementById: id => available.value ? nodes[id] : null },
    addEventListener: (event, handler) => { listeners[event] = handler; } };
  vm.runInNewContext(shell, { window: root });
  return { root, nodes, listeners };
}
const available = { value: false };
const first = load(available);
first.listeners.error({ error: { stack: 'Original startup exception' } });
available.value = true;
first.listeners.error({ message: 'Secondary tournament failure' });
assert.equal(first.nodes['runtime-error-text'].textContent, 'Original startup exception');
assert.equal(first.nodes['runtime-error-banner'].style.display, '');
first.listeners.unhandledrejection({ reason: '<img src=x onerror=alert(1)>' });
assert.equal(first.nodes['runtime-error-text'].textContent, 'Original startup exception');
const fresh = load(available);
fresh.listeners.unhandledrejection({ reason: '<img src=x onerror=alert(1)>' });
assert.equal(fresh.nodes['runtime-error-text'].textContent, '<img src=x onerror=alert(1)>');
assert.equal(fresh.nodes['runtime-error-text'].innerHTML, undefined);
fresh.listeners.error({ message: 'Later error' });
assert.equal(fresh.nodes['runtime-error-text'].textContent, '<img src=x onerror=alert(1)>');
for (const reason of [Object.create(null), { toString() { throw new Error('conversion failed'); } }]) {
  const malformed = load(available);
  assert.doesNotThrow(() => malformed.listeners.unhandledrejection({ reason }));
  assert.equal(malformed.nodes['runtime-error-text'].textContent, 'Unexpected runtime error (message unavailable)');
  malformed.listeners.error({ message: 'Later error' });
  assert.equal(malformed.nodes['runtime-error-text'].textContent, 'Unexpected runtime error (message unavailable)');
}
console.log('Startup error: 12 checks passed; first failure retained in memory/text only.');
