# Champion Parity 100 Checklist

Generated: 2026-06-23

This file defines what we mean by "100% Champion accuracy" for the simulator. It is a release gate, not a claim that every possible future Pokemon edge case has been mathematically proven. The practical standard is: every shipped Champion team, move, item, ability, spread, target rule, and exported proof path must be legal, traceable to source truth, tested, and visibly labeled when any part is still under review.

## Current Snapshot

- Current local build target: `v2.1.36-core-move-parity`
- Primary mechanics source truth: Pokemon Showdown data and behavior, with Champion-specific differences documented as explicit overrides.
- Showdown source snapshot in generated data: `3f5079d395ad018f13e8f785a675a13bd4cbf59e (2026-05-24)`
- Showdown damage oracle: `56/56` local cases passing after the core shipped-move parity slice.
- Move support audit: `120 verified`, `0 baseline`, `0 incomplete` across `120` shipped distinct moves.
- Ability inventory: `80/80` curated and mega abilities modeled.
- Latest live logs reviewed: `v2.1.33` exports were structurally clean with no team-load failure and no live-target no-valid-target bug.
- Fresh live proof still needed after this release: GitHub Pages `?v=<new-sha>`, one single-run log, one Run All log, and one QA Artifact from `v2.1.36`.

## Do Not Claim Broad 100% Until

- Shipped moves have `0 incomplete`, `0 baseline`, and every shipped move has explicit regression or oracle coverage.
- All bundled Champion teams pass legal Champion SP, item, ability, move, species/form, Tera, and import/export checks.
- Supabase rows cannot replace clean bundled teams with stale SV data, illegal spreads, unsupported items, or malformed payloads.
- Browser single-run, Run All, exported turn logs, and QA Artifact proof are clean on the deployed GitHub Pages build.
- `build_id`, `source_url`, service-worker cache, bundle build, and source commit/version all agree.
- Known gaps are visible in the Overview and reports instead of hidden behind a readiness claim.
- Showdown source drift or Champion source conflicts show an update-needed state until reviewed and either promoted or documented as an override.

## Confirmed Closed In This Slice

- Low Kick no longer reads Showdown `basePower: 0` as no damage.
- The engine reads target species weight from `generated/pokemon_showdown_species_weights.js`.
- The weight file is generated from Pokemon Showdown `data/pokedex.ts` at the same source snapshot as the generated legal data.
- Low Kick base-power tiering is covered against `@smogon/calc` for a heavy target and a mid-weight target.
- The type multiplier audit now treats Low Kick and Grass Knot as damaging variable-base-power moves instead of status/no-damage rows.
- The former 35 baseline shipped moves are now promoted to verified coverage in `move_support.js`.
- `showdown_damage_oracle_tests.js` covers the remaining direct and spread damage ranges against `@smogon/calc`, plus Foul Play target-Attack damage and Darkest Lariat defense-stage bypass.
- `move_verification_registry_tests.js` covers Dual Wingbeat two-hit behavior, Poltergeist no-item failure, Leaf Storm self-drop, Stomping Tantrum prior-fail boost, weather and true-accuracy rules, secondary stat/status effects, Throat Chop sound locking, Hurricane confusion, Light of Ruin recoil, and Ice Shard priority.

## Former Baseline Move Groups Closed

1. Spread and weather accuracy: Heat Wave, Blizzard, Dazzling Gleam, Sludge Wave, Hurricane, Thunder.
2. Variable base power and item/state moves: Foul Play, Poltergeist, Grass Knot if it enters shipped teams, and Stomping Tantrum.
3. Secondary status/stat effects: Scald, Scorching Sands, Poison Jab, Gunk Shot, Crunch, Energy Ball, Earth Power, Flash Cannon, Focus Blast, Flamethrower, Fire Punch, Ice Beam, Ice Punch, Ice Shard.
4. Damage-only and recoil/priority coverage: Aura Sphere, Dragon Pulse, Hydro Pump, Liquidation, Power Gem, Psychic, Throat Chop, Kowtow Cleave, Darkest Lariat, Leaf Storm, Light of Ruin, Dual Wingbeat.
5. Any future move promoted from baseline must name the source truth, test file, and exact behavior covered in `move_support.js`.

## Browser Proof Gate

For each release that changes engine logic, generated data, legality, runtime data, or UI proof:

- Rebuild `poke-sim/pokemon-champion-2026.html`.
- Bump `index.html`, `ui.js`, and `sw.js` build/cache labels.
- Open the GitHub Pages URL with `?v=<commit-sha>`.
- Export one single-run turn log.
- Export one Run All turn log.
- Export one QA Artifact.
- Validate logs with `tools/validate-turn-logs.mjs`.
- Check for team-load failures, stale source URLs, illegal Champion spreads, item drift, missing damage evidence, no-valid-target rows while a live target exists, and missing retained-evidence counts.

## Source Truth Architecture

- Mechanics live in `engine.js` and focused runtime modules.
- Generated Showdown data feeds the engine; it is not the engine.
- Supabase stores teams, analyses, approved source rows, overrides, and audit history.
- Supabase should not be used as the live damage calculator in the browser.
- The GitHub Pages bundle must remain deterministic and testable offline from generated assets.
- Champion-specific deviations must live as reviewed overrides with source notes and tests.

## Open Gaps To Keep Visible

- The live battle runtime still does not query approved `showdown_entities` rows directly.
- Alfredo Pages deployment remains blocked by repo Pages/admin configuration; source parity is separate from deployed Alfredo Pages proof.
- No fresh browser-exported Tera Blast damage event has been observed yet after the latest Tera Blast release.
- Fresh `v2.1.36` browser proof is still required after deploy before broad partner-facing accuracy claims.
- Full raw thousand-battle archival is not automatic; current browser retention is capped and QA Artifact exports retained evidence.
- The edit-team UI is guarded for legality but still needs a fluid full Champion builder.
