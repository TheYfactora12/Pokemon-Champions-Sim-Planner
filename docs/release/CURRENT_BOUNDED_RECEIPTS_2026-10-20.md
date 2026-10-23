# Current bounded reference receipts — 2026-10-20

Six exact assertions were captured at 2026-10-20T20:17:44.289Z and independently replayed/reviewed at 2026-10-20T20:18:29.634Z. Runtime source is fd3d00a9c8f1c7e6d0eb95019bea5a93ecb35bc9; this enrollment changes no runtime bytes.

| Stable case ID (version current-runtime.v2) | Bounded expected outcome |
| --- | --- |
| RESOURCE-STRUGGLE-CAPTURE | Snorlax with no Amnesia PP: Struggle deals 29 damage and 59 recoil; PP remains zero. |
| REST-ELECTRIC-CAPTURE | Grounded Snorlax under Electric Terrain: zero healing, no sleep, one Rest PP spent. |
| ENCORE-QUEUE-CAPTURE | Prankster Encore replaces queued Flamethrower with Will-O-Wisp: two Wisp PP spent across the setup and replacement, zero Flame PP, Wisp lock. |
| RED-CARD-CAPTURE | Seismic Toss deals 50 damage; Red Card is consumed and Machamp is replaced by the sole reserve Garchomp. |
| WHITE-HERB-CAPTURE | Synthetic initial attack -2, defense -1, special attack +3 becomes 0, 0, +3 and consumes White Herb. |
| DAMAGE-ROLL-CAPTURE | Sixteen explicit Tackle bucket draws produce [30,30,30,31,31,31,31,33,33,33,33,34,34,34,34,36]. |

These are custom doubles fixtures with exact serialized teams, inputs, actions and structured outputs. They are reference-backed bounded assertions, not whole-move verification, official M-C eligibility, client proof or PRNG sequence parity. All client statuses remain unknown and competitive use remains false. Fly and broader unresolved mechanics remain outside these claims. Competitive release remains NO-GO; existing goldens remain unapproved.

## Canonical deliverables

- Capture and raw outputs: `poke-sim/source/bounded-assertions/current-v2-7265136a1c5f/`.
- Review, independently executed raw results and script: `poke-sim/source/bounded-assertions/reviews/80148cce824693aaa0b1d6bbc5cd7ffc179812dc638dd0b73f56817dd0544668/`.
- Canonical index: `poke-sim/source/bounded-assertions/index.json`.
- Spreadsheet-friendly snapshot: `poke-sim/reports/move-register/bounded/399d76923b2eea9cf56becffa34ea89e12c5176277e64d3d04868a9ea866da0e/assertions.csv` and `assertions.json`.
- Counts: thirteen assertions; six current `passed_declared_scope`, seven historical `stale` (the six v1 captures plus the older legacy damage assertion). The old positive receipt and its missing-time limitation are preserved.
- Small M-C candidate manifest remains `poke-sim/reports/focused-independent-146ba91/mc-candidate-evidence.json`; it does not certify official completeness.

Reference attribution: smogon/pokemon-showdown commit `9b136a8c8cdb860a8ab96fa063f906604e352547`; exact archive source fingerprint `6ee47d5009706b808a9d079aab9b1a2fa0493edb98b4dd7feee189679d3951a8`, compiled fingerprint `de66162a28b270bdf17ea17a804a7ec65c6d2f286815ae17eaa3336273405f61`. The archive has no Git metadata; attribution is checked against its retained fingerprints, not reported as an executed Git HEAD.

## Invalidation and review

Current status binds 23 engine, data, rules, source-target, runner, fixture and checker files plus compiled reference identity. Each changed dependency invalidates the six current statuses. Documentation-only commits retain them. Reviewed assertion data is separately pinned by content; changed values require a new reviewed case/version. The enrollment command validates every independent per-case receipt and raw replay before updating canonical pointers. Review anchors record repository review decisions; they are not cryptographic proof of reviewer identity.

Generate with `node poke-sim/tools/generate-move-support-audit.mjs --register --bounded`; add `--check` to reject stale generated output. Do not regenerate expected outcomes or approve goldens from export generation.

## Preserved adapter counterexample and v2 repair

Independent audit of 6dd24ce reproduced all six v1 outcomes but found that changing the discrete target to slot one was ignored by both adapters. A direct upstream calculation yields maximum 31, not the slot-zero maximum 36. The fixed-scope adapter now rejects unsupported action, actor, side, target, method, bucket, RNG and other ignored configuration before loading either runtime. It does not claim general configuration support. White Herb's declared stage sensitivity remains executed.

The original v1 captures, timestamps and review remain unchanged. Changing the runner makes them stale; v2 receives genuinely new execution and independent review. Independent v2 review passed six cases, 25 exact-reference tests and 36 additional negative mapping controls. Raw failure-first and repaired logs plus the original auditor report are retained in `poke-sim/reports/current-bounded-input-repair-2026-10-20/`.

Prior head 6dd24ce completed hosted CI 39488540970 successfully, including Battle Audit at 20:18:06Z. That pass did not detect the later-reported adapter gap and is not substituted for v2 validation. Its PR merge checkout 36a832d1f3202dcd97c8d9ff837ce1342523ec57 has the same tree e31f66b25022a2d4b7cdead14b874f25046fe656 as 6dd24ce.

## Validation

- V2: 120/120 focused tests passed with the exact external reference enabled. The first run exposed a mutation-harness version-selection error (four tests rejected too early); selecting the intended review version restored the deeper assertions without weakening acceptance.

- Original v1 checkpoint: 79/79 focused tests passed, including six live exact-reference comparisons, 23 dependency-change controls, scope/provenance rejection and a real two-commit Git documentation fixture.
- Independent enrollment review: no concrete blocker; five additional coordinated replay-content mutations rejected. Its sandbox Git fixture could not initialize; the host execution above passed that fixture.
- Full project, clean-checkout and hosted results are recorded with the final immutable checkpoint; this document alone is not a hosted pass.
