# Review Overview - 2026-06-20

Audience: partners, Josh, reviewers, and anyone picking up simulator accuracy work without the chat history.

## Current Status

The simulator is in a better review state today, but it is still not ready for strong "fully accurate" claims.

What is true right now:

- the Champions review lane is the trusted default
- the local source-truth suite passes
- the local fast suite passes
- the UI smoke path passes
- SV-format teams are now treated as compatibility-only in the live Champions review path

What is not true yet:

- full simulator parity is not proven across all mechanics
- the live GitHub Pages build should not be treated as updated until the current changes are pushed and Pages finishes deploying
- approved Supabase views are not yet the final public runtime source

## Live Review Target

- Branch target: `main`
- Live URL after push/deploy:
  `https://theyfactora12.github.io/Pokemon-Champions-Sim-Planner/poke-sim/pokemon-champion-2026.html`

Important:

- GitHub Pages is only proof for what is already merged to `main`
- a feature branch, local repo, or pending workspace change is not the same thing as the live page

## Source Truth Order

Keep this order fixed:

1. Pokemon Showdown upstream behavior and data
2. generated Showdown runtime rows in the repo
3. approved DB views and approved generator outputs
4. explicit Champions overrides where Champions differs from Showdown
5. local fallback rows only for known gaps

For Champions-only behavior, the approved override layer is the source truth, not ad hoc app edits.

## Approved Champions Override Sources

Use these for Champions-specific deltas:

- Serebii Pokemon Champions pages
- Victory Road Champions regulations pages
- approved repo docs and runtime bridge tests that name the override explicitly

Damage and standard mechanics should stay anchored to Showdown unless Champions has a confirmed difference and that difference is called out in the runtime override path.

## What Was Verified Today

Validated locally on 2026-06-20:

- `npm run test:source-truth`
- `npm run test:fast`
  - 87 non-DB test files passed
  - 14 DB-gated files skipped
- `node poke-sim/tests/ui_single_sim_smoke.js`

Key proof points in that passing state:

- Showdown damage oracle tests pass
- move verification registry tests pass
- priority drift checks pass
- runtime data bridge tests pass
- mechanics audit passes
- UI run-simulation smoke passes

## What Changed In This Pass

### Mechanics and test hardening

- fixed the `getStat()` null-field path so item/stat tests do not crash on missing weather context
- corrected brittle mechanics tests where move choice, speed order, or HP semantics were not actually testing the intended rule
- repaired the shared mechanics-audit helper so:
  - `atk/def/spa/spd/spe` shorthands map into EV/SP test input
  - `hp` remains current battle HP when the test is setting a damaged starting state

### Champions-first guardrails

- kept battle format (`singles` / `doubles`) separate from ruleset intent
- added a `currentRuleset` default of `champions`
- marked SV-format teams as `SV compatibility only` in the live Champions review lane
- prevented SV teams from reading as trusted legal Champions teams in the review UI

### Review clarity

- updated stale service-worker cache expectation coverage
- rebuilt the shipped HTML bundle after the UI/runtime changes

## Remaining Gaps

These still block stronger trust claims:

1. Ability coverage is still incomplete.
   - the current audit still reports many unmodeled abilities
   - some are low impact, but many are still battle-result-impacting

2. Approved DB views are not yet the public runtime source.
   - the repo is closer to the target architecture
   - the live app still needs the approved DB/runtime handoff closed cleanly

3. Fresh deployed-log proof still needs to be repeated after each live push.
   - exported turn logs from the claimed live URL need strict validation

4. Champions and SV are not fully separated as selectable product modes yet.
   - today the guardrail is review-focused: Champions is trusted, SV is compatibility-only
   - a full explicit SV mode can come later if it is still wanted

## Roadmap From Here

### 1. Keep Champions truth first

- continue mechanics proof against Showdown
- only add a Champions override when Showdown is not the final game truth
- lock each confirmed fix behind focused regression coverage

### 2. Finish the source-truth runtime path

- keep generated Showdown data as the primary runtime layer
- keep Champions overrides explicit and test-backed
- move remaining static facts behind the approved DB/runtime bridge

### 3. Push and re-validate the live page

- push `main`
- wait for GitHub Pages deploy success
- test the live URL
- export fresh logs from the live page
- run strict turn-log validation on those logs

### 4. Keep drift out

- do not review one branch and validate another
- do not treat Pages as current until the deploy run is green
- do not hand-edit mirrored Showdown facts when the fix belongs in the generator or approved DB layer

## Notes For Reviewers

- If a team is marked `SV compatibility only`, do not use it as Champions proof.
- If a behavior claim is about damage, targeting, turn order, terrain, weather, or status, check the Showdown oracle and verification tests first.
- If a behavior claim is Champions-specific, check that the override is explicit and cited.
- If a live result does not match local expectations, confirm the Pages deploy SHA before debugging the engine.

## Useful Companion Docs

- `docs/release/SIM_READINESS_STATUS_2026-06-19.md`
- `docs/release/SOURCE_OF_TRUTH_GUARDRAILS_2026-06-19.md`
- `docs/release/SIM_AND_DB_SNAPSHOT_2026-06-19.md`
- `docs/release/QA_ENVIRONMENT_HANDOFF_RULES_2026-06-19.md`
- `docs/release/SHOWDOWN_DB_RUNTIME_HANDOFF_2026-06-10.md`
- `poke-sim/reports/turn-log-audit-2026-06-20.md`
- `poke-sim/reports/move_support_audit.md`
