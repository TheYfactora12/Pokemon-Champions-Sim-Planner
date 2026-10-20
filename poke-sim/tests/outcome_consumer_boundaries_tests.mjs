import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {loadLocalEngine} from '../tools/showdown-reference.mjs';
const require=createRequire(import.meta.url),P=require('../outcome_policy.js'),TeamLab=require('../team_lab.js');
const good={result:'win',terminal:true,timerExpired:false,playerSurvivors:2,oppSurvivors:0};
const bad=[{...good,terminal:false},{...good,timerExpired:true},{...good,result:'nonsense'},{...good,oppSurvivors:2},{result_reason:'timer',winner_team_id:'a'},{result_reason:'forfeit'},{result_reason:'ko',terminal:false,winner_team_id:'a'},{}];
for(const row of bad)assert.equal(P.evaluate(row).eligible,false);
for(const rejected of [{...good,source_gaps:['unverified']},{result:'loss',outcome_proof:good},{...good,confidence_flags:['OUTCOME_UNVERIFIED']}]){const checked=P.evaluate(rejected);assert.equal(checked.eligible,false);assert.equal(P.evaluate(checked.proof).eligible,false);assert.equal(P.aggregate([checked.proof],1).sampleSize,0);assert.equal(P.series([checked.proof,good],3).eligible,false);}
assert.equal(P.evaluate(good).eligible,true);assert.equal(P.evaluate({...good,result:'loss'}).eligible,false);
assert.equal(P.series([good,bad[0]],3).eligible,false);
assert.equal(P.series([good,good],3).result,'win');
assert.equal(P.series([good,good,{...good,result:'loss',playerSurvivors:0,oppSurvivors:1}],3).eligible,false);
assert.equal(P.evaluate({result:'win',team_a_id:'a',team_b_id:'b',winner_team_id:'b',outcome_proof:P.series([good],1).proof}).eligible,false);
const mixed=P.aggregate([good,...bad],9);assert.equal(mixed.sampleSize,1);assert.equal(mixed.excluded,8);assert.equal(mixed.winRate,1);
assert.equal(P.aggregate([good],9).winRate,null);
const teams=['a','b'].map(id=>({id,name:id,format:'doubles',legality_status:'verified',visibility:'public'}));
for(const row of bad)assert.equal(TeamLab.buildLeaderboardEntries(teams,[{team_a_id:'a',team_b_id:'b',...row}],{min_sample_size:1}).length,0);
assert.equal(TeamLab.buildLeaderboardEntries(teams,[{team_a_id:'a',team_b_id:'b',winner_team_id:'a',result_reason:'ko',outcome_proof:good}],{min_sample_size:1}).length,2);
const ctx=loadLocalEngine().context;ctx.setTimeout=setTimeout;const keys=Object.keys(ctx.TEAMS);
for(const row of bad.slice(0,4)){
 ctx.simulateBattle=()=>({...row,turns:1,seed:[1,2,3,4]});
 await assert.rejects(ctx.runSimulation(1,keys[0],keys[1]),err=>err.results.sampleSize===0&&err.results.excludedOutcomes===1&&err.results.allLogs.length===1);
}
let index=0;ctx.simulateBattle=()=>({...([good,bad[0],bad[1]][index++]),turns:1,trTurns:0,seed:[1,2,3,4]});
const result=await ctx.runSimulation(3,keys[0],keys[1]);assert.equal(result.sampleSize,1);assert.equal(result.excludedOutcomes,2);assert.equal(result.requestedBattles,3);assert.equal(result.winRate,1);
assert.equal(ctx.buildAnalysisPayload(result).total_battles,1);
assert.throws(()=>ctx.buildAnalysisPayload({...result,outcome_records:[good]}),/Complete outcome/);
console.log('Outcome consumers: direct/legacy ranking, actual runSimulation mixed/all-excluded and aggregate proof completeness pass.');
