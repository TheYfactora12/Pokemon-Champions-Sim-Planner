# Project Status

Reviewed: 2026-10-09. This file owns current release facts and priorities.
[ROADMAP.md](ROADMAP.md) owns milestones; [AGENTS.md](AGENTS.md) owns policy.
The full prior status was preserved in [the October 8 archive](docs/archive/STATUS_PRE_ALIGNMENT_2026-10-08.md).
Historical candidate observations are not current deployment instructions.

## Verified Release

- Primary repository: TheYfactora12/Pokemon-Champions-Sim-Planner, main.
- Deployed build: **v2.2.200-mega-admission**, preview / local-save.
- Runtime merge: `287c4e4804ab5c82ecee82556d4d363c24d72461`, [PR250](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/pull/250).
- Required PR CI `37929018619`, bundle and cache checks passed; Pages `37929506718` succeeded.
- At 2026-10-09T12:25:45.177Z, HTTP checks matched bundle and four external assets.
  Fresh browser ran a six-turn synthetic base/stone match and downloaded its JSON.
  All 41 log events matched verbatim or reviewed formatted wording. [Receipt](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/pull/250#issuecomment-6080865766).
- Bundle SHA-256: `7924efc3190cb04291eb73917459ce599472c76851f9be40f26f427ab3acbc28`.
- Previous verified release/rollback target: v199, `3c6dca619916f7aedea09de582eb6cbc1a4b005c`.
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

v200 shipped canonical Mega admission and supported base/stone resolution;
see [scoped evidence](docs/release/MEGA_ADMISSION_2026-10-09.md).
#241 stays open for remaining descriptor and alias gaps. The browser sample
identified possible Fake Out/action denial (#249); investigate before interpreting
team strength. Missing descriptors and official approval are not resolved.

All issue numbers below refer to TheYfactora12/Pokemon-Champions-Sim-Planner.

Security intake #247: GitHub reports 31 dependency alerts (12 high, 14 moderate,
5 low). Triage affected runtime/build paths before expanding release claims;
provider severity is not yet a project-specific exploitability assessment.

1. **Battle correctness (#249/#241):** investigate Fake Out/action denial and
   complete Mega descriptors/aliases; canonical-name bypass and supported
   base-plus-stone behavior are repaired in v200, not complete Mega parity.
2. **Item and move correctness (#235, #245):** repair Lum/Klutz boundaries and
   trace 22 remaining move rows after existing PP overrides explain 51 of 73
   raw differences. Inventory is not effective-engine correctness proof.
3. **Official M-C package (#232):** 262 review-only roster mappings now exist;
   bind format/effect evidence, team boundary fixtures and exact-package sign-off.
4. **Honest result/replay UX (#242, #238, #240):** correct columns, item/faint
   labels and exclusion-report ergonomics before interpreting team strength.
5. **Competitive beta gates:** complete paired user journeys, coaching review
   (#209), mobile/onboarding (#211/#213), Sources (#221), release/security
   (#103/#102) and independent QA (#190). Keep approval boundaries intact.

#228 remains the team-viability umbrella; linked scoped tickets own individual
repairs. Partially fixed issues do not close merely because a release merged.
News/source-watch incidents retain their own evidence; do not collapse different
source hashes into duplicate tickets without review.

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
