# Supabase Public Release Guardrails

Last updated: 2026-07-01

This document defines the Supabase safety gates required before broader public testing.

## 1. Legal-only active team catalog

Active rows in Supabase `teams` are runtime/training input. They must exactly match the current approved legal catalog in `poke-sim/data.js`.

Rules:

- Legal repo catalog teams can be active.
- Old, non-legal, superseded, or experiment teams must be retired with `metadata.retired = true`.
- The generated live alignment migration retires stale built-in rows outside the current catalog with `retired_reason = "not_in_current_legal_repo_catalog"`.
- `RUN_LIVE_DB=1 node tests/db_m2_seed_tests.js` must pass before Pages deploys a catalog-changing release.
- `node tests/db_live_catalog_guard_tests.js` must pass so the retirement clause cannot silently disappear.

Why this matters:

- Prevents non-legal teams from appearing in selectors.
- Prevents old rows from poisoning QA artifacts, matchup stats, and future coaching recommendations.
- Keeps Kevin, Alfredo, and live Supabase aligned to one approved catalog contract.

## 2. Source-sync monitoring

Source-truth data can change independently of code. Treat Showdown sync and approved DB generation as release inputs, not background noise.

Required release checks:

- Confirm the latest `Showdown Sync` workflow state before a data/mechanics release.
- If generated approved data changes, commit the generated runtime artifacts with the release.
- Do not trust local runtime data if the generated snapshot date is behind a known source update.
- Keep source registry and source sync status pages clear about what was checked, when, and against which source.

Blocked behavior:

- Do not manually patch generated Showdown runtime files without a source-backed generator path.
- Do not train coaching recommendations from unapproved source rows.

## 3. User/team data separation

Public users will create custom teams and generate private analysis history. That data must not be mixed with approved built-in catalog truth.

Rules before public scale:

- Built-in teams, custom user teams, QA fixtures, and retired historical teams need distinct source/status metadata.
- Coaching/training aggregates must filter by legality status, ruleset id, format, and catalog/source status.
- User-specific saved-team analysis must stay scoped to that user/profile unless explicit shared-learning consent exists.
- Shared learning rows must store enough metadata to avoid cross-regulation contamination.
- Retired or illegal teams must not contribute to public recommendation baselines.

Minimum metadata for future learning rows:

- `ruleset_id`
- `format`
- `team_source`
- `legality_status`
- `catalog_status`
- `build_version`
- `source_snapshot_id`
- `user_scope` or equivalent privacy boundary

## 3b. Trainer rooms and future learning boundary

Future personal coaching, uploaded battle review, and bot practice should be built around a trainer-owned workspace, not around shared global tables.

Current foundation:

- `trainer_profiles`, `trainer_rooms`, and `trainer_room_teams` are the first private workspace tables.
- The first migration is owner-scoped through Supabase Auth RLS.
- Public read is disabled by default, including for future `public_showcase` rows, until a separate API/filtering slice protects hidden team details.
- Room teams can reference Team Lab teams, but Team Lab hidden details remain protected by Team Lab policies and API response filtering.

Required direction:

- Add a trainer/profile layer before public account features.
- Store a private trainer room for saved teams, uploaded replays, sim jobs, coaching facts, and practice drills.
- Keep real replay imports private until parser status, team mapping, regulation, format, and source gaps are reviewed.
- Let players explicitly choose whether anonymized signals can contribute to global learning.
- Store global learning as aggregate signals, not raw private teams, raw private replays, or hidden tech choices.
- Require `regulation_id`, `format`, `engine_version`, `ruleset_version`, source status, sample size, and stale status on every promoted learning row.
- Future bot-play sessions must store bot version, policy version, board states, actions, and evidence summaries so bad advice can be audited after engine/rules updates.

Blocked behavior:

- Do not train global recommendations directly from browser anon writes.
- Do not use private trainer data in public rankings without consent, verified mapping, legality status, and trusted-worker promotion.
- Do not let bot memory learn from rows with unresolved source gaps as if they were real-game truth.

See `docs/DB_ARCHITECTURE_GROWTH_AUDIT_2026-07-01.md` for the target schema and `docs/DB_ARCHITECTURE_STRESS_TEST_PLAN_2026-07-01.md` for the challenged slice order.

## 4. Public release gate

Before inviting broad testers:

- Main CI passes.
- GitHub Pages deploy passes.
- Live DB catalog parity passes.
- Battle audit passes.
- Source sync status is reviewed.
- Security/privacy assumptions for saved teams and analysis history are documented.
