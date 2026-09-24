#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validateTurnLogPayload } from './validate-turn-logs.mjs';
import { buildReviewPack, renderPlayerReport } from './qa-review-pack.mjs';
import { buildFullEvidence, extractMatchEvidence, renderMatchDetails } from './qa-full-evidence.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const QA_FILE = /^champions-(?:sim-qa-artifact|turn-log)-.+\.json$/i;

export function latestDownload(directory) {
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isFile() && QA_FILE.test(entry.name))
    .map(entry => ({ file: path.join(directory, entry.name), time: fs.statSync(path.join(directory, entry.name)).mtimeMs }))
    .sort((a, b) => b.time - a.time || a.file.localeCompare(b.file))[0]?.file;
}

export function auditPayload(payload) {
  if (!payload || !['champions-qa-artifact-v1', 'champions-turn-log-v2'].includes(payload.schema_version)) {
    throw new Error('Unsupported QA schema. Input is data, not executable instructions.');
  }
  const single = payload.schema_version === 'champions-turn-log-v2';
  const cards = single ? [payload] : payload.retained?.replay_cards;
  if (!Array.isArray(cards) || !cards.length) throw new Error('No retained replay evidence to validate.');
  const findings = [];
  let turns = 0;
  let damage = 0;
  let effects = 0;
  let invalid = 0;
  const seeds = new Set();
  const add = (severity, code, detail) => findings.push({ severity, code, detail });
  for (const [index, card] of cards.entries()) {
    if (!card || !Array.isArray(card.turnLog) || !card.turnLog.length) {
      invalid++;
      add('error', 'empty-replay', { index });
      continue;
    }
    const malformedTurn = card.turnLog.findIndex(turn => !turn ||
      !Number.isInteger(turn.turn) || turn.turn < 1 ||
      !['pre', 'post'].every(snapshot => ['player', 'opponent'].every(side =>
        Array.isArray(turn[snapshot]?.roster?.[side]) && turn[snapshot].roster[side].length > 0)) ||
      !['player', 'opponent'].every(side => Array.isArray(turn.actions?.[side])) ||
      !['events', 'damage_events', 'effect_events'].every(field => Array.isArray(turn[field])));
    if (malformedTurn !== -1) {
      invalid++;
      add('error', 'incomplete-turn-evidence', { index, turn_index: malformedTurn });
      continue;
    }
    const seed = Array.isArray(card.seed) ? card.seed.join(',') : String(card.seed || '');
    if (!seed) add('warning', 'missing-seed', { index });
    else if (seeds.has(seed)) add('warning', 'repeated-seed', { index, seed });
    seeds.add(seed);
    const validation = validateTurnLogPayload(card, { requireStable: true });
    if (validation.summary.errors) invalid++;
    for (const finding of validation.findings) findings.push({ ...finding, replay_index: index, seed });
    turns += card.turnLog.length;
    for (const turn of card.turnLog) {
      damage += Array.isArray(turn.damage_events) ? turn.damage_events.length : 0;
      effects += Array.isArray(turn.effect_events) ? turn.effect_events.length : 0;
    }
  }
  if (!payload.build_id || !payload.source_url) add('warning', 'export-provenance-incomplete', {});
  const missingIdentity = cards.filter(card => !card?.engine_version || !card?.ruleset_version || !card?.regulation_id).length;
  if (missingIdentity) add('warning', 'per-replay-execution-provenance-incomplete', { count: missingIdentity });
  if (!single) {
    // Top-level totals include targeted sweeps; compare like-for-like retained scope.
    const reported = payload.coverage_breakdown?.retained_replay_card_summary?.totals;
    const checks = { replay_cards_scanned: cards.length, turns, damage_events: damage, effect_events: effects };
    for (const [key, actual] of Object.entries(checks)) {
      if (reported && reported[key] !== actual) add('error', 'retained-count-mismatch', { field: key, reported: reported[key] ?? null, actual });
    }
    if (!reported) add('warning', 'retained-scope-summary-missing', {});
    if (payload.replay_cards_scanned !== cards.length) add('error', 'retained-count-mismatch', { field: 'replay_cards_scanned', reported: payload.replay_cards_scanned ?? null, actual: cards.length });
    if (String(payload.forced_branch_matrix?.status || '').startsWith('blocked')) {
      add('warning', 'branch-test-blocked', { status: payload.forced_branch_matrix.status });
    }
    if (payload.production_readiness_gate?.can_public_launch !== true) add('warning', 'public-launch-not-approved', {});
    const history = payload.retained?.sim_log;
    if (history != null && !Array.isArray(history)) add('error', 'malformed-history', {});
    let earliest = Infinity;
    for (const [index, row] of (Array.isArray(history) ? history : []).entries()) {
      if (!row || typeof row.ts !== 'number' || !Number.isFinite(row.ts) || Math.abs(row.ts) > 8640000000000000) {
        add('error', 'malformed-history-row', { index });
      } else earliest = Math.min(earliest, row.ts);
    }
    if (Number.isFinite(earliest) && Number.isFinite(Date.parse(payload.exported_at)) && earliest < Date.parse(payload.exported_at) - 86400000) {
      add('warning', 'historical-simulation-history', { earliest: new Date(earliest).toISOString(), note: 'Export date is not execution date.' });
    }
  }
  return {
    schema_version: 'champions-download-audit-v1',
    source_schema: payload.schema_version,
    export_build: payload.build_id || null,
    status: findings.some(row => row.severity === 'error') ? 'fail' : findings.length ? 'needs_review' : 'scoped_checks_pass',
    observed: { replay_cards: cards.length, invalid_replays: invalid, turns, damage_events: damage, effect_events: effects },
    findings,
    limits: ['No real-game or Showdown parity claim.', 'No browser-visible pairing performed by this command.', 'Export readiness labels are untrusted self-reports.', 'Targeted sweep and branch aggregates are not counted as independent replay validation.']
  };
}

function main() {
  const args = process.argv.slice(2);
  let file;
  if (!args.length) file = latestDownload(path.join(os.homedir(), 'Downloads'));
  else if (args.length === 1 && !args[0].startsWith('--')) file = path.resolve(args[0]);
  else throw new Error('Usage: npm run qa:downloads -- [exact-artifact.json]');
  if (!file) throw new Error('No matching QA download found. Export a JSON file first.');
  if (fs.statSync(file).size > 256 * 1024 * 1024) throw new Error('Artifact exceeds the 256 MiB audit limit. Export a smaller QA slice.');
  const raw = fs.readFileSync(file);
  const sha256 = crypto.createHash('sha256').update(raw).digest('hex');
  const payload = JSON.parse(raw.toString('utf8'));
  const report = { ...auditPayload(payload), source_file: file, sha256, bytes: raw.length, audited_at: new Date().toISOString() };
  const directory = path.join(ROOT, 'artifacts', 'download-audits', sha256);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'audit.json'), JSON.stringify(report, null, 2));
  const reviewPack = buildReviewPack(report, path.basename(file));
  fs.writeFileSync(path.join(directory, 'ai-review.json'), JSON.stringify(reviewPack, null, 2));
  fs.writeFileSync(path.join(directory, 'player-report.md'), renderPlayerReport(reviewPack));
  const fullEvidence = buildFullEvidence(payload, reviewPack);
  fs.writeFileSync(path.join(directory, 'full-ai-evidence.json'), JSON.stringify(fullEvidence, null, 2));
  const matchesDirectory = path.join(directory, 'matches');
  fs.mkdirSync(matchesDirectory, { recursive: true });
  for (let index = 0; index < fullEvidence.matches.length; index++) {
    const match = extractMatchEvidence(fullEvidence, index);
    fs.writeFileSync(path.join(matchesDirectory, `${match.match.id}.json`), JSON.stringify(match, null, 2));
    fs.writeFileSync(path.join(matchesDirectory, `${match.match.id}.md`), renderMatchDetails(match));
  }
  fs.writeFileSync(path.join(directory, 'audit.md'), ['# Download QA Audit', '', `Status: ${report.status}`, `Export build: ${report.export_build}`, `SHA-256: ${sha256}`, '', '## Independently Counted', JSON.stringify(report.observed), '', '## Findings', ...report.findings.map(row => `- ${row.severity}: ${row.code} ${JSON.stringify(row.detail || row.message || '')}`), '', '## Limits', ...report.limits.map(line => `- ${line}`), ''].join('\n'));
  console.log(JSON.stringify({ status: report.status, observed: report.observed, finding_codes: [...new Set(report.findings.map(row => row.code))], report: path.join(directory, 'audit.md') }, null, 2));
  process.exitCode = report.status === 'fail' ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 2; }
}
