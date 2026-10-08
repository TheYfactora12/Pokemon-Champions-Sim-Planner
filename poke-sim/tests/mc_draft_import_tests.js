const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');
function harness() {
  const file = path.join(__dirname, 't9j11_tests.js');
  const source = fs.readFileSync(file, 'utf8');
  const host = vm.createContext({ require: createRequire(file), __dirname, console,
    setTimeout, setInterval, clearTimeout, clearInterval });
  vm.runInContext(source.slice(0, source.indexOf('// Expose ctx-scoped')) + '\nthis.context = ctx;', host);
  const ctx = host.context;
  for (const name of ['generated/mc_review_reference.js', 'mc_review.js'])
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', name), 'utf8'), ctx);
  return ctx;
}
const member = {name:'Rillaboom', item:'Electric Seed', ability:'Grassy Surge', nature:'Adamant',
  level:50, evs:{hp:2,atk:32,def:0,spa:0,spd:0,spe:32}, moves:['Fake Out','Protect']};
const opts = {format:'champions', regulationId:'champions_reg_m_c_2026', draftOnly:true};
test('M-C draft intake saves reference-compatible sets without approving execution', () => {
  const ctx = harness(), before = JSON.stringify(member);
  const result = ctx.buildImportedTeamValidation([member], opts);
  assert.equal(result.canSave, true);
  assert.equal(result.valid, false);
  assert.equal(result.sourceVerified, false);
  assert.equal(result.canExecute, false);
  assert.equal(result.officialStatus, 'unverified');
  assert.equal(result.referenceStatus, 'matched');
  assert.equal(result.referencePin, ctx.MC_REVIEW_REFERENCE.pin);
  assert.equal(JSON.stringify(member), before);
  assert.equal(ctx.buildImportedTeamValidation([member], {format:'champions'}).valid, false);
});
test('draft restrictions still reject malformed or mismatched sets', () => {
  const ctx = harness();
  for (const delta of [{item:'Invented Seed'}, {ability:'Wonder Guard'}, {moves:['Splash']},
    {moves:['Protect','Protect']}, {ivs:{spe:0}}, {evs:{atk:33}}, {item:'Charizardite X'},
    {name:'Unknown'}, {species:'Pikachu'}, {tera:'Fire'}, {level:100}, {nature:'Invented'}, {ability:''}]) {
    assert.equal(ctx.buildImportedTeamValidation([{...member,...delta}], opts).canSave, false, JSON.stringify(delta));
  }
  assert.equal(ctx.buildImportedTeamValidation([member, member], opts).canSave, false);
});
test('missing reference and forged saved flags cannot authorize admission or execution', () => {
  const ctx = harness();
  vm.runInContext('MC_REVIEW_REFERENCE = undefined;', ctx);
  assert.equal(ctx.buildImportedTeamValidation([member], opts).canSave, false);
  assert.equal(ctx.validateTeam({format:'champions',members:[member],draftOnly:true,
    legality_status:'legal',regulation_id:'champions_reg_m_c_2026'}, 'champions').valid, false);
});
test('selected M-C paste preview and save agree, preserve sets locally and do not write DB', async () => {
  const ctx = harness();
  vm.runInContext(`selectedRegulationId = 'champions_reg_m_c_2026';
    this.dbWrites = 0; _upsertTeamToDB = function(){dbWrites++;};
    renderTeamsGrid = function(){}; rebuildTeamSelects = function(){};
    setTimeout = function(){};`, ctx);
  const paste = 'Rillaboom @ Electric Seed\nAbility: Grassy Surge\nAdamant Nature\nEVs: 32 Atk / 32 Spe / 2 HP\n- Fake Out\n- Protect';
  ctx.document.getElementById('showdown-paste').value = paste;
  ctx.document.getElementById('import-slot').value = '__new__';
  const members = ctx.parseShowdownPaste(paste);
  ctx.showImportPreview(members);
  assert.match(ctx.document.getElementById('import-flow-card').innerHTML, /Ready to save M-C draft/);
  await ctx.document.getElementById('do-import-btn')._listeners.click[0]();
  const saved = vm.runInContext('Object.values(TEAMS).find(t=>t.import_context && t.import_context.draft_only)', ctx);
  assert(saved);
  assert.equal(saved.legality_status, 'unverified');
  assert.equal(JSON.stringify(saved.members), JSON.stringify(members));
  assert.equal(ctx.dbWrites, 0);
  assert.match(JSON.stringify(ctx.localStorage._s), /Electric Seed/);
  assert.equal(ctx.csPasteImportOptions(saved).draftOnly, undefined, 'replacement is not a new draft');
  assert.equal(ctx.checkTeamForSelectedRegulation(saved, 'champions_reg_m_c_2026').allowed, false);
  assert.equal(ctx.checkTeamForSelectedRegulation(saved, 'champions_custom_practice').allowed, false);
});
test('save-only restriction persists across reload, edits and direct battle validation', () => {
  const ctx = harness();
  vm.runInContext(`this.dbWrites = 0;
    window.SupabaseAdapter = {enabled:true, saveTeam:function(){dbWrites++; return Promise.resolve();}};
    TEAMS.draft_test = {name:'Draft', source:'custom', format:'champions', legality_status:'unverified',
      import_context:{draft_only:true}, members:[{name:'Arcanine',ability:'Intimidate',nature:'Hardy',
      level:50,evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0},moves:['Protect']}]};
    currentPlayerKey = 'draft_test';
    saveCustomTeamsToStorage(); delete TEAMS.draft_test; loadCustomTeamsFromStorage();
    csPersistEditedTeam(TEAMS.draft_test);
    this.reloaded = TEAMS.draft_test;`, ctx);
  assert.equal(ctx.dbWrites, 0);
  assert.equal(ctx.reloaded.import_context.draft_only, true);
  assert.equal(ctx.isVisibleTeamInCatalog('draft_test', ctx.reloaded), true);
  assert.equal(ctx.getTeamLegalityVerdict('draft_test', ctx.reloaded).valid, false);
  assert.equal(ctx.validateTeam(ctx.reloaded, 'champions').valid, false);
  assert.equal(ctx.checkTeamForSelectedRegulation(ctx.reloaded, 'champions_custom_practice').allowed, false);
  vm.runInContext(`const ordinary = JSON.parse(JSON.stringify(reloaded));
    delete ordinary.import_context; _upsertTeamToDB('ordinary', ordinary, 'test');`, ctx);
  assert.equal(ctx.dbWrites, 1, 'positive control proves adapter is connected in this mock');
});
