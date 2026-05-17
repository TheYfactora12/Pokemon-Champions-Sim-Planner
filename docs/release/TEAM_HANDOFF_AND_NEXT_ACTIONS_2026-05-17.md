# Team Handoff and Next Actions - 2026-05-17

This is the practical handoff doc for the next pass.

Use this file when the team comes back and needs to know:

- what is already done
- what is blocked
- who owns what
- what can be done without founder input

## Current shipped baseline

Branch:

- `rollback-main`

Recent commits already on branch:

- `36d02bf` `add team profile replay history persistence`
- `84e012f` `add auth access and profile rls`
- `263ec52` `harden auth tier trust`

## What is already done

### Product trust layer

- Sources/Data Provenance shipped
- Replay-to-Sim comparison guardrails shipped
- Team Snapshot + Replay Match shipped
- Coach Recommends shipped

### Persistence/auth/security

- team profile persistence wiring shipped
- replay history persistence wiring shipped
- minimal sign in / sign out UI shipped
- app-side auth state shipped
- premium hardening shipped
- private profile-memory migration written
- RLS contract written

### Release materials

- trust/positioning doc written
- QA trust checklist written
- internal auth account template written
- persistence audit written

## What is blocked on live admin access

Owner:

- `alfredocox`

Blocked items:

1. run `poke-sim/db/migrations/2026_05_17_auth_profile_memory.sql`
2. provision internal auth accounts
3. set trusted `app_metadata.subscription_tier`
4. verify live RLS behavior
5. confirm cross-account isolation

These cannot be completed from the anon/frontend environment.

## What is blocked on QA evidence

Owner:

- `Jdoutt38`

Required evidence:

1. guest mode screenshots + notes
2. free signed-in account screenshots + notes
3. premium signed-in account screenshots + notes
4. account switching screenshots + notes
5. cross-device restore screenshots + notes if available
6. Sources/Battle Sensei/Strategy mobile screenshots + notes

Use:

- [QA_TRUST_CHECKLIST.md](/Users/kevinmedeiros/Pokemon-Champions-Sim-Planner-yours/docs/release/QA_TRUST_CHECKLIST.md)

## What Kevin can do without blocking anyone

1. fill in real aliases in:
- [INTERNAL_AUTH_TEST_ACCOUNTS_TEMPLATE.md](/Users/kevinmedeiros/Pokemon-Champions-Sim-Planner-yours/docs/release/INTERNAL_AUTH_TEST_ACCOUNTS_TEMPLATE.md)

2. run a manual copy/polish pass on:
- Sources
- Battle Sensei
- Strategy
- auth banner

3. draft homepage / What’s New / Why Subscribe copy from:
- [FREE_PREMIUM_PRIVACY_POSITIONING.md](/Users/kevinmedeiros/Pokemon-Champions-Sim-Planner-yours/docs/release/FREE_PREMIUM_PRIVACY_POSITIONING.md)

4. mark any confusing product language directly in issues with screenshots

## Easy follow-up tasks the team can take without founder help

### Alfredo

- execute the migration
- provision the accounts
- validate app metadata tiers
- post exact pass/fail and any SQL/RLS fixes needed

### Josh

- run the auth and trust checklist
- attach screenshots
- note any stale UI state, overclaims, or leakage

### Codex

- fold QA findings into copy/UI cleanup
- add homepage/What’s New page once trust copy is approved
- clean small wording/empty-state issues
- keep tests and docs aligned

## Release truth rules

Do not drift from these:

- no premium from `user_metadata`
- no hardcoded premium bypass
- no silent raw replay-log autosave
- no roadmap feature sold as already shipped
- no cross-account replay/team leakage
- no team delta claim without same-team, same-format, same-opponent baseline

## Immediate next priority order

1. live auth rollout
2. account isolation QA
3. copy polish and homepage identity work
4. profile-backed saved history surfaces
5. later: team tweak delta and richer premium pages
