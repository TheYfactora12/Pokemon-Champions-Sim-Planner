#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import {createRequire} from 'module';
import {fileURLToPath} from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportPath = path.join(ROOT, 'reports', 'move_support_audit.md');
const require = createRequire(import.meta.url);

function loadVm(file, ctx) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  vm.runInContext(src, ctx, { filename: file });
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

const moveSupport = ctx.ChampionsSim.moveSupport;
const teams = vm.runInContext('TEAMS', ctx);

const teamUsage = new Map();
for (const [teamKey, team] of Object.entries(teams || {})) {
  for (const mon of team.members || []) {
    for (const move of mon.moves || []) {
      if (!teamUsage.has(move)) teamUsage.set(move, new Set());
      teamUsage.get(move).add(teamKey);
    }
  }
}

const rows = [...teamUsage.keys()].sort().map((move) => {
  const support = moveSupport.getLocalMoveSupport(move);
  return {
    move,
    supportLevel: support.supportLevel,
    verified: support.verified ? 'yes' : 'no',
    verificationSummary: support.verification ? support.verification.summary : '',
    verificationTests: support.verification ? support.verification.tests.join(', ') : '',
    verificationSources: support.verification ? support.verification.sources.join(', ') : '',
    localType: support.local.type || '',
    localCategory: support.local.category || '',
    localBasePower: support.local.basePower,
    localTarget: support.local.target || '',
    showdownType: support.showdown ? support.showdown.type : '',
    showdownCategory: support.showdown ? support.showdown.category : '',
    showdownBasePower: support.showdown ? support.showdown.basePower : '',
    showdownTarget: support.showdown ? support.showdown.target : '',
    effectiveType: support.effective ? support.effective.type : '',
    effectiveCategory: support.effective ? support.effective.category : '',
    effectiveBasePower: support.effective ? support.effective.basePower : '',
    effectiveTarget: support.effective ? support.effective.target : '',
    effectiveSource: support.effective ? support.effective.source : '',
    teams: [...teamUsage.get(move)].sort().join(', '),
    notes: support.notes
  };
});

const counts = rows.reduce((acc, row) => {
  acc[row.supportLevel] = (acc[row.supportLevel] || 0) + 1;
  return acc;
}, {});

const lines = [];
lines.push('# Move Support Audit');
lines.push('');
lines.push('- Generated at: ' + new Date().toISOString());
lines.push('- Source: ' + (rows[0] ? moveSupport.getLocalMoveSupport(rows[0].move).source : 'unavailable'));
lines.push('- Source version: ' + (rows[0] ? moveSupport.getLocalMoveSupport(rows[0].move).sourceVersion : 'unavailable'));
lines.push('- Shipped distinct moves audited: ' + rows.length);
lines.push('- Verified: ' + (counts.verified || 0));
lines.push('- Baseline: ' + (counts.baseline || 0));
lines.push('- Incomplete: ' + (counts.incomplete || 0));
lines.push('');
lines.push('`verified` = explicit sim regression coverage exists.');
lines.push('`baseline` = core Showdown/local runtime metadata exists, but no dedicated edge-case regression tag yet.');
lines.push('`incomplete` = runtime metadata is missing at least one core registry field.');
lines.push('');
lines.push('| Move | Support | Verified | Effective | Local | Showdown | Teams | Verification | Tests | Sources | Notes |');
lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const row of rows) {
  const local = [row.localType, row.localCategory, row.localBasePower, row.localTarget].join(' / ');
  const source = [row.showdownType, row.showdownCategory, row.showdownBasePower, row.showdownTarget].join(' / ');
  const effective = [row.effectiveType, row.effectiveCategory, row.effectiveBasePower, row.effectiveTarget, row.effectiveSource].join(' / ');
  lines.push(`| ${row.move} | ${row.supportLevel} | ${row.verified} | ${effective} | ${local} | ${source} | ${row.teams} | ${row.verificationSummary} | ${row.verificationTests} | ${row.verificationSources} | ${row.notes} |`);
}
lines.push('');

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, lines.join('\n') + '\n', 'utf8');
console.log(`Wrote ${reportPath}`);
