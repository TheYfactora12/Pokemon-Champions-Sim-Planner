#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { createHash } from 'crypto';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportPath = path.join(ROOT, 'reports', 'champion_qa_baseline_snapshot.md');
const require = createRequire(import.meta.url);
const checkMode = process.argv.includes('--check');
const SOURCE_FILES = [
  'data.js',
  'generated/pokemon_showdown_legal_data.js',
  'move_support.js'
];

function loadVm(file, ctx) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  vm.runInContext(src, ctx, { filename: file });
}

function md(value) {
  return String(value == null || value === '' ? '-' : value)
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, '<br>');
}

function moveId(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function spreadText(member) {
  const spread = member && (member.sps || member.spread || member.evs) || {};
  const order = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
  return order.map(k => `${k.toUpperCase()} ${Number(spread[k] || 0)}`).join(' / ');
}

function teamStyle(team) {
  return team && (team.style || team.label || team.description || '-');
}

function recoilText(value) {
  if (!value) return '-';
  if (Array.isArray(value) && value.length >= 2) return `${value[0]}/${value[1]} damage dealt`;
  if (typeof value === 'object') {
    const num = value.numerator || value.num || value[0];
    const den = value.denominator || value.den || value[1];
    if (num && den) return `${num}/${den} damage dealt`;
  }
  return String(value);
}

function moveContext(row) {
  const shortDesc = row && row.shortDesc || row && row.short_desc || '';
  const desc = row && row.desc || '';
  return shortDesc || desc || '';
}

function sourceHash() {
  const h = createHash('sha256');
  for (const file of SOURCE_FILES) {
    h.update(file);
    h.update('\0');
    h.update(fs.readFileSync(path.join(ROOT, file), 'utf8'));
    h.update('\0');
  }
  return h.digest('hex').slice(0, 16);
}

const ctx = {
  console,
  module: { exports: {} },
  exports: {},
  require,
  globalThis: {},
  ChampionsSim: {}
};
ctx.globalThis = ctx;
vm.createContext(ctx);

loadVm('data.js', ctx);
loadVm('generated/pokemon_showdown_legal_data.js', ctx);
loadVm('move_support.js', ctx);

const teams = vm.runInContext('TEAMS', ctx);
const moveSupport = ctx.ChampionsSim.moveSupport;
const auditData = ctx.ChampionsSim.pokemonDataAudit || {};
const source = auditData.source || 'smogon/pokemon-showdown data/pokedex.ts + learnsets.ts + moves.ts';
const sourceVersion = auditData.sourceCommitOrVersion || 'unavailable';
const showdownMoves = auditData.moves || {};

const approvedTeams = Object.entries(teams || {})
  .filter(([, team]) => team && team.format === 'champions' && team.legality_status === 'legal')
  .sort(([a], [b]) => a.localeCompare(b));

const approvedMoves = new Set();
for (const [, team] of approvedTeams) {
  for (const member of team.members || []) {
    for (const move of member.moves || []) approvedMoves.add(move);
  }
}

const allShippedMoves = new Set();
for (const [, team] of Object.entries(teams || {})) {
  for (const member of (team && team.members) || []) {
    for (const move of member.moves || []) allShippedMoves.add(move);
  }
}

function supportRow(move) {
  const support = moveSupport.getLocalMoveSupport(move);
  const showdown = showdownMoves[support.moveId || moveId(move)] || {};
  return {
    move,
    support,
    type: support.effective && support.effective.type || support.local.type || support.showdown && support.showdown.type || '',
    category: support.effective && support.effective.category || support.local.category || support.showdown && support.showdown.category || '',
    basePower: support.effective && support.effective.basePower != null ? support.effective.basePower : '',
    target: support.effective && support.effective.target || support.local.target || support.showdown && support.showdown.target || '',
    source: support.effective && support.effective.source || '',
    accuracy: showdown.accuracy == null ? '' : showdown.accuracy,
    priority: showdown.priority == null ? 0 : showdown.priority,
    recoil: support.showdown && support.showdown.recoil ? support.showdown.recoil : showdown.recoil || null,
    context: moveContext(showdown) || support.effective && support.effective.shortDesc || support.effective && support.effective.desc || '',
    flags: showdown.flags || support.showdown && support.showdown.flags || '',
    tests: support.verification && support.verification.tests ? support.verification.tests.join(', ') : '',
    notes: support.notes || support.verification && support.verification.summary || ''
  };
}

const shippedRows = [...allShippedMoves].sort().map(supportRow);
const approvedMoveRows = [...approvedMoves].sort().map(supportRow);
const counts = shippedRows.reduce((acc, row) => {
  const level = row.support.supportLevel || 'unknown';
  acc[level] = (acc[level] || 0) + 1;
  return acc;
}, {});

const lines = [];
lines.push('# Champion QA Baseline Snapshot');
lines.push('');
lines.push('- Generated by: `node tools/generate-qa-baseline-snapshot.mjs`');
lines.push('- Snapshot source hash: sha256:' + sourceHash());
lines.push('- Source truth: Pokemon Showdown generated data plus local Champions overrides and verified simulator registry.');
lines.push('- Showdown source: ' + source);
lines.push('- Showdown source version: ' + sourceVersion);
lines.push('- Approved Champion runtime teams: ' + approvedTeams.length + ' including the player test team.');
lines.push('- Approved Champion opponent teams: ' + Math.max(0, approvedTeams.length - (teams && teams.player ? 1 : 0)));
lines.push('- Approved-team distinct moves: ' + approvedMoveRows.length);
lines.push('- All shipped distinct moves: ' + shippedRows.length);
lines.push('- All shipped verified: ' + (counts.verified || 0));
lines.push('- All shipped baseline: ' + (counts.baseline || 0));
lines.push('- All shipped incomplete: ' + (counts.incomplete || 0));
lines.push('');
lines.push('Use this file for QA orientation. It is generated from source data; do not hand-edit team or move rows. Regenerate with `node tools/generate-qa-baseline-snapshot.mjs` after changing team data, move metadata, move support, legality gates, or generated Showdown data.');
lines.push('');
lines.push('## Source-Truth Boundaries');
lines.push('');
lines.push('- Battle mechanics live in `engine.js` and generated runtime data, not directly in Supabase.');
lines.push('- Supabase can store approved source rows, teams, overrides, and audit history, but browser sim behavior must remain reproducible from the bundle.');
lines.push('- `verified` means an explicit local simulator regression or oracle case exists. `baseline` means metadata exists but dedicated behavior coverage is not enough for a 100% claim.');
lines.push('- Normal selectors should use approved Champion-legal teams only; custom teams still need legality checks before they can be trusted for QA.');
lines.push('- Recoil rows use Pokemon Showdown move metadata where available. The engine applies recoil from actual HP loss dealt to the target, not from uncapped overkill formula damage.');
lines.push('');
lines.push('## Approved Runtime Team Movesets');
lines.push('');
lines.push('| Team Key | Team Name | Slot | Pokemon | Item | Ability | Nature | SPs | Moves | Role |');
lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const [teamKey, team] of approvedTeams) {
  (team.members || []).forEach((member, index) => {
    lines.push([
      teamKey,
      team.name || teamKey,
      String(index + 1),
      member.name || member.species || '',
      member.item || '',
      member.ability || '',
      member.nature || '',
      spreadText(member),
      (member.moves || []).join(', '),
      member.role || teamStyle(team)
    ].map(md).join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
  });
}
lines.push('');
lines.push('## Approved Catalog Move Baseline');
lines.push('');
lines.push('| Move | Support | Type | Category | Base Power | Accuracy | Priority | Target | Source | Recoil | Showdown Context | Flags | Tests | Notes |');
lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const row of approvedMoveRows) {
  lines.push([
    row.move,
    row.support.supportLevel,
    row.type,
    row.category,
    row.basePower,
    row.accuracy,
    row.priority,
    row.target,
    row.source,
    recoilText(row.recoil),
    row.context,
    row.flags,
    row.tests,
    row.notes
  ].map(md).join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
}
lines.push('');
lines.push('## Recoil Move QA Context');
lines.push('');
lines.push('Recoil damage should be calculated from applied HP loss after the target HP cap. For example, if a recoil move calculates 150 damage into a target with 10 HP left, recoil uses 10 applied damage, not 150 overkill damage.');
lines.push('');
lines.push('| Move | Recoil Rule | Showdown Context | Local Coverage |');
lines.push('| --- | --- | --- | --- |');
for (const row of shippedRows.filter(row => row.recoil)) {
  lines.push([
    row.move,
    recoilText(row.recoil),
    row.context,
    row.tests || row.notes
  ].map(md).join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
}
lines.push('');
lines.push('## All Shipped Move Support Summary');
lines.push('');
lines.push('| Move | Support | Type | Category | Base Power | Target | Recoil | Showdown Context | Verification Notes |');
lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const row of shippedRows) {
  lines.push([
    row.move,
    row.support.supportLevel,
    row.type,
    row.category,
    row.basePower,
    row.target,
    recoilText(row.recoil),
    row.context,
    row.notes
  ].map(md).join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
}
lines.push('');

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
const output = lines.join('\n') + '\n';
if (checkMode) {
  const current = fs.existsSync(reportPath) ? fs.readFileSync(reportPath, 'utf8') : '';
  if (current !== output) {
    console.error('QA baseline snapshot is stale. Run `node tools/generate-qa-baseline-snapshot.mjs`.');
    process.exit(1);
  }
  console.log('QA baseline snapshot is current.');
} else {
  fs.writeFileSync(reportPath, output, 'utf8');
  console.log(`Wrote ${reportPath}`);
}
