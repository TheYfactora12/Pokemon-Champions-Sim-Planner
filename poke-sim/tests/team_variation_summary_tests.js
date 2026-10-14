const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {addValidatedBattle} = require('../tools/team-variation-summary.cjs');
test('summary separates phases, draws, terminal, timer and truncated outcomes', () => {
  const rows = {};
  addValidatedBattle(rows,'seeds','a','b',{result:'win',turns:4,terminal:true,timerExpired:false});
  addValidatedBattle(rows,'seeds','a','b',{result:'draw',turns:6,terminal:true,timerExpired:true});
  addValidatedBattle(rows,'seeds','a','b',{result:'loss',turns:40,terminal:false,timerExpired:false});
  addValidatedBattle(rows,'bring','a','b',{result:'win',turns:3,terminal:true});
  const row=rows[JSON.stringify(['seeds','a','b'])];
  assert.deepEqual([row.games,row.terminal,row.timer,row.truncated,row.total_turns],[3,2,1,1,50]);
  assert.deepEqual(row.outcomes,{win:1,draw:1,loss:1});
  assert.equal(Object.keys(rows).length,2);
});
test('matrix renders draw count between losses and average turns', () => {
  const ui=fs.readFileSync(path.join(__dirname,'../ui.js'),'utf8');
  const row=ui.slice(ui.indexOf('const winPct=Math.round(res.winRate*100)'),ui.indexOf('tbody.appendChild(tr)'));
  assert.ok(row.indexOf('${res.losses}') < row.indexOf('${res.draws}'));
  assert.ok(row.indexOf('${res.draws}') < row.indexOf('${res.avgTurns.toFixed(1)}'));
  assert.match(ui,/colspan="8"[^\n]*Running all matchups/);
  const vm=require('node:vm');
  const element={};
  const context={document:{createElement:()=>element},TEAMS:{opponent:{name:'Draw fixture'}},opp:'opponent',res:{winRate:.65,wins:65,losses:34,draws:1,avgTurns:4.4,avgTrTurns:0,provenance:{ruleset_id:'champions_mc_reference'}}};
  vm.runInNewContext(row,context);
  const cells=Array.from(element.innerHTML.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g),m=>m[1].replace(/<[^>]+>/g,''));
  assert.deepEqual(cells,['Draw fixture','65%','65','34','1','4.4','0.0','Reference only']);
});
