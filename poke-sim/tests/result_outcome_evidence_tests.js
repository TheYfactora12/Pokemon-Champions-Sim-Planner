'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('node:assert/strict');
const ctx = { console, window: {} };
vm.createContext(ctx);
for (const file of ['data.js', 'engine.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), ctx);
}
const mon = moves => ({ name: 'Whimsicott', ability: '', item: '', nature: 'Hardy', level: 50,
  evs: { hp: 32, spe: 32 }, moves });
const team = members => ({ name: 'Outcome fixture', format: 'champions', members });
for (const move of ['Tailwind', 'Trick Room']) {
  for (const side of ['player', 'opp', 'both']) {
    const battle = ctx.simulateBattle(team([mon([side !== 'opp' ? move : 'Splash']), mon(['Splash'])]),
      team([mon([side !== 'player' ? move : 'Splash'])]),
      { format: 'doubles', seed: [1, 2, 3, 4], maxTurns: 1 });
    assert.ok(battle.log.some(line => line.includes(move)), `${side} ${move} must execute`);
    assert.equal(battle.result, 'win');
    assert.equal(battle.playerSurvivors, 2);
    assert.equal(battle.oppSurvivors, 1);
    assert.equal(battle.terminal, false);
    assert.equal(battle.timerExpired, false);
    assert.equal(battle.winCondition, 'Pokemon-count advantage', `${side} ${move} is not causal proof`);
  }
}
console.log('PASS player/opponent Tailwind and Trick Room cannot become causal win labels');
const knockout = ctx.simulateBattle(team([mon(['Moonblast']), mon(['Moonblast'])]),
  team([mon(['Splash'])]), { format: 'doubles', seed: [1, 2, 3, 4], maxTurns: 20 });
assert.equal(knockout.result, 'win');
assert.equal(knockout.oppSurvivors, 0);
assert.equal(knockout.terminal, true);
assert.equal(knockout.timerExpired, false);
assert.equal(knockout.winCondition, 'Opponent team defeated');
console.log('PASS knockout outcome records the defeated opposing team');
