# Sim And DB Snapshot - 2026-06-19

Audience: Josh and reviewers who need one current picture of what the simulator, data layer, and DB actually contain on the active Showdown DB review branch.

## Branch Snapshot

- Repo: `TheYfactora12/Pokemon-Champions-Sim-Planner`
- Upstream mirror: `alfredocox/Pokemon-Champions-Sim-Planner`
- Branch: `feature/showdown-db-writer`
- Commit: `f03b407e6a4b3853c6b202890f8d245f8488a45e`
- This is not the same thing as GitHub Pages on `main`.

## What Data Ships In The Current Branch

### Curated local app data in `poke-sim/data.js`

- `BASE_STATS`: 85 rows
  - Used as local fallback stats for shipped teams, custom forms, and Champions-specific gaps.
- `POKEMON_TYPES_DB`: 728 rows
  - Used for broader type coverage and fallback species resolution.
- `TEAMS`: 29 entries
  - Current curated team catalog used by the app before any DB merge.

Representative team keys in the shipped catalog include:

- `player`
- `mega_altaria`
- `mega_dragonite`
- `champions_arena_1st`
- `chuppa_balance`
- `rain_offense`
- `fire_ice_fullroom`
- `zardx_snow_setup`

### Generated Showdown runtime data in `poke-sim/generated/pokemon_showdown_legal_data.js`

- species rows: 1521
- move rows: 843
- current committed artifact does not populate item, ability, or alias mirrors yet

This generated artifact is what the runtime currently prefers for supported Showdown-derived species stats, types, move legality, move metadata, and related import checks.

## Runtime Logic Order

The current branch is not purely hand-authored local data anymore, but it is also not fully DB-driven yet.

Runtime precedence today:

1. `ChampionsSim.pokemonDataAudit` generated Showdown data
2. local fallback tables in `data.js`
3. Champions-specific custom rows and branch logic where Showdown does not cover the case

Concrete code paths:

- `poke-sim/engine.js`
  - `_showdownMoveRow(...)`
  - `_showdownSpeciesRow(...)`
  - `_showdownSpeciesBase(...)`
- `poke-sim/move_legality.js`
  - generated Showdown learnsets drive imported move legality checks
- `poke-sim/move_support.js`
  - generated audit rows support runtime move coverage logic
- `poke-sim/replay_coach.js`
  - still reads local fallback data and generated audit rows for replay-derived reasoning

## What The Branch Does Not Have

These are important because earlier issue comments can make it sound like they already exist everywhere:

- no `TeamRunSnapshot` implementation on `feature/showdown-db-writer`
- no `TeamFingerprint` implementation on `feature/showdown-db-writer`
- no `ReplayTeamMatch` implementation on `feature/showdown-db-writer`
- no shipped Coach Recommends UX contract on `feature/showdown-db-writer`

The current branch does contain a pause note in `poke-sim/ui.js` saying Coach Recommends and replay-derived claims stay gated behind mechanics proof, Showdown data, overrides, and strict logs.

## DB Surface In Scope

### Core schema in `poke-sim/db/schema_v1.sql`

Eight base tables exist in the core app schema:

- `rulesets`
- `teams`
- `team_members`
- `prior_snapshots`
- `golden_battles`
- `analyses`
- `analysis_win_conditions`
- `analysis_logs`

### Showdown sync and approval layer

The repo also contains the Showdown review pipeline described in the DB docs and migrations:

- `showdown_sync_runs`
- `showdown_source_files`
- `showdown_entities`
- `showdown_entity_diffs`
- `champions_overrides`
- `approved_showdown_entities` view
- `approved_champions_data` view

Current branch posture:

- browser path is read-only through anon-safe access
- write path lives in Node/GitHub Actions tooling
- approved DB rows are not yet the final public bundle source on this branch

## How Teams And DB Interact Today

- The app boots with the 29-team local `TEAMS` catalog.
- If Supabase browser credentials are present, `poke-sim/supabase_adapter.js` can read DB teams and analysis history.
- The adapter is intentionally optional. Missing credentials fall back to local-only behavior.
- Browser credentials use `window.__SUPABASE_URL__` and `window.__SUPABASE_KEY__`.
- Node/live DB tests use `.env.local`.

## Review Targets For Josh

Use this split so evidence stays clean:

- Pokemon workbook review:
  - `poke-sim/reports/pokemon_data_audit.xlsx`
  - `poke-sim/reports/pokemon_data_audit.csv`
- Current branch data/runtime review:
  - `feature/showdown-db-writer`
  - exact branch preview or local file, not GitHub Pages on `main`
- DB setup and source-of-truth review:
  - `poke-sim/db/README_DB.md`
  - `poke-sim/docs/SHOWDOWN_DB_SOURCE_OF_TRUTH_PLAN.md`

## What This Snapshot Is For

Use this document when someone asks:

- what data the sim currently uses
- whether stats/types come from local tables or generated Showdown rows
- how many curated teams are currently in the app
- what lives in the DB versus what still lives in static files
- whether replay matching or Coach Recommends are already on this branch

For handoff formatting, pair this with `docs/release/QA_ENVIRONMENT_HANDOFF_RULES_2026-06-19.md`.
