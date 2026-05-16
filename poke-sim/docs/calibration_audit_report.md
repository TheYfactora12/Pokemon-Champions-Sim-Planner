# Calibration Audit Report

Date: 2026-05-16
Scope: `poke-sim` shipped catalog, coaching calibration, and matrix coverage

## Executive Summary

The calibration pass is now materially stronger.

- The shipped catalog covers 17 teams in the local matrix audit.
- The four added calibration shells are clean in the data guard and participate in the matrix without JS errors.
- The coaching model now gives baseline guidance even when a team has no sampled win history.
- The simulator and coaching layer are still inference-driven, not oracle-grade. Confidence must be read alongside provenance.

## Audit Method

I ran the shipped matrix audit over the current catalog:

- 17 available teams
- 20 battles per matchup cell
- 5,780 total simulated battles
- 0 JS errors

I also ran the shipped data guard:

- placeholder guard passes
- shipped team members have `BASE_STATS`
- known teams are populated

## Catalog Coverage

The current calibration set includes the original 13 tournament / shipped teams plus 4 new calibration shells:

- `fabulous_sunroom`
- `sand_bulky_offense`
- `fire_ice_fullroom`
- `zardx_snow_setup`

These new teams were assembled from already-shipped legal catalog members and public archetype references so they widen matchup coverage without changing engine logic.

### New Calibration Shells

| Team key | Style | Primary idea | Audit status |
|---|---|---|---|
| `fabulous_sunroom` | Sun | Sun offense with Tailwind and mega pressure | Clean |
| `sand_bulky_offense` | Sand | Sand offense with bulky pivots and late cleanup | Clean |
| `fire_ice_fullroom` | Trick Room | Room offense with mixed speed inversion and spread damage | Clean |
| `zardx_snow_setup` | Snow / setup | Veil-style snow offense with setup and priority | Clean |

## Legality Audit Summary

Current matrix legality scan: clean.

Update:

- The legacy item-clause issues on `mega_houndoom`, `champions_arena_2nd`, and `cofagrigus_tr` were repaired after the first audit pass.
- The current catalog legality scan is clean.

## Matrix Simulation Summary

Across the 17-team matrix:

- `Opponent Win`: 2,840 battles
- `TR Win`: 1,356 battles
- `KO Sweep`: 828 battles
- `Tailwind Win`: 643 battles
- timer outcomes remain rare
- no engine JS errors were observed

The broadened catalog is giving the coach more archetype variety:

- Sun now has more than one shape
- Sand now has both offensive and bulky pressure coverage
- Trick Room now has a full-room shell with a mixed-speed profile
- Snow now has both setup and veil-adjacent pressure coverage

## Mirror-Match Calibration

Mirror performance is mostly reasonable for the new shells:

- `fabulous_sunroom`: 45%
- `sand_bulky_offense`: 60%
- `fire_ice_fullroom`: 45%
- `zardx_snow_setup`: 60%

One legacy team still stands out as unstable in mirrors:

- `cofagrigus_tr`: 15% mirror win rate, flagged as far off 50%

After the cleanup pass, another calibration shell also shows a mirror outlier:

- `suica_sun`: 80% mirror win rate, flagged as far off 50%
- `sand_bulky_offense`: 80% mirror win rate, flagged as far off 50%

That does not invalidate the calibration shells, but it is a reminder that some older catalog entries may still be skewing the coach.

## Speed-Control / Board-State Signals

The matrix shows the new shells are producing useful style signals:

- `fabulous_sunroom` trends toward Tailwind and sun tempo
- `sand_bulky_offense` leans into balanced turn structure with sand pressure
- `fire_ice_fullroom` is strongly room-dependent
- `zardx_snow_setup` participates in both screens and speed-control situations

These are useful because they make the coach see more than one line of play per archetype.

## Coaching-Model Calibration Findings

The coaching layer is now in a healthier state than before the calibration expansion:

- Baseline guidance exists even when a team has no sampled wins.
- Matchup intelligence can now talk about more archetype shapes.
- Lead systems can derive a starter opener before the first sim.

What is still heuristic:

- safe leads are still sample-driven
- matchup grade and confidence are still shaped by sample size
- dead-move detection is still log-based
- BO3 adaptation remains conservative when the sample is thin

## What This Helps a New Player Do

The application now does real coaching work for a brand-new player:

- shows what the team is trying to do
- gives a starter lead
- identifies preserve pieces
- surfaces matchup warnings
- avoids pretending sparse data is certainty

That is the right behavior for a coaching-first platform.

## Remaining Risk

The most important remaining risks are calibration, not engine correctness:

- avoid overfitting leads to small win samples
- keep confidence wording conservative when sample size is thin
- continue checking mixed-role teams so they do not get flattened into generic identities
- clean up the two pre-existing legality warnings in the legacy catalog when ready

## Next Calibration Step

The next useful pass is to compare the coach output against a few known matchups and make sure:

- baseline guidance is still sensible
- sample-based matchup grades do not overclaim
- BO3 adaptation stays grounded
- new archetypes remain distinct in the reports

This report should be used as the calibration baseline for the next coaching-model iteration.
