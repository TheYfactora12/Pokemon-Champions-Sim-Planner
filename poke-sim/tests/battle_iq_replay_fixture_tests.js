// Battle IQ replay fixture contract tests

const fs = require('fs');
const path = require('path');

const FIXTURE_DIR = path.join(__dirname, 'fixtures', 'replays');
const MANIFEST_PATH = path.join(FIXTURE_DIR, 'manifest.json');

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

function assert(value, message) {
  if (!value) throw new Error(message || 'assertion failed');
}

function readManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

function countEventLines(raw) {
  return String(raw || '').split(/\n/).filter((line) => line.charAt(0) === '|').length;
}

console.log('\n=== Battle IQ replay fixture tests ===\n');

T('manifest parses and defines compatibility classes', () => {
  const manifest = readManifest();
  assert(manifest.schema_version === 'battle_iq_replay_manifest_v1', 'schema version mismatch');
  assert(Array.isArray(manifest.compatibility_classes), 'compatibility_classes must be array');
  assert(manifest.compatibility_classes.includes('champion_exact'), 'missing champion_exact');
  assert(manifest.compatibility_classes.includes('champion_compatible'), 'missing champion_compatible');
  assert(manifest.compatibility_classes.includes('generic_gen9'), 'missing generic_gen9');
  assert(manifest.compatibility_classes.includes('parser_only'), 'missing parser_only');
  assert(manifest.compatibility_classes.includes('unknown'), 'missing unknown');
  assert(Array.isArray(manifest.fixtures) && manifest.fixtures.length >= 4, 'expected at least four fixtures');
});

T('all fixtures have required metadata and raw log files', () => {
  const manifest = readManifest();
  const allowed = new Set(manifest.compatibility_classes);
  const required = [
    'id',
    'source_url',
    'source_platform',
    'raw_file',
    'expected_format',
    'expected_battle_type',
    'expected_best_of',
    'ruleset_profile',
    'compatibility_class',
    'expected_min_event_count',
    'expected_confidence_class',
    'expected_parser_warnings'
  ];

  manifest.fixtures.forEach((fixture) => {
    required.forEach((key) => assert(Object.prototype.hasOwnProperty.call(fixture, key), fixture.id + ' missing ' + key));
    assert(allowed.has(fixture.compatibility_class), fixture.id + ' has invalid compatibility class');
    assert(fixture.raw_file.endsWith('.log'), fixture.id + ' raw_file should be .log');
    assert(fixture.source_url.indexOf('https://replay.pokemonshowdown.com/') === 0, fixture.id + ' source_url should be Showdown replay');
    assert(fixture.expected_battle_type === 'singles' || fixture.expected_battle_type === 'doubles', fixture.id + ' invalid battle type');
    assert(Number.isInteger(fixture.expected_best_of) && fixture.expected_best_of >= 1, fixture.id + ' invalid expected_best_of');
    assert(Array.isArray(fixture.expected_parser_warnings), fixture.id + ' parser warnings must be array');
    assert(fixture.ruleset_profile && fixture.ruleset_profile.format_id, fixture.id + ' missing ruleset profile format_id');

    const rawPath = path.join(FIXTURE_DIR, fixture.raw_file);
    assert(fs.existsSync(rawPath), fixture.id + ' missing raw log file ' + fixture.raw_file);
    const raw = fs.readFileSync(rawPath, 'utf8');
    assert(raw.length >= 100, fixture.id + ' raw log too small');
    assert(countEventLines(raw) >= fixture.expected_min_event_count, fixture.id + ' below expected event count');
  });
});

T('Champion-looking fixtures stay unknown until rules are verified', () => {
  const manifest = readManifest();
  const championCandidates = manifest.fixtures.filter((fixture) => /champions/i.test(fixture.expected_format || fixture.id));
  assert(championCandidates.length >= 1, 'expected at least one Champion candidate fixture');
  championCandidates.forEach((fixture) => {
    assert(fixture.compatibility_class === 'unknown' || fixture.compatibility_class === 'champion_compatible' || fixture.compatibility_class === 'champion_exact', fixture.id + ' invalid Champion candidate class');
    if (fixture.compatibility_class !== 'champion_exact') {
      assert(fixture.compatibility_note || fixture.expected_parser_warnings.includes('ruleset_unverified'), fixture.id + ' should document unverified ruleset');
    }
  });
});

T('parser-only fixtures cannot be used for Champion scoring', () => {
  const manifest = readManifest();
  const parserOnly = manifest.fixtures.filter((fixture) => fixture.compatibility_class === 'parser_only');
  assert(parserOnly.length >= 1, 'expected at least one parser_only fixture');
  parserOnly.forEach((fixture) => {
    assert(fixture.expected_confidence_class === 'low', fixture.id + ' parser_only fixtures should default low confidence');
    assert(fixture.expected_parser_warnings.length >= 1, fixture.id + ' parser_only fixture should explain warning reason');
  });
});

if (fail) {
  console.error('\n' + fail + ' failed, ' + pass + ' passed');
  process.exit(1);
}

console.log('\nAll Battle IQ replay fixture tests passed (' + pass + ').');
