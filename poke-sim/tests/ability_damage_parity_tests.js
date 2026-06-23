'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const ctx = {
  console, require, module: {}, exports: {}, Math, Object, Array, Set, JSON,
  Promise, setTimeout, clearTimeout, Date, String, Number, Boolean, RegExp
};
ctx.globalThis = ctx;
ctx.window = {};
vm.createContext(ctx);

function load(file) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
}

load('data.js');
load('generated/pokemon_showdown_legal_data.js');
load('runtime_data.js');
load('engine.js');
vm.runInContext('this.Pokemon = Pokemon; this.Field = Field; this.simulateBattle = simulateBattle;', ctx);

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

function truthy(value, msg) {
  if (!value) throw new Error(msg || 'expected truthy');
}

function falsy(value, msg) {
  if (value) throw new Error(msg || 'expected falsy');
}

function member(name, overrides) {
  return Object.assign({
    name,
    level: 50,
    item: '',
    ability: '',
    nature: 'Serious',
    moves: ['Tackle'],
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
  }, overrides || {});
}

function team(members) {
  return {
    name: 'Test',
    format: 'champions',
    legality_status: 'legal',
    members
  };
}

console.log('\n=== ability damage parity tests ===\n');

T('1. Sturdy survives a lethal hit from full HP', function() {
  const probe = new ctx.Pokemon(member('Magnemite', { ability: 'Sturdy' }), '', 'champions');
  const battle = ctx.simulateBattle(
    team([member('Magnemite', { ability: 'Sturdy', hp: probe.maxHp })]),
    team([member('Garchomp', {
      ability: '',
      nature: 'Adamant',
      moves: ['Earthquake'],
      evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }
    })]),
    { format: 'singles', seed: [1, 2, 3, 4], maxTurns: 1 }
  );
  truthy(battle.log.some(line => String(line).includes('Magnemite hung on with Sturdy!')),
    'Sturdy activation log missing');
  eq(battle.playerSurvivors, 1, 'Sturdy holder should still be alive after the hit');
});

T('2. Sturdy does not trigger once the holder is chipped below full HP', function() {
  const probe = new ctx.Pokemon(member('Magnemite', { ability: 'Sturdy' }), '', 'champions');
  const battle = ctx.simulateBattle(
    team([member('Magnemite', { ability: 'Sturdy', hp: probe.maxHp - 1 })]),
    team([member('Garchomp', {
      ability: '',
      nature: 'Adamant',
      moves: ['Earthquake'],
      evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }
    })]),
    { format: 'singles', seed: [1, 2, 3, 4], maxTurns: 1 }
  );
  falsy(battle.log.some(line => String(line).includes('Magnemite hung on with Sturdy!')),
    'Sturdy should not trigger after prior chip damage');
  eq(battle.playerSurvivors, 0, 'Chipped Sturdy holder should faint to the lethal hit');
});

T('3. Rough Skin damages a contact attacker by one eighth max HP', function() {
  const attackerProbe = new ctx.Pokemon(member('Ninjask', { moves: ['Tackle'] }), '', 'champions');
  const expectedChip = Math.max(1, Math.floor(attackerProbe.maxHp / 8));
  const battle = ctx.simulateBattle(
    team([member('Ninjask', {
      moves: ['Tackle'],
      evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }
    })]),
    team([member('Garchomp', {
      ability: 'Rough Skin',
      moves: ['Splash'],
      evs: { hp: 32, atk: 0, def: 32, spa: 0, spd: 0, spe: 0 }
    })]),
    { format: 'singles', seed: [1, 2, 3, 4], maxTurns: 1 }
  );
  truthy(battle.log.some(line => String(line).includes("Ninjask was hurt by Garchomp's Rough Skin! [" + expectedChip + ' dmg]')),
    'Rough Skin contact chip log missing');
});

T('4. Rough Skin does not damage non-contact attackers', function() {
  const battle = ctx.simulateBattle(
    team([member('Garchomp', {
      moves: ['Earthquake'],
      evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }
    })]),
    team([member('Garchomp', {
      ability: 'Rough Skin',
      moves: ['Splash'],
      evs: { hp: 32, atk: 0, def: 32, spa: 0, spd: 0, spe: 0 }
    })]),
    { format: 'singles', seed: [1, 2, 3, 4], maxTurns: 1 }
  );
  falsy(battle.log.some(line => String(line).includes('Rough Skin')),
    'Rough Skin should not trigger on Earthquake');
});

T('5. Rough Skin can KO a weakened contact attacker after damage is dealt', function() {
  const battle = ctx.simulateBattle(
    team([member('Ninjask', {
      hp: 1,
      moves: ['Tackle'],
      evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }
    })]),
    team([member('Garchomp', {
      ability: 'Rough Skin',
      moves: ['Splash'],
      evs: { hp: 32, atk: 0, def: 32, spa: 0, spd: 0, spe: 0 }
    })]),
    { format: 'singles', seed: [1, 2, 3, 4], maxTurns: 1 }
  );
  truthy(battle.log.some(line => String(line).includes("Ninjask was hurt by Garchomp's Rough Skin!")),
    'Rough Skin KO chip log missing');
  truthy(battle.log.some(line => String(line).includes('Ninjask fainted!')),
    'Rough Skin should faint the weakened attacker');
  eq(battle.playerSurvivors, 0, 'Rough Skin should leave no player survivors when it KOs the only attacker');
});

T('6. Earth Eater blocks Ground damage and heals the target', function() {
  const orthwormEvs = { hp: 31, atk: 1, def: 1, spa: 0, spd: 32, spe: 1 };
  const probe = new ctx.Pokemon(member('Orthworm', { ability: 'Earth Eater', evs: orthwormEvs }), '', 'champions');
  const expectedHeal = Math.max(1, Math.floor(probe.maxHp / 4));
  const startingHp = probe.maxHp - expectedHeal;
  const battle = ctx.simulateBattle(
    team([member('Orthworm', {
      ability: 'Earth Eater',
      hp: startingHp,
      moves: ['Splash'],
      evs: orthwormEvs
    })]),
    team([member('Garchomp', {
      ability: '',
      nature: 'Adamant',
      moves: ['Earthquake'],
      evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }
    })]),
    { format: 'singles', seed: [1, 2, 3, 4], maxTurns: 1 }
  );
  truthy(battle.log.some(line => String(line).includes("Orthworm's Earth Eater restored HP! [+" + expectedHeal + ' HP]')),
    'Earth Eater heal log missing');
  falsy(battle.log.some(line => String(line).includes('Garchomp used Earthquake!') && String(line).includes('Orthworm')),
    'Earth Eater should block normal Earthquake damage application');
  eq(battle.playerSurvivors, 1, 'Earth Eater holder should survive the Ground hit');
});

T('7. Mold Breaker bypasses Sturdy survival', function() {
  const probe = new ctx.Pokemon(member('Magnemite', { ability: 'Sturdy' }), '', 'champions');
  const battle = ctx.simulateBattle(
    team([member('Magnemite', { ability: 'Sturdy', hp: probe.maxHp })]),
    team([member('Haxorus', {
      ability: 'Mold Breaker',
      nature: 'Adamant',
      moves: ['Earthquake'],
      evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }
    })]),
    { format: 'singles', seed: [41, 42, 43, 44], maxTurns: 1 }
  );
  falsy(battle.log.some(line => String(line).includes('Magnemite hung on with Sturdy!')),
    'Mold Breaker should bypass Sturdy');
  eq(battle.playerSurvivors, 0, 'Mold Breaker hit should KO through Sturdy');
});

T('8. Sheer Force suppresses modeled secondary stat drops', function() {
  const battle = ctx.simulateBattle(
    team([member('Nidoking', {
      ability: 'Sheer Force',
      nature: 'Modest',
      moves: ['Snarl'],
      evs: { hp: 0, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 }
    })]),
    team([member('Pelipper', {
      ability: 'Keen Eye',
      moves: ['Splash'],
      evs: { hp: 32, atk: 0, def: 0, spa: 32, spd: 32, spe: 0 }
    })]),
    { format: 'singles', seed: [45, 46, 47, 48], maxTurns: 1 }
  );
  truthy(battle.log.some(line => String(line).includes('Nidoking used Snarl!')),
    'Sheer Force test should execute Snarl');
  falsy(battle.log.some(line => String(line).includes("Pelipper's Special Attack fell!")),
    'Sheer Force should suppress Snarl Special Attack drops');
});

T('9. Infiltrator damages the target instead of its Substitute', function() {
  const battle = ctx.simulateBattle(
    team([member('Chandelure', {
      ability: 'Infiltrator',
      nature: 'Modest',
      moves: ['Shadow Ball'],
      evs: { hp: 0, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 }
    })]),
    team([member('Cresselia', {
      ability: 'Levitate',
      substituteHp: 60,
      moves: ['Splash'],
      evs: { hp: 32, atk: 0, def: 32, spa: 0, spd: 32, spe: 0 }
    })]),
    { format: 'singles', seed: [49, 50, 51, 52], maxTurns: 1 }
  );
  truthy(battle.log.some(line => String(line).includes('Chandelure used Shadow Ball!')),
    'Infiltrator test should execute Shadow Ball');
  falsy(battle.log.some(line => String(line).includes('Substitute absorbed')),
    'Infiltrator should not let Substitute absorb the attack');
});

T('10. Bulletproof blocks ballistic moves', function() {
  const field = new ctx.Field({ format: 'singles' });
  const attacker = new ctx.Pokemon(member('Chandelure', {
    ability: 'Flash Fire',
    nature: 'Modest',
    moves: ['Shadow Ball'],
    evs: { hp: 0, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 }
  }), '', 'champions');
  const target = new ctx.Pokemon(member('Chesnaught', {
    ability: 'Bulletproof',
    evs: { hp: 32, atk: 0, def: 32, spa: 0, spd: 32, spe: 0 }
  }), '', 'champions');
  attacker.side = field.playerSide;
  target.side = field.oppSide;
  field.playerSide.activeMons = [attacker];
  field.oppSide.activeMons = [target];
  eq(attacker.calcDamage('Shadow Ball', target, field, null, function() { return 0; }), 0,
    'Bulletproof should make Shadow Ball deal no damage');
});

T('11. Shell Armor prevents forced critical hits', function() {
  const field = new ctx.Field({ format: 'singles' });
  const attacker = new ctx.Pokemon(member('Persian', {
    ability: 'Limber',
    moves: ['Slash'],
    evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }
  }), '', 'champions');
  const target = new ctx.Pokemon(member('Lapras', {
    ability: 'Shell Armor',
    evs: { hp: 32, atk: 0, def: 32, spa: 0, spd: 32, spe: 0 }
  }), '', 'champions');
  attacker.side = field.playerSide;
  target.side = field.oppSide;
  field.playerSide.activeMons = [attacker];
  field.oppSide.activeMons = [target];
  field._ctx.forceCrit = true;
  truthy(attacker.calcDamage('Slash', target, field, null, function() { return 0; }) > 0,
    'Shell Armor target should still take normal damage');
  falsy(field._ctx.lastWasCrit, 'Shell Armor should suppress the forced crit flag');
});

T('12. Mind Eye lets Normal and Fighting moves hit Ghost targets', function() {
  const field = new ctx.Field({ format: 'singles' });
  const attacker = new ctx.Pokemon(member('Ursaluna-Bloodmoon', {
    ability: "Mind's Eye",
    moves: ['Tackle'],
    evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 0 }
  }), '', 'champions');
  const target = new ctx.Pokemon(member('Gengar', {
    ability: 'Cursed Body',
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 32 }
  }), '', 'champions');
  attacker.side = field.playerSide;
  target.side = field.oppSide;
  field.playerSide.activeMons = [attacker];
  field.oppSide.activeMons = [target];
  truthy(attacker.calcDamage('Tackle', target, field, null, function() { return 0; }) > 0,
    "Mind's Eye should bypass Ghost immunity for Normal moves");
});

T('13. Unnerve suppresses opposing berry activation', function() {
  const field = new ctx.Field({ format: 'singles' });
  const target = new ctx.Pokemon(member('Pelipper', {
    item: 'Sitrus Berry',
    ability: 'Keen Eye',
    evs: { hp: 32, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
  }), '', 'champions');
  const opp = new ctx.Pokemon(member('Tyranitar', {
    ability: 'Unnerve',
    evs: { hp: 32, atk: 32, def: 0, spa: 0, spd: 0, spe: 0 }
  }), '', 'champions');
  target.hp = Math.floor(target.maxHp / 2);
  target.side = field.playerSide;
  opp.side = field.oppSide;
  field.playerSide.activeMons = [target];
  field.oppSide.activeMons = [opp];
  const before = target.hp;
  const msg = target.applyItem('damage', field);
  eq(msg, undefined, 'Unnerve should suppress berry message');
  eq(target.hp, before, 'Unnerve should suppress berry healing');
  falsy(target.itemConsumed, 'suppressed berry should not be consumed');
});

T('14. Berserk raises Special Attack after crossing half HP from damage', function() {
  const drampaEvs = { hp: 32, atk: 0, def: 0, spa: 32, spd: 0, spe: 0 };
  const probe = new ctx.Pokemon(member('Drampa', { ability: 'Berserk', evs: drampaEvs }), '', 'champions');
  const battle = ctx.simulateBattle(
    team([member('Drampa', {
      ability: 'Berserk',
      hp: Math.floor(probe.maxHp / 2) + 1,
      moves: ['Splash'],
      evs: drampaEvs
    })]),
    team([member('Ninjask', {
      ability: 'Speed Boost',
      moves: ['Tackle'],
      evs: { hp: 0, atk: 1, def: 0, spa: 0, spd: 0, spe: 32 }
    })]),
    { format: 'singles', seed: [57, 58, 59, 60], maxTurns: 1 }
  );
  truthy(battle.log.some(line => String(line).includes("Drampa's Special Attack rose!")),
    'Berserk Special Attack boost log missing');
});

T('15. Stamina raises Defense after taking a damaging hit', function() {
  const battle = ctx.simulateBattle(
    team([member('Mudsdale', {
      ability: 'Stamina',
      moves: ['Splash'],
      evs: { hp: 32, atk: 0, def: 32, spa: 0, spd: 0, spe: 0 }
    })]),
    team([member('Ninjask', {
      moves: ['Tackle'],
      evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }
    })]),
    { format: 'singles', seed: [61, 62, 63, 64], maxTurns: 1 }
  );
  truthy(battle.log.some(line => String(line).includes("Mudsdale's Defense rose!")),
    'Stamina Defense boost log missing');
});

T('16. Mummy overwrites a contact attacker ability', function() {
  const battle = ctx.simulateBattle(
    team([member('Ninjask', {
      ability: 'Speed Boost',
      moves: ['X-Scissor'],
      evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }
    })]),
    team([member('Cofagrigus', {
      ability: 'Mummy',
      moves: ['Splash'],
      evs: { hp: 32, atk: 0, def: 32, spa: 0, spd: 32, spe: 0 }
    })]),
    { format: 'singles', seed: [65, 66, 67, 68], maxTurns: 1 }
  );
  truthy(battle.log.some(line => String(line).includes("Ninjask's Ability became Mummy!")),
    'Mummy overwrite log missing');
});

T('17. Innards Out damages the attacker by the target pre-hit HP on KO', function() {
  const battle = ctx.simulateBattle(
    team([member('Pyukumuku', {
      ability: 'Innards Out',
      hp: 7,
      moves: ['Splash'],
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
    })]),
    team([member('Garchomp', {
      ability: 'Rough Skin',
      nature: 'Adamant',
      moves: ['Earthquake'],
      evs: { hp: 32, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }
    })]),
    { format: 'singles', seed: [69, 70, 71, 72], maxTurns: 1 }
  );
  truthy(battle.log.some(line => String(line).includes("Garchomp was hurt by Pyukumuku's Innards Out! [7 dmg]")),
    'Innards Out reflected damage log missing');
});

T('18. Skill Link makes supported multi-hit moves hit five times', function() {
  const battle = ctx.simulateBattle(
    team([member('Heracross', {
      ability: 'Skill Link',
      moves: ['Rock Blast'],
      evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }
    })]),
    team([member('Lapras', {
      ability: 'Water Absorb',
      moves: ['Splash'],
      evs: { hp: 32, atk: 0, def: 32, spa: 0, spd: 32, spe: 0 }
    })]),
    { format: 'singles', seed: [73, 74, 75, 76], maxTurns: 1 }
  );
  truthy(battle.log.some(line => String(line).includes('Rock Blast hit 5 times!')),
    'Skill Link should force five Rock Blast hits');
});

console.log('\nability damage parity:', pass + ' pass, ' + fail + ' fail\n');
process.exit(fail ? 1 : 0);
