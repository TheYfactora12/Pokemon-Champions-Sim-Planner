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
