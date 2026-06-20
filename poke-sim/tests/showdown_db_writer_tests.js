'use strict';

const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const writerPath = path.join(ROOT, 'tools', 'write_showdown_data_to_db.mjs');

let pass = 0;
let fail = 0;

function T(name, fn) {
  try {
    fn();
    console.log('  PASS', name);
    pass += 1;
  } catch (err) {
    console.log('  FAIL', name, '-', err.message);
    fail += 1;
  }
}

function truthy(value, msg) {
  if (!value) throw new Error(msg || 'expected truthy');
}

function eq(actual, expected, msg) {
  if (actual !== expected) throw new Error((msg || 'not equal') + ' expected=' + JSON.stringify(expected) + ' got=' + JSON.stringify(actual));
}

function makeArtifacts() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'showdown-db-writer-'));
  fs.mkdirSync(path.join(dir, 'normalized'), {recursive: true});
  fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify({
    schemaVersion: 1,
    manifestVersion: 1,
    startedAt: '2026-06-10T00:00:00.000Z',
    finishedAt: '2026-06-10T00:00:01.000Z',
    status: 'passed',
    baseUrl: 'https://play.pokemonshowdown.com/data/',
    kindHashes: {move: 'kind-move', species: 'kind-species', abilities: 'kind-abilities'},
    validationFindings: [],
    changeSummary: {
      hasPrevious: true,
      totals: {
        move: {current: 1, previous: 0, added: 1, removed: 0, changed: 0},
        species: {current: 1, previous: 1, added: 0, removed: 0, changed: 1},
        ability: {current: 1, previous: 0, added: 1, removed: 0, changed: 0}
      },
      added: {move: ['protect'], species: [], ability: ['adaptability']},
      removed: {move: [], species: [], ability: []},
      changed: {move: [], species: ['bulbasaur'], ability: []}
    }
  }, null, 2));
  fs.writeFileSync(path.join(dir, 'source_files.json'), JSON.stringify([
    {
      name: 'moves',
      kind: 'move',
      required: true,
      path: 'moves.js',
      url: 'https://play.pokemonshowdown.com/data/moves.js',
      status: 'passed',
      byteSize: 123,
      sourceHash: 'raw-moves',
      normalizedHash: 'kind-move'
    },
    {
      name: 'pokedex',
      kind: 'species',
      required: true,
      path: 'pokedex.js',
      url: 'https://play.pokemonshowdown.com/data/pokedex.js',
      status: 'passed',
      byteSize: 456,
      sourceHash: 'raw-pokedex',
      normalizedHash: 'kind-species'
    }
  ], null, 2));
  fs.writeFileSync(path.join(dir, 'normalized', 'entities.json'), JSON.stringify({
    moves: {
      protect: {
        id: 'protect',
        name: 'Protect',
        type: 'Normal',
        category: 'Status',
        basePower: 0,
        accuracy: true,
        pp: 10,
        priority: 4,
        target: 'self',
        flags: {}
      }
    },
    species: {
      bulbasaur: {
        id: 'bulbasaur',
        displayName: 'Bulbasaur',
        speciesKey: 'Bulbasaur',
        types: ['Grass', 'Poison'],
        stats: {hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45},
        abilities: {0: 'Overgrow', H: 'Chlorophyll'},
        moves: {protect: ['9M']}
      }
    },
    abilities: {
      adaptability: {
        id: 'adaptability',
        name: 'Adaptability',
        desc: 'Powers up same-type attacks.'
      }
    },
    items: {},
    typechart: {},
    aliases: {},
    learnsets: {},
    formats: {}
  }, null, 2));
  fs.writeFileSync(path.join(dir, 'normalized', 'entity_hashes.json'), JSON.stringify({
    schemaVersion: 1,
    generatedAt: '2026-06-10T00:00:01.000Z',
    kindHashes: {move: 'kind-move', species: 'kind-species', abilities: 'kind-abilities'},
    entities: {
      move: {protect: 'hash-protect'},
      species: {bulbasaur: 'hash-bulbasaur'},
      abilities: {adaptability: 'hash-adaptability'}
    }
  }, null, 2));
  fs.writeFileSync(path.join(dir, 'normalized', 'change_summary.json'), JSON.stringify({
    hasPrevious: true,
    totals: {
      move: {current: 1, previous: 0, added: 1, removed: 0, changed: 0},
      species: {current: 1, previous: 1, added: 0, removed: 0, changed: 1},
      ability: {current: 1, previous: 0, added: 1, removed: 0, changed: 0}
    },
    added: {move: ['protect'], species: [], ability: ['adaptability']},
    removed: {move: [], species: [], ability: []},
    changed: {move: [], species: ['bulbasaur'], ability: []}
  }, null, 2));
  return dir;
}

function runDry(args) {
  const result = childProcess.spawnSync(process.execPath, [writerPath].concat(args), {
    cwd: ROOT,
    encoding: 'utf8'
  });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  return result.stdout;
}

console.log('\n=== Showdown DB writer tests ===\n');

T('1. dry run reports DB row counts without Supabase credentials', () => {
  const dir = makeArtifacts();
  const out = runDry(['--artifact-dir', dir, '--sync-run-id', 'fixture_run', '--dry-run', '--json']);
  const summary = JSON.parse(out);
  eq(summary.syncRunId, 'fixture_run', 'sync run id');
  eq(summary.approve, false, 'default approval');
  eq(summary.counts.sourceFiles, 2, 'source file count');
  eq(summary.counts.entities, 3, 'entity count');
  eq(summary.counts.diffs, 3, 'diff count');
  eq(summary.counts.byKind.move, 1, 'move kind count');
  eq(summary.counts.byKind.species, 1, 'species kind count');
  eq(summary.counts.byKind.ability, 1, 'ability kind count');
});

T('2. approve flag marks promotion mode explicitly', () => {
  const dir = makeArtifacts();
  const out = runDry(['--artifact-dir', dir, '--sync-run-id', 'fixture_run', '--approve', '--dry-run', '--json']);
  const summary = JSON.parse(out);
  eq(summary.approve, true, 'approve flag');
});

T('3. real write mode requires a service-role style secret', () => {
  const dir = makeArtifacts();
  const result = childProcess.spawnSync(process.execPath, [
    writerPath,
    '--artifact-dir', dir,
    '--sync-run-id', 'fixture_run'
  ], {
    cwd: ROOT,
    encoding: 'utf8',
    env: Object.assign({}, process.env, {
      SUPABASE_URL: '',
      SUPABASE_SERVICE_ROLE_KEY: '',
      SUPABASE_DB_WRITE_KEY: ''
    })
  });
  truthy(result.status !== 0, 'write should fail without write credentials');
  truthy((result.stderr || '').includes('SUPABASE_SERVICE_ROLE_KEY'), 'missing credential error should name service role key');
});

console.log('\nShowdown DB writer:', pass + ' pass, ' + fail + ' fail\n');
if (fail > 0) process.exit(1);
