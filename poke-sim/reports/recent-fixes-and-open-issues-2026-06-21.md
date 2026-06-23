# Recent Fixes and Open Issue Snapshot - 2026-06-21

This snapshot records the current truth after the June 21-23 live-log review, GitHub issue sweep, Alfredo sync, Low Kick weight-parity pass, and core shipped-move parity pass. It is meant to remove stale contradictions before the next mechanics-parity pass.

## 2026-06-23 Deployment Update

- The prior Y fork public validation target was commit `7e0deca` (`model champion ability parity`).
- `v2.1.36-core-move-parity` supersedes `v2.1.35-low-kick-weight-parity` for the next GitHub Pages release and bumps the service-worker cache to `champions-sim-v70-core-move-parity`.
- `v2.1.35` fixes a confirmed mechanics bug: Pokemon Showdown records Low Kick with `basePower: 0` because the real base power is selected from target weight; the sim was previously treating that literal 0 as no damage. The engine now reads target species weight from `generated/pokemon_showdown_species_weights.js`, generated from Pokemon Showdown `data/pokedex.ts`, and selects the official Low Kick / Grass Knot weight tier.
- `v2.1.35` adds `reports/champion_parity_100_checklist.md` so the team has a visible definition of the practical 100% Champion parity gate instead of a vague readiness claim.
- `v2.1.36` promotes the former 35 baseline shipped moves into verified coverage, including weather/accuracy rules, spread damage, damaging secondaries, item/state moves, recoil, priority, and special-case damage formulas.
- Local move support now reports `120 verified`, `0 baseline`, `0 incomplete`; the Showdown damage oracle is `56/56` after the core shipped-move parity coverage.
- `v2.1.29` promotes `Knock Off` from baseline to verified move coverage. The source truth is Pokemon Showdown move/item behavior checked against Bulbapedia: removable held items give the 1.5x base-power boost and are removed after damage; legal no-item targets give no boost and remove nothing; corresponding Mega Stones are not removable and do not give the boost even before Mega Evolution; Sticky Hold blocks removal while the holder is alive but does not suppress the boost when the item is otherwise removable.
- `v2.1.30` converts shipped inferred Champion archetype spreads from SV-shaped EV values to Champion SP values, hard-rejects over-cap or malformed Champion spreads in imports/editor/DB merges/Supabase upserts, and records the Showdown-vs-preview source conflict on the per-stat cap.
- `v2.1.31` records that the current edit-team UI is guarded but not fluid enough for fully customizable Champion team building; this is tracked as later UX work after sim-truth gates.
- `v2.1.32` promotes Tera Blast parity: inactive Tera Blast remains Normal/special, active Tera Blast uses the attacker's Tera type, active Tera Blast ignores Normal-conversion abilities such as Pixilate, active category selects physical only when boosted Attack is greater than boosted Special Attack, and DB-style `tera_type` now hydrates into engine battle state.
- `v2.1.33` promotes log validation around target safety: terminal `(no valid target)` lines are allowed when an earlier KO emptied the target side, but future logs fail validation if a no-target skip occurs while that target side still has a live active Pokemon.
- `v2.1.34` updates the Overview and issue snapshot with five current-build v2.1.33 exports that passed strict validation and exposed stacked mechanics evidence; no engine behavior changed in this slice.
- Alfredo PR #245 merged the prior Champion parity tree after required checks passed; TheYfactora12 main was fast-forwarded to the same merge commit. The current v2.1.36 core-move-parity slice should prove out on the Y fork first, with Alfredo sync handled later by PR notes.
- Alfredo source-tree parity is not the same as Alfredo Pages proof: the Alfredo Pages deployment remains blocked by repo Pages/admin configuration (`Resource not accessible by integration`) until an admin adjusts the deployment permissions.
- The earlier `e5af069` build added `champions-turn-log-v2` export metadata; fresh June 22 logs from `?v=7e0deca` validate structurally cleanly, then deeper replay review exposed the target bridge bug fixed in `v2.1.25`.
- Supabase migration `2026_06_22_retire_legacy_sv_teams.sql` has run successfully; the two stale v1 teams are retired at the source.
- Fresh logs from the live URL now validate cleanly for team loading, stable IDs, final alive counts, and stale item absence.

## Fixed Recently

| Area | Status | Evidence |
| --- | --- | --- |
| Live team-load failure | Fixed in `v2.1.21-sim-context-team-load` | `Run Simulation` and `Run All` now normalize DB/static teams through one sim context. Fresh exported logs no longer contain `player team not loaded`. |
| Sim identity drift risk | Guarded | Turn snapshots include side-prefixed stable keys such as `player:slot:0:Incineroar` and `opponent:slot:2:Incineroar`; four fresh logs had no duplicate or wrong-side stable keys. |
| Lethal Sitrus/Oran restore | Fixed and deployed in `v2.1.22-lethal-berry-guard` | Exported logs showed Sitrus restoring after `0 HP`; `engine.js` now requires `hp > 0` for damage-trigger berries. `items_tests.js` covers surviving Sitrus, lethal Sitrus rejection, lethal Oran rejection, and battle-log faint behavior. |
| Golden battle trace drift from intentional mechanics fixes | Updated | Earlier `gb_001` and `gb_002` hashes were refreshed for the lethal-berry fix; `v2.1.28` refreshed all three golden trace hashes after typed held-item damage boosts and structured damage evidence changed deterministic traces; `v2.1.29` refreshes `gb_001` and `gb_003` after Knock Off now boosts/removes removable held items; `v2.1.35` refreshes `gb_002` and `gb_003` after Low Kick target-weight damage changes Sand Bulky Offense traces; `v2.1.36` refreshes `gb_002` after core move-mechanics parity changed the deterministic trace while preserving the expected loss. |
| Champion item/SP gate | Fixed and deployed in `v2.1.23-champion-item-sp-gate` | `legality.js` now uses a positive Champions item allowlist; imports reject raw EV/IV lines; exports use `SPs:`; illegal teams are hidden from selectors; stale DB teams cannot replace legal bundled teams. |
| Champion SP spread legality guard | Fixed in `v2.1.30-spread-legality-guard` | The 32 shipped inferred SV-shaped archetype spreads were converted to legal Champion SP spreads; `validateTeam`, Champion import, set editor saves, DB merge, Supabase upsert, and seed tests now block >32 SP per stat, >66 SP total, and malformed spread payloads. |
| Team editor roadmap note | Tracked in `v2.1.31-editor-builder-roadmap` | The current set editor has Champion SP legality guardrails, but the team identified that it is not fluid enough for full customization. Later work should replace it with a complete builder for add/remove/reorder Pokemon, searchable fields, SP sliders/totals, import/export, Supabase save status, and rollback. |
| Tera Blast dynamic type/category | Fixed in `v2.1.32-tera-blast-parity` | `engine.js` resolves active Tera Blast from battle state, accepts DB-style `tera_type`, ignores Normal-conversion abilities once Tera is active, records resolved move type/category in damage evidence, and `showdown_damage_oracle_tests.js` covers inactive, special active, physical active, stat-boost-flipped, DB-hydrated, and Pixilate-bypass cases against `@smogon/calc`. |
| Target-safe log validation | Guarded in `v2.1.33-log-target-guard` | `validate-turn-logs.mjs` now rejects `(no valid target)` skips when the target side still has a live active Pokemon, while preserving legitimate terminal skips after an earlier KO empties that side. |
| Latest live-log proof | Validated in `v2.1.34-live-log-proof` | Five current-build v2.1.33 exports passed strict validation with zero warnings across 27 turns and showed super-effective/resisted hits, typed held-item boosts, Knock Off boosts, spread reduction, sun weather boosts, stat-stage damage evidence, and exact-speed-tie markers. |
| Low Kick target-weight damage | Fixed in `v2.1.35-low-kick-weight-parity` | Low Kick now uses target Showdown species weight to select the official variable base-power tier. `showdown_damage_oracle_tests.js` covers heavy and mid-weight targets against `@smogon/calc`, and the generated weight companion file is loaded before runtime/engine code. |
| Core shipped move parity | Fixed locally for `v2.1.36-core-move-parity` | The former 35 baseline shipped moves are verified in `move_support.js`. `showdown_damage_oracle_tests.js` now covers direct/spread damage ranges plus Foul Play and Darkest Lariat special cases; `move_verification_registry_tests.js` covers Dual Wingbeat, Poltergeist, Leaf Storm, Stomping Tantrum, weather/true accuracy, secondary effects, Throat Chop, Hurricane confusion, Light of Ruin, and Ice Shard priority. |
| 100% Champion parity gate | Updated in `v2.1.36-core-move-parity` | `reports/champion_parity_100_checklist.md` defines the practical gate: 120 shipped moves verified with 0 baseline/incomplete rows, legal Champion teams, DB override guards, browser single/Run All/QA proof, source-version agreement, and visible gaps before broad accuracy claims. |
| Move support audit | Improved in `v2.1.36-core-move-parity` | `reports/move_support_audit.md` now reports `120 verified`, `0 baseline`, `0 incomplete` across `120` shipped distinct moves. |
| Type multiplier audit | Corrected in `v2.1.35-low-kick-weight-parity` | Low Kick and Grass Knot are now treated as damaging variable-base-power moves in the report instead of status/no-direct-damage rows caused by Showdown `basePower: 0`. |
| GitHub Pages cache drift | Guarded for this release | `sw.js` cache bumped to `champions-sim-v70-core-move-parity`; `index.html`, `ui.js`, and bundled `pokemon-champion-2026.html` must carry `v2.1.36-core-move-parity` after bundle rebuild. |
| Exported-log build drift | Guarded in `e5af069` | Downloaded replay logs now include `schema_version: champions-turn-log-v2`, `exported_at`, `build_id`, and `source_url`, so future debug logs can prove which deployed build produced them. |
| Showdown static metadata use | Partially fixed | Battle construction and move metadata can use generated Showdown static rows first, then local fallbacks. This is not the same as live DB runtime consumption. |
| Showdown target category bridge | Fixed and guarded in `v2.1.25-target-parity-guard` | `runtime_data.js` canonicalizes Showdown target categories before engine use; `engine.js` keeps a guarded fallback for engine-only tests; move tests cover Hyper Voice spread targeting and stale opposing-target retargeting. |
| Overview truth board | Updated in `v2.1.36-core-move-parity` | The live Overview tab now names the target bridge fix, DB/runtime source split, capped browser log retention, shipped QA artifact export, type audit, Low Kick weight parity, core shipped move parity, typed held-item boost fix, Knock Off behavior fix, Tera Blast parity, no-valid-target guard, Champion SP spread guard, editor-builder UX gap, latest live-log proof, stat/speed/export evidence, 100% checklist, remaining non-move truth gates, and prior Alfredo sync status. |
| Large-run QA artifact | Added in `v2.1.27-qa-artifact-export` | Saved Analyses now has a `QA Artifact` export that records build ID, source URL, retention caps, summary counts, retained compact sim-log entries, and retained replay cards. |
| Type multiplier audit | Added in `v2.1.28-mechanics-stack-guard` | `reports/type_multiplier_audit.md` shows each shipped move user's resolved move type, 4x/2x/1x/0.5x/0.25x/0x target buckets across the shipped roster, declared defensive Tera bucket changes, and dynamic move-type rules. |
| Typed held-item damage boosts | Fixed in `v2.1.28-mechanics-stack-guard` | `engine.js` now applies legal typed held-item boosts such as Charcoal, Mystic Water, Soft Sand, Black Glasses, Spell Tag, Fairy Feather, and Never-Melt Ice as Showdown-style base-power modifiers. `showdown_damage_oracle_tests.js` covers Charcoal + Blaze + sun + STAB + super-effective Fire damage. |
| Stat, speed, and damage export evidence | Added in `v2.1.28-mechanics-stack-guard` | Turn snapshots now include `stat_boosts`, `stat_boosts_stable`, `speed_order_details`, and `damage_events` with Champions SP/SV stat format, nature, Speed points, species base Speed, calculated Speed, Speed stage, item, ability, status, weather, Tailwind, Trick Room, effective Speed, exact-speed-tie flags, type effectiveness, typed item boosts, STAB, spread/weather/screen/final modifiers, and attack/defense stage evidence. |
| Knock Off item boost/removal | Fixed in `v2.1.29-knock-off-guard` | `engine.js` now applies the Showdown-style removable-item base-power boost, removes removable items after successful damage, leaves legal no-item targets alone, blocks removal and boost for corresponding Mega Stones before or after Mega activation, and respects Sticky Hold removal blocking. `move_verification_registry_tests.js` covers removable items, no item, pre-Mega corresponding stone, Mega metadata, and Sticky Hold. |

## Knock Off Source-Truth Notes

- Battle logic lives in `engine.js`, not Supabase. Supabase can store source rows, Champion overrides, teams, and audit history, but deterministic runtime mechanics must stay in the engine/generated bundle so GitHub Pages, local tests, and exported logs agree.
- Pokemon Showdown is the primary behavior source for the move mechanics. The implemented contract mirrors Showdown's `Knock Off` base-power gate and item-removal flow plus Showdown item hooks that make corresponding Mega Stones non-removable for their matching species.
- Bulbapedia is the human-readable cross-check for the same public rule: since Generation VI, `Knock Off` cannot remove a Mega Stone from a Pokemon that can use that stone to Mega Evolve, and it does not get the damage boost when the held item cannot be removed.
- Itemless teams are legal. A legal no-item target has no removable item, so `Knock Off` does normal 65 base-power damage, records `knock_off_boost: false`, removes nothing, and does not mark `itemConsumed`.
- Sticky Hold is intentionally asymmetric: the held item is otherwise removable, so the damage boost still applies; removal is blocked while the holder is alive.
- Exported `damage_events` now expose `knock_off_boost` and `knock_off_boost_mod` so live logs can prove whether the boost did or did not apply.
- Remaining risk is not this slice; it is the broader move/mechanics queue, especially redirection, Protect-family edge cases, switching/replacement, secondary stat effects, status interactions, and data promotion from approved Showdown DB rows into generated runtime assets.

## Champion SP Source-Truth Notes

- Battle-team spreads are Champion Stat Points, not Scarlet/Violet EVs.
- Current Pokemon Showdown source treats Champion teams as SP-capped: no more than `32` in one stat and no more than `66` total. The repo follows that behavior in `validateChampionsSpread()` and seed tests until a stronger Champion source says otherwise.
- A public GamesRadar hands-on preview says the cap is `31` per stat. That conflicts with Showdown's current validator, so it is tracked as a source-review note rather than silently changing runtime behavior.
- Conversion policy for shipped inferred archetype spreads is mechanical: old `252` EV slots become `32` SP, old `4` EV filler becomes `1` SP, and no extra filler point is invented just to reach `66`.
- No bundled Champion team currently needs removal solely for spread illegality after conversion. If stale Supabase/live rows still contain over-cap or malformed spreads, they should be blocked or quarantined rather than merged over the clean bundled team.

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

## 2026-06-22 Late Log Review - v2.1.31 Exports

Reviewed user exports from `https://theyfactora12.github.io/Pokemon-Champions-Sim-Planner/poke-sim/pokemon-champion-2026.html?v=e209f3b`:

- `champions-turn-log-3410383494,1684469838,2080849004,3938257855.json`
- `champions-turn-log-3491800478,1512844493,1474271744,656145414.json`
- `champions-turn-log-161728751,2826389324,4174458443,2913951381.json`
- `champions-turn-log-771060722,4210367371,3321910684,2176763678.json`

Structural result:

- All four passed `node poke-sim/tools/validate-turn-logs.mjs --require-stable --json ...` with `0` errors and `0` warnings across `28` turns.
- The logs are from `v2.1.31-editor-builder-roadmap`, not the current `v2.1.33-log-target-guard`, so they are useful for root-cause review but do not prove the latest deployed bundle.
- No `team not loaded`, duplicate stable key, invalid HP map, wrong-side stable key, or `NaN` marker appeared.

Mechanics evidence observed:

- `61` structured damage events.
- `23` super-effective hits and `11` resisted hits.
- `17` typed held-item boosts, including Soft Sand and Charcoal examples.
- `5` Knock Off boost rows with `knock_off_boost_mod: 6144`.
- `16` doubles spread reductions using `spread_mod: 3072`.
- `7` sun weather damage boosts using `weather_mod: 6144`.
- `13` stat-stage-aware damage rows and `4` burn/status penalty rows.
- `0` Tera Blast events appeared in this batch, so Tera Blast still needs a fresh live-log sample when present.

Target/no-target finding:

- One `Incineroar used Knock Off! (no valid target)` line appeared.
- It was legitimate: Whimsicott KO'd the opponent's final active Milotic earlier in the same turn, so Incineroar's queued Knock Off had no legal opposing active target left.
- To prevent future regressions, `v2.1.33` adds validator coverage that fails no-target skips only when the target side still has a live active Pokemon after the turn.

## 2026-06-22 Latest Log Review - v2.1.33 Exports

Reviewed user exports produced at `2026-06-23T03:18Z`:

- `champions-turn-log-1027724309,202665117,2643646420,4291685691.json`
- `champions-turn-log-2505975043,194047141,4217885793,3303813312.json`
- `champions-turn-log-4103504750,2481376110,3893515921,176717201.json`
- `champions-turn-log-3760269446,1389782942,2911285047,2893946322.json`
- `champions-turn-log-2509498104,1561655873,1656240141,670519114.json`

Structural result:

- All five carried `build_id: v2.1.33-log-target-guard`.
- All five passed `node poke-sim/tools/validate-turn-logs.mjs --require-stable --json ...` with `0` errors and `0` warnings across `27` turns.
- No `team not loaded`, duplicate stable key, invalid HP map, wrong-side stable key, `NaN`, or live-target `(no valid target)` failure appeared.
- The exported `source_url` still contained the older query `?v=e209f3b`; the page build label proves the current bundle, but the next manual run should use the newest commit query so source URL traceability is cleaner.

Mechanics evidence observed:

- `67` structured damage events.
- `31` super-effective hits and `14` resisted hits.
- `20` typed held-item boosts.
- `5` Knock Off boost rows.
- `28` doubles spread reductions.
- `8` sun weather boosts.
- `5` stat-stage-aware damage rows.
- `8` exact-speed-tie markers.
- `0` Tera Blast events appeared in this batch, so Tera Blast still needs a live-log sample when present.

Target/protection finding:

- One `Milotic used Blizzard! (no valid target)` line appeared after Garchomp was KO'd and the player side had no active Pokemon left, so it is a legitimate terminal skip.
- Two `Torkoal used Protect! But it failed!` lines appeared after earlier Protect usage and match consecutive-Protect failure behavior.

## Large-Run Log Retention Note

- The sim and CI can run thousands of battles for validation, but the browser UI intentionally keeps a bounded amount of replay evidence so local storage, downloads, and the page do not become unusable.
- Current browser caps: replay cards are capped at `MAX_REPLAY_CARDS = 240`, raw replay lines display the last `MAX_REPLAY_LOG_LINES = 200`, stored sim logs are capped at `CS_SIMLOG_MAX_TOTAL = 500`, and stored logs per matchup pair are capped at `CS_SIMLOG_MAX_PER_PAIR = 100`.
- This is not proof that only that many battles ran. It means normal user-facing retention is capped.
- Current guardrail: `v2.1.27-qa-artifact-export` adds a `QA Artifact` export for retained evidence, including summary metrics, replay card evidence, compact sim logs, build ID, source URL, and the exact caps that shaped the retained data.
- Later build recommendation: add a streaming/full-archive artifact mode if partners require every raw battle log from thousand-battle validations, instead of relying on bounded browser retention.

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
- Fixed and deployed to the Y fork: Showdown target category bridge and stale opposing-target retargeting are guarded by source-truth and move-registry tests.
- Updated and deployed to the Y fork: Overview tab is the current team truth board for working areas, known gaps, next priorities, and build notes.
- Added and deployed to the Y fork: QA Artifact export captures retained large-run evidence with build/source metadata and retention caps.
- Added for `v2.1.28`: Type Multiplier Audit gives Josh/reviewers a readable map of move typing into roster typing, including 4x, immunity, declared Tera defensive buckets, and dynamic move-type rules.
- Fixed for `v2.1.28`: typed held-item damage boosts now stack in the damage pipeline; the Showdown oracle covers Charcoal + Blaze + sun + STAB + super-effective Fire damage.
- Added for `v2.1.28`: turn-log snapshots expose stat boosts, effective-speed details, and structured `damage_events` so SP/nature/stage/item/ability/weather/Tailwind/Trick Room/tie-break and damage-modifier effects can be audited from exported logs.
- Fixed for `v2.1.29`: Knock Off now handles removable held-item boost/removal, legal no-item targets, corresponding Mega Stone protection before Mega activation, Mega metadata rows, Sticky Hold blocking, and live-log damage-event evidence.
- Fixed for `v2.1.30`: bundled Champion spreads are legal SP values, declared Champion teams with SV-shaped spreads are hard-invalid, stale DB spread payloads cannot replace bundled teams, and set-editor/Supabase saves are blocked before illegal spreads persist.
- Tracked for later: current edit-team UI is guarded but not fluid; full Champion team-builder UX still needs a separate build.
- Fixed for `v2.1.32`: Tera Blast now matches Showdown for inactive Normal/special behavior, active Tera type, active Normal-conversion ability bypass, active physical/special category selection from boosted attacking stats, and DB-style `tera_type` hydration into battle state.
- Guarded for `v2.1.33`: exported-log validation now distinguishes legitimate terminal no-target skips from target failures while a live active target remains.
- Validated for `v2.1.34`: five current-build v2.1.33 logs passed strict validation and showed stacked mechanics evidence; no new engine issue was confirmed in that batch.
- Fixed for `v2.1.35`: Low Kick now uses target Showdown species weight instead of producing zero damage from Showdown `basePower: 0`.
- Fixed locally for `v2.1.36`: the former 35 baseline shipped moves are verified; the oracle is 56/56 and the move audit is 120 verified / 0 baseline / 0 incomplete.
- Added for `v2.1.35`: `reports/champion_parity_100_checklist.md` defines the practical 100% gate and keeps remaining proof gaps visible.
- Previously completed: Alfredo PR #245 merged and both `alfredocox/main` and `TheYfactora12/main` pointed to the same source tree before the current v2.1.36 local slice.
- Blocked outside code: Alfredo Pages deployment still needs repo/admin permission cleanup before Alfredo's public Pages URL can be used as release proof.
- Completed: Supabase cleanup migration retired the stale v1 DB teams.
- Known limitation: browser replay/log retention is intentionally capped; QA Artifact exports retained evidence and caps, but it still does not preserve every raw battle log from huge runs.
- Not fixed yet: fully fluid, fully customizable Champion team-builder UI.
- Not fixed yet: live DB `showdown_entities` as the approved runtime source, regional-form review closure, and remaining grouped battle-system mechanics beyond the shipped move audit.
- Not ready for broad accuracy claims: sim still needs deployed-browser v2.1.36 proof, source-drift guardrails, and Showdown/Champions oracle gates for future data changes.

## Current Next Path

1. Export one fresh single-run log, one fresh Run All log, and one `QA Artifact` from the public URL after `v2.1.36-core-move-parity`; verify build/source metadata, stable turn-log fields, legal Champion SP team data, `speed_order_details`, `stat_boosts`, `damage_events`, Low Kick/Tera Blast/Knock Off evidence when present, secondary-effect evidence when present, no team-load failure, no live-target `(no valid target)` failures, and retained-evidence summary counts.
2. Run the long-run/golden trace audit after v2.1.36 because intentional move-mechanics fixes can change deterministic traces even when winners remain valid.
3. Promote approved Showdown DB rows into generated runtime assets or explicitly document static fallback signoff so Supabase/source truth and the browser engine cannot drift silently.
4. Continue the grouped mechanics parity track beyond the shipped move audit: redirection, Protect family, switching/replacement, status, abilities, items, terrain/weather, regional/form data review, and Champions-only overrides.
5. Rebuild the edit-team surface into a full Champion team builder after the current sim-truth gates.
6. Decide whether partners need a full raw battle archive stream beyond the retained-evidence QA artifact.
7. Keep future Alfredo syncs on the protected-branch path: land in the Y fork, pass live-page checks, open an Alfredo PR, wait for required checks, then fast-forward the fork to the same merge commit.
