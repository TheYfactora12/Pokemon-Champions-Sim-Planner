# Eviolite activation and Body Press follow-up

Base: `c9d071da34821ca559daf8dfb5d1800026589acc`, isolated `fix/eviolite-order` checkout. The existing ordering commits are prerequisites; this follow-up does not replace them. No shared checkout modification, push, merge, deployment, settings change or client claim.

## Supported repair

Eviolite now requires the exact registered species to be not fully evolved and the existing effective-item resolver to return Eviolite. This covers consumed items, Klutz and Klutz suppressed by Neutralizing Gas. A generated 530-ID set comes from the pinned Champions Dex, including exact form identity (Basculin-White-Striped differs from Basculin). Unknown identity fails closed. The generated set does not grant format eligibility.

Body Press requests stage-adjusted Defense in the offensive lane, bypassing defensive Eviolite and defensive weather modifiers. The defender still receives eligible defensive modifiers. Existing offensive ability modifiers remain downstream. The previous stage/modifier ordering repair remains intact.

Pinned Pokemon Showdown source: `9b136a8c8cdb860a8ab96fa063f906604e352547`:
- `data/items.ts:1880-1900`: Eviolite checks the registered species object's nfe and modifies Defense/SpD.
- `sim/pokemon.ts:582-618`: stage truncation before modifiers.
- `sim/battle-actions.ts:1756-1763`: Body Press reads Defense then uses offensive Atk modifier events.
- `data/mods/champions/items.ts:294-296`: Eviolite is Past.

The source guard binds exact HEAD, relevant source hashes and 525 compiled files (aggregate `58da20a619f4eae3c0b5766867ef3d4ee6ec0efae52f0366e4ff47ce20829827`). Historical npm0.11.11 is separately identified and hashed, not represented as current upstream. Its eligibility set lacks the current custom species scraptor; tests explicitly preserve that difference.

## Reproduction and anti-drift contract

The parent's preserved c9d071d receipt was read before repair. Fresh pre-repair capture found 110 mismatches in 190 damage vectors: ineligible/Klutz/consumed defensive holders and offensive Body Press. `before.json` and `fail-before.log` retain that evidence. `tests/fixtures/eviolite_activation_v1.json` freezes the exact setups and 16 expected rolls from the independent source. Two additional bilateral Unaware controls bring the contract to 192 cases; no original expected values were refreshed.

The 201-test suite comprises 192 frozen vectors, seven unique-anchor mutation controls, metadata/fail-closed checks and malformed-input rejection. Mutations catch loss of eligibility, consumed/Klutz suppression, incorrect raw Klutz under Gas, form collapse, offensive Eviolite and removal of defender Eviolite. Current upstream and historical reference each pass 201/201. Ordering remains 226/226. The generator and source-truth checks pass.

The probe now initializes `setActiveMove` before direct `getDamage`. An independent exploratory Unaware mismatch was retracted after this missing oracle context was identified. Correct-context bilateral probes agree at 62-74; no Unaware engine modification was made. This is a harness correction, not new client evidence.

## Independent review

Read-only battle_auditor reviewed engine SHA256 `3c13645cf1798fb28a0f1bc840a9ed9032c32add5fe16a5404ddcfcf6b6750f9`, independently ran 201/201, and checked additional Huge Power Body Press controls. No demonstrated scoped defect remained. Review explicitly retained the oracle-context correction and bundle budget failure.

## Limits and integration gates

These are synthetic Champions custom-game probes, not legal M-C teams or fresh client recordings. Magic Room, Embargo, transformation/species lifecycle, all ability/item combinations and complete battle lifecycle parity remain unverified. No new support for those is claimed. Unrelated no-item negative-stage sand rounding remains outside this bounded patch.

The generated bundle is 11,537,314 bytes, SHA256 `b8eb0a27815b13c587ac73216db221678a8ace1c18dfc2c710a0441f171c8dc9`: 2,978 bytes above the unchanged 11 MiB cap. This is a release/integration blocker; the limit was not weakened. Parent must coordinate bundle budgeting, release labels, generated inventories and exact integrated validation receipts. Historical evidence is preserved. No golden regeneration occurred.

Broader results are recorded in the adjacent immutable raw logs and final receipt. Publication remains held. Hosted CI, browser/client, deployment and live services were not exercised.

## Validation result details

`npm run test:battle-audit` passed: 4,500 seeded battles, zero JavaScript errors, three historical golden battles unchanged. Current-profile integrity checks do not approve new current-profile goldens. `npm run test:source-truth` and eligibility generator check passed. The initial full sweep found a missing coverage-derived move-register export; additive snapshot `63bb916585144e02a72bb59be8fa3ca9fcd397f1ab1c9c661e37fa5aa97d6a96` resolves it, verified 12/12. It carries zero regulation-approved/client-verified moves and does not promote source evidence.

Implementation commit: `e1ccfd0029aed2b2625f9abcd6d035f7911f4013`. Additive inventory commit: `9480d9a53ab22c940d8cf1d9d58324d352ff7bc6`. Full-suite raw output preserves the original missing-export failure; the focused rerun is the resolution evidence.

Full offline sweep completed (exit 1): 283 fast files, 12 mock DB files; five failing files. Move-register failure resolved by the 12/12 rerun above. Remaining failures: security_readiness_reporting_tests, db_m1_wiring_tests and db_m9_hardening_tests due to the unchanged bundle cap; validation_cycle_tests (17/19) due to missing bounded export/current lifecycle receipts, also present before this follow-up. Four manual/helper files skipped. Three administrative checks explicitly NOT VERIFIED (migration ledger and security/performance advisors). No live administrative readback was attempted. These gates need integrated-source remediation and exact receipt capture; they are not waived.

Evidence logs were captured while implementation bytes stayed fixed; documentation/inventory were finalized afterward. This is not a full clean-tip or hosted-CI pass. `artifact-identity.json` binds tested working bytes and normalized committed blobs to the implementation commit. `receipt.json` hashes every retained raw evidence file.

## Integrated runtime checkpoint

Runtime 2f3411e4b9f86cc22d44ea1abfd9004b029ca7ec integrates the reviewed source patch onto the ordering checkpoint. Engine1.1.48 / v2.2.248-eviolite-activation. The regenerated bundle is11,533,142bytes, SHA256bcb7a36d7317af58ef9517f54f9f6398eb702b1acca8690841ea6e9531d311e1, below the unchanged11MiB limit by1,194bytes. Eight historical full-line comment blocks were relocated verbatim to docs/ENGINE_HISTORICAL_NOTES.md; executable statements were compared unchanged. The generator metadata now correctly names exact species.nfe; the530-ID set is unchanged and does not grant regulation eligibility.

Integrated upstream focused checks passed201 activation and226 ordering assertions. Release identity12/12 and QA snapshot7/7 pass. Independent integration review verified executable engine equality to isolated58aaa34 apart from comments/version, then freshly reproduced six bounded v13 cases and rejected36 unsupported configurations at2026-10-21T09:14:16.267Z. No current-client or whole-item claim follows. Full aggregate, clean-checkout, browser and exact-head hosted activation validation remain pending.
