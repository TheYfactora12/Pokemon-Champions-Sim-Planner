const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ctx = vm.createContext({ console, Math, window: {} });
for (const file of ['data.js', 'generated/pokemon_showdown_legal_data.js', 'runtime_data.js', 'engine.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), ctx);
}
vm.runInContext('this.Pokemon = Pokemon; this.Field = Field;', ctx);
const make = (item, ability = 'Unburden') => new ctx.Pokemon({
  name: 'Sneasler', item, ability, nature: 'Hardy', moves: ['Acrobatics'],
  evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
}, '', 'sv');
function power(mon, field = new ctx.Field()) {
  field._ctx = { captureDamageCalc: true };
  mon.calcDamage('Acrobatics', make(''), field, null, () => 0.5);
  return field._ctx.lastDamageCalc.base_power_modified;
}
let failed = 0;
const cases = [
  ['empty-handed doubles power', () => assert.equal(power(make('')), 110)],
  ['held item keeps normal power', () => assert.equal(power(make('Magnet')), 55)],
  ['Klutz does not remove a held item', () => assert.equal(power(make('Magnet', 'Klutz')), 55)],
  ['seed consumption doubles power immediately', () => {
    const mon = make('Electric Seed'), field = new ctx.Field();
    field.terrain = 'electric';
    ctx.tryTerrainSeed(mon, field, []);
    assert.equal(mon.itemConsumed, true);
    assert.equal(power(mon, field), 110);
  }],
  ['Knock Off doubles power', () => {
    const mon = make('Magnet');
    ctx._applyKnockOffItemRemoval(mon, []);
    assert.equal(power(mon), 110);
  }],
  ['receiving a replacement item restores normal power', () => {
    const mon = make('Electric Seed');
    ctx._consumeHeldItem(mon);
    mon.item = 'Magnet';
    mon.itemConsumed = false;
    assert.equal(power(mon), 55);
  }]
];
for (const [name, run] of cases) {
  try { run(); console.log('PASS ' + name); }
  catch (error) { failed++; console.error('FAIL ' + name + ': ' + error.message); }
}
console.log(`${cases.length - failed}/${cases.length} passed`);
process.exitCode = failed ? 1 : 0;
