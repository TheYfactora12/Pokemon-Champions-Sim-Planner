# Independent Eviolite activation and Body Press retest

Exact tip `58aaa34e2047391b9874ac6e0702f3bfde42e852`; verified merge-base `c9d071da34821ca559daf8dfb5d1800026589acc`. Bundle SHA256 matches supplied `940772044948de2edbccf249ca91a76fa538d98f62fa663414cd89d09d24e7a7`. Clean isolated `retest-58aaa34`; 2026-10-21 UTC. No active-checkout, settings, publication or production changes.

## Scoped result

All eight preserved failures close numerically: both orientations of ineligible Abomasnow, Klutz Snover, consumed Eviolite and offensive Snover Body Press. The original independently adapted helper was reused with runtime import paths changed only. Candidate matches all16 reference rolls; prior engine reproduces all eight failures. Defensive cases now deal62–74; Body Press deals44–54.

Forty additional cases agree:16 regional-form/consumption cases (Corsola/Galar, Qwilfish/Hisui, both sides);16 Body Press cases with both holders carrying Eviolite, Defense97, attacker stages−3/+3, critical/noncritical and Pressure/Unaware targets in snow;8 special-defense Klutz/Gas/consumption cases, both sides. These are synthetic direct damage vectors, not full battles or legal teams.

Focused suites pass427/427 with no skips:201 activation checks (192 frozen vectors, seven mutation controls, metadata check and malformed-input check) plus226 ordering checks (221 vectors, four mutants and invalid-oracle test). The seven activation mutants assert unique anchors and detect eligibility removal, raw-item consumption/Klutz handling, raw Klutz under Gas, form collapse, offensive Eviolite and omission of the target's defensive Eviolite. Counts are nested bounded checks, not an accuracy percentage.

## Source and methodology

The source/runtime verifier accepts the independently retained upstream `9b136a8c8cdb860a8ab96fa063f906604e352547`, six raw-source hashes and525 compiled files with aggregate `58da20a619f4eae3c0b5766867ef3d4ee6ec0efae52f0366e4ff47ce20829827`. Historical npm fallback was not used for this verdict.

The engine's generated exact-species eligibility set comes from pinned Champions custom-game species `nfe`, then `_evioliteActive` uses the effective-item resolver. `getStat` has a separate offensive Defense path for Body Press; defensive target calls retain item handling. Regional variants are not collapsed to their base-species name. This reference inventory includes non-regulation/custom species and must not become a legal roster. Metadata's descriptive predicate mentions `baseSpecies.nfe`, while executable generation is `species.all().filter(s=>s.nfe)`; the exact-ID implementation and tests are the meaningful contract.

The new direct-damage helper sets reference active-move context before `getDamage`; this matters for Unaware. Our extra Unaware vectors use that correct context. Preserved original cases have neutral abilities and do not depend on that correction. Frozen expectations are independently checked against the pinned executable reference, not regenerated from candidate outputs. Shared mapper/setup assumptions remain; no client proof follows.

## Unresolved release gates and scope

Bundle measured11,537,314 bytes, **2,978 over the unchanged11MiB cap**. Source review/report identifies missing fresh bounded exports and lifecycle receipts. These integration requirements are not excused by mechanics passes; targeted gate output is retained separately. No hosted/full-suite/remote certification is made.

Magic Room, Embargo, transformation/species lifecycle, arbitrary ability/item interactions, actual item-consumption event timing, singles and current-client behavior remain unverified. Consumption probes compare an absent reference item with the candidate's consumed-state flag; they do not test the event that sets that flag. Eviolite remains Past in the pinned Champions source; no M-C admission is approved. No additional scoped mechanics defect was demonstrated in this retest.

Targeted gate retest exits1 with two validation-cycle failures, both caused by **Missing bounded export**; retained log distinguishes this failure from skipped execution or approval. The eligibility generator's read-only check passes with530 exact registered IDs. Bundle size was measured directly; no cap was altered.

## Reproduction

In isolated poke-sim, install locked dependencies with `npm ci --ignore-scripts --no-audit --no-fund`. Set CHAMPIONS_REFERENCE_SIM to the retained pinned dist/sim and NODE_PATH to isolated node_modules. Run `node --test tests/eviolite_activation_tests.mjs tests/eviolite_order_tests.mjs`, and read-only `node tools/build-eviolite-eligibility.mjs`. From the audit root run `node eviolite-58aaa34-independent.mjs` with the same environment. Targeted integration diagnostics use validation_cycle_tests.mjs and security_readiness_reporting_tests.js.

Artifacts: `eviolite-58aaa34-tests.log`, `eviolite-58aaa34-independent.mjs`, `eviolite-58aaa34-independent.log`, `eviolite-58aaa34-evidence/independent.json`, retained original-helper adapter, eligibility and gate logs. Exact identities, clean status and hashes are bound in `eviolite-58aaa34-receipt.json`.
