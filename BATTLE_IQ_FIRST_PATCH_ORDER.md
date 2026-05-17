# Battle IQ First Patch Order

## Goal
Add Battle IQ on top of the corrected Strategy analytics path without reopening the known regressions:
- loss labels as win paths
- internal team IDs in trainer UI
- wrong denominators
- omitted coaching sections
- raw machine-output language

## Phase 1: wire additive payloads only
1. `poke-sim/engine.js`
- Add `buildBattleIQFromRawResult(rawResult, ctx)` as a pure helper near `buildAnalysisPayload(...)`.
- Return `null` safely if evidence is too thin.
- Do not mutate existing `rawResult`.
- Do not alter current `top_win_paths` filtering logic.

2. `poke-sim/engine.js`
- In `buildAnalysisPayload(rawResult, ctx)`, append additive key:
- `battle_iq: buildBattleIQFromRawResult(rawResult, ctx)`
- Keep all legacy keys unchanged.

3. `poke-sim/ui.js`
- In `_buildAnalysisPayload(playerKey, oppKey, bo, res)`, preserve any upstream `battle_iq` block if present.
- Do not recompute percentages here from total series if the metric is win-path based.

## Phase 2: strategy report integration
4. `poke-sim/ui.js`
- In `csBuildStrategyReportV2(teamKey, results, fmt)`, add a Battle IQ builder call after:
- `dashboardTrends`
- `matchupIntelligence`
- `bo3Adaptation`
- Use those corrected structures as context inputs.

5. `poke-sim/ui.js`
- Append additive report fields:
- `battle_iq`
- `battle_iq_summary`
- `battle_iq_drill`
- Keep `matchup_intelligence` and `bo3_adaptation` untouched.

6. `poke-sim/ui.js`
- Use `csDisplayTeamLabel(...)` for every trainer-facing team reference in Battle IQ.
- Never surface raw team keys in evidence, fingerprints, drill copy, or matchup slices.

## Phase 3: render path
7. `poke-sim/ui.js`
- In `renderStrategyTab(teamKey)`, insert Battle IQ rendering after the existing trend / matchup coaching cluster.
- Guard the section with `if (report.battle_iq)`.
- If absent, render nothing and preserve legacy output.

8. `poke-sim/ui.js`
- Battle IQ render rules:
- win-path percentages use `wins`
- set adaptation percentages use set counts
- low-confidence outputs show `provisional`
- only coach-style text reaches the DOM

## Phase 4: tests
9. `poke-sim/tests/analytics_tests.js`
- Add payload-shape test for additive `battle_iq`.
- Add denominator test for Battle IQ win-path references.
- Add label-hygiene test so internal team IDs never reach trainer-facing Battle IQ strings.

10. `poke-sim/tests/t194_strategy_tab_render_tests.js`
- Add Battle IQ render-on test.
- Add Battle IQ render-off backward-compat test.
- Assert `matchup_intelligence` and `bo3_adaptation` still render when Battle IQ is present.

11. Add new focused test file
- `poke-sim/tests/battle_iq_contract_tests.js`
- Cover composite shape, confidence gates, provisional behavior, and no-loss-label references.

## Phase 5: real-log fixtures
12. Create replay-fixture intake path
- `poke-sim/tests/fixtures/replays/`
- Store normalized copies or raw replay JSON snapshots.
- Keep singles and doubles separated.

13. First real-log fixture categories
- doubles Bo1
- doubles Bo3
- singles standard
- incomplete / early-stop replay

## Stop conditions
- Stop if Battle IQ needs a new denominator convention that conflicts with current Strategy fixes.
- Stop if team-label mapping cannot reuse `csDisplayTeamLabel(...)`.
- Stop if render insertion causes `matchup_intelligence` or `bo3_adaptation` omission.
