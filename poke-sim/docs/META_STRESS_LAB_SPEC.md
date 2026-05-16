# Meta Stress Lab Spec

> Product line: Sim Mode builds the team. Battle Sensei builds the player. Meta Stress Lab challenges the build.
> Status: planned, M13 candidate
> Last updated: 2026-05-16

## Product Definition

Meta Stress Lab is the simulator's competitive stress-testing layer: it uses current meta snapshots, legal set templates, archetype cores, and targeted set mutations to challenge a team against what players are likely to face and what creative opponents could use to break it.

This belongs in the overall sim. It should not be a separate toy page. It should feed Strategy, Battle Sensei, Battle IQ, and future premium coaching.

## Why It Adds Value

The current app already has the early pieces:

- `engine.js` supports hidden-info priors through `prior_snapshots.usage_data`.
- `ui.js` has a static Meta Threat Radar.
- `ui.js` has `csStressTest()` in the Strategy report.
- `legality.js` can gate generated sets before simulation.
- Supabase already stores teams, analyses, logs, and prior snapshots.

The missing product layer is a real stress-test system that updates the user's coaching question from:

> "Can this team win a sim?"

to:

> "What breaks this team if a smart opponent targets it?"

## Process Challenge

Do not brute-force every legal moveset, stat spread, and team combination as the main path.

That creates a combinatorial explosion, wastes compute, and produces fake confidence. Most legal combinations are not strategically coherent. A full brute-force output would be noisy and hard to coach from.

Use a constrained intelligence model:

1. Start from source-labeled meta snapshots.
2. Build legal and plausible sets from observed usage, public teams, and role templates.
3. Add targeted mutations that specifically test a team's weak assumptions.
4. Keep generated scenarios labeled as synthetic stress candidates.
5. Promote only repeatable, evidence-backed findings into coaching.

## Core Outputs

Every Meta Stress Lab run should produce:

- top meta threats tested
- top moves and items tested
- archetypes tested
- hostile lead pairs tested
- highest-risk matchups
- fragile assumptions
- one small team patch
- one medium team patch
- one creative "outside the box" patch
- matchups improved and worsened by each patch
- evidence tier and confidence

The coach should never show usage or stress-test statistics without explaining the decision it should change.

## Meta Snapshot Layer

The snapshot layer stores source-labeled meta information:

- format
- source
- collected_at
- sample size, if known
- species usage
- move usage
- item usage
- ability usage
- common leads
- common cores
- archetype tags
- confidence tier

Rules:

- Never call a snapshot "current" without a collected date.
- Never merge singles and doubles usage without labeling the format.
- Never rank generated stress candidates as real usage data.
- Show source and confidence when output changes coaching.

## Legal Set Generator

The generator should build candidate sets from:

- observed meta sets
- shipped legal catalog teams
- Champions legality rules
- role templates: speed control, Fake Out, redirection, pivot, setup, cleaner, wallbreaker, endgame
- constrained mutations: item swap, one move tech, EV/stat emphasis, ability choice, lead role change

Do not generate impossible or illegal sets. Run candidates through the legality validator before any sim.

Each generated set needs:

- source_type: observed, catalog, template, mutation
- source_ref
- legality verdict
- role intent
- confidence tier
- mutation reason, if generated

## Stress Test Matrix

Stress testing should cover both doubles and singles when the ruleset supports them, but keep reports separated by format.

Core scenario groups:

- top 20 species by selected format snapshot
- top 20 moves by selected format snapshot
- common weather cores
- Trick Room cores
- Tailwind offense cores
- balance cores
- hyper offense cores
- Fake Out cycling cores
- redirection setup cores
- priority pressure cores
- anti-meta tech cores
- team-specific hostile scenarios generated from the user's weak points

The first release can run a smaller capped matrix. It is better to produce 20 high-quality stress tests than 2,000 weak ones.

## Build Challenge Coach

This is the "think outside the box" layer.

It should challenge the trainer with:

- the assumption most likely to fail
- the matchup the team is not respecting
- the move that is lowest value
- the item that is not earning its slot
- the role missing from the six
- the lead pair that looks good but collapses
- the one change with least downside
- one creative tech with clear tradeoffs

Example tone:

> Your team is not simply weak to Rain. It is weak to Rain tempo because your only immediate answer is Tailwind, and Rain can match speed while threatening both Fire slots. The least disruptive patch is one Rain-resistant pivot or one item/move change that lets your Fake Out user survive the first Water spread turn.

## Integration With Existing Product

Strategy tab:

- Replace static Meta Threat Radar with snapshot-backed threat data.
- Upgrade `csStressTest()` from heuristic-only output to scenario-backed output.
- Add "Challenge My Build" recommendations.

Sim Mode:

- Add a Stress Test run mode that uses curated scenario queues.
- Store results separately from standard user-selected matchup runs.

Battle Sensei:

- Use real replay failures to generate new stress scenarios.
- Compare actual replay loss paths against stress-test predictions.

Battle IQ:

- Do not let stress tests directly inflate or reduce Battle IQ.
- Use them to explain preparation quality and matchup awareness.

Supabase:

- Store snapshots, scenario queues, stress-test runs, and aggregate stress findings.
- Keep anonymous aggregate data separate from premium personal profile data.

Premium aggregate learning:

- Premium reports may use anonymized pattern signals from other players' logs to suggest possible changes.
- These must be phrased as pattern-backed options, not certainties.
- The engine can say "similar teams often improved this matchup by testing X" only when the signal has enough sample size, format match, and archetype match.
- Never expose another player's team, replay, username, raw log, or private trend.
- Always show whether the suggestion came from the user's own data, aggregate data, simulation data, or synthetic stress testing.
- Aggregate suggestions should produce a test plan first, not an automatic team edit.

## Suggested Database Tables

```sql
meta_snapshots (
  id uuid primary key,
  format text not null,
  source text not null,
  collected_at timestamptz not null,
  sample_size integer,
  confidence text not null,
  usage_json jsonb not null,
  created_at timestamptz default now()
);

meta_set_templates (
  id uuid primary key,
  format text not null,
  species text not null,
  role_tags text[] not null default '{}',
  set_json jsonb not null,
  source_type text not null,
  source_ref text,
  legality_status text not null,
  confidence text not null,
  created_at timestamptz default now()
);

stress_test_runs (
  id uuid primary key,
  user_id uuid,
  team_id text,
  format text not null,
  scenario_count integer not null default 0,
  run_status text not null,
  summary_json jsonb not null default '{}',
  created_at timestamptz default now()
);

stress_test_scenarios (
  id uuid primary key,
  run_id uuid references stress_test_runs(id) on delete cascade,
  scenario_type text not null,
  opponent_team_json jsonb not null,
  evidence_json jsonb not null default '{}',
  synthetic boolean not null default false,
  confidence text not null
);

stress_test_results (
  id uuid primary key,
  scenario_id uuid references stress_test_scenarios(id) on delete cascade,
  wins integer not null default 0,
  losses integer not null default 0,
  draws integer not null default 0,
  sample_size integer not null default 0,
  result_json jsonb not null default '{}',
  coaching_json jsonb not null default '{}'
);

aggregate_pattern_suggestions (
  id uuid primary key,
  format text not null,
  player_archetype text,
  opponent_archetype text,
  pattern_key text not null,
  suggested_change_json jsonb not null,
  evidence_json jsonb not null,
  sample_size integer not null default 0,
  confidence text not null,
  created_at timestamptz default now()
);
```

## MVP

1. Add Meta Stress Lab spec and roadmap.
2. Replace hardcoded Meta Threat Radar data with a source-labeled local snapshot object.
3. Add stress-test scenario objects using existing catalog teams and archetype tags.
4. Extend Strategy report with stress-test evidence: scenario, result, decision change, confidence.
5. Add tests proving stress output stays source-labeled and does not alter battle mechanics.

## V2

1. Add Supabase tables for snapshots and stress-test runs.
2. Add snapshot loader in `supabase_adapter.js`.
3. Add constrained legal set generator.
4. Add singles and doubles separated scenario queues.
5. Let Battle Sensei create "replay-derived stress scenarios" when logs reveal repeatable failure states.
6. Add aggregate pattern suggestions for premium users with privacy-safe evidence labels.

## V3

1. Adaptive meta scout.
2. Premium stress-test history per saved team.
3. Practical matchup difficulty from sim plus replay plus stress data.
4. Creative tech recommender with tradeoff simulation.
5. Tournament prep queue based on current meta snapshots and personal weaknesses.

## Acceptance Criteria

- No battle-engine mechanics change in the first implementation.
- No current-meta claim without source date.
- No generated set is simulated unless it passes legality validation or is clearly blocked.
- No mixed singles/doubles report without format labels.
- No coaching statistic appears without a recommended decision change.
- Stress findings include confidence and evidence source.
- Premium aggregate suggestions never expose raw player logs or another user's private team.
- Strategy, Battle Sensei, and Battle IQ stay aligned with the observable-evidence standard.
