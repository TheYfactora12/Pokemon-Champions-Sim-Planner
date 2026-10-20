# Contained Fly repair — 2026-10-20

Candidate runtime v2.2.240-fly-contained / engine1.1.41. Fly remains explicitly
unsupported at team and forced-action admission. This is a development execution
repair, not permission to simulate Fly teams publicly or certify client behavior.

## Bounded evidence

[Exact receipt](../../poke-sim/reports/fly-repair-2026-10-20/reference.json)
contains inputs, commands, local actions, logs, compared fields, executed time,
loaded-source hashes and pinned source/compiled identities. Reference:
Showdown `9b136a8c8cdb860a8ab96fa063f906604e352547`, Champions doubles custom.
Synthetic species/move/ability combinations are diagnostic and do not prove M-C legality.

24 basic comparisons and168 lifecycle/damage comparisons agree. Four additional
Eject Button probes intentionally retain an unsupported-dependency disagreement;
they are not counted as passing parity. Eight direct accuracy controls and six
reversal mutants exercise No Guard suppression and the repaired paths.

The seven airborne exceptions, both sides/slots,16 Gust/Twister damage rolls,
Power Herb/Klutz/Gas/Shield boundaries, sleep/freeze/paralysis/flinch/confusion/
Imprison abort, grounding before/after action, Drampa grounding, next-turn PP,
Follow Me timing, original target slot, Helping Hand damage, and No Guard with
Soak/Strength Sap/Dragon Darts are bounded by the receipt's compared fields.
Interrupt cases compare charge/PP/target outcomes, not complete status timing.
Accuracy is forced successful in parity fixtures; separate eight direct controls
exercise effective No Guard with a failing accuracy draw.

Initial lifecycle run:132/148; twelve failures were mismatched repeated-Protect RNG,
four are the retained Eject Button gap. Aligning semantic randomness produced144/148.
Independent review then found Soak and Dragon Darts special-target handlers bypassed
the common eligibility rule. Their repaired cases are included. The receipt generator's
first batch exhausted memory by retaining VM objects; detached serialized results
fixed capture without changing outcomes or raising the memory limit.

Original assessment receipts are immutable. Its engine and capture adapter now live
alongside the original receipt so the historical14 counterexamples still reproduce.
Historical golden expectations and approvals remain unchanged.

## Readiness map

| Boundary | Implemented/tested | Reference/client status | Remaining blocker |
|---|---|---|---|
| Airborne hit and doubling | Contained implementation; exact cases and mutants | Pinned reference only; client unknown | Broader move/status combinations |
| Abort and grounding | Contained implementation; six interruptions and grounding continuity | Pinned reference only | Additional interruption/ability combinations |
| No Guard/Herb | Scoped effective ability/item handling | Named Gas/Shield controls only | Full suppression/item lifecycle inventory |
| Targeting | Follow Me timing, selected slot, special handlers | Synthetic doubles reference | Faint/replacement/ally target and Coaching |
| Forced switch/re-entry | Not verified | Eject Button reference consumes; local item unsupported | Implement/review item dependency, then switch cleanup |
| Public Fly | Rejected | No admission claim | All declared gates and independent review |
| Canonical tracker |13historical stale,0current | Prior outcomes preserved; new runtime invalidates | Fresh independent revalidation before enrollment |
| Competitive release | NO-GO | No current-client proof | Official eligibility, approved current goldens, broader readiness gates |

[Bounded export pointer](../../poke-sim/reports/move-register/bounded/latest.json)
and [move register pointer](../../poke-sim/reports/move-register/latest-candidate.json)
are canonical. No whole-move verification label is promoted by these probes.

## Reproduction

Run the four `fly_*_tests.mjs` repair/lifecycle/mutation/receipt suites and historical
`fly_assessment_tests.mjs`. Set CHAMPIONS_REFERENCE_SIM to the exact compiled
reference dist/sim for independent reference execution. Generate a new receipt with
`node tools/capture-fly-repair.mjs <pinned-source-directory> <new-receipt-path>`;
never overwrite historical evidence as a golden refresh.

Run project offline gate, battle audit, clean-checkout validation, then exact-head
hosted checks. Successful test infrastructure does not close the open admission gates.

Sources: pinned data/moves.ts Fly5897–5935; data/conditions.ts287–322;
sim/battle-actions.ts BeforeMove312–320 and Invulnerability683–692;
Gravity7784–7787 and Smack Down16967–16986 in data/moves.ts.
No merge, deployment, live database or repository settings change is included.

## Follow-up: corrected causal evidence and shared Power Herb helper

Candidate v2.2.241-charge-herb / engine1.1.42 changes only the shared Power Herb
eligibility helper to use effective item state. The five non-Fly suppressed-Klutz
failures were independently reproduced on both the old and contained-Fly engines;
they were pre-existing defects, not regressions introduced by Fly.

The original independent 433aaf4 audit found that v1's confusion fixture used the
wrong reference RNG denominator. Its apparent agreement did not prove interruption.
The original receipt and hash-bound sources are retained; v2 supersedes that bounded
claim. Eight corrected cases require actual reference self-hit events, 27/54 HP loss,
no Fly release, candidate action-denial events and stored-charge cancellation. The
old false-positive receipt and a confusion-cancellation reversal must fail.

The new receipt is [reference.json](../../poke-sim/reports/fly-repair-v2-2026-10-20/reference.json).
It contains 24 basic cases, 172 lifecycle/damage cases, four retained Eject Button
discrepancies and 80 shared-charge probes. Of those 80 probes, 64 have no observed
stage discrepancy; 16 agree only on the declared charge/PP/HP/damage/consumption
fields and explicitly retain a repeat-charge SpA gap for Meteor Beam/Electro Shot.
They are not 80 full-state agreements. Five helper reversal controls and suppression
restoration/consumption controls own this narrow repair. Public Fly remains blocked.

Prior hosted checkpoint 433aaf4 completed all checks at 2026-10-20T22:02:58Z in
[run39503065457](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/actions/runs/39503065457).
The tested merge tree matched the candidate tree. That result belongs to v240;
follow-up validation is recorded separately. No current-client proof is available.
