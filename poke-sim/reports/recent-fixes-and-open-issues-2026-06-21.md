# Recent Fixes and Open Issue Snapshot - 2026-06-21

This snapshot records the current truth after the June 21 live-log review and GitHub issue sweep. It is meant to remove stale contradictions before pushing the Y fork and preparing the Alfredo upstream PR.

## Fixed Recently

| Area | Status | Evidence |
| --- | --- | --- |
| Live team-load failure | Fixed in `v2.1.21-sim-context-team-load` | `Run Simulation` and `Run All` now normalize DB/static teams through one sim context. Fresh exported logs no longer contain `player team not loaded`. |
| Sim identity drift risk | Guarded | Turn snapshots include side-prefixed stable keys such as `player:slot:0:Incineroar` and `opponent:slot:2:Incineroar`; four fresh logs had no duplicate or wrong-side stable keys. |
| Lethal Sitrus/Oran restore | Fixed locally in `v2.1.22-lethal-berry-guard` | Exported logs showed Sitrus restoring after `0 HP`; `engine.js` now requires `hp > 0` for damage-trigger berries. `items_tests.js` covers surviving Sitrus, lethal Sitrus rejection, lethal Oran rejection, and battle-log faint behavior. |
| GitHub Pages cache drift | Guarded for this release | `sw.js` cache bumped to `champions-sim-v54-lethal-berry-guard`; `index.html`, `ui.js`, and bundled `pokemon-champion-2026.html` carry `v2.1.22-lethal-berry-guard`. |
| Showdown static metadata use | Partially fixed | Battle construction and move metadata can use generated Showdown static rows first, then local fallbacks. This is not the same as live DB runtime consumption. |

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

## GitHub Issue Sweep

Checked open issues in:

- Y fork: `TheYfactora12/Pokemon-Champions-Sim-Planner`
- Alfredo upstream: `alfredocox/Pokemon-Champions-Sim-Planner`

Current active alignment issues:

| Repo | Issue | Current truth |
| --- | --- | --- |
| Alfredo | [#241](https://github.com/alfredocox/Pokemon-Champions-Sim-Planner/issues/241) | `showdown_entities` has live DB rows, but battle runtime does not query those rows yet. Static/generated data is still the runtime source. |
| Alfredo | [#240](https://github.com/alfredocox/Pokemon-Champions-Sim-Planner/issues/240) | Champion-only selector/import gating is still needed: reject IV/EV teams, exclude illegal SV-format teams, and rename remaining EV/IV UI text to SP. |
| Alfredo | [#231](https://github.com/alfredocox/Pokemon-Champions-Sim-Planner/issues/231) | Josh workbook review has JD comment: Showdown data is present but not fully used for move calculation; regional forms such as Arcanine need extra scrutiny. |
| Y fork | [#137](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/issues/137) | Tracks Showdown DB sync/runtime/fallback audit. Needs update or sibling issues for Alfredo #241/#240 so the fork does not look more complete than upstream. |
| Y fork | [#123](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/issues/123) | Josh workbook review mirror. Needs the Alfredo #231 JD comment mirrored or linked. |

## No-Contradiction Status

Use these statements in team updates and PR notes:

- Fixed: live sim team context/load path.
- Fixed: stable battle identity keys in logs.
- Fixed locally: lethal Sitrus/Oran restore bug.
- Not fixed yet: live DB `showdown_entities` as the battle runtime source.
- Not fixed yet: full Champion-only SP gate for selectors/imports and all UI labels.
- Not fixed yet: full move/damage/regional-form parity audit.
- Not ready for broad accuracy claims: sim still needs grouped mechanics parity work and Showdown/Champions oracle gates.

## Next Push Path

1. Run focused item tests and full non-DB test sweep.
2. Push `v2.1.22-lethal-berry-guard` to `TheYfactora12/main`.
3. Wait for GitHub Pages deploy.
4. Test `https://theyfactora12.github.io/Pokemon-Champions-Sim-Planner/poke-sim/pokemon-champion-2026.html`.
5. Export one single-run log, one Run All log, and any log where Sitrus/Oran appears.
6. Mirror/update issue notes in the Y fork for Alfredo #241, #240, and #231.
7. Prepare a reviewed upstream PR to Alfredo after live Y verification passes.

