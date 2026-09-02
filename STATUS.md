# Project Status

> Current evidence only. Direction and acceptance gates live in [ROADMAP.md](ROADMAP.md); dated reports preserve historical proof.

Review how changes improved the project in [the improvement log](docs/IMPROVEMENT_LOG.md). Its recorded history does not replace current gates or imply that local changes are deployed.

## Local Candidate

- Branch: `audit/project-open-items-2026-07-05`; dirty worktree preserved. Cached `origin/main` comparison after PR #193: 9 commits ahead, 4 behind.
- Current candidate: `v2.2.141-tailwind-stage-proof`; engine `1.1.4`. Final local bundle: 11,460,764 bytes, SHA-256 `30de68bb9212981ba340d31a60768439e77e952f28818075db7c31a3e782053b`. No deployment is claimed.
- Full project gate after final Tailwind/Growl/Leer release corrections: 153 fast files and 12 offline/mock DB files passed. Battle audit: 44 deterministic files, three golden traces and 4,500 completed headless battles, zero execution errors. M9 retains eight local passes and three administrative checks not verified. Live DB permissions were not exercised.
- [Tailwind/Growl/Leer validation](poke-sim/reports/tailwind_growl_leer_validation_2026-09-01.md): 25 focused checks and all five declared pinned probes agree in bounded synthetic doubles scope. Two independent adversarial review passes closed live priority, reflection, accuracy/Substitute and selected ability/item boundary mismatches. Coverage remains partial; complete games, browser parity, broader interactions and official Champions proof remain open.
- [Seismic Toss validation](poke-sim/reports/seismic_toss_validation_2026-08-30.md): 20 focused groups pass, including ten pinned side-swapped doubles probes for ordinary damage, Ghost, Protect, Unseen Fist and Parental Bond. Independent reviewer confirmed 18 additional probes and closed its scoped finding. Coverage remains partial. Local v140 header/roadmap loaded without captured console errors; no browser battle or production save was performed.
- [Player trust and journey audit](docs/release/PLAYER_TRUST_AND_JOURNEY_AUDIT_2026-08-30.md): inspected all 11 public sections and bounded desktop/mobile journeys; 4,500 headless battles completed without execution errors, but three pinned mechanics disagreements remain. Local replay guard rejects absent/malformed observations, clears stale review actions/status and preserves original HTML provenance. Local browser positive/negative checks passed. Public Strategy counts/coaching, roster trust labels, stale source/roadmap text and navigation friction remain open. Zero browser simulation batches or paired exported games were produced in this audit.
- [Site quick wins](docs/release/SITE_QUICK_WINS_2026-08-30.md): homepage destination focus, direct editor routing, removal of canned replay advice, native roadmap disclosure markers and only the first blocker expanded. Desktop and 390px iframe checks passed in their stated scope; the full beginner, physical-device and screen-reader audits remain open. Independent scoped release review found no actionable issue.
- [First intake diagnostic fix](poke-sim/reports/showdown_intake_diagnosis_2026-08-30.md): unsupported inputs no longer become top-level reference rejections; 18/18 reference contracts pass. Fresh pinned probes still report 2 scoped agreements, 3 mechanics mismatches and zero completed games. Corrected the old explanation of unsupported catalog inputs; no team/learnset data changed.
- [Explicit reference intake and learnset audit](poke-sim/reports/reference_intake_policy_2026-08-30.md): strict defaults preserved; opt-in level/provenance normalization, original/canonical hashes, structured reasons and separate reference-error counters implemented. Seven new intake/audit tests plus 18 reference checks pass. Per pinned format, 1,517 direct rows yield 995 equal, 232 review-required and 290 unresolved; this is not official eligibility or DB alignment.
- Shared roadmap source: [project-roadmap.json](poke-sim/source/project-roadmap.json). It generates both this repo's [ROADMAP.md](ROADMAP.md) and the local browser Roadmap data. Stable roadmap IDs are not GitHub milestone numbers.
- Browser evidence links target GitHub main; local candidate documents may not be published there yet. Current Markdown/evidence paths were checked locally, not proven deployed.
- [Consolidation audit](docs/release/ROADMAP_CONSOLIDATION_2026-08-30.md): removed stale active percentage scores and monetization-first blockers, merged overlapping plans, and preserved historical notes.

## Remote Evidence

- Narrow clean-main site fixes merged through [PR #193](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/pull/193) after green hosted checks on candidate `6fe9cd1`; merge commit `4f2cb179265d647706f4a1749c47d85e3e707043`. Pages run `33344630879` succeeded. Public v138 bytes/hash and all three homepage button destinations/focus were verified. This is not the full audit worktree or Node-only normalization deployment. See [publication evidence](docs/release/SITE_NAVIGATION_PUBLISH_2026-08-30.md).

- [August 30 live GitHub reconciliation](docs/release/GITHUB_QUEUE_RECONCILIATION_2026-08-30.md): canonical repo has 69 open issues, 17 open milestones and 2 open PRs; Alfredo has 56, 15 and 4 respectively.
- 54 matching-title cross-repo issue pairs are reconciliation candidates, not proven duplicate acceptance contracts. No issue/milestone was closed.
- Remote main commit identities differ; repo, deployment and DB 1:1 alignment are not established. Canonical branch API reports unprotected; full environment/ruleset verification remains open.
- Current Pages evidence (August 30 EDT / August 31 UTC): deployed `v2.2.138-site-navigation-fixes`, 11,293,894 bytes, SHA-256 `078fff650a4ef2fe154d1b50e09534f031de3232e48a464e6c3c947136cffa1a`. Deployed manifest matches downloaded bytes and identifies the reviewed repository artifact. Earlier v131 evidence remains historical.
- August 29 public Supabase audit: 8,653 approved Showdown rows, 36 teams / 204 members / 34 complete teams, zero active Champions overrides. Public connectivity does not prove applied private schema, migrations, persistence or safe writer permissions.

## Active Gates

Immediate priority: [Supabase public-launch security gate](docs/release/SUPABASE_PUBLIC_LAUNCH_GATE_2026-08-30.md). Database source defects and unavailable live administrative proof block public-use approval. Verification tooling is local only; no production security change is claimed.

| Gate | Local evidence | Still open |
|---|---|---|
| Simulation and replay | [Identity/bring-four fixes](poke-sim/reports/identity_validation_2026-08-30.md), [Seismic Toss proof](poke-sim/reports/seismic_toss_validation_2026-08-30.md), [Tailwind/Growl/Leer proof](poke-sim/reports/tailwind_growl_leer_validation_2026-09-01.md), [paired replay audit](poke-sim/reports/visual_replay_audit_2026-08-30.md) | Team translation; complete-game and visible action/Tailwind parity; broader fixed-damage, timing and stage interactions; Strategy-cache context and misleading coaching; broader mechanics coverage |
| Regulations and sources | [Watcher/staging safeguards](docs/release/REGULATION_WATCH_2026-08-30.md): 35 watcher tests, 39 staging checks, 10 legacy approval checks | M-A/M-B remain unverified. Latest source run captured 7/31 sources; 24 unavailable, 22 required. Hosted activation, evidence keys, complete eligibility and atomic human approval/publication remain open |
| Database and evidence | [DB audit](docs/release/SUPABASE_FULL_AUDIT_2026-08-29.md), [cleanup](docs/release/PROJECT_CLEANUP_AUDIT_2026-08-30.md), private staging migration prepared | Schema/bootstrap reconciliation, exact approved migrations, live RLS/grants, roster pagination, complete-snapshot retention, trusted private writers |
| Release and repo alignment | Local manifest/cache, test gate and Pages asset checks exist | Reconcile incoming changes, dependency/install-policy review, protected main/environments, hosted CI, reviewed deploy, rollback and parity proof |
| News/reference catalog | [Curated feed](docs/release/HOMEPAGE_NEWS_REFRESH_2026-08-30.md), [13 Worlds review-only teams](poke-sim/reports/worlds_top_cut_validation_2026-08-30.md) | Hosted refresh/deployment proof, full replay coverage, private stat points and approved regulation mapping |

Current competitive product scope is **doubles only**. Singles fixtures are shared-mechanics regressions. No verified 99% game-accuracy claim follows from passing tests.

## Next Task

Next: obtain authorized Supabase administrative readback, reconcile applied RLS/grants/migrations, then run two-user and anonymous-denial tests in an isolated staging project. Security verification takes priority over homepage redesign. In the mechanics lane, extend complete-game/visible-replay parity, then cover broader mid-turn Speed/stage interactions, PP/Pressure and residual ordering. Also review direct-row learnset discrepancies and unresolved form/IV support. Keep unverified regulations blocked and do not promote production data from this local branch.

Preliminary agent walkthrough is recorded in the player-trust audit. The full [beginner homepage/navigation study](ROADMAP.md#beginner-experience) and its [checklist](docs/strategy/BEGINNER_HOMEPAGE_AUDIT_PLAN.md) remain queued after simulation readiness. Neither roadmap consolidation nor an agent walkthrough proves A+ usability. Evidence-backed Brain expansion follows trusted simulation/evidence; optional LLM, social, premium and broader product ideas remain deferred.

## History

The [previous status snapshot](docs/archive/STATUS_PRE_CONSOLIDATION_2026-08-30.md) retains earlier builds, test counts and dated observations. Historical reports do not override current gates. Use [AGENTS.md](AGENTS.md) for policy and fully qualified GitHub references for issue actions.
