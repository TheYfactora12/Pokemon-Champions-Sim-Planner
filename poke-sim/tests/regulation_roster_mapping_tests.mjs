import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mapOfficialRoster } from '../tools/regulation-roster-mapping.mjs';
const require = createRequire(import.meta.url);
const baseline = require('../generated/pokemon_showdown_legal_data.js');
const capture = JSON.parse(fs.readFileSync(new URL('../source/reg-m-b-official-roster.json', import.meta.url), 'utf8'));
const before = JSON.stringify(capture);
const rows = mapOfficialRoster(capture, baseline.species);
assert.equal(JSON.stringify(capture), before);
assert.equal(rows.length, 235);
assert(rows.every(row => !row.competitive_use));
assert.equal(rows.filter(row => row.runtime_species_key).length, 233);
assert.deepEqual(rows.filter(row => !row.runtime_species_key).map(row => row.official_id), ['0666-018', '0670-005']);
for (const [id, key] of [['0128-002', 'Tauros-Paldea-Blaze'], ['0711-003', 'Gourgeist-Super'], ['0902-001', 'Basculegion-F'], ['0479-002', 'Rotom-Wash']]) assert.equal(rows.find(row => row.official_id === id).runtime_species_key, key);
const one = row => ({ ...capture, rows: [row] });
assert.equal(mapOfficialRoster(one({ official_id: '0026-001', eligible: true, label: 'Raichu' }), baseline.species)[0].reason, 'official_label_changed');
assert.equal(mapOfficialRoster(one({ official_id: '0026-999', eligible: true, label: 'Raichu' }), baseline.species)[0].runtime_species_key, null);
assert.equal(mapOfficialRoster(one({ official_id: '0026-000', eligible: true, label: 'Pikachu' }), baseline.species)[0].runtime_species_key, null);
assert.equal(mapOfficialRoster(one({ official_id: '0025-000', eligible: true, label: 'Pikachu-Cosplay' }), baseline.species)[0].runtime_species_key, null);
assert.equal(mapOfficialRoster(one({ ...capture.rows[0], eligible: false }), baseline.species)[0].status, 'excluded_by_source');
assert.throws(() => mapOfficialRoster({ ...capture, rows: [capture.rows[0], capture.rows[0]] }, baseline.species), /duplicate/);
assert.throws(() => mapOfficialRoster({ ...capture, rows: [] }, baseline.species), /Invalid/);
execFileSync(process.execPath, [fileURLToPath(new URL('../tools/build-reg-mb-identity-review.mjs', import.meta.url)), '--check'], { stdio: 'inherit' });
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'champions-identity-check-'));
try {
  for (const file of ['tools/build-reg-mb-identity-review.mjs', 'tools/regulation-roster-mapping.mjs', 'source/reg-m-b-official-roster.json', 'source/reg-m-b-identity-review.json', 'generated/pokemon_showdown_legal_data.js']) {
    const dest = path.join(scratch, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8').replace(/\r?\n/g, '\r\n'));
  }
  const command = [path.join(scratch, 'tools/build-reg-mb-identity-review.mjs'), '--check'];
  execFileSync(process.execPath, command, { stdio: 'pipe' });
  const capturePath = path.join(scratch, 'source/reg-m-b-official-roster.json');
  const changed = JSON.parse(fs.readFileSync(capturePath, 'utf8'));
  changed.source_sha256 = '0'.repeat(64);
  fs.writeFileSync(capturePath, JSON.stringify(changed));
  assert.throws(() => execFileSync(process.execPath, command, { stdio: 'pipe' }), /Command failed/);
} finally {
  assert(path.resolve(scratch).startsWith(path.resolve(os.tmpdir()) + path.sep));
  fs.rmSync(scratch, { recursive: true, force: true });
}
console.log('PASS official roster identity: 233 candidate mappings, two explicit unresolved forms; no mutation, silent form fallback, or approval');
