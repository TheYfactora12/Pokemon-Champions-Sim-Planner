# DB Architecture Stress-Test Plan

Date: 2026-07-01
Status: Architecture framing slice. Do not treat this as a DB migration or public-launch approval.

## Goal

Stress test the database split before adding more tables. The product direction is bigger than a simulator save table:

1. prove the simulator is accurate
2. preserve evidence for every important claim
3. give each trainer a private room to test and improve
4. let Battle Sensei coach from that trainer's own evidence
5. let global learning improve from anonymized, trusted, versioned signals
6. eventually support bot practice without teaching from bad or private data

The DB must make wrong data hard to promote, stale data easy to mark, and private player data impossible to leak by accident.

## Proposed split

### 1. Source truth

Owns:

- official/in-game source captures
- rule facts
- legality facts
- regulation windows
- ruleset packages
- Champion-vs-Showdown parity status

Existing foundation:

- `rule_facts`
- `ruleset_packages`
- source registry docs
- legality evidence package foundation

Stress test:

- Can unknown Champion data stay `needs_verification`? Yes.
- Can Showdown data be useful without becoming Champion truth? Yes, if source tier stays separate.
- Can old rulesets become stale? Partially; packages support status, but promotion/recalc needs more automation.

Decision:

- Keep this read-only to browser clients.
- Only trusted source-sync/review jobs should write source truth.

### 2. Runtime catalog

Owns:

- approved built-in teams used by the static simulator
- runtime selectable teams
- current legal fallback catalog

Existing foundation:

- `teams`
- `team_members`
- runtime generated data
- DB catalog guardrails

Stress test:

- Can non-legal teams poison selectors? Partially blocked by frontend and retirement guards.
- Can anon writes add bad teams? Current legacy policies are too broad for public scale.
- Can runtime teams be separated from user custom teams? Not clean enough yet.

Decision:

- Keep runtime catalog separate from user-created trainer teams.
- Remove or replace broad anon writes before public launch.

### 3. Evidence truth

Owns:

- sim jobs
- sim runs
- replay evidence
- QA artifacts
- branch sweeps
- damage/effect/turn logs
- evidence summaries

Existing foundation:

- `team_lab_sim_jobs`
- `team_lab_sim_runs`
- `team_lab_replays`
- `branch_coverage_runs`
- QA artifact export/import normalization

Stress test:

- Can every evidence row be tied to `regulation_id`, `format`, `engine_version`, and `ruleset_version`? Team Lab yes; legacy tables only partially.
- Can evidence be replay-verifiable? Partially; QA artifacts are stronger than current DB history.
- Can bad browser evidence become official? It should not, but trusted import worker is not built yet.

Decision:

- Treat browser evidence as provisional until trusted import validates it.
- Keep QA artifact exports authoritative until DB forensic retention is intentionally designed.

### 4. Trainer room truth

Owns:

- trainer profile
- private rooms
- saved private teams
- uploaded battle files
- private sim history
- personal Battle Sensei memory
- practice drills
- future bot sessions

Existing foundation:

- `trainer_profiles`
- `trainer_rooms`
- `trainer_room_teams`
- owner-scoped RLS migration added in `db/migrations/2026_07_01_trainer_room_foundation.sql`

Stress test:

- Can a player upload Showdown battles and test against their own team without leaking data? Partially; the private room container now exists, but replay import governance is not built yet.
- Can a trainer have team variants, matchup notes, and private coaching history? Partially; room team links and notes exist, but coaching memory is still deferred.
- Can we separate personal analytics from global aggregate analytics? Yes at the schema boundary; no global aggregate writes are created in this slice.

Decision:

- Keep trainer rooms private-first and owner-scoped.
- Public showcase, replay imports, personal coaching facts, global learning, and bot sessions require separate reviewed migrations.

### 5. Global learning truth

Owns:

- anonymized aggregate patterns
- accepted global learning signals
- aggregate matchup trends
- confidence/sample-size/stale flags
- import audit decisions

Existing foundation:

- Team Lab promotion concepts exist.
- No full global learning aggregate layer yet.

Stress test:

- Can one user's bad import poison global recommendations? Without a trusted import worker, yes.
- Can hidden tech leak through aggregate tables? If aggregates are poorly designed, yes.
- Can global recommendations survive engine/ruleset updates? Only if every row is versioned and staleable.

Decision:

- Do not build global learning writes until trainer consent, trusted import, mapping verification, and stale marking are implemented.
- Store aggregate buckets, not raw private data.

### 6. Bot practice truth

Owns:

- bot profile
- bot policy version
- manual battle sessions
- board states
- player actions
- bot actions
- bot reasoning summaries
- outcome evidence

Existing foundation:

- Not built yet.

Stress test:

- Can the bot cite why it made a play? Not until evidence/ref paths exist.
- Can bad engine logic train bad bot behavior? Yes.
- Can a bot learn from one player without exposing them to others? Only with trainer-room privacy and consent controls.

Decision:

- Bot practice is future-gated behind sim truth, trainer rooms, and personal coaching memory.
- Bot memory must store `bot_version`, `policy_version`, `engine_version`, `ruleset_version`, and evidence refs.

## Roadmap stress test

### Current priority: simulator truth

DB requirement:

- Store evidence, not claims.
- QA artifacts must say what they prove and what blocks 100%.
- No global ranking/coaching promotion from incomplete mechanics.

Pass/fail:

- Current QA 100-readiness gate is aligned.
- Remaining blocker is producing the missing evidence, not more DB surface.

### Near priority: trainer-room foundation

DB requirement:

- `trainer_profiles`
- `trainer_rooms`
- `trainer_room_teams`
- owner-scoped RLS
- no global learning writes

Pass/fail:

- Backend-only foundation is implemented in `2026_07_01_trainer_room_foundation.sql`.
- It remains a privacy boundary only; it does not make coaching, replay parsing, global learning, or bot-play claims.

### Next priority: replay import governance

DB requirement:

- private replay imports
- parser version
- source hash
- parse status
- mapping status
- source gaps
- replay turns/events

Pass/fail:

- Needed before Showdown battle uploads can train personal coaching.
- Not safe for global learning until parser/mapping is verified.

### Later priority: personal coaching memory

DB requirement:

- trainer coaching facts
- practice drills
- stale flags
- evidence refs
- confidence/sample size

Pass/fail:

- Should wait until replay imports and sim evidence are stable enough to cite.

### Later priority: global aggregate learning

DB requirement:

- aggregate-only learning signals
- consent boundary
- import audits
- sample-size/confidence gates
- version/stale gates

Pass/fail:

- Must wait for trusted import worker and promotion rules.

### Future priority: bot practice

DB requirement:

- bot profiles
- bot sessions
- bot turns
- policy version
- board/action/outcome evidence

Pass/fail:

- Must wait for trainer rooms and personal coaching memory.

## Top architecture challenges

### Challenge 1: Too many writes from the browser

Problem:

- Current legacy anon insert/update policies are useful for prototype speed but unsafe for public learning.

Answer:

- Browser writes can save private trainer-owned data under RLS.
- Browser must not write source truth, official promotion decisions, global learning, or trusted leaderboard state.

### Challenge 2: Personal evidence versus global evidence

Problem:

- A player wants tailored coaching from their own battles, but global coaching must not leak or overfit private data.

Answer:

- Personal data lives under trainer rooms.
- Global data stores anonymized aggregates only after consent and trusted import.

### Challenge 3: Simulator bugs can poison learning

Problem:

- If the engine is wrong, saved results and coaching facts can become wrong.

Answer:

- Every evidence/coaching/learning row carries `engine_version`, `ruleset_version`, `regulation_id`, and `format`.
- Engine/ruleset updates mark affected rows stale.

### Challenge 4: Real replay parsing can be partial

Problem:

- Showdown HTML/text can parse imperfectly, especially team identity, hidden info, and field state.

Answer:

- Replay imports keep `parse_status`, `team_mapping_status`, `parser_version`, and `source_gaps`.
- Partial imports can coach privately with caveats but cannot feed trusted global rows.

### Challenge 5: Team Lab rankings can look too official

Problem:

- A leaderboard can mislead users if sample size, legality, or stale version status is weak.

Answer:

- Official Team Lab promotion requires verified legality, current versions, verified mapping, approved benchmark pool, minimum samples, and no unresolved source gaps.
- Everything else is experimental/local preview.

## First implementation frame

The first migration slice creates only the trainer-room foundation:

- `trainer_profiles`
- `trainer_rooms`
- `trainer_room_teams`
- owner RLS
- public read disabled by default
- tests proving owner-only access logic in migration text

Do not include yet:

- global learning
- bot sessions
- personal coaching facts
- replay turn storage
- payment/account entitlements
- leaderboard promotion changes

Reason:

- This gives the product a safe private container without overbuilding future systems before sim truth is ready.

Implementation update:

- `db/migrations/2026_07_01_trainer_room_foundation.sql`
- `tests/trainer_room_tests.js`
- Public read is disabled by default, including for `public_showcase`, until an explicit API/filtering slice exists.

## Acceptance criteria for next DB slice

1. Trainer room tables are namespaced and do not collide with runtime catalog.
2. Owner fields use `auth.uid()` RLS.
3. Private trainer room rows are not public-readable.
4. Room teams can point to Team Lab teams without exposing hidden details.
5. No source truth or global learning writes are exposed to browser clients.
6. Tests confirm the migration includes owner-only RLS and no anon write policy for trainer private data.
7. Roadmap and guardrail docs state trainer rooms are private first.

## Final decision

The split is sound if we keep the order disciplined:

1. Keep proving sim truth.
2. Add private trainer rooms.
3. Add replay import governance.
4. Add personal coaching memory.
5. Add trusted global aggregate learning.
6. Add bot practice.

Do not reverse this order. Global learning and bot play are powerful only after source truth, evidence truth, and trainer privacy are enforced.
