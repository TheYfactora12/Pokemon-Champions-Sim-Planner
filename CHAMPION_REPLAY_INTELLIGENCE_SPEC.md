# Champion Replay Intelligence Spec

Status: implementation contract, no new runtime code in this document.

## Product name

User-facing name: Champion Replay Intelligence

Internal module name: Battle Mirror

Reasoning:
- "Champion Replay Intelligence" is clear to paying users.
- "Battle Mirror" is short enough for internal code and fixture names.
- "Replay Truth Layer" is accurate but sounds more like infrastructure than a product feature.

## Product thesis

Champion Replay Intelligence compares verified Champion replay evidence against simulator predictions, team compliance, and Battle IQ scoring.

The feature must answer one question:

What changed after this replay was uploaded?

The answer must identify:
- what the player did right
- what the player did wrong
- what the simulator predicted correctly
- what the simulator missed
- whether the result was mainly execution, team construction, matchup knowledge, variance, parser uncertainty, or compliance uncertainty
- what the player should practice or change next

This is not a generic replay summarizer.

## Market gap

Competitive players already have replays, damage calculators, usage stats, Discord coaching, YouTube analysis, and manual team reports.

The gap is the combination of:
- simulator predictions
- verified replay evidence
- ruleset and legality validation
- player mistake trends
- team-building feedback
- matchup-specific lead planning
- coaching output grounded in a real battle

Minimum lovable version:
- accepts a verified Champion replay
- validates ruleset and team compliance
- finds the key turning point
- explains one mistake, one strong play, and one next drill
- compares the replay to the last simulator snapshot when available

Premium version:
- tracks repeated mistakes across verified Champion replays
- compares player behavior against matchup-specific simulator expectations
- builds matchup-specific lead and bring plans
- exports a coach-readable report

Do not build yet:
- generalized public ladder mining
- global player rankings
- automated model retraining from raw wins/losses
- freeform AI judgment without source evidence
- cross-ruleset Champion norms from generic Gen 9 logs

## Core gates

Champion calibration requires all of:
- replay artifact classified as `champion_exact` or approved `champion_compatible`
- parser confidence at least `medium`
- team compliance not `noncompliant`
- Battle IQ confidence not `low`
- no blocking parser warnings

Decision-quality review can still run when compliance fails.

Champion norm training cannot run when:
- replay is `generic_gen9`
- replay is `parser_only`
- compliance is `noncompliant`
- compliance is `unknown`
- result is too incomplete to reconstruct the board

## Status codes

### Artifact verification

- `champion_exact`: replay metadata or `|tier|` line explicitly identifies a Champions format
- `champion_compatible`: manually approved compatible artifact
- `generic_gen9`: valid Gen 9 replay, not Champion-specific
- `parser_only`: useful only for parser robustness
- `unknown`: not enough metadata

### Compliance

- `approved`: ruleset and team are compatible
- `provisional`: plausible but inferred or incomplete
- `noncompliant`: blocking violation exists
- `unknown`: not enough team or ruleset evidence

### Simulator comparison

- `simulator_confirmed`
- `simulator_partially_confirmed`
- `simulator_contradicted`
- `player_execution_loss`
- `team_construction_loss`
- `matchup_knowledge_loss`
- `variance_heavy_result`
- `parser_confidence_too_low`
- `compliance_confidence_too_low`

### Trend classification

- `player_habit`
- `team_flaw`
- `matchup_flaw`
- `scouting_flaw`
- `mechanical_misunderstanding`
- `variance_noise`

## Schemas

### ReplayArtifact

```js
{
  id: "string",
  schema_version: "battle_mirror_replay_artifact_v1",
  source_type: "url | pasted_text | uploaded_log | uploaded_text | champion_native",
  source_url: "string",
  raw_text_ref: "string",
  checksum: "string",
  format_tag: "champion | doubles | singles | random | unknown",
  ruleset_profile: "champion_exact | champion_compatible | generic_gen9 | parser_only | unknown",
  tier: "string",
  game_type: "singles | doubles | unknown",
  generation: 9,
  verified: true,
  verification_notes: ["string"],
  parser_confidence: "high | medium | low",
  compliance_status: "approved | provisional | noncompliant | unknown",
  uploaded_at: "iso_timestamp"
}
```

Rules:
- `tier` and replay metadata outrank filename.
- `verified = true` only means the artifact identity is verified, not that every play was correct.

### ComplianceFinding

```js
{
  severity: "error | warn | info",
  category: "structural | ruleset | champion_boundary | evidence_quality",
  entity: "team | pokemon | move | item | ability | replay | ruleset",
  code: "string",
  message: "string",
  evidence: "string",
  blocks_analysis: false,
  blocks_calibration: true,
  recommended_fix: "string"
}
```

Rules:
- Error findings can block Champion coaching or calibration.
- Warning findings reduce confidence.
- Findings must be specific enough for a user to fix the issue.

### BattleTimeline

```js
{
  replay_id: "string",
  players: { p1: "string", p2: "string" },
  teams: { p1: [], p2: [] },
  winner: "string",
  total_turns: 0,
  incomplete: false,
  confidence: "high | medium | low",
  turns: []
}
```

### TurnEvent

```js
{
  turn_number: 1,
  board_before: {},
  actions: [],
  events: [],
  board_after: {},
  momentum_delta: -2,
  risk_level: "low | medium | high",
  mistake_flags: [],
  good_play_flags: [],
  variance_flags: [],
  likely_alternative_lines: [],
  confidence: "high | medium | low"
}
```

Rules:
- Hidden information must be marked as unknown.
- Alternatives are suggestions, not proven optimal lines.

### BattleIQFinding

```js
{
  severity: "high | medium | low",
  category: "lead | turn_1 | speed_control | resource | threat_recognition | win_condition | endgame | risk",
  turn_number: 1,
  finding: "string",
  evidence: "string",
  coaching_note: "string",
  better_line: "string",
  confidence: "high | medium | low"
}
```

Rules:
- Every finding must point to replay evidence.
- Do not say "bad play" when the evidence only supports "risky line".

### SimulatorRealityComparison

```js
{
  replay_id: "string",
  simulator_snapshot_id: "string",
  status: "simulator_confirmed | simulator_partially_confirmed | simulator_contradicted | player_execution_loss | team_construction_loss | matchup_knowledge_loss | variance_heavy_result | parser_confidence_too_low | compliance_confidence_too_low",
  predicted_winner: "string",
  actual_winner: "string",
  predicted_leads: [],
  actual_leads: [],
  predicted_win_path: "string",
  observed_win_path: "string",
  simulator_correct: [],
  simulator_missed: [],
  player_execution_notes: [],
  team_building_notes: [],
  calibration_action: "none | create_fixture | update_parser_case | update_strategy_prior | review_sim_model",
  confidence: "high | medium | low"
}
```

Rules:
- Compare against a frozen simulator snapshot captured before replay analysis.
- Do not let replay outcome overwrite simulator logic automatically.

### ReplayTrend

```js
{
  pattern: "string",
  frequency: 2,
  examples: [],
  likely_cause: "player_habit | team_flaw | matchup_flaw | scouting_flaw | mechanical_misunderstanding | variance_noise",
  coaching_priority: "high | medium | low",
  recommended_drill: "string",
  confidence: "high | medium | low"
}
```

Rules:
- Trend layer requires at least two verified Champion replays.
- Trends from generic Gen 9 logs cannot train Champion norms.

## UI contract

Upload screen:
- paste URL
- paste log
- upload `.log` or `.txt`
- sample verified Champion replay
- privacy note

Validation screen:
- detected format
- ruleset profile
- parser confidence
- compliance status
- blockers and warnings

Battle timeline:
- turn list
- critical turn marker
- momentum change
- mistake and good-play flags
- raw event details behind a disclosure

Coaching dashboard:
- Battle IQ score
- key turning point
- biggest mistake
- best play
- missed win path
- next practice focus
- lead and bring recommendation
- simulator calibration note

Trend dashboard:
- repeat mistake pattern
- examples across verified Champion replays
- likely cause
- recommended drill

Export:
- copyable coaching summary
- PDF-ready report
- anonymized export option

## MVP architecture

MVP should use existing modules:
- `replay_coach.js` for parsing and review
- `replay_learning.js` for Battle IQ and coaching
- `legality.js` for Champion legality
- `ui.js` for compliance badges and report rendering
- `tests/fixtures/replays/manifest.json` for verified artifact registration

MVP additions:
- one more verified Champion replay fixture
- `ReplayArtifact` builder around parsed replay data
- `SimulatorRealityComparison` builder that consumes existing sim result snapshots
- trend detector for two or more verified Champion replays

## V2 architecture

V2 should split runtime modules:
- `battle_mirror/artifact.js`
- `battle_mirror/timeline.js`
- `battle_mirror/compliance.js`
- `battle_mirror/comparison.js`
- `battle_mirror/trends.js`
- `battle_mirror/report.js`

Keep V2 storage local-first until server persistence is explicitly needed.

## Market-grade architecture

Market-grade version adds:
- user replay library
- privacy controls
- anonymized training export
- server-side fixture registry
- simulator snapshot versioning
- matchup-specific trend dashboard
- coach share links
- premium report export

Server persistence must store raw logs separately from derived coaching outputs.

## First tests to add

1. Verified Champion artifact classification:
   - fixture contains `|tier|[Gen 9 Champions] ...`
   - expected profile is `champion_exact`

2. Generic Gen 9 rejection:
   - fixture contains `[Gen 9] National Dex`
   - expected profile is `generic_gen9`
   - Champion norm training is blocked

3. Compliance gating:
   - approved Champion team allows Champion coaching
   - provisional team caps confidence
   - noncompliant team blocks calibration

4. Simulator comparison:
   - predicted lead matches actual lead
   - predicted win path differs from observed win path
   - comparison returns `simulator_partially_confirmed`

5. Trend gating:
   - one verified replay returns no trend
   - two verified replays with same issue return one `ReplayTrend`
   - generic Gen 9 replay does not count toward Champion trend frequency

6. User-facing language:
   - no raw internal team IDs
   - no unsupported Champion claims
   - every finding has evidence and a next action

## Acceptance criteria

The feature is ready for MVP when:
- at least two verified Champion replays are registered as fixtures
- Champion fixtures are detected from artifact metadata, not filenames
- compliance status appears in the team UI and Strategy report
- Battle Sensei can analyze verified Champion and generic Gen 9 logs differently
- trend analysis only activates for two or more verified Champion replays
- simulator comparison uses a frozen snapshot and emits a calibration action
- all user-facing findings include evidence, interpretation, and a next action

## Product risk checks

Reasons users will distrust the feature:
- it calls generic Gen 9 logs Champion data
- it overstates confidence from one replay
- it blames the player for variance
- it recommends impossible or illegal team changes
- it hides why a conclusion was reached
- it uses raw machine-output language

Trust rules:
- show confidence beside every major conclusion
- separate player mistake from team flaw, matchup issue, and variance
- explain blocker findings before coaching findings
- keep single-replay Battle IQ provisional
- require verified Champion artifacts for Champion norm training

