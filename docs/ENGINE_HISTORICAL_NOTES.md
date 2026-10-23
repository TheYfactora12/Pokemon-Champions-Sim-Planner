# Historical engine implementation notes

Relocated verbatim from engine.js during the Eviolite activation integration to preserve the unchanged bundle budget. These are historical implementation comments, not new verification claims. Executable statements are unchanged by this relocation.

## Note 1

```javascript
// ISSUE #1 FIX — CANONICAL ANALYSIS PAYLOAD
// buildAnalysisPayload() wraps any raw sim result (from runSimulation
// or runBoSeries) into the canonical structured object.
// ALL coaching layers (showInlinePilotCard, generatePilotGuide,
// buildReportText) MUST consume this object — never the raw result.
// Fields:
//   analysis_id     — unique run identifier (timestamp + random)
//   engine_version  — semantic version of this engine file
//   formatid        — format string ("vgc-doubles" | "singles")
//   custom_rules    — array of any active custom rules
//   team_inputs     — player + opponent team keys
//   hidden_info_priors — what is assumed vs known about hidden sets
//   seed_policy     — how seeds were generated
//   sample_size     — battles or series run
//   policy_models   — description of AI decision policy
//   win_rate        — raw float 0–1
//   confidence_interval — Wilson score 95% CI [lo, hi]
//   confidence_tier — "Low" | "Moderate" | "High"
//   top_win_paths   — top win conditions by frequency
//   top_loss_paths  — placeholder (requires loss-path tracking)
//   critical_damage_calcs — placeholder for future calc layer
//   traceable_log_refs    — first N seed refs for replayability
```

## Note 2

```javascript
// T9j.8 — CRITICAL HITS, FLINCH, AND ABILITIES FRAMEWORK
// Refs #27 (crits), #19 (flinch), #30 (abilities).
// All tables are `var` for TDZ-safety (referenced from Pokemon methods).
//
// CRIT_STAGES: Gen 9 crit probability ladder.
//   Cite: https://bulbapedia.bulbagarden.net/wiki/Critical_hit
//
// CRIT BYPASS RULES (applied in calcDamage when crit lands):
//   - Attacker's NEGATIVE Atk/SpA stages ignored (taken as 0).
//   - Defender's POSITIVE Def/SpD stages ignored (taken as 0).
//   - Final damage × 1.5 (Gen 6+; was × 2 in earlier gens).
//
// per-move pages and Pokemon Champions nerfs:
//   Iron Head: 20% in Champions (nerfed from Gen 9's 30%).
//     Cite: https://www.serebii.net/pokemonchampions/updatedattacks.shtml
//   Rock Slide / Air Slash / Bite: 30% (unchanged).
```

## Note 3

```javascript
// ABILITIES REGISTRY — T9j.8
// hook at the canonical trigger points documented below.
//
// Hook signatures:
//     bpMod uses Showdown's 4096 fixed-point modifier scale.
//     Showdown's 4096 fixed-point scale against the attack/sp-atk value.
//     guard in calcDamage previews.
//     Piercing Drill / Unseen Fist use this shared 25% path.
//     Used by Spicy Spray (burn attacker).
//   onWeatherCheck({mon, moveType, field}) -> {effectiveWeather}
//     for the holder's Fire-typed moves even if field weather is 'none'.
//
// Sources cited per-ability.
```

## Note 4

```javascript
  // T9j.10 (Refs #16) — Team Preview / bring-N-of-6.
  //   Doubles: bring 4 of 6 (leads 1-2, bench 3-4)
  //   Singles: bring 3 of 6 (lead 1, bench 2-3)
  // Caller passes opts.playerBring / opts.opponentBring — arrays of Pokemon
  // names in picked order. Names not in bring list are EXCLUDED from battle.
  // Legacy opts.playerLeads / opts.opponentLeads still supported: leads occupy
  // indices 0-1 and the rest of the team fills remaining slots in original order.
  //   Cite: https://bulbapedia.bulbagarden.net/wiki/Team_Preview
  //   Cite: https://bulbapedia.bulbagarden.net/wiki/VGC
```

## Note 5

```javascript
    // T9j.2 (Issue #26) — per-target damage via executeMove wrapper.
    // Handles spread, Wide Guard, Follow Me/Rage Powder redirection,
    // per-target type eff, and format-aware 0.75× mod.
    // T9j.8 (Refs #30) Parental Bond: Kangaskhan-Mega single-target damaging
    // moves strike twice. Second strike fires at 1/4 BP via field._ctx.bpMult.
    // Spread moves (all-adjacent, all-foes) do NOT get the second strike per
    // mainline behavior (Bulbapedia Parental Bond). Status, multi-hit moves
    // (Dragon Darts / Bone Rush), and fainted attackers also skip the 2nd hit.
```

## Note 6

```javascript
    // T9j.17 (Refs #36) -- Expanding Force x Psychic Terrain dynamic target.
    // When the user is grounded AND Psychic Terrain is active, Expanding Force
    // becomes a spread move hitting all adjacent foes and gets a 1.5x BP boost.
    // Ungrounded users (Flying-type or Levitate) keep the default single-target.
    // Cite: https://bulbapedia.bulbagarden.net/wiki/Expanding_Force_(move)
    // Cite: https://game8.co/games/Pokemon-Champions/archives/590403
```

## Note 7

```javascript
    // T9j.9 (Refs #3) Physical/Special classifier
    // Data-driven: MOVE_CATEGORY from data.js is the canonical source of truth.
    // Fallback: legacy type-heuristic if the move is missing from the table,
    // with a one-shot console warning so gaps are visible in the test log.
    //   Cite: https://game8.co/games/Pokemon-Champions/archives/590527
    //   Cite: https://bulbapedia.bulbagarden.net/wiki/Damage_category
```

## Note 8

```javascript
    // Base power
    // T9j.9 (Refs #24): BP lookup promoted to data.js MOVE_BP table.
    // Legacy inline BP_MAP kept as secondary fallback for any engine-only
    // Champions additions not yet migrated. Missing moves warn once and use 60.
    //   Cite: https://www.serebii.net/pokemonchampions/updatedattacks.shtml
    //   Cite: https://bulbapedia.bulbagarden.net/wiki/Base_power
```
