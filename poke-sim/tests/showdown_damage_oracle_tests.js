const fs = require('fs');
const vm = require('vm');
const path = require('path');
const calc = require('@smogon/calc');

const ROOT = path.resolve(__dirname, '..');
const ctx = {
  console, require, module: {}, exports: {}, Math, Object, Array, Set, JSON,
  Number, String, Boolean, RegExp, Date
};
ctx.globalThis = ctx;
vm.createContext(ctx);

function load(file) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
}

load('data.js');
load('generated/pokemon_showdown_legal_data.js');
load('runtime_data.js');
load('engine.js');
vm.runInContext('this.Pokemon = Pokemon; this.Field = Field;', ctx);

const { Pokemon, Field } = ctx;
const gen = calc.Generations.get(9);

let pass = 0;
let fail = 0;

function T(name, fn) {
  try {
    fn();
    console.log('  PASS', name);
    pass++;
  } catch (err) {
    console.log('  FAIL', name, '-', err.message);
    fail++;
  }
}

function eq(actual, expected, msg) {
  if (actual !== expected) throw new Error((msg || 'not equal') + ' expected=' + JSON.stringify(expected) + ' got=' + JSON.stringify(actual));
}

function eqRange(actual, expected, msg) {
  eq(actual[0], expected[0], msg ? msg + ' min' : 'range min');
  eq(actual[1], expected[1], msg ? msg + ' max' : 'range max');
}

function simMon(name, overrides) {
  return new Pokemon(Object.assign({
    name,
    level: 50,
    item: '',
    ability: '',
    nature: 'Hardy',
    moves: ['Tackle'],
    evs: {}
  }, overrides || {}), '', 'sv');
}

function calcMon(name, overrides) {
  return new calc.Pokemon(gen, name, Object.assign({ level: 50 }, overrides || {}));
}

function simRange(attacker, target, move, field) {
  attacker.side = field.playerSide;
  target.side = field.oppSide;
  field._ctx.forceNoCrit = true;
  return [
    attacker.calcDamage(move, target, field, null, function() { return 0; }),
    attacker.calcDamage(move, target, field, null, function() { return 1; })
  ];
}

function oracleRange(attacker, target, move, field) {
  return calc.calculate(gen, attacker, target, new calc.Move(gen, move), field).range();
}

console.log('\n=== Showdown damage oracle tests ===\n');

T('1. neutral special damage range matches Showdown exactly', () => {
  const sim = simRange(
    simMon('Raichu', { nature: 'Modest', moves: ['Thunderbolt'], evs: { spa: 252 } }),
    simMon('Pelipper'),
    'Thunderbolt',
    new Field({ format: 'doubles' })
  );
  const oracle = oracleRange(
    calcMon('Raichu', { nature: 'Modest', moves: ['Thunderbolt'], evs: { spa: 252 } }),
    calcMon('Pelipper'),
    'Thunderbolt',
    new calc.Field({ gameType: 'Doubles' })
  );
  eqRange(sim, oracle, 'neutral special');
});

T('2. sand special-defense interaction matches Showdown exactly', () => {
  const sim = simRange(
    simMon('Gardevoir', { nature: 'Modest', moves: ['Moonblast'], evs: { spa: 252 } }),
    simMon('Tyranitar'),
    'Moonblast',
    new Field({ format: 'doubles', weather: 'sand' })
  );
  const oracle = oracleRange(
    calcMon('Gardevoir', { nature: 'Modest', moves: ['Moonblast'], evs: { spa: 252 } }),
    calcMon('Tyranitar'),
    'Moonblast',
    new calc.Field({ gameType: 'Doubles', weather: 'Sand' })
  );
  eqRange(sim, oracle, 'sand spd');
});

T('3. electric terrain damage range matches Showdown exactly', () => {
  const sim = simRange(
    simMon('Raichu', { nature: 'Modest', moves: ['Thunderbolt'], evs: { spa: 252 } }),
    simMon('Pelipper'),
    'Thunderbolt',
    new Field({ format: 'doubles', terrain: 'electric' })
  );
  const oracle = oracleRange(
    calcMon('Raichu', { nature: 'Modest', moves: ['Thunderbolt'], evs: { spa: 252 } }),
    calcMon('Pelipper'),
    'Thunderbolt',
    new calc.Field({ gameType: 'Doubles', terrain: 'Electric' })
  );
  eqRange(sim, oracle, 'electric terrain');
});

T('4. helping hand boost matches Showdown exactly', () => {
  const simAttacker = simMon('Chandelure', { nature: 'Modest', moves: ['Flamethrower'], evs: { spa: 252 } });
  simAttacker.helpingHand = true;
  const sim = simRange(
    simAttacker,
    simMon('Incineroar'),
    'Flamethrower',
    new Field({ format: 'doubles' })
  );
  const oracle = oracleRange(
    calcMon('Chandelure', { nature: 'Modest', moves: ['Flamethrower'], evs: { spa: 252 } }),
    calcMon('Incineroar'),
    'Flamethrower',
    new calc.Field({ gameType: 'Doubles', attackerSide: { isHelpingHand: true } })
  );
  eqRange(sim, oracle, 'helping hand');
});

T('5. physical stab damage range matches Showdown exactly', () => {
  const sim = simRange(
    simMon('Garchomp', { nature: 'Adamant', moves: ['Dragon Claw'], evs: { atk: 252 } }),
    simMon('Incineroar'),
    'Dragon Claw',
    new Field({ format: 'doubles' })
  );
  const oracle = oracleRange(
    calcMon('Garchomp', { nature: 'Adamant', moves: ['Dragon Claw'], evs: { atk: 252 } }),
    calcMon('Incineroar'),
    'Dragon Claw',
    new calc.Field({ gameType: 'Doubles' })
  );
  eqRange(sim, oracle, 'physical stab');
});

T('6. burn penalty is applied at the same damage stage as Showdown', () => {
  const sim = simRange(
    simMon('Garchomp', { nature: 'Adamant', moves: ['Dragon Claw'], evs: { atk: 252 }, status: 'burn' }),
    simMon('Incineroar'),
    'Dragon Claw',
    new Field({ format: 'doubles' })
  );
  const oracle = oracleRange(
    calcMon('Garchomp', { nature: 'Adamant', moves: ['Dragon Claw'], evs: { atk: 252 }, status: 'brn' }),
    calcMon('Incineroar'),
    'Dragon Claw',
    new calc.Field({ gameType: 'Doubles' })
  );
  eqRange(sim, oracle, 'burn stage');
});

T('7. target Tera typing matches Showdown defensive typing', () => {
  const simDefender = simMon('Pelipper', { teraType: 'Water' });
  simDefender.teraActivated = true;
  const sim = simRange(
    simMon('Raichu', { nature: 'Modest', moves: ['Thunderbolt'], evs: { spa: 252 } }),
    simDefender,
    'Thunderbolt',
    new Field({ format: 'doubles' })
  );
  const oracle = oracleRange(
    calcMon('Raichu', { nature: 'Modest', moves: ['Thunderbolt'], evs: { spa: 252 } }),
    calcMon('Pelipper', { teraType: 'Water' }),
    'Thunderbolt',
    new calc.Field({ gameType: 'Doubles' })
  );
  eqRange(sim, oracle, 'target tera');
});

T('8. same-type attacker Tera upgrades STAB the same way as Showdown', () => {
  const simAttacker = simMon('Raichu', { nature: 'Modest', moves: ['Thunderbolt'], evs: { spa: 252 }, teraType: 'Electric' });
  simAttacker.teraActivated = true;
  const sim = simRange(
    simAttacker,
    simMon('Pelipper'),
    'Thunderbolt',
    new Field({ format: 'doubles' })
  );
  const oracle = oracleRange(
    calcMon('Raichu', { nature: 'Modest', moves: ['Thunderbolt'], evs: { spa: 252 }, teraType: 'Electric' }),
    calcMon('Pelipper'),
    'Thunderbolt',
    new calc.Field({ gameType: 'Doubles' })
  );
  eqRange(sim, oracle, 'same-type tera stab');
});

T('9. off-type attacker Tera keeps original-type STAB like Showdown', () => {
  const simAttacker = simMon('Raichu', { nature: 'Modest', moves: ['Thunderbolt'], evs: { spa: 252 }, teraType: 'Water' });
  simAttacker.teraActivated = true;
  const sim = simRange(
    simAttacker,
    simMon('Pelipper'),
    'Thunderbolt',
    new Field({ format: 'doubles' })
  );
  const oracle = oracleRange(
    calcMon('Raichu', { nature: 'Modest', moves: ['Thunderbolt'], evs: { spa: 252 }, teraType: 'Water' }),
    calcMon('Pelipper'),
    'Thunderbolt',
    new calc.Field({ gameType: 'Doubles' })
  );
  eqRange(sim, oracle, 'off-type tera stab');
});

T('10. Freeze-Dry matches Showdown Water effectiveness exactly', () => {
  const sim = simRange(
    simMon('Ninetales-Alola', { nature: 'Modest', moves: ['Freeze-Dry'], evs: { spa: 252 } }),
    simMon('Pelipper'),
    'Freeze-Dry',
    new Field({ format: 'doubles' })
  );
  const oracle = oracleRange(
    calcMon('Ninetales-Alola', { nature: 'Modest', moves: ['Freeze-Dry'], evs: { spa: 252 } }),
    calcMon('Pelipper'),
    'Freeze-Dry',
    new calc.Field({ gameType: 'Doubles' })
  );
  eqRange(sim, oracle, 'freeze-dry water');
});

T('11. off-type Tera drops Adaptability back to Showdown\'s original-type STAB rules', () => {
  const simAttacker = simMon('Dragalge', { nature: 'Modest', moves: ['Dragon Pulse'], evs: { spa: 252 }, ability: 'Adaptability', teraType: 'Water' });
  simAttacker.teraActivated = true;
  const sim = simRange(
    simAttacker,
    simMon('Pelipper'),
    'Dragon Pulse',
    new Field({ format: 'doubles' })
  );
  const oracle = oracleRange(
    calcMon('Dragalge', { nature: 'Modest', moves: ['Dragon Pulse'], evs: { spa: 252 }, ability: 'Adaptability', teraType: 'Water' }),
    calcMon('Pelipper'),
    'Dragon Pulse',
    new calc.Field({ gameType: 'Doubles' })
  );
  eqRange(sim, oracle, 'adaptability off-type tera');
});

T('12. Facade status power boost matches Showdown exactly', () => {
  const sim = simRange(
    simMon('Ursaring', { nature: 'Adamant', moves: ['Facade'], evs: { atk: 252 }, ability: 'Quick Feet', status: 'burn' }),
    simMon('Pelipper'),
    'Facade',
    new Field({ format: 'doubles' })
  );
  const oracle = oracleRange(
    calcMon('Ursaring', { nature: 'Adamant', moves: ['Facade'], evs: { atk: 252 }, ability: 'Quick Feet', status: 'brn' }),
    calcMon('Pelipper'),
    'Facade',
    new calc.Field({ gameType: 'Doubles' })
  );
  eqRange(sim, oracle, 'facade burn');
});

T('13. Guts physical boost matches Showdown exactly', () => {
  const sim = simRange(
    simMon('Ursaring', { nature: 'Adamant', moves: ['Slash'], evs: { atk: 252 }, ability: 'Guts', status: 'burn' }),
    simMon('Pelipper'),
    'Slash',
    new Field({ format: 'doubles' })
  );
  const oracle = oracleRange(
    calcMon('Ursaring', { nature: 'Adamant', moves: ['Slash'], evs: { atk: 252 }, ability: 'Guts', status: 'brn' }),
    calcMon('Pelipper'),
    'Slash',
    new calc.Field({ gameType: 'Doubles' })
  );
  eqRange(sim, oracle, 'guts boost');
});

T('14. Weather Ball in rain matches Showdown exactly', () => {
  const sim = simRange(
    simMon('Pelipper', { nature: 'Modest', moves: ['Weather Ball'], evs: { spa: 252 } }),
    simMon('Incineroar'),
    'Weather Ball',
    new Field({ format: 'doubles', weather: 'rain' })
  );
  const oracle = oracleRange(
    calcMon('Pelipper', { nature: 'Modest', moves: ['Weather Ball'], evs: { spa: 252 } }),
    calcMon('Incineroar'),
    'Weather Ball',
    new calc.Field({ gameType: 'Doubles', weather: 'Rain' })
  );
  eqRange(sim, oracle, 'weather ball rain');
});

T('15. Weather Ball in sun matches Showdown exactly', () => {
  const sim = simRange(
    simMon('Meganium', { nature: 'Modest', moves: ['Weather Ball'], evs: { spa: 252 } }),
    simMon('Amoonguss'),
    'Weather Ball',
    new Field({ format: 'doubles', weather: 'sun' })
  );
  const oracle = oracleRange(
    calcMon('Meganium', { nature: 'Modest', moves: ['Weather Ball'], evs: { spa: 252 } }),
    calcMon('Amoonguss'),
    'Weather Ball',
    new calc.Field({ gameType: 'Doubles', weather: 'Sun' })
  );
  eqRange(sim, oracle, 'weather ball sun');
});

T('16. Electro Shot in rain matches Showdown exactly', () => {
  const sim = simRange(
    simMon('Archaludon', { nature: 'Modest', moves: ['Electro Shot'], evs: { spa: 252 } }),
    simMon('Pelipper'),
    'Electro Shot',
    new Field({ format: 'doubles', weather: 'rain' })
  );
  const oracle = oracleRange(
    calcMon('Archaludon', { nature: 'Modest', moves: ['Electro Shot'], evs: { spa: 252 } }),
    calcMon('Pelipper'),
    'Electro Shot',
    new calc.Field({ gameType: 'Doubles', weather: 'Rain' })
  );
  eqRange(sim, oracle, 'electro shot rain');
});

T('17. Terrain Pulse in electric terrain matches Showdown exactly', () => {
  const sim = simRange(
    simMon('Porygon2', { nature: 'Modest', moves: ['Terrain Pulse'], evs: { spa: 252 } }),
    simMon('Pelipper'),
    'Terrain Pulse',
    new Field({ format: 'doubles', terrain: 'electric' })
  );
  const oracle = oracleRange(
    calcMon('Porygon2', { nature: 'Modest', moves: ['Terrain Pulse'], evs: { spa: 252 } }),
    calcMon('Pelipper'),
    'Terrain Pulse',
    new calc.Field({ gameType: 'Doubles', terrain: 'Electric' })
  );
  eqRange(sim, oracle, 'terrain pulse electric');
});

T('18. Rising Voltage against a grounded target matches Showdown exactly', () => {
  const sim = simRange(
    simMon('Raichu', { nature: 'Modest', moves: ['Rising Voltage'], evs: { spa: 252 } }),
    simMon('Incineroar'),
    'Rising Voltage',
    new Field({ format: 'doubles', terrain: 'electric' })
  );
  const oracle = oracleRange(
    calcMon('Raichu', { nature: 'Modest', moves: ['Rising Voltage'], evs: { spa: 252 } }),
    calcMon('Incineroar'),
    'Rising Voltage',
    new calc.Field({ gameType: 'Doubles', terrain: 'Electric' })
  );
  eqRange(sim, oracle, 'rising voltage grounded');
});

T('19. Solar Beam under rain matches Showdown exactly', () => {
  const sim = simRange(
    simMon('Venusaur', { nature: 'Modest', moves: ['Solar Beam'], evs: { spa: 252 } }),
    simMon('Pelipper'),
    'Solar Beam',
    new Field({ format: 'doubles', weather: 'rain' })
  );
  const oracle = oracleRange(
    calcMon('Venusaur', { nature: 'Modest', moves: ['Solar Beam'], evs: { spa: 252 } }),
    calcMon('Pelipper'),
    'Solar Beam',
    new calc.Field({ gameType: 'Doubles', weather: 'Rain' })
  );
  eqRange(sim, oracle, 'solar beam rain');
});

console.log('\nshowdown damage oracle:', pass + ' pass, ' + fail + ' fail\n');
process.exit(fail ? 1 : 0);
