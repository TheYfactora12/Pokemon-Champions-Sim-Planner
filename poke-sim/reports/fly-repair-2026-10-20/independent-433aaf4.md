# Independent Fly retest — 433aaf4

Audit target: 433aaf4ceb9648e073ca4ede56baa3c4f855e742. Pinned independently compiled Showdown reference: 9b136a8c8cdb860a8ab96fa063f906604e352547, Champions doubles custom game. Synthetic teams and deterministic RNG; this is not current-client or M-C legality certification. Active implementation checkout untouched.

## Verdict

The bounded Fly repair is substantially reproduced and public admission remains blocked. Do not promote the existing interruption receipt unchanged: one claimed reference interruption is not exercised. No new engine regression was found in the 20 other-charge comparisons, but five pre-existing suppressed-Klutz discrepancies survive.

## Material findings

**Medium — confusion interruption claim has a false-positive oracle path.** `poke-sim/tools/fly-lifecycle-probes.mjs:29` forces confusion for randomChance(1,3), whereas pinned upstream `data/conditions.ts:187` calls randomChance(33,100). Thus the unmodified reference releases Fly into Protect; the candidate self-hits. `tests/fly_lifecycle_tests.mjs:7-12` excludes interruption HP/status and checks cleared charge, so both actions pass as equivalent. The four confusion orientations are included in the 168 reported agreements but are not genuine matched interruption observations. This is a semantic coverage defect, not evidence that candidate confusion cancellation itself fails.

Independent calibration changed only the diagnostic RNG event to 33/100: four cases (both sides, two and three turns) then agree, including self-hit HP of 27 and 54 respectively. Preserve the old receipt as historical, correct the adapter, require an explicit reference confusion-self-hit event and absence of Fly damage, then recapture. Add a negative control that removes Fly cancellation specifically on confusion and demand failure for the intended state/event reason.

**Medium — other charging moves retain incorrect effective-item handling.** `poke-sim/engine.js:1293-1296` uses effective items for Fly alone; Solar Beam, Solar Blade, Meteor Beam, Electro Shot and Phantom Force still consult raw Klutz. In all five synthetic Power Herb + Klutz + allied Neutralizing Gas cases, the reference consumes the Herb and spends two move PP over two turns; candidate does not consume it and spends one. Charge state also differs. These exact candidate states match the pre-Fly 9ea1ccb engine, so these are surviving defects, not regressions introduced by this patch. Validate applicable legal species/ability combinations separately before assigning player exposure; synthetic custom-game cases establish mechanics behavior only.

**Low — lifecycle helper is not safe for arbitrary longer scenarios.** At `tools/fly-lifecycle-probes.mjs:38-40` reference honors any stored two-turn move; at lines 72-74 candidate skips forcing only turn two and forces Tackle from turn three. Power Herb/Klutz/Gas with Protect over three turns consequently compares reference Fly continuation to candidate forced Tackle, leaving different charge state. Do not label this an engine regression from this harness. Bind equivalent actions or fail closed for unsupported continuation configurations. Additional normalization omissions: burn is compared as `burn` versus `brn`; faint state is compared before reference replacement but after automatic candidate replacement. These are observable harness limits, not proof of incorrect burn or damage.

## Executed evidence and denominators

- Five supplied suites: **240/240 test assertions pass**, zero skipped. These are not 240 independent mechanics cases or an accuracy percentage.
- Reproduced **24 basic + 168 lifecycle/damage comparisons**, with the confusion qualification above. The 168 contain 136 lifecycle orientations and 32 Gust/Twister roll comparisons. Seven original airborne exceptions reproduce on both sides; historical fail-before receipt remains bound. Four Eject Button gap assertions deliberately assert disagreement, not success.
- Eight No Guard accuracy controls, six unique-anchor mechanics mutants and two admission-removal mutants pass their expected detection tests. Production team and forced-action Fly rejection remain intact. Source-bound current and historical receipt checks pass.
- **36 additional configurations**: 28 raw comparisons agree; eight raw discrepancies comprise two burn-name normalization differences, two faint/replacement-boundary differences, two unequal forced-continuation comparisons and two miscalibrated confusion paths. None is presented as a newly proven Fly engine defect. Full inputs/actions/logs retained.
- **4 corrected confusion diagnostics** agree including HP, PP, target damage and cleared charge.
- **20 other-charge probes** across five moves and four item/ability setups: 15 agree with reference; five suppressed-Klutz cases differ. All 20 candidate snapshots equal the pre-Fly engine snapshots. This is bounded regression evidence, not exhaustive charge-move coverage.
- The feed reconciliation changes no engine bytes relative to 4793640 (git diff --quiet verified). Current audit worktree and pinned upstream source remain clean.

The first independent run lacked NODE_PATH and could not load ts-chacha20; its error log is retained and excluded from all executed-case counts. Rerun with installed isolated dependencies completed all 36. No denial or pending operation remains.

## Acceptance before expanding Fly admission

1. Repair confusion event calibration and assert interruption causality, not merely cleared charge; retain fail-before and negative controls.
2. Make arbitrary-turn action binding equivalent, normalize statuses, and explicitly select before/after replacement checkpoints.
3. Keep Eject Button and public Fly admission blocked until forced replacement/re-entry, faint cleanup, ally targeting and other declared gaps have independent bounded receipts.
4. Treat the five other-charge effective-item discrepancies as open; test suppression and restoration with legal pairings where available.
5. Keep reference agreement, legal availability and client proof separate. No hosted-CI certification, full mechanics audit, browser proof or current-client video evidence was performed in this turn.

Artifacts: `fly-retest-evidence/supplied.log`, `independent.json`, `calibrated-confusion.json`, `charge-regression.json`; reproducible scripts `fly-independent.mjs`, `fly-calibration.mjs`, `fly-regression.mjs`. Full hash manifest is `fly-receipt.json`.
