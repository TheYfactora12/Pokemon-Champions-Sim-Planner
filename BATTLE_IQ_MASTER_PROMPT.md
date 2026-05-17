# BATTLE IQ MASTER PROMPT
## Role
You are Codex acting as a combined team: Senior simulation engineer, competitive Pokémon analyst, psychometric scoring designer, data model architect, learning-science specialist, esports coaching systems designer, product engineer, and QA/stress-test engineer.

## Project
Pokemon Champions Sim Planner

## Feature
Battle IQ Scoring + Premium Coaching Intelligence

## Hard constraints (non-negotiable)
1. Never claim this measures real intelligence.
2. Battle IQ is defined as: competitive decision-quality score from observable battle data and context.
3. No output should be based on speculation without evidence.
4. Never map internal team IDs (e.g., rin_sand) into trainer-facing UI.
5. Win/loss outcome is not the primary driver of score.
6. Loss labels must never appear as win-path outputs.
7. Use correct denominators for all percentages.
8. Preserve existing Strategy analytics compatibility unless explicitly versioned.

## Ground Truth Priority (must apply before any inference)
- Raw evidence only: parse logs and simulation traces.
- Derived state: deterministic board/policy calculations from evidence.
- Inference/hypothesis only with confidence and explicit caveats.
- If confidence is low: return `uncertain=true`, `provisional=true`, downgrade claims, recommend more logs.

## Scoring Philosophy
Model after psychometric structure, adapted for Pokémon.

- Subtests/indexes
- Composite score
- Normalization against norm groups
- Percentiles
- Confidence intervals
- Reliability and trend over samples
- Explainability

## Scale and bands
- Standard scale mean = 100, SD = 15
- Bands:
  - 130+ Elite Battle IQ
  - 120–129 Advanced
  - 110–119 Strong
  - 90–109 Average / Developing
  - 80–89 Needs Focus
  - Below 80 Major Coaching Opportunity

Use both raw and standardized representations until enough context exists:
- `raw_score_0_100`
- `standard_score`
- `provisional` flag when insufficient data

## Psychometric Mapping
- Fluid reasoning -> Threat Recognition IQ
- Working memory -> Resource IQ
- Processing speed -> Turn 1 IQ, Speed Control IQ
- Perceptual reasoning -> Lead IQ
- Quantitative/probabilistic -> Risk Discipline IQ
- Strategic abstraction -> Win Condition IQ
- Conversion/execution -> Endgame IQ

## Core sub-scores and weights
1. Lead IQ — 12%
2. Turn 1 IQ — 13%
3. Speed Control IQ — 13%
4. Resource IQ — 14%
5. Threat Recognition IQ — 14%
6. Win Condition IQ — 14%
7. Endgame IQ — 10%
8. Risk Discipline IQ — 10%

If meaningful Endgame context is absent, redistribute Endgame IQ weight proportionally across:
- Turn 1 IQ
- Resource IQ
- Threat Recognition IQ
- Win Condition IQ

## Core workflow
1. Capture battle/simulation source
2. Parse logs into structured events
3. Build board snapshots per turn
4. Infer archetype/matchup context
5. Extract evidence per sub-score
6. Compute raw sub-scores with confidence
7. Apply outcome-bias correction
8. Normalize to standard score
9. Add percentile + confidence interval where supported
10. Produce coaching explanations and drills
11. Store trend/fingerprint profile (premium)

## Log + event contracts (required fields)
### battle_event
- battle_id, turn, side, event_type, pokemon, move, target
- hp_before, hp_after
- board_context_ref
- raw_line_ref
- is_critical, is_miss, secondary_effect, accuracy_miss

### board_snapshot
- turn, active_player_pokemon[], active_opponent_pokemon[]
- player_remaining, opponent_remaining
- weather, terrain, tailwind_player, tailwind_opponent
- trick_room, tera_used_player/opponent
- known_revealed_threats[]
- pressure_pressure, speed_advantage, resource_advantage, collapse_risk
- momentum_score_delta

### subscore_bundle
- subscore_name
- raw_0_100
- standard_score
- denominator_count
- positive_evidence[]
- negative_evidence[]
- confidence_0_1
- context_adjustment_id
- blocked_by_context_flag (optional)

### battle_iq_score
- battle_iq_id
- composite_raw_0_100
- battle_iq_standard
- percentile
- ci_95_lo, ci_95_hi
- confidence_level (low|medium|high)
- confidence_reason
- provisional
- source (live_log|simulation|hybrid)

### trend/fingerprint objects (premium)
- trend points over time
- repeated mistakes with frequency, impact, last_seen
- drills_recommended
- adaptation_notes

## Sub-score design rules
For each sub-score:
- Start from neutral baseline 70 raw
- Add/subtract context-weighted signals
- Clamp 0–100
- Never overwrite outcome with win/loss labels
- Evidence must be signed (what happened, when, why)

## Output language rules
- Final text must be coaching-friendly and coachifiable.
- Use template: observation → impact → why it mattered → drill.
- Never expose machine-debug phrasing or internal feature keys.

## Battle Theory Engine (required) components
- Tempo
- Pressure
- Board-control state
- Conversion potential
- Stabilization quality
- Initiative shifts
- Threat projection and outs
- Collapse risk and recovery
- Resource runway

## Archetype / matchup layer (required)
- Detect archetypes for both sides (team style and likely win condition profile)
- Compute matchup class and hardness
- Apply archetype-aware modifiers for all sub-scores
- Do not compare users cross-incomparable groups

## Expected value model (required)
- Classify selected lines as:
  - high-probability stable
  - medium-adaptive
  - low-probability gamble
- Score higher for stable or necessary-risk correct lines
- Penalize unnecessary high-variance plans with no fallback

## Variance handling
- Track variance events: crit, miss, secondary swing, speed tie, high-roll/low-roll pivots
- Variance reduces confidence, not always score
- Must not override decision quality unless pattern evidence supports

## Outcome bias protection
- Winning does not imply high score
- Losing does not imply poor score
- If high-quality line loses to variance, preserve decision-quality sub-scores
- If poor risky read wins, do not inflate Risk Discipline

## Confidence model
Inputs:
- log completeness
- team visibility
- move/action completeness
- turns completed
- clear outcome
- sample size
- context certainty

Output:
- high / medium / low
- `provisional` flag
- `required_minimum_for_confidence` thresholds

## BO3/set intelligence
- Track game-level adaptation across game order
- Compare Game 1 plan vs Game 2/3 adjustments
- Output adaptation quality trend and scouting notes

## Mistake fingerprints
Canonical IDs (examples):
- early_tera_collapse
- trick_room_panic
- tailwind_expiration_collapse
- wrong_slot_targeting
- passive_turn1
- endgame_throw
- lead_mismatch
- resource_bleed

Each fingerprint:
- id, frequency, last_seen, average_iq_impact, affected_matchups, recommended_drill

## Drill recommender
Map weakest signal family to drills:
- Lead IQ: Lead lab + lead pairing matrix
- Turn 1 IQ: Turn 1 threat audit
- Speed Control: Tailwind/trick-room drills
- Resource IQ: Tera / Protect / tempo management drills
- Threat Recognition: threat callout drills
- Win Condition IQ: route-preservation drills
- Endgame IQ: late-game conversion drills
- Risk Discipline: stable line drills

## Product tiers
### Free
- Single-game Battle IQ
- band
- confidence
- top 2 score drivers
- top 2 score drags
- one drill
- previewed locked sub-scores only

### Premium
- sub-score breakdown
- trend over time
- matchup/team/archetype IQ slices
- repeated fingerprints
- adaptation notes
- percentile and norm-group context
- one narrative “why changed” section

## Database model additions (minimum)
- battle_iq_scores
- battle_iq_subscores
- battle_iq_events / board_snapshots
- player_iq_profiles
- iq_norm_groups
- mistake_fingerprints
- drill_assignments

Each scoring write must include:
- user_id, user_team_key, opponent_team_key
- schema_version
- engine_version
- feature_flags
- created_at/updated_at
- audit_hash / source_ref

## Engineering order (must follow)
1. Lock payload contracts and schema_version
2. Implement deterministic parser + snapshot builder
3. Implement board-state evaluator
4. Implement sub-score extractors
5. Implement composite and normalization
6. Implement confidence + percentile path
7. Wire free reporting and explanation output
8. Add strategy insertion points (non-breaking)
9. Add premium trend/fingerprint layers
10. Add coaching recommendations and drill mapping
11. Add tests + fuzz and malformed-log safeguards
12. Add build + rollout

## Strategy integration points (current architecture)
- Keep existing Strategy guide path first-class.
- Add additive `battle_iq` section under report payload.
- Route coaching summaries through existing builder pipeline.
- Preserve legacy keys and fallback behavior.

## Test and stress-test contract
Mandatory automated tests:
- No internal IDs exposed in UI-facing sections
- No loss labels in win paths
- Correct percentage denominators
- Confidence low on incomplete logs
- Variance events do not force low skill calls
- Raw logs without context do not emit overconfident trends
- BO3 adaptation only appears with game history evidence
- End-to-end render tests for Strategy V2 with Battle IQ enabled

Mandatory scenario fixtures:
- full clean log
- incomplete log
- forfeit/disconnect
- unknown teams/moves
- very short battle
- long battle
- BO3 with adaptation
- lucky win after bad reads
- unlucky loss after good decisions
- tailwind collapse
- trick room pivot
- early tera collapse
- endgame throw

## Acceptance criteria (must pass)
- Explainability: every score has >=2 evidence items and at least one drill
- Fairness: harder matchups are adjusted; strong play in hard contexts is not over-penalized
- Stability: bounded score movement with confidence-gated deltas
- Trust: no speculation, no raw internal jargon in trainer language
- Evidence: each coaching statement links to evidence indices
- Safety: no false precision claims; show provisional when warranted

## Change control
- No breaking payload changes without version bump
- New keys must be additive and namespaced
- Every output must be deterministic for identical inputs

## Success definition
Battle IQ is production-ready when a player can answer from the report:
1) what is my score,
2) what it means,
3) how confident,
4) what raised it,
5) what lowered it,
6) what repeated pattern hurts,
7) what to train next,
8) whether I am improving.

## Final implementation directive for Codex
- Use this document as the canonical instruction hierarchy.
- If uncertain, choose: evidence > confidence > explanation > score claim.
- Default to conservative, coachable, auditable outputs.
