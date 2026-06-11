# Showdown DB Runtime Handoff - 2026-06-10

## Audience

This note is for Josh, Alfredo, and reviewers validating the Showdown-to-Supabase work before merge.

## Summary

The branch wires a safer Showdown data pipeline without exposing write credentials to the browser. The app can keep using generated static data locally/GitHub Pages, while GitHub Actions can prepare and, once secrets/schema exist, write normalized Showdown rows into Supabase for review and approval.

## What Changed

### GitHub Actions

- `.github/workflows/showdown-sync.yml` now supports manual inputs:
  - `write_db=true|false`
  - `approve=true|false`
- The workflow always runs a DB dry-run after fetching Showdown data.
- Scheduled/manual runs can write unapproved rows when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` exist.
- Manual approved promotion requires `approve=true`.

### Supabase Write Path

- Added `poke-sim/tools/write_showdown_data_to_db.mjs`.
- The writer converts `artifacts/showdown-sync` output into rows for:
  - `showdown_sync_runs`
  - `showdown_source_files`
  - `showdown_entities`
  - `showdown_entity_diffs`
- Default mode writes unapproved entity rows.
- `--approve` marks rows approved.
- `--dry-run --json` reports row counts without credentials.
- Real write mode requires a service-role style secret and refuses browser/anon keys.

### Browser Read Path

- `poke-sim/supabase_adapter.js` adds read-only Showdown DB status/snapshot helpers.
- The Overview tab now shows a `Showdown DB` status and an `Inspect` action.
- The inspector reads only approved/audit rows through the existing anon Supabase client.
- Browser code does not upload Showdown rows, approve rows, or receive service-role credentials.

### Runtime Data Use

- `poke-sim/engine.js` now prefers generated Showdown species stats/types at battle construction.
- Local `BASE_STATS`/`POKEMON_TYPES_DB` now only backfill unknown, custom, partial, or Champions-specific rows.
- Role classification also reads generated Showdown species stats before local fallback stats.
- `Floette (Eternal Flower)` alias handling was added.
- `Farigiraf` local fallback was corrected from `120/90/70/90/90/60` to Showdown's `120/90/70/110/70/60`.

### Import/Upload Validation

- Imported Showdown teams now run team-rule validation plus generated Showdown move/species checks.
- Import preview displays per-Pokemon checked/warning/unchecked indicators.
- Imported teams store:
  - `legality_status`
  - `import_warnings`
  - `import_errors`
  - `showdown_source_version`
- Hard team-rule failures are marked `illegal`.
- Valid-but-unreviewed imports stay `unverified`.

### Move Legality

- `move_legality.js` now includes Eternal Flower Floette aliases.
- Generated Showdown learnsets remain the source for imported move validation.

### Docs

- `poke-sim/docs/SHOWDOWN_DB_SOURCE_OF_TRUTH_PLAN.md` now documents the species runtime bridge.
- `docs/release/SHOWDOWN_DB_WIRING_STRESS_TEST_2026-06-06.md` now documents:
  - current wired state
  - service-role/schema deployment blocker
  - local turn-log proof
  - Farigiraf correction

## Local Browser Log Validation

Four exported turn logs from the local Safari test session were inspected:

- `champions-turn-log-853770823,3103965755,3779031758,1225518949.json`
- `champions-turn-log-4247554031,367900036,4023428483,371554437.json`
- `champions-turn-log-3888307568,3205294824,2401274428,1145539379.json`
- `champions-turn-log-871113960,1481677647,3262231625,3228343271.json`

Findings:

- Logs contained full roster snapshots, legal options, speed order, field state, and outcomes.
- No `NaN`, `undefined`, malformed HP, missing species, fallback error, or runtime error strings were found.
- Every logged species resolved to generated Showdown species data.
- Mega rows showed expected base-form and Mega-form snapshots because Mega sets enter battle in base form with the stone and evolve during battle.
- Farigiraf exposed a stale local fallback row, which is now corrected and covered by regression tests.

## Full Local Stat Drift Audit

After the Farigiraf finding, every local `BASE_STATS` row that maps to a complete generated Showdown species row was audited. Three additional non-Mega fallback drifts were found and corrected:

- Orthworm: Speed `40` -> `65`
- Cresselia: Defense/Special Defense `120/130` -> `110/120`
- Aegislash: Defense/Special Defense `150/150` -> `140/140`

Rows intentionally not treated as drift:

- `Vivillon-Continental` because the generated row is partial and local Vivillon stats are the current fallback.
- `Floette (Eternal Flower)-Mega` because it is a Champions custom Mega override.

`showdown_runtime_data_tests.js` now audits complete local fallback rows against generated Showdown species data so this class of drift is caught automatically.

## Security Notes

- Service-role credentials are used only by Node/GitHub Actions write paths.
- Browser code only uses anon-role reads.
- The Overview inspector is read-only.
- Scheduled writes skip unless `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured.
- Approved writes require a manual workflow run with `approve=true`.
- The Showdown migrations explicitly revoke `INSERT`, `UPDATE`, and `DELETE` from `anon` and `authenticated`.
- Public DB reads are limited by RLS to sync status/source metadata, approved Showdown entities, and active Champions overrides.
- `showdown_entity_diffs` is intentionally not granted to public roles; use service-role/Postgres access for review queues.
- The daily Showdown workflow now checks `change_summary.json` first and skips Supabase writes when there are no entity changes.

## DB Audit Notes

The live write failure on the first unapproved GitHub workflow run was expected for an unapplied schema:

```text
showdown_sync_runs upsert failed: HTTP 404 Not Found
Could not find the table 'public.showdown_sync_runs' in the schema cache
```

Apply migrations in this order:

1. `2026_06_06_showdown_sync_audit_tables.sql`
2. `2026_06_07_showdown_entities_approved_views.sql`

Live application evidence:

- Migration 1 passed in Kevin fork workflow run `27320360061`.
- Migration 2 passed in Kevin fork workflow run `27320378355`.
- First post-migration write found a stricter `source_hash` check issue for ability rows because fetch artifacts store hashes by plural collection (`abilities`) while the writer looked up singular kind (`ability`).
- Writer fix: `write_showdown_data_to_db.mjs` now accepts both singular kind and plural collection hash maps.
- Retry run `27320634819` passed and wrote unapproved rows:
  - `showdown_sync_runs`: `1`
  - `showdown_source_files`: `8`
  - `showdown_entities`: `8651`
  - `showdown_entity_diffs`: `0`
- The approved promotion step remained skipped because `approve=false`.

Design constraints reviewed before applying to live Supabase:

- The DB is append-only by sync run for auditability: each run stores source files, entity rows, and changed/added/removed diffs.
- Current dry-run size is `8651` entity rows and `1536` diff rows per Showdown pull.
- Weekly unapproved pulls are reasonable for this project size; daily approved full snapshots should be avoided unless retention/pruning is added.
- The scheduled job is now change-aware, so no-op days only validate and refresh the hash baseline.
- Approved runtime reads use `approved_showdown_entities`, which picks the latest approved row per `entity_kind/entity_key`.
- New indexes cover the Overview latest-run query and the approved latest-entity view.
- Non-empty checks prevent blank IDs, keys, display names, source hashes, and override reasons from entering the mirror layer.

Recommended operating model:

- Run scheduled syncs weekly and write unapproved rows.
- Review diffs before running any approved promotion.
- Keep at least the latest approved snapshot and recent unapproved evidence.
- If cadence increases beyond weekly, add a retention job for old unapproved sync runs before enabling the schedule.

## Validation Run

Commands run locally:

```bash
python3 poke-sim/tools/build-bundle.py
git diff --check
node poke-sim/tests/showdown_runtime_data_tests.js
node poke-sim/tests/showdown_approved_data_generator_tests.js
node poke-sim/tests/t9j13_tests.js
npm run test:fast
```

Results:

- Bundle rebuilt: `poke-sim/pokemon-champion-2026.html`
- `git diff --check`: passed
- `showdown_runtime_data_tests.js`: `6 pass, 0 fail`
- `showdown_approved_data_generator_tests.js`: DB hardening/generator contract suite
- `t9j13_tests.js`: `47 pass, 0 fail`
- `npm run test:fast`: `83` non-DB test files passed, `14` skipped, `0` failures

Showdown writer dry-run previously produced:

- `8` source files
- `8651` entities
- `1536` diffs
- entity breakdown:
  - species `1517`
  - moves `954`
  - abilities `318`
  - items `583`
  - typechart `19`
  - aliases `2543`
  - learnsets `1288`
  - formats `1429`

## Remaining Deployment Work

Before live DB sync is considered complete:

1. Apply the Showdown DB schema/views in Supabase.
2. Add `SUPABASE_SERVICE_ROLE_KEY` to GitHub secrets.
3. Run the GitHub workflow in dry-run mode.
4. Run unapproved write mode and inspect rows.
5. Approve rows only after review.
6. Confirm the Overview inspector shows approved DB data.
7. Run a fresh browser sim/export and verify the turn log still resolves species and stats against Showdown.

## Reviewer Focus

- Confirm no service-role key can reach browser code.
- Confirm imported teams receive warnings/errors without blocking safe local testing.
- Confirm generated Showdown species stats/types are used before local fallback rows.
- Confirm the DB writer refuses real writes without service-role credentials.
- Confirm the workflow approval gate matches the intended release process.
