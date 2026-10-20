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
