# Public Release Alignment - 2026-05-17

This is the no-drift coordination plan for the next release pass.

Related architecture audit:

- [TEAM_PROFILE_PERSISTENCE_AUDIT_2026-05-17.md](/Users/kevinmedeiros/Pokemon-Champions-Sim-Planner-yours/docs/release/TEAM_PROFILE_PERSISTENCE_AUDIT_2026-05-17.md)
- [FREE_PREMIUM_PRIVACY_POSITIONING.md](/Users/kevinmedeiros/Pokemon-Champions-Sim-Planner-yours/docs/release/FREE_PREMIUM_PRIVACY_POSITIONING.md)
- [QA_TRUST_CHECKLIST.md](/Users/kevinmedeiros/Pokemon-Champions-Sim-Planner-yours/docs/release/QA_TRUST_CHECKLIST.md)
- [INTERNAL_AUTH_TEST_ACCOUNTS_TEMPLATE.md](/Users/kevinmedeiros/Pokemon-Champions-Sim-Planner-yours/docs/release/INTERNAL_AUTH_TEST_ACCOUNTS_TEMPLATE.md)
- [TEAM_HANDOFF_AND_NEXT_ACTIONS_2026-05-17.md](/Users/kevinmedeiros/Pokemon-Champions-Sim-Planner-yours/docs/release/TEAM_HANDOFF_AND_NEXT_ACTIONS_2026-05-17.md)

Current branch baseline:

- Your fork: `TheYfactora12/Pokemon-Champions-Sim-Planner`, branch `rollback-main`
- Upstream/aligned repo: `alfredocox/Pokemon-Champions-Sim-Planner`
- Live preview: `https://htmlpreview.github.io/?https://raw.githubusercontent.com/TheYfactora12/Pokemon-Champions-Sim-Planner/rollback-main/poke-sim/pokemon-champion-2026.html`

## Release principle

The product should feel like a premium sports coaching room, not a parser demo.

Every public-facing coaching claim must be:

- evidence-bound
- confidence-labeled
- trainer-readable
- conservative about unsupported formats
- clear about free local data vs paid saved memory
- free from internal team IDs and raw machine language

## Temporary internal account access

Until polished signup exists, the team should use temporary internal auth accounts for separation testing.

Minimum set:

- anonymous/local free path
- internal free account
- internal premium account
- QA/admin account
- cross-device persistence account

Purpose:

- prove free vs premium memory separation
- prove saved team profiles are tied to authenticated identity
- prove no cross-account leakage
- prove profile-backed Sources state is real

Constraint:

- do not ship hardcoded premium bypasses as the long-term model
- use these accounts only as MVP auth and QA scaffolding until the real subscriber flow is ready

## Immediate status

### Sources + Data Provenance cleanup

Status: shipped on `rollback-main`.

Goal: make the `Sources` area and Strategy `Data Sources` area explain exactly what data the app is using.

The user should understand:

- what came from simulation
- what came from pasted/uploaded replay logs
- what came from Champion compliance checks
- what is local-only in the free version
- what becomes durable in premium/profile mode
- when data is stale, scoped, missing, or format-limited

### Replay-to-Sim Comparison foundation

Status: shipped on `rollback-main`.

The app now has a safer evidence foundation for Battle Sensei and Battle Mirror:

- replay comparison uses scoped Strategy V2 sim evidence first
- stale/global sim results from another team or format should not become matched evidence
- Sources shows replay-to-sim comparison provenance
- one replay or one team tweak must not rewrite sim models or Battle IQ

This is a foundation, not the final team-improvement loop.

### Team Snapshot + Replay Match MVP

Status: shipped on `rollback-main`.

The app now:

- stores a session-only team snapshot after sim runs
- fingerprints replay teams from parsed evidence
- classifies replay/team alignment
- blocks fake sim-vs-replay deltas on weak or mismatched evidence

### Coach Recommends UX MVP

Status: shipped on `rollback-main`.

The app now:

- shows one best next action across Simulator, Battle Sensei, Strategy, and Sources
- distinguishes no-sim, no-replay, wrong-team, stale-team, and matched-comparison states
- avoids pushing the user through multiple conflicting workflows

### Team Profile Persistence + Replay History MVP

Status: shipped in app wiring on `rollback-main`.

The app now includes:

- team profile persistence contract
- team version persistence contract
- replay artifact persistence contract
- replay-team match persistence contract
- replay-vs-sim comparison persistence contract
- coaching report persistence contract

Remaining rollout work:

- live Supabase migration execution
- authenticated internal account provisioning
- cross-account isolation QA
- cross-device restore QA

## Current next big item

### Live auth rollout + account isolation QA

Build this before marketing durable premium memory as fully live.

Goal: prove that authenticated saved memory is real, private, and correctly scoped.

Required live steps:

1. Run `poke-sim/db/migrations/2026_05_17_auth_profile_memory.sql`
2. Provision internal free and premium auth accounts
3. Set trusted `app_metadata.subscription_tier`
4. Verify RLS on private profile-memory tables
5. Verify guest/free/premium separation
6. Verify no cross-account replay/team leakage
7. Verify cross-device restore on the premium test account

Security guardrails:

- no premium from `user_metadata`
- no hardcoded premium bypass
- no raw replay-log autosave by default
- no private profile-memory access for `anon`

## Guided UX layer

### Coach Recommends UX MVP

Add this after Team Snapshot + Replay Match, or as a small parallel UI layer if it stays read-only.

Goal: Apple-style ease of use. The product should show one best next step instead of forcing users to understand every tab.

Principles:

- hide complexity until it matters
- show one recommended next action
- use confidence badges, not raw system jargon
- keep free flow session-local and fast
- make premium feel like continuity, not locked basic help
- advanced details remain expandable

Recommended contract:

```js
Recommendation {
  id,
  priority,
  title,
  message,
  actionLabel,
  actionTarget,
  confidence,
  reason,
  unlockContext
}
```

Recommended states:

| State | Recommended action |
|---|---|
| No sim run | Run a sim first |
| Sim run, no replay | Upload a replay to compare sim plan vs real execution |
| Replay uploaded, no team match | Confirm team or run a sim with this team |
| Strong team match | Compare sim vs replay |
| Team edited after replay | Rerun same matchup before claiming improvement |
| Subscriber profile available | Save this under Team Builder profile |
| Community sharing available | Share anonymized aggregate data only after opt-in |

Coach Recommends should appear as one compact card near the top of Simulator, Battle Sensei, Strategy, and Sources. It should not be a blocking modal.

## Team Tweak Delta roadmap item

Build only after Team Snapshot + Replay Match.

Goal: compare replay team vs edited/current team against the same opponent and format.

The app may then say:

- `Your edited version improved this matchup by +X simulated win rate.`
- `No meaningful improvement detected.`
- `This tweak lowered strength into this matchup.`

Required evidence:

- replay team fingerprint
- edited team fingerprint
- same opponent or strong opponent match
- same format/ruleset
- baseline sim summary
- after-edit sim summary
- confidence and sample size

Do not show rating/strength deltas from one replay alone.

## Tab scope for QA

Tabs in the shipped bundle:

- `Simulator`
- `Teams`
- `Editor`
- `Battle Sensei / replay-coach`
- `Replay Log / replays`
- `Pilot Guide / pilot`
- `Strategy`
- `Sources`

`Sources` is the next cleanup target because it is the least protected by dedicated tests and directly affects trust.

## Owner matrix

| Lane | Owner | Responsibility |
|---|---|---|
| Product/coaching standard | TheYfactora12 | Approves final user-facing coaching voice and paid/free boundary. |
| Architecture/backend/security | alfredocox | Runs live Supabase migration, provisions internal accounts, verifies RLS and account isolation. |
| Manual QA/accessibility | Jdoutt38 | Runs browser/device QA against both repos and records pass/fail evidence for guest/free/premium/auth flows. |
| Implementation/tests/docs | Codex | Adds scoped changes, tests, docs, bundle rebuilds, and issue alignment. |

## No-drift rules

1. Every release-blocking task must exist in both repos or be linked from both repos.
2. Manual QA instructions must be mirrored in both repos.
3. Runtime changes must land with focused tests and a rebuilt bundle.
4. Public coaching language must not overclaim from one replay or unsupported formats.
5. Generic Gen 9 logs must not train Champion-specific confidence.
6. Battle IQ remains provisional until norm groups and profile history exist.
7. Raw logs must not be silently stored.
8. Strategy, Battle Sensei, Battle IQ, and Battle Mirror must share the same evidence vocabulary.
9. No internal team IDs should appear in trainer-facing UI.
10. No loss labels should appear as win paths.
11. Replay-to-sim comparison must not reuse stale sim results from another team or format.
12. Team-tweak improvement claims require matched replay/current team fingerprints and same-opponent sim baselines.
13. Saved subscriber replay/team stats must be scoped to stable team profile/version IDs, not mutable team names.
14. Community data sharing must be opt-in, anonymized by default, and aggregate-first.
15. Premium/account tier must come from trusted `app_metadata`, not client-controlled `user_metadata`.

## Current automated QA evidence

Last full focused audit passed:

- tab/a11y/mobile navigation tests
- public UI XSS tests
- local storage integration tests
- replay log cap tests
- Strategy tab V2 render tests
- simulator smoke tests
- Battle Sensei parser, timeline, and learning tests
- Battle IQ replay fixture tests
- Champion compliance tests
- analytics payload/Pilot Guide tests
- simulator matchup catalog tests
- coaching policy regression tests
- bundle rebuild

## Release blockers before public launch

- Sources tab has dedicated content and tests. `DONE`
- Replay-to-Sim Comparison uses scoped Strategy V2 evidence. `DONE`
- Josh completes manual QA in both repos.
- Team Snapshot + Replay Match MVP is implemented or explicitly deferred behind conservative copy.
- Coach Recommends UX MVP is implemented or explicitly deferred with a simple next-step copy fallback.
- Second verified Champion replay artifact is added and tested.
- Public docs/usage page is current.
- Privacy copy is clear: free/local review does not silently store raw logs.
- Deployment/cache hardening is reviewed.
- A11y/manual browser pass is recorded.
- Old milestones are reconciled into launch-blocking vs post-release buckets.

## Paid-launch blockers

Do not sell durable saved coaching until these are complete:

- Supabase Auth/login
- entitlement verification
- payment checkout
- RLS/security audit for coaching data
- replay persistence schema and privacy controls
- Team Builder profile schema
- team version schema
- derived replay summary schema
- raw-log opt-in controls
- Battle IQ profile schema
- norm-group strategy
- multi-log trend dashboard
- calibration scenario queue
- opt-in anonymized Community Data path

## Next implementation checklist

For Team Snapshot + Replay Match MVP:

1. Add session-only `TeamRunSnapshot` creation after sim runs.
2. Add `TeamFingerprint` builder for catalog/custom teams.
3. Add replay-side fingerprint builder from parsed Showdown logs.
4. Add similarity scorer and match bands.
5. Render `Same team`, `Similar team`, `Possible match`, `Different team`, or `Unknown` in Battle Sensei.
6. Block team-delta claims unless match and baseline requirements are met.
7. Add premium teaser copy for saved Team Builder profiles.
8. Add focused tests for exact, strong, possible, weak, wrong-format, and stale-session cases.
9. Rebuild bundle.
10. Commit, push, and update both repo issues.

For Coach Recommends UX MVP:

1. Add recommendation state helper.
2. Render one compact next-step card on key tabs.
3. Keep copy action-oriented and confidence-labeled.
4. Add tests for no-sim, sim/no-replay, replay/no-match, strong-match, edited-team, and premium-profile states.

## Issue map

Manual QA issues:

- Your repo: `https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/issues/105`
- Alfredo repo: `https://github.com/alfredocox/Pokemon-Champions-Sim-Planner/issues/216`

Release alignment trackers:

- Your repo: `https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/issues/106`
- Alfredo repo: `https://github.com/alfredocox/Pokemon-Champions-Sim-Planner/issues/217`

Team Snapshot + Replay Match MVP:

- Your repo: `https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/issues/108`
- Alfredo repo: `https://github.com/alfredocox/Pokemon-Champions-Sim-Planner/issues/218`
- Milestone: `Stage 3 - Showdown Replay Ingestion`

Coach Recommends UX MVP:

- Your repo: `https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/issues/107`
- Alfredo repo: `https://github.com/alfredocox/Pokemon-Champions-Sim-Planner/issues/219`
- Milestone: `Stage 4 - User Feedback Loop`
