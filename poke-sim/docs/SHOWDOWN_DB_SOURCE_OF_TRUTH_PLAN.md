# Showdown DB Source Of Truth Plan

> Goal: make Pokemon Showdown mirrored rows the canonical static data source, then layer Champions-specific overrides on top before generating app assets.

## Why This Plan Exists

The app currently has useful static data in `data.js`, generated Showdown legal data in `generated/pokemon_showdown_legal_data.js`, and local engine tables for mechanics such as priority. That works, but it creates drift risk:

- Showdown can update move/species/item/ability data.
- Champions can intentionally differ from Showdown.
- Hand-maintained JS tables can silently fall out of sync.

The target model is:

```text
Pokemon Showdown upstream
  -> raw source snapshots
  -> normalized showdown entity rows
  -> reviewed/approved app data views
  -> Champions override rows
  -> generated JS bundle + local engine drift tests
```

The browser may still receive generated JS for offline GitHub Pages support. The database becomes the source of truth, not the hand-authored JS tables.

## Current Runtime Bridge

As of 2026-06-06, the battle engine treats generated Pokemon Showdown move rows as the primary metadata layer for imported/custom moves. Move type, category, base power, accuracy, priority, target, and contact flags read from `generated/pokemon_showdown_legal_data.js` first when a row exists; local JS tables remain as a fallback for Champions-only/custom gaps until Supabase approved views are live.

Damage-based recoil is now resolved from Showdown-compatible recoil metadata when present, with a checked local bridge table for the current generated file. This covers common imported recoil moves such as Brave Bird, Double-Edge, Wild Charge, Volt Tackle, Wood Hammer, Take Down, Submission, Head Charge, Head Smash, Flare Blitz, Wave Crash, and Light of Ruin.

This is not the final DB state. As of 2026-06-07, the repo has a migration candidate for `showdown_entities`, `showdown_entity_diffs`, `champions_overrides`, `approved_showdown_entities`, and `approved_champions_data`, plus a deterministic approved-data generator. The live Supabase project still needs the migration applied before approved DB rows can become the reviewed generation source.

## Source Boundaries

### Mirror Showdown 1:1

These should be stored exactly as normalized Showdown-derived rows:

- moves: `priority`, `target`, `flags`, `type`, `category`, `basePower`, `accuracy`, `pp`, `status`, `volatileStatus`, `sideCondition`, `slotCondition`, `pseudoWeather`, `boosts`, `secondary`, `secondaries`, `self`, `drain`, `recoil`, `multihit`, `critRatio`, `selfSwitch`
- species/forms: names, ids, base species, formes, required items, types, base stats, abilities, aliases, learnsets
- items: ids, names, fling data, berry flags, mega stone fields, descriptions
- abilities: ids, names, ratings, descriptions, nonstandard flags
- type chart and format metadata

### Keep Champions Overrides Separate

These should be explicit override rows with source notes and tests:

- Champions damage roll range
- Champions status nerfs
- Champions Mega forms and custom abilities
- Champions-specific ability/item behavior
- Champions-specific Protect, terrain, priority, or timing deltas
- local tournament/team metadata not present upstream

Never edit mirrored Showdown rows to "look like Champions." Apply overrides in a separate layer.

## Database Phases

### Phase 0 - Current State

Already present:

- `showdown_sync_runs`
- `showdown_source_files`
- `mechanics_validation_runs`
- `mechanics_validation_findings`
- migration candidate `db/migrations/2026_06_07_showdown_entities_approved_views.sql`
- `tools/fetch_showdown_data.mjs`
- `tools/generate-approved-data-from-db.mjs`
- `tests/showdown_priority_drift_tests.js`
- `tests/showdown_approved_data_generator_tests.js`

Gap:

- migration has not been applied to live Supabase yet
- fetch output is not yet promoted into `showdown_entities`
- approved read views are not yet the production generation source

### Phase 1 - Add Entity And Override Tables

Migration target:

- `showdown_entities`
- `showdown_entity_diffs`
- `champions_overrides`
- `approved_showdown_entities` view
- `approved_champions_data` view

Repo status:

- `db/migrations/2026_06_07_showdown_entities_approved_views.sql` creates the target objects.
- Anon reads are limited by RLS to `approved = true` entities and `status = 'active'` overrides.
- No anon INSERT/UPDATE/DELETE policy is granted for mirror, diff, or override rows.

Recommended table shape:

```sql
showdown_entities (
  entity_id TEXT PRIMARY KEY,
  sync_run_id TEXT REFERENCES showdown_sync_runs(sync_run_id),
  entity_kind TEXT NOT NULL,
  entity_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  source_hash TEXT NOT NULL,
  data JSONB NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sync_run_id, entity_kind, entity_key)
)
```

```sql
champions_overrides (
  override_id TEXT PRIMARY KEY,
  entity_kind TEXT NOT NULL,
  entity_key TEXT NOT NULL,
  field_path TEXT NOT NULL,
  override_value JSONB NOT NULL,
  reason TEXT NOT NULL,
  source_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
)
```

RLS:

- anon can read approved entities and active overrides
- anon cannot mutate sync, entity, diff, or override rows
- GitHub Actions/DB migration path handles writes with server-side credentials

### Phase 2 - Promote Fetch Output Into DB

Extend `tools/fetch_showdown_data.mjs` to optionally:

- write a `showdown_sync_runs` row
- write `showdown_source_files`
- upsert normalized `showdown_entities`
- produce `showdown_entity_diffs`
- leave new rows unapproved until reviewed

Default job behavior:

- detect and report
- do not auto-approve
- do not auto-merge generated assets without review

### Phase 3 - Generate App Data From DB Views

Generator:

```bash
node tools/generate-approved-data-from-db.mjs
```

It reads approved DB views through Supabase REST when `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set. For CI and review, it can also read fixture/artifact JSON:

```bash
node tools/generate-approved-data-from-db.mjs \
  --entities artifacts/showdown-sync/approved_entities.json \
  --overrides artifacts/showdown-sync/approved_overrides.json \
  --out generated/pokemon_showdown_legal_data.js
```

It emits deterministic artifacts:

- `generated/pokemon_showdown_legal_data.js`
- runtime `ChampionsSim.pokemonDataAudit` rows using Showdown as primary metadata
- generated species/type/stat maps that can replace hand-maintained static sections over time

Generated files must be deterministic and diff-friendly.

### Phase 4 - Migrate JS Static Tables Gradually

Suggested order:

1. Move priority validation first. Already started with `showdown_priority_drift_tests.js`.
2. Move `MOVE_TYPES`, `MOVE_CATEGORY`, `MOVE_BP`, and `MOVE_TARGETS` to generated data.
3. Move species stats/types to generated approved data with Champions overrides.
4. Move item/ability metadata to generated approved data.
5. Keep `TEAMS` as curated app/team data, then migrate shared team catalog separately.

Engine code should ask a local adapter for data instead of reading many global constants directly.

Example adapter target:

```js
ChampionsData.moves.get(moveName).priority
ChampionsData.moves.get(moveName).target
ChampionsData.species.get(speciesName).stats
ChampionsData.overrides.get('move', 'Expanding Force')
```

### Phase 5 - Drift And Oracle Release Gates

Add release gates:

- `showdown_priority_drift_tests.js`: local priorities vs Showdown metadata
- move target drift test: local `MOVE_TARGETS` vs Showdown target
- move category/BP/type drift test
- species stats/types drift test
- item/ability coverage drift test
- Showdown oracle smoke cases for behavior that cannot be represented as rows

Classify every mismatch:

- `local-bug`
- `upstream-drift`
- `champions-override`
- `unknown`

Unknown or blocker findings should stop release promotion.

## First Implementation Slice

1. Done in repo: add the missing DB tables/views for `showdown_entities`, `showdown_entity_diffs`, and `champions_overrides`.
2. Done in repo: add tests proving anon read-only approved/active behavior and no anon write policy.
3. Done in repo: add a deterministic generator from approved rows to `ChampionsSim.pokemonDataAudit`.
4. Next: apply the migration to live Supabase through the migration workflow.
5. Next: extend `fetch_showdown_data.mjs` to produce DB-ready entity/diff rows locally first.
6. Next: add a dry-run report that lists changed move priority/target/type/category/BP rows.
7. Only after dry-run is stable, wire GitHub Actions to upload artifacts or write DB rows.

## Acceptance Criteria

- A fresh Showdown sync can be run without changing app behavior.
- A sync produces hashes, entity counts, and diffs.
- Champions overrides are visible and reviewable.
- Generated app assets are deterministic.
- Priority, target, type, category, and BP drift are tested.
- The GitHub Pages app still works offline from generated assets.
