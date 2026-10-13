'use strict';
function addValidatedBattle(matchups, phase, player, opponent, battle) {
  const key = JSON.stringify([phase, player, opponent]);
  const row = matchups[key] ||= {phase, player, opponent, games:0, outcomes:{}, total_turns:0, terminal:0, timer:0, truncated:0};
  row.games++;
  row.outcomes[battle.result] = (row.outcomes[battle.result] || 0) + 1;
  row.total_turns += battle.turns;
  if (battle.terminal === true) row.terminal++;
  else row.truncated++;
  if (battle.timerExpired === true) row.timer++;
}
module.exports = {addValidatedBattle};
