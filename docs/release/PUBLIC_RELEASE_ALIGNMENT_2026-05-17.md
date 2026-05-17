# Public Release Alignment - 2026-05-17

This is the no-drift coordination plan for the next release pass.

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

## Immediate task

### Sources + Data Provenance cleanup

Goal: make the `Sources` area and Strategy `Data Sources` area explain exactly what data the app is using.

The user should understand:

- what came from simulation
- what came from pasted/uploaded replay logs
- what came from Champion compliance checks
- what is local-only in the free version
- what becomes durable in premium/profile mode
- when data is stale, scoped, missing, or format-limited

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
| Architecture/backend/security | alfredocox | Reviews persistence, Supabase, auth/payment, RLS, and release hardening plans. |
| Manual QA/accessibility | Jdoutt38 | Runs browser/device QA against both repos and records pass/fail evidence. |
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

- Sources tab has dedicated content and tests.
- Josh completes manual QA in both repos.
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
- raw-log opt-in controls
- Battle IQ profile schema
- norm-group strategy
- multi-log trend dashboard
- calibration scenario queue

## Next implementation checklist

For Sources + Data Provenance cleanup:

1. Inspect current `Sources` tab rendering and data-source helpers.
2. Add a dedicated test for Sources tab content.
3. Render clear provenance cards for simulation, replay, compliance, local free memory, and premium saved memory.
4. Make stale/missing/format-limited states visible.
5. Keep the Strategy `Data Sources` panel aligned with the standalone Sources tab.
6. Rebuild bundle.
7. Run focused tests.
8. Commit, push, and update both repo issues.

## Issue map

Manual QA issues:

- Your repo: `https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/issues/105`
- Alfredo repo: `https://github.com/alfredocox/Pokemon-Champions-Sim-Planner/issues/216`

New alignment issue should be mirrored in both repos with this document as the canonical plan.
