# Ability Coverage Audit

Date: 2026-05-24

Scope:
- curated shipped teams in `data.js` excluding `player` and `custom_*`
- `CHAMPIONS_MEGAS` ability catalog
- current battle engine ability hooks and inline checks in `engine.js`

Summary:
- unique curated-team + mega abilities audited: 80
- already modeled by the engine: 34
- still unmodeled and classified: 46

Why this exists:
- Issue #125 showed repeated review friction around ability gaps being noticed ad hoc.
- This audit turns that into a maintained inventory with a guard test so new gaps cannot quietly pile up.

Classification buckets:
- `passive_or_noop_for_current_sim`
- `missing_low_impact`
- `missing_battle_result_impacting`

Highest-priority shipped-team gaps:
- `Shadow Tag`: changes switch options and perish-style endgames.
- `Stance Change`, `Sturdy`, `Unaware`: major battle-result mechanics, not flavor.
- `Strong Jaw` and `Mega Launcher`: direct damage modifiers with real mega exposure.
- `Earth Eater` and `Rough Skin`: common contact and spread interaction swing points.

Implemented after this audit:
- `Prankster`: real battle priority for status moves, with Dark-type immunity on targeted opposing status.
- `Armor Tail`: side-wide blocking for opposing priority moves.
- `Good as Gold`: targeted status immunity.
- `Magic Bounce`: targeted status reflection back to the user.
- `Adaptability`: Showdown-aligned STAB handling, including off-type Tera behavior.
- `Clear Body`, `Competitive`, `Defiant`: opponent-driven stat-drop resolution now flows through a shared anti-Intimidate helper.
- `Cloud Nine`: effective weather is now centralized, suppressing weather-driven damage, speed, charge-skip, residual, and status gates.
- `Pixilate`: Showdown-aligned Normal-to-Fairy conversion and boost.
- `Solar Power`: Showdown-aligned sun damage boost, plus end-of-turn recoil under active sun.
- `Supreme Overlord`: Showdown-aligned late-game damage scaling from allied faint count.
- `Tough Claws`: Showdown-aligned contact damage boost.

Lower-priority or no-op examples:
- `Frisk`: item reveal is effectively already visible in the sim.
- `Pressure`: PP drain is not modeled, so it has no current battle-math path.
- `Healer`, `Shell Armor`, `Trace`, `Limber`, `Insomnia`: real mechanics, but narrower current user impact than the top gaps.

Recommended implementation order:
1. Priority and targeting control
   - `Shadow Tag`
2. Damage modifiers with broad shipped-team exposure
   - `Strong Jaw`
   - `Mega Launcher`
3. Defensive and board-state mechanics
   - `Earth Eater`
   - `Sturdy`
   - `Stance Change`
   - `Unaware`
4. Support and mitigation mechanics
   - `Friend Guard`

Guardrail:
- `tests/ability_coverage_audit_tests.js` compares the current unmodeled ability inventory against `tests/fixtures/ability_gap_classification.json`.
- If a new shipped-team or mega ability is unmodeled and unclassified, the test fails immediately.

Out of scope for this pass:
- implementing the missing mechanics
- Supabase changes
- bundle or deployment changes
- broad engine rewrite
