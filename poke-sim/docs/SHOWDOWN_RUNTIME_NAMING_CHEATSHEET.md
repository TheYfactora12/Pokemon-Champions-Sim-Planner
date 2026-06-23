# Showdown Runtime Naming Cheatsheet

Purpose: prevent source-truth drift when Pokemon Showdown data is converted into Champion sim runtime behavior.

The rule is simple: Showdown names are source data. Engine names are control-flow categories. Raw Showdown vocabulary should enter the sim through `runtime_data.js`, then battle logic should consume canonical engine names.

## Target Categories

This table is enforced by `ChampionsSim.runtimeData.normalizeMoveTargetCategory()` in `poke-sim/runtime_data.js`.

| Pokemon Showdown target value | Champion sim engine category | Notes |
| --- | --- | --- |
| `normal` | `normal` | Standard single-target move. |
| `any` | `normal` | Collapsed because the current engine does not model long-range target distance. |
| `adjacentFoe` | `adjacent-foe` | Single adjacent foe. |
| `randomNormal` | `random-foe` | Random foe-style target. |
| `allAdjacent` | `all-adjacent` | Hits all adjacent battlers, including ally where applicable. |
| `allAdjacentFoes` | `all-adjacent-foes` | Spread move into opposing active slots, such as Hyper Voice. |
| `all` | `all-adjacent` | Current engine bucket for all active battlers. |
| `foeSide` | `all-foes` | Opposing side condition or effect. |
| `allAdjacentAlly` | `all-allies` | Ally-side targeting collapsed to current ally bucket. |
| `allAllies` | `all-allies` | All allies / ally side. |
| `adjacentAlly` | `all-allies` | Ally targeting collapsed to current ally bucket. |
| `adjacentAllyOrSelf` | `all-allies` | Ally/self targeting collapsed to current ally bucket. |
| `allies` | `all-allies` | Ally-side targeting. |
| `allyTeam` | `all-allies` | Ally team targeting. |
| `allySide` | `self` | Side-condition style target; currently represented by self/own side logic. |
| `scripted` | `normal` | Scripted target source, collapsed to default unless an explicit move implementation overrides it. |
| `self` | `self` | Self-targeting. |

If a new Showdown target value appears, do not patch the engine switch first. Add it to the runtime bridge map, classify the engine category, and let `tests/runtime_data_bridge_tests.js` prove the mapping.

## Engine Categories

These are the currently supported target buckets in the battle engine:

- `normal`
- `adjacent-foe`
- `all-adjacent`
- `all-adjacent-foes`
- `all-foes`
- `all-allies`
- `self`
- `random-foe`

Anything outside this list should fail the bridge tests before it can affect battle behavior.

## Other Common Naming Boundaries

| Source shape | Runtime/engine shape | Rule |
| --- | --- | --- |
| Showdown ids, such as `hypervoice` | Display names, such as `Hyper Voice` | Use existing id/name helpers; do not compare raw display strings when an id helper exists. |
| Showdown stats `hp/atk/def/spa/spd/spe` | UI labels `HP/Atk/Def/SpA/SpD/Spe` | Keep storage and calc code on lowercase stat keys; convert only at display/export boundaries. |
| Showdown move category `Physical/Special/Status` | Same semantic category | No rename needed, but read through runtime data helpers before local fallbacks. |
| Showdown move flags, such as `contact` | Boolean helper checks, such as `moveHasFlag(move, 'contact')` | Prefer flag helper calls over duplicating local move-name lists. |
| Showdown mirrored row | Champions override row | Never edit mirrored Showdown data to represent a Champions-only rule. Add an override with source notes and tests. |

## Review Checklist

Before merging a data or mechanics change that touches naming:

1. Confirm whether the changed value is raw Showdown source vocabulary or engine control-flow vocabulary.
2. If it is raw source vocabulary, translate it in `runtime_data.js` or the approved data generator, not inside unrelated move logic.
3. Add or update a bridge test that enumerates the generated values and fails on unmapped terms.
4. Add a behavior test for at least one move/team case that would have failed before the mapping.
5. Rebuild the GitHub Pages bundle if runtime source files changed.

Current guard tests:

- `tests/runtime_data_bridge_tests.js`
- `tests/move_verification_registry_tests.js`
- `tests/showdown_runtime_data_tests.js`
- `tests/showdown_priority_drift_tests.js`
- `tests/showdown_damage_oracle_tests.js`
