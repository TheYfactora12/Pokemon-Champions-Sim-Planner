'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { REQUIRED } = require('./verify-release-assets.cjs');
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

async function check(root, base, request = fetch) {
  const expected = JSON.parse(fs.readFileSync(path.join(root, 'generated/release_artifact.json'), 'utf8'));
  const errors = [];
  const safePath = name => typeof name === 'string' && /^[a-zA-Z0-9_./-]+$/.test(name)
    && !name.startsWith('/') && !name.split('/').includes('..');
  if (!safePath(expected.bundle_name)) throw new Error('Invalid local bundle path');
  function verify(bytes, identity, label) {
    if (!identity || !/^[a-f0-9]{64}$/.test(identity.sha256 || '')
      || identity.bytes !== bytes.length || digest(bytes) !== identity.sha256) errors.push(label);
  }
  verify(fs.readFileSync(path.join(root, expected.bundle_name)),
    { sha256: expected.bundle_sha256, bytes: expected.bundle_bytes }, 'Local bundle differs from local manifest');
  const url = new URL(base);
  if (url.protocol !== 'https:') throw new Error('Production checkpoint requires HTTPS');
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  async function download(name) {
    const target = new URL(name, url);
    target.searchParams.set('alignment_check', Date.now().toString());
    const response = await request(target, { cache: 'no-store', signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${name}`);
    return Buffer.from(await response.arrayBuffer());
  }
  const deployed = JSON.parse((await download('generated/release_artifact.json')).toString('utf8'));
  if (deployed.schema_version !== expected.schema_version) errors.push('Manifest schema differs');
  if (deployed.build_id !== expected.build_id) errors.push('Build ID differs');
  if (deployed.bundle_name !== expected.bundle_name) errors.push('Bundle path differs');
  if ((deployed.repo_bundle_sha256 || deployed.bundle_sha256) !== expected.bundle_sha256
    || (deployed.repo_bundle_bytes ?? deployed.bundle_bytes) !== expected.bundle_bytes) errors.push('Repository bundle provenance differs');
  verify(await download(expected.bundle_name),
    { sha256: deployed.bundle_sha256, bytes: deployed.bundle_bytes }, 'Hosted HTML differs from deployed manifest');
  const assets = expected.external_assets || {};
  for (const name of REQUIRED) if (!assets[name]) errors.push(`Missing required local asset identity: ${name}`);
  for (const [name, identity] of Object.entries(assets)) {
    if (!safePath(name)) throw new Error('Invalid local asset path');
    verify(fs.readFileSync(path.join(root, name)), identity, `Local asset drift: ${name}`);
    const remoteIdentity = deployed.external_assets?.[name];
    if (remoteIdentity?.sha256 !== identity.sha256 || remoteIdentity?.bytes !== identity.bytes) errors.push(`Hosted asset manifest differs: ${name}`);
    try { verify(await download(name), identity, `Hosted asset drift: ${name}`); }
    catch (error) { errors.push(`Hosted asset unverified: ${name}: ${error.message}`); }
  }
  return { checked_at: new Date().toISOString(), status: errors.length ? 'mismatch' : 'artifact_checks_pass',
    expected_build: expected.build_id, deployed_build: deployed.build_id, errors,
    scope: 'HTTP artifact/provenance checks only; deployed manifest is not independent approval. Browser cache, visual behavior, database and simulation parity require separate evidence.' };
}
module.exports = { check };
if (require.main === module) {
  check(path.resolve(__dirname, '..'), process.argv[2] || 'https://theyfactora12.github.io/Pokemon-Champions-Sim-Planner/poke-sim/')
    .then(result => { console.log(JSON.stringify(result, null, 2)); process.exitCode = result.errors.length ? 1 : 0; })
    .catch(error => { console.error(JSON.stringify({ status: 'unverified', error: error.message })); process.exitCode = 1; });
}
