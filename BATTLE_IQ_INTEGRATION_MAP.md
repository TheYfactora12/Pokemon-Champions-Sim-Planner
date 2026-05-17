# Battle IQ Integration Naming Map (Existing + New)

## Existing live Strategy names (current baseline)
- `csBuildStrategyReportV2(teamKey, results, fmt)`
  - builder for Strategy V2 payload.
- `renderStrategyTab(teamKey)`
  - DOM renderer; use this for insertion.
- `csLoadReport(teamKey)` / `csSaveReport(teamKey, report)`
  - cache lifecycle.
- `_buildAnalysisPayload(playerKey, oppKey, bo, res)`
  - canonical persist payload.
- `runSimulation(... )`, `runBoSeries(... )`, and `buildAnalysisPayload(rawResult, ctx)`
  - simulation payload source(s).
- `matchupIntelligence` (internal variable) and `matchup_intelligence` (payload key)
- `bo3Adaptation` (internal variable) and `bo3_adaptation` (payload key)
- `buildMatchupIntelligence(...)`
  - existing builder to reuse context.
- `buildBO3Adaptation(...)`
  - existing builder path for BO3 behavior.
- `computeBoardTrend` / trend helpers and `computeTeamHistory`
  - useful for momentum + confidence features.
- `TEAMS`, `team.name`, `team.label`
  - team display resolution

## New Battle IQ naming map
- Public/namespaced block: `battle_iq`
- Core score: `report.battle_iq`

### Report payload shape additions
- `battle_iq.composite`
  - raw + standard + provisional + percentile + CI + band.
- `battle_iq.subscores`
  - list of 8 named substores.
- `battle_iq.confidence`
  - confidence level + reason codes.
- `battle_iq.top_factors`
  - `raised[]`, `lowered[]`.
- `battle_iq.drill_recommendation`
  - ranked recommendation.
- `battle_iq.matchup_context`
  - archetype + matchup class + difficulty + norm group key.
- `battle_iq.fingerprints`
  - repeated pattern objects.
- `battle_iq.bo3_adaptation`
  - set-level adaptation notes.
- `battle_iq.engine`
  - schema_version, engine_version, provenance.

### Backward compatibility aliases
- Keep legacy keys untouched.
- Optional derived alias for compatibility-only use:
  - `report.battle_iq.battle_condition_paths = report.top_win_paths` (read-only alias)

### UI section map
- `renderStrategyTab` insertion points:
  - after coaching_summary/trend section
  - before premium-only deep dive sections
- Ensure section is hidden if `!report.battle_iq`.

## Data flow map

1. `runSimulation` / `runBoSeries` produce raw results + winConditions in `engine.js`.
2. `buildAnalysisPayload` optionally enriches `analysis_payload.battle_iq` via additive runner.
3. `runBoSeries` and simulation callers feed results into report cache path via `_buildAnalysisPayload`.
4. `csLoadReport` loads report.
5. `csBuildStrategyReportV2` attaches/normalizes `battle_iq` into Strategy payload.
6. `renderStrategyTab` renders `battle_iq` section.

## Non-regression mapping
- Keep old keys:
  - `top_win_paths`, `top_loss_paths`, `matchup_intelligence`, `bo3_adaptation`
- New key `battle_iq` is additive only.
