import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';
import { loadLocalEngine } from '../tools/showdown-reference.mjs';

const { context: ctx } = loadLocalEngine();
vm.runInContext('this.Pokemon = Pokemon; this.Field = Field;', ctx);
const member = (name, ability, moves, item = '') => ({name, ability, moves, item,
  level: 50, nature: 'Serious', evs: {hp:0,atk:0,def:0,spa:0,spd:0,spe:0}});
const team = members => ({format:'champions', members});

for (const [ability, type] of [['Pixilate','Fairy'],['Aerilate','Flying'],['Refrigerate','Ice'],['Dragonize','Dragon']]) {
  for (const reversed of [false, true]) test(`${ability} resolves before Ghost immunity, reversed=${reversed}`, () => {
    const attack = team([member('Sylveon', ability, ['Hyper Voice']), member('Blastoise', 'Torrent', ['Protect'])]);
    const defend = team([member('Basculegion', 'Adaptability', ['Splash']), member('Venusaur', 'Overgrow', ['Splash'])]);
    const options = {format:'doubles',seed:[123,456,789,42],maxTurns:1};
    const run = () => ctx.simulateBattle(reversed ? defend : attack, reversed ? attack : defend, options);
    const battle = run();
    const side = reversed ? 'player' : 'opponent';
    const before = battle.turnLog[0].pre.roster[side].find(m => m.name === 'Basculegion' || m.species === 'Basculegion');
    const after = battle.turnLog[0].post.roster[side].find(m => m.name === 'Basculegion' || m.species === 'Basculegion');
    assert.ok(after.hp_current < before.hp_current, `${ability} must damage Ghost with converted Hyper Voice`);
    assert.ok(!battle.log.some(s => s.includes('Hyper Voice had no effect on Basculegion')));
    const hits = battle.turnLog[0].damage_events.filter(e => e.move === 'Hyper Voice');
    assert.equal(hits.length, 2, 'mixed spread targets both receive converted damage');
    for (const hit of hits) {
      assert.equal(hit.move_type, type);
      assert.equal(hit.base_power_initial, 90);
      assert.equal(hit.base_power_modified, 108, 'conversion boost is applied once');
    }
    assert.equal(ctx._resolveDynamicMoveType(new ctx.Pokemon(attack.members[0], '', 'champions'), 'Hyper Voice', new ctx.Field()), type);
    assert.equal(JSON.stringify(run().turnLog), JSON.stringify(battle.turnLog), 'seeded result remains repeatable');
  });
}

test('ordinary Normal move remains blocked by Ghost immunity', () => {
  const attacker = new ctx.Pokemon(member('Sylveon','Cute Charm',['Hyper Voice']), '', 'champions');
  assert.equal(ctx._resolveDynamicMoveType(attacker,'Hyper Voice',new ctx.Field()),'Normal');
});

for (const reversed of [false, true]) for (const evolve of [false, true]) {
  test(`registered Cloud Nine Mega execution/control, reversed=${reversed}, evolve=${evolve}`, () => {
    const attack = team([member('Altaria-Mega','Cloud Nine',['Hyper Voice'],'Altarianite'),member('Blastoise','Torrent',['Protect'])]);
    const defend = team([member('Basculegion','Adaptability',['Splash']),member('Venusaur','Overgrow',['Splash'])]);
    const battle = ctx.simulateBattle(reversed ? defend : attack, reversed ? attack : defend, {
      format:'doubles',seed:[17,31,47,63],maxTurns:1,
      _megaPolicyOverride:{side:reversed ? 'opp':'player',policy:evolve ? 'first_eligible':'never'}
    });
    assert.equal(battle.log.some(s => s.includes('Hyper Voice had no effect on Basculegion')), !evolve);
    assert.equal(battle.log.some(s => s.includes('Mega Evolved!')), evolve);
    assert.equal(attack.members[0].ability,'Cloud Nine','registered input must not mutate');
  });
}

test('conversion exclusions keep their dynamic type without the ability boost', () => {
  const attacker = new ctx.Pokemon(member('Sylveon','Pixilate',['Weather Ball']), '', 'champions');
  const field = new ctx.Field();
  for (const move of ['Weather Ball','Terrain Pulse','Judgment','Multi-Attack','Natural Gift','Revelation Dance','Techno Blast']) {
    assert.equal(ctx.callAbilityHook(attacker,'onModifyMove',{move,attacker,field}),null,move);
  }
  field.weather = 'rain';
  assert.equal(ctx._resolveDynamicMoveType(attacker,'Weather Ball',field),'Water');
  attacker.teraActivated = true; attacker.tera = 'Fire';
  assert.equal(ctx._resolveDynamicMoveType(attacker,'Tera Blast',field),'Fire');
});
