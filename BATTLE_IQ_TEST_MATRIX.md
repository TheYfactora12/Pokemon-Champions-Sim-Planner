# Battle IQ Test Matrix

## Test objectives
Validate Battle IQ end-to-end across evidence parsing, scoring, Strategy integration, and fairness controls.

## Unit tests

### Parser and snapshot
- `battle_iq_parser_smoke`
  - clean log parses all core event types
- `battle_iq_parser_incomplete`
  - missing lines returns warnings, no crash
- `battle_iq_snapshot_turns`
  - board snapshots have stable turn progression and context deltas
- `battle_iq_snapshot_state_derivation`
  - speed/weather/terrain/resource flags compute correctly

### Context and mapping
- `battle_iq_archetype_classification`
  - known archetype pair outputs expected context
- `battle_iq_matchup_difficulty`
  - harder class reduces unfair penalties
- `battle_iq_team_label_resolution`
  - no internal IDs in trainer-facing labels

### Sub-score math
- `battle_iq_subscores_range`
  - clamps 0..100 and retains signal provenance
- `battle_iq_endgame_redistribution`
  - weight redistribution when endgame missing
- `battle_iq_weighted_composite`
  - recomputes correctly with active weights
- `battle_iq_loss_label_filter`
  - no Opponent Win in win-path arrays
- `battle_iq_denominator_guard`
  - division guards and correct denominators per stat

### Normalization and confidence
- `battle_iq_standard_conversion`
  - provisional conversion formula valid
- `battle_iq_norm_group_application`
  - percentile only when matched norm coverage exists
- `battle_iq_confidence_low_complete`
  - incomplete log => low confidence and provisional
- `battle_iq_confidence_variance`
  - variance events reduce confidence but do not force score collapse

### Explanation and coaching output
- `battle_iq_explanation_format`
  - all text includes observation/impact/why/drill
- `battle_iq_no_raw_language`
  - no internal/debug tokens in UI summary text
- `battle_iq_outcome_bias`
  - lucky win + bad read does not inflate Risk Discipline
  - unlucky loss + good read keeps decision quality high

## Integration tests

### Strategy render V2
- `battle_iq_render_v2_insertion`
  - Strategy tab renders Battle IQ section when present
- `battle_iq_render_backward_compat`
  - no section required for old payloads
- `battle_iq_team_name_visibility`
  - rendered text uses friendly names

### Analytics payload
- `battle_iq_payload_shape`
  - additive `battle_iq` object in report payload
- `battle_iq_payload_stability`
  - legacy fields unchanged

### BO3 and adaptation
- `battle_iq_bo3_adaptation_present`
  - adaptation notes with Game1->Game2 delta when available
- `battle_iq_bo3_adaptation_absent`
  - no fabricated adaptation for single game

### Repeated mistakes
- `battle_iq_fingerprint_generation`
  - recurring pattern creates fingerprint with impact
- `battle_iq_fingerprint_recency`
  - last_seen updates and priority ranking

## Stress fixtures (must be included)
- full_clean_log
- incomplete_log
- early_forfeit
- disconnect_or_timeout
- hidden_team_ids
- unknown_moves
- very_short_battle
- long_battle
- bo3_adaptation
- lucky_win_bad_read
- unlucky_loss_good_read
- tailwind_expiration_collapse
- trick_room_panic
- early_tera_collapse
- endgame_throw
- repeated_loss_path_pattern

## Regression/anti-regression
- no-matchup_intelligence-breakage
- no_bo3_regression
- no_team_id_leak
- no_loss_paths_in_top_win_paths
- no_false_precision

## Definition of done
- All tests passing on existing baseline tests + above additions.
- Strategy render test includes premium and free branches.
- CI includes coverage for malformed logs and parse failures.
