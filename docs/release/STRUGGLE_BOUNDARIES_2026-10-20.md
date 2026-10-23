# Struggle boundaries and evidence workflow follow-up

Candidate v2.2.239-struggle-evidence / engine1.1.40. Competitive release remains NO-GO.

The preserved91c8206 audit identified Imprison availability, deterministic targeting,
special protection, Disguise and ability suppression gaps beyond the original96
zero-PP damage/recoil executions. This repair includes Imprison in availability,
chooses a live opposing Struggle target through RNG, routes the hit through shared
shield handling and respects effective ability/item boundaries in the audited cases.
Disguise state is shared with ordinary per-target attacks; immunity, missed hits,
Protect and Substitute must not consume it. The reviewer caught premature Disguise
activation during development; the final gate follows successful damage computation.

Independent review ran175focused tests against pinned upstream
9b136a8c8cdb860a8ab96fa063f906604e352547 and38preserved original boundary probes with
zero mismatches. The original96numerical expectations are unchanged; target isolation
is explicit on both engines where the case tests damage rather than random targeting.
New target tests inspect the executed action on both sides/slots. Five mutants reverse
availability, shield routing, Disguise, random targeting and suppression; all fail their
owning assertions while healthy controls pass. Counts are executions, not independent
mechanics or an accuracy percentage. Synthetic ability/species combinations are unit
probes, not legal-team evidence. Broader Disguise paths remain unproved.

The aggregate also exposed a legacy late-Fake-Out path that invented fixed target
HP damage and floor recoil. Injected late execution now spends PP and fails without
an extra attack; Champions request-time disabling and legitimate Struggle fallback
remain distinct. Spent Fake Out under Encore or effective Choice Scarf lock falls back
to actual Struggle; fresh, consumed-Scarf and Klutz controls retain their proper choices.
The old source-pattern assertions were replaced with two-turn
behavior controls. The independent reference ran six both-side request/execution
probes; the48-check legacy suite now tests the corrected bounded contract.

## Historical golden containment

The old three-module loader remains explicitly historical. A separate ordered,
byte-bound nine-module custom-practice profile loads runtime data, weights and move
overrides. Omitted/reordered modules, changed bytes and historical-as-current claims
reject. Historical fixtures remain unchanged and regeneration is disabled. All three
current traces differ from the old expectations; winners still agree. First differences
and full traces are retained, with current expectations marked not_approved and
review_required. Passing loader integrity does not approve current golden outcomes.

## Artifact size

The11MiBlimit is unchanged. Build-time CSS comment bodies compact to empty comments,
preserving separators, compound selectors, quoted markers, escapes and URL tokens.
Eleven scanner cases and the reviewer's two original counterexamples pass. Chromium
parses the original and compacted stylesheet into identical1295rules. Source CSS stays
readable. Final bundle identity is recorded in generated/release_artifact.json and the validation receipt.

## Remaining gates

The bounded tracker retains historical independently corroborated assertions and marks
them stale when implementation dependencies change. A historical damage vector never
checks off all of Tackle. Fly remains explicitly unsupported; see the separate gap
assessment. Official M-C completeness, current-client proof, broader mechanics,
production-service evidence and release approval remain unresolved. No merge,
deployment, live database, ruleset or key enrollment is included.

Aggregate and exact-head hosted validation are recorded separately after completion.

## Canonical receipt exports

Broad inventory snapshot:ef545aec4304868a8688ef212dd2d63eec7cbaa4551a229d8e1e07fe19532ed8,
with a semantic review queue against the prior independently retested a5c7650 snapshot.
Bounded assertion snapshot:ec56bbebc4c9ed7323208d395d1984ecbaf63fd0c4af51a066249fa82ef7a65d.
Both live under poke-sim/reports/move-register/ (bounded/ for the assertion table).
One historical146ba91 assertion passes its declared scope; current status is stale.
No whole-move, official-regulation or current-client approval is inferred.
The M-C species/forms/items candidate remains d02c935; its small source/compiled
manifest is reports/focused-independent-146ba91/mc-candidate-evidence.json.

## Final local validation

Project gate: 265 fast files and 12 offline DB files passed; four manual helpers skipped. Battle audit passed with 4,500 stress battles and three unchanged historical goldens. Invariants: 9,248 cases, zero failures. Expanded methodology: 26 reversal controls passed. Browser capture KSLQRH: two games, three comparison pairs, 20 turns, zero mismatches or page errors. Syntax checks passed for 25 changed/new JavaScript files; both canonical export checks and diff checks passed. Exact commands, initial resolved failures and scoped receipts are retained in reports/struggle-boundaries-2026-10-20. Hosted validation is separate.

## Hosted change-detection repair

Run 39479571527 at 443bd765744e06222685a532e7ea3e288c80ec96 failed change detection because GitHub's PR-diff API reported that the diff took too long to generate. Browser and syntax jobs passed; full project and battle jobs were skipped, not passes. The same path-filter action now uses its supported empty-token local Git comparison of the event base SHA and checked-out PR merge. Filters and failure handling remain unchanged. The focused host test passed 29 workflow assertions and 11 injection fixtures. No security settings or permissions changed.

The next hosted run exposed an omitted independent/discrete.log: the local evidence existed but the general log-ignore rule excluded it from Git. The bounded checker failed closed. The exact retained file is now included, with a narrow ignore exception for bounded evidence logs; no receipt hashes, expected values or runtime behavior changed.
