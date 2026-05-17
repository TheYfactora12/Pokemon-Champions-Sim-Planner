# Free, Premium, Privacy, and Trust Positioning

## Homepage identity

Primary identity:

`Built for players who want to become champions.`

Supporting identity:

`Improved by the people who want to get better.`

`Ever evolving, just like the meta.`

Expanded trust version:

`This product is built for players who want to become champions. We want to give competitive Pokemon players a tool they can trust, and we want to keep improving it because of the fans, testers, and competitors who push us to be better.`

Voice rules:

- calm, not hype-heavy
- serious about improvement
- respectful to beginners and elite players
- honest about confidence and evidence
- always framed around helping the player make a better next decision

## Product positioning

Pokemon Champions Sim Planner is not just a simulator.

It is a coaching product built to help players understand:

- what their team is good at
- where their matchup plan breaks
- whether their replay matches the simulated plan
- whether a loss came from team construction, execution, matchup knowledge, or stale evidence
- what to do next

The intended loop is:

`Simulate -> Battle -> Review Replay -> Compare -> Improve -> Save Progress`

That loop only works if the user trusts what the app is using.

So the release standard is not “add more flashy features.”
The release standard is:

- clear data sources
- no stale comparison claims
- no raw replay-log autosave by default
- no fake team-improvement claims
- no premium status from unsafe metadata
- no cross-account leakage
- no Champion-specific coaching overclaim from generic Gen 9 logs

The app should feel like a coach, but underneath it must behave like an evidence system.

## Why free exists

### Short version

Free exists so players can test their team, learn from one session, and trust the product before creating an account or paying.

### Product copy

Free mode is built for fast, local team testing.

You can run simulations, review session results, test replay logic, and get guided next steps without needing an account.

Free mode is intentionally useful.
It is not a fake demo.

In free mode, the app should help you:

- run a matchup simulation
- review basic strategy output
- paste or upload a replay for local review
- see whether the replay appears to match your current team
- understand whether the app has enough evidence to compare replay vs simulation
- get a next recommended step from Coach Recommends
- see Sources/Data Provenance so you know what the app is using

### Boundary

Free mode is session-local.

The app may use current-session information to help while the user is active, but it should not imply:

- durable profile memory
- saved team history
- cross-device restore
- long-term Battle IQ tracking

### Why this matters

Free mode builds trust.

A competitive player should be able to try the app, run a team, paste a replay, and immediately understand whether the tool is serious.

## Why premium exists

### Short version

Premium exists for continuity, profile memory, team history, cross-device restore, and long-term improvement tracking.

Important boundary:

Cross-device restore and deeper long-term premium memory should only be marketed as live after authenticated account provisioning and QA evidence confirm them.

### Product copy

Premium is for players who want the app to remember their team-building journey.

Free mode helps with one session.
Premium helps across sessions.

Premium should unlock the durable layer:

- live or near-live subscriber memory:
  - saved Team Builder profiles
  - team version history
  - profile-backed persistence
  - replay summary history
  - trusted premium state from secure account metadata
- roadmap subscriber depth:
  - cross-device restore
  - long-term Battle IQ trends
  - before/after team tweak comparison
  - future tournament prep workflows
  - future opt-in anonymized community learning

Premium should not feel like basic coaching is being held hostage.

It should feel like:

“Now the app can remember my work, compare my progress, and help me improve over time.”

### Premium should pay for

Premium should pay for:

- persistence
- memory
- history
- trend analysis
- team-version tracking
- deeper saved coaching reports
- cross-device continuity
- profile-backed workspace
- future community and tournament prep features

### Messaging rule

Do not sell roadmap depth as if it is already shipped.

Launch copy should separate:

- `live now`
- `in rollout`
- `planned`

### Premium should not paywall

Do not hide the basic trust layer.

Free users should still get:

- basic simulation
- basic replay intake
- basic local review
- basic data-source visibility
- privacy transparency
- clear confidence labels
- no-overclaim warnings

## Privacy and data boundary copy

### User-facing privacy copy

Your replay data should be clear, controlled, and explainable.

When you paste or upload a replay, the app uses it to analyze the battle and compare it against your current session where possible.

In free mode, replay review is local/session-based. The app should not claim that raw replay logs are saved by default.

When profile-backed premium memory is enabled, the app may save derived summaries, team profiles, team-version history, and coaching state tied to your account.

The app should clearly separate:

- raw replay logs
- parsed replay summaries
- simulated matchup results
- Champion compliance findings
- team profile memory
- premium saved history
- anonymized community data

### Privacy rules

The product should follow these rules:

- No silent raw replay-log autosave.
- No cross-account replay or team leakage.
- No premium access based on user-controlled metadata.
- Premium/account tier must come from trusted server-controlled `app_metadata`.
- No stale simulation evidence reused after team or format changes.
- No team-improvement claim unless same team, same format, same opponent, and sim baseline exist.
- No generic Gen 9 replay should be treated as Champion-confirmed data.
- No community sharing unless anonymized, aggregate-first, and opt-in.

## What’s new draft

### What’s New: Replay, Sources, and Coaching Trust Layer

We added a new foundation for trustworthy replay and simulation coaching.

This update improves how the app explains where its recommendations come from and when it does or does not have enough evidence to make a strong claim.

### New: Sources / Data Provenance

The app now includes clearer Sources/Data Provenance visibility.

This helps players understand what the app is using:

- simulation results
- pasted or uploaded replay data
- Champion compliance checks
- free local/session memory
- premium saved profile memory
- replay-to-sim comparison status
- team snapshot and replay team matching

The goal is simple:

You should know what the app knows, what it does not know, and when a recommendation is only provisional.

### New: Replay-to-Sim Comparison Guardrails

Replay comparison is now more conservative.

The app should only compare a replay against simulation evidence when the active team, format, opponent, and scoped sim results line up.

That means:

- no stale global sim borrowing
- no old team evidence reused after edits
- no fake improvement claims
- no “your team got better” message without a proper baseline

### New: Team Snapshot + Replay Match

The app now creates a session-only team snapshot after a sim run.

When you upload a replay, the app builds a replay-side team fingerprint and classifies the match as:

- same team
- similar team
- possible match
- different team
- unknown

Only same team or similar team should unlock reliable sim-vs-replay comparison.

### New: Coach Recommends

The app now moves toward an Apple-style guided UX layer.

Instead of forcing users to understand every tab, the product should show one best next action.

Examples:

- Run a sim first
- Upload a replay next
- Compare sim vs replay
- Rerun after changing team or format
- Save this under a Team Builder profile when premium persistence is available

## Subscription positioning draft

### Free

For players testing a team right now.

Free gives the core loop:

- run a sim
- review the matchup
- paste a replay
- compare current-session evidence
- see what the app recommends next

### Premium

For players building over time.

Premium gives the app memory:

- live now:
  - saved team profiles
  - team-version history
  - replay summary history
  - profile-backed persistence state
- in rollout:
  - cross-device continuity
  - long-term mistake trends
  - team tweak comparison
  - profile-backed Battle IQ
- later roadmap:
  - future tournament prep workflows

### Paid boundary statement

Premium does not exist to hide basic help.

Premium exists because durable memory, account-backed history, and cross-device profile intelligence require backend persistence, security controls, and long-term storage.

That is the right paywall.

## Feedback and survey questions

Use these with testers:

- What was the first part of the app that confused you?
- Did Coach Recommends make it clear what to do next?
- Did the Sources tab help you trust the recommendation more?
- Was it clear what data came from simulation vs replay?
- Was it clear whether your replay matched your simulated team?
- Did any copy feel like it overclaimed?
- Would you use this after a ladder loss?
- Would you pay to save team history and Battle IQ trends?
- What would make Battle Sensei feel more like a real coach?
- What is the one result you wanted but did not get?

## Product polish pass checklist

Every screen should answer:

`What should the player do next?`

Manual polish pass:

- confusing wording
- duplicate concepts
- too much system jargon
- unclear free/premium boundary
- unclear privacy language
- missing next action
- too much clutter
- weak empty state
- internal team IDs
- missing confidence labels
- anything that feels like developer UI

Priority tabs:

- Sources
- Battle Sensei
- Strategy
- Simulator
- Teams / Team Catalog
- Auth banner / profile state
- Coach Recommends card

## One-page release narrative

We are building Pokemon Champions Sim Planner into a coaching-first simulator.

The next step is not just more simulations.
The next step is trust.

A player needs to know:

- what came from a sim
- what came from a replay
- what came from Champion compliance checks
- whether the replay actually matches the simulated team
- whether the app has enough evidence to compare real play against predicted strategy
- whether the recommendation is strong, provisional, or blocked

That is why this release focuses on:

- Sources / Data Provenance
- Replay-to-Sim Comparison
- Team Snapshot + Replay Match
- Coach Recommends

The product loop is becoming:

`Run a sim -> Upload a replay -> Compare the plan against the battle -> Get one next action -> Improve the team -> Save progress when profile memory is available`

Free mode is built for fast local testing.
Premium is built for saved team history, profile-backed memory, long-term Battle IQ trends, and cross-device continuity.
