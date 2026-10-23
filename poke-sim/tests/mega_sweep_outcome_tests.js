const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),context=vm.createContext({console});
for(const file of ['outcome_policy.js','engine.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const ko=(result)=>({result,terminal:true,timerExpired:false,playerSurvivors:result==='win'?2:0,oppSurvivors:result==='loss'?2:0});
const excluded=[{result:'win',terminal:false,timerExpired:false},{...ko('win'),timerExpired:true},{result:'error'}, {...ko('win'),result:'loss'}, {result:'draw',terminal:true,timerExpired:false,playerSurvivors:0,oppSurvivors:0},{result:'win'},null];
let queue=[ko('win'),ko('loss'),...excluded];let calls=[];
context.simulateBattle=(a,b,opts)=>{calls.push(opts);a.members[0].name='mutated';return queue.shift();};
const a={members:[{name:'A'}]},b={members:[{name:'B'}]},original=JSON.stringify([a,b]);
const cell=context.runMegaSweepCell(a,b,3,'at_turn',2,9,{format:'doubles',rulesetId:'test'});
assert.equal(cell.n,2);assert.equal(cell.wins,1);assert.equal(cell.losses,1);assert.equal(cell.draws,0);assert.equal(cell.wr,.5);assert.equal(cell.requestedBattles,9);assert.equal(cell.excludedOutcomes,7);assert.equal(cell.outcome_records.length,9);assert.equal(Object.values(cell.exclusionReasons).reduce((a,b)=>a+b,0),7);assert.equal(JSON.stringify([a,b]),original);assert(calls.every(x=>x.bo===3&&x.format==='doubles'&&x.rulesetId==='test'&&x._megaPolicyOverride.triggerTurn===2));
queue=excluded.slice();assert.throws(()=>context.runMegaSweepCell(a,b,1,'never',null,queue.length),err=>{assert.equal(err.results.n,0);assert.equal(err.results.wr,null);assert.equal(err.results.ci95,null);assert.equal(err.results.excludedOutcomes,7);return /no verified outcomes/i.test(err.message);});
for(const n of [0,-1,1.5,NaN])assert.throws(()=>context.runMegaSweepCell(a,b,1,'never',null,n),/positive integer/);
queue=[{...ko('win'),winner:'opp'}];const winnerField=context.runMegaSweepCell(a,b,1,'never',null,1);assert.equal(winnerField.wins,1);assert.equal(winnerField.draws,0);
console.log('PASS Mega sweep counts explicit KO results, preserves excluded samples, rejects empty evidence, and never treats absent legacy winner as draw.');

queue=[{result:'error',winCondition:'Fly simulation is not supported'}];assert.throws(()=>context.runMegaSweepCell(a,b,1,'never',null,1),err=>/Fly simulation is not supported/.test(err.message)&&err.results.n===0&&err.results.wr===null&&err.results.excludedOutcomes===1);
