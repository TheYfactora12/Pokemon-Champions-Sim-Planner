// Structured logger tests (Refs issue #89 / mirrored #33).

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

const calls = [];
const fakeConsole = {
  debug: (...args) => calls.push(['debug', args]),
  info: (...args) => calls.push(['info', args]),
  warn: (...args) => calls.push(['warn', args]),
  error: (...args) => calls.push(['error', args])
};

const ctx = {
  console: fakeConsole,
  Date,
  String,
  Error,
  Array,
  Object,
  window: { console: fakeConsole },
  globalThis: {}
};
ctx.globalThis = ctx.window;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'logger.js'), 'utf8'), ctx, { filename: 'logger.js' });

let pass = 0, fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}
function truthy(v, msg) { if (!v) throw new Error(msg || 'expected truthy'); }
function eq(a, b, msg) { if (a !== b) throw new Error((msg || 'not equal') + ' expected=' + b + ' got=' + a); }

console.log('\n=== structured logger tests ===\n');

T('1. logger mounts on ChampionsSim with warn default level', () => {
  truthy(ctx.window.ChampionsSim && ctx.window.ChampionsSim.logger, 'logger missing');
  eq(ctx.window.ChampionsSim.logger.getLevel(), 'warn', 'default level');
});

T('2. default level hides debug and info noise', () => {
  calls.length = 0;
  ctx.window.ChampionsSim.logger.debug('ui', 'hidden debug');
  ctx.window.ChampionsSim.logger.info('ui', 'hidden info');
  eq(calls.length, 0, 'debug/info should not call console');
});

T('3. warning emits structured namespace and fields', () => {
  calls.length = 0;
  ctx.window.ChampionsSim.logger.warn('persistence', 'save failed', { table: 'analyses' });
  eq(calls.length, 1, 'warn call count');
  eq(calls[0][0], 'warn', 'warn console method');
  truthy(String(calls[0][1][0]).includes('[persistence] save failed'), 'namespace missing');
  eq(calls[0][1][1].table, 'analyses', 'fields missing');
});

T('4. error path normalizes Error data', () => {
  calls.length = 0;
  ctx.window.ChampionsSim.logger.error('sim', 'run failed', new Error('boom'));
  const rec = ctx.window.ChampionsSim.logger.records().pop();
  eq(rec.fields.error.message, 'boom', 'error message missing');
});

T('5. no raw console calls remain in runtime source outside logger module', () => {
  const files = [
    'data.js',
    'engine.js',
    'index.html',
    'strategy-injectable.js',
    'supabase_adapter.js',
    'ui.js'
  ];
  const offenders = [];
  const rx = /console\.(log|warn|error|info|debug)\s*\(/;
  files.forEach(file => {
    const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
    text.split(/\n/).forEach((line, idx) => {
      if (rx.test(line)) offenders.push(file + ':' + (idx + 1));
    });
  });
  eq(offenders.join(', '), '', 'raw console offenders');
});

console.log(`\nstructured logger: ${pass} pass, ${fail} fail\n`);
if (fail) process.exit(1);
