# Battle IQ Compliance Checker Spec

Status: draft, no runtime implementation yet.

## Purpose

Add a ruleset-aware team compliance checker that runs before Battle IQ and Strategy coaching. The checker determines whether a team is compatible with the declared ruleset profile so coaching confidence, norm-grouping, and Champion-specific feedback are not applied to unsupported teams.

## Why this exists

Battle IQ should not assume that every replay or team belongs to the same ruleset family.

This checker prevents:
- Champion coaching on generic Gen 9 teams
- high-confidence recommendations for unverified or unsupported teams
- strategy norms being learned from teams that violate the target ruleset
- replay analysis overclaiming legality when the team is only partially known

## Existing integration points

Use the current legality-related team state instead of inventing a parallel data model:
- `team.format`
- `team.legality_status`
- `team.metadata.ruleset_id`
- `isLadderLegal(teamKey)` in `ui.js`
- the existing legality badge and ladder gate in the team picker

Battle IQ compliance should be additive to those fields, not a replacement.

## Inputs

The checker should accept:
- `team`
- `rulesetProfile`
- `battleContext`
- optional `replayArtifact`

### team

Team data already present in the app:
- species
- moves
- items
- abilities
- tera info if available
- team format
- legality status

### rulesetProfile

Ruleset profile should be the authoritative target:
- `format_id`
- `ruleset_name`
- `ruleset_version`
- `generation`
- `battle_type`
- `best_of`
- `lead_count`
- `bring_count`
- `team_size`
- `custom_mechanics_flags`
- `compatibility_class`

### battleContext

Battle context should describe the matchup and log quality:
- `format_tag`
- `detected_format_tag`
- `log_source`
- `confidence_cap`
- `sample_size`
- `log_completeness`
- `has_team_preview`
- `has_full_replay`

### replayArtifact

If available, use replay metadata first:
- `tier`
- `format`
- `roomid`
- `gameType`

## Output shape

Return a normalized compliance object:

```json
{
  "status": "approved | provisional | noncompliant | unknown",
  "confidence": "high | medium | low",
  "ruleset_profile": "champion_exact | champion_compatible | generic_gen9 | parser_only | unknown",
  "violations": [],
  "warnings": [],
  "recommendations": [],
  "gating": {
    "allow_champion_coaching": false,
    "allow_champion_norm_training": false,
    "allow_high_confidence": false
  }
}
```

## Status definitions

### approved

The team is compatible with the target ruleset and there are no blocking violations.

### provisional

The team appears compatible, but evidence is incomplete or inferred.

### noncompliant

The team fails one or more blocking rules for the declared ruleset.

### unknown

The ruleset or team evidence is insufficient to make a reliable call.

## Violation classes

Violations should be specific and machine-readable.

### Structural violations
- `wrong_battle_type`
- `wrong_team_size`
- `wrong_bring_count`
- `wrong_lead_count`
- `missing_team_preview`

### Ruleset violations
- `banned_species`
- `banned_ability`
- `banned_item`
- `banned_move`
- `banned_clause`
- `invalid_custom_mechanic`

### Champion boundary violations
- `generic_gen9_as_champion`
- `unverified_champion_compatibility`
- `champion_profile_mismatch`

### Evidence-quality violations
- `incomplete_replay`
- `unknown_format_tag`
- `parser_only_source`
- `manual_override_required`

## Warning classes

Warnings are non-blocking but should reduce confidence.

- `format_inferred`
- `team_inferred`
- `hidden_information`
- `partial_log`
- `unverified_ruleset`
- `mixed_metadata`

## Recommendation classes

Recommendations should be the minimum edits required to make the team compliant.

- `replace_banned_species`
- `replace_banned_item`
- `replace_banned_move`
- `replace_banned_ability`
- `adjust_bring_count`
- `adjust_team_size`
- `verify_champion_ruleset`
- `switch_to_generic_gen9_mode`

## Confidence rules

Confidence should depend on both team evidence and replay evidence.

Suggested rules:
- `high` only when the replay artifact and team metadata agree
- `medium` when the team is plausible but one side is inferred
- `low` when the team is incomplete, generic, or parser-only

## Gating rules for Battle IQ

### If `status = approved`
- allow full Battle IQ scoring
- allow Champion coaching if the ruleset is Champion
- allow norm-group assignment

### If `status = provisional`
- allow analysis
- cap confidence
- allow coaching only with guarded language
- do not promote to Champion norms without verification

### If `status = noncompliant`
- allow decision-quality analysis only
- block Champion norm training
- force explicit warning language in the UI

### If `status = unknown`
- allow parser and replay analysis
- keep Battle IQ provisional
- do not claim ruleset compliance

## UI labels

The checker should surface simple, trainer-facing labels:
- `Approved`
- `Provisional`
- `Noncompliant`
- `Unknown`

Suggested badge copy:
- `Champion-legal`
- `Champion-legal (provisional)`
- `Not Champion-legal`
- `Ruleset unknown`

## File-level insertion points

### `poke-sim/ui.js`
- add a compliance summary builder near the existing legality helpers
- render the compliance badge on team cards
- pass the compliance object into `renderStrategyTab(...)`
- pass the compliance object into replay coach and Battle IQ summaries

### `poke-sim/legality.js`
- extend or reuse the current legality checker for Champion-specific rule checks
- keep rule validation deterministic

### `poke-sim/replay_coach.js`
- read compliance results before assigning Champion confidence
- cap confidence when compliance is provisional or unknown

### `poke-sim/replay_learning.js`
- block Champion-specific norm training when compliance is noncompliant or unknown
- keep decision-quality analysis available

### `poke-sim/tests/`
- add unit tests for approved, provisional, noncompliant, and unknown states
- add fixture tests for Champion vs generic Gen 9 separation
- add UI tests for badge rendering and confidence caps

## Minimum acceptance criteria

The checker is good enough when:
- generic Gen 9 teams do not receive Champion-approved status
- Champion replay artifacts with verified Champion rules can reach approved status
- noncompliant teams are still analyzable but are not treated as Champion-trainable
- UI labels match the ruleset confidence
- Battle IQ confidence is capped when compliance is provisional or unknown

## Non-goals

This checker should not:
- infer hidden legality without evidence
- auto-rewrite teams
- claim format compliance from a filename alone
- replace the existing `legality.js` checker
- train Champion norms from unsupported teams

