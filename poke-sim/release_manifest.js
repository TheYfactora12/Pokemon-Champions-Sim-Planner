// Canonical release identity for the Champions Sim app shell, exports, QA
// artifacts, service worker cache, and GitHub Pages bundle.
// Update this file first for every release; other version surfaces must derive
// from this object or explicitly prove they mirror it.
(function(root) {
  var manifest = {
    schema_version: 'champions-release-manifest-v1',
    data_mode: 'local-only',
    reference_artifact_sha256: '9b2262a492e6320816edfd1e482386c597eacbbcfccf9860cbd05d18d283c630',
    build_id: 'v2.2.234-rest-leaf-guard',
    release_date: '2026-10-20',
    service_worker_cache: 'champions-sim-v2-2-234-rest-leaf-guard',
    bundle_name: 'pokemon-champion-2026.html',
    pages_path: 'poke-sim/pokemon-champion-2026.html',
    artifact_manifest: 'generated/release_artifact.json',
    source_sync_policy: 'generated/source_sync_status.js',
    notes: 'Canonical release identity manifest for visible version, exports, QA artifacts, service worker cache, bundle artifact SHA, and deployed bundle checks.'
  };
  root.CHAMPIONS_RELEASE_MANIFEST = manifest;
  if (typeof module !== 'undefined' && module.exports) module.exports = manifest;
})(typeof self !== 'undefined' ? self : (typeof window !== 'undefined' ? window : globalThis));
