'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { check } = require('../tools/check-production-alignment.cjs');
const { REQUIRED } = require('../tools/verify-release-assets.cjs');
const identity = data => ({ sha256: crypto.createHash('sha256').update(data).digest('hex'), bytes: Buffer.byteLength(data) });
async function fixture(mutate) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'alignment-test-'));
  const bundle = identity('local');
  const manifest = { schema_version: 'champions-release-artifact-v1', build_id: 'test', bundle_name: 'app.html', bundle_sha256: bundle.sha256, bundle_bytes: bundle.bytes, external_assets: {} };
  const remote = new Map([['app.html', 'local']]);
  for (const name of REQUIRED) { manifest.external_assets[name] = identity(name); remote.set(name, name); }
  for (const [name, bytes] of remote) { fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true }); fs.writeFileSync(path.join(root, name), bytes); }
  fs.writeFileSync(path.join(root, 'generated/release_artifact.json'), JSON.stringify(manifest));
  const deployed = JSON.parse(JSON.stringify(manifest));
  mutate(deployed, remote);
  remote.set('generated/release_artifact.json', JSON.stringify(deployed));
  try {
    return await check(root, 'https://example.test/site/', async url => {
      const name = url.pathname.slice('/site/'.length);
      return new Response(remote.get(name) ?? 'missing', { status: remote.has(name) ? 200 : 404 });
    });
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
}
test('matching artifacts pass bounded HTTP checks', async () => assert.equal((await fixture(() => {})).status, 'artifact_checks_pass'));
test('documented injected HTML retains repository provenance', async () => {
  const result = await fixture((m, r) => { m.repo_bundle_sha256 = m.bundle_sha256; m.repo_bundle_bytes = m.bundle_bytes; const x = identity('injected'); m.bundle_sha256 = x.sha256; m.bundle_bytes = x.bytes; r.set('app.html', 'injected'); });
  assert.equal(result.status, 'artifact_checks_pass');
});
test('old build and false provenance fail', async () => {
  const result = await fixture(m => { m.build_id = 'old'; m.repo_bundle_sha256 = '0'.repeat(64); });
  assert.ok(result.errors.includes('Build ID differs'));
  assert.ok(result.errors.includes('Repository bundle provenance differs'));
});
test('stale HTML fails even with matching release label', async () => assert.ok((await fixture((m,r) => r.set('app.html','stale'))).errors.includes('Hosted HTML differs from deployed manifest')));
test('asset drift is not masked by a matching HTML file', async () => assert.ok((await fixture((m,r) => r.set(REQUIRED[0],'stale'))).errors.some(x => x.startsWith('Hosted asset drift'))));
test('missing asset is unavailable, never a passing check', async () => {
  const result = await fixture((m,r) => r.delete(REQUIRED[0]));
  assert.equal(result.status, 'mismatch');
  assert.ok(result.errors.some(x => x.includes('HTTP 404')));
});
