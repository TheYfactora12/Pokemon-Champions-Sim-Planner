import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const source = readFileSync(new URL('../ui.js', import.meta.url), 'utf8');
const rebuild = source.slice(source.indexOf('function rebuildTeamSelects()'), source.indexOf('// ---- Initial renders ----'));
for (const scenario of ['fallback', 'mirror', 'empty']) {
  test(`catalog rebuild renders final selection: ${scenario}`, () => {
    const teams = { a: {name:'Alpha',members:['A']}, b: {name:'Beta',members:['B']} };
    const nodes = {'player-select':{value:scenario==='mirror'?'b':'removed',appendChild(){}},
      'opponent-select':{value:'b',appendChild(){}},'player-team-name':{},'opp-team-name':{}};
    const rendered = {};
    const context = vm.createContext({TEAMS:teams,currentPlayerKey:'removed',
      document:{getElementById:id=>nodes[id],createElement:()=>({})},
      getVisibleTeamKeys:()=>scenario==='empty'?[]:['a','b'],
      isVisibleTeamInCatalog:()=>scenario!=='empty',
      getDefaultVisiblePlayerTeamKey:()=>scenario==='empty'?'':'a',
      getDefaultVisibleOpponentTeamKey:player=>scenario==='empty'?'':player==='b'?'a':'b',
      applyLadderGate(){},renderRoster:(id,members)=>{rendered[id]=members;}});
    vm.runInContext(rebuild+'\nrebuildTeamSelects();',context);
    if (scenario !== 'empty') assert.notEqual(nodes['player-select'].value, nodes['opponent-select'].value,
      'Selected-matchup policy must be applied before showing the teams, not first at Run');
    for (const [select,title,roster] of [['player-select','player-team-name','player-roster'],['opponent-select','opp-team-name','opp-roster']]) {
      const team=teams[nodes[select].value];
      assert.equal(nodes[title].textContent,team?team.name:'No available team');
      assert.deepEqual(Array.from(rendered[roster]),team?team.members:[]);
    }
  });
}
