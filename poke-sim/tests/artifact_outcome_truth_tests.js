const assert=require('node:assert/strict');
const E=require('../sim_evidence.js');
const base={schema_version:'champions-turn-log-v2',format:'doubles',seed:'fixed',
  engine_version:'test',ruleset_version:'test',regulation_id:'test',player_team_id:'a',opponent_team_id:'b',
  result:'win',turnLog:[{turn:1,events:[]}],log:[]};
const opts={teamIdMap:{a:'00000000-0000-4000-8000-000000000001',b:'00000000-0000-4000-8000-000000000002'}};
for(const [name,flags,reason,gap,winner] of [
  ['forfeit without winner',{result:'forfeit',terminal:true},'forfeit','OUTCOME_WINNER_UNVERIFIED',false],
  ['cutoff',{terminal:false,timerExpired:false},'error','OUTCOME_UNFINISHED',false],
  ['timer',{terminal:true,timerExpired:true},'timer','TIMER_POLICY_UNVERIFIED',false],
  ['legacy unknown',{},'error','OUTCOME_TERMINATION_UNKNOWN',false],
  ['KO',{terminal:true,timerExpired:false,playerSurvivors:2,oppSurvivors:0},'ko',null,true],
  ['flipped winner',{terminal:true,timerExpired:false,playerSurvivors:0,oppSurvivors:2},'error','OUTCOME_WINNER_UNVERIFIED',false],
  ['unknown result',{result:'nonsense',terminal:true,timerExpired:false,playerSurvivors:2,oppSurvivors:0},'error','OUTCOME_WINNER_UNVERIFIED',false],
  ['contradictory draw',{result:'draw',terminal:true,timerExpired:false,playerSurvivors:2,oppSurvivors:0},'error','OUTCOME_WINNER_UNVERIFIED',false],
  ['negative survivors',{terminal:true,timerExpired:false,playerSurvivors:-1,oppSurvivors:0},'error','OUTCOME_TERMINATION_UNKNOWN',false],
  ['both extinct',{terminal:true,timerExpired:false,playerSurvivors:0,oppSurvivors:0},'error','OUTCOME_WINNER_UNVERIFIED',false],
  ['unsupported terminal',{terminal:true,timerExpired:false,playerSurvivors:2,oppSurvivors:2},'error','OUTCOME_TERMINATION_UNKNOWN',false]
]){
  const input={...base,...flags},before=JSON.stringify(input);
  const record=E.createSimEvidenceFromArtifact(input,opts).replay_records[0];
  assert.equal(record.result_reason,reason,name);
  assert.equal(!!record.winner_team_id,winner,name);
  if(gap)assert(record.source_gaps.includes(gap),name);
  assert.equal(JSON.stringify(input),before);
}
console.log('PASS eleven artifact outcome boundaries preserve uncertainty and do not invent knockout winners.');

const TeamLab=require('../team_lab.js');
const teams=['a','b'].map((id,i)=>({id:opts.teamIdMap[id],name:id,format:'doubles',regulation_id:'test',visibility:'public',legality_status:'verified',archetype_tags:[]}));
for(const flags of [{result:'forfeit',terminal:true},{terminal:false,timerExpired:false},{terminal:true,timerExpired:true}]){
 const replay=E.createSimEvidenceFromArtifact({...base,...flags},opts).replay_records[0];
 const attached=E.attachReplayToSimRun({winner_team_id:teams[0].id,result_reason:'ko',source_gaps:[]},replay).sim_run;
 assert.equal(attached.winner_team_id,null);assert.equal(attached.result_reason,replay.result_reason);assert(attached.source_gaps.length>0);
 assert.equal(TeamLab.buildLeaderboardEntries(teams,[replay],{min_sample_size:1}).length,0);
 assert.equal(TeamLab.buildLeaderboardEntries(teams,[{...replay,...attached,source_gaps:[]}],{min_sample_size:1}).length,0);
}
console.log('PASS unfinished/timer/forfeit quarantine survives attachment and leaderboard aggregation.');
