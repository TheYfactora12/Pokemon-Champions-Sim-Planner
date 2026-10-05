// Read-only reproduction: does construction preserve a registered base ability?
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({ console });
for (const file of ['data.js', 'engine.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}
const rows = vm.runInContext(`['Cloud Nine', 'Natural Cure', 'Pixilate'].map(ability => {
  const mon = new Pokemon({name:'Altaria-Mega', item:'Altarianite', ability,
    moves:['Protect'], evs:{}, nature:'Modest', level:50}, 'doubles', 'champions');
  return { selected:ability, beforeMega:mon.ability, afterMega:mon.megaForm.megaAbility };
})`, context);
console.log(JSON.stringify({ scope: 'constructor diagnostic, not legality or parity proof', rows }, null, 2));
