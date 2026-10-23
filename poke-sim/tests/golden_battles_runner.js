// Historical deterministic trace regression runner, plus explicit current-profile diagnostics.
// Historical: data.js + engine.js + mirrored data. Current profile includes runtime_data.js.
// Historical verification exit 0 is not approval of current-profile golden expectations.
//
// Usage:
//   node tests/golden_battles_runner.js            - verify historical hashes
//   node tests/golden_battles_runner.js --current-report <path> - preserve first differences
// --generate is disabled; propose separately reviewed current expectations.

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'golden_battles.json');

// ─── VM Context (same pattern as other test files) ────────────────────────
const {loadProfile}=require('../tools/golden-runtime-profile.cjs');
function createEngineContext(profile='historical',options) { return loadProfile(profile,options).context; }
function currentProfileReport() {
  const fixture=JSON.parse(fs.readFileSync(FIXTURE_PATH,'utf8'));
  const current=loadProfile('current'),historical=loadProfile('historical');
  for(const row of historical.identity.files)if(current.identity.files.find(r=>r.file===row.file)?.sha256!==row.sha256)throw Error('Runtime changed between profile captures: '+row.file);
  const cases=fixture.battles.map(b=>{
    const options={format:b.format||'doubles',seed:b.seed};
    const old=historical.context.simulateBattle(historical.context.TEAMS[b.player_team_id],historical.context.TEAMS[b.opp_team_id],options);
    const currentOptions={...options,rulesetId:'champions_custom_practice'};
    const actual=current.context.simulateBattle(current.context.TEAMS[b.player_team_id],current.context.TEAMS[b.opp_team_id],currentOptions);
    const repeated=current.context.simulateBattle(current.context.TEAMS[b.player_team_id],current.context.TEAMS[b.opp_team_id],currentOptions);
    if(traceHash(actual.log)!==traceHash(repeated.log)||actual.result!==repeated.result)throw Error('Current profile nondeterministic: '+b.golden_id);
    const difference=Array.from({length:Math.max(old.log.length,actual.log.length)},(_,i)=>i).find(i=>old.log[i]!==actual.log[i]);
    return {id:b.golden_id,options:currentOptions,historical_expected_hash:b.expected_trace_hash,historical_expected_winner:b.expected_winner,
      historical_actual_hash:traceHash(old.log),current_hash:traceHash(actual.log),current_winner:actual.result,turns:actual.turns,
      current_matches_historical_expectation:traceHash(actual.log)===b.expected_trace_hash&&actual.result===b.expected_winner,
      first_profile_difference:difference===undefined?null:{index:difference,historical:old.log[difference]??null,current:actual.log[difference]??null},
      historical_log:old.log,current_log:actual.log};
  });
  return {schema_version:'golden-profile-comparison-v1',fixture_sha256:crypto.createHash('sha256').update(fs.readFileSync(FIXTURE_PATH)).digest('hex'),
    historical_profile:historical.identity,current_profile:current.identity,current_integrity:'passed',current_determinism:'passed',
    current_golden_status:'not_approved',comparison_status:cases.some(c=>!c.current_matches_historical_expectation)?'review_required':'matches_historical_only',
    scope:'Three preserved historical trace expectations versus current custom-practice profile; not current-client parity or reviewed current goldens',cases};
}

// ─── Trace hash: SHA256 of battle log joined by newlines ──────────────────
function traceHash(log) {
  if (!log || !log.length) return 'EMPTY_LOG';
  var canonical = log.join('\n');
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

// ─── Main ─────────────────────────────────────────────────────────────────
function run(generateMode) {
  if(generateMode)throw Error('Historical expectations are preserved; propose a separate reviewed fixture instead');
  var fixture = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'));
  var battles = fixture.battles;

  if (!battles || !battles.length) {
    console.error('FATAL: No battles in fixture file.');
    process.exit(1);
  }

  var ctx = createEngineContext();
  var TEAMS = ctx.TEAMS;
  var simulateBattle = ctx.simulateBattle;

  console.log('Historical three-module Golden Battles Runner — ' + battles.length + ' battle(s)');
  console.log(generateMode ? 'MODE: --generate (computing hashes)\n' : 'MODE: verify\n');

  var passed = 0, failed = 0;
  var updated = false;

  for (var i = 0; i < battles.length; i++) {
    var b = battles[i];
    var playerTeam = TEAMS[b.player_team_id];
    var oppTeam = TEAMS[b.opp_team_id];

    if (!playerTeam) { console.error('  MISSING TEAM: ' + b.player_team_id); failed++; continue; }
    if (!oppTeam)    { console.error('  MISSING TEAM: ' + b.opp_team_id); failed++; continue; }

    var result = simulateBattle(playerTeam, oppTeam, {
      format: b.format || 'doubles',
      seed: b.seed
    });

    var hash = traceHash(result.log);
    var winner = result.result; // 'win' | 'loss' | 'draw'

    if (generateMode) {
      b.expected_trace_hash = hash;
      b.expected_winner = winner;
      updated = true;
      console.log('  [' + b.golden_id + '] ' + b.description);
      console.log('    hash: ' + hash.substring(0, 16) + '…  winner: ' + winner);
    } else {
      if (!b.expected_trace_hash) {
        console.log('  ✖ [' + b.golden_id + '] MISSING EXPECTED HASH');
        failed++;
        continue;
      }
      if (hash === b.expected_trace_hash && winner === b.expected_winner) {
        console.log('  ✔ [' + b.golden_id + '] ' + b.description);
        passed++;
      } else {
        console.log('  ✖ [' + b.golden_id + '] GOLDEN STATE MISMATCH');
        console.log('    Expected: ' + b.expected_trace_hash.substring(0, 16) + '…');
        console.log('    Actual:   ' + hash.substring(0, 16) + '…');
        console.log('    Winner:   expected ' + b.expected_winner + ', got ' + winner);
        console.log('    Turns:    ' + result.turns);
        // Find first differing line (rough diff)
        if (b._expected_log_length) {
          console.log('    (expected ~' + b._expected_log_length + ' log lines, got ' + (result.log || []).length + ')');
        }
        failed++;
      }
    }
  }

  if (generateMode && updated) {
    fs.writeFileSync(FIXTURE_PATH, JSON.stringify(fixture, null, 2) + '\n');
    console.log('\n✅ Fixture updated with ' + battles.length + ' hashes.');
  } else if (!generateMode) {
    if (passed === 0) {
      console.log('❌ No golden battle was verified.');
      failed++;
    }
    console.log('\n' + '='.repeat(50));
    console.log('Golden Battles: ' + passed + ' passed, ' + failed + ' failed');
    if (failed > 0) {
      console.log('❌ FAIL');
      process.exit(1);
    } else {
      console.log('✅ All golden battles passed');
    }
  }
}

// ─── Export for db_m7 tests + direct invocation ───────────────────────────
module.exports = { currentProfileReport, run: run, traceHash: traceHash, createEngineContext: createEngineContext, FIXTURE_PATH: FIXTURE_PATH };

if (require.main === module) {
  var generateMode = process.argv.includes('--generate');
  run(generateMode);
  const index=process.argv.indexOf('--current-report');
  if(index>=0){if(!process.argv[index+1])throw Error('Missing current report path');const report=currentProfileReport();fs.writeFileSync(process.argv[index+1],JSON.stringify(report,null,2)+'\n');console.log('Current integrity passed; current golden approval: '+report.current_golden_status+'; comparison: '+report.comparison_status);}
}
