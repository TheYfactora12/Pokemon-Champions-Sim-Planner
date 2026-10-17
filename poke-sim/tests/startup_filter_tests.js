const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ui = fs.readFileSync(path.join(__dirname, '..', 'ui.js'), 'utf8');
const helperStart = ui.indexOf('function csIsTournamentTeamKey(');
const helperEnd = ui.indexOf('function csTeamRulesetEvidence(', helperStart);
const filterStart = ui.indexOf('function teamMatchesFilter(');
const filterEnd = ui.indexOf('function countTeamsByFilter(', filterStart);
const ctx = vm.createContext({
  TOURNAMENT_TEAM_KEYS: undefined,
  isVisibleTeamInCatalog: (_key, team) => !team.hidden,
  csTeamRulesetEvidence: () => ({ ruleset_status: 'unknown' }),
  csTeamRulesetTags: () => []
});
const helper = helperStart >= 0 && helperEnd > helperStart ? ui.slice(helperStart, helperEnd) : '';
vm.runInContext(helper + ui.slice(filterStart, filterEnd), ctx);
assert.equal(ctx.teamMatchesFilter('player', { name: 'player' }, 'tournament'), false);
const members = ['champions_arena_1st', 'champions_arena_2nd', 'champions_arena_3rd',
  'aurora_veil_froslass', 'cofagrigus_tr', 'rin_sand', 'suica_sun'];
for (const key of members) {
  assert.equal(ctx.teamMatchesFilter(key, { name: key }, 'tournament'), true);
  assert.equal(ctx.teamMatchesFilter(key, { name: key, source: 'custom' }, 'tournament'), false);
  assert.equal(ctx.teamMatchesFilter(key, { name: key, hidden: true }, 'tournament'), false);
}
for (const key of ['player', 'mega_altaria', '__proto__', 'constructor', 'toString']) {
  assert.equal(ctx.teamMatchesFilter(key, { name: key }, 'tournament'), false);
}
assert.equal(ctx.teamMatchesFilter('player', null, 'tournament'), false);
assert.equal(ctx.teamMatchesFilter('custom', { source: 'custom' }, 'custom'), true);
console.log('Startup filter: 29 checks passed with no late registry initialization.');
