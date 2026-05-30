# Core Issues

Foundational correctness gaps that must be resolved for the simulator to produce reliable, tournament-grade output.

---

## 1. Stat Structure
- Pokémon and stats must be correctly represented
- BASE_STATS entries must exist for every regional variant (Alolan, Galarian, Hisuian, Paldean forms)
- Stat formula must correctly apply format (Champions SP vs. SV EV), nature multiplier, and level
- Engine must never silently fall back to Kantonian/base stats when a regional key is missing

---

## 2. Move Structure
- Simulate a battle — moves must be correctly calculated
- Damage formula must match the canonical Gen 9 order: `floor( floor( floor(2×L/5+2) × BP × A/D ) / 50 + 2 )`
- Nature, item, STAB, type effectiveness, spread modifier (0.75×), and burn penalty must all apply in the correct sequence
- Move accuracy, base power overrides (variable BP moves), and contact flags must be respected

---

## 3. Turn Order
- Speed tiers must be resolved correctly including Trick Room inversion
- Priority brackets must be applied before Speed comparison
- Speed ties must be broken randomly (not deterministically)
- Paralysis Speed drop (−50%) must apply before turn order is calculated
- Tailwind (×2 Speed) and other Speed modifiers must stack correctly

---

## 4. Battle Structure Correctness
- **Terrain:** Grassy, Electric, Psychic, Misty terrain effects on moves, statuses, and grounded checks
- **Priority:** Full bracket table (−7 to +5); Quick Guard blocks positive-priority moves
- **Weather:** Sun, Rain, Sand, Hail/Snow — damage boosts, chip, immunity, and auto-set abilities
- **Mega Evolution:** Stat and type change applies at start of turn before damage; only one Mega per team per battle
- **Abilities:** Intimidate on switch-in, Protean once per entry, Parental Bond child hit at ¼ power, Unseen Fist 25% through Protect

---

## 5. Conditions & Statuses
- Burn (−½ physical damage, 1/16 chip), Paralysis (−50% Speed, 12.5% full-para), Poison (1/8 chip), Toxic (escalating N/16 capped at 15)
- Sleep (max 3 turns: T1 no act, T2 33% wake, T3 guaranteed wake)
- Freeze (25% thaw/turn, guaranteed T3, instant thaw in Sun)
- Frostbite (1/16 chip, SpA halved, no action skip)
- Volatile conditions: Confusion, Taunt, Encore, Flinch, Leech Seed, partial-trap
- Status immunity interactions (type-based and ability-based) must be enforced

---

## 6. Showdown Database Import
- Import pokepaste URLs and raw Showdown text correctly into team slots
- Parse species name, item, ability, nature, EVs/IVs, moves, and level without data loss
- Regional form names (e.g. `Ninetales-Alola`, `Slowbro-Galar`) must resolve to correct BASE_STATS and POKEMON_TYPES_DB keys
- Imported teams must pass the legality validator before being accepted into a slot
