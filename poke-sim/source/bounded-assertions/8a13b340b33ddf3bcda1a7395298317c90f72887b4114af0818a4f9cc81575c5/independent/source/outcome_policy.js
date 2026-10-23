(function(root){
'use strict';
function representationError(row,p){
 var seen=new Set(),count=0,keys=['result','terminal','timerExpired','playerSurvivors','oppSurvivors','bo'];
 function visit(v,level,isProof){
  if(!v||typeof v!=='object'||Array.isArray(v)||level>8||++count>128||seen.has(v))return 'OUTCOME_NESTING_UNVERIFIED';
  seen.add(v);var reason=null;
  if(isProof&&v.schema_version&&(!['champions-outcome-v1','champions-series-outcome-v1'].includes(v.schema_version)||v.schema_version!==(p.schema_version||'champions-outcome-v1')))reason='OUTCOME_SCHEMA_UNVERIFIED';
  else if(isProof&&v.schema_version!=='champions-series-outcome-v1'&&!v.exclusion_reason&&(v.terminal!==true||v.timerExpired!==false||!Number.isInteger(v.playerSurvivors)||!Number.isInteger(v.oppSurvivors)))reason='OUTCOME_TERMINATION_UNKNOWN';
  else if(v.exclusion_reason||v.eligible===false)reason='OUTCOME_RETAINED_EXCLUSION';
  else if(v.source_gaps!=null&&!Array.isArray(v.source_gaps)||v.confidence_flags!=null&&!Array.isArray(v.confidence_flags)|| (v.source_gaps||[]).length||(v.confidence_flags||[]).some(function(x){return /^(OUTCOME_|TIMER_POLICY_UNVERIFIED)/.test(x);}))reason='OUTCOME_SOURCE_GAP';
  else if(v.result_reason&&v.result_reason!=='ko')reason='OUTCOME_REASON_UNVERIFIED';
  else if(keys.some(function(k){return v[k]!==undefined&&p[k]!==undefined&&v[k]!==p[k];}))reason='OUTCOME_CONTRADICTORY';
  else if(v.timerExpired!==undefined&&v.timerExpired!==false||v.terminal!==undefined&&v.terminal!==true)reason='OUTCOME_CONTRADICTORY';
  else if(v.team_a_id&&v.team_b_id&&v.winner_team_id!==(p.result==='win'?v.team_a_id:p.result==='loss'?v.team_b_id:null))reason='OUTCOME_WINNER_UNVERIFIED';
  else if((v.playerSurvivors!==undefined||v.oppSurvivors!==undefined)&&!((p.result==='win'&&Number.isInteger(v.playerSurvivors)&&v.playerSurvivors>0&&v.playerSurvivors<=6&&v.oppSurvivors===0)||(p.result==='loss'&&Number.isInteger(v.oppSurvivors)&&v.oppSurvivors>0&&v.oppSurvivors<=6&&v.playerSurvivors===0)))reason='OUTCOME_WINNER_UNVERIFIED';
  if(!reason&&v.games!==undefined&&p.games!==undefined&&v.games!==p.games){try{if(JSON.stringify(v.games)!==JSON.stringify(p.games))reason='OUTCOME_SERIES_CONTRADICTORY';}catch(_){reason='OUTCOME_NESTING_UNVERIFIED';}}
  for(var k of ['outcome_proof','tactical_summary','qa_coverage_summary','replay_evidence_summary'])if(!reason&&v[k]!=null)reason=visit(v[k],level+1,k==='outcome_proof');
  seen.delete(v);return reason;
 }
 return visit(row,0,row===p&&/^champions-(?:series-)?outcome-/.test(row.schema_version||''));
}
function rejected(reason){return {eligible:false,result:null,reason:reason,proof:{schema_version:'champions-outcome-v1',result:null,exclusion_reason:reason}};}
function evaluate(row,depth){
 depth=Number.isInteger(depth)?depth:0;if(depth>2)return rejected('OUTCOME_NESTING_UNVERIFIED');
 row=row||{};var p=row.outcome_proof||(row.tactical_summary||{}).outcome_proof||(row.qa_coverage_summary||{}).outcome_proof||(row.replay_evidence_summary||{}).outcome_proof||row,reason=null,result=p.result;
 var conflict=representationError(row,p);if(conflict)return rejected(conflict,p);
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
 return {eligible:valid,result:result,reason:valid?null:'OUTCOME_SERIES_UNVERIFIED',proof:{schema_version:'champions-series-outcome-v1',bo:bo,games:checked.map(function(r){return r.proof;}),result:result,exclusion_reason:valid?null:'OUTCOME_SERIES_UNVERIFIED'}};
}
function aggregate(rows,requested){
 var list=Array.isArray(rows)?rows:[],counts={wins:0,losses:0,draws:0,excluded:0,reasons:{}};
 list.forEach(function(row){var e=evaluate(row);if(e.eligible)counts[e.result==='win'?'wins':e.result==='loss'?'losses':'draws']++;else{counts.excluded++;counts.reasons[e.reason]=(counts.reasons[e.reason]||0)+1;}});
 counts.complete=Number.isInteger(requested)&&requested===list.length;counts.sampleSize=counts.wins+counts.losses+counts.draws;counts.winRate=counts.complete&&counts.sampleSize?counts.wins/counts.sampleSize:null;return counts;
}
root.ChampionsOutcome={evaluate:evaluate,series:series,aggregate:aggregate};
if(typeof module!=='undefined'&&module.exports)module.exports=root.ChampionsOutcome;
})(typeof globalThis!=='undefined'?globalThis:this);
