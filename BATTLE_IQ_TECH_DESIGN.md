# Battle IQ Technical Design

## Purpose
Define concrete modules, function boundaries, and data contracts for implementing Battle IQ without regressing existing Strategy Guide behavior.

## Architecture at a glance
- Input layer: Showdown logs + simulator outputs
- Normalization layer: deterministic parsing into battle events and board snapshots
- Evidence layer: extractors for 8 sub-scores
- Scoring layer: raw → normalized, confidence, composite, percentile
- Integration layer: Strategy V2 report assembly with additive `battle_iq`
- Persistence layer: write/read profiles, fingerprints, trends
- Delivery layer: free + premium renderers, drill recommendations

## Module layout (recommended)
Place in existing `poke-sim` tree:

- `poke-sim/battle_iq/`
  - `contracts.js`
  - `parser.js`
  - `snapshot.js`
  - `context.js`
  - `subscores/` (one file per sub-score)
  - `score.js`
  - `confidence.js`
  - `normalize.js`
  - `summary.js`
  - `drills.js`
  - `fingerprints.js`
  - `bo3.js`
  - `runner.js`
- `ui.js`: consume `battle_iq` in Strategy V2 report path and render section.

## Contract objects

### `buildBattleIQFromSimulation(input, ctx)`
Top-level entry.
- Inputs:
  - `input`: battle/series result payload from existing simulation (`rawResult`, `battle_events`, `team`, `opponent_team`, `format`)
  - `ctx`: context `{ schema_version, user_tier, feature_flags, timestamp, norm_group_hint }`
- Outputs:
  - `{battle_iq, evidence, debug }`
- Behavior:
  - No side effects.
  - Must not alter existing `runSimulation` payloads.

### `parseBattleLogs(rawLog)`
- Input: raw Showdown log (string or object from prior format)
- Output: `battle_event[]`
- Failure handling:
  - Return `{ events:[], parse_warnings:[], completeness }` instead of throw on malformed segments.

### `buildBoardSnapshots(events)`
- Input: `battle_event[]`
- Output: `board_snapshot[]` with per-turn deterministic state.

### `inferMatchupContext(snapshot_data, result_metadata)`
- Input: snapshots + teams + format
- Output: `{ archetypeA, archetypeB, matchup_class, match_difficulty, norm_group_key }`

### `computeSubScoreXxx(data)` (8 functions)
- Input: shared `scoreCtx` object containing snapshots, context, metadata, event indices
- Output per-sub object:
  - `{ name, raw_0_100, numerator, denominator, positives, negatives, confidence_0_1, evidence }`

### `composeBattleIQ(subscores, context)`
- Input: all 8 subs + weight map + outcome/denominator metadata
- Output:
  - `composite_raw_0_100`
  - optional `standard_score`
  - confidence tag
  - provisional status

### `normalizeAgainstNorms(composite_raw, normContext)`
- Input: raw and norm keys
- Output: `{ standard_score, percentile, ci_95_lo, ci_95_hi }`
- If no norm sample: mark provisional and return converted but low-confidence form.

### `buildBattleIQConfidence(profile)`
- Input: completeness, turns, visibility, sample size, outcome clarity, context certainty
- Output: `{ confidence_level, confidence_label, provisional, reason_codes[] }`

### `generateBattleIQSummary(iqBundle, subscores, ctx)`
- Output coachable text blocks:
  - header
  - top raises
  - top drags
  - one drill
  - no speculative claims.

### `buildBattleIQTraces(rawResult)`
- Output: repeated pattern/fingerprint candidates with impact and frequency.

### `buildBattleIQBo3Adaptation(seriesResults)`
- Input: per-game records
- Output: adaptation notes and delta by game.

## Integration touchpoints

### Engine
- Add helper function in `engine.js`:
  - pure: `buildBattleIQFromRawResult(rawResult, ctx)`
- Optional extension point for payload builder:
  - include `battle_iq` in returned analysis object.

### UI / Strategy
- `ui.js` (Strategy V2 path)
  - extend report builder: `csBuildStrategyReportV2()` appends `battle_iq`.
  - renderer: add section guarded by `battle_iq` presence.
  - label resolution helper should always map `teamId -> displayName` before display.

### Persistence
- Extend report cache schema with additive `battle_iq` namespace.
- Keep read path backward-compatible when absent.

### Premium path
- Add gated rendering for:
  - sub-score breakdown
  - trend graph data
  - matchup/team/archetype views
  - fingerprint blocks

## Non-goal in phase 1
- No new simulator mechanics
- No hardcoded archetype taxonomies beyond MVP set
- No auto-generated confidence claims from low evidence

## Safety invariants
- `loss` labels excluded from win-path outputs
- `percent denom` checks for each percentage computation
- internal identifiers are never rendered directly
- no raw model/debug text in user-facing messages

