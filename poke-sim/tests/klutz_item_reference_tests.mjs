import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadLocalEngine, runReferenceProbe } from '../tools/showdown-reference.mjs';
const local = loadLocalEngine();
const mon = (name, ability, moves, item = '') => ({ name, ability, item, nature: 'Hardy', level: 50,
  evs: { hp: 32, atk: 0, def: 0, spa: 2, spd: 0, spe: 32 }, moves });
const team = members => ({ name: 'Synthetic item oracle', format: 'champions', members });
for (const klutz of [false, true]) for (const item of ['Choice Scarf', 'Power Herb', 'Focus Sash']) {
  test(`${item} Champions reference, Klutz=${klutz}`, () => {
    const sash = item === 'Focus Sash';
    const herb = item === 'Power Herb';
    const player = team([mon(sash ? 'Garchomp' : 'Lopunny', sash ? 'Sand Veil' : klutz ? 'Klutz' : 'Limber',
      [sash ? 'Earthquake' : herb ? 'Solar Beam' : 'Splash'], sash ? '' : item),
      mon('Blissey', 'Natural Cure', ['Protect']), mon('Gengar', 'Cursed Body', ['Protect']), mon('Pikachu', 'Static', ['Protect'])]);
    const opponent = team([mon(sash ? 'Magnemite' : 'Snorlax', sash && klutz ? 'Klutz' : 'Run Away', ['Splash'], sash ? item : ''),
      mon('Charizard', 'Blaze', ['Protect']), mon('Venusaur', 'Overgrow', ['Protect']), mon('Blastoise', 'Torrent', ['Protect'])]);
    const move = player.members[0].moves[0];
    const seed = [8, 3, 12, 7];
    const ref = runReferenceProbe({ id: `klutz-${item}`, formatId: 'gen9championsdoublescustomgame', synthetic: true,
      seed, player, opponent, turns: [{ player: [{ move, ...(herb ? { targetSide: 'foe', targetSlot: 0 } : {}) }, { move: 'Protect' }],
        opponent: [{ move: 'Splash' }, { move: 'Protect' }] }] });
    assert.equal(ref.status, 'probe_complete');
    const r = local.context.simulateBattle(player, opponent, { format: 'doubles', seed, maxTurns: 1,
      forcedActions: ['player', 'opponent'].flatMap(side => [0, 1].map(slot => ({ turn: 1, side, slot,
        move: slot ? 'Protect' : side === 'player' ? move : 'Splash', targetSide: 'enemy', targetSlot: 0 }))) });
    const side = sash ? 'opponent' : 'player';
    const actual = r.turnLog[0].post.roster[side][0];
    const expected = ref.frames[0].post[sash ? 'p2' : 'p1'].find(p => p.species === (sash ? 'Magnemite' : 'Lopunny'));
    assert.equal(actual.itemConsumed, expected.item === '');
    if (sash) assert.equal(actual.hp, expected.hp);
    if (herb) assert.equal(r.turnLog[0].damage_events.some(e => e.attacker === 'Lopunny'), !klutz);
    if (!sash && !herb) {
      const speed = r.turnLog[0].post.speed_order_details.find(p => p.pokemon === 'Lopunny');
      assert.equal(speed.effective_speed, expected.action_speed);
    }
  });
}
