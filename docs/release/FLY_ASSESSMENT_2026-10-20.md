# Fly admission assessment — 2026-10-20

Production Fly remains explicitly unsupported. This checkpoint assesses a quarantined
in-memory prototype; it does not ship Fly or enroll a passing Fly behavior.
The runtime remains v2.2.239 / engine 1.1.40, unchanged from 9ea1ccb.

## Executed evidence

[Structured receipt](../../poke-sim/reports/fly-assessment-2026-10-20/receipt.json)
contains exact teams, actions, seed, controlled RNG, outputs, logs, source hashes
and the four diagnostic-only patches. The immutable reference is Showdown
`9b136a8c8cdb860a8ab96fa063f906604e352547`, with independently retained source and
compiled fingerprints. Scope is synthetic Champions doubles custom games, level50,
Aerodactyl slot0 on both sides. This does not establish legal M-C teams or client behavior.

Twenty-four executed comparisons yield 10 agreeing controls and 14 disagreements.
All seven airborne exceptions hit in the reference and are incorrectly rejected by
the minimal prototype on both sides: Gust, Twister, Sky Uppercut, Thunder, Hurricane,
Smack Down and Thousand Arrows. The last two also cancel reference charge state.
Basic charge/release, one PP expenditure, release into Protect, Power Herb and
unsuppressed Klutz controls agree. Accuracy is forced successful and secondary effects
are suppressed in these particular fixtures; accuracy probabilities are not validated.

The 29-test suite checks these bounded observations, both production rejection paths,
and two admission-removal negative controls. The disagreement checks intentionally
preserve the minimal-prototype counterexamples; a future implementation needs its own
production parity tests rather than rewriting this historical assessment as a pass.

## Architectural blockers and smallest next repair

The read-only battle auditor independently identified these shared dependencies:

| Dependency | Current status | Required next evidence |
|---|---|---|
| Airborne hit eligibility | Prototype fails seven exceptions | Fly-specific helper; single/spread, both slots; Gust/Twister doubling controls |
| Aborted release cleanup | Static gap: Fly absent from interruption cleanup; denial path bypasses cleanup | Sleep, freeze, paralysis, flinch, confusion, Imprison; next action and PP continuity |
| Grounding cancellation | Gravity foundation exists; Smack Down/Thousand Arrows incomplete | Cancel airborne state and queued release, including non-Flying species |
| Effective abilities/items | Raw No Guard and Klutz checks need scoped repair | Both participants, Neutralizing Gas, Ability Shield, consumed Power Herb |
| Original target slot | Charge stores resolved target after redirection | Follow Me on each turn, replacements, fainted targets, ally target |
| Switch lifecycle | Existing cleanup, not Fly-qualified | Forced switch, re-entry, no retained concealment |

Smallest next implementation slice: add Fly-specific airborne eligibility and abort
cleanup behind the existing rejection, then prove the lifecycle cases above. Only
admit Fly after the remaining targeting/item/cancellation gates and independent review.
Changing these shared paths now would require a broader charge-move regression pass;
removing containment ahead of that work is not a safe deadline shortcut.

## Readiness map

| Area | Implemented | Executed/reference evidence | Client evidence / release |
|---|---|---|---|
| Fly | No; rejected | 24 diagnostic comparisons; 14 known prototype failures | None; admission blocked |
| Six bounded existing behaviors | Yes, narrow assertions | 6 current passes, 7 historical stale at 9ea1ccb; runtime unchanged | Unknown; not whole-move certification |
| M-C catalog | Reference candidate inventory | 392 forms,537 moves,166 items,23756 pairs | Official completeness unresolved |
| Current-profile goldens | Loader checks present | Historical fixtures retained, current approval absent | Blocked |
| Competitive launch | Partial development lab | 9ea1ccb hosted checks passed | NO-GO; current-client proof, broader mechanics/policy and release gates remain |

## Reproduce

From `poke-sim`, set `NODE_PATH` to its existing `node_modules` directory, then run:

```text
node tools/assess-fly.mjs <pinned-upstream-directory> <new-receipt-path>
node tests/fly_assessment_tests.mjs
```

For an independent compiled reference test run, set `CHAMPIONS_REFERENCE_SIM` to
its absolute `dist/sim` directory. The assessment CLI verifies the pinned source
and compiled fingerprints; the test suite can also run against the installed reference.
Never overwrite the historical receipt to promote an implementation. Add a new
versioned capture and review its semantic differences. No golden, runtime evidence,
regulation promotion, deployment or repository setting is changed here.

## Source and independent review

Pinned [Fly definition](https://github.com/smogon/pokemon-showdown/blob/9b136a8c8cdb860a8ab96fa063f906604e352547/data/moves.ts#L5897),
[two-turn state](https://github.com/smogon/pokemon-showdown/blob/9b136a8c8cdb860a8ab96fa063f906604e352547/data/conditions.ts#L287), and
[Power Herb](https://github.com/smogon/pokemon-showdown/blob/9b136a8c8cdb860a8ab96fa063f906604e352547/data/items.ts#L4799)
are reference semantics, not observed current-client evidence.

The separate read-only battle auditor reran the same adapter against the exact
compiled reference and reproduced all 24 outcomes; four additional admission
probes rejected. This is independent execution and static review, not an independently
written mechanics oracle. The [original rerun receipt](../../poke-sim/reports/fly-assessment-2026-10-20/independent-original.json)
precedes the added all-source bindings and is preserved with its original hashes.
Status, forced-switch, No Guard and suppression paths remain unexecuted in this checkpoint.

## Local validation

[Validation receipt and retained outputs](../../poke-sim/reports/fly-assessment-2026-10-20/validation.json):
268 fast files executed; three sandbox-only failures resolved by authorized targeted
reruns (temporary Git metadata and Git Bash initialization). DB contract:12 files,
0 failures, no live database access. Focused:29/29 against installed and pinned
external references. Manifest contract and both JavaScript syntax checks passed.
Independent reviewer accepted the assessment after29/29 external-reference tests.
Hosted validation is recorded separately by exact commit; no pending run is a pass.
