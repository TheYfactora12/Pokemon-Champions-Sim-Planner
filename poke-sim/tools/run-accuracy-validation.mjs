import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import { validateTurnLogPayload } from './validate-turn-logs.mjs';

const root = new URL('../', import.meta.url);
const sha = value => createHash('sha256').update(value).digest('hex');
export function seedFor(label) {
  const bytes = createHash('sha256').update(label).digest();
  return Array.from({ length: 4 }, (_, i) => bytes.readUInt32LE(i * 4));
}
export function validateRegulationCoverage(catalog, manifest) {
  const errors = [];
  if (!manifest || manifest.schema_version !== 'champions-accuracy-harness-v1') errors.push('manifest-schema');
  if (!Number.isInteger(manifest && manifest.warning_budget) || manifest.warning_budget < 0) errors.push('warning-budget');
  const rows = manifest && manifest.regulations;
  if (!Array.isArray(rows)) errors.push('regulations-list');
  const declared = new Map();
  for (const row of Array.isArray(rows) ? rows : []) {
    if (!row || typeof row.id !== 'string' || !row.id) { errors.push('invalid-regulation-id'); continue; }
    if (declared.has(row.id)) errors.push(`duplicate-regulation:${row.id}`);
    else declared.set(row.id, row);
  }
  const known = Object.values(catalog || {}).filter(Boolean);
  for (const rule of known) {
    const row = declared.get(rule.id);
    if (!row) { errors.push(`missing-regulation:${rule.id}`); continue; }
    if (row.version !== rule.version) errors.push(`version-drift:${rule.id}`);
    if (row.status !== rule.status) errors.push(`status-drift:${rule.id}`);
    if (row.runtime_promotable !== !!rule.runtimePromotable) errors.push(`promotion-drift:${rule.id}`);
    const formatsValid = Array.isArray(row.formats) && row.formats.every(format => ['singles', 'doubles'].includes(format));
    if (!formatsValid || typeof row.harness_lane !== 'string' || !row.harness_lane.trim()) errors.push(`invalid-lane:${rule.id}`);
    if (rule.status === 'source_review' && Array.isArray(row.formats) && row.formats.length) errors.push(`review-only-format:${rule.id}`);
    if (rule.runtimePromotable && (!Array.isArray(row.formats) || !row.formats.includes('doubles'))) errors.push(`missing-doubles-lane:${rule.id}`);
    declared.delete(rule.id);
  }
  for (const id of declared.keys()) errors.push(`stale-regulation:${id}`);
  return errors;
}
export function qualityGateFailed(modes, warningBudget = 0) {
  return Object.values(modes || {}).some(mode => mode && (
    mode.state_failures || mode.validator_errors || mode.repeat_failures || mode.validator_warnings > warningBudget
  ));
}
export function checkTerminalOutcome(result) {
  const rows=result.turnLog?.at(-1)?.post?.roster;
  if (!rows || result.timerExpired) return 'timer-or-unavailable';
  const alive=side=>rows[side].filter(m=>m.hp_current>0).length;
  if (![...rows.player,...rows.opponent].every(m=>Number.isFinite(m.hp_current))) return 'exact-hp-unavailable';
  const p=alive('player'),o=alive('opponent');
  if ((p===0)===(o===0)) return p===0?'both-extinct-order-unproved':'both-survive-truncation';
  assert.equal(result.terminal,true,'eliminated team must terminate battle');
  assert.equal(result.result,p>0?'win':'loss','winner disagrees with one-sided elimination');
  return 'one-sided-elimination-checked';
}
export const ACCURACY_RUNTIME_FILES = ['data.js','own_state_policy.js','generated/pokemon_showdown_legal_data.js',
  'generated/pokemon_showdown_species_weights.js','generated/champions_move_overrides.js','runtime_data.js','outcome_policy.js', 'engine.js','rulesets.js'];
export function loadAccuracyRuntime() {
  const context=vm.createContext({console}),provenance={};
  for(const file of ACCURACY_RUNTIME_FILES){const text=readFileSync(new URL(file,root),'utf8');provenance[file]=sha(text);vm.runInContext(text,context,{filename:file});}
  vm.runInContext('this.simulateBattle=simulateBattle;this.TEAMS=TEAMS;this.CHAMPIONS_RULESETS=CHAMPIONS_RULESETS;',context);
  return {context,provenance};
}
export function checkState(result, format, bringCount) {
  assert.ok(['win', 'loss', 'draw'].includes(result.result), 'battle did not finish normally');
  assert.ok(Array.isArray(result.turnLog) && result.turnLog.length > 0, 'missing turn log');
  checkTerminalOutcome(result);
  const identities = new Map();
  for (const turn of result.turnLog) {
    for (const snapshot of [turn.pre, turn.post]) {
      assert.ok(snapshot?.roster, 'missing roster snapshot');
      for (const side of ['player', 'opponent']) {
        const roster = snapshot.roster[side];
        assert.ok(Array.isArray(roster) && roster.length > 0 && roster.length <= bringCount, 'participant count exceeds declared bring');
        assert.equal(new Set(roster.map(m => m.stableKey)).size, roster.length, 'duplicate stable identity');
        assert.ok(roster.filter(m => m.zone === 'active').length <= (format === 'doubles' ? 2 : 1), 'too many active slots');
        for (const mon of roster) {
          assert.ok(mon.stableKey?.startsWith(side + ':') && Number.isInteger(mon.teamSlot), 'missing side-qualified stable identity');
          assert.ok(Number.isFinite(mon.hp) && mon.hp >= 0 && mon.hp <= 100, 'roster HP percentage outside 0..100');
          const priorSlot = identities.get(mon.stableKey);
          assert.ok(priorSlot === undefined || priorSlot === mon.teamSlot, 'identity changed registered slot');
          identities.set(mon.stableKey, mon.teamSlot);
        }
      }
    }
    for (const event of turn.damage_events || []) {
      assert.ok(Number.isFinite(event.applied_damage) && event.applied_damage >= 0, 'invalid applied damage');
      assert.equal(event.target_hp_before - event.target_hp_after, event.applied_damage, 'damage delta mismatch');
      assert.ok(event.target_hp_after >= 0 && event.target_hp_after <= event.target_max_hp, 'invalid damage HP');
    }
  }
}

export function main(argv = process.argv.slice(2)) {
  const seeds = argv.length === 0 ? 2 : Number(argv[0]);
  if (!Number.isInteger(seeds) || seeds < 1 || seeds > 100) throw new Error('Seed count must be 1..100');
  const {context,provenance}=loadAccuracyRuntime();
  for(const file of ['tools/validate-turn-logs.mjs','tools/run-accuracy-validation.mjs','pokemon-champion-2026.html','generated/release_artifact.json','package-lock.json']) provenance[file]=sha(readFileSync(new URL(file,root)));
  const manifestText = readFileSync(new URL('accuracy_harness_manifest.json', root), 'utf8');
  const manifest = JSON.parse(manifestText);
  const regulationErrors = validateRegulationCoverage(context.CHAMPIONS_RULESETS, manifest);
  assert.deepEqual(regulationErrors, [], `Accuracy regulation contract failed: ${regulationErrors.join(', ')}`);
  const regulationRows = Object.values(context.CHAMPIONS_RULESETS).map(rule => ({
    id: rule.id, version: rule.version, status: rule.status, runtime_promotable: !!rule.runtimePromotable
  })).sort((a, b) => a.id.localeCompare(b.id));
  const ids = Object.keys(context.TEAMS).sort();
  const out = new URL('artifacts/accuracy-2026-08-30/cross-format/', root);
  mkdirSync(out, { recursive: true });
  const report = { schema_version: 2, checked_commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(), execution_ruleset:'champions_custom_practice', catalog_is_not_execution_coverage:true, lead_orders_per_seed:2, generated_at: new Date().toISOString(), provenance,
    harness_sha256: sha(readFileSync(fileURLToPath(import.meta.url))),
    scope: 'Local runtime teams, explicit bring-four doubles and bring-three singles. Singles results do not establish doubles parity. Runtime availability is not current Champion legality approval.',
    oracle: 'State, identity, export consistency and deterministic replay checks; not an in-game parity oracle',
    regulation_contract: { manifest_sha256: sha(manifestText), catalog_sha256: sha(JSON.stringify(regulationRows)),
      warning_budget: manifest.warning_budget, regulations: manifest.regulations },
    team_ids: ids, seeds_per_ordered_pair: seeds, retained_log_limit: 24, retained_logs: [], modes: {}, findings: [], error_runs: [], finding_counts: {} };
  let sequence = 0;
  for (const format of ['doubles', 'singles']) {
    const count = format === 'doubles' ? 4 : 3;
    const summary = { battles: 0, win: 0, loss: 0, draw: 0, state_failures: 0, validator_errors: 0, validator_warnings: 0, repeat_checks: 0, repeat_failures: 0, outcome_scopes:{} };
    report.modes[format] = summary;
    for (const playerId of ids) for (const opponentId of ids) for (let index = 0; index < seeds; index++) for (const leadOrder of [0,1]) {
      const player = context.TEAMS[playerId];
      const opponent = context.TEAMS[opponentId];
      // Alternate registered order to exercise different leads and benches without guessing spreads.
      const names = t => (leadOrder ? t.members.slice().reverse() : t.members).slice(0, count).map(m => m.name);
      const options = { format, rulesetId:'champions_custom_practice', maxTurns: 60, seed: seedFor(`accuracy-v2|${format}|${[playerId,opponentId].sort().join('|')}|${index}`),
        playerBring: names(player), opponentBring: names(opponent) };
      const runId = `${format}-${String(sequence++).padStart(5, '0')}`;
      const scenarioId=`${format}|${playerId}|${opponentId}|seed:${index}|leads:${leadOrder}`;
      let result;
      let findings = [];
      summary.battles++;
      try {
        result = context.simulateBattle(player, opponent, options);
        summary[result.result] = (summary[result.result] || 0) + 1;
        checkState(result, format, count);
        const scope=checkTerminalOutcome(result);summary.outcome_scopes[scope]=(summary.outcome_scopes[scope]||0)+1;
        const validation = validateTurnLogPayload({ ...result, format }, { requireStable: true });
        summary.validator_errors += validation.summary.errors;
        summary.validator_warnings += validation.summary.warnings;
        findings = validation.findings;
        if (playerId === opponentId && index === 0 && leadOrder === 0) {
          summary.repeat_checks++;
          const repeat = context.simulateBattle(player, opponent, options);
          if (JSON.stringify(result) !== JSON.stringify(repeat)) {
            summary.repeat_failures++;
            findings.push({ severity: 'error', code: 'determinism-mismatch' });
          }
        }
      } catch (error) {
        summary.state_failures++;
        findings.push({ severity: 'error', code: 'state-or-runtime-failure', message: error.message });
      }
      for (const f of findings) report.finding_counts[f.code] = (report.finding_counts[f.code] || 0) + 1;
      const errors = findings.filter(f => f && f.severity === 'error');
      if (errors.length) report.error_runs.push({ run_id: runId, scenario_id:scenarioId, playerId, opponentId, options, findings: errors });
      if (findings.length && report.findings.length < 50) report.findings.push({ run_id: runId, scenario_id:scenarioId, playerId, opponentId, options, findings });
      if (errors.length || (report.retained_logs.length < report.retained_log_limit && (findings.length || (playerId === opponentId && index === 0 && report.retained_logs.filter(l => l.format === format && !l.has_findings).length < 2)))) {
        const filename = runId + '.json';
        writeFileSync(new URL(filename, out), JSON.stringify({ run_id: runId, scenario_id:scenarioId, provenance, playerId, opponentId, player, opponent, options, result, findings }, null, 2) + '\n');
        report.retained_logs.push({ filename, format, has_findings: findings.length > 0 });
      }
    }
    console.log(format + ': ' + JSON.stringify(summary));
  }
  console.log('Retained logs and report: ' + fileURLToPath(out));
  console.log('Finding counts: ' + JSON.stringify(report.finding_counts));
  const failed = qualityGateFailed(report.modes, manifest.warning_budget);
  report.quality_gate = { passed: !failed, warning_budget: manifest.warning_budget };
  writeFileSync(new URL('report.json', out), JSON.stringify(report, null, 2) + '\n');
  return failed ? 1 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = main();
