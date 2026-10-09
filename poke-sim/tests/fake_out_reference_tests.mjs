import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compareProbe, loadLocalEngine } from '../tools/showdown-reference.mjs';
const local = loadLocalEngine();
const mon = (name, ability, moves, item = '') => ({ name, ability, item, nature: 'Hardy', level: 50,
  evs: { hp: 32, atk: 0, def: 0, spa: 2, spd: 0, spe: 32 }, moves });
const team = members => ({ name: 'Synthetic flinch oracle', format: 'champions', members });
for (const [label, ability, item, sourceAbility] of [
  ['ordinary', 'Blaze', '', 'Limber'],
  ['Inner Focus', 'Inner Focus', '', 'Limber'],
  ['Shield Dust', 'Shield Dust', '', 'Limber'],
  ['Cloak', 'Blaze', 'Covert Cloak', 'Limber'],
  ['Klutz Cloak', 'Klutz', 'Covert Cloak', 'Limber'],
  ['Mold Breaker', 'Inner Focus', '', 'Mold Breaker'],
  ['Ability Shield', 'Inner Focus', 'Ability Shield', 'Mold Breaker'],
  ['Sheer Force', 'Blaze', '', 'Sheer Force']
]) for (const swap of [false, true]) test(`Fake Out oracle: ${label}, swap=${swap}`, () => {
  const source = team([mon('Liepard', sourceAbility, ['Fake Out']), mon('Blissey', 'Natural Cure', ['Protect']),
    mon('Pikachu', 'Static', ['Protect']), mon('Gengar', 'Cursed Body', ['Protect'])]);
  const target = team([mon('Charizard', ability, ['Tackle'], item), mon('Snorlax', 'Immunity', ['Protect']),
    mon('Venusaur', 'Overgrow', ['Protect']), mon('Blastoise', 'Torrent', ['Protect'])]);
  const a = [{ move: 'Fake Out', targetSide: 'foe', targetSlot: 0 }, { move: 'Protect' }];
  const b = [{ move: 'Tackle', targetSide: 'foe', targetSlot: 0 }, { move: 'Protect' }];
  const result = compareProbe({ id: `flinch-${label}-${swap}`, formatId: 'gen9championsdoublescustomgame',
    synthetic: true, seed: [8, 3, 12, 7], player: swap ? target : source, opponent: swap ? source : target,
    turns: [{ player: swap ? b : a, opponent: swap ? a : b }], comparePP: true, compareExactHP: false }, local);
  assert.equal(result.status, 'agreement_in_declared_scope', JSON.stringify(result));
});
