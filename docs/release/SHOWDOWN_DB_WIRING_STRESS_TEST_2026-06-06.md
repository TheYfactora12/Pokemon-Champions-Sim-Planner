# Showdown DB Wiring Stress Test - 2026-06-06

## Team Summary

Showdown data sync is partially wired.

What works today:

- The repo can fetch current Pokemon Showdown data from `https://play.pokemonshowdown.com/data/`.
- The sync tool normalizes Showdown files into deterministic local JSON artifacts.
- The app uses generated/static Showdown-derived data for legality and local validation.
- The GitHub Actions sync workflow can dry-run normalized DB rows and can write unapproved or approved rows when service-role credentials are present.
- The browser Overview tab has an anon-read-only Showdown DB inspector for approved rows, source hashes, and latest sync status.
- The battle engine prefers generated Showdown species stats/types before local fallback tables.
- GitHub Pages has Supabase runtime config wiring through `local-credentials.js` / injected bundle globals.
- Live Supabase reads work for current app tables such as teams, team members, analyses, and analysis logs.

What is not wired yet:

- Live Supabase writes are intentionally blocked until `SUPABASE_SERVICE_ROLE_KEY` is added and the target schema/views exist.
- Live Supabase does not currently expose the planned Showdown sync/audit/entity tables in this environment.
- The browser can inspect approved Showdown entity views when they exist, but the production app bundle is still generated from checked-in static data.
- Champions override rows are planned, but not live.

## How The Connection Is Supposed To Work

```text
Pokemon Showdown data CDN
  pokedex.js, moves.js, abilities.js, items.js,
  typechart.js, aliases.js, learnsets.js, formats-data.js
        |
        v
tools/fetch_showdown_data.mjs
  fetch raw source files
  hash every source
  parse Showdown exports
  normalize species/moves/items/abilities/etc.
  produce validation findings and entity diffs
        |
        v
Current output today
  poke-sim/artifacts/showdown-sync/
  generated/static JS validation inputs
        |
        v
Planned Supabase layer
  showdown_sync_runs
  showdown_source_files
  showdown_entities
  showdown_entity_diffs
  mechanics_validation_runs
  mechanics_validation_findings
  champions_overrides
  approved_showdown_entities
  approved_champions_data
        |
        v
Generated app assets
  deterministic JS bundle for GitHub Pages/offline PWA
```

## Current Stress Test Results

### Showdown Fetch And Normalize

Command:

```bash
cd poke-sim
npm run showdown:sync
```

Result:

```text
Showdown sync passed: 8/8 source(s) fetched.
Mapped entities:
  abilities=318
  aliases=2543
  formats=1429
  items=583
  learnsets=1288
  moves=954
  species=1517
  typechart=19
Entity diff: +8651 -0 ~0 (no previous baseline)
Mapping validation findings: 0
```

The generated stress-test artifacts are ignored by git under `poke-sim/artifacts/`.

### Local Turn-Log Proof

Four browser-exported turn logs were inspected after the runtime bridge was added. They showed complete roster snapshots, legal-option lists, speed order, weather/field state, and outcomes with no `NaN`, `undefined`, missing species, malformed HP, or runtime error strings. Every logged species resolved to generated Showdown species rows.

That inspection caught one stale local fallback row: Farigiraf was still `120/90/70/90/90/60` while Showdown has `120/90/70/110/70/60`. The fallback row is now corrected, and `showdown_runtime_data_tests.js` includes a regression check so Farigiraf cannot silently drift if generated Showdown data is unavailable.

### Live Supabase Runtime Config

Checked deployed GitHub Pages:

```text
https://theyfactora12.github.io/Pokemon-Champions-Sim-Planner/poke-sim/pokemon-champion-2026.html
```

Findings:

- `local-credentials.js` is served.
- A JWT-shaped anon key is present in the Pages artifact.
- The probe did not print or store the key.

### Live Supabase Table Probe

Readable through anon REST:

```text
teams: READ 200
team_members: READ 200
analyses: READ 200
analysis_logs: READ 200
```

Not present or not exposed through anon REST:

```text
showdown_sync_runs: 404
showdown_source_files: 404
mechanics_validation_runs: 404
mechanics_validation_findings: 404
showdown_entities: 404
showdown_entity_diffs: 404
champions_overrides: 404
approved_showdown_entities: 404
approved_champions_data: 404
```

Interpretation:

- Supabase is wired for the current app database layer.
- The Showdown mirror database layer is not live yet.
- The existing migration file creates the first sync/audit tables, but it has not been applied to the live database or the schema cache does not expose those tables yet.

## Existing Repo Pieces

Already present:

- `poke-sim/tools/showdown_sources.json`
- `poke-sim/tools/fetch_showdown_data.mjs`
- `poke-sim/db/migrations/2026_06_06_showdown_sync_audit_tables.sql`
- `.github/workflows/showdown-sync.yml`
- `.github/workflows/db-migrate.yml`
- `.github/workflows/pages.yml`
- `poke-sim/docs/SHOWDOWN_SYNC_ARCHITECTURE.md`
- `poke-sim/docs/SHOWDOWN_DB_SOURCE_OF_TRUTH_PLAN.md`
- `poke-sim/tests/showdown_priority_drift_tests.js`

Still missing:

- Live execution of the DB write path with Supabase service-role credentials.
- live application of the staged `showdown_entities` / `showdown_entity_diffs` / `champions_overrides` migration.
- live approved read views for app consumption.
- production generation from approved DB views to deterministic JS.
- release gate that fails when high-severity Showdown drift is unresolved.

## Recommended Next Implementation Steps

1. Apply `2026_06_06_showdown_sync_audit_tables.sql` through the `db-migrate.yml` workflow.
2. Verify anon REST can read:
   - `showdown_sync_runs`
   - `showdown_source_files`
   - `mechanics_validation_runs`
   - `mechanics_validation_findings`
3. Apply the staged second migration:
   - `showdown_entities`
   - `showdown_entity_diffs`
   - `champions_overrides`
   - `approved_showdown_entities`
   - `approved_champions_data`
4. Run `tools/write_showdown_data_to_db.mjs` after `tools/fetch_showdown_data.mjs` from trusted CI/local admin only.
5. Keep default sync behavior as detect/report, not auto-approve.
6. Promote generated DB fixtures into the live views and run `tools/generate-approved-data-from-db.mjs` against Supabase.
7. Add live smoke proving anon users can read approved rows but cannot mutate sync/entity/override rows.
8. Migrate static JS data gradually:
   - priority
   - move type/category/base power/targets
   - species stats/types
   - items and abilities
9. Add Showdown oracle smoke tests for behavior that static rows cannot prove.

## Close Rule

Do not mark the Showdown DB mirror as complete until all are true:

- live DB exposes the sync/audit/entity/override tables or approved views
- sync job writes run/source/entity rows with server-side credentials
- app assets can be generated from approved DB views
- CI blocks unresolved high-severity drift
- Champions-specific deltas are represented as override rows with tests
