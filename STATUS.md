# Project Status

Reviewed: 2026-10-15. This file owns current release facts and priorities.
[ROADMAP.md](ROADMAP.md) owns milestones; [AGENTS.md](AGENTS.md) owns policy.
The full prior status was preserved in [the October 8 archive](docs/archive/STATUS_PRE_ALIGNMENT_2026-10-08.md).
Historical candidate observations are not current deployment instructions.

## Current verified release

**v2.2.212-mega-lifecycles / engine 1.1.19** is live on primary Pages.
PR268 merged as `bceb93ffe8862011b2facb285790b07c5faab534`; Pages38771451578 passed.
The exact bundle, five external assets, manifest and service worker matched reviewed bytes.
Desktop/touch live checks passed four games and six replay/export pairs with zero mismatches or page errors; offline reloads passed.
M-C remains explicitly experimental and excluded from trusted rankings/database learning. Official-package approval is separate and ungranted.
[Live receipt, proof limits and rollback](docs/release/V212_LIVE_2026-10-15.md).
[Prior v210 / candidate checkpoint](docs/archive/STATUS_PRE_V212_RELEASE_2026-10-15.md).

## Previous verified release

Previous documented release: **v2.2.205-matrix-draws**, preview/local-save.
PR263 merged as `d2cd77678f138307476c651a04cd092db22e12ed` after CI
`38487226759`; Pages `38487715884` passed. HTTP artifact and asset checks
passed at 2026-10-14T00:04:40.665Z (October 13 local time). Bundle SHA-256:
`9d9fd75ab67d36c58e856507554583c0d58d50d8b089eeba7510816f9f9a2872`.
Live 1600-game batch completed with consistent W/L/D rows; five-turn export
passed396 observable-field comparisons. Post-deployment verification is recorded
in [the expanded audit](docs/release/EXPANDED_TEAM_MATRIX_2026-10-13.md).
Rollback: v204, merge `4aa63b62b2e68653fe6ffcd76719e9e539cc7f7c`;
[prior receipt](docs/release/ROCK_HEAD_MATRIX_2026-10-10.md).
### Previous Release / Rollback Reference

The v203 record below is historical, not the current deployment.

- Primary repository: TheYfactora12/Pokemon-Champions-Sim-Planner, main.
- Previous build: **v2.2.203-catalog-headroom**, preview / local-save.
- Runtime merge: `07e36dc1d084235f353763ea1306e67c9cb3e748`, [PR257](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/pull/257).
- Required PR CI `37935730695`, bundle and cache checks passed; Pages `37936291758` succeeded.
- At 2026-10-09T13:24:15.049Z, HTTP checks matched bundle and external assets.
  Live/local catalog rendering matched, including all 13 names and an expanded
  six-member sheet. This serialization-only release changes no battle mechanics.
  [Scoped receipt](docs/release/CATALOG_HEADROOM_2026-10-09.md).
- Bundle SHA-256: `1889ba9309156fb6b3bd81adf0b8b60216d0c0a8dcf55b9f06e15d13f95112e4`.
- Previous verified release/rollback target: v202, `698957eeaa142b41d72c96a439fc6e62f196611c`.
- This proves the named release/assets and scoped lifecycle path, not all game mechanics, live DB
  security, mobile journeys or beta readiness. No verified 99% accuracy claim.
- Alfredo's repository is the intended backup, not an assumed synchronized
  deployment. Preserve divergent work; no backup/failover certification here.

## Product Boundary

Doubles team building -> validate -> simulate -> inspect -> improve.
Singles fixtures test shared mechanics; competitive singles expansion is deferred.
M-C reference practice is explicitly unverified and excluded from trusted
rankings/coaching/database learning. The official M-C package is not approved.
The production release uses local saves; offline/mock DB tests are not live
Supabase security or ownership tests.

## Next Work, In Order

The v207/v208 move reconciliation and scoped effects, Imprison preference fix,
and v210 context-error handling have shipped in v210. The 22 residual move rows
are reconciled; their named probes are recorded in the [move audit](docs/release/MC_MOVE_AUDIT_2026-10-14.md).
The [v210 live receipt](docs/release/V210_LIVE_2026-10-14.md) records four games,
six paired desktop/mobile replay/export captures and 2,509 observable checks
with zero mismatches or page errors. Do not repeat those completed gates as
unfinished work; new runtime changes still require their own release proof.

Earlier candidate/unpublished statements and the old queue are preserved in
[the superseded queue archive](docs/archive/STATUS_QUEUE_PRE_V210_RECONCILIATION_2026-10-14.md).
The generated roadmap now reflects the verified v212 deployment and October 15 review date.
The v213 follow-up changes roadmap copy and cache identity only; its remaining evidence/approval gates still apply.

All issue numbers below refer to TheYfactora12/Pokemon-Champions-Sim-Planner.

1. **Experimental release completed (#241):** PR268's 19 missing Mega lifecycles
   and three aliases are deployed with bounded reference and live workflow proof.
   Do not repeat completed release gates as unfinished work. New runtime changes
   need fresh evidence; the accepted release does not imply official M-C approval.
2. **Official M-C package (#232):** complete current-client full-team/format
   evidence, bind the immutable source/mechanics package and obtain exact-package
   human approval. The 262 roster mappings and passing Showdown probes do not
   replace this evidence. Trusted rankings and database learning remain excluded.
3. **Remaining mechanics and policy evidence (#264/#241/#235/#245/#252):**
   extend named interaction boundaries, including simultaneous Emergency Exit,
   wider residual/recoil/multi-hit and ability suppression/copy timing. Evaluate
   move-choice provenance before using matchup win rates as team-strength advice.
   The 22-row reconciliation and scoped Fake Out/Klutz repairs are completed
   evidence, not universal interaction parity or automatic issue closure.
4. **Remaining experience and release verification:** live DB persistence,
   real-device Safari, wider accessibility/keyboard/network-failure journeys,
   coaching review and independent QA remain unproved. The known dark Strategy
   heading contrast limitation remains. Completed desktop/touch captures are
   bounded workflow evidence, not a complete beginner study.
5. **Security intake (#247):** triage the reported dependency alerts against
   affected runtime/build paths; provider severity alone is not an exploitability
   assessment. No security certification follows from the offline gates.

#228 remains the team-viability umbrella. Close only acceptance criteria backed
by linked evidence; partially repaired issues do not close because a release
merged. Preserve source-watch incidents with distinct source hashes separately.

## Evidence Index

- [M-C inventory and exact form evidence](docs/release/MC_RELEASE_INVENTORY_2026-10-08.md).
- [v197 full regression](docs/release/FULL_REGRESSION_V197_2026-10-08.md):
  4,624 headless invariant runs, not complete-game parity or a win-rate verdict.
- [Reference practice and paired logs](docs/release/MC_REFERENCE_PRACTICE_2026-10-08.md):
  earlier v197 live batch, 14 games / 67 observable turns; not repeated in v198.
- [Item audit](docs/release/ITEM_RUNTIME_AUDIT_2026-10-08.md).
- [Improvement log](docs/IMPROVEMENT_LOG.md) records lessons and failed attempts.
- [Project alignment review](docs/release/PROJECT_ALIGNMENT_2026-10-08.md)
  separates cleanup performed from unverified project surfaces.

## Working Rules

Use the existing tests, pinned sources, PR/CI and deployment gates. Close only
acceptance criteria with linked evidence on the deployed revision. Preserve
private logs, team registrations, source captures, migrations and rollback
artifacts. Never treat historical runbooks or model prompts as current approval.

Do not add paid services, premium work, LLM orchestration or new schedulers to
this release queue. Optional ideas remain deferred, not deleted or completed.
