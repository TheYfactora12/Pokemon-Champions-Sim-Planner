// T199 - Auth profile memory RLS contract

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const migration = fs.readFileSync(path.join(ROOT, 'db/migrations/2026_05_17_auth_profile_memory.sql'), 'utf8');

let pass = 0;
let fail = 0;

function T(name, fn) {
  try {
    fn();
    console.log('  PASS', name);
    pass++;
  } catch (err) {
    console.log('  FAIL', name, '-', err.message);
    fail++;
  }
}

function inc(hay, needle, msg) {
  if (!hay.includes(needle)) throw new Error((msg || 'missing substring') + ': ' + needle);
}

function no(hay, needle, msg) {
  if (hay.includes(needle)) throw new Error((msg || 'unexpected substring') + ': ' + needle);
}

console.log('\n=== profile RLS contract tests ===\n');

T('1. migration creates all authenticated profile-memory tables', () => {
  [
    'CREATE TABLE IF NOT EXISTS team_profiles',
    'CREATE TABLE IF NOT EXISTS team_versions',
    'CREATE TABLE IF NOT EXISTS team_run_snapshots',
    'CREATE TABLE IF NOT EXISTS replay_artifacts',
    'CREATE TABLE IF NOT EXISTS replay_team_matches',
    'CREATE TABLE IF NOT EXISTS replay_sim_comparisons',
    'CREATE TABLE IF NOT EXISTS coaching_reports',
    'CREATE TABLE IF NOT EXISTS team_trend_rollups'
  ].forEach((needle) => inc(migration, needle));
});

T('2. replay artifacts stay summary-only by default', () => {
  inc(migration, 'raw_log_saved BOOLEAN NOT NULL DEFAULT FALSE', 'raw logs must stay opt-in');
});

T('3. RLS uses auth.uid ownership checks for private profile memory', () => {
  inc(migration, 'auth.uid() = user_id', 'direct ownership check');
  inc(migration, 'TO authenticated', 'authenticated policies required');
});

T('4. new private tables do not grant anon access', () => {
  no(migration, 'TO anon', 'anon should not access private profile memory tables');
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
