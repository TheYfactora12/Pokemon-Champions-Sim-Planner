# Focused independent retest: 146ba91

Exact target: `146ba91093ad9c0c3c3b7e675850e2e0f5f57475`, isolated detached `retest-146ba91`. No active implementation checkout changes. Prior artifacts remain preserved.

## Verdict

Both requested survivor groups are **resolved for the preserved counterexamples**. The Sirfetch'd correction and current M-C reference inventory claims reproduce. This is not approval of complete official legality, current-client accuracy, every move combination, or competitive release.

### Unburden causality and order — scoped resolution

`poke-sim/tools/validate-turn-logs.mjs:503` now checks the latest causal action and holder-specific consumption interval. Exact original seed `[8885,16085,22955,39595]`, teams, two orientations and mutations were rerun without changing expected answers:

- Both unedited traces produce zero findings.
- Replacing Moonblast with unrelated Protect in the proof produces `observed-action-order-mismatch`.
- Moving Drifblim/Amnesia before the real Moonblast trigger also produces that error, identifying Moonblast as the expected earlier action.
- Removing the proof still produces the ordering error.

Mutation anchors are asserted; these are owning-validator failures, not module or harness failures. Full original/mutated traces: `focused-retest-evidence/noncausal-item-proof.json`. Reproduce: `node focused-proof.mjs`.

The checker remains a consistency checker over supplied trace fields, not authentication of a fully fabricated recording. This retest does not establish general causal correctness across every item or effect phase.

### Six provenance controls — scoped resolution

`poke-sim/tools/move-register.mjs:8–46` now rejects all six preserved mutations with specific errors:

| Mutation | Observed rejection |
|---|---|
| False move source SHA | move source provenance mismatch |
| False move source revision | move source provenance mismatch |
| Pair points to wrong evidence kind | pair evidence kind mismatch |
| Invented inheritance plus false pair hash | pair source lineage mismatch |
| Duplicate evidence identity | duplicate evidence identity |
| Remove all species gaps | species gap inventory mismatch |

Healthy builder output validates before mutation. These controls exercise generated-data validation, not authentication of upstream source claims. The v2 contract is explicit; historical mode does not attest v2. Reproduce: `node focused-register.mjs`; evidence `focused-retest-evidence/register-extra.json`.

## M-C export, runtime and complete-team checks

Candidate `d02c935ef45bc6f9a70bfbdb8d98d6e62c8a741328783b8dcb5ca30a8f80b59d` was independently checked against the clean locally compiled Showdown source `9b136a8c8cdb860a8ab96fa063f906604e352547`.

Verified candidate content identity, all compiled JS fingerprints, current generator hashes, exported JSON-table equality, unique IDs and exact independent ID sets:

- 392 species/forms
- 537 reachable moves
- 166 items
- 225 abilities
- 23,756 species/move pairs

Species ability lists, required-item fields and battle-only flags match the loaded reference. Every table preserves unresolved official eligibility, unknown client/implementation status and empty assertion IDs. Actual executable mod and format mod are both `champions`. Receipt: `focused-retest-evidence/candidate-check.json`; script `focused-candidate.mjs`.

The **runtime is not a wholesale 9b136a8 installation**. The actual loaded `MC_REVIEW_REFERENCE` retains base pin `efe4948570d5e8189751792136d26e71710c6c66` plus the documented 9b136a8 one-pair source delta. Independent comparison nevertheless finds zero missing/extra runtime species, items or pairs against 9b136a8. Sirfetch'd/Meteor Assault now passes. The five supplied pair-delta tests also verify the retained base artifact and source receipt binding.

The six saved candidate full-team controls were executed again against both upstream and app runtime: healthy and Sirfetch'd/Meteor Assault accept; Choice Band, wrong-species move, duplicate species and five moves reject. `focused-retest-evidence/saved-team-controls.json` retains actual results.

An additional **312 complete-team probes** included 20 targeted cases and one deterministic four-move combination for each of 292 available non-battle-only species with sufficient moves. Targeted cases cover wrong ability, duplicate moves/items/species, no moves, five moves, cross-species inheritance, known removed moves, Mega stone/form/ability dependencies and IV constraints. These do not enumerate all legal combinations. Gender inputs accepted/normalized by the upstream are not counted as successful rejection controls.

306 probes agree on admission. The remaining six are upstream-accepted teams that runtime deliberately rejects because **Fly is unsupported**: Drampa, Flapple and four Squawkabilly forms. This is conservative implementation containment, not a learnset inventory mismatch. It demonstrates why zero inventory differences must not be described as full playable legal coverage. Full teams and reasons: `focused-retest-evidence/combinations.json`.

The broad historical move register intentionally still has 636 missing / 205 extra pairs for current-reference species. That is a different population from the new M-C candidate; it is not a failed current-candidate inventory check. Neither comparison supplies a complete official eligibility package.

## Discrete damage — bounded verification

Supplied three tests pass against independently loaded current upstream: sampler plus Snorlax Tackle/Venusaur damage vector in Champions custom and M-C formats. Vector: `[30,30,30,31,31,31,31,33,33,33,33,34,34,34,34,36]`.

An independent 4,096-point deterministic sampler grid matches executable upstream `randomizer(100)` after explicitly mapping bucket index orientation. It produces exactly 16 values, 85–100 inclusive, with 256 grid points each. All 45 below/at/above internal-boundary checks pass. Counterfactual 15-bucket and continuous functions disagree at 2,048 and 4,096 points respectively. This tests the sampler and a bounded damage vector, not PRNG sequence alignment or an observed client distribution. Evidence: `focused-retest-evidence/buckets.json`; script `focused-buckets.mjs`.

## Execution and acceptance limits

36 supplied focused tests pass across register, item-speed evidence, candidate contract and pair-delta suites, plus the three discrete-reference tests. Counts are scoped executions, not accuracy percentages; they overlap independent controls and must not be summed into a unique-coverage metric.

No new material defect was reproduced in the two requested survivor groups. Keep Fly/other unsupported mechanics distinct from legal availability. Any checked-off sheet claim should resolve to its bounded executed assertion and source/runtime/engine identities; none of this upgrades a whole move to current-client verified.

No hosted CI, live browser, full project suite, DB, production or deployment validation was performed. Broader prior mechanics/foundation findings remain outside this retest. Official completeness and client proof remain unresolved. Highest-value next step: source-backed client capture for a bounded interaction, while retaining explicit implementation gaps and competitive NO-GO.

The initial sandbox fetch failed before connecting; approved fetch succeeded. An incomplete dependency install was stopped and the approved locked installation completed. Early controls attempted before installation failed to load modules and were rerun successfully after installation; those harness failures are not mutation detections. No action remains pending or uncertain.

No repository behavior/policy change was made by this audit; no improvement record was created. Deliverables are this report, isolated scripts, raw evidence and `focused-receipt.json`.
