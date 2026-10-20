# Independent Struggle retest

Immutable target: `91c820655bfd36fd38c551ee8a947c5b85f3600c` (PR279), v2.2.231-struggle / engine 1.1.32. Isolated detached worktree `retest-91c8206`. Earlier artifacts and four prior worktrees preserved.

**Verdict: ordinary zero-PP damage and recoil repair verified within the supplied scope; complete Struggle behavior remains partial.** The added probes reproduce availability, targeting and interaction failures. Strict readiness remains NO-GO. This report does not close Rest, Encore, damage-roll distribution, Red Card or White Herb.

## What the 96 cases prove

`poke-sim/tests/struggle_reference_tests.mjs:5` expands two sides × two active slots × four HP allocations × six conditions: normal, Ghost, recoil KO, Protect, Magic Guard, Rock Head. These are 96 executions, not 96 independent mechanics or an accuracy percentage. All use the same seed, maximum damage roll, no critical hits and exhausted PP on all moves. Synthetic Snorlax abilities are intentional unit probes, not legal-team evidence.

The test asserts independent numerical constants as well as executing Showdown: 29 ordinary damage, 37 in its Ghost fixture, zero through Protect, and recoil [59,59,59,60]. HP allocations 0–3 are not themselves max-HP residues: this Snorlax's maxima are 235–238. The ordinary calculation is physical base power 50 at level 50 with attack 130 and defense 103: floor(floor(22×50×130/103)/50)+2 = 29. Round(235/4) = 59, including the 59-HP knockout. Same adapter `mapTeam` is shared by test input preparation, so this does not independently certify its stat/normalization logic.

Independent execution reproduced:

| Run | Pass | Fail |
|---|---:|---:|
| Target head, unchanged supplied suite | 96 | 0 |
| Same suite pointed at immutable 2769879 | 16 | 80 |
| Fixed target-HP damage mutant | 16 | 80 |
| Floor-recoil mutant | 56 | 40 |
| Normal-type mutant | 16 | 80 |

Each mutant's unique source anchor applied and failures are the intended damage/recoil assertions, not missing imports or broken harnesses. For example fixed damage is 38 versus expected 29. No expected results were changed. The previous-head 16 healthy cases are Protect controls.

Reference actually executed here: locked `pokemon-showdown` 0.11.11, with identity/integrity/source hashes retained. The owner's separately compiled upstream `9b136a8...` run was **not independently repeated**. Installed primary source: `node_modules/pokemon-showdown/data/moves.ts:18205` specifies physical 50-power, typeless execution, contact/protect flags and `randomNormal`; `sim/battle-actions.ts:1381` rounds quarter-base-max-HP recoil. These are shared-reference expectations, not actual Champions client observations.

## Remaining findings

### High — all moves blocked by Imprison does not produce Struggle

`engine.js:4443` constructs availability without checking the actor side's imprisoned moves. The default selector (`:4462`) chooses Amnesia again; execution rejects it at `:4533`.

Independent two-turn probe: Farigiraf uses Imprison with Amnesia in its set; Snorlax has only Amnesia. On turn two the reference uses Struggle, does 33 damage and leaves Snorlax at 176/235 HP. Local repeats the blocked Amnesia, does zero damage and leaves 235 HP. Reproduced on both sides using distinct species, with actual turn-one Imprison execution rather than manually setting a disable flag. Taunt-only exhaustion and one remaining usable Tackle are healthy controls.

This is outside the all-PP-zero fixture denominator and survives all 96 supplied tests.

### High — special protection is bypassed

`engine.js:5604–5610` explicitly excludes shield-rider moves from the direct Protect gate, then the Struggle branch (`:5613–5634`) directly applies damage and recoil without the ordinary per-target shield handling.

Using Chesnaught/Spiky Shield, Toxapex/Baneful Bunker, Aegislash/King's Shield and Obstagoon/Obstruct:

| Shield | Reference target damage / actor HP | Local target damage / actor HP |
|---|---|---|
| Spiky Shield | 0 / 206 | 22 / 176 |
| Baneful Bunker | 0 / 235 | 18 / 176 |
| King's Shield | 0 / 235 | 19 / 176 |
| Obstruct | 0 / 235 | 25 / 176 |

Actor starts at 235 HP with Immunity. Baneful's poison therefore does not affect this control. Both sides reproduce. Shield logs establish the shield was attempted before Struggle. These custom-game mechanic probes do not certify current-regulation availability of every species.

### High — Disguise boundary disagrees

Against Mimikyu, the reference breaks Disguise for 16 self-damage, deals no ordinary hit damage and leaves the Struggle actor at 235 HP. Local deals 30 to Mimikyu and applies 59 recoil, leaving 176 HP. Both sides reproduce. This is a broader unsupported interaction, not established as introduced by this commit.

### Medium — Struggle target is deterministic first slot

`engine.js:4463` defaults the selected target to `input.slots[0]`; the direct Struggle branch retains that target. Separate **unmodified-target** sampling across 24 recorded seeds: local hits slot zero 24/24; reference hits slot zero 13 times and slot one 11 times. This is a target-selection counterexample, not a claim that the two PRNGs must produce identical per-seed traces or a statistical proof of the reference distribution. The reference declares random targeting. The supplied single seed and aggregate damage assertions do not test this.

### Medium — additional ability interaction mismatches

In the custom-game execution path, synthetic Technician Snorlax facing Neutralizing Gas Weezing deals 32 locally versus 22 in the reference. Synthetic Unseen Fist Snorlax against Protect deals zero locally versus seven in the reference, and local omits recoil. Both sides reproduce. These explicitly remain synthetic shared-reference probes; no legal-team or client claim, and no assertion that generic ordinary damage abilities are universally incorrect.

## Independent probe method and limits

`node struggle-boundaries.mjs`: 19 conditions × two sides = 38 executions, 22 endpoint agreements and 16 disagreements across the eight conditions above. For mechanics isolation, reference Struggle targeting is deliberately fixed to slot zero, matching local selection. This avoids falsely reporting damage-formula disagreement when the two engines hit different targets. Actual random targeting is evaluated separately in `struggle-targeting.mjs`, without that override. Damage randomness/criticals are controlled on both sides.

Healthy endpoint checks include ordinary damage/recoil, burn (14 damage), +2 attack (57), Technician (43), Huge Power (57), Pixilate and Normalize (29), Substitute (zero target HP loss, recoil retained), contact-induced KO, Taunt availability and one usable Tackle. Endpoint agreement is not a claim that every intermediate event, substitution HP, faint order or state field matches.

Initial duplicate-opponent probes and uncontrolled-target results are preserved separately, not counted as independent additional evidence. The final distinct-species, target-isolated cases supersede their mechanical conclusions. Two harness calibration failures (manually adding Taunt without reference request disabling, and passing a scalar local seed) were corrected before conclusions; neither is counted as a simulator defect. Teams are synthetic two-member custom games and may include unavailable abilities/moves; no official legality or complete registration claim.

Full logs, turn events, reference logs and dependency identity are in `struggle-retest-evidence/boundaries.json` and `targeting.json`.

## S1–S4 quick regression

- S1: all 35 adverse nested representations remain rejected across reevaluation/JSON, simulation, aggregate, series, ranking, replay attachment, local history and payload building. Healthy history counts one. Downstream rejection retention still holds.
- S2: Amnesia baseline passes 30/30. Independent actual-damage mutant still fails with 57 versus 76; this turn did not rerun the whole recurring methodology runner.
- S3: stale evidence contracts, contradictory capture metadata, content/identity counterexamples still reject; positive synthetic package remains READY.
- S4: failed/missed action omissions and duplicate/order controls still mismatch, including candidate binding.

No new actual browser run, response-byte mutation, hosted CI lookup, full-project run or current-client video proof was performed this turn. Their earlier receipts retain their original heads and limits.

## Acceptance

Retain the scoped ordinary damage/recoil repair, but do not close overall Struggle parity. Add owner-gate cases for Imprison exhaustion, shield contact outcomes, Disguise, suppression, and random target eligibility/distribution. Keep those checks separate from legality certification. Retest numerical endpoints and intermediate state/action/faint events after each repair. Preserve strict NO-GO until current-client evidence and the broader release gates are satisfied; do not weaken them for the deadline.

All changes made here are isolated audit scripts/artifacts. No active development checkout, settings, live DB, deployment or expected answers were modified. Initial sandbox fetch failure was resolved by approved read-only escalation; no operation remains denied or pending.
