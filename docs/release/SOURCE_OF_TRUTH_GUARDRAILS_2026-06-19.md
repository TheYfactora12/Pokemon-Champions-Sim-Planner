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
- Never hand-edit generated Showdown data without regenerating it.
- Never change fallback stats/types without checking whether the generated Showdown row already covers that species.
- Never merge source-truth changes without recording the upstream source commit/date when applicable.
- Never close a data issue from a different branch than the code under review.

## Mandatory Checks After Source-Truth Changes

From `poke-sim/` run:

```bash
npm run test:source-truth
```

That grouped suite runs:

- `showdown_runtime_data_tests.js`
- `showdown_priority_drift_tests.js`
- `showdown_approved_data_generator_tests.js`
- `showdown_db_writer_tests.js`
- `showdown_sync_workflow_tests.js`
- `pokemon_data_audit_tests.js`

Also run these when the change touches the relevant area:

- `npm run test:fast`
- workbook regeneration via `tools/generate-pokemon-data-audit.js`
- bundle rebuild when shipped runtime files changed
- strict live-log validation for deployed-build proof

## Review Rules

Every source-truth handoff should state:

- repo
- branch
- commit SHA
- preview or local target
- source commit/date if Showdown inputs changed
- whether approved DB views or local generated files are the active review source

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
