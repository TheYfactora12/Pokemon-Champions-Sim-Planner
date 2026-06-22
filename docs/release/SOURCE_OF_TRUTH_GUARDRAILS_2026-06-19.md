# Source Of Truth Guardrails - 2026-06-19

Audience: anyone changing Pokemon data, generated artifacts, Showdown sync logic, DB promotion, or runtime fallback behavior.

## Source-Of-Truth Order

Keep this order fixed unless there is an explicit reviewed exception:

1. Pokemon Showdown upstream source snapshots
2. normalized Showdown rows and review artifacts
3. approved DB views
4. generated runtime artifact
5. local fallback rows only for explicit gaps or Champions-specific behavior

Do not manually patch broad mirrored data in app files when the same fix belongs upstream, in the generator, or in the approved DB layer.

## Drift Prevention Rules

- Never treat GitHub Pages as proof for unmerged branch data.
- Never treat an exported turn log as current-build proof unless it includes `schema_version`, `build_id`, `exported_at`, and `source_url`.
- Never hand-edit generated Showdown data without regenerating it.
- Never change fallback stats/types without checking whether the generated Showdown row already covers that species.
- Never let raw Showdown vocabulary cross directly into engine control flow. Normalize generated target strings, category names, and similar upstream terms at the runtime adapter boundary first; keep equivalents documented in `poke-sim/docs/SHOWDOWN_RUNTIME_NAMING_CHEATSHEET.md`.
- Never merge source-truth changes without recording the upstream source commit/date when applicable.
- Never close a data issue from a different branch than the code under review.

## Mandatory Checks After Source-Truth Changes

From `poke-sim/` run:

```bash
npm run test:source-truth
```

That grouped suite runs:

- `showdown_runtime_data_tests.js`
- `runtime_data_bridge_tests.js`
- `damage_pipeline_tests.js`
- `showdown_damage_oracle_tests.js`
- `move_verification_registry_tests.js`
- `showdown_priority_drift_tests.js`
- `showdown_approved_data_generator_tests.js`
- `showdown_db_writer_tests.js`
- `showdown_sync_workflow_tests.js`
- `pokemon_data_audit_tests.js`

Also run these when the change touches the relevant area:

- `npm run test:fast`
- workbook regeneration via `tools/generate-pokemon-data-audit.js`
- bundle rebuild when shipped runtime files changed
- strict live-log validation for deployed-build proof, including exported build metadata when available
- focused replay/deep-log review when validator-clean logs still show suspicious battle text such as invalid `(no valid target)`, impossible HP recovery, or stale item/legal-data behavior
- for thousand-battle QA claims, state whether evidence came from normal browser retention caps or from a dedicated artifact export; normal UI retention is intentionally bounded

## Review Rules

Every source-truth handoff should state:

- repo
- branch
- commit SHA
- preview or local target
- exported log `build_id` and `source_url` when the handoff uses live logs
- source commit/date if Showdown inputs changed
- whether approved DB views or local generated files are the active review source
- whether large-run evidence preserves all battle logs or only capped browser samples plus summaries

## Release Guardrails

Before making stronger accuracy claims, require:

1. `npm run test:source-truth` passing
2. `npm run test:fast` passing
3. fresh exported log validation from the claimed build
4. approved data/generator path documented for the release candidate
5. any remaining fallback exceptions listed explicitly

## What Counts As A Source-Truth Change

Treat these as guarded changes:

- Showdown source refreshes
- generated `pokemon_showdown_legal_data.js` changes
- fallback `BASE_STATS` or `POKEMON_TYPES_DB` edits
- move legality source edits
- DB writer / approved-view generator changes
- parser changes that affect species/form resolution
- runtime adapter changes that translate Showdown rows into engine categories
- target selection, replacement, spread move, redirection, or retargeting logic changes
