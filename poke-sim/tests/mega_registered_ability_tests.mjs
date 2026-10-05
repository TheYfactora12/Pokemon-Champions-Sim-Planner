import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const ctx = vm.createContext({console});
for (const name of ['generated/pokemon_showdown_legal_data.js', 'move_legality.js', 'data.js', 'engine.js']) vm.runInContext(fs.readFileSync(new URL('../' + name, import.meta.url), 'utf8'), ctx);
const Pokemon = vm.runInContext('Pokemon', ctx);
for (const [name, item, selected, before, after] of [
  ['Altaria-Mega', 'Altarianite', 'Cloud Nine', 'Cloud Nine', 'Pixilate'],
  ['Altaria-Mega', 'Altarianite', 'Natural Cure', 'Natural Cure', 'Pixilate'],
  ['Altaria-Mega', 'Altarianite', 'Pixilate', 'Natural Cure', 'Pixilate'],
  ['Charizard-Mega-Y', 'Charizardite Y', 'Solar Power', 'Solar Power', 'Drought'],
  ['Charizard-Mega-Y', 'Charizardite Y', 'Drought', 'Blaze', 'Drought'],
  ['Audino-Mega', 'Audinite', 'Healer', 'Healer', 'Healer'],
  ['Chandelure-Mega', 'Chandelurite', 'Infiltrator', 'Infiltrator', 'Infiltrator'],
  ['Greninja-Mega', 'Greninjite', 'Protean', 'Protean', 'Protean'],
  ['Crabominable-Mega', 'Crabominite', 'Iron Fist', 'Iron Fist', 'Iron Fist'],
  ['Drampa-Mega', 'Drampanite', 'Berserk', 'Berserk', 'Berserk']
]) {
  const input = {name, item, ability:selected, nature:'Modest', moves:['Protect'], evs:{}, level:50};
  const original = JSON.stringify(input);
  const mon = new Pokemon(input, 'doubles', 'champions');
  assert.equal(mon.ability, before, name + ': preserve registered base ability');
  mon.megaEvolve([]);
  assert.equal(mon.ability, after, name + ': transform only on Mega trigger');
  assert.equal(JSON.stringify(input), original, 'construction must not mutate registration');
}
console.log('Registered Mega ability: ten base/legacy/shared-ability cases passed');
