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
  assert.equal(ctx.csPasteImportOptions(saved).draftOnly, true, 'existing draft retains its intake context');
  assert.equal(ctx.checkTeamForSelectedRegulation(saved, 'champions_reg_m_c_2026').allowed, false);
  assert.equal(ctx.checkTeamForSelectedRegulation(saved, 'champions_custom_practice').allowed, false);
});
test('M-C bulk and JSON intake share paste checks and discard forged approval metadata', () => {
  const ctx = harness();
  vm.runInContext("selectedRegulationId = 'champions_reg_m_c_2026'; this.TEAMS = TEAMS;", ctx);
  const incoming = {name:'Reference fixture',format:'champions',members:[member],
    legality_status:'legal', import_context:{draft_only:false,official_status:'approved'}};
  const bulk = ctx.importCustomTeamsBulk([incoming]);
  assert.equal(bulk.added, 1, JSON.stringify(bulk));
  const json = ctx.importFromJsonText(JSON.stringify({version:1,teams:{fixture:incoming}}));
  assert.equal(json.added, 1, JSON.stringify(json));
  for (const key of bulk.keys.concat(json.keys)) {
    const saved = ctx.TEAMS[key];
    assert.equal(saved.legality_status, 'unverified');
    assert.equal(saved.import_context.draft_only, true);
    assert.equal(saved.import_context.reference_pin, ctx.MC_REVIEW_REFERENCE.pin);
    assert.equal(ctx.checkTeamForSelectedRegulation(saved,'champions_custom_practice').allowed,false);
  }
  const bad = ctx.importCustomTeamsBulk([{...incoming,members:[{...member,item:'Invented Seed'}]}]);
  assert.equal(bad.added,0);
  vm.runInContext("selectedRegulationId = 'champions_custom_practice';", ctx);
  assert.equal(ctx.importCustomTeamsBulk([incoming]).added,0,'historical practice is not silently promoted');
});
test('existing M-C draft paste replacement retains identity and source context', async () => {
  const ctx = harness();
  ctx.fixture = member;
  vm.runInContext(`TEAMS.draft_edit={name:'Draft edit',source:'custom',format:'champions',
    import_context:{draft_only:true,regulation_id:'champions_reg_m_c_2026'},
    members:[Object.assign({},fixture,{member_id:'stable-1'})]};
    selectedRegulationId='champions_custom_practice';
    renderTeamsGrid=function(){}; renderRoster=function(){}; setTimeout=function(){};
    this.TEAMS=TEAMS;`,ctx);
  ctx.document.getElementById('import-slot').value='draft_edit';
  ctx.document.getElementById('showdown-paste').value='Rillaboom @ Electric Seed\nAbility: Grassy Surge\nAdamant Nature\nEVs: 32 Atk / 32 Spe / 2 HP\n- Fake Out\n- Protect';
  await ctx.document.getElementById('do-import-btn')._listeners.click[0]();
  assert.match(ctx.document.getElementById('import-status').textContent,/Loaded/);
  assert.equal(ctx.TEAMS.draft_edit.members[0].member_id,'stable-1');
  assert.equal(ctx.TEAMS.draft_edit.import_context.reference_pin,ctx.MC_REVIEW_REFERENCE.pin);
  assert.equal(ctx.TEAMS.draft_edit.import_context.draft_only,true);
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
test('JSON roundtrip preserves restrictive context even outside selected M-C', () => {
  const ctx = harness();
  vm.runInContext("selectedRegulationId='champions_custom_practice'; this.TEAMS=TEAMS; this.writes=0; window.SupabaseAdapter={enabled:true,saveTeam:function(){writes++;return Promise.resolve();}};",ctx);
  for (const mon of [member,{...member,name:'Arcanine',ability:'Intimidate',item:'',moves:['Protect']}]) {
    const incoming={name:'Draft roundtrip',format:'champions',source:'custom',members:[mon],
      import_context:{draft_only:true,regulation_id:'champions_reg_m_c_2026'}};
    const result=ctx.importFromJsonText(JSON.stringify({version:1,teams:{draft:incoming}}));
    assert.equal(result.added,1,JSON.stringify(result));
    assert.equal(ctx.TEAMS[result.keys[0]].import_context.draft_only,true);
  }
  assert.equal(ctx.writes,0);
});
test('direct engine refuses saved drafts regardless of side or strict option', () => {
  const ctx = harness();
  const ordinary={name:'Engine fixture',format:'champions',members:[{...member,name:'Arcanine',ability:'Intimidate',item:'',moves:['Protect']}]};
  const draft={...ordinary,import_context:{draft_only:true,regulation_id:'champions_reg_m_c_2026'}};
  for(const strict of [undefined,false,true]) for(const side of [0,1]) {
    const result=ctx.simulateBattle(side ? ordinary : draft,side ? draft : ordinary,{strict,maxTurns:1,seed:[1,2,3,4]});
    assert.equal(result.result,'error');
    assert.equal(result.turns,0);
    assert.match(result.winCondition,/draft/);
  }
});
test('M-C editor choices use M-C reference and never promise approved legality', () => {
  const ctx=harness();
  const moves=ctx.getRegulationChoices('move','Rillaboom','champions_reg_m_c_2026',false);
  assert(moves.some(row=>row.name==='Fake Out'));
  assert(!moves.some(row=>row.name==='Spore'));
  const items=ctx.getRegulationChoices('item','','champions_reg_m_c_2026',false);
  assert(items.some(row=>row.name==='Electric Seed'));
  for(const row of moves.concat(items)) {
    assert.equal(row.status,'reference_only');
    assert.equal(row.competitive_eligible,false);
    assert.equal(row.source_version,ctx.MC_REVIEW_REFERENCE.pin);
  }
  vm.runInContext('MC_REVIEW_REFERENCE = undefined;',ctx);
  assert.equal(ctx.getRegulationChoices('move','Rillaboom','champions_reg_m_c_2026',false).length,0);
});
test('actual M-C editor accepts valid changes but rejects invalid moves without changing identity', () => {
  const ctx=harness(); ctx.fixture=member;
  vm.runInContext(`TEAMS.draft_editor={name:'Draft editor',source:'custom',format:'champions',
    import_context:{draft_only:true,regulation_id:'champions_reg_m_c_2026'},
    members:[Object.assign({},fixture,{member_id:'editor-stable'})]};
    currentPlayerKey='draft_editor'; getEditablePlayerTeam=function(){return TEAMS.draft_editor;};
    csRefreshEditorTeamViews=function(){}; setTimeout=function(){}; this.TEAMS=TEAMS;`,ctx);
  ctx.document.getElementById('player-select').value='draft_editor';
  ctx.openEditorForm(0);
  const fields={'ed-name':'Rillaboom','ed-ability':'Grassy Surge','ed-item':'Electric Seed',
    'ed-nature':'Jolly','ed-level':'50','ed-role':'','ed-mv-0':'Fake Out','ed-mv-1':'Protect','ed-mv-2':'','ed-mv-3':''};
  for(const [id,value] of Object.entries(fields))ctx.document.getElementById(id).value=value;
  for(const [stat,value] of Object.entries(member.evs))ctx.document.getElementById('ev-'+stat).value=String(value);
  ctx.saveEdits();
  assert.equal(ctx.TEAMS.draft_editor.members[0].nature,'Jolly');
  assert.equal(ctx.TEAMS.draft_editor.members[0].member_id,'editor-stable');
  assert.equal(ctx.TEAMS.draft_editor.import_context.draft_only,true);
  const before=JSON.stringify(ctx.TEAMS.draft_editor.members);
  ctx.document.getElementById('ed-mv-0').value='Spore'; ctx.saveEdits();
  assert.equal(JSON.stringify(ctx.TEAMS.draft_editor.members),before);
});
test('unsupported stored draft context fails closed instead of using a historical pool', () => {
  const ctx=harness();
  for(const context of ['unknown_context','champions_reg_m_b_2026',null]) {
    const draft={format:'champions',members:[{...member,name:'Arcanine',ability:'Intimidate',item:'',moves:['Protect']}],
      import_context:{draft_only:true,regulation_id:context}};
    const before=JSON.stringify(draft);
    const verdict=ctx.buildImportedTeamValidation(draft.members,ctx.csPasteImportOptions(draft));
    assert.equal(verdict.valid,false);
    assert.equal(verdict.canSave,false);
    assert.equal(verdict.sourceVerified,false);
    assert.equal(JSON.stringify(draft),before);
  }
});
