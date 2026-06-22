# Recent Fixes and Open Issue Snapshot - 2026-06-21

This snapshot records the current truth after the June 21-22 live-log review and GitHub issue sweep. It is meant to remove stale contradictions before preparing the Alfredo upstream PR.

## 2026-06-22 Deployment Update

- The prior Y fork public validation target was commit `7e0deca` (`model champion ability parity`).
- `v2.1.26-overview-truth-notes` supersedes `v2.1.25-target-parity-guard` for the current GitHub Pages release and bumps the service-worker cache to `champions-sim-v60-overview-truth-notes`.
- The earlier `e5af069` build added `champions-turn-log-v2` export metadata; fresh June 22 logs from `?v=7e0deca` validate structurally cleanly, then deeper replay review exposed the target bridge bug fixed in `v2.1.25`.
- Supabase migration `2026_06_22_retire_legacy_sv_teams.sql` has run successfully; the two stale v1 teams are retired at the source.
- Fresh logs from the live URL now validate cleanly for team loading, stable IDs, final alive counts, and stale item absence.

## Fixed Recently

| Area | Status | Evidence |
| --- | --- | --- |
| Live team-load failure | Fixed in `v2.1.21-sim-context-team-load` | `Run Simulation` and `Run All` now normalize DB/static teams through one sim context. Fresh exported logs no longer contain `player team not loaded`. |
| Sim identity drift risk | Guarded | Turn snapshots include side-prefixed stable keys such as `player:slot:0:Incineroar` and `opponent:slot:2:Incineroar`; four fresh logs had no duplicate or wrong-side stable keys. |
| Lethal Sitrus/Oran restore | Fixed and deployed in `v2.1.22-lethal-berry-guard` | Exported logs showed Sitrus restoring after `0 HP`; `engine.js` now requires `hp > 0` for damage-trigger berries. `items_tests.js` covers surviving Sitrus, lethal Sitrus rejection, lethal Oran rejection, and battle-log faint behavior. |
| Golden battle trace drift from berry fix | Updated | `gb_001` and `gb_002` expected trace hashes were refreshed after confirming the new traces remove the invalid berry-after-0-HP behavior while preserving expected winners. |
| Champion item/SP gate | Fixed and deployed in `v2.1.23-champion-item-sp-gate` | `legality.js` now uses a positive Champions item allowlist; imports reject raw EV/IV lines; exports use `SPs:`; illegal teams are hidden from selectors; stale DB teams cannot replace legal bundled teams. |
| GitHub Pages cache drift | Guarded for this release | `sw.js` cache bumped to `champions-sim-v60-overview-truth-notes`; `index.html`, `ui.js`, and bundled `pokemon-champion-2026.html` carry `v2.1.26-overview-truth-notes` after bundle rebuild. |
| Exported-log build drift | Guarded in `e5af069` | Downloaded replay logs now include `schema_version: champions-turn-log-v2`, `exported_at`, `build_id`, and `source_url`, so future debug logs can prove which deployed build produced them. |
| Showdown static metadata use | Partially fixed | Battle construction and move metadata can use generated Showdown static rows first, then local fallbacks. This is not the same as live DB runtime consumption. |
| Showdown target category bridge | Fixed and guarded in `v2.1.25-target-parity-guard` | `runtime_data.js` canonicalizes Showdown target categories before engine use; `engine.js` keeps a guarded fallback for engine-only tests; move tests cover Hyper Voice spread targeting and stale opposing-target retargeting. |
| Overview truth board | Updated in `v2.1.26-overview-truth-notes` | The live Overview tab now names the target bridge fix, DB/runtime source split, capped browser log retention, large-run artifact export next step, and Alfredo sync gap. |

## Fresh Turn-Log Review

Reviewed user exports:

- `champions-turn-log-798376216,3286723544,56938123,1376347848.json`
- `champions-turn-log-728800683,4063744490,3964783166,53912361.json`
- `champions-turn-log-2438873723,1017574262,3904958530,1624987443.json`
- `champions-turn-log-4203547160,2998701090,3352373782,826733247.json`

Structural result:

- All four files are valid battle exports, not crash reports.
- Results: two wins, two losses.
- All four started with four brought Pokemon per side.
- No `team not loaded` text appeared.
- No duplicate stable keys appeared within a side.
- All stable keys had the expected `player:` or `opponent:` prefix.
- Final result matched final alive counts in every file.

Mechanics finding from logs:

- Confirmed bug: damage-trigger berries could activate after the target reached `0 HP`.
- Example: `798...` turn 6 had `Dragon Claw -> Incineroar [117 dmg, 0/201 HP]`, then `Incineroar's Sitrus Berry restored HP!`.
- Example: `420...` turn 2 had mirror Incineroar ambiguity, but the second Sitrus line followed a lethal `Head Smash -> Incineroar [284 dmg, 0/202 HP]`.
- Fix: `Pokemon.applyItem('damage')` now requires positive HP before Sitrus/Oran can trigger.

## Fresh Live Log Review - Item Gate Follow-up

Reviewed user exports from the live GitHub Pages URL:

- `champions-turn-log-3721051892,469035094,3384375842,4047732885.json`
- `champions-turn-log-1674060708,2762845861,2504412934,3322761704.json`
- `champions-turn-log-2880129315,3341176861,2813142371,2761301078.json`
- `champions-turn-log-1340102075,2310310757,1275451860,1972162060.json`
- `champions-turn-log-3353052906,2865618949,1466941714,2815720839.json`

Structural result:

- All five passed `node poke-sim/tools/validate-turn-logs.mjs --require-stable ...`.
- No `team not loaded` text appeared.
- Stable IDs passed with zero validator warnings.
- Results matched final alive counts: three wins and two losses.
- The only Sitrus restore in this batch was valid: Incineroar survived Rock Slide at `14/202 HP`, restored, then Flare Blitz recoil returned it to `14%` by the post-turn snapshot.

Item/source-truth finding:

- Live opponent teams still carried stale SV or unsupported items from loaded team data: `Life Orb`, `Assault Vest`, `Choice Specs`, `Rocky Helmet`, `Safety Goggles`, and `Loaded Dice`.
- Root cause direction: static/bundled data was being repaired, but DB-loaded teams could still override or enter selectors without a positive Champion item-pool gate.
- Fix: `mergeDbTeamsIntoCatalog()` now validates DB teams before merging, rejects stale/illegal rows, and preserves the legal bundled team when a DB row would otherwise clobber it.
- Broader prevention added: generated seed/live-alignment SQL must match `data.js`; PR bundle/cache checks now include `legality.js`; Pages deploy runs the seed, Champion legality, import/DB merge, load-order, and bundle-freshness checks before publishing; current coaching/classifier copy no longer recommends absent Champion items.
- Live DB cleanup follow-up: CI found two retired v1 teams still active in Supabase (`chuppa_balance`, `kingambit_sneasler`). `2026_06_22_retire_legacy_sv_teams.sql` now marks them retired and removes stale member/item rows without deleting team rows that historical analyses may reference.

## Fresh Live Log Review - Post DB Cleanup

Reviewed user exports from the live GitHub Pages URL:

- `champions-turn-log-3084425982,892997766,4276048414,2229364397.json`
- `champions-turn-log-788751691,3876826790,1086134230,2226244029.json`
- `champions-turn-log-1649352473,1693921784,2129474619,909993565.json`
- `champions-turn-log-593811072,2749655353,1061834934,2103146632.json`

Structural result:

- All four passed `node poke-sim/tools/validate-turn-logs.mjs --require-stable ...`.
- No `team not loaded` text appeared.
- Stable IDs passed with zero validator warnings.
- Results matched final alive counts: two wins and two losses.
- No stale SV/unsupported item hits appeared.
- The one Sitrus restore in this batch was valid: Rotom-Wash damaged Incineroar to `34/202 HP`, Sitrus restored after survival, then Flare Blitz recoil applied after Incineroar's attack.

Root-cause conclusion:

- The prior live failure was broader than a single log. Static/bundled data, live DB rows, and the sim-context loader could drift from each other.
- The current prevention layer is a positive gate: normalize DB/static teams through one sim context, reject stale DB teams before selector merge, keep legal bundled teams when DB rows are illegal, validate stable IDs in logs, and stamp future exported logs with build metadata.
- This proves the live data/load/item guardrails are behaving on the tested logs. It does not prove full Showdown/Champions damage and mechanics parity.

## Fresh Live Log Review - Ability Parity Build

Reviewed user exports from `https://theyfactora12.github.io/Pokemon-Champions-Sim-Planner/poke-sim/pokemon-champion-2026.html?v=7e0deca`:

- `champions-turn-log-3795896113,1678786505,541232077,363825156.json`
- `champions-turn-log-3087352535,836377216,1695902721,1931458225.json`
- `champions-turn-log-1694391190,163973610,2149898308,2181411774.json`
- `champions-turn-log-2267437589,2350394465,4291446057,1098773092-2.json`
- `champions-turn-log-961297591,2414563708,2633954413,3427889307.json`
- `champions-turn-log-2267437589,2350394465,4291446057,1098773092.json`
- `champions-turn-log-256938721,1406634238,2986203652,3930972000.json`

Structural result:

- All seven passed `node poke-sim/tools/validate-turn-logs.mjs --require-stable --json ...`.
- No `team not loaded`, simulation failure, invalid HP map, duplicate stable key, wrong-side key, or `NaN` marker appeared.
- Results: four wins and three losses across 4-9 turn games.
- Duplicate seed `2267437589,2350394465,4291446057,1098773092` produced identical turn-log hashes, proving deterministic export behavior for that run.
- The logs correctly carried `source_url` with `?v=7e0deca`, but still exported stale `build_id: v2.1.23-champion-item-sp-gate`.

Fix from this review:

- App build label and export fallback were updated to `v2.1.24-ability-inventory-parity` for the ability slice; the target parity section below supersedes that label with `v2.1.25-target-parity-guard`.
- Overview copy now says the Y fork carries the ability parity release and Alfredo sync remains next.

## Fresh Live Log Review - Target Parity Deep Test

Reviewed user exports from `https://theyfactora12.github.io/Pokemon-Champions-Sim-Planner/poke-sim/pokemon-champion-2026.html?v=7e0deca` after refresh:

- `champions-turn-log-1390908950,789006894,3994491486,3867498154.json`
- `champions-turn-log-1812892673,1909893488,99722305,3450463350.json`
- `champions-turn-log-1677890637,3195818552,1094422766,1758880326.json`
- `champions-turn-log-2702885822,2361050711,1244081746,3612465656.json`

Structural result:

- All four passed `node poke-sim/tools/validate-turn-logs.mjs --require-stable --json ...`.
- No `team not loaded`, duplicate stable key, invalid HP map, wrong-side stable key, or `NaN` marker appeared.
- This means the load/export guardrails held. It did not mean the move logic was fully clean.

Logic finding:

- Confirmed bug: some actions logged `(no valid target)` while another opposing active slot was still alive.
- Example: Farigiraf `Hyper Voice` could fail as if it were a stale single-target move instead of hitting both adjacent foes.
- Example: a single-target damage move could keep its original opposing target after that target fainted earlier in the action order, instead of retargeting the remaining live opposing slot.
- Some `(no valid target)` lines are still legitimate when every active target on that side has already fainted before the move resolves and replacements happen afterward.

Root cause:

- Generated Showdown data uses target strings such as `allAdjacentFoes`, `allAdjacent`, `adjacentFoe`, and `randomNormal`.
- The engine target switch uses internal buckets such as `all-adjacent-foes`, `all-adjacent`, `adjacent-foe`, and `random-foe`.
- When generated data was present, raw Showdown target strings could bypass the internal target vocabulary.

Fix from this review:

- `runtime_data.js` now owns the canonical Showdown-to-engine target bridge and exports `normalizeMoveTargetCategory()`.
- `engine.js` normalizes every target category before executing target logic and keeps a fallback map only for engine-only VM tests.
- Single-target damaging moves now retarget a dead or missing opposing intended target to a live opposing slot when the move can still legally hit.
- `runtime_data_bridge_tests.js` verifies common target examples, enumerates every target value in generated Showdown data, and checks that the engine fallback map cannot drift from the runtime bridge.
- `move_verification_registry_tests.js` covers Hyper Voice spread targeting from Showdown camelCase data and stale opposing-target retargeting.
- Golden battle hashes were regenerated after confirming the new traces reflect the intentional targeting behavior change.

## Large-Run Log Retention Note

- The sim and CI can run thousands of battles for validation, but the browser UI intentionally keeps a bounded amount of replay evidence so local storage, downloads, and the page do not become unusable.
- Current browser caps: replay cards are capped at `MAX_REPLAY_CARDS = 240`, raw replay lines display the last `MAX_REPLAY_LOG_LINES = 200`, stored sim logs are capped at `CS_SIMLOG_MAX_TOTAL = 500`, and stored logs per matchup pair are capped at `CS_SIMLOG_MAX_PER_PAIR = 100`.
- This is not proof that only that many battles ran. It means normal user-facing retention is capped.
- Later build recommendation: add a QA/audit artifact export mode for large runs that saves summary metrics plus selected full turn logs, seeds, build IDs, source URLs, and failure examples without overloading normal browser storage.

## GitHub Issue Sweep

Checked open issues in:

- Y fork: `TheYfactora12/Pokemon-Champions-Sim-Planner`
- Alfredo upstream: `alfredocox/Pokemon-Champions-Sim-Planner`

Current active alignment issues after the 2026-06-22 issue list check:

| Repo | Issue | Current truth |
| --- | --- | --- |
| Alfredo | [#241](https://github.com/alfredocox/Pokemon-Champions-Sim-Planner/issues/241) | `showdown_entities` has live DB rows, but battle runtime does not query those rows yet. Static/generated data is still the runtime source. |
| Alfredo | [#240](https://github.com/alfredocox/Pokemon-Champions-Sim-Planner/issues/240) | Champion-only selector/import gating has a local v2.1.23 fix. Remaining work is live verification and DB row cleanup so Supabase source data matches the guard. |
| Alfredo | [#231](https://github.com/alfredocox/Pokemon-Champions-Sim-Planner/issues/231) | Josh workbook review has JD comment: Showdown data is present but not fully used for move calculation; regional forms such as Arcanine need extra scrutiny. |
| Y fork | [#137](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/issues/137) | Tracks Showdown DB sync/runtime/fallback audit. Needs update or sibling issues for Alfredo #241/#240 so the fork does not look more complete than upstream. |
| Y fork | [#123](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/issues/123) | Josh workbook review mirror. Needs the Alfredo #231 JD comment mirrored or linked. |

## No-Contradiction Status

Use these statements in team updates and PR notes:

- Fixed: live sim team context/load path.
- Fixed: stable battle identity keys in logs.
- Fixed and deployed to the Y fork: lethal Sitrus/Oran restore bug.
- Fixed and deployed to the Y fork: Champion item allowlist, SP import/export, selector legality gate, and stale DB-team merge rejection.
- Fixed and deployed to the Y fork: exported turn logs now include build/source metadata.
- Fixed and deployed to the Y fork: curated-team plus Champions mega ability inventory is modeled 80/80 with focused ability parity guards.
- Fixed for the next Y fork push: Showdown target category bridge and stale opposing-target retargeting are guarded by source-truth and move-registry tests.
- Updated for the next Y fork push: Overview tab is the current team truth board for working areas, known gaps, next priorities, and build notes.
- Completed: Supabase cleanup migration retired the stale v1 DB teams.
- Known limitation: browser replay/log retention is intentionally capped; large-run QA evidence needs a dedicated artifact export mode before partners should expect every battle log to be retained.
- Not fixed yet: live DB `showdown_entities` as the battle runtime source.
- Not fixed yet: full move/damage/regional-form parity audit.
- Not ready for broad accuracy claims: sim still needs grouped mechanics parity work and Showdown/Champions oracle gates.

## Current Next Path

1. Export one fresh single-run log and one fresh Run All log from the public URL after `v2.1.26-overview-truth-notes`; verify both include `champions-turn-log-v2`, `build_id`, and `source_url`, and deep-check that no invalid `(no valid target)` lines remain.
2. Mirror/update issue notes in the Y fork for Alfredo #241, #240, and #231 so both repos show the same truth.
3. Continue the grouped move/damage/mechanics parity track against Showdown first, with Champions overrides only when explicitly sourced.
4. Plan the large-run QA artifact export mode so thousand-battle validations can preserve review evidence without using normal browser replay retention.
5. Prepare a reviewed upstream PR to Alfredo after live Y verification remains clean.
