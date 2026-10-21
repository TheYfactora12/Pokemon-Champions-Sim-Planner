# Independent Eviolite ordering retest

Bundle tip `c9d071da34821ca559daf8dfb5d1800026589acc`; merge-base with requested source is exactly `5c93802893a15bb9716f9143fe20f2cfc5a7c345`. Detached isolated checkout `retest-c9d071d` is clean. Audit date 2026-10-21 UTC. No active checkout changes or publication actions.

## Scoped verdict

Defensive stage/modifier ordering passes this retest. Original Snover with Eviolite, Defense95/stage−1, Weezing U-turn, both orientations: **44–52 in snow and 64–76 clear**, matching pinned reference. Replacing candidate engine with the exact base reproduces **42–50 snow and 62–74 clear**. Original vectors and before/after results are retained.

Focused command passes **226/226** against upstream `9b136a8c8cdb860a8ab96fa063f906604e352547`, not the historical npm fallback. Denominator: **221 frozen 16-roll vectors + four mutation tests + one invalid-oracle test**. These are not 226 independent mechanic families, nor 238 tests. The reference guard successfully checks HEAD, six source hashes and the 525-file compiled aggregate `58da20a619f4eae3c0b5766867ef3d4ee6ec0efae52f0366e4ff47ce20829827`.

**48 additional independent inputs agree:** 32 vectors spanning both sides, stats64/65/96/98, stages−3/+1, physical Defense in snow and special SpD on Rock typing in sand; 16 vectors spanning both sides, Cloud Nine/Air Lock, Gas on/off and active/no Ability Shield. Each compares all16 numerical rolls; finite-vector guards remain active.

## Concrete surviving defects (high mechanics impact, outside ordering closure)

All four boundaries reproduce on both sides in synthetic custom games:

| Boundary | Setup | Reference | Candidate |
|---|---|---|---|
| Ineligible holder | U-turn into fully evolved Abomasnow holding Eviolite, clear | 62–74 | 42–50 |
| Item suppression | U-turn into Snover with Klutz and Eviolite, clear | 62–74 | 42–50 |
| Consumed item | U-turn into Snover, reference item removed; candidate Eviolite marked consumed | 62–74 | 42–50 |
| Offensive misuse | Snover holding Eviolite uses Body Press into Snorlax, clear | 44–54 | 68–80 |

`poke-sim/engine.js:2371` selects its Eviolite lane solely by defensive stat name and item string. It does not check holder evolution eligibility, effective item/ability or consumption. Body Press reads the same getter offensively. These are eight observed case failures, four boundary classes; not eight independent underlying bugs. Eligibility and custom ability assignments are diagnostic, not legal-team claims. The reference marks Eviolite `Past` in Champions; this repair does not authorize M-C admission.

## Test-method review

Stage truncation precedes weather/item operations; sand intermediate truncation precedes the fixed-point item modifier. The four mutations detect the old fractional-stage path, nearest-stage rounding, combined sand/item rounding and omitted item. Both mutation source anchors occur exactly once in the tested engine. The combined-modifier control checks **effective SpD145 versus erroneous146**, because their damage vectors alone coincide; this is meaningful scalar coverage rather than a damage-pass claim.

Frozen expected vectors are checked against the separately compiled reference and candidate; they are not computed from candidate outputs. Shared synthetic setup and mapping remain common assumptions. Invalid stat/stage/format inputs and nonfinite/noninteger damage arrays reject. Historical npm agreement was not rerun and is not used as current-client proof.

The independent boundary adapter changes fixture construction only, with asserted unique replacement anchors: target ability, consumed state and attacker item are represented on both engines. It preserves full teams, inputs, logs and 16-roll vectors. No expected values were changed to obtain a pass.

## Integration limits

Accept only the bounded ordering repair. Keep eligibility, effective-item suppression, consumption and Body Press explicitly open with the numerical cases above. Test those repairs separately before claiming Eviolite complete. General modifier combinations, singles, legal availability and current-client behavior remain unverified. Existing release labels, stale runtime receipts and the reported validation-cycle failure require integration work; this review does not certify their gates, hosted CI or deployment. No full unchanged sweep was repeated.

Commands: `git bundle list-heads`, immutable bundle fetch and detached worktree creation; `npm ci --ignore-scripts --no-audit --no-fund`; with CHAMPIONS_REFERENCE_SIM pointing at retained pinned `dist/sim` and NODE_PATH at isolated dependencies, `node --test tests/eviolite_order_tests.mjs` and `node eviolite-c9d071d-independent.mjs`.

Evidence: `eviolite-c9d071d-tests.log`, `eviolite-c9d071d-independent.mjs`, `eviolite-c9d071d-independent.log`, `eviolite-c9d071d-evidence/independent.json`, and uniquely anchored `boundary-adapter.mjs`. Receipt binds exact identities and artifact hashes.
