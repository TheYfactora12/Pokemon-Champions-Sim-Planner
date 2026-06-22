const fs = require('fs');
const vm = require('vm');
const path = require('path');

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
vm.runInContext([
  'this.Pokemon = Pokemon;',
  'this.Field = Field;',
  'this.runtimeData = ChampionsSim.runtimeData;'
].join('\n'), ctx);

const { Pokemon, Field, runtimeData } = ctx;

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

function eq(a, b, msg) {
  if (a !== b) throw new Error((msg || 'not equal') + ' expected=' + JSON.stringify(b) + ' got=' + JSON.stringify(a));
}

function truthy(value, msg) {
  if (!value) throw new Error(msg || 'expected truthy');
}

function pokeRound(num) {
  return num % 1 > 0.5 ? Math.ceil(num) : Math.floor(num);
}

function chain4096Mods(modifiers) {
  let total = 4096;
  for (const mod of modifiers) {
    if (mod !== 4096) total = (total * mod + 2048) >> 12;
  }
  return total;
}

function applyBasePowerMods(basePower, modifiers) {
  if (!modifiers.length) return basePower;
  return Math.max(1, pokeRound((basePower * chain4096Mods(modifiers)) / 4096));
}

function applyBaseDamageMod(baseDamage, mod4096) {
  if (mod4096 === 4096) return baseDamage;
  return pokeRound((baseDamage * mod4096) / 4096);
}

function finalizeDamage(baseAmount, roll, effectiveness, applyStatusPenalty, stabMod, finalMod) {
  let damageAmount = Math.floor(baseAmount * roll);
  if (stabMod !== 4096) damageAmount = (damageAmount * stabMod) / 4096;
  damageAmount = Math.floor(pokeRound(damageAmount) * effectiveness);
  if (applyStatusPenalty) damageAmount = Math.floor(damageAmount / 2);
  return Math.max(1, pokeRound((damageAmount * finalMod) / 4096));
}

function mk(name, overrides) {
  return new Pokemon(Object.assign({
    name,
    item: '',
    ability: '',
    nature: 'Hardy',
    moves: ['Tackle'],
    evs: {}
  }, overrides || {}), '', 'champions');
}

function mkField(overrides) {
  return new Field(Object.assign({ format: 'doubles' }, overrides || {}));
}

const TYPE_CHART = {
  Normal:   { Rock:0.5, Ghost:0, Steel:0.5 },
  Fire:     { Fire:0.5, Water:0.5, Rock:0.5, Dragon:0.5, Grass:2, Ice:2, Bug:2, Steel:2 },
  Water:    { Water:0.5, Grass:0.5, Dragon:0.5, Fire:2, Ground:2, Rock:2 },
  Electric: { Electric:0.5, Grass:0.5, Dragon:0.5, Ground:0, Flying:2, Water:2 },
  Grass:    { Fire:0.5, Grass:0.5, Poison:0.5, Flying:0.5, Bug:0.5, Dragon:0.5, Steel:0.5, Water:2, Ground:2, Rock:2 },
  Ice:      { Water:0.5, Ice:0.5, Fire:0.5, Steel:0.5, Grass:2, Ground:2, Flying:2, Dragon:2 },
  Fighting: { Normal:2, Ice:2, Rock:2, Dark:2, Steel:2, Poison:0.5, Bug:0.5, Psychic:0.5, Flying:0.5, Ghost:0, Fairy:0.5 },
  Poison:   { Grass:2, Fairy:2, Poison:0.5, Ground:0.5, Rock:0.5, Ghost:0.5, Steel:0 },
  Ground:   { Electric:2, Fire:2, Poison:2, Rock:2, Steel:2, Grass:0.5, Bug:0.5, Flying:0 },
  Flying:   { Grass:2, Fighting:2, Bug:2, Rock:0.5, Steel:0.5, Electric:0.5 },
  Psychic:  { Fighting:2, Poison:2, Psychic:0.5, Steel:0.5, Dark:0 },
  Bug:      { Grass:2, Psychic:2, Dark:2, Fire:0.5, Fighting:0.5, Flying:0.5, Ghost:0.5, Steel:0.5, Fairy:0.5 },
  Rock:     { Fire:2, Ice:2, Flying:2, Bug:2, Fighting:0.5, Ground:0.5, Steel:0.5 },
  Ghost:    { Ghost:2, Psychic:2, Normal:0, Dark:0.5 },
  Dragon:   { Dragon:2, Steel:0.5, Fairy:0 },
  Dark:     { Ghost:2, Psychic:2, Fighting:0.5, Dark:0.5, Fairy:0.5 },
  Steel:    { Ice:2, Rock:2, Fairy:2, Fire:0.5, Water:0.5, Electric:0.5, Steel:0.5 },
  Fairy:    { Fighting:2, Dragon:2, Dark:2, Fire:0.5, Poison:0.5, Steel:0.5 },
};

function handDamage(attacker, target, move, field, roll) {
  const moveType = runtimeData.getMoveType(move);
  const isPhysical = runtimeData.getMoveCategory(move) === 'physical';
  const atk = isPhysical ? attacker.getStat('atk', field) : attacker.getStat('spa', field);
  const def = isPhysical ? target.getStat('def', field) : target.getStat('spd', field);
  let bp = runtimeData.getMoveBasePower(move);
  if (bp === undefined) bp = 60;
  if (bp === 0) return 0;
  if (move === 'Weather Ball' && field.weather !== 'none') bp = 100;
  if (move === 'Electro Shot' && field.weather === 'rain') bp = 130;
  if (move === 'Eruption') bp = Math.max(1, Math.floor(150 * attacker.hp / attacker.maxHp));
  const bpMods = [];
  if (attacker.helpingHand) bpMods.push(6144);
  if (!attacker.flying) {
    if (field.terrain === 'electric' && moveType === 'Electric') bpMods.push(5325);
    if (field.terrain === 'grassy' && moveType === 'Grass') bpMods.push(5325);
    if (field.terrain === 'psychic' && moveType === 'Psychic') bpMods.push(5325);
  }
  if (!target.flying) {
    if (field.terrain === 'misty' && moveType === 'Dragon') bpMods.push(2048);
    if (field.terrain === 'grassy' && (move === 'Earthquake' || move === 'Bulldoze')) bpMods.push(2048);
  }
  bp = applyBasePowerMods(bp, bpMods);
  let typeEff = 1;
  const chart = TYPE_CHART[moveType] || {};
  for (const targetType of target.types) {
    typeEff *= (chart[targetType] !== undefined ? chart[targetType] : 1);
  }
  if (move === 'Freeze-Dry' && target.types.includes('Water')) typeEff *= 2;
  if (typeEff === 0) return 0;
  const stab = attacker.types.includes(moveType) ? 1.5 : 1;
  const spreadMod = (field && field._ctx && field._ctx.isSpread) ? 3072 : 4096;
  let weatherMod = 4096;
  if (field.weather === 'sun') {
    if (moveType === 'Fire') weatherMod = 6144;
    if (moveType === 'Water') weatherMod = 2048;
  }
  if (field.weather === 'rain') {
    if (moveType === 'Water') weatherMod = 6144;
    if (moveType === 'Fire') weatherMod = 2048;
  }
  const screenBase = field._format === 'doubles' ? 2732 : 2048;
  let screenMod = 4096;
  if (target.side) {
    if (target.side.auroraVeil) screenMod = screenBase;
    else if (isPhysical && target.side.reflect) screenMod = screenBase;
    else if (!isPhysical && target.side.lightScreen) screenMod = screenBase;
  }
  const raw = Math.floor(Math.floor(Math.floor(2 * attacker.level / 5 + 2) * bp * atk / def) / 50) + 2;
  let baseDamage = raw;
  baseDamage = applyBaseDamageMod(baseDamage, spreadMod);
  baseDamage = applyBaseDamageMod(baseDamage, weatherMod);
  return finalizeDamage(baseDamage, roll, typeEff, false, stab === 1.5 ? 6144 : 4096, screenMod);
}

console.log('\n=== damage pipeline tests ===\n');

T('1. damage follows explicit staged rounding instead of one-shot modifier lumping', () => {
  const attacker = mk('Raichu', { nature: 'Modest', moves: ['Thunderbolt'], evs: { spa: 31 } });
  const target = mk('Pelipper');
  const field = mkField();
  attacker.side = field.playerSide;
  target.side = field.oppSide;
  field._ctx.forceNoCrit = true;
  const expected = handDamage(attacker, target, 'Thunderbolt', field, 0.86);
  const actual = attacker.calcDamage('Thunderbolt', target, field, null, function() { return 0; });
  eq(actual, expected, 'staged damage chain mismatch');
});

T('2. sand does not boost Rock-type move damage', () => {
  const attacker = mk('Tyranitar', { nature: 'Adamant', moves: ['Rock Slide'], evs: { atk: 31 } });
  const target = mk('Charizard');
  const clear = mkField({ weather: 'none' });
  const sand = mkField({ weather: 'sand' });
  attacker.side = clear.playerSide;
  target.side = clear.oppSide;
  clear._ctx.forceNoCrit = true;
  const clearDmg = attacker.calcDamage('Rock Slide', target, clear, null, function() { return 0; });
  attacker.side = sand.playerSide;
  target.side = sand.oppSide;
  sand._ctx.forceNoCrit = true;
  const sandDmg = attacker.calcDamage('Rock Slide', target, sand, null, function() { return 0; });
  eq(sandDmg, clearDmg, 'sand should not increase Rock move damage');
});

T('3. Rock-types gain special defense in sand against special hits', () => {
  const attacker = mk('Gardevoir', { nature: 'Modest', moves: ['Moonblast'], evs: { spa: 31 } });
  const target = mk('Tyranitar');
  const clear = mkField({ weather: 'none' });
  const sand = mkField({ weather: 'sand' });
  attacker.side = clear.playerSide;
  target.side = clear.oppSide;
  clear._ctx.forceNoCrit = true;
  const clearDmg = attacker.calcDamage('Moonblast', target, clear, null, function() { return 0; });
  attacker.side = sand.playerSide;
  target.side = sand.oppSide;
  sand._ctx.forceNoCrit = true;
  const sandDmg = attacker.calcDamage('Moonblast', target, sand, null, function() { return 0; });
  truthy(clearDmg > sandDmg, 'sand should reduce special damage into Rock-types');
});

T('4. electric terrain boost keys off attacker grounded state, not target grounded state', () => {
  const attacker = mk('Raichu', { nature: 'Modest', moves: ['Thunderbolt'], evs: { spa: 31 } });
  const target = mk('Pelipper');
  const clear = mkField({ terrain: 'none' });
  const electric = mkField({ terrain: 'electric' });
  attacker.side = clear.playerSide;
  target.side = clear.oppSide;
  clear._ctx.forceNoCrit = true;
  const clearDmg = attacker.calcDamage('Thunderbolt', target, clear, null, function() { return 0; });
  attacker.side = electric.playerSide;
  target.side = electric.oppSide;
  electric._ctx.forceNoCrit = true;
  const terrainDmg = attacker.calcDamage('Thunderbolt', target, electric, null, function() { return 0; });
  truthy(terrainDmg > clearDmg, 'grounded attacker should receive electric terrain boost even into a Flying target');
});

T('5. flying attackers do not receive electric terrain damage boost', () => {
  const attacker = mk('Zapdos', { nature: 'Modest', moves: ['Thunderbolt'], evs: { spa: 31 } });
  const target = mk('Pelipper');
  const clear = mkField({ terrain: 'none' });
  const electric = mkField({ terrain: 'electric' });
  attacker.side = clear.playerSide;
  target.side = clear.oppSide;
  clear._ctx.forceNoCrit = true;
  const clearDmg = attacker.calcDamage('Thunderbolt', target, clear, null, function() { return 0; });
  attacker.side = electric.playerSide;
  target.side = electric.oppSide;
  electric._ctx.forceNoCrit = true;
  const terrainDmg = attacker.calcDamage('Thunderbolt', target, electric, null, function() { return 0; });
  eq(terrainDmg, clearDmg, 'flying attacker should not receive electric terrain boost');
});

console.log('\ndamage pipeline:', pass + ' pass, ' + fail + ' fail\n');
process.exit(fail ? 1 : 0);
