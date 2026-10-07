import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
const source = fs.readFileSync(new URL('../ui.js', import.meta.url), 'utf8');
const ctx = vm.createContext({
  _escapeHtml: s => String(s).replaceAll('<', '&lt;').replaceAll('"', '&quot;'),
  csTeamRulesetEvidence: team => ({ runtime_promotable: team.promoted === true })
});
vm.runInContext(source.slice(source.indexOf('function csRenderTeamValidationBadge('), source.indexOf('function csGetRegmbCoverageSections(')), ctx);
const render = ctx.csRenderTeamValidationBadge;

test('restoring a saved regulation refreshes cards with the restored identity', () => {
  const start = source.indexOf("    var savedRegulation = Storage.get('regulation:selection:v1');");
  const end = source.indexOf("  document.querySelectorAll('[data-regulation-select]')", start);
  const local = vm.createContext({Storage:{get:()=>({id:'champions_reg_m_c_2026'})}, selectedRegulationId:'champions_custom_practice'});
  local.renderTeamsGrid = () => { local.renderedId = local.selectedRegulationId; };
  vm.runInContext('try {\n' + source.slice(start,end),local);
  assert.equal(local.renderedId,'champions_reg_m_c_2026');
});

test('changing regulation refreshes team-card validation', () => {
  const calls = [];
  const local = vm.createContext({Storage:{set(){}}, refreshRegulationControls:()=>calls.push('controls'), renderTeamsGrid:()=>calls.push('cards')});
  vm.runInContext(source.slice(source.indexOf('function setSelectedRegulationId('), source.indexOf('function selectedRegulationCheck(')), local);
  local.setSelectedRegulationId('champions_reg_m_c_2026');
  assert.deepEqual(calls, ['controls','cards']);
});

test('live team cards use the selected-regulation result, preserving errors and gaps', () => {
  ctx.checkTeamForSelectedRegulation = () => {};
  ctx.selectedRegulationCheck = () => ({status:'illegal', errors:['Register four to six Pokemon'], source_gaps:['M-C approval pending']});
  ctx.regulationCheckHtml = check => check.status + ': ' + check.errors.concat(check.source_gaps).join('; ');
  try {
    const html = render({format:'champions'}, {valid:true});
    assert.match(html, /badge-illegal/);
    assert.match(html, /Register four to six Pokemon/);
    assert.match(html, /M-C approval pending/);
    ctx.selectedRegulationCheck = () => ({status:'not_verified', errors:[], source_gaps:['M-C approval pending']});
    assert.match(render({}, {valid:false}), /badge-warn/);
  } finally {
    delete ctx.checkTeamForSelectedRegulation;
    delete ctx.selectedRegulationCheck;
    delete ctx.regulationCheckHtml;
  }
});
test('historical, unknown and review-only contexts cannot inherit a LEGAL label', () => {
  for (const status of ['historical', 'unknown', 'source_review']) {
    const html = render({ format: 'champions', legality_status: 'legal', ruleset_status: status }, { valid: true });
    assert.match(html, /LEGALITY UNVERIFIED/);
    assert.doesNotMatch(html, /badge-legal/);
  }
});
test('passing local checks is not tournament approval, even for a promoted ruleset', () => {
  assert.match(render({ promoted: true, format: 'champions' }, { valid: true }), /TEAM CHECK PASSED/);
  assert.match(render({ promoted: true, format: 'champions' }, { valid: true, inferred: true }), /INFERRED SET/);
  assert.match(render({ promoted: true }, {}), /LEGALITY UNVERIFIED/);
});
test('validation failures and SV compatibility remain distinct and escaped', () => {
  assert.match(render({}, { valid: false, errors: ['<bad>'] }), /TEAM CHECK FAILED/);
  assert.doesNotMatch(render({}, { valid: false, errors: ['<bad>'] }), /<bad>/);
  assert.match(render({ format: 'sv' }, { valid: true }), /SV COMPAT ONLY/);
});
test('team cards use the scoped badge instead of the old metadata-only shortcut', () => {
  const grid = source.slice(source.indexOf('function renderTeamsGrid('), source.indexOf('function renderTeamsGrid(') + 6500);
  assert.match(grid, /csRenderTeamValidationBadge\(team, legalityVerdict\)/);
  assert.doesNotMatch(grid, /st === 'legal' && fmt === 'champions'/);
});
