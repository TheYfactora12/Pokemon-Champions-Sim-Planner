# Battle IQ Scoring Specification

> Status: R1 shipped in `c83a510` on 2026-05-16.
> Product surface: Battle Sensei.
> Principle: Battle IQ is not a measure of real intelligence.

## Product Definition

Battle IQ is a standardized estimate of competitive battle decision quality based on observable battle data, matchup context, and player execution patterns.

It exists to help the player improve. It must never be framed as real intelligence, personal worth, or a fixed player label.

## Why This Exists

Battle Sensei already explains what happened in a battle log. Battle IQ adds a consistent scoring layer so the user can see:

- which decisions raised the quality of their game
- which decisions lowered it
- which skill area needs practice next
- whether the score is reliable enough to trust
- how their decision quality changes over time once profile history exists

The score is useful only when it changes a decision. Never show a statistic without explaining the decision it should change.

## Scoring Model

The scoring system borrows psychometric structure, not psychometric claims:

- sub-scores
- composite score
- confidence labels
- provisional status
- explainability
- future norm groups
- future reliability over multiple samples

The app must not imply that Battle IQ is clinically validated, comparable to real IQ, or stable after one battle.

### Display Scale

Use an IQ-style standard score scale:

- mean: 100
- standard deviation: 15

Current implementation supports:

- raw internal score: 0-100
- provisional standard score
- provisional percentile estimate
- confidence interval/range
- confidence label
- band label

Until enough aggregate data exists, the UI must show `Provisional Battle IQ`.

### Bands

| Standard Score | Band |
|---:|---|
| 130+ | Elite Battle IQ |
| 120-129 | Advanced |
| 110-119 | Strong |
| 90-109 | Average / Developing |
| 80-89 | Needs Focus |
| Below 80 | Major Coaching Opportunity |

## Sub-Scores

Battle IQ uses eight sub-scores:

| Sub-score | Weight | Measures |
|---|---:|---|
| Lead IQ | 12% | Whether the opening lead fits preview, matchup threats, and the user's win path. |
| Turn 1 IQ | 13% | Quality of the first actionable decision after leads are revealed. |
| Speed Control IQ | 13% | Creation, denial, conversion, and survival of Tailwind, Trick Room, priority, and speed swings. |
| Resource IQ | 14% | Timing and value of Tera, Protect, Fake Out, HP trades, Focus Sash, pivots, and key pieces. |
| Threat Recognition IQ | 14% | Whether the player identifies and answers the real losing threat as the board changes. |
| Win Condition IQ | 14% | Whether the player understands, preserves, and adapts their route to victory. |
| Endgame IQ | 10% | Whether the player converts or defends meaningful late-game positions. |
| Risk Discipline IQ | 10% | Whether the player chooses stable lines, avoids unnecessary gambles, and takes necessary risks only when behind. |

If no meaningful endgame exists, Endgame IQ weight is redistributed across:

- Turn 1 IQ
- Resource IQ
- Threat Recognition IQ
- Win Condition IQ

## Current R1 Implementation

Implemented in:

- `poke-sim/replay_learning.js`
- `poke-sim/ui.js`
- `poke-sim/tests/t192_battle_sensei_learning_tests.js`
- `poke-sim/tests/t190_battle_sensei_summary_timeline_tests.js`

The R1 scorer:

- starts each sub-score from a 70 raw baseline
- adjusts scores using observable Battle Sensei evidence tags
- clamps each raw sub-score to 0-100
- computes a weighted raw composite
- converts raw composite to the 100/15 standard display score
- generates raised-by and lowered-by explanations
- recommends one drill
- marks confidence
- shows outcome-bias protection text
- shows a reliability note
- exposes a locked premium preview for full sub-score and profile memory features

R1 evidence comes from Battle Sensei coaching tags:

- `bad_lead`
- `questionable_bring`
- `speed_control_without_pressure`
- `win_condition_exposed`
- `targeting_error`
- `switch_tempo_loss`
- `protect_misuse`
- `field_control_failure`
- `endgame_misplay`
- `rng_material`

## Confidence Rules

Every Battle IQ score must include confidence.

High confidence is not allowed for a single battle in R1. A single clean battle can be medium confidence at best because one log is not enough to infer a stable player profile.

Use:

- `Low`: incomplete log, unclear result, too few turns, or weak evidence.
- `Medium`: complete enough single-game review with clear decision evidence.
- `High`: future multi-log/profile state only, with enough repeated evidence.

If confidence is low:

- keep the score provisional
- avoid strong claims
- recommend more logs
- do not show trend language

## Outcome-Bias Protection

Battle IQ must not treat result as the main driver.

The system should separate:

- good decision / good outcome
- good decision / bad outcome
- bad decision / good outcome
- bad decision / bad outcome

Examples:

- A stable line that loses to a critical hit should keep a stronger decision-quality score, with variance noted.
- A risky low-percentage line that wins should still lower Risk Discipline IQ if the line was not justified by board state.

## Free vs Premium Boundary

Free users should receive immediate single-game value:

- composite Battle IQ score
- band
- confidence
- provisional status
- top reasons the score rose or fell
- one recommended drill
- preview of locked sub-scores/profile memory

Premium/profile users can later unlock:

- full sub-score breakdown
- Battle IQ trend over time
- matchup-specific Battle IQ
- team-specific Battle IQ
- repeated mistake fingerprints
- practical win rate
- personal drill history
- sim-vs-replay comparison
- BO3 adaptation analysis
- saved profile memory across devices

The premium moat is not hiding basic coaching. The moat is durable memory, trend reliability, personalization, and adaptive learning.

## Data And Privacy Boundary

Anonymous/free usage may help improve aggregate coaching only if the product uses opt-in, anonymized, normalized signals.

Do not silently store raw Showdown logs.

Raw logs may contain usernames, private notes, or identifying information. Raw log persistence must be explicit and user-controlled.

Recommended saved data:

- normalized battle summary
- structured battle events
- coaching tags
- Battle IQ score and sub-scores
- confidence label
- drill recommendation
- sim feedback packet

Raw log storage:

- optional
- explicit opt-in
- profile-scoped
- deletable/exportable

## Future Database Tables

Battle IQ should eventually extend the Battle Sensei Supabase model with:

```sql
battle_iq_scores (
  id uuid primary key,
  profile_id uuid null,
  review_id uuid references replay_reviews(id) on delete cascade,
  raw_composite numeric not null,
  standard_score int not null,
  percentile numeric null,
  confidence text not null,
  provisional boolean not null default true,
  band text not null,
  confidence_interval jsonb not null default '{}',
  raised_by jsonb not null default '[]',
  lowered_by jsonb not null default '[]',
  recommended_drill jsonb not null default '{}',
  created_at timestamptz not null default now()
);

battle_iq_subscores (
  id uuid primary key,
  battle_iq_score_id uuid references battle_iq_scores(id) on delete cascade,
  subscore_name text not null,
  raw_score numeric not null,
  standard_score int not null,
  confidence text not null,
  positive_evidence jsonb not null default '[]',
  negative_evidence jsonb not null default '[]'
);

player_iq_profiles (
  id uuid primary key,
  profile_id uuid not null,
  sample_size int not null default 0,
  current_standard_score int null,
  confidence text not null default 'low',
  strongest_subscores jsonb not null default '[]',
  weakest_subscores jsonb not null default '[]',
  recurring_fingerprints jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

iq_norm_groups (
  id uuid primary key,
  format text not null,
  archetype text null,
  matchup_type text null,
  skill_band text null,
  sample_size int not null default 0,
  mean_raw numeric not null,
  sd_raw numeric not null,
  updated_at timestamptz not null default now()
);
```

RLS direction:

- profile-scoped rows require authenticated ownership
- aggregate norm groups are write-protected service data
- anonymous raw logs are not stored
- local-only mode must work when Supabase is offline

## Future Normalization

R1 uses provisional fixed conversion:

```text
raw 70 = Battle IQ 100
raw 85 = Battle IQ 115
raw 55 = Battle IQ 85
```

Future normalization should compare against matched groups:

- format
- archetype
- matchup type
- battle length
- complete vs incomplete logs
- BO1 vs BO3
- rank/skill band if known and user-provided

Do not compare one incomplete beginner log against a global elite/tournament population.

## Stress-Test Questions

Before any Battle IQ expansion ships, answer:

1. Does the score explain what decision should change?
2. Could this overclaim from hidden information?
3. Is a win being rewarded despite bad decision quality?
4. Is a loss being punished despite good decision quality?
5. Is the confidence label conservative enough?
6. Does the UI clearly say this is not real intelligence?
7. Does the saved data respect raw-log privacy?
8. Can the feature still work when DB/Supabase is offline?
9. Is the premium boundary based on durable value, not withholding basic learning?
10. Does this improve coaching, or is it just a vanity metric?

## Acceptance Criteria

R1 is complete when:

- Battle Sensei renders a Battle IQ score card.
- The card says Battle IQ is not real intelligence.
- Eight sub-scores are produced internally.
- The score is provisional for single battles.
- Low-confidence logs produce low-confidence Battle IQ.
- The report explains what raised and lowered the score.
- The report recommends a drill.
- Existing Battle Sensei parser, timeline, and learning tests pass.
- Full non-DB test suite passes.

R2 is complete when:

- saved profile history can track Battle IQ trends
- repeated mistake fingerprints update the profile
- full sub-score breakdown is available for profile users
- practical win rate can use sim plus replay history
- Battle IQ can compare current score to matched norm groups

## Validation

R1 was validated on 2026-05-16 with:

- `node tests/t188_battle_sensei_parser_tests.js`
- `node tests/t190_battle_sensei_summary_timeline_tests.js`
- `node tests/t192_battle_sensei_learning_tests.js`
- `bash tests/_run_all.sh --skip-db`
- `git diff --check`

