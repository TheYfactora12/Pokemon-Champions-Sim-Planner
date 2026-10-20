(function(root){
'use strict';
function evaluate(row,depth){
 depth=Number.isInteger(depth)?depth:0;if(depth>2)return {eligible:false,result:null,reason:"OUTCOME_NESTING_UNVERIFIED",proof:{}};
 row=row||{};var p=row.outcome_proof||(row.tactical_summary||{}).outcome_proof||(row.qa_coverage_summary||{}).outcome_proof||(row.replay_evidence_summary||{}).outcome_proof||row,reason=null,result=p.result;
 if(p.schema_version==='champions-series-outcome-v1'){if(p.exclusion_reason)return {eligible:false,result:null,reason:'OUTCOME_RETAINED_EXCLUSION',proof:p};var se=series(p.games,p.bo,depth+1);if(row.team_a_id&&row.team_b_id&&row.winner_team_id!==(se.result==='win'?row.team_a_id:se.result==='loss'?row.team_b_id:null) || row.result&&row.result!==se.result || p.result!==se.result || (row.source_gaps||[]).length || (row.confidence_flags||[]).some(function(v){return /^(OUTCOME_|TIMER_POLICY_UNVERIFIED)/.test(v);}) || row.result_reason&&row.result_reason!=='ko')return {eligible:false,result:null,reason:'OUTCOME_SERIES_CONTRADICTORY',proof:Object.assign({},se.proof,{exclusion_reason:'OUTCOME_SERIES_CONTRADICTORY'})};return se;}
 if(p.exclusion_reason)reason='OUTCOME_RETAINED_EXCLUSION';
 else if(row.result_reason && row.result_reason!=='ko')reason='OUTCOME_REASON_UNVERIFIED';
 else if((row.source_gaps||[]).length || (row.confidence_flags||[]).some(function(v){return /^(OUTCOME_|TIMER_POLICY_UNVERIFIED)/.test(v);}))reason='OUTCOME_SOURCE_GAP';
 else if(p.timerExpired!==false)reason='TIMER_POLICY_UNVERIFIED';
 else if(p.terminal!==true)reason='OUTCOME_UNFINISHED';
 else if(![p.playerSurvivors,p.oppSurvivors].every(function(v){return Number.isInteger(v)&&v>=0&&v<=6;}))reason='OUTCOME_TERMINATION_UNKNOWN';
 else if(!((result==='win'&&p.playerSurvivors>0&&p.oppSurvivors===0)||(result==='loss'&&p.oppSurvivors>0&&p.playerSurvivors===0)))reason='OUTCOME_WINNER_UNVERIFIED';
 if(!reason && row.result && row.result!==result)reason='OUTCOME_CONTRADICTORY';
 if(!reason && row.team_a_id && row.team_b_id && row.winner_team_id!==(result==='win'?row.team_a_id:row.team_b_id))reason='OUTCOME_WINNER_UNVERIFIED';
 var proof={schema_version:'champions-outcome-v1',result:result||null,terminal:p.terminal===true,timerExpired:p.timerExpired,playerSurvivors:p.playerSurvivors,oppSurvivors:p.oppSurvivors,exclusion_reason:reason};
 return {eligible:!reason,result:reason?null:result,reason:reason,proof:proof};
}
function series(games,bo,depth){
 var rows=Array.isArray(games)?games:[],checked=rows.map(function(row){return evaluate(row,depth);}),wins=checked.filter(function(r){return r.result==='win';}).length,losses=checked.filter(function(r){return r.result==='loss';}).length;
 var valid=[1,3,5,10].includes(bo)&&rows.length>0&&rows.length<=bo&&checked.every(function(r){return r.eligible;})&&(rows.length===bo||Math.max(wins,losses)>=Math.floor(bo/2)+1);
 var before=checked.slice(0,-1);if(before.filter(function(r){return r.result==='win';}).length>=Math.floor(bo/2)+1||before.filter(function(r){return r.result==='loss';}).length>=Math.floor(bo/2)+1)valid=false;
 var result=valid?(wins>losses?'win':wins<losses?'loss':'draw'):null;
 return {eligible:valid,result:result,reason:valid?null:'OUTCOME_SERIES_UNVERIFIED',proof:{schema_version:'champions-series-outcome-v1',bo:bo,games:checked.map(function(r){return r.proof;}),result:result}};
}
function aggregate(rows,requested){
 var list=Array.isArray(rows)?rows:[],counts={wins:0,losses:0,draws:0,excluded:0,reasons:{}};
 list.forEach(function(row){var e=evaluate(row);if(e.eligible)counts[e.result==='win'?'wins':e.result==='loss'?'losses':'draws']++;else{counts.excluded++;counts.reasons[e.reason]=(counts.reasons[e.reason]||0)+1;}});
 counts.complete=Number.isInteger(requested)&&requested===list.length;counts.sampleSize=counts.wins+counts.losses+counts.draws;counts.winRate=counts.complete&&counts.sampleSize?counts.wins/counts.sampleSize:null;return counts;
}
root.ChampionsOutcome={evaluate:evaluate,series:series,aggregate:aggregate};
if(typeof module!=='undefined'&&module.exports)module.exports=root.ChampionsOutcome;
})(typeof globalThis!=='undefined'?globalThis:this);
