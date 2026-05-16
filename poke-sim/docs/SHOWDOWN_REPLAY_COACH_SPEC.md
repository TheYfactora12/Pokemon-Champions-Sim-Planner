# Battle Sensei + Sim Intelligence Engine

> Product thesis: Sim Mode builds the team. Battle Sensei builds the player.
> Tagline: Battle Sensei: Learn why the turn went wrong.
> Status: Accepted roadmap spec. R1/R2 MVP started.
> Owner split: product / coaching rules by @TheYfactora12, architecture / persistence by @alfredocox, fixtures / a11y by @Jdoutt38.

## Product Definition

Battle Sensei turns pasted or uploaded Pokemon Showdown battle logs into matchup coaching, mistake diagnosis, player-pattern analysis, and replay-calibrated simulation feedback.

This is not a replay viewer. The viewer shows what happened. Battle Sensei explains what mattered, what decision should change, and how the replay should update future sim assumptions.

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
- provisional Battle IQ score

Every recommendation must include:

- what happened
- why it mattered
- what to do instead
- confidence level

## Battle IQ Boundary

Battle IQ is documented in [`BATTLE_IQ_SPEC.md`](./BATTLE_IQ_SPEC.md).

Battle IQ means:

> A standardized estimate of competitive battle decision quality based on observable battle data, matchup context, and player execution patterns.

Battle IQ must never be described as real intelligence. It is a coaching score, not a personal judgment.

Current R1 behavior:

- single-battle scores are provisional
- one clean replay can be medium confidence at best
- incomplete logs must lower confidence
- the UI must explain why the score rose or fell
- the UI must recommend a drill
- premium/profile value comes from saved memory, trends, repeated mistake fingerprints, matched norm groups, and longitudinal coaching

The process challenge is intentional: if a Battle IQ feature cannot explain what decision should change, it should not ship.

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

Battle Sensei page:

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

## Product Surface And Access Model

Battle Sensei should be a first-class tab/page, not a hidden subpanel inside the current Replay Log and not inside the Strategy area. The mental model is different:

- Sim Coach answers: what should my team do?
- Strategy answers: how does this team plan against the sim/meta?
- Battle Sensei answers: what did I actually do?
- Player Dashboard answers: what pattern keeps repeating?

Replay data should still feed the same Coaching Intelligence Engine. The UI surface is separate, but the normalized data model can be shared later for calibration.

Recommended access model:

- Anonymous visitor: can paste one log, run a temporary review, and see a cached report in the current browser session.
- Local-only user: can keep temporary reports in browser storage, export them manually, and clear them.
- Account/profile user: can save teams, sim history, replay summaries, player patterns, and cross-device progress.
- Advanced/full coach report: can be a future paid or gated capability, but the parser and basic replay review should exist before any monetization decision.

Do not require login for the first useful replay review. Require login/profile persistence only when the user wants durable saved data, multi-log history, cross-device sync, or a merged long-term coaching profile.

Future premium/report direction:

- Keep Sim Coach and Battle Sensei separate while the data models mature.
- Once both sides are finalized, combine simulation plans plus real replay behavior into a full coaching report.
- Working names: `Colosseum Report`, `Professor Doutt's Premium Coaching Report`, or a cleaner final brand later.
- This report should be a synthesis layer, not a replacement for either tab.

The product rule is:

- basic replay value should be immediate
- saved coaching history should require a profile
- full merged sim-plus-replay intelligence can be a later premium/business layer

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

Data retention policy:

- Temp review: normalized result lives in memory and may be cached locally for the session.
- Saved review: normalized summary, mistake tags, confidence, and sim feedback packet are saved.
- Raw log: saved only after explicit opt-in.
- Account/profile sync: saved only after the user signs in or imports/exports a profile bundle.

## Supabase / DB Design

Battle Sensei should use the DB for durable, queryable coaching history, not for temporary anonymous review.

Recommended split:

- anonymous temp review: memory plus optional browser storage
- saved local review: `Storage` / IndexedDB-style local persistence
- signed-in profile: Supabase persistence
- raw log: opt-in only, never required for coaching summaries

Suggested Supabase tables:

```sql
replay_reviews (
  id uuid primary key,
  profile_id uuid null,
  player_team_id text null,
  opp_team_id text null,
  source text not null,
  format text null,
  selected_side text not null,
  winner text null,
  result text null,
  turn_count int not null default 0,
  lead_grade text null,
  bring_grade text null,
  critical_turn int null,
  confidence text not null,
  raw_log_saved boolean not null default false,
  raw_log text null,
  summary_json jsonb not null default '{}',
  created_at timestamptz not null default now()
);

replay_turns (
  id uuid primary key,
  review_id uuid references replay_reviews(id) on delete cascade,
  turn_number int not null,
  board_state jsonb not null default '{}',
  events jsonb not null default '[]',
  coaching_json jsonb not null default '{}'
);

replay_mistake_tags (
  id uuid primary key,
  review_id uuid references replay_reviews(id) on delete cascade,
  turn_number int null,
  tag text not null,
  severity text not null,
  confidence text not null,
  evidence text null,
  recommendation text null
);

replay_sim_feedback (
  id uuid primary key,
  review_id uuid references replay_reviews(id) on delete cascade,
  should_update_lead_model boolean not null default false,
  should_update_bring_four_model boolean not null default false,
  should_update_archetype_model boolean not null default false,
  should_create_scenario boolean not null default false,
  scenario_type text null,
  pilot_difficulty_signal text null,
  team_construction_signal text null,
  rng_contamination text null,
  confidence text not null,
  payload jsonb not null default '{}'
);

player_pattern_snapshots (
  id uuid primary key,
  profile_id uuid null,
  team_signature text null,
  sample_size int not null default 0,
  pattern_json jsonb not null default '{}',
  created_at timestamptz not null default now()
);
```

RLS direction:

- anonymous inserts can be disabled until the account/profile model exists
- public read should be off by default
- profile-scoped read/write should require ownership once auth exists
- local-only mode must continue to work without Supabase credentials

Adapter direction:

- add fail-soft methods such as `saveReplayReview`, `loadReplayReviewsForProfile`, and `loadReplayTurns`
- never block replay analysis when DB is unavailable
- persist normalized data first; raw log is a separate opt-in field

## Phased Build

### Phase R1 - Battle Sensei UI Shell

- Add Battle Sensei tab.
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

1. `#187` Parent tracker.
2. `#188` Battle Sensei UI shell.
3. `#189` Showdown log parser MVP with fixtures.
4. `#190` Replay summary and turn timeline.
5. `#191` Core replay coaching rules.
6. `#192` Critical turn detector.
7. `#193` Sim comparison card.
8. `#194` Sim Feedback Packet.
9. `#195` Replay persistence schema and privacy controls.
10. `#196` Multi-log player pattern dashboard.
11. `#197` Supabase replay schema migration.
