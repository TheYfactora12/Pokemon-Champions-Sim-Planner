# Project Status

Reviewed: 2026-10-09. This file owns current release facts and priorities.
[ROADMAP.md](ROADMAP.md) owns milestones; [AGENTS.md](AGENTS.md) owns policy.
The full prior status was preserved in [the October 8 archive](docs/archive/STATUS_PRE_ALIGNMENT_2026-10-08.md).
Historical candidate observations are not current deployment instructions.

## Verified Release

- Primary repository: TheYfactora12/Pokemon-Champions-Sim-Planner, main.
- Deployed build: **v2.2.201-fake-out-flinch**, preview / local-save.
- Runtime merge: `20ecb36eb608524714664e1ce9e2503ed5d65031`, [PR253](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/pull/253).
- Required PR CI `37932507880`, bundle and cache checks passed; Pages `37933058440` succeeded.
- At 2026-10-09T12:56:47.371Z, HTTP checks matched bundle and external assets.
  Two four-turn live synthetic games were downloaded and compared to visible logs;
  one proved flinch denial with PP retained, the other showed Armor Tail blocking.
  [Receipt](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/pull/253#issuecomment-6081366821).
- Bundle SHA-256: `e564e2a0edf693f7c30e4a0aae30bc3dd90385af3333251f7e75a539cc7cf863`.
- Previous verified release/rollback target: v200, `287c4e4804ab5c82ecee82556d4d363c24d72461`.
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

v201 shipped the first-turn Fake Out fix (#249); see
[scoped evidence](docs/release/FAKE_OUT_FLINCH_2026-10-09.md).
v202 Klutz item candidate is in review, not yet deployed. #235 Lum activation,
#252 Champions-specific late Fake Out/Encore timing, #241 descriptors/aliases
and official approval remain open. Do not infer team strength from these fixes.

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
