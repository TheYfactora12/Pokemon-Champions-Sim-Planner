# Ability Coverage Audit

Date: 2026-05-24

Scope:
- curated shipped teams in `data.js` excluding `player` and `custom_*`
- `CHAMPIONS_MEGAS` ability catalog
- current battle engine ability hooks and inline checks in `engine.js`

Summary:
- unique curated-team + mega abilities audited: 80
- already modeled by the engine: 55
- still unmodeled and classified: 25

Why this exists:
- Issue #125 showed repeated review friction around ability gaps being noticed ad hoc.
- This audit turns that into a maintained inventory with a guard test so new gaps cannot quietly pile up.

Classification buckets:
- `passive_or_noop_for_current_sim`
- `missing_low_impact`
- `missing_battle_result_impacting`

Highest-priority shipped-team gaps:
- `Shadow Tag`: changes switch options and perish-style endgames.
- `Gale Wings`, `Skill Link`, `Stamina`, `Protean`: turn order, multi-hit damage, snowball defense, or type-changing mechanics with matchup impact.
- `Flower Veil`, `Stalwart`, `Mind's Eye`, `No Guard`: support, targeting, immunity, and accuracy mechanics that can flip matchups.

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
- `Levitate`: Showdown-aligned Ground immunity for non-Flying Levitate users.
- `Sheer Force`: Showdown-aligned 1.3x secondary-effect move damage boost, with modeled secondary effects suppressed.
- `Fairy Aura`: Showdown-aligned Fairy damage aura modifier.
- `Scrappy`: Showdown-aligned Normal/Fighting hits into Ghost targets plus Intimidate immunity.
- `Infiltrator`: Showdown-aligned screen and Substitute bypass for supported damage/status paths.
- `Mold Breaker`: Conservative Showdown-aligned bypass for currently modeled defensive ability hooks, defender `Unaware`, `Sturdy`, `Levitate`, and `Earth Eater`.

Lower-priority or no-op examples:
- `Frisk`: item reveal is effectively already visible in the sim.
- `Pressure`: PP drain is not modeled, so it has no current battle-math path.
- `Healer`, `Shell Armor`, `Trace`, `Limber`, `Insomnia`: real mechanics, but narrower current user impact than the top gaps.

Recommended implementation order:
1. Priority and targeting control
   - `Shadow Tag`
2. Turn-order and multi-hit mechanics
   - `Gale Wings`
   - `Skill Link`
3. Defensive and snowball mechanics
   - `Stamina`
   - `Innards Out`
4. Support, accuracy, and targeting mechanics
   - `Flower Veil`
   - `Stalwart`
   - `Mind's Eye`
   - `No Guard`

Guardrail:
- `tests/ability_coverage_audit_tests.js` compares the current unmodeled ability inventory against `tests/fixtures/ability_gap_classification.json`.
- If a new shipped-team or mega ability is unmodeled and unclassified, the test fails immediately.

Out of scope for this pass:
- implementing the missing mechanics
- Supabase changes
- bundle or deployment changes
- broad engine rewrite
