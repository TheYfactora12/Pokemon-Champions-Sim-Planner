# Simulation First Realignment - 2026-06-06

## Direction

Simulation truth is the active product gate.

Do not advance new coaching, premium, Battle IQ, Coach Recommends, or replay-derived claims until the simulator is accurate enough that coaching can safely depend on it.

This does not delete the coaching roadmap. It puts coaching behind a stricter simulation-proof gate.

## Why

Coaching amplifies whatever the simulator believes. If turn order, damage, status, terrain, switching, items, or Pokemon identity are wrong, the coaching layer will confidently explain the wrong lesson.

The correct sequence is:

```text
Battle mechanics truth
  -> Showdown/static data alignment
  -> Champions-specific overrides
  -> strict exported-log validation
  -> release gates
  -> coaching expansion
```

## What "Perfect Enough" Means

Perfect does not mean no future bug can ever exist. It means no known high-severity mechanics gap is untracked, untested, or silently hidden.

Before coaching expansion resumes, the simulator needs:

- deterministic tests for turn order, priority, Trick Room, speed ties, Tailwind, paralysis, and speed modifiers
- damage formula tests for standard Showdown behavior plus Champions-specific overrides
- terrain, weather, status, Protect-family, Quick Guard, ability, item, spread, and target tests
- stable Pokemon identity across switches, faints, bench movement, item consumption, and different lead selections
- strict exported-turn-log validation from a fresh deployed build
- Showdown data drift tests for moves, targets, base power, category, types, species stats, items, abilities, and type chart
- a Showdown oracle smoke harness for behavior that cannot be proven from static rows
- release gates that block unresolved high-severity unknowns

## Active Priority Stack

### P0 - Repo Alignment

- Open PRs from `merge-candidate/alfredo-main-2026-06-06` in both repos.
- Let PR CI run.
- Merge only when green.
- Verify both `main` branches and GitHub Pages after merge.

### P1 - Simulation Truth

- Run fresh exported logs from the live preview.
- Require stable identity fields with `tools/validate-turn-logs.mjs --require-stable`.
- Expand mechanics tests around priority, speed, Trick Room, damage, terrain, weather, status, abilities, items, and switching.
- Decide and implement the Champions damage-roll override path.

### P2 - Showdown Source Of Truth

- Apply the sync/audit DB migration.
- Add entity, diff, override, and approved-view migrations.
- Extend Showdown sync to write DB rows from trusted CI.
- Generate deterministic app assets from approved DB views.

### P3 - Release Evidence

- Keep Overview, closure reports, and parity reports current.
- Keep Jdoutt38 QA focused on proof: workbook rows, browser smoke, data provenance, and strict logs.
- Keep coaching labels conservative and evidence-bound.

### P4 - Coaching Expansion

Paused until P1 and P2 gates are green.

Paused items include:

- Coach Recommends UX MVP
- Team Snapshot + Replay Match MVP, except for parts needed to validate sim-vs-replay truth
- Battle IQ expansion
- premium coaching reports
- aggregate coaching patterns
- Meta Stress Lab coaching recommendations

## Old Info Cleanup Decision

Older coaching-first docs are not deleted. They remain useful product research, but they are no longer the active build direction.

Treat these as future/planned until the simulation truth gate passes:

- `poke-sim/docs/BATTLE_IQ_SPEC.md`
- `poke-sim/docs/SHOWDOWN_REPLAY_COACH_SPEC.md`
- `poke-sim/docs/META_STRESS_LAB_SPEC.md`
- coaching-forward sections in `poke-sim/docs/calibration_audit_report.md`

Treat these as active/current:

- `docs/release/SIMULATION_FIRST_REALIGNMENT_2026-06-06.md`
- `docs/release/CLOSURE_CONFIDENCE_2026-06-06.md`
- `docs/release/SHOWDOWN_DB_WIRING_STRESS_TEST_2026-06-06.md`
- `poke-sim/docs/SHOWDOWN_DB_SOURCE_OF_TRUTH_PLAN.md`
- `poke-sim/docs/SHOWDOWN_SYNC_ARCHITECTURE.md`
- `poke-sim/tools/validate-turn-logs.mjs`
- `poke-sim/tests/showdown_priority_drift_tests.js`
- `poke-sim/tests/turn_log_export_validator_tests.js`

## Close Rules

Do not close sim-truth work because a UI appears better.

Close only when:

- tests prove the mechanic or data path
- generated bundle is rebuilt when needed
- live preview is verified after merge
- strict fresh logs pass when the change affects battle state
- docs say whether the behavior is Showdown baseline or Champions override
- no related high-severity finding remains open

## Team Message

The sim is the product foundation. Coaching is valuable only after the sim is trustworthy.

For now, every team decision should answer:

```text
Does this make the simulator more correct, more testable, or easier to verify?
```

If the answer is no, it waits.

