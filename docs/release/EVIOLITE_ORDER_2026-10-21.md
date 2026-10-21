# Bounded defensive Eviolite rounding repair

Isolated branch `fix/eviolite-order` starts exactly at pushed source
`5c93802893a15bb9716f9143fe20f2cfc5a7c345`. No main-worktree edit, push,
merge, publication, live database or settings operation was performed.

## Claim and source

The defensive Eviolite lane now truncates stage multiplication/division before
modifiers, then truncates the direct sand modifier before applying Eviolite's
fixed-point 1.5 multiplier. Unrelated item/stat lanes are unchanged. Snow already
rounds separately in calcDamage; identical 1.5 factors commute numerically for
this isolated pair, which does not establish general modifier-order parity.

Pinned Pokemon Showdown `9b136a8c8cdb860a8ab96fa063f906604e352547`:
- `sim/pokemon.ts:582-618`: stage truncation.
- `sim/battle-actions.ts:1756-1763`: stat calculation precedes modifier events.
- `data/items.ts:1880-1900`: Eviolite defensive modifier, priority 2.
- `data/conditions.ts:635-640,704-707`: sand/snow direct modifiers, priority 10.
- `sim/battle.ts:2348-2358`: half-down modifier rounding.
- `data/mods/champions/items.ts:294-296`: Eviolite is **Past**.

These are Champions custom-game synthetic mechanics probes, not M-C eligibility,
legal teams, or fresh client proof. Team setup, finite synthetic stat overrides,
sides, weather, stages, deterministic 16 random rolls and exact expected outputs
are versioned in `tests/fixtures/eviolite_order_v1.json`; full team/reference-log
captures reside in `reports/eviolite-order-2026-10-21/` (paths under poke-sim).
Expected damage was captured from the pinned oracle before the repair, never
regenerated from the candidate. Historical evidence remains unmodified.

The source guard verifies the exact reference HEAD, six relevant raw source hashes,
and all 525 compiled JS files (aggregate
`58da20a619f4eae3c0b5766867ef3d4ee6ec0efae52f0366e4ff47ce20829827`).
Set CHAMPIONS_REFERENCE_SIM to that checkout's absolute root (also accepts dist/sim). Without that override, ordinary offline CI explicitly uses historical npm0.11.11,
separately pinned by its full compiled-runtime aggregate
`427e76a4dd30f4d9e17ca6a21ceb51c790e10cbef126ad930c4130718891aa36`.
It also passes226/226 against the same unchanged frozen vectors. The test logs
label which reference ran; arbitrary runtimes are rejected. Historical npm is
not relabeled as the current upstream. The existing broader referenceIdentity
initially rejected this locally built checkout because ignored generated
config/config.js participates in its recursive source fingerprint. Excluding
that generated file reproduces its existing expected source fingerprint
`6ee47d5009706b808a9d079aab9b1a2fa0493edb98b4dd7feee189679d3951a8`;
its verifier was not modified. The new test guard independently pins the compiled
runtime, including that generated configuration's compiled effect.

## Before and after

Exact-base reproduction: Snover Eviolite Defense95/stage -1, Weezing U-turn:
snow 42-50 versus reference44-52; clear62-74 versus reference64-76, both sides.
The baseline disagrees on60/221 frozen damage vectors. The fail-first test run
reported164/226 passed and62 failed (60 vectors plus two controls that required
the corrected implementation). After repair all221 damage vectors agree.
The matrix covers stats31/95/97/255, stages -6/-1/0/+1/+6, both orientations,
physical Defense, special SpD, special moves targeting Defense, snow/clear/sand,
sun/rain, no-item and critical controls. It rejects invalid/nonfinite inputs
rather than treating NaN agreement as parity.

Four intentional bad implementations must fail: original fractional-stage
pipeline, nearest rounding of stages, combined sand/Eviolite rounding, and
missing Eviolite. Initial after-run225/226 passed: the sand mutant escaped a
damage-only assertion because effective SpD145 and146 yield the same damage
vector. Added frozen expected effective SpD145 (65 ->97 ->145), with direct
reference and candidate observations; incorrect combined-modifier146 is now
rejected. No frozen damage vector changed. This failed attempt is retained.

## Independent review

Read-only reviewer `/root/battle_auditor` independently checked sources, patch,
all221 inputs and runtime pin. Its initial run also reported225/226 with the
same sand-observation failure. After scalar observation was added, its independent
focused run passed2/2. It found no further demonstrated patch defect and confirmed
the source order. Review evidence includes the failed control, not just approval.

## Limits and integration

Eviolite eligibility, consumed state and ability/item suppression are preexisting
unresolved semantics; the current getter applies Eviolite without these checks.
Body Press uses this same getter offensively, so this rounding patch can also
change its already-incorrect Eviolite interaction: affected and unresolved, not
certified unchanged. Singles, arbitrary modifier combinations and client proof
remain unverified. General competitive readiness remains NO-GO.

Generated bundle is rebuilt locally with existing build labels, not a new
published release. Integration must assign coordinated release identity and
refresh bounded runtime receipts; old receipts cannot certify changed engine
bytes. Next task: integrate the bounded repair and refresh exact-head receipts
while retaining the separate Eviolite scope gaps.

## Immutable implementation identity

Engine/test/artifact commit: `0aa4640f40c364fab46f561f03ce9a44b3bfe2e5`.
Offline-CI reference compatibility: `8fb70b4c4cb6453eec55c0040cfb4e28c6676a5f`.
Committed bundle SHA256:
`8cfdf1b982e61acb88b406f71abcb7fbb32fdb41ba9251e953dbf3c905a86ccd`
(11,532,052 bytes). Working and committed bundle hashes match. Other source
files have Windows CRLF working bytes; artifact-identity.json preserves both
hashes and verifies LF-normalized working bytes equal committed Git blobs.
Independent review binds the observed working hashes, not an assumed platform
encoding. The source is unchanged while broader tests run.

## Validation

Focused current upstream:226/226 passed. Historical npm reference:226/226 passed.
Raw after capture:221/221 matching damage vectors. Four mutation controls pass;
invalid/nonfinite oracle inputs reject. Independent sand check2/2 passed.
Source-truth final command passed; initial run hit Windows Git Bash named-object
sandbox failure. Initial broad attempts also used dist/sim where old item tests
require the checkout root, and the audit inventory count initially needed its
new partial case. Corrected tests run with the root path outside the Windows
sandbox; those historical failures remain retained.

No goldens were regenerated. No browser/client, hosted CI, deployment, live DB,
preview or competitive-readiness certification was attempted. Existing release
labels/cache identity are retained for parent coordination; integration must
perform its release/cache bump and fresh bounded-receipt capture. This isolated
patch is not a standalone publishable release.

The move-register suite initially failed2/12 because the new case inventory
requires a new generated export. Existing exportMoveRegister generated additive
snapshot `a35322ad445989d39ea851af2b29f7796719e03432ca4ed6af7f661b8fc4c32c`
in commit `093ce702ef0e12f3e12d2d904679057f5e25be5c`. Owning suite then passed12/12.
Independent reviewer confirmed954 move records,68025 pairs,75 old interactions
and generator are unchanged; only matrix evidence, count76 and snapshot identity
change. The new declaration remains unverified/partial with no execution receipt;
competitive_use stays false and client verification unknown. All old snapshots
remain. This is source-inventory generation, not damage-golden regeneration.

Final seeded battle audit passed its declared scope:4500/4500 battles, zero JS
errors, historical goldens3/3 and DB golden fixtures8/8. Its partial and gap
families remain unproved. Full project sweep result is recorded below.

Full sweep:282 fast files,2 failed;12 offline/mock DB files,0 failed;4 manual/helper
files skipped. The two failures were move_register_tests (resolved by the additive
export; follow-up12/12) and validation_cycle_tests (17/19, unresolved missing
bounded export). The latter requires fresh runtime-dependent bounded captures,
independent review and canonical tracker refresh during parent integration. Its
old six-current-pass expectations were not rewritten and old green receipts were
not carried forward. No complete-green or exact-head hosted-CI claim is made.
The sweep spanned additive metadata generation; runtime bytes stayed fixed.

Initial sandbox attempts are retained:fast10 file failures;full11 file failures;
battle audit3 file failures. They include reference-path, temporary Git permissions,
Git Bash process-object failures and stale artifacts. The corrected outside-sandbox
battle audit and source-truth commands passed. The remaining validation-cycle gate
is failed, not denied, pending approval or uncertain execution. No permission denial
remains. Parent integration owns fresh bounded receipts and coordinated release
identity; eligibility/suppression, Body Press and client semantics stay separate.

## Coordinated integration checkpoint

The four verified bundle commits were integrated onto publication3e441cf without conflicts. Runtime17fd127127fd990be9dea2046d3804e15a358cd5 carries engine1.1.47 and v2.2.247-eviolite-order. The regenerated bundle is11,532,080bytes, SHA2564606f58fa8da5a32d50752a982eb6f11c1791e5df2a3781f011dfead87097079, below the unchanged11MiB limit. Historical and pinned upstream focused suites each passed226/226; the first archive-based upstream attempt stopped because the strict guard requires a Git checkout, then the exact isolated checkout passed without changing the guard. Initial release test retained an old build-ID expectation and hit sandbox temporary-Git permissions; corrected identity and authorized host execution passed12/12. QA snapshot checks passed7/7.

Independent integration review passed226/226 and confirmed all221 frozen vectors retain the original expected arrays. Parent independent retest of isolatedc9d071d additionally passed48 ordering/weather-suppression cases. Its exact report is EVIOLITE_RETEST_C9D071D.md; these results do not close the separately reproduced activation or Body Press defects. Ineligible, Klutz or consumed-item target examples take42-50 instead of62-74 reference; Eviolite Body Press example deals68-80 instead of44-54. Those repairs have a separate isolated owner and are excluded here.

Fresh cycle-v12 execution and independent review passed at2026-10-21T08:09:00.856Z: six cases and36 unsupported-input rejection controls, runtime17fd127. Six dated assertions were enrolled; tracker has73 history rows (six current,61 stale and six blocked). The current export identity is7112816ca05e235b44339b7398dbe7c327ebf3495f3bc51cc994003892071c84. Final aggregate, clean checkout, browser and exact-head hosted results remain separate pending gates. Historical failures and receipt versions are retained. No merge, preview publication, production deployment, credentials or settings changes.
