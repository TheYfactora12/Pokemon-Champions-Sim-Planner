# Champion Sim Architecture and Evidence Map

Status: current for `v2.1.52-tactical-branch-memory` on 2026-06-24.

Use this file when QA, data reviewers, or repo maintainers need to understand how the simulator works, where source truth enters the system, what Supabase does, and what evidence proves a battle result.

## Plain-English Contract

The battle simulator is a deterministic rules engine, not an LLM brain. It does not guess damage, infer move behavior from text at runtime, or ask a model what should happen.

The intended architecture is:

```text
Source truth
  Pokemon Showdown data and simulator behavior
  Champion-specific official notes and reviewed overrides
  Cross-checkers such as Smogon calc and public documentation
        |
        v
Review and approval layer
  Supabase raw/approved data tables
  source hashes, sync runs, reviewed overrides
  approved Champion teams and legal move views
        |
        v
Generated runtime assets
  generated/pokemon_showdown_legal_data.js
  generated species weights and legality indexes
  runtime_data.js adapters and move-support metadata
        |
        v
Deterministic engine
  engine.js resolves turn order, targets, damage, recoil, drain,
  recovery, stat stages, speed modifiers, items, abilities, weather,
  terrain, switching, fainting, and battle outcome
        |
        v
QA evidence outputs
  downloaded turn-log JSON
  QA Artifact export
  qa_coverage_summary coverage counters
  Overview linked reports and local/CI test output
        |
        v
Optional persistence
  Supabase analyses/history stores bounded summaries and capped logs
  until a reviewed forensic-log retention upgrade is added
```

`v2.1.51-sim-test-scope` separates two player testing jobs in the Simulator UI: a selected-matchup drill for deep tactical coverage, and a preloaded-suite sweep for broader team validation. The high-volume 1,000 and 10,000 series options are stress tiers for collecting more lead-pair, move-line, target, switch, and timing evidence; they are not a claim of exhaustive game-tree proof.

`v2.1.52-tactical-branch-memory` extends forced branch rows with `tactical_summary`: Protect timing, pivot/switch timing, speed control, setup/redirection, first-KO timing, and early position delta. This lets the Strategy guide coach battle tactics from repeated branch evidence instead of only comparing move names.

## Layer Responsibilities

| Layer | Owns | Does not own | Current evidence |
| --- | --- | --- | --- |
| Pokemon Showdown upstream | Standard Pokemon data, move metadata, learnsets, target names, base mechanics baseline | Champion-only changes unless Showdown explicitly supports them | Generated Showdown files, source hashes, oracle tests |
| Champion overrides | Confirmed Champion-specific rule differences | Unreviewed guesses or inferred behavior | Override notes, Champion legality docs, focused tests |
| Supabase | Teams, team members, analyses/history, approved source rows, audit/sync tables, future approved runtime data | Live damage calculation, unreviewed mechanic decisions, secret service-role frontend access | DB tests, migrations, adapter contract, approved views |
| Generated assets | Offline GitHub Pages runtime inputs derived from approved data | Hidden hand-edited mechanic behavior | Bundle freshness checks, generated-data tests |
| `engine.js` | Deterministic battle mechanics and damage/effect execution | Long-term source data governance | Damage oracle tests, move registry tests, exported turn logs |
| `ui.js` | User workflows, selector gating, exports, Overview, QA Artifact | Final battle authority | Browser logs, QA Artifact metadata, Overview tests |
| Validators/tests | Contract checks for logs, source data, legality, bundle freshness, mechanics | Proof of every Pokemon edge case unless covered by a named test | `_run_all.sh --skip-db`, `_run_all_db.sh`, focused oracle suites |

## Branch Strategy Memory

`branch_coverage_runs` stores deterministic branch matrix rows keyed by player team, opponent team, player lead pair, opponent lead pair, and forced turn-1 move/target choices. This lets QA see which combinations have already been tested and which combinations still need coverage.

`v2.1.49` adds a strategy analysis layer on top of those rows:

- `branch_move_analysis.avoid_moves` flags low-result moves by matchup and actor.
- `branch_move_analysis.move_replacement_candidates` suggests legal swaps only when a better move has already been observed on the same set in the same lead/matchup context.
- `branch_move_analysis.suggested_lines` ranks better turn-1 lines against specific teams and leads.
- Every row carries confidence. `early_signal` means "test this more"; `strong` requires repeated samples and is the only tier intended for meta/team decisions.

This does not change the simulator. It changes how the Strategy guide consumes saved evidence. The player-facing language should stay close to competitive doubles/VGC vocabulary: team preview, lead pair, opposing lead, game plan, Protect, switching, pivoting, speed control, Trick Room, pressure, positioning, win condition, consistency, cores/modes, and matchup prep.

The Strategy tab now presents branch and sim evidence in player decision order: coach call first, then click plan, move swap, avoid trap, lead mode, matchup health, confidence, and next test. Evidence tables support the call; they should not bury the call.

## Supabase Boundary

Supabase is part of source truth and audit, but it is not the live battle calculator in this release.

Current DB-backed responsibilities:

- Load approved/gated teams when live DB is available.
- Persist analyses and bounded history rows.
- Store and expose approved source-data paths such as `approved_species_move_legality`.
- Support future promotion of `showdown_entities` plus `champions_overrides` into generated runtime assets.
- Reject or prevent stale/illegal team rows from replacing clean bundled data.

Current DB limitations:

- `showdown_entities` rows are not yet the direct battle runtime source.
- Saved analysis history is summary/capped storage, not full forensic turn-log storage.
- Live DB freshness is separate from local DB contract tests. Run live checks only with `RUN_LIVE_DB=1` and valid anon credentials.

Practical QA rule: for detailed math proof, use downloaded turn-log JSON or QA Artifact exports. Do not rely on saved Supabase history as the complete audit trail until the DB forensic-retention work is explicitly shipped.

## Damage Calculation Evidence

When QA says damage is wrong, the required proof object is a `damage_events` row from an exported turn log.

Important fields:

| Field | Meaning |
| --- | --- |
| `move` | Move that produced the damage row |
| `actor`, `actor_key`, `target`, `target_key` | Display and stable identity for source and target |
| `base_power`, `move_type`, `category` | Resolved move inputs after generated-data and dynamic engine rules |
| `attack_stat`, `defense_stat` | Final attacking and defending stats used by the damage path |
| `attack_stage`, `defense_stage` | Stat-stage evidence when stages affect damage |
| `type_effectiveness` | Type multiplier after target typing and Tera context |
| `stab`, `spread_modifier`, `weather_modifier`, `screen_modifier`, `final_modifier` | Major damage modifiers exposed for audit |
| `calculated_damage` | Formula output before HP cap |
| `damage`, `applied_damage`, `hp_delta` | Actual HP lost by the target |
| `overkill_damage`, `damage_capped_by_hp` | Proof that a KO was capped to remaining HP |
| `effect_tags` | High-level tags such as `recoil`, `drain-heal`, or `hp-cap` |
| `recoil_rule`, `drain_rule` | Structured effect math tied to applied target HP loss |
| `move_context` | Showdown description context when generated data has it |

Current rule: downstream recoil and modeled drain healing must use `applied_damage`, not raw overkill damage. If recoil would deal more HP than the user has left, keep the Showdown formula amount as `calculated_effect_damage` and report actual HP lost as `damage_applied_to_user`.

## Effect Evidence

Some mechanics change HP without being direct target damage. Those rows live in `effect_events`.

Examples:

- Recover, Roost, Life Dew, Heal Pulse, Pollen Puff ally healing
- Giga Drain and Matcha Gotcha drain healing
- Substitute, Clangorous Soul, Shed Tail HP costs
- Wish delayed healing
- Leech Seed drain and heal
- Leftovers healing
- Struggle recoil

Shed Tail has two different HP values: the user pays 1/2 max HP rounded up, while the transferred substitute has 1/4 max HP rounded down. Exported `effect_events` should show both `rule` and `substitute_rule`.

Important fields:

| Field | Meaning |
| --- | --- |
| `actor` / `actor_key` | Pokemon whose HP changed |
| `source` / `source_key` | Opposing or allied source when relevant |
| `move` | Move or item/effect name |
| `effect_kind` | Recovery, HP cost, drain heal, residual drain, item recovery, recoil, etc. |
| `hp_before`, `hp_after`, `hp_delta`, `max_hp` | Exact HP movement |
| `rule` | Ratio/basis/rounding when the effect uses structured math |
| `calculated_effect_damage` | Formula amount before the affected Pokemon's HP cap, when relevant |
| `damage_applied_to_user` | Actual user HP lost after the HP cap, when relevant |
| `move_context` | Showdown text context when available |

QA should compare `hp_delta` to `hp_after - hp_before`, then compare the `rule` basis to the source-truth wording.

## QA Coverage Summary

`v2.1.43` adds `qa_coverage_summary` to:

- downloaded turn-log JSON
- each retained QA replay card
- the top-level QA Artifact export

The summary is a coverage index, not a replacement for the raw turn log. It counts what the exported evidence actually triggered:

- total turns, action rows, `damage_events`, and `effect_events`
- super-effective, resisted, immune, crit, spread, HP-cap, screen, weather-modified, typed-item, Knock Off, stat-stage, base-power-modified, priority, Tailwind, Trick Room, recoil, drain, recovery, HP-cost, delayed-recovery, residual-drain, and item-recovery evidence
- damage/effect moves seen
- source truth versions from the generated Pokemon Showdown audit data
- `missing_targeted_proof`, which names mechanics not proven by that export

Important limitation: a clean log can only prove the mechanics that occurred. For example, a log with no Leech Seed row cannot prove Leech Seed, even if the validator passes.

## Team and Legality Evidence

Turn-log exports include team metadata so QA can audit legality without guessing from the four active Pokemon.

Look for:

- `player_team`
- `opponent_team`
- `team_preview`
- `build_id`
- `source_url`
- Champion SP spreads rather than SV EV spreads
- approved Champion format rows in normal selectors
- illegal imports/editor saves rejected before DB upsert

Known current catalog rule:

- Normal runtime selectors should stay on approved Champion-legal test teams.
- Legacy, inferred, SV-shaped, or move-conflict rows should be removed from selectors until reviewed.
- Custom teams must pass Champion legality gates before they can be trusted for QA.

## Speed, Order, and Stat Evidence

Turn snapshots and actions expose the fields QA needs for priority/order disputes:

- `speed_order_details`
- `stat_boosts`
- `stat_boosts_stable`
- `actor_key`, `target_key`, `target_side`
- item, ability, status, Tailwind, Trick Room, weather, speed stage, calculated Speed, effective Speed
- exact speed-tie markers when applicable

If a same-species mirror board appears, QA must use stable keys and side fields, not display names alone.

## Required QA Proof Workflow

For every public-site validation pass:

1. Open the newest cache-busted GitHub Pages URL.
2. Confirm the visible build label and exported `build_id`.
3. Run one single-team simulation and download the turn-log JSON.
4. Run Run All and download representative turn-log JSON.
5. Export one QA Artifact.
6. Validate logs with `node tools/validate-turn-logs.mjs <files>`.
7. Confirm no `player team not loaded` or live-target `(no valid target)` failures.
8. Inspect `qa_coverage_summary`, `player_team`, `opponent_team`, `damage_events`, `effect_events`, `speed_order_details`, and `stat_boosts`.
9. Record whether the sample includes the mechanic being claimed fixed. A green log that never used recoil does not prove recoil.

## Local Gates

Current high-signal commands:

```bash
node tests/showdown_damage_oracle_tests.js
node tests/move_verification_registry_tests.js
node tests/turn_log_export_validator_tests.js
node tests/qa_baseline_snapshot_tests.js
bash tests/_run_all.sh --skip-db
bash tests/_run_all_db.sh
bash tools/check-bundle.sh
```

Live DB checks require:

```bash
RUN_LIVE_DB=1 bash tests/_run_all_db.sh --live
```

Only use the live mode when valid anon credentials are present and it is acceptable to test against remote Supabase.

## How To Classify A New QA Finding

| Finding type | Meaning | First place to inspect |
| --- | --- | --- |
| Source-data drift | Upstream data changed or generated assets are stale | Showdown sync docs, generated data, source hashes |
| DB-source drift | Supabase row differs from bundled approved data | DB views, team gates, `approved_species_move_legality` |
| Engine bug | Deterministic mechanics disagree with source truth | `engine.js`, oracle tests, move registry tests |
| Export bug | Sim result may be right, but logs are missing/wrong evidence | `ui.js`, turn-log serializer, validator |
| Validator false positive | Export is right, validator assumes wrong identity/timing | `tools/validate-turn-logs.mjs` |
| Champion override needed | Standard Showdown behavior differs from confirmed Champions rule | Champions override docs/tests |

## Current Non-100% Gaps

Do not claim broad 100% accuracy until these are closed or explicitly accepted:

- Fresh deployed-browser `v2.1.44` single-run, Run All, and QA Artifact proof with corrected recoil applied-HP evidence.
- Live DB runtime-source promotion or explicit static fallback signoff.
- Full DB forensic-log retention design if Supabase must be the long-term audit store.
- Remaining grouped battle-system mechanics beyond shipped move coverage: redirection, Protect family, switching/replacement, status, item edge cases, terrain/weather edge cases, and Champion-specific overrides.
- Source-drift visibility that marks the Overview as update-needed when upstream data changes.
- Long stress automation with preserved failing seeds.
