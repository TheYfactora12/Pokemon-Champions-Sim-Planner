# Baseline type-effectiveness repair — 2026-10-21

Scope: synthetic baseline doubles direct damage, not full-turn or current-client certification. Reference: Champions mod at Showdown `9b136a8c8cdb860a8ab96fa063f906604e352547`.

The engine omitted Bug resistance against Poison. The separate shared chart additionally treated Ice against Fire/Steel as 2x instead of 0.5x, and Fighting/Rock as 2x instead of neutral. Runtime and report generator now use the single shared chart; independent expectations use external Dex, never that chart.

Preserved fail-before receipt: `poke-sim/reports/type-effectiveness-2026-10-21/fail-before.json`, 163 mismatches. Pass-after receipt in the same directory: zero of 5,832 mismatches, comprising 324 single-type and 5,508 ordered dual-type inputs. Each checks the shared helper, actual engine factor and numerical damage. Eight reversal controls test all five faulty cells, dual multiplication, second-type inclusion and immunity.

Original Weezing U-turn versus Venusaur (Defense 95, no item/weather/critical) is checked on both sides over 16 rolls: reference 31–37, old runtime 62–74, repaired runtime 31–37. Stable cases TYPE-MATRIX-001 and TYPE-BUG-POISON-001. Focused command: `node tests/type_effectiveness_reference_tests.mjs`. External reference requires CHAMPIONS_REFERENCE_SIM pointing to pinned dist/sim and NODE_PATH pointing to installed dependencies.

Independent review reproduced the complete matrix and seven initial mutants; an additional immunity mutant was independently caught and added permanently. Source hashes and capture dates are in receipts. A new capture's source_commit identifies its Git base; source_hashes identify tested working bytes before the eventual commit.

Limits: synthetic type combinations are not a legality roster. Special moves, abilities/items, grounding, Tera, singles execution and full-turn targeting are outside the baseline matrix. Eviolite negative-stage rounding is separate and unresolved. Generated roster report is local inventory, not another independent oracle. No goldens were approved or silently replaced.

Local complete gates, clean checkout, fresh bounded tracker enrollment and exact-head hosted CI remain pending for this candidate. Previous snow checkpoint completed at 0e23c061; no merge, preview publication, production deployment or security change is authorized.

At 2026-10-21T06:34:05.938Z independent v11 review reproduced all six refreshed bounded captures and 36 rejection controls against runtime commit 55a1136bd1a0ed539dc5dba74259a8c4366faed6. The canonical tracker now contains six current bounded passes and 67 historical/attempt rows. This does not mark the whole move catalog verified. Independent release review passed 12 release checks, 11 matrix tests and external asset verification; bundle has 2,547 bytes headroom under the unchanged cap. Aggregate and hosted results remain separate pending stages.

Checkpoint completion: exact source 5c93802893a15bb9716f9143fe20f2cfc5a7c345 passed clean 281 fast/12 offline DB files, 103 battle files, historical goldens, 4,500 seeded battles, methodology and 9,248 invariant battles. Source CI39558932907 and metadata publication3e441cf CI39562265788 each passed all six jobs, the latter at2026-10-21T07:58:18Z. This completes the draft type-chart scope, not release or deployment. Later engine changes invalidate bounded runtime receipts until rerun.
