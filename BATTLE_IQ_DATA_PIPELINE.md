# Battle IQ Data Pipeline

## Purpose
Define how Pokemon Showdown logs and simulator records become trustworthy Battle IQ training data.

The system should learn from gameplay logs, but it must not treat raw wins, losses, or player behavior as automatic proof of correct play. Every training view must pass through deterministic parsing, board reconstruction, evidence labeling, and confidence scoring before it can influence simulation, strategy, or coaching.

## Core principle
Train on structured decision evidence, not raw outcomes.

Raw logs are useful because they contain real sequences of battle decisions. They are not, by themselves, ground truth for good play. A player can win with a poor line, lose with a strong line, or have the game decided by variance. Battle IQ must preserve that distinction.

## Pipeline overview
1. Raw replay capture
2. Deterministic event normalization
3. Board-state reconstruction
4. Ruleset profiling
5. Context inference
6. Evidence annotation
7. Confidence and variance tagging
8. Training view generation
9. Model, simulator, strategy, and coaching feedback loops

## Storage layers

### 1. `raw_replay_logs`
Immutable source layer.

Fields:
- `id`
- `source_url`
- `source_platform`
- `format`
- `captured_at`
- `raw_text`
- `raw_json`
- `checksum`
- `privacy_status`
- `ingestion_version`

Rules:
- Never edit raw source rows.
- Store source URL and checksum for reproducibility.
- Do not expose third-party player identifiers in trainer-facing product views unless explicitly allowed.

### 2. `normalized_battle_events`
Deterministic parser output.

Fields:
- `battle_id`
- `turn`
- `side`
- `event_type`
- `pokemon`
- `move`
- `target`
- `hp_before`
- `hp_after`
- `status`
- `weather`
- `terrain`
- `raw_line_ref`
- `parse_confidence`

Rules:
- Parser output should be deterministic for identical input.
- Unknown or malformed segments become warnings, not invented facts.

### 3. `board_snapshots`
Turn-by-turn state reconstruction.

Fields:
- `battle_id`
- `turn`
- `active_player_pokemon`
- `active_opponent_pokemon`
- `player_remaining`
- `opponent_remaining`
- `speed_state`
- `resource_state`
- `pressure_state`
- `collapse_risk`
- `momentum_delta`
- `snapshot_confidence`

Rules:
- Board snapshots are derived from events, not written by language-model text.
- Missing information must lower confidence.

### 4. `ruleset_profiles`
Format compatibility and training boundary layer.

Fields:
- `battle_id`
- `format_id`
- `ruleset_name`
- `ruleset_version`
- `generation`
- `battle_type`
- `team_size`
- `bring_count`
- `lead_count`
- `best_of`
- `allowed_species_policy`
- `restricted_policy`
- `tera_policy`
- `custom_mechanics_flags`
- `source_platform`
- `compatibility_class`
- `ruleset_confidence`

Compatibility classes:
- `champion_exact`
- `champion_compatible`
- `generic_gen9`
- `parser_only`
- `unknown`

Rules:
- Champion-specific Battle IQ norms require `champion_exact` or explicitly approved `champion_compatible` logs.
- Generic Gen 9 logs can improve parser robustness and general event handling.
- Generic Gen 9 logs must not directly overwrite Champion-specific strategy, matchup priors, or coaching norms.
- Unknown rulesets default to parser-only until classified.

### 5. `battle_context`
Archetype, matchup, and format layer.

Fields:
- `battle_id`
- `format`
- `battle_type`
- `player_archetype`
- `opponent_archetype`
- `matchup_class`
- `matchup_difficulty`
- `rank_band`
- `team_visibility`
- `ruleset_profile_ref`
- `context_confidence`

Rules:
- Context inference can be probabilistic, but must carry confidence.
- Never compare scores across incompatible contexts without a norm-group bridge.
- Ruleset profile must be resolved before context can influence Champion-specific norms or coaching.

### 6. `evidence_annotations`
Structured decision-quality evidence.

Fields:
- `battle_id`
- `turn`
- `subscore`
- `signal_id`
- `direction`
- `weight`
- `evidence_text`
- `source_event_refs`
- `source_snapshot_refs`
- `confidence`

Rules:
- Evidence text must be coachable and audit-friendly.
- Every score-affecting signal must point back to source events or snapshots.

### 7. `variance_events`
Luck and uncertainty layer.

Fields:
- `battle_id`
- `turn`
- `variance_type`
- `affected_side`
- `impact_estimate`
- `confidence`
- `source_event_ref`

Examples:
- `critical_hit`
- `accuracy_miss`
- `secondary_effect`
- `speed_tie`
- `damage_roll_threshold`

Rules:
- Variance can change confidence and interpretation.
- Variance should not erase decision-quality evidence.

## Training views

### `sim_calibration_view`
Purpose:
Improve simulator realism and matchup priors.

Inputs:
- normalized events
- board snapshots
- observed bring/lead choices
- archetype context
- outcome context

Learns:
- common leads
- bring rates
- archetype tendencies
- speed-control usage rates
- matchup pressure patterns
- damage/turn distribution priors

Must not learn:
- direct coaching verdicts
- raw “winner did correct thing” labels
- Champion-specific priors from generic Gen 9 logs unless ruleset compatibility is approved

### `strategy_prior_view`
Purpose:
Improve Strategy Guide recommendations.

Inputs:
- board snapshots
- matchup context
- repeated winning and losing patterns
- confidence-weighted evidence

Learns:
- likely win paths by archetype
- common failure modes
- lead and resource patterns
- matchup-specific risk zones

Must not learn:
- direct freeform advice from raw replay chat or usernames
- unverified claims about player intent
- Champion-format advice from non-Champion-compatible logs

### `battle_iq_norm_view`
Purpose:
Build Battle IQ comparison groups.

Inputs:
- standardized sub-scores
- confidence-filtered battle records
- format/archetype/matchup class
- log completeness
- rank or skill band if available

Learns:
- norm group means
- norm group standard deviations
- percentile bands
- reliability curves

Must not learn:
- global comparison across incompatible formats
- low-confidence single-log norms
- Champion Battle IQ percentiles from generic Gen 9 logs

### `coaching_language_view`
Purpose:
Improve explanation quality and trainer-facing wording.

Inputs:
- structured evidence
- generated coach summaries
- human-reviewed edits
- drill outcomes

Learns:
- clearer phrasing
- better drill matching
- severity calibration
- player-friendly explanations

Must not learn:
- raw player usernames
- insulting or overconfident phrasing
- unsupported causal language

### `fingerprint_view`
Purpose:
Detect recurring mistake patterns.

Inputs:
- repeated evidence annotations
- player/team history
- matchup context
- score impact over time

Learns:
- repeated mistake frequency
- average Battle IQ impact
- matchups affected
- drills that reduce recurrence

Must not learn:
- permanent player labels from a small sample
- identity claims without longitudinal evidence

## External log policy

Outside logs can be used for:
- parser robustness
- fixture testing
- archetype and matchup priors
- norm-group calibration
- simulator calibration
- pattern discovery

Outside logs cannot be used for:
- direct claims about a user's personal skill
- user-facing comparisons unless norm-group quality is high
- coaching labels without structured evidence
- training on private or non-public battle data without permission
- Champion-specific norms unless the ruleset profile is Champion-compatible

## Champion vs generic Gen 9 boundary
Pokemon Champion logs may differ from public Gen 9 logs in ruleset, available Pokemon, best-of structure, team preview, bring counts, custom bans, custom mechanics, timer behavior, and expected win paths.

Generic Gen 9 logs are useful for parser grammar and broad battle-event coverage. They are not automatically valid evidence for Champion-format strategy.

Rules:
- `champion_exact` logs can train Champion parser, sim priors, strategy priors, Battle IQ norms, fingerprints, and coaching.
- `champion_compatible` logs can train Champion priors only when compatibility is explicitly documented.
- `generic_gen9` logs can train parser robustness, generic event handling, and broad archetype hypotheses.
- `parser_only` logs can be used only to make parsing more resilient.
- `unknown` logs cannot affect scoring, norms, or coaching until classified.

Any report built from generic Gen 9 evidence for Champion play must say the evidence is provisional and format-limited.

## Privacy and identity rules
- Strip or hash player names from training views unless explicit consent exists.
- Keep source URLs in audit storage, not trainer-facing UI.
- Do not surface another player's strategy as personal data.
- Aggregate outside-player data before using it for norms or priors.

## Data quality gates

### Minimum gate for parser tests
- source URL present
- raw log captured
- event count greater than zero
- format identified or marked unknown

### Minimum gate for Battle IQ scoring
- enough turns to evaluate at least two sub-scores
- clear player side
- parse confidence above low threshold
- context uncertainty represented in output

### Minimum gate for norm groups
- same format
- same or compatible battle type
- comparable log completeness
- sufficient sample size
- no dominant duplicate-player skew
- ruleset compatibility confirmed

### Minimum gate for coaching use
- at least two evidence points
- source turn references
- confidence label
- one drill mapping

## Feedback loops

### Simulator feedback loop
Observed real logs update:
- lead frequencies
- bring tendencies
- archetype matchup priors
- common speed-control timing
- likely resource usage windows

They should not directly override:
- battle mechanics
- damage formulas
- turn order rules
- status behavior

### Strategy feedback loop
Observed real logs update:
- matchup warnings
- common punish windows
- failure fingerprints
- lead recommendations
- BO3 adaptation priors

They should not directly replace:
- deterministic sim results
- current corrected Strategy analytics path

### Coaching feedback loop
Observed logs and player outcomes update:
- drill recommendations
- explanation clarity
- confidence calibration
- improvement trend interpretation

They should not produce:
- unsupported psychological labels
- permanent skill judgments
- overconfident claims from small samples

## Versioning
Every generated artifact should carry:
- `schema_version`
- `parser_version`
- `snapshot_version`
- `scoring_version`
- `norm_group_version`
- `source_checksum`

Version changes are required when:
- parser behavior changes
- board-state reconstruction changes
- scoring weights change
- norm group definitions change
- coach-language templates change

## First implementation target
Create a small replay fixture pack:
- one doubles Bo1 log
- one doubles Bo3 log
- one singles standard log
- one singles noisy/random log

For each fixture, store:
- source URL
- raw log or JSON snapshot
- expected format
- expected ruleset profile
- expected compatibility class
- expected minimum event count
- expected confidence class
- expected parser warnings, if any

## Long-term goal
Battle IQ should eventually learn from a growing corpus of real gameplay while keeping three things separate:
- what happened
- what can be inferred
- what should be coached

That separation is the difference between a useful coaching engine and a scoreboard with extra words.
