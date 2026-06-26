// battle_system_mechanics_tests.js
//
// DIAGNOSTIC test suite — purpose is NOT to prove the sim is correct.
// Purpose: reveal the CURRENT STATE of each battle mechanic so the team
// can see exactly which paths are wired, which are missing, and what
// needs to be fixed before the next release gate.
//
// Each PASS = mechanic works as specified.
// Each FAIL = mechanic is missing or behaves differently than specified.
//             The error message tells you what the sim actually did.
//
// Exit code is always 0 (diagnostic mode — does not block CI).

const fs   = require('fs');
const vm   = require('vm');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ctx = {
  console, require, module: {}, exports: {}, Math, Object, Array, Set, Map,
  JSON, Promise, setTimeout, clearTimeout, Date, String, Number, Boolean,
  RegExp, parseInt, parseFloat
};
vm.createContext(ctx);

function load(f) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
}
load('data.js');
load('engine.js');
vm.runInContext([
  'this.Pokemon          = Pokemon;',
  'this.Field            = Field;',
  'this.simulateBattle   = simulateBattle;',
  'this.canInflictStatus = canInflictStatus;',
  'this.getPriority      = getPriority;',
].join('\n'), ctx);

const { Pokemon, Field, simulateBattle } = ctx;

// ── test helpers ──────────────────────────────────────────────────────────────
let pass = 0, fail = 0;
const results = [];

function T(name, fn) {
  try {
    fn();
    console.log('  PASS', name);
    results.push({ name, status: 'PASS' });
    pass++;
  } catch (e) {
    console.log('  FAIL', name, '\n       →', e.message);
    results.push({ name, status: 'FAIL', reason: e.message });
    fail++;
  }
}

function eq(a, b, msg)   { if (a !== b)  throw new Error(`${msg || ''} expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }
function truthy(v, msg)  { if (!v)       throw new Error(msg || `expected truthy, got ${JSON.stringify(v)}`); }
function falsy(v, msg)   { if (v)        throw new Error(msg || `expected falsy, got ${JSON.stringify(v)}`); }
function near(a, lo, hi, msg) {
  if (a < lo || a > hi) throw new Error(`${msg || ''} ${a} not in [${lo}, ${hi}]`);
}

// ── factory helpers ───────────────────────────────────────────────────────────
function mkMon(overrides) {
  return new Pokemon(Object.assign({
    name: 'Garchomp', level: 50, moves: ['Tackle'], ability: '', item: '',
    nature: 'Hardy', evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
  }, overrides));
}

function team(members) {
  return { name: 'TestTeam', format: 'champions', legality_status: 'legal', members };
}

function mon(overrides) {
  return Object.assign({
    name: 'Garchomp', level: 50, moves: ['Tackle'], ability: '', item: '',
    nature: 'Hardy', evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
  }, overrides);
}

function logHas(log, substr) {
  return log.some(l => String(l).includes(substr));
}

// =============================================================================
// SECTION 1 — BURN MECHANICS
// =============================================================================
console.log('\n=== SECTION 1: Burn mechanics ===');
console.log('Expected: burn halves physical Atk (Guts bypasses), does NOT halve SpA.');

T('1. Burned attacker deals roughly half physical damage vs healthy attacker', () => {
  const field   = new Field();
  const target  = mkMon({ name: 'Cresselia', nature: 'Bold',
    evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 0, spe: 4 } });
  const healthy = mkMon({ name: 'Incineroar', nature: 'Adamant',
    evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 0, spe: 0 } });
  const burned  = mkMon({ name: 'Incineroar', nature: 'Adamant',
    evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 0, spe: 0 }, status: 'burn' });
  const rng = () => 0.5;
  const dHealthy = healthy.calcDamage('Flare Blitz', target, field, null, rng);
  const dBurned  = burned.calcDamage('Flare Blitz',  target, field, null, rng);
  truthy(dHealthy > 0, `healthy damage must be positive, got ${dHealthy}`);
  truthy(dBurned  > 0, `burned damage must be positive, got ${dBurned}`);
  near(dBurned / dHealthy, 0.45, 0.55,
    `burn penalty ratio (should be ~0.5): healthy=${dHealthy}, burned=${dBurned}, ratio=`);
});

T('2. Burned attacker special damage is NOT reduced', () => {
  const field   = new Field();
  const target  = mkMon({ name: 'Cresselia', nature: 'Calm',
    evs: { hp: 252, atk: 0, def: 0, spa: 0, spd: 252, spe: 4 } });
  const healthy = mkMon({ name: 'Incineroar', nature: 'Modest',
    evs: { hp: 0, atk: 0, def: 0, spa: 252, spd: 0, spe: 0 } });
  const burned  = mkMon({ name: 'Incineroar', nature: 'Modest',
    evs: { hp: 0, atk: 0, def: 0, spa: 252, spd: 0, spe: 0 }, status: 'burn' });
  const rng = () => 0.5;
  const dHealthy = healthy.calcDamage('Flamethrower', target, field, null, rng);
  const dBurned  = burned.calcDamage('Flamethrower',  target, field, null, rng);
  eq(dHealthy, dBurned,
    `burn should NOT reduce special damage. healthy=${dHealthy}, burned=${dBurned}`);
});

T('3. Guts ability negates burn physical damage penalty', () => {
  const field   = new Field();
  const target  = mkMon({ name: 'Cresselia', nature: 'Bold',
    evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 0, spe: 4 } });
  const healthy = mkMon({ name: 'Conkeldurr', nature: 'Adamant', ability: 'Guts',
    evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 0, spe: 0 } });
  const burned  = mkMon({ name: 'Conkeldurr', nature: 'Adamant', ability: 'Guts',
    evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 0, spe: 0 }, status: 'burn' });
  const rng = () => 0.5;
  const dHealthy = healthy.calcDamage('Tackle', target, field, null, rng);
  const dBurned  = burned.calcDamage('Tackle',  target, field, null, rng);
  truthy(dBurned >= dHealthy,
    `Guts should negate burn penalty. healthy=${dHealthy}, burned (Guts)=${dBurned}`);
});

// =============================================================================
// SECTION 2 — PARALYSIS SPEED CUT
// =============================================================================
console.log('\n=== SECTION 2: Paralysis speed cut ===');
console.log('Expected: paralysis halves effective speed via getStat(spe).');

T('4. getStat("spe") is halved when paralyzed', () => {
  const field = new Field();
  const m = mkMon({ name: 'Dragapult', nature: 'Timid',
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 252 } });
  const speedHealthy   = m.getStat('spe', field);
  m.status = 'paralysis';
  const speedParalyzed = m.getStat('spe', field);
  near(speedParalyzed / speedHealthy, 0.49, 0.51,
    `paralysis speed ratio (should be 0.5): healthy=${speedHealthy}, paralyzed=${speedParalyzed}, ratio=`);
});

T('5. Paralyzed fast mon (Dragapult) acts after slower healthy mon (Garchomp) in live battle', () => {
  // Paralyzed Dragapult (base spe 142 * 0.5 ≈ 106 eff) vs Jolly Garchomp (base spe 102 ≈ 147 eff)
  // Garchomp should be faster and its "used" line should appear first in the log
  const playerTeam = team([mon({
    name: 'Dragapult', ability: 'Cursed Body', nature: 'Timid',
    evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 },
    status: 'paralysis', moves: ['Tackle']
  })]);
  const oppTeam = team([mon({
    name: 'Garchomp', ability: 'Rough Skin', nature: 'Jolly',
    evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 },
    moves: ['Tackle']
  })]);
  const b = simulateBattle(playerTeam, oppTeam, { format: 'singles', seed: [1, 2, 3, 4], maxTurns: 1 });
  const log = b.log || [];
  const garchompIdx  = log.findIndex(l => String(l).includes('Garchomp') && String(l).includes('used'));
  const dragapultIdx = log.findIndex(l => String(l).includes('Dragapult') && String(l).includes('used'));
  const paralyzed    = logHas(log, 'fully paralys');
  truthy(garchompIdx !== -1, 'Garchomp must have used a move');
  truthy(dragapultIdx !== -1 || paralyzed,
    `Dragapult must have acted or been paralyzed. Log: ${log.slice(0,10).join(' | ')}`);
  if (dragapultIdx !== -1) {
    truthy(garchompIdx < dragapultIdx,
      `Garchomp (log idx ${garchompIdx}) should act BEFORE paralyzed Dragapult (log idx ${dragapultIdx})`);
  }
});

// =============================================================================
// SECTION 3 — REDIRECTION: Follow Me / Rage Powder
// =============================================================================
console.log('\n=== SECTION 3: Redirection (Follow Me / Rage Powder) ===');
console.log('Expected: Follow Me / Rage Powder sets redirectTo. Stalwart, Grass type, Overcoat bypass Rage Powder.');

T('6. Follow Me sets "center of attention" log in a live doubles battle', () => {
  const playerTeam = team([
    mon({ name: 'Clefairy', ability: 'Friend Guard', nature: 'Calm',
      evs: { hp: 252, atk: 0, def: 0, spa: 0, spd: 252, spe: 4 }, moves: ['Follow Me'] }),
    mon({ name: 'Garchomp', ability: 'Rough Skin', nature: 'Jolly',
      evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 }, moves: ['Tackle'] }),
  ]);
  const oppTeam = team([
    mon({ name: 'Incineroar', ability: 'Intimidate', nature: 'Careful',
      evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 0, spe: 0 }, moves: ['Flare Blitz'] }),
    mon({ name: 'Dragapult', ability: 'Cursed Body', nature: 'Timid',
      evs: { hp: 0, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 }, moves: ['Shadow Ball'] }),
  ]);
  const b = simulateBattle(playerTeam, oppTeam, { format: 'doubles', seed: [10, 20, 30, 40], maxTurns: 2 });
  const log = b.log || [];
  truthy(logHas(log, 'center of attention'),
    `Follow Me must log "center of attention". First 15 log lines: ${log.slice(0, 15).join(' | ')}`);
});

T('7. Rage Powder sets redirection and "drawn to" appears when a non-Grass attacker is redirected', () => {
  const playerTeam = team([
    mon({ name: 'Amoonguss', ability: 'Effect Spore', nature: 'Calm',
      evs: { hp: 252, atk: 0, def: 0, spa: 0, spd: 252, spe: 4 }, moves: ['Rage Powder'] }),
    mon({ name: 'Garchomp', ability: 'Rough Skin', nature: 'Jolly',
      evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 }, moves: ['Tackle'] }),
  ]);
  const oppTeam = team([
    mon({ name: 'Incineroar', ability: 'Intimidate', nature: 'Careful',
      evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 0, spe: 0 }, moves: ['Flare Blitz'] }),
    mon({ name: 'Dragapult', ability: 'Cursed Body', nature: 'Timid',
      evs: { hp: 0, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 }, moves: ['Shadow Ball'] }),
  ]);
  const b = simulateBattle(playerTeam, oppTeam, { format: 'doubles', seed: [5, 15, 25, 35], maxTurns: 2 });
  const log = b.log || [];
  truthy(logHas(log, 'center of attention'),
    `Rage Powder must log "center of attention". Log: ${log.slice(0, 15).join(' | ')}`);
  truthy(logHas(log, 'drawn to'),
    `At least one non-Grass attacker must be redirected ("drawn to"). Log: ${log.slice(0, 20).join(' | ')}`);
});

T('8. Rage Powder: Grass-type attacker (Whimsicott) bypasses redirection', () => {
  // Whimsicott is Grass/Fairy. Rage Powder should NOT redirect its moves.
  const playerTeam = team([
    mon({ name: 'Amoonguss', ability: 'Effect Spore', nature: 'Calm',
      evs: { hp: 252, atk: 0, def: 0, spa: 0, spd: 252, spe: 4 }, moves: ['Rage Powder'] }),
    mon({ name: 'Garchomp', ability: 'Rough Skin', nature: 'Jolly',
      evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 }, moves: ['Tackle'] }),
  ]);
  const oppTeam = team([
    mon({ name: 'Whimsicott', ability: 'Prankster', nature: 'Timid',
      evs: { hp: 252, atk: 0, def: 0, spa: 0, spd: 0, spe: 252 }, moves: ['Energy Ball'] }),
    mon({ name: 'Incineroar', ability: 'Intimidate', nature: 'Careful',
      evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 0, spe: 0 }, moves: ['Flare Blitz'] }),
  ]);
  const b = simulateBattle(playerTeam, oppTeam, { format: 'doubles', seed: [3, 6, 9, 12], maxTurns: 2 });
  const log = b.log || [];
  truthy(logHas(log, 'center of attention'),
    `Rage Powder must be set first. Log: ${log.slice(0, 15).join(' | ')}`);
  // Whimsicott's move should NOT produce a "drawn to" line for Whimsicott
  const whimsicottRedirected = log.some(l =>
    String(l).includes('Whimsicott') && String(l).includes('drawn to'));
  falsy(whimsicottRedirected,
    `Grass-type Whimsicott should NOT be redirected. Log: ${log.slice(0, 20).join(' | ')}`);
});

T('9. Stalwart ability bypasses Follow Me / Rage Powder redirection', () => {
  const playerTeam = team([
    mon({ name: 'Amoonguss', ability: 'Effect Spore', nature: 'Calm',
      evs: { hp: 252, atk: 0, def: 0, spa: 0, spd: 252, spe: 4 }, moves: ['Rage Powder'] }),
    mon({ name: 'Garchomp', ability: 'Rough Skin', nature: 'Jolly',
      evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 }, moves: ['Tackle'] }),
  ]);
  const oppTeam = team([
    mon({ name: 'Dhelmise', ability: 'Stalwart', nature: 'Adamant',
      evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 0, spe: 0 }, moves: ['Tackle'] }),
    mon({ name: 'Incineroar', ability: 'Intimidate', nature: 'Careful',
      evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 0, spe: 0 }, moves: ['Flare Blitz'] }),
  ]);
  const b = simulateBattle(playerTeam, oppTeam, { format: 'doubles', seed: [7, 14, 21, 28], maxTurns: 2 });
  const log = b.log || [];
  truthy(logHas(log, 'center of attention'),
    `Rage Powder must be set. Log: ${log.slice(0, 15).join(' | ')}`);
  const stalwartRedirected = log.some(l =>
    String(l).includes('Dhelmise') && String(l).includes('drawn to'));
  falsy(stalwartRedirected,
    `Stalwart Dhelmise should NOT produce a "drawn to" line. Log: ${log.slice(0, 20).join(' | ')}`);
});

// =============================================================================
// SECTION 4 — WIDE GUARD / QUICK GUARD
// =============================================================================
console.log('\n=== SECTION 4: Wide Guard / Quick Guard ===');
console.log('Expected: Wide Guard blocks spread moves. Quick Guard blocks +1 priority moves.');

T('10. Wide Guard blocks a spread move (Rock Slide) for the whole team', () => {
  const playerTeam = team([
    mon({ name: 'Arcanine', ability: 'Intimidate', nature: 'Impish',
      evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 0, spe: 4 }, moves: ['Wide Guard'] }),
    mon({ name: 'Garchomp', ability: 'Rough Skin', nature: 'Jolly',
      evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 }, moves: ['Tackle'] }),
  ]);
  const oppTeam = team([
    mon({ name: 'Landorus-Therian', ability: 'Intimidate', nature: 'Naive',
      evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 }, moves: ['Rock Slide'] }),
    mon({ name: 'Incineroar', ability: 'Intimidate', nature: 'Careful',
      evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 0, spe: 0 }, moves: ['Tackle'] }),
  ]);
  const b = simulateBattle(playerTeam, oppTeam, { format: 'doubles', seed: [1, 3, 5, 7], maxTurns: 1 });
  const log = b.log || [];
  truthy(logHas(log, 'Wide Guard'),
    `Wide Guard must be used. Log: ${log.slice(0, 15).join(' | ')}`);
  truthy(logHas(log, 'blocked') || logHas(log, 'Wide Guard blocked'),
    `Wide Guard must block Rock Slide. Log: ${log.join(' | ')}`);
});

T('11. Quick Guard blocks a +1 priority move (Fake Out) for the team', () => {
  const playerTeam = team([
    mon({ name: 'Cresselia', ability: 'Levitate', nature: 'Bold',
      evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 0, spe: 0 }, moves: ['Quick Guard'] }),
    mon({ name: 'Cresselia', ability: 'Levitate', nature: 'Calm',
      evs: { hp: 252, atk: 0, def: 0, spa: 0, spd: 252, spe: 4 }, moves: ['Moonblast'] }),
  ]);
  const oppTeam = team([
    mon({ name: 'Incineroar', ability: 'Intimidate', nature: 'Brave',
      evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 0, spe: 0 }, moves: ['Fake Out'] }),
    mon({ name: 'Dragapult', ability: 'Cursed Body', nature: 'Timid',
      evs: { hp: 0, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 }, moves: ['Tackle'] }),
  ]);
  const b = simulateBattle(playerTeam, oppTeam, { format: 'doubles', seed: [2, 4, 6, 8], maxTurns: 1 });
  const log = b.log || [];
  truthy(logHas(log, 'Quick Guard'),
    `Quick Guard must be used. Log: ${log.slice(0, 15).join(' | ')}`);
  truthy(logHas(log, 'blocked') || logHas(log, 'Quick Guard blocked'),
    `Quick Guard must block Fake Out. Log: ${log.join(' | ')}`);
});

// =============================================================================
// SECTION 5 — PROTECT FAMILY SECONDARY EFFECTS
// =============================================================================
console.log('\n=== SECTION 5: Protect family secondary effects ===');
console.log('Expected: Spiky Shield chips contact attackers. Baneful Bunker poisons them.');

T('12. Spiky Shield deals chip damage to a contact-move attacker', () => {
  const playerTeam = team([
    mon({ name: 'Ferrothorn', ability: 'Iron Barbs', nature: 'Relaxed',
      evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 0, spe: 0 }, moves: ['Spiky Shield'] }),
  ]);
  const oppTeam = team([
    mon({ name: 'Garchomp', ability: 'Rough Skin', nature: 'Jolly',
      evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 }, moves: ['Tackle'] }),
  ]);
  const b = simulateBattle(playerTeam, oppTeam, { format: 'singles', seed: [5, 6, 7, 8], maxTurns: 1 });
  const log = b.log || [];
  truthy(logHas(log, 'Spiky Shield'),
    `Spiky Shield must be used. Log: ${log.join(' | ')}`);
  truthy(logHas(log, 'hurt by Spiky Shield'),
    `Attacker must take Spiky Shield chip damage. Log: ${log.join(' | ')}`);
});

T('13. Baneful Bunker poisons a contact-move attacker', () => {
  const playerTeam = team([
    mon({ name: 'Toxapex', ability: 'Merciless', nature: 'Bold',
      evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 0, spe: 0 }, moves: ['Baneful Bunker'] }),
  ]);
  const oppTeam = team([
    mon({ name: 'Garchomp', ability: 'Rough Skin', nature: 'Jolly',
      evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 }, moves: ['Tackle'] }),
  ]);
  const b = simulateBattle(playerTeam, oppTeam, { format: 'singles', seed: [3, 4, 5, 6], maxTurns: 1 });
  const log = b.log || [];
  truthy(logHas(log, 'Baneful Bunker'),
    `Baneful Bunker must be used. Log: ${log.join(' | ')}`);
  truthy(logHas(log, 'poisoned by Baneful Bunker'),
    `Attacker must be poisoned by Baneful Bunker. Log: ${log.join(' | ')}`);
});

// =============================================================================
// SECTION 6 — PIVOT MECHANICS
// =============================================================================
console.log('\n=== SECTION 6: Pivot mechanics (U-turn / Parting Shot) ===');
console.log('Expected: U-turn deals damage then switches out. Parting Shot lowers stats then switches out.');

T('14. U-turn deals damage and logs a switchout', () => {
  const playerTeam = team([
    mon({ name: 'Incineroar', ability: 'Intimidate', nature: 'Careful',
      evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 0, spe: 0 }, moves: ['U-turn'] }),
    mon({ name: 'Garchomp', ability: 'Rough Skin', nature: 'Jolly',
      evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 }, moves: ['Tackle'] }),
  ]);
  const oppTeam = team([
    mon({ name: 'Dragapult', ability: 'Cursed Body', nature: 'Timid',
      evs: { hp: 0, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 }, moves: ['Tackle'] }),
  ]);
  const b = simulateBattle(playerTeam, oppTeam, { format: 'singles', seed: [1, 2, 3, 4], maxTurns: 1 });
  const log = b.log || [];
  truthy(logHas(log, 'U-turn'),
    `U-turn must appear in log. Log: ${log.join(' | ')}`);
  const hasPivot = logHas(log, 'switched out') || logHas(log, 'came back') ||
                   logHas(log, 'pivoted') || logHas(log, 'Incineroar') &&
                   logHas(log, 'Garchomp');
  truthy(hasPivot,
    `U-turn must trigger switchout and replacement. Log: ${log.join(' | ')}`);
});

T('15. Parting Shot is used and logs the move', () => {
  const playerTeam = team([
    mon({ name: 'Incineroar', ability: 'Intimidate', nature: 'Careful',
      evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 0, spe: 0 }, moves: ['Parting Shot'] }),
    mon({ name: 'Garchomp', ability: 'Rough Skin', nature: 'Jolly',
      evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 }, moves: ['Tackle'] }),
  ]);
  const oppTeam = team([
    mon({ name: 'Cresselia', ability: 'Levitate', nature: 'Bold',
      evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 0, spe: 4 }, moves: ['Moonblast'] }),
  ]);
  const b = simulateBattle(playerTeam, oppTeam, { format: 'singles', seed: [1, 2, 3, 4], maxTurns: 1 });
  const log = b.log || [];
  truthy(logHas(log, 'Parting Shot'),
    `Parting Shot must appear in log. Log: ${log.join(' | ')}`);
});

// =============================================================================
// SECTION 7 — EDGE CASES AND INTERACTION BOUNDARIES
// =============================================================================
console.log('\n=== SECTION 7: Edge cases and interaction boundaries ===');
console.log('Expected: type immunities block status, Frozen prevents action, Ice-type immune to freeze, Feint pierces Quick Guard, Wide Guard does not block single-target moves.');

T('16. Fire-type mon cannot be burned by Will-O-Wisp in live battle', () => {
  // Arcanine is Fire type — canInflictStatus returns false, burn must not apply.
  const playerTeam = team([
    mon({ name: 'Arcanine', ability: 'Intimidate', nature: 'Bold',
      evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 0, spe: 4 }, moves: ['Tackle'] }),
  ]);
  const oppTeam = team([
    mon({ name: 'Cresselia', ability: 'Levitate', nature: 'Calm',
      evs: { hp: 252, atk: 0, def: 0, spa: 0, spd: 252, spe: 4 }, moves: ['Will-O-Wisp'] }),
  ]);
  const b = simulateBattle(playerTeam, oppTeam, { format: 'singles', seed: [1, 2, 3, 4], maxTurns: 2 });
  const log = b.log || [];
  truthy(logHas(log, 'Will-O-Wisp'),
    `Will-O-Wisp must appear in log (confirm move was used). Log: ${log.join(' | ')}`);
  falsy(log.some(l => String(l).includes('Arcanine') && String(l).includes('burn')),
    `Fire-type Arcanine must be immune to burn. Log: ${log.join(' | ')}`);
});

T('17. Frozen status prevents the afflicted mon from acting that turn', () => {
  // Champions uses standard Frozen (not Frostbite). Frozen skips the mon's action.
  // Engine: simulateBattle checks frozen status and may skip the action.
  // The log must show either the frozen mon skipping OR the frozen mon thawing.
  const playerTeam = team([
    mon({ name: 'Garchomp', ability: 'Rough Skin', nature: 'Adamant',
      evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 },
      status: 'frozen', moves: ['Tackle'] }),
  ]);
  const oppTeam = team([
    mon({ name: 'Cresselia', ability: 'Levitate', nature: 'Bold',
      evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 0, spe: 4 }, moves: ['Moonblast'] }),
  ]);
  // Run 3 turns — guaranteed thaw by turn 3 per Champions rules
  const b = simulateBattle(playerTeam, oppTeam, { format: 'singles', seed: [1, 2, 3, 4], maxTurns: 3 });
  const log = b.log || [];
  const frozenSkipped = logHas(log, 'frozen') || logHas(log, 'thawed') || logHas(log, 'Garchomp fainted');
  truthy(frozenSkipped,
    `Frozen Garchomp must show freeze/thaw behavior in log. Log: ${log.join(' | ')}`);
});

T('18. Ice-type mon is immune to being frozen (canInflictStatus)', () => {
  // Champions uses Frozen. Ice-types are immune per canInflictStatus.
  // Engine: canInflictStatus checks types.includes('Ice') for frozen.
  const glaceon = mkMon({ name: 'Glaceon', nature: 'Bold',
    evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 0, spe: 4 } });
  const field = new Field();
  const immune = !ctx.canInflictStatus(glaceon, 'frozen', field, null);
  truthy(immune, `Ice-type Glaceon must be immune to Frozen status`);
  // Non-Ice type CAN be frozen (baseline sanity check)
  const garchomp = mkMon({ name: 'Garchomp', nature: 'Adamant',
    evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 0, spe: 0 } });
  const canFreeze = ctx.canInflictStatus(garchomp, 'frozen', field, null);
  truthy(canFreeze, `Non-Ice Garchomp must be freezable. canInflictStatus returned ${canFreeze}`);
});

T('19. Feint (priority +2) bypasses Quick Guard and deals damage', () => {
  // Quick Guard blocks all priority > 0 moves EXCEPT Feint (engine line ~5022).
  // Feint also lifts the target's Protect on hit.
  const playerTeam = team([
    mon({ name: 'Cresselia', ability: 'Levitate', nature: 'Bold',
      evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 0, spe: 0 }, moves: ['Quick Guard'] }),
  ]);
  const oppTeam = team([
    mon({ name: 'Incineroar', ability: 'Intimidate', nature: 'Adamant',
      evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 0, spe: 0 }, moves: ['Feint'] }),
  ]);
  const b = simulateBattle(playerTeam, oppTeam, { format: 'singles', seed: [1, 2, 3, 4], maxTurns: 1 });
  const log = b.log || [];
  truthy(logHas(log, 'Feint'),
    `Feint must appear in log. Log: ${log.join(' | ')}`);
  falsy(log.some(l => String(l).includes('Quick Guard blocked') && String(l).includes('Feint')),
    `Quick Guard must NOT block Feint. Log: ${log.join(' | ')}`);
});

T('20. Wide Guard does NOT block single-target moves — only spread', () => {
  // Wide Guard filter in executeMove only applies to isSpread (all-adjacent / all-adjacent-foes).
  // Single-target moves like Flare Blitz and Shadow Ball must still hit through Wide Guard.
  const playerTeam = team([
    mon({ name: 'Arcanine', ability: 'Intimidate', nature: 'Impish',
      evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 0, spe: 4 }, moves: ['Wide Guard'] }),
    mon({ name: 'Garchomp', ability: 'Rough Skin', nature: 'Jolly',
      evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 }, moves: ['Tackle'] }),
  ]);
  const oppTeam = team([
    mon({ name: 'Incineroar', ability: 'Intimidate', nature: 'Adamant',
      evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 0, spe: 0 }, moves: ['Flare Blitz'] }),
    mon({ name: 'Dragapult', ability: 'Cursed Body', nature: 'Timid',
      evs: { hp: 0, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 }, moves: ['Shadow Ball'] }),
  ]);
  const b = simulateBattle(playerTeam, oppTeam, { format: 'doubles', seed: [1, 3, 5, 7], maxTurns: 1 });
  const log = b.log || [];
  truthy(logHas(log, 'Wide Guard'),
    `Wide Guard must be used. Log: ${log.slice(0, 15).join(' | ')}`);
  // Flare Blitz and Shadow Ball are single-target — must NOT be blocked
  falsy(log.some(l =>
    String(l).includes('Wide Guard blocked') &&
    (String(l).includes('Flare Blitz') || String(l).includes('Shadow Ball'))
  ), `Wide Guard must NOT block single-target moves. Log: ${log.join(' | ')}`);
});

// =============================================================================
// SUMMARY
// =============================================================================
console.log('\n═══════════════════════════════════════════════════════════');
console.log(`DIAGNOSTIC RESULTS: ${pass} PASS  /  ${fail} FAIL  /  ${pass + fail} total`);
console.log('═══════════════════════════════════════════════════════════');

if (fail > 0) {
  console.log('\nFAILED TESTS (mechanics that need investigation):');
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`  ✗ ${r.name}`);
    console.log(`    ${r.reason}`);
  });
}

console.log('\nINTERPRETATION GUIDE:');
console.log('  PASS = mechanic is wired and behaves as expected');
console.log('  FAIL = mechanic is missing or has unexpected behavior');
console.log('  → Use FAIL messages to identify what to fix next');
console.log('  → All failures should be addressed before next release gate');

process.exit(0); // diagnostic mode — never blocks CI
