# Confirmed reference discrepancies after bounded snow repair

Candidate: `a2c26bb1452bec0e4e16b1ea24b88ebec303db8c`.
Executable reference: `smogon/pokemon-showdown@9b136a8c8cdb860a8ab96fa063f906604e352547`, Champions doubles custom game. These synthetic probes establish reference disagreement, not current-client proof or regulation legality.

The exact normalized inputs, teams, logs and all 16 numerical outcomes are in `snow-next-gap-reproductions.json`. Run `probe-snow-next-gaps.mjs` with `NODE_PATH` set to the candidate's `poke-sim/node_modules` and `CHAMPIONS_REFERENCE_SIM` set to the pinned executable reference's `dist/sim` directory. Both player/opponent orientations reproduce every case. No repair is included in the frozen candidate.

## Priority 1: Bug versus Poison resistance

Weezing uses U-turn against Venusaur, synthetic Defense 95, stage 0, no weather, item, critical, Gas or weather suppression. Reference damage is 31–37; candidate damage is 62–74. Candidate's Bug type-chart row omits Poison resistance. This is a confirmed narrow defect; correct the chart with isolated type and dual-type controls plus a reversal mutant before wider claims.

## Priority 2: Eviolite and negative Defense stage ordering

Weezing uses U-turn against Snover with Eviolite, synthetic Defense 95, stage −1, no critical/Gas/suppression. In snow, reference damage is 44–52 versus candidate 42–50. Without weather, reference is 64–76 versus candidate 62–74. The clear-weather failure separates this pre-existing stat-ordering defect from the newly fixed snow modifier. Review stage truncation versus item modification ordering using exact stat and damage boundaries; do not broadly reorder all modifiers without tests.

The earlier independent ordering capture is preserved in the repository at `poke-sim/reports/snow-defense-2026-10-21/open-eviolite-ordering.json`. The new probe retains full vectors rather than only these ranges. Neither discrepancy is merely an untested possibility, and neither is a claim about an observed client build.
