const {test}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync(require('node:path').join(__dirname,'../ui.js'),'utf8');
test('regulation changes rebuild selectors before legality status; running battles do not change selection',()=>{
 const calls=[],c=vm.createContext({selectedRegulationId:'old',simRunning:false,Storage:{set:()=>{}},rebuildTeamSelects:()=>calls.push('catalog'),refreshRegulationControls:()=>calls.push('status')});
 vm.runInContext(src.slice(src.indexOf('function setSelectedRegulationId('),src.indexOf('function selectedRegulationCheck(')),c);
 assert.equal(c.setSelectedRegulationId('champions_mc_reference'),true);assert.deepEqual(calls,['catalog','status']);
 c.simRunning=true;assert.equal(c.setSelectedRegulationId('old'),false);assert.equal(c.selectedRegulationId,'champions_mc_reference');
});
test('ordered events do not append a blocked Fake Out as an extra late used move',()=>{
 const c=vm.createContext({_escapeHtml:s=>String(s)});
 vm.runInContext(src.slice(src.indexOf('function csRenderReplayPlayByPlay('),src.indexOf('function _csResolveSnapshotKey(')),c);
 const turn={actions:{player:[{actor:'Pikachu',move:'Fake Out'}],opponent:[{actor:'Farigiraf',move:'Psychic'}]},events:[{text:'Armor Tail blocked Fake Out on Farigiraf!'},{text:'Farigiraf used Psychic!'}],effect_events:[{actor:'Pikachu',target:'Farigiraf',effect_kind:'move-failure',failed_move:'Fake Out',failure_reason:'armor_tail_priority_block'}]};
 const html=c.csRenderReplayPlayByPlay(turn);assert.match(html,/Armor Tail blocked Fake Out/);assert.match(html,/Farigiraf used Psychic!/);assert.doesNotMatch(html,/Pikachu used Fake Out/);
 turn.events.unshift({text:'Pikachu used Fake Out!'});assert.match(c.csRenderReplayPlayByPlay(turn),/Pikachu used Fake Out/);
 turn.events=[{text:'Armor Tail blocked Fake Out on Farigiraf!'}];
 const blocked=c.csRenderReplayPlayByPlay(turn);assert.match(blocked,/Armor Tail blocked/);assert.doesNotMatch(blocked,/used Fake Out|used Psychic/);
});
