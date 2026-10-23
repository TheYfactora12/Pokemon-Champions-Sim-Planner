# Existing engine interface notes

Moved out of the browser payload to retain the existing size ceiling. Historical wording is preserved below; it is not current-client certification.

```js
// SEEDED PRNG — Issue #2 FIX
// Mulberry32: fast, deterministic, browser-safe.
// All battle randomness goes through rng() — never Math.random().
// Seed is a 4-number array [a,b,c,d] passed via opts.seed to
// simulateBattle(). runSimulation() auto-generates seeds per battle
// so each battle is independently reproducible.

// TEAM LEGALITY VALIDATOR — Issue #5 + #T2
// Called before every simulateBattle() invocation.
// Blocks on errors, warns on warnings.
//
// #T2 updates:
//   - Dual-format stat caps: Champions SP (<=32/stat, <=66 total)
//     vs SV EV (<=252/stat, <=510 total). Detects per team.
//   - Species Clause and Item Clause upgraded from warning -> ERROR
//     (VGC/Champions rules: both are hard bans, not soft recommendations).
//   - Optional Champions legality layer (ban list, fakemon) wired in
//     via validateChampionsLegality() if legality.js is loaded.
```

Additional historical comments moved unchanged for bundle budget:

```js
```

```js
// See ../docs/release/COMPETITIVE_READINESS_2026-10-20.md and the immutable reference evidence
//   Stage 0 = 1/24 ≈ 4.17%, Stage 1 = 1/8 = 12.5%, Stage 2 = 1/2, Stage 3+ = always.
//   Cite: https://bulbapedia.bulbagarden.net/wiki/Critical_hit#High_critical-hit_ratio_moves
//   onModifyDamage({move, moveType, attacker, defender, typeEffectiveness, field}) -> {finalMod}
//   onSourceModifyDamage({move, moveType, attacker, defender, typeEffectiveness, field}) -> {finalMod}
//   onProtectResolve({attacker, defender, move, moveType, isContact}) -> {damageMult}
    // T9j.17 (Refs #101) -- Champions Piercing Drill: 25% miss chance on every move.
    // Cite: https://github.com/smogon/pokemon-showdown/blob/master/data/abilities.ts
    // Cite: https://github.com/smogon/pokemon-showdown/blob/master/data/abilities.ts
    // Cite: https://github.com/smogon/pokemon-showdown/blob/master/data/abilities.ts
    // Cite: https://github.com/smogon/pokemon-showdown/blob/master/data/abilities.ts
    // Cite: https://github.com/smogon/pokemon-showdown/blob/master/data/abilities.ts
    // Cite: https://github.com/smogon/pokemon-showdown/blob/master/data/abilities.ts
    // Cite: https://github.com/smogon/pokemon-showdown/blob/master/data/abilities.ts
    // Cite: https://github.com/smogon/pokemon-showdown/blob/master/data/abilities.ts
    // Cite: https://github.com/smogon/pokemon-showdown/blob/master/data/abilities.ts
    // Cite: https://github.com/smogon/pokemon-showdown/blob/master/data/abilities.ts
    // Cite: https://github.com/smogon/pokemon-showdown/blob/master/data/abilities.ts
    // Cite: https://github.com/smogon/pokemon-showdown/blob/master/data/abilities.ts
    // Cite: https://github.com/smogon/pokemon-showdown/blob/master/data/abilities.ts
```

Historical comments preserved for bundle budget:

```js
// Generate a random seed array (for external callers who don't supply one)
  // Same National Dex # (and regional forms share dex #s) not allowed twice.
  // #T2: Item Clause is also a hard ban ("no two Pokemon may hold the same item").
  // runs if legality.js has been loaded and team is declared Champions format.
// HIGH_CRIT_MOVES: moves that START at stage 1 instead of 0. Narrow Champions list.
// ALWAYS_CRIT_MOVES: +3 stage floor (always crit). Frost Breath / Storm Throw.
//   - Screens (Reflect/Light Screen/Aurora Veil) bypassed — screenMod = 1.
//   - Burn STILL halves physical Atk on crit (Gen 6+ rule — verified Bulbapedia).
// FLINCH_MOVES: secondary-effect flinch chances. Data-driven per Bulbapedia
//     Cite: https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Champions
//   Zen Headbutt: 20%. Fire/Ice/Thunder Fang: 10% flinch (+10% independent status).
//   Dark Pulse / Twister / Icicle Crash / Waterfall: secondary flinch retained.
//   Cite: https://game8.co/games/Pokemon-Champions/archives/590527 (move list)
  // Gen 9 +1 stage list. Champions retains standard list per Game8 move pages.
// Unseen Fist, and future contact-triggered hooks (Rough Skin, Iron Barbs).
// Conservative: every physical contact move present in the engine's move set.
// Runtime data owns the canonical target bridge. This fallback keeps older
// engine-only VM tests working; runtime_data_bridge_tests.js guards drift.
// Pinned Champions diagnostic context: source-owned healing with reflected roles.
  // Reflection is an onTryHit effect: it precedes Substitute and accuracy.
  // Pinned Showdown type-changing ability exclusions; these moves own their type.
  // Isolated engine tests do not always load the generated Showdown mirror.
  // Use Champions' common 20-PP baseline there; production/import legality
// Each entry declares the hooks an ability participates in. Handlers return
// a mutation object (or undefined for no-op). The engine calls the relevant
//   onModifyMove({move, attacker, field}) -> {move?, bpMult?, typeOverride?}
//     Fires at the top of calcDamage so type/STAB/type-chart all see the change.
//   onBasePower({move, moveType, basePower, attacker, defender, field}) -> {bpMod}
//     Fires after dynamic BP resolution and before terrain/helping-hand BP mods.
//   onSourceModifyAtk({move, moveType, attacker, defender, field}) -> {statMod}
//     Fires from the defender before base damage is computed. statMod uses
//     Fires during final-mod construction. finalMod uses Showdown's 4096 scale.
//   onTryHit({move, moveType, attacker, defender, field}) -> {immune, healFraction}
//     Fires before damage calculation in battle execution and as a zero-damage
//     Fires when a target's Protect flag is up; default is 0 (full block). A
//     positive damageMult lets the attacker deal dmg * mult through Protect.
//   onDamageTaken({attacker, defender, move, moveType, damage, field, log})
//     Fires AFTER applyDamage writes HP, iff damage > 0 AND defender still alive.
//     Fires inside calcDamage's weather branch. Mega Sol provides personal sun
    // Normal moves become Dragon-type and gain 20% BP. Mirrors -ate ability
    // family (Pixilate/Aerilate/Refrigerate) with Dragon as the target type.
    // Cite: https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Champions
    // The previous T9j.8 implementation (25% Protect bypass on contact) was
    // accuracy check; this entry is intentionally hookless (no onProtectResolve)
    // Cite: https://bulbapedia.bulbagarden.net/wiki/Piercing_Drill_(Ability)
    // Champions: 25% damage through Protect on contact moves (nerfed from 100%).
    // Cite: https://www.serebii.net/pokemonchampions/updatedabilities.shtml
    // Cite: https://bulbapedia.bulbagarden.net/wiki/Mega_Launcher_(Ability)
    // Showdown: onSwitchOut heals baseMaxhp / 3; Pokemon.heal truncates the
    // 100% burn attacker when holder takes any damage (except Fire attackers,
    // Moves with eligible secondary effects gain 30% power and those effects
    // are suppressed after damage. Uses the current engine's secondary-effect
    // Incoming Fire/Ice moves use half the attacker's relevant attacking stat.
    // Ground immunity for grounded non-Thousand Arrows attacks. Flying-type
    // Ballistic move immunity. Uses Showdown's bullet flag where available and
    // Ground moves targeting another Pokemon are absorbed; holder heals 1/4 max HP.
    // Cite: https://github.com/smogon/pokemon-showdown/blob/master/data/abilities.ts
    // Defense rises by one stage after taking a damaging hit and surviving.
    // Cite: https://github.com/smogon/pokemon-showdown/blob/master/data/abilities.ts
  // Inline in applyDamage: raises Special Attack once damage crosses half HP.
  // Inline in calcDamage/applyDamage: ignores modeled target defensive hooks,
  // defender Unaware, Sturdy, Levitate/Earth Eater immunity, and reductions.
  // Inline in calcDamage/applyEntryAbility: Normal/Fighting hit Ghosts and
  // Inline in calcDamage/status/applyDamage: bypasses screens and Substitute.
  // Inline in status/stat-drop gates: allied Grass-types avoid drops/status.
  // Inline in accuracy/stat/type gates: ignores evasion, blocks accuracy drops,
  // Inline in applyDamage: attacker loses HP equal to the holder's pre-hit HP
  // Inline in executeAction: once per switch-in type change to the used move.
  // Inline in multi-hit execution: supported multi-hit moves hit max count.
  // Inline in applyEntryAbility: copy the first eligible opposing ability.
  // Inline at end of turn: 30% chance to cure an adjacent ally's major status.
  // Inline in executeAction/setStanceForm: Aegislash swaps between Shield and Blade.
  // Inline in calcDamage: low-HP Fire moves get a 1.5x attacking-stat boost.
  // Inline in calcDamage: low-HP Grass moves get a 1.5x attacking-stat boost.
  // Inline in applyDamage: survive lethal direct damage from full HP at 1 HP.
  // Inline in calcDamage: ignore opposing offensive/defensive stat stages.
    // weather multiplier, but does NOT set field weather. Water 0.5x penalty
    // and Fire 1.5x bonus apply only for the holder's own move resolution.
  // Parental Bond handled inline in executeMove (2-strike loop with BP override)
// One-shot consumable items that boost the holder by +1 to a defensive stat
// when present in matching terrain at switch-in. Standard mainline behavior
// Entry handles existing terrain; terrain-setting abilities dispatch to all
// living active holders. Item availability remains separately review-gated.
//   Cite: https://bulbapedia.bulbagarden.net/wiki/Grassy_Seed (mechanics box)
// T9j.8 — Ability hook dispatcher. Safe call: returns null when no ability or
    // Validated imports may contain numeric strings; never concatenate SPs
    // into stats or mutate the registered spread while constructing a battle.
    // Champions SP caps: 32 per stat, 66 total. Preserve the format mismatch
    // guard so an SV-scale spread cannot enter the Champions stat formula.
    // Reference admission and construction share canonical form/stone resolution.
      // Legacy active-Mega sets need a base fallback; an explicit base ability
    // Source order: generated Showdown species rows first; local tables only
    // backfill unknown/custom/partial rows and Champions-specific overrides.
    // Use POKEMON_TYPES_DB for more accurate type coverage on imported Pokémon
    // toxicCounter: N in the N/16 Bad Poison formula. Starts at 1 on inflict,
    // frozenTurns: turns spent frozen. Champions: 25% thaw per move attempt;
    // sleepTurns: turns-asleep counter for 33% turn-2 wake and 3-turn cap.
    // Cite: Bulbapedia Freeze (Pokemon Champions section); Bulbapedia Status.
    // T9j.17 (Refs #101) -- Fake Out hard-gate flag. Initialized false so first
    // turn out is the only legal use. Reset on every switch-in (replaceOnField).
```
