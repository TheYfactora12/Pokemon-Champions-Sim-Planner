# Showdown Replay Coach + Sim Intelligence Engine

> Product thesis: Sim Mode builds the team. Replay Coach builds the player.
> Status: Accepted roadmap spec. Not implemented yet.
> Owner split: product / coaching rules by @TheYfactora12, architecture / persistence by @alfredocox, fixtures / a11y by @Jdoutt38.

## Product Definition

Showdown Replay Coach turns pasted or uploaded Pokemon Showdown battle logs into matchup coaching, mistake diagnosis, player-pattern analysis, and replay-calibrated simulation feedback.

This is not a replay viewer. The viewer shows what happened. Replay Coach explains what mattered, what decision should change, and how the replay should update future sim assumptions.

## Why This Adds Value

The existing app already answers what the team can do in simulation. It does not yet answer what the player actually did in real games. Showdown logs close that gap.

The feature advances the Coaching North Star and the Credibility Ladder:

- Stage 1: AI-vs-AI simulation says what is theoretically happening.
- Stage 3: Showdown replay ingestion can support "replay-calibrated" coaching with real-player evidence.

The feedback loop is:

Simulate -> Play -> Upload Replay -> Diagnose -> Update Coaching -> Improve Sim Assumptions -> Practice Better Lines -> Repeat.

## Core Outputs

Every reviewed replay should produce:

- match summary
- team preview review
- bring-four / selected Pokemon analysis where inferable
- lead grade
- turn timeline
- critical turn
- first mistake and fatal mistake
- speed-control review
- field-control review
- Protect / Fake Out / priority / setup usage review
- win-condition tracker
- RNG materiality score
- team-vs-pilot diagnosis
- better-line suggestions
- practice recommendation
- sim comparison
- sim feedback packet

Every recommendation must include:

- what happened
- why it mattered
- what to do instead
- confidence level

## Parser Data Contract

The parser should extract a normalized object, not UI text.

```json
{
  "source": "showdown-log",
  "format": "gen9vgc2026reg...",
  "players": { "p1": "Player", "p2": "Opponent" },
  "selectedSide": "p1",
  "winner": "p1",
  "turns": [],
  "preview": {
    "p1": [],
    "p2": [],
    "confidence": "low"
  },
  "leads": {
    "p1": [],
    "p2": []
  },
  "revealed": {
    "p1": [],
    "p2": []
  },
  "events": [],
  "unknowns": []
}
```

The first implementation should parse:

- format and player names
- winner / forfeit where visible
- turn boundaries
- switches
- moves
- targets when visible
- faints
- damage / HP percent lines where visible
- status
- weather / terrain / Trick Room / Tailwind where visible
- misses, crits, failed moves, immunities, and no-effect lines
- leads from first active Pokemon
- selected four from revealed Pokemon when full bring is not visible

Do not overclaim from missing data. Missing preview, unknown item, hidden EVs, or incomplete logs must lower confidence.

## Coaching Objects

### Replay Summary

```json
{
  "result": "win|loss|forfeit|unknown",
  "turnCount": 0,
  "yourLead": [],
  "opponentLead": [],
  "yourFour": [],
  "opponentFour": [],
  "leadGrade": "A|B|C|D|F|unknown",
  "criticalTurn": 0,
  "mainIssue": "string",
  "practicePoint": "string",
  "confidence": "high|medium|low"
}
```

### Mistake Tags

Supported MVP tags:

- bad_lead
- questionable_bring
- speed_control_without_pressure
- win_condition_exposed
- targeting_error
- switch_tempo_loss
- protect_misuse
- field_control_failure
- endgame_misplay
- rng_material

### Critical Turn

```json
{
  "turn": 0,
  "type": "first_mistake|fatal_mistake|biggest_swing",
  "whatHappened": "string",
  "whyItMattered": "string",
  "betterLine": "string",
  "confidence": "high|medium|low"
}
```

### Sim Feedback Packet

```json
{
  "simFeedback": {
    "shouldUpdateLeadModel": true,
    "shouldUpdateBringFourModel": true,
    "shouldUpdateArchetypeModel": false,
    "shouldCreateScenario": true,
    "scenarioType": "turn_two_tailwind_no_pressure",
    "pilotDifficultySignal": "high",
    "teamConstructionSignal": "low",
    "rngContamination": "minor",
    "confidence": "medium"
  }
}
```

## Sim Comparison Fields

When replay data exists, matchup coaching can add:

- theoreticalWinRate
- actualReplayWinRate
- practicalWinRate
- pilotDifficulty
- leadSensitivity
- sequencingDifficulty
- endgameDifficulty
- rngExposure
- commonReplayMistakes
- commonCriticalTurns
- bestSimLead
- bestReplayLead
- mostMisplayedLead
- easiestWinningLine
- highestCeilingLine
- safestLine
- recommendedPracticeLine

Definitions:

- theoreticalWinRate: sim-only win rate.
- actualReplayWinRate: uploaded-user-log win rate.
- practicalWinRate: sim win rate adjusted by execution difficulty and replay outcomes.
- pilotDifficulty: how hard the matchup is to play correctly.
- leadSensitivity: how dependent the matchup is on the correct lead.
- sequencingDifficulty: how much correct turn order and positioning matter.
- rngExposure: how much low-probability events affected results.

## UI Scope

Replay Coach page:

- paste log
- upload `.txt`
- select side
- select review mode
- hide raw log by default
- show result summary card
- show team preview card
- show critical turn card
- show coaching tags
- show turn timeline
- show sim comparison card
- show practice plan card
- save/export review

Mobile rule: no spreadsheet replay wall. Use stacked cards, expandable turns, short coaching reads, and one-thumb controls.

## Persistence Scope

Persist normalized summaries before raw logs.

Recommended entities:

- replay_reviews
- replay_turns
- replay_events
- replay_mistake_tags
- replay_sim_feedback
- player_pattern_snapshots

Raw logs are optional and should be user-controlled because they may contain usernames or private notes.

## Phased Build

### Phase R1 - Replay Coach UI Shell

- Add Replay Coach tab.
- Paste/upload log.
- Select side and review type.
- Render placeholder cards.
- No persistence yet.

### Phase R2 - Parser MVP

- Parse players, winner, turns, leads, moves, switches, faints, basic field effects.
- Return normalized object with unknowns and confidence.
- Add fixture logs under `tests/fixtures/showdown/`.

### Phase R3 - Summary + Timeline

- Render result, turns, leads, winner, and selected four where inferable.
- Render readable turn timeline.
- Keep raw log collapsed by default.

### Phase R4 - Core Coaching Rules

- Detect at least five issue types.
- Add confidence labels.
- Add better-line suggestions.
- Do not claim hidden data as fact.

### Phase R5 - Critical Turn Engine

- Detect first mistake, fatal mistake, and biggest swing.
- Explain difference between early mistake and losing turn.

### Phase R6 - Sim Comparison

- Compare actual lead/four/path to sim recommendation.
- Diagnose team issue vs pilot issue vs RNG issue.

### Phase R7 - Sim Feedback Packet

- Emit replay-derived calibration signals.
- Flag new scenarios for future sim testing.

### Phase R8 - Persistence + Multi-Log Patterns

- Save review summary and normalized turn data.
- Build player mistake profile, lead trends, bring-four trends, speed-control conversion, and practice plan.

## Acceptance Criteria

MVP is complete when:

- user can paste a Showdown log
- user can select their side
- parser extracts battle summary
- app shows result, turns, leads, and winner
- app shows a readable timeline
- app detects at least five coaching issues
- app identifies a likely critical turn
- app gives specific better-line suggestions
- app marks confidence
- app does not crash on incomplete logs
- raw log is hidden by default
- existing sim mode still passes smoke and full non-DB suite

V2 is complete when:

- replay can be matched to sim data
- best sim lead is compared to actual lead
- recommended four is compared to actual four
- expected win path is compared to actual path
- team-vs-pilot-vs-RNG diagnosis is rendered
- Sim Feedback Packet is generated
- replay review summary can be saved
- multiple logs produce player-pattern analysis

## Risks And Guardrails

- Showdown log formats vary. Parser must be fixture-driven and tolerant.
- Hidden information is real. Confidence labels must prevent overclaiming.
- Raw logs may include usernames. Raw-log persistence must be explicit.
- Replay-derived calibration should not automatically rewrite sim models until enough sample exists.
- The first version should be deterministic and rule-based before any LLM-style explanation layer is considered.

## First GitHub Issue Breakdown

1. Replay Coach UI shell.
2. Showdown log parser MVP with fixtures.
3. Replay summary and turn timeline.
4. Core replay coaching rules.
5. Critical turn detector.
6. Sim comparison card.
7. Sim Feedback Packet.
8. Replay persistence schema.
9. Multi-log player pattern dashboard.

