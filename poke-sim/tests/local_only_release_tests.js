const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const root = path.resolve(__dirname, '..');

test('local-only manifest prevents client creation even with stale credentials', async () => {
  let calls = 0;
  const window = {
    __SUPABASE_URL__: 'https://example.invalid', __SUPABASE_KEY__: 'test-only',
    supabase: { createClient() { calls++; throw Error('Must not connect'); } }
  };
  const ctx = vm.createContext({ window, console });
  vm.runInContext(fs.readFileSync(path.join(root, 'release_manifest.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'supabase_adapter.js'), 'utf8'), ctx);
  assert.equal(window.CHAMPIONS_RELEASE_MANIFEST.data_mode, 'local-only');
  assert.equal(window.SupabaseAdapter.enabled, false);
  await window.SupabaseAdapter.loadTeamsFromDB();
  await window.SupabaseAdapter.loadRulesets();
  assert.equal(calls, 0);
});

test('local-only deployment preserves source bytes and never consumes secrets', () => {
  const workflow = fs.readFileSync(path.join(root, '../.github/workflows/pages.yml'), 'utf8');
  assert(!workflow.includes('secrets.'));
  assert(!workflow.includes('RUN_LIVE_DB'));
  assert(workflow.includes("data_mode !== 'local-only'"));
  assert(workflow.includes('window.__DISABLE_SUPABASE__ = true;'));
  assert(workflow.includes('cmp poke-sim/pokemon-champion-2026.html pages-dist/poke-sim/pokemon-champion-2026.html'));
  assert(workflow.includes('npm test'));
  assert(workflow.indexOf('verify-release-assets.cjs pages-dist/poke-sim') < workflow.indexOf('actions/upload-pages-artifact'));
});
