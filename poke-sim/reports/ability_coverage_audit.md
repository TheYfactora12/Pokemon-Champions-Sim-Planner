# Ability Coverage Audit

Date: 2026-05-24

Scope:
- curated shipped teams in `data.js` excluding `player` and `custom_*`
- `CHAMPIONS_MEGAS` ability catalog
- current battle engine ability hooks and inline checks in `engine.js`

Summary:
- unique curated-team + mega abilities audited: 80
- already modeled by the engine: 50
- still unmodeled and classified: 30

Why this exists:
- Issue #125 showed repeated review friction around ability gaps being noticed ad hoc.
- This audit turns that into a maintained inventory with a guard test so new gaps cannot quietly pile up.

Classification buckets:
- `passive_or_noop_for_current_sim`
- `missing_low_impact`
- `missing_battle_result_impacting`

Highest-priority shipped-team gaps:
- `Shadow Tag`: changes switch options and perish-style endgames.
- `Sheer Force`, `Fairy Aura`: direct damage modifiers with real KO-range impact.
- `Infiltrator`, `Mold Breaker`, `Scrappy`, `Stalwart`: targeting, immunity, or defensive-bypass mechanics that can flip matchups.

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
- `Strong Jaw`: Showdown-aligned bite move damage boost.
- `Mega Launcher`: Showdown-aligned pulse move damage boost.
- `Stance Change`: Aegislash form swap changes battle stats across attacking/protecting lines.
- `Sturdy`: Showdown-aligned full-HP lethal hit survival.
- `Unaware`: Showdown-aligned stat-stage ignoring for attacker/defender comparisons.
- `Rough Skin`: Showdown-aligned contact chip for damaging contact hits, including KO trades.
- `Blaze`: Showdown-aligned low-HP Fire damage boost.
- `Overgrow`: Showdown-aligned low-HP Grass damage boost.
- `Iron Fist`: Showdown-aligned punch move damage boost.
- `Technician`: Showdown-aligned low-BP move damage boost.
- `Huge Power`: Showdown-aligned Attack doubling.
- `Pure Power`: Showdown-aligned Attack doubling.
- `Sand Force`: Showdown-aligned sand Rock/Ground/Steel damage boost.
- `Thick Fat`: Showdown-aligned incoming Fire/Ice damage reduction.
- `Filter`: Showdown-aligned super-effective damage reduction.
- `Tinted Lens`: Showdown-aligned resisted-hit damage boost.
- `Earth Eater`: Showdown-aligned Ground immunity and one-quarter max HP recovery on absorbed hits.

Lower-priority or no-op examples:
- `Frisk`: item reveal is effectively already visible in the sim.
- `Pressure`: PP drain is not modeled, so it has no current battle-math path.
- `Healer`, `Shell Armor`, `Trace`, `Limber`, `Insomnia`: real mechanics, but narrower current user impact than the top gaps.

Recommended implementation order:
1. Priority and targeting control
   - `Shadow Tag`
2. Damage modifiers with broad shipped-team exposure
   - `Sheer Force`
   - `Fairy Aura`
3. Defensive and board-state mechanics
   - `Infiltrator`
   - `Mold Breaker`
   - `Scrappy`
4. Support and mitigation mechanics
   - `Flower Veil`
   - `Stalwart`

Guardrail:
- `tests/ability_coverage_audit_tests.js` compares the current unmodeled ability inventory against `tests/fixtures/ability_gap_classification.json`.
- If a new shipped-team or mega ability is unmodeled and unclassified, the test fails immediately.

Out of scope for this pass:
- implementing the missing mechanics
- Supabase changes
- bundle or deployment changes
- broad engine rewrite
