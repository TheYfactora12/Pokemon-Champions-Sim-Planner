# Ordinary zero-PP Struggle repair

Candidate v2.2.231-struggle, engine 1.1.32, based on immutable checkpoint 2769879d005f10102754d6fa539e5925bfe9a836. No merge or deployment.

Ordinary automatic Struggle now uses the physical 50-power damage pipeline with typeless damage and rounds quarter-max-HP recoil to the nearest integer. Previously it removed a fixed quarter of the target maximum HP and floored recoil. At 235 maximum HP and 59 current HP, the corrected recoil faints the user instead of leaving 1 HP.

## Independent evidence

Reference: immutable upstream Pokemon Showdown 9b136a8c8cdb860a8ab96fa063f906604e352547, Champions mod. Source: data/moves.ts Struggle and sim/battle-actions.ts recoil execution. This is pinned upstream behavior, not visually verified current-client evidence.

The new struggle_reference_tests.mjs executes 96 cases across both sides, both active slots, maximum HP residues 0–3, normal and Ghost targets, recoil knockout, Protect, Magic Guard and Rock Head. All 96 pass against installed reference and independently compiled current upstream. An independent read-only battle reviewer reran the current upstream suite and found no blocker within this scope.

Against immutable 2769879, the same suite fails 80 cases and passes 16 Protect controls. Three mutation controls reject fixed target-HP damage, floored recoil and Normal-typed Struggle; healthy controls pass. The initial concurrent fail-first run is not used as evidence; the immutable baseline rerun is retained separately.

## Explicit limits

Late Fake Out's synthetic fallback remains unchanged and unproved. Conversion ability interactions, burn/stat stages/critical hits, Substitute, contact retaliation, attacker knockout before recoil, special shields and random-target distribution remain unproved. Red Card and White Herb belong to a separate isolated implementation task. Encore, discrete random damage, replacement ordering and current-client evidence remain open.

## Candidate identity and validation

Bundle: 11,534,245 bytes (unchanged 11 MiB ceiling), SHA256 90f14020c2d63d8b8ec108a499a93492d4892d81ffd58be8e974d1ddf1acfffc. Local battle audit and methodology passed. Full local project gate passed:249 fast files and12 offline database files, zero failures;4 manual/helper files skipped. Actual-response browser repeat passed: 2 captures, 3 pairs, 29 paired turns, zero mismatches or page errors (browser-replay-2P6wdV). The first random swapped matchup produced zero eligible completed outcomes, correctly hid results, and timed out the audit (browser-replay-LrHdRh); retained failure artifacts disclose that the browser harness does not yet handle this valid rejection path. The repeat does not erase that limitation. No standalone lint or TypeScript scripts exist; project syntax and generated-artifact checks apply. No live database tests run.
