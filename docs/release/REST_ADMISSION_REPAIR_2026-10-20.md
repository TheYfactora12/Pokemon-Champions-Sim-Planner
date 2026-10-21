# Rest admission repair

Candidate v2.2.232-rest-admission / engine1.1.33 follows Struggle checkpoint91c820655bfd36fd38c551ee8a947c5b85f3600c. No merge/deployment or live changes.

Rest now rejects grounded Electric/Misty Terrain and effective active ally Sweet Veil before healing or changing status. Grounding observes Flying, effective Levitate/Eelevate, active Air Balloon/Iron Ball, groundedByMove and Gravity. Gas, Ability Shield, Klutz and consumed items are evaluated explicitly. Failure spends Rest PP, retains missing HP and records move failure; the next Stomping Tantrum receives the failed-action state.

## Proof

Source: immutable upstream9b136a8c8cdb860a8ab96fa063f906604e352547, data/moves.ts Rest onHit calls setStatus before heal; field terrain and ability status events reject sleep. This is shared-reference behavior captured2026-10-20, not current-client or M-C roster certification. Misty/abilities/items include synthetic combinations.

The original independent report RETEST_2769879.md reproduced terrain/ally discrepancies on both sides; original evidence remains unchanged in the auditor workspace. Initial44 admission probes failed24 local cases with20 healthy controls before repair. The extended suite now has114 cases, all passing installed and exact independently compiled current upstream. Independent read-only reviewer reran114/114 and found no blocker within scope. New admission cases exercise both sides and both active slots; Gravity is an explicitly initialized field fixture, not proof of ordinary-mode Gravity move execution. Follow-on tests compare actual maximum-roll Stomping Tantrum damage to independent executed reference.

A test-process mutant removes the new admission guard. Two selected healthy reference cases pass; the mutant fails their status/no-heal assertions. This control is part of the existing methodology and battle gates. No expected goldens regenerated or installed source pin replaced.

## Limits and candidate identity

Roost/Tera grounding, switching, cure into subsequent sleep, generic sleep distribution and wider ability/lifecycle combinations remain unproved. Red Card/White Herb remain assigned to a separate isolated task. Encore and discrete damage repairs remain open. Competitive release stays NO-GO.

Bundle11533002bytes; SHA256f97465137f8968415b6a7414e823950dfedfcc5c5d7a78817c93e028a68547a2. Historical comments moved verbatim to ENGINE_INTERFACE_NOTES.md to preserve the unchanged11MiB limit. Local battle audit and methodology passed; browser passed2 captures/3 pairs/19 paired turns with zero mismatch/page errors, actual response identity bound (browser-replay-CDIYx0). Full local project gate passed249 fast and12 offline database suites; zero failures,4 manual/helper skips. No liveDB tests. No standalone lint/TypeScript scripts; project syntax/generated checks apply.
