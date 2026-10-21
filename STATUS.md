# Project Status

Reviewed: 2026-10-21. This file owns current development checkpoint facts.
[ROADMAP.md](ROADMAP.md) owns milestones; [AGENTS.md](AGENTS.md) owns policy.
Competitive release remains **NO-GO**. No merge, deployment, live database or
repository security change is authorized.

## Current development candidate

Ordering source `380e8a3d1682897359b2b2e4d2fdc6a6946f6e4d` passed all six hosted jobs in [39570651808](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/actions/runs/39570651808), completed 2026-10-21T09:03:12Z. Its lifecycle publication `53516bdf6573a0009b32b51298c4ce84119cd983` is separately checking in [39574827433](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/actions/runs/39574827433). Neither is deployed.

Local activation runtime `2f3411e4b9f86cc22d44ea1abfd9004b029ca7ec` is engine 1.1.48 / v2.2.248-eviolite-activation. It integrates exact-species eligibility, effective item activation and offensive Body Press Defense separation. The pinned reference focused checks pass 201 activation plus 226 ordering assertions. Independent integration review confirms executable mechanics match the isolated reviewed candidate; six fresh v13 bounded captures and 36 unsupported-input controls passed. Aggregate, clean-checkout and exact-head hosted activation checks remain pending. See [scope and evidence](docs/release/EVIOLITE_ACTIVATION_2026-10-21.md).

Bundle is 11,533,142 bytes, SHA256 `bcb7a36d7317af58ef9517f54f9f6398eb702b1acca8690841ea6e9531d311e1`, 1,194 bytes below the unchanged cap. Historical comments were relocated verbatim to documentation; no executable statement changed in that size correction.

Production last observed remains v2.2.216-beta-feedback at scheduled-news commit `ed8e11ca263bf4d06d95a8811aed3b83c9b9edfe`, bundle SHA256 `c6f77f54100b857521014dc3c2b5848ad58c6ff1234267653f3e556799b50808`. Existing deployment [39545921411](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/actions/runs/39545921411) passed. This is identity verification, not remote E2E. CI browser evidence uses localhost. Private preview approval remains pending.

Open: Eviolite Magic Room, Embargo, transformation/species lifecycle, consumption-event timing, singles and current-client parity; Fly/Eject Button; broader paired-format coverage; official eligibility. Workflow 349252390 remains disabled; last seed health parsed 9/15 without full discovery. M-C candidate inventory 392 forms, 537 moves, 166 items and 23,756 pairs is reference coverage only. No universal accuracy percentage is established. No merge, preview publication, production deployment, credentials or settings change is included.

## Historical development checkpoints

The sections below retain their original checkpoint scope; pending statements in
these historical sections do not override the current checkpoint above.

## Draft review candidate

v2.2.230-proof / engine 1.1.31 is the review follow-up to
[draft PR279](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/pull/279).
The [competitive readiness register](docs/release/COMPETITIVE_READINESS_2026-10-20.md)
owns current defects, severity, evidence, owners, retest and the Wednesday decision.
The [season/accuracy workflow](docs/release/SEASON_AND_ACCURACY_WORKFLOW.md) defines
intake through independently verified release. Competitive release remains **NO-GO**.

The [Amnesia repair receipt](docs/release/AMNESIA_REPAIR_2026-10-20.md) records its separate 30-case reviewed regression and remaining boundaries.

This candidate repairs Rough Skin effective contact protection and strengthens
checker sensitivity, replay multiplicity/artifact binding, runtime parity and
recurring GitHub gates. Development checks do not certify current-client rules,
full mechanics, competitive policy quality or live Supabase. Scoped independent review and final local gates pass;
methodology checkpoint d48b9aa passed all seven hosted checks;
Amnesia checkpoint 991f4fd64cfe308e4f36de3aee56e06a7c497ded also passed all seven hosted checks. The current R1–R5 repair passed scoped checks, battle audit, methodology and fresh browser capture; one aggregate link failure passed its targeted retest. Exact-head hosted checks remain pending; no merge/deployment authorized.

The [R1–R5 repair receipt](docs/release/EVIDENCE_BOUNDARIES_2026-10-20.md) records downstream outcome quarantine, parsed evidence binding, replay completeness and pinned browser CI. Scoped independent controls pass; original-auditor exact-head closure remains pending.

The v225 candidate and its evidence are preserved in
[the historical candidate receipt](docs/archive/STATUS_V225_CANDIDATE_2026-10-20.md).
PR279 retains the current move/PP/Fly, default-policy, pivot, switch-out and earlier
repairs. PR278 stays open pending authorized integration; recommended sequence is
279 as consolidated superset, then separately authorized supersession of278.

## Current verified release

**v2.2.216-beta-feedback / engine 1.1.20** is live on primary Pages.
PR276 merged as `35855867fe98d6566ea342762e85e7ee6a880e8d`; PR gates and
main CI 39013211926 and Pages 39013211933 passed. Eight deployed files matched committed bytes at
2026-10-17T07:22:50.328462Z. The visible Report a bug route opened correctly on
desktop/mobile. 18 startup visits and 1,191 live replay/export checks passed; the
retained v215 cache upgraded and offline loading passed.
[Release receipt and rollback](docs/release/BETA_FEEDBACK_2026-10-17.md).

**No-go for a game-accurate Champions launch claim.** Default Practice has current
patch drift; M-C reference admits unsupported Fly; voluntary switching is absent.
Mega ordering, complete game stat/data proof and human-like policy remain open.
[Accuracy sweep, denominators and proposed repairs](docs/release/CHAMPIONS_ACCURACY_SWEEP_2026-10-17.md).
Feedback availability does not resolve these blockers.

### Previous verified v215 / rollback

**v2.2.215-priority-suppression / engine 1.1.20** was previously live on primary Pages.
PR274 merged as `fb481d904972084be6665e56e415c9732b15dc44` after CI/battle
audit/bundle/cache checks passed. Pages39005599477 passed. HTTP alignment at
2026-10-17T05:19:12.665Z passed; live five-turn replay/export matched399 checks
with zero issues/page errors.96 scoped oracle cases and78 new selection/state
assertions passed locally. The original nine priority suppression discrepancies
are repaired. General ability suppression, official M-C approval, policy-quality
and unexplained startup interruption remain open.
[Current receipt and next harness work](docs/release/PRIORITY_SUPPRESSION_2026-10-17.md).

### Previous v214 release / rollback

**v2.2.214-startup-diagnostics / engine 1.1.19** was the previous release.
PR272 merged as `b7f668f56a3f98402118da1a3bd337b08ec96024` after final-head CI,
bundle, cache and battle-audit gates passed. Main CI39003792247 and
Pages39003792322 passed. HTTP alignment passed at2026-10-17T04:49:21.118Z;
five live reloads, Home and tournament filtering passed without page errors.
The undefined-registry dependency and overwritten-first-error behavior are fixed.
The original intermittent initialization interruption remains unexplained: #271 stays open.
[Scoped receipt and limits](docs/release/STARTUP_HARDENING_2026-10-17.md).
Historical next action at v214: #264 priority suppression/bypass mismatch.
The nine discrepancies were subsequently repaired in v215; this is not an active defect notice.
No new team-strength, official M-C approval or live database claim follows.

### Previous verified release / rollback

**v2.2.213-roadmap-receipt / engine 1.1.19** was the previous verified release.
PR269 merged as `08d09d68babdc9eb06c67fe440b8a8f47b37a444`; Pages38775449546 passed.
At 2026-10-15T17:18:07Z, the bundle, five external assets, manifest and service worker matched exact committed bytes.
Live desktop/touch roadmap display and offline reload passed with zero page errors.
This follow-up changes roadmap copy/cache identity; unchanged v212 battle workflow proof covers four games, six replay/export pairs and 3,589 comparisons with zero mismatches.
The Trace review allegation did not reproduce against the pinned reference; added regressions passed. Historical hash ambiguity and stale roadmap date were corrected.
M-C remains experimental and excluded from trusted rankings/database learning. Official-package approval remains ungranted.
[Current receipt, review dispositions and rollback](docs/release/V213_LIVE_2026-10-15.md).
[Previous v212 workflow receipt](docs/release/V212_LIVE_2026-10-15.md).
[Prior v210 / candidate checkpoint](docs/archive/STATUS_PRE_V212_RELEASE_2026-10-15.md).

## Historical release references

Historical documented release: **v2.2.205-matrix-draws**, preview/local-save.
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

October17 candidate checkpoint (superseded by live receipt above):96 oracle
cases and78 new selection/state assertions pass. Local six-turn browser/export
comparison passes464 checks. Aggregate/hosted/deployed gates were pending then.
[Candidate evidence and exclusions](docs/release/PRIORITY_SUPPRESSION_2026-10-17.md).

October16: [the trust recovery execution plan](docs/strategy/TRUST_RECOVERY_EXECUTION_PLAN_2026-10-16.md)
tracks startup #271 first, then remaining policy/mechanics and paired team evidence.
The startup exception condition is under diagnostic investigation; the original
browser trigger and a production repair are not yet proved. Preserve the shipped
v210-v213 work below rather than reopening completed implementation batches.

October17 candidate checkpoint (superseded by the live receipt above): v214 in PR272: exact
tournament membership no longer depends on late assignment and the first error
is retained. Focused tests and20 local reloads passed; release gates were pending then.
[#271 evidence and limits](docs/release/STARTUP_HARDENING_2026-10-17.md).

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

## Isolated Eviolite activation follow-up (2026-10-21)

Bounded activation and Body Press repair passes 201 pinned-reference checks and retains 226 ordering checks. Source/custom-game evidence only. Bundle exceeds existing cap by 2,978 bytes; publication held pending integrated gates. See [evidence](docs/release/EVIOLITE_ACTIVATION_2026-10-21.md).
