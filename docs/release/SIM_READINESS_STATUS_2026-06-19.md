# Sim Readiness Status - 2026-06-19

Audience: partners, reviewers, and internal owners deciding whether the simulator is ready for stronger accuracy claims.

## Bottom Line

The simulator is improving, but it should not yet be described as fully ready or fully accurate.

2026-06-22 update: the Y fork live page is now deployed through `e5af069`; CI and GitHub Pages passed; fresh live logs validate cleanly for team loading, stable IDs, final alive counts, stale item absence, and exported build metadata support. This improves live-debug trust, but it does not close the full move, damage, ability, regional-form, or mechanics parity gate.

The correct status today is:

- simulation-truth validation in progress
- meaningful proof exists for parts of the current branch
- public accuracy claims should stay conservative until the remaining gates are closed

## What Is Proven On The Current Review Branch

Confirmed from current branch state and local verification:

- The active direction is simulation truth first, with coaching and premium claims paused behind that gate.
- The Showdown DB/runtime review branch is synchronized across the Kevin fork and Alfredo upstream on `feature/showdown-db-writer`.
- The Showdown writer dry run works without secrets and reports:
  - 8 source files
  - 8651 entities
  - 1536 diffs
- Focused runtime/data-path tests pass:
  - `node tests/showdown_runtime_data_tests.js`
  - `node tests/showdown_db_writer_tests.js`
- Current fast suite passed locally on this branch:
  - `npm run test:fast`
  - 84 non-DB test files passed
  - 14 DB-gated files skipped
  - 0 failures
- Browser/runtime boundaries are tighter on this branch:
  - service-role writes stay in Node/GitHub Actions paths
  - browser path is read-only through anon-safe access
  - generated Showdown species stats/types are preferred before fallback rows

## What Is Not Proven Yet

These are still open proof gaps and should block strong readiness claims:

- Full simulation-truth gate is not closed yet.
  - Priority, speed, Trick Room, damage, terrain, weather, status, Protect-family, spread targeting, switching, and stable identity all need continuing proof at release-gate level.

- Showdown-approved DB views are not yet the production bundle source.
  - The branch improves the path, but the public app is still not generated from approved DB views as the final release input.

- Strict fresh live-log proof is not complete.
  - The project still needs repeated validation of fresh exported logs from each deployed build using `node tools/validate-turn-logs.mjs --require-stable`.
  - New logs should include `schema_version`, `build_id`, `exported_at`, and `source_url` so reviewers can prove which build produced the result.

- Showdown oracle coverage is still incomplete.
  - The project still needs a stronger local-vs-Showdown behavior harness for mechanics that static rows alone cannot prove.

- Release-blocking CI gates are not fully in place yet.
  - The repo still needs stronger enforcement for stale bundles, unresolved high-severity drift, and sim-impact verification.

## Why Partners Are Right To Push Back

If a partner says the sim is not ready or not accurate enough, that is a defensible position today.

The current repo state supports:

- saying the simulator is under active truth-hardening
- saying specific subsystems and tests have improved
- saying the data path and review posture are stronger

The current repo state does not yet support:

- saying the simulator is fully accurate
- saying the simulator is ready for strong public trust claims
- saying coaching or replay-derived conclusions are ready to scale without qualification

## Current Direction

The next work should stay in this order:

1. Simulation truth
2. Showdown source-of-truth pipeline
3. Strict live proof and release gates
4. Public trust/readiness
5. Coaching expansion only after the above are green

## Near-Term Exit Criteria

For a stronger partner-facing readiness statement, the repo should first show:

- required sim-truth suites passing for the targeted mechanics
- strict fresh exported logs passing from a deployed build
- approved Showdown rows driving generated release assets, or a clearly documented interim release rule
- CI gates blocking unresolved high-severity drift and stale release artifacts
- one concise release-truth packet that states what is proven, what is not, and what changed

## Recommended External Wording Right Now

Use wording close to this:

```text
The simulator is in active simulation-truth validation. Recent work has improved the Showdown data path, runtime fallback safety, and test coverage, but we are not yet claiming full readiness or final accuracy. Remaining work is focused on mechanics proof, strict live-log validation, approved data promotion, and release gates.
```

## Source Docs

- `docs/release/SIMULATION_FIRST_REALIGNMENT_2026-06-06.md`
- `docs/release/SHOWDOWN_DB_RUNTIME_HANDOFF_2026-06-10.md`
- `docs/release/PUBLIC_RELEASE_MILESTONE_PLAN_2026-06-06.md`
- `docs/CORE_ISSUES.md`
