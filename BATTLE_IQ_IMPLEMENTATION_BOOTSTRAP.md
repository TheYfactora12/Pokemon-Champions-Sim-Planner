# Battle IQ Implementation Bootstrap (Phase-Ordered)

## Objective
Implement additive Battle IQ in one coherent pass, minimizing regressions in Strategy V2 and preserving existing keys.

## 0) Preflight (already complete)
- [x] Master contracts documented: `BATTLE_IQ_MASTER_PROMPT.md`
- [x] Technical decomposition documented: `BATTLE_IQ_TECH_DESIGN.md`
- [x] Scoring formulas documented: `BATTLE_IQ_SCORING_SPEC.md`
- [x] Test matrix documented: `BATTLE_IQ_TEST_MATRIX.md`

## 1) Add module scaffolding
1. Create `poke-sim/battle_iq/` and add:
   - `contracts.js`
   - `parser.js`
   - `snapshot.js`
   - `context.js`
   - `subscores/*.js`
   - `score.js`
   - `confidence.js`
   - `normalize.js`
   - `summary.js`
   - `drills.js`
   - `fingerprints.js`
   - `bo3.js`
   - `runner.js`

## 2) Contracts-first implementation
1. Implement constants + payload contracts in `contracts.js`.
2. Export `BATTLE_IQ_SCHEMA_VERSION`, `WEIGHTS`, and type-safe defaults.
3. Add `isBattleIQAvailable(ctx)` + `sanitizeBattleIQBundle(bundle)`.

## 3) Parser + board state
1. Implement deterministic parser in `parser.js` from existing log sources.
2. Implement snapshot builder in `snapshot.js`.
3. Ensure no throws on malformed logs; emit `parse_warnings` + `completeness`.

## 4) Context + archetypes
1. Implement `context.js` to infer:
   - archetypeA/archetypeB, matchup class, difficulty, norm group hint.
2. Add confidence factors for context certainty.

## 5) Sub-score calculators
Implement one function per file in `subscores/`:
- `lead.js`
- `turn1.js`
- `speedControl.js`
- `resource.js`
- `threatRecognition.js`
- `winCondition.js`
- `endgame.js`
- `riskDiscipline.js`

Each returns normalized evidence object and does not mutate shared state.

## 6) Composite scoring
1. Implement weighted aggregator in `score.js`:
   - base/redistributed weights
   - subscore guard for inactive categories
2. Implement normalization path in `normalize.js`.
3. Implement confidence model in `confidence.js` and confidence gating.

## 7) Explanation + coaching
1. Implement `summary.js` for coach-facing top-drivers/drags + drill output.
2. Implement `drills.js` mapping weak areas to drills.
3. Implement `fingerprints.js` with repeated pattern IDs.
4. Implement `bo3.js` for adaptation delta extraction.

## 8) Engine integration (additive)
1. In `poke-sim/engine.js`:
   - add optional pure `buildBattleIQFromRawResult(rawResult, ctx)` call near `buildAnalysisPayload` helpers.
   - keep legacy fields unchanged.

## 9) Strategy V2 integration
1. In `poke-sim/ui.js`:
   - inject `battle_iq` into report payload in `csBuildStrategyReportV2`.
   - add new render section in `renderStrategyTab` guarded by presence.
   - keep fallback behavior for old payloads.

## 10) Premium hooks
1. Add gating:
   - free preview keys + drill
   - premium unlocks full sub-scores, trend, fingerprints, bo3 adaptation detail.
2. Reuse existing premium UI conditions and feature flags if available.

## 11) Tests
1. Add test files from matrix and wire to runner.
2. Add fixtures for stress cases.
3. Add render tests for Strategy V2 with `battle_iq` on/off.

## 12) Hardening and release
1. Add logging reason codes for:
   - low completeness
   - unknown teams
   - low confidence
   - no norm coverage
2. Confirm no IDs in coach text, no loss labels in win paths, no denominator regressions.
3. Build bundle step and smoke tests.

## Execution discipline
- Never remove existing keys.
- Never change existing Strategy behavior when `battle_iq` is absent.
- Always keep raw and transformed values for audit.
