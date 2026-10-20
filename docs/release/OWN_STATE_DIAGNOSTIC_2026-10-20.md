# Own-state diagnostic and overnight candidate - October 20, 2026

Local v2.2.220-own-state / engine 1.1.24 on `fix/own-state-diagnostic-policy`.
No publication. Current-main reconciliation ends at `1cffa63`; the separate
pivot repair is `7efc0c2`. Main base is `ae3f52c`. Original utility work at
`d9bc79a` is preserved. PR278 remains a separate draft and approval decision.

## Supported contract

Direct `simulateBattle` callers may explicitly pass
`decisionPolicy: 'own-state-diagnostic-v1'`. The default remains
`greedy-state-aware-v3`, with `full_registered_state` provenance.
The diagnostic prepares both sides before any choice and passes frozen,
detached primitives and move rows into a pure chooser. Opponent input is only
active target-slot occupancy. Choices return slots resolved by the engine later.
No opponent estimates, reveal history, damage calculator, live actor references
or RNG enter the chooser. Explicit forced actions remain separately labeled.
Unknown policies and a missing diagnostic module fail before simulation.
Aggregate diagnostic requests reject; there is no UI selector or batch support.

This is a first-candidate control with limited legality checks. Own PP, locks,
charge, sleep, Taunt and entry gates are represented. Throat Chop, Heal Block,
Imprison and Gravity are not fully represented; execution may reject a choice.
It is not a complete legality or human-visibility model and has no competitive
strength evidence. Snapshot category preparation is trusted static metadata.

## Hidden-information findings retained

Default Garchomp Earthquake/Dragon Claw selection changes when an opponent's
hidden ability changes to Levitate. Fake Out/Tackle selection changes for Armor
Tail. Damage scoring still reads hidden ability, item, defenses and HP; utility
scoring also uses live status, stages, types and side effects. Shared live state
and sequential queue construction remain in default policy. The earlier utility
fix removed four direct move-inventory predicates, not all these dependencies.
The opt-in diagnostic does not relabel or silently replace the default.

## Mechanics and scope limits

See [pivot report](PIVOT_TRAPPING_2026-10-20.md): 107 pinned-reference cases (including six added Spirit Shackle cases)
support the damaging-pivot trap cause, Water Absorb and scoped ability bypass.
Rocky Helmet contact damage remains a reproduced gap. Voluntary switching has
no action-queue/UI implementation; switch/Mega ordering, simultaneous switches,
ties/Trick Room and lifecycle callbacks need the capture packet in
[preparation report](SWITCHING_INFORMATION_PREPARATION_2026-10-18.md).
No guessed switching implementation, current-client certification or blanket
accuracy claim is made. AI Labs and unrelated projects were not changed.

## Validation

- Diagnostic: 8 groups, including 40 engine hidden-state mutation runs, plus
  awaited aggregate rejection. Both sides, throwing getters, no RNG, detached
  inputs, snapshot-before-choice, forced-action provenance and default stability.
- Independent policy review approved the bounded contract after narrowing the
  original misleading first-usable wording. Release review passed 12 release
  checks, the diagnostic suite, external assets and diff check.
- Browser: 3 games, 4 export/DOM pairs, 50 paired turns / 3,492 observable-field checks, zero mismatches and zero
  page errors. Practice/import and blocked Fly, MC baseline/swap and replay
  continuity; mobile layouts and offline helper availability. Evidence:
  `poke-sim/artifacts/browser-replay-7uyLLi`. Browser games use the default policy;
  diagnostic integration is established by native engine tests, not UI play.
- Accuracy: 2,312 doubles battles, 34 repeat checks, zero state failures,
  validator errors/warnings or repeat failures. Isolated singles shared-mechanics
  regression: 2,312 battles and 34 repeats, same zero failures; not doubles parity.
- Roadmap consistency, engine/helper syntax and external-asset verification pass.
- Initial project and battle audits failed on stale matrix counts and an old
  Spirit Shackle test expecting the now-disproved pivot block. Six new reference
  cases and the corrected secondary test pass; independent mechanics review
  approved. Full project rerun: 233 fast test files +12 offline DB files, zero failures;
  four manual/helper files skipped. Final battle audit passed its declared
  scope: 60 edge cases (18 covered, 37 partial, 5 open); partial/gap families
  remain unproved.
- No standalone lint/typecheck scripts exist; syntax checks are not type checks.
  Offline DB tests do not establish live service behavior.

Bundle: 11,533,629 bytes; SHA-256
`36eb78acb9a55798c895198cf1b6c872fe73e60e06eaa4b4086768fe92cc1ec7`.
The separate helper hash is recorded in generated/release_artifact.json and is
covered by required-asset verification, cache and Pages staging. Runtime files
were frozen before browser evidence. The inspected mobile screenshot retained
readable turn, HP, item and field information at 390px. No hosted CI, live database or deployed
verification is claimed for this unpublished candidate.

Logs retained locally at checkout root: `v220-project-gate.log` and
`v220-battle-gate.log` preserve the initial failures; `v220-project-final.log`,
`v220-battle-final.log`, `v220-accuracy-gate.log` and `v220-pivot-final.log`
record the final checks. Browser runner/log and draft PR description are in the
parent task directory. Three offline DB hardening assertions remain explicitly
not verified by that suite; no live-service claim is made.
