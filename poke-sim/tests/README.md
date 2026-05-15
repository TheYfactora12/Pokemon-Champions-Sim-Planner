# Poke-e-Sim Champion 2026 - Test Suite

Node-based regression and unit tests for `engine.js` and `data.js`. All tests load source files into a VM context (no bundling required) and run in ~3s combined.

## Run all tests

```bash
cd poke-sim
node tests/items_tests.js      # T9j.6 — items (#29 #8 #18 #11 #43) — 14 cases
node tests/status_tests.js     # T9j.4 + T9j.5 — status residuals (#41 #17) — 27 cases
node tests/mega_tests.js       # T9j.7 — mega evolution + trigger sweep (#23) — 27 cases
node tests/coverage_tests.js   # T9j.3b — coverage + speed control (#36 #33) — 9 cases
node tests/t9j8_tests.js       # T9j.8 — ability hooks (#38 #37) — 47 cases
node tests/t9j9_tests.js       # T9j.9 — nature + EV + IV stat math (#4 #5) — 24 cases
node tests/t9j10_tests.js      # T9j.10 — bring N-of-6 picker state (#16) — 16 cases
node tests/t9j11_tests.js      # T9j.11 — custom teams bulk I/O + filter (#73) — 16 cases
node tests/t9j12_tests.js      # T9j.12 — simulator bring picker (#74) — 11 cases
node tests/t9j13_tests.js      # T9j.13 — format mismatch guard + SP rescale (#42) — 47 cases
node tests/t9j14_tests.js      # T9j.14 — Shadow Pressure PDF + coaching notes (#75) — 25 cases
node tests/t9j15_tests.js      # T9j.15 — Best Mega Trigger Turn card (#71) — 22 cases
node tests/phase4c_detectors.js # Phase 4c — detectors + confidence badges (4 fixtures) — 17 cases
node tests/phase4d_threat_response_tests.js # Phase 4d — threat response solver + line classifier — 7 cases
node tests/phase4e_policy_regression.js # Phase 4e — policy audit / T5 static-advice gate — 13 cases
node tests/mechanics_audit.js      # Mechanics audit — move-rule checks used by smoke test
node tests/t159_mobile_roster_layout_tests.js # Mobile roster layout safeguards
node tests/t160_distinct_battle_team_tests.js # Battle team selection must stay distinct
node tests/t161_team_member_uniqueness_tests.js # Catalog teams must not repeat members
node tests/phase5_turn_log_tests.js # Phase 5 — turnLog, positionScore, Replay Log v2 — 10 cases
node tests/phase6_coaching_voice.js # Phase 6 — coaching templates, linter, RNG gate — 9 cases
node tests/structured_logger_tests.js # Infra — structured logger and no raw runtime console calls — 5 cases
node tests/golden_battles_runner.js  # M7 — golden battles deterministic regression — 3 battles
node tests/audit.js            # 5070-battle audit across all 13 teams — 0 JS errors floor

# Nightly (not in fast loop — ~5-25s depending on N)
N=500 node tests/nightly_bring_harness.js    # end-to-end bring picker wiring check across 5 matchups
```

## Green baseline (current)

| Suite | Pass | Notes |
|---|---|---|
| items | 14/14 | Leftovers, Focus Sash, Choice Scarf, stat reset, WONTFIX regressions |
| status | 27/27 | Poison, toxic, freeze, paralysis 12.5%, sleep 3-turn cap |
| mega | 27/27 | Dynamic mega evolution, trigger sweep, base-form lead |
| coverage | 9/9 | Speed control category, meta radar |
| t9j8 | 47/47 | Ability hook coverage |
| t9j9 | 24/24 | Nature + EV + IV stat math |
| t9j10 | 16/16 | Bring state + random-mode rerolls |
| t9j11 | 16/16 | Custom team bulk import/export + filter chips |
| t9j12 | 11/11 | Simulator bring picker + shared Teams/Sim state |
| t9j13 | 47/47 | Format-mismatch guard + SP rescale (cofagrigus_tr, aurora_veil_froslass) |
| t9j14 | 25/25 | Shadow Pressure PDF master sheet + coaching notes + pluggable COACHING_RULES |
| t9j15 | 22/22 | Best Mega Trigger Turn card — Pilot Guide + PDF column, severity bands, sweep cache |
| phase4c | 17/17 | Detectors (dead moves, lead perf, loss conditions) + confidence badges, 4 fixtures incl. high-n null effect |
| phase4d | 7/7 | Threat-response solver, cache, idle fallback, line labels, renderer |
| phase4e | 13/13 | Policy output audit, fake-good detector, behavior patterns, T5 adaptive-advice gate, weakness dashboard |
| mechanics_audit | 20/20 | Core move-rule checks: Protect, Taunt, support leads, Sucker Punch, Feint, shield riders, recovery, sleep, Substitute, Imprison, Ally Switch, Mega weather triggers, slot retargeting, Roost grounding |
| phase5 | 10/10 | Turn log struct, positionScore, swing-turn delta, Replay Log v2 |
| phase6 | 9/9 | PRE/IN/POST coaching voice, banned phrasing linter, RNG gate, footer/proximity |
| logger | 5/5 | Structured logger, default level, error fields, no raw runtime console calls |
| **Total** | **351/351** | |
| audit | 0 JS errors | 5070 battles across 13 teams |

## Conventions

- **Harness:** each test file is standalone Node. Uses `vm.createContext` to load `data.js` + `engine.js` without polluting global scope.
- **Pattern:** `T(name, fn)` runs one test, catches throws, increments pass/fail counters.
- **Assertions:** `eq(a, b)`, `near(a, lo, hi)`, `truthy(v)`, `falsy(v)` — kept minimal to avoid test-framework dependencies.
- **Seeding:** tests that depend on RNG use a fixed seed or large-sample Bernoulli CIs (see `status_tests.js` for examples).

## Adding a new test suite

1. Create `poke-sim/tests/<feature>_tests.js`
2. Use the harness pattern from `items_tests.js`:
   ```js
   const ROOT = require('path').resolve(__dirname, '..');
   ```
3. Ensure relative paths only — do not hardcode `/home/user/...` or `/tmp/...`
4. Add the run line to this README's "Run all tests" block

## CI (future)

No CI runner is wired up yet. Candidate: a simple `npm test` script that runs all five suites and exits non-zero on any failure. Ticket out when T9j.10 golden-pack lands.
