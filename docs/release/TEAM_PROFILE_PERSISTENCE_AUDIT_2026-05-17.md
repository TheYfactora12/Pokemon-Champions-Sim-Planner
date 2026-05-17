# Team Profile Persistence Audit - 2026-05-17

Scope:

- free session flow
- local browser persistence
- current Supabase persistence
- replay/team/team-version durability gaps
- safest insertion points for subscriber profile memory

Status:

- audited against `rollback-main`
- this is an architecture plan, not a persistence implementation

## Executive conclusion

The current architecture is professionally salvageable, but persistence is still partial.

What is correct today:

- free mode is mostly session-local or browser-local
- the UI now exposes provenance boundaries instead of pretending all memory is durable
- replay-to-sim comparison is gated by team matching before stronger claims render
- Supabase is fail-soft and optional

What is missing:

- stable subscriber team profiles
- team version history
- replay artifact persistence
- replay-to-team linking
- replay-to-sim comparison persistence
- long-term coaching trend rollups

Main risk:

The app currently has three separate memory classes without a single durable identity layer:

1. session state on `ChampionsSim.state`
2. browser persistence via `Storage`
3. Supabase persistence via `SupabaseAdapter`

That is acceptable for free-mode iteration, but not sufficient for durable coaching claims.

## Current storage architecture

### 1. Session-only runtime state

Primary location:

- [ui.js](/Users/kevinmedeiros/Pokemon-Champions-Sim-Planner-yours/poke-sim/ui.js)

Observed responsibilities:

- current sim scope
- last team run snapshot
- last replay coach analysis
- replay-to-sim comparison gating
- Coach Recommends next-step state

Current behavior:

- good for free flow
- non-durable by design
- should remain non-durable for anonymous/free users unless explicitly promoted

Safe rule:

- do not build longitudinal coaching directly off `ChampionsSim.state`

### 2. Browser-local persistence

Primary locations:

- [storage_adapter.js](/Users/kevinmedeiros/Pokemon-Champions-Sim-Planner-yours/poke-sim/storage_adapter.js)
- [ui.js](/Users/kevinmedeiros/Pokemon-Champions-Sim-Planner-yours/poke-sim/ui.js)

Current browser-local uses:

- custom teams
- preloaded team overrides
- bring-mode persistence
- Strategy report cache
- sim-history continuity

Key implementation seams:

- `Storage.get/set/del/list/clearAll/migrate`
- `_csPersistRead`
- `_csPersistWrite`
- `csSaveReport`
- `csLoadReport`
- `csLoadAllReports`

Assessment:

- appropriate for free local continuity
- not appropriate for subscriber trust, cross-device memory, or privacy-grade replay history

Safe rule:

- browser-local data can cache and speed up views, but must not be treated as the source of truth for paid memory

### 3. Current Supabase persistence

Primary location:

- [supabase_adapter.js](/Users/kevinmedeiros/Pokemon-Champions-Sim-Planner-yours/poke-sim/supabase_adapter.js)

Current persisted entities:

- `teams`
- `team_members`
- `analyses`
- `analysis_win_conditions`
- `analysis_logs`
- `prior_snapshots`
- `rulesets`

Current exported API:

- `loadTeamsFromDB`
- `loadRulesets`
- `saveAnalysis`
- `loadRecentAnalyses`
- `saveTeam`
- `loadAnalysesForPlayer`
- `loadAnalysisLogs`
- `loadPriorSnapshot`

Assessment:

- this is a narrow simulation persistence layer
- it is not yet a coaching profile memory layer
- it does not currently model replay artifacts, team profiles, team versions, or coaching histories

## Current data-class audit

Every new feature should fall into one class only.

| Data class | Current examples | Correct durability |
|---|---|---|
| `session_only` | last replay parse, team run snapshot, recommendation state | memory only |
| `local_cache` | Strategy report cache, custom teams, browser sim history | local browser only |
| `persistable` | normalized replay summary, replay-team match, sim comparison summary | may be promoted to DB |
| `subscriber_persisted` | future team profiles, team versions, replay history, trend rollups | Supabase |
| `community_opt_in` | future aggregate anonymized matchup memory | separate controlled DB path |

## File-level audit and safest insertion points

### [supabase_adapter.js](/Users/kevinmedeiros/Pokemon-Champions-Sim-Planner-yours/poke-sim/supabase_adapter.js)

Current role:

- the only explicit DB gateway

Why this is the safest insertion point:

- DB access is already centralized here
- fail-soft behavior already exists
- UI code already expects adapter availability checks

Recommended additions here:

- `saveTeamProfile`
- `saveTeamVersion`
- `saveReplayArtifact`
- `saveReplayTeamMatch`
- `saveReplaySimComparison`
- `saveCoachingReport`
- `loadTeamProfileHistory`
- `loadReplayHistoryForTeamVersion`
- `loadReplayComparisonsForTeamProfile`

Do not:

- write replay/team persistence directly from random UI functions
- let UI compose raw table writes itself

### [ui.js](/Users/kevinmedeiros/Pokemon-Champions-Sim-Planner-yours/poke-sim/ui.js)

Current role:

- orchestrates session state, browser cache, strategy rendering, replay rendering, and existing DB fire-and-forget saves

Current persistence seams worth preserving:

- `_buildAnalysisPayload`
- `_upsertTeamToDB`
- `csSaveReport`
- `csLoadReport`
- `csBuildSourcesProvenanceModel`
- `csBuildCoachRecommendation`

Safest insertion points:

1. after `csStoreTeamRunSnapshot`
- create a normalized `TeamRunSnapshot` object that can remain session-only in free mode
- later promote only derived summary fields for subscriber persistence

2. after replay analysis is complete in Battle Sensei render flow
- persist normalized replay metadata and derived summary only
- do not silently persist raw logs

3. after replay-team matching is complete
- persist a `ReplayTeamMatch` record only when:
  - profile storage is enabled
  - profile/team version identity is known
  - the match is not `unknown`

4. after `buildSimComparison`
- persist the comparison summary, not the full transient UI object

5. in `Sources`
- keep the provenance card as the truth surface for whether data is local, cached, or durable

Do not:

- store subscriber history in `Storage`
- derive paid trend claims from `csLoadReport` local cache

### [replay_learning.js](/Users/kevinmedeiros/Pokemon-Champions-Sim-Planner-yours/poke-sim/replay_learning.js)

Current role:

- builds normalized replay facts
- builds sim facts
- builds replay-vs-sim comparison
- builds premium teaser policy text

Why this is the correct modeling seam:

- it already holds the derived objects that should become durable
- it separates replay facts from presentation

Safest insertion points:

- persist output of `normalizeShowdownReplayToFacts`
- persist output of `buildSimComparison`
- persist output of `buildLearningReport` as a summarized coaching report

Do not:

- persist the full rendered report HTML
- persist unstable UI-only strings as the primary truth

### [storage_adapter.js](/Users/kevinmedeiros/Pokemon-Champions-Sim-Planner-yours/poke-sim/storage_adapter.js)

Current role:

- browser-local namespace management

Rule going forward:

- keep this for caching and free-mode continuity only
- do not extend it into pseudo-premium memory

## Missing durable identity layer

This is the main architecture gap.

The product needs stable identities for:

- `team_profile_id`
- `team_version_id`
- `replay_artifact_id`
- `replay_team_match_id`
- `replay_sim_comparison_id`
- `coaching_report_id`

Without those IDs, the system cannot safely answer:

- did this edited team improve?
- are these replay trends for the same team version?
- is this comparison same-format and same-ruleset?
- does this user’s saved history actually belong together?

## Recommended database contracts

## Temporary internal account access plan

Before polished signup exists, the team should still test subscriber separation with controlled internal accounts.

Required rule:

- no hardcoded premium bypass in production logic

Recommended temporary setup:

- one anonymous/free local browser user
- one internal free auth account
- one internal premium auth account
- one QA/admin auth account
- one cross-device persistence auth account
- one optional community-opt-in auth account

What these accounts are for:

- verify `user_id` scoping for saved team profiles
- verify replay history stays under the correct team profile
- verify no cross-account leakage
- verify premium-only saved memory remains separate from free local memory
- verify cross-device restore works once minimal auth is added
- verify community sharing remains opt-in

What must be documented separately in team ops notes:

- account email/alias
- intended permission tier
- whether it is safe for QA only or product demo use
- whether community sharing is enabled

Architecture rule:

- subscriber persistence features are not complete until they are tested through authenticated accounts with distinct access tiers

### `team_profiles`

Purpose:

- stable subscriber-level team identity independent of mutable team name

Suggested fields:

- `team_profile_id`
- `user_id`
- `display_name`
- `canonical_format`
- `canonical_ruleset`
- `created_at`
- `updated_at`
- `archived_at`

### `team_versions`

Purpose:

- immutable snapshots of a team over time

Suggested fields:

- `team_version_id`
- `team_profile_id`
- `version_label`
- `fingerprint_hash`
- `format`
- `ruleset_id`
- `team_payload`
- `source`
- `created_at`

### `team_run_snapshots`

Purpose:

- durable record of the exact sim baseline used for later replay comparison

Suggested fields:

- `team_run_snapshot_id`
- `team_version_id`
- `opponent_fingerprint`
- `format`
- `ruleset_id`
- `sim_summary`
- `strategy_summary`
- `created_at`

### `replay_artifacts`

Purpose:

- metadata and normalized replay facts

Suggested fields:

- `replay_artifact_id`
- `user_id`
- `source_type`
- `source_url`
- `format`
- `ruleset_profile`
- `player_fingerprint`
- `opponent_fingerprint`
- `normalized_summary`
- `raw_log_saved`
- `created_at`

Rule:

- default `raw_log_saved = false`

### `replay_team_matches`

Purpose:

- durable team matching evidence

Suggested fields:

- `replay_team_match_id`
- `replay_artifact_id`
- `team_profile_id`
- `team_version_id`
- `match_status`
- `similarity_score`
- `evidence_json`
- `confidence`
- `created_at`

### `replay_sim_comparisons`

Purpose:

- durable Battle Mirror summary

Suggested fields:

- `replay_sim_comparison_id`
- `replay_artifact_id`
- `team_run_snapshot_id`
- `team_version_id`
- `comparison_status`
- `calibration_action`
- `confidence`
- `summary_json`
- `created_at`

### `coaching_reports`

Purpose:

- durable trainer-facing derived report

Suggested fields:

- `coaching_report_id`
- `replay_artifact_id`
- `team_profile_id`
- `team_version_id`
- `report_type`
- `confidence`
- `report_summary`
- `created_at`

### `team_trend_rollups`

Purpose:

- denormalized profile/team trend view for subscriber dashboard reads

Suggested fields:

- `team_profile_id`
- `team_version_id`
- `format`
- `ruleset_id`
- `battle_count`
- `repeat_fingerprints`
- `battle_iq_rollup`
- `matchup_rollup`
- `updated_at`

## Professional boundary rules

These should now be treated as architecture requirements.

1. No raw replay logs are stored by default.
2. Free mode remains session/local unless the user explicitly upgrades into profile memory.
3. Paid memory must be explainable in Sources.
4. Every persisted coaching insight must point to:
- replay artifact
- team version
- format/ruleset
- confidence
- created time
5. Team trends must never be keyed by mutable team name.
6. Browser cache must never masquerade as durable profile history.
7. Community sharing must be opt-in and aggregate-first.

## Recommended implementation order

1. add DB identity contracts in `supabase_adapter.js`
2. add team profile and team version persistence
3. persist replay artifact metadata and normalized replay facts
4. persist replay-team matches
5. persist replay-to-sim comparison summaries
6. persist coaching report summaries
7. build team trend rollups
8. expose subscriber history in Sources and Team Builder profile

## Safest next engineering task

`Team Profile Persistence + Replay History MVP`

Definition:

- no raw log autosave
- save stable `team_profile`
- save immutable `team_version`
- save normalized replay summary
- save replay-team match
- save replay-vs-sim comparison summary
- update Sources to show when a profile-backed path is active

That is the minimum professional persistence layer needed before selling durable coaching memory.
