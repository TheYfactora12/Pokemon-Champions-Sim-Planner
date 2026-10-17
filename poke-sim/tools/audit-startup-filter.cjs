// Read-only diagnostic for #271; successful execution does not mean startup is fixed.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const ui = fs.readFileSync(path.join(__dirname, '..', 'ui.js'), 'utf8');
const begin = ui.indexOf('function teamMatchesFilter(');
const end = ui.indexOf('function countTeamsByFilter(', begin);
assert.ok(begin >= 0 && end > begin, 'Production filter boundaries must exist');
const assignment = ui.match(/var TOURNAMENT_TEAM_KEYS = (\{[\s\S]*?\});/);
const helperStart = ui.indexOf('function csIsTournamentTeamKey(');
const helperEnd = ui.indexOf('function csTeamRulesetEvidence(', helperStart);
const helper = helperStart >= 0 && helperEnd > helperStart ? ui.slice(helperStart, helperEnd) : '';
assert.ok(assignment || helper, 'Production tournament membership must exist');
const scenarios = [];
for (const initialized of [false, true]) {
  const context = vm.createContext({
    TOURNAMENT_TEAM_KEYS: undefined,
    isVisibleTeamInCatalog: () => true,
    csTeamRulesetEvidence: () => ({ ruleset_status: 'unknown' }),
    csTeamRulesetTags: () => []
  });
  vm.runInContext(helper + ui.slice(begin, end), context);
  if (initialized && assignment) vm.runInContext('TOURNAMENT_TEAM_KEYS = ' + assignment[1], context);
  for (const key of ['player', 'champions_arena_1st']) {
    try {
      const result = context.teamMatchesFilter(key, { name: key }, 'tournament');
      scenarios.push({ initialized, key, result, error: null });
    } catch (error) {
      scenarios.push({ initialized, key, error: error.message });
    }
  }
}
console.log(JSON.stringify({
  issue: 'TheYfactora12/Pokemon-Champions-Sim-Planner#271',
  scope: 'Actual production filter; visibility/evidence helpers stubbed. No browser timing reproduction.',
  missingRegistryThrows: scenarios.some(row => !row.initialized && row.error),
  initializedRegistryWorks: scenarios.filter(row => row.initialized).every(row => !row.error),
  scenarios
}, null, 2));
