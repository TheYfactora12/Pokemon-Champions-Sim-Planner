# Read-only critical-path assessment

Frozen candidate: 430368455dd52d6393cc1c3330613c0a2209ecc1.
No runtime, golden, admission or settings change was made for this assessment.

## First: charge-start SpA timing

The retained 16 partial shared-charge cases already expose a repeat-charge stage gap.
A new read-only one-turn probe reproduces the earlier boundary on both sides and
both slots: Meteor Beam and Electro Shot each leave local SpA at0, while the
pinned Champions reference reaches+1 (8/8 probes). Raw results and execution time:
`charge-start-assessment-4303684.json` beside this document.

Local engine.js4679-4711 returns from the charge-start branch before the stage
boost at6206-6210. Pinned upstream9b136a8 data/moves.ts4642-4657 and11750-11760
boosts on initial preparation and returns early when removing the prior charge
volatile. This is reference evidence, not current-client proof.

Smallest next repair: give the boost to initial preparation, once per use, including
Herb/weather skips, and prevent an additional boost on release. Preserve the
nonmutating direct-damage preview contract. Test full turn-by-turn stages, HP,
PP and charge state for normal, Herb, rain, interruptions, Protect/miss, caps and
effective Simple/Contrary suppression. Add delayed-boost, missing-boost and
double-boost reversal controls. Do not generalize this change to all charge moves.

## Second: Eject Button dependency

The four retained Fly discrepancies depend on an unsupported item. Implement its
post-hit consumption and replacement lifecycle separately before reopening Fly
admission. Pinned Champions items.ts262-276 requires a live target, a different
source, a non-status/non-future move, a valid bench, no conflicting forced/callback
state, and successful item use. The surrounding hit-event semantics also matter.

Required probes: no bench, faint, immunity/Protect/substitute, item suppression,
multiple hits/targets, pivot move plus item switching, action causality, replacement
ordering and charge-state cleanup. Preserve Champions-specific pivot behavior;
do not infer client queue semantics from the reference alone.

## Third: paired format coverage

Use the historical COVERAGE_MAP_433AAF4.md as a gap inventory, not current pass
evidence. Start with full16-bucket exact HP outcomes for one versus two eligible
targets in singles/doubles, then immune/protected/airborne/fainted targets,
grounded versus immune allies, guards/redirection and replacement ordering.
Assert target eligibility and ordered events; damage signs or log mentions are
insufficient. Add modifier, target-count, ally-eligibility and ordering mutants.

Current catalog sizes do not establish a fully validated denominator. Official
eligibility and current-client proof remain separate blockers. Permanent coverage
teams remain last, after fixes, gates and dated tracker reconciliation.
