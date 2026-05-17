# QA Trust Checklist

This checklist is for manual QA on trust, privacy, auth separation, and coaching clarity.

## A. Guest mode

Pass/fail:

- Guest mode loads without account requirement.
- Guest mode remains local/session-only.
- Guest mode does not imply saved profile memory.
- Guest mode can run a sim.
- Guest mode can analyze a replay locally.
- Guest mode shows clear Sources/Data Provenance.
- Guest mode does not silently save raw replay logs.

Evidence to capture:

- browser
- device
- screenshot of guest state
- screenshot of Sources tab
- screenshot of replay privacy copy
- pass/fail notes

## B. Free signed-in account

Pass/fail:

- Free account shows identity correctly.
- Free account does not claim premium persistence.
- Free account does not unlock saved profile-backed memory.
- Free account does not imply cross-device restore.
- Free account still gets the basic local coaching flow.
- Free account clearly shows the upgrade boundary.

Evidence to capture:

- signed-in account state
- subscription/persistence state shown in UI
- Sources tab free memory card
- any confusing copy

## C. Premium signed-in account

Pass/fail:

- Premium account enables profile-backed persistence state.
- Premium state comes from trusted `app_metadata.subscription_tier`.
- Premium does not come from user-editable `user_metadata`.
- Premium copy does not promise unshipped roadmap depth as if already live.
- Saved profile state is visible where expected.
- Cross-device restore behaves correctly if available.
- Premium copy explains continuity, not fake superiority.

Evidence to capture:

- account state
- premium state
- saved profile/team restore
- Sources premium memory card
- cross-device screenshot if possible

## D. Account switching

Pass/fail:

- Sign out from Account A.
- Sign into Account B.
- Account B does not see Account A’s teams.
- Account B does not see Account A’s replay summaries.
- Account B does not inherit Account A’s premium state unless configured.
- Switching back restores only the correct account’s state.

Evidence to capture:

- before/after screenshots
- account labels
- team list state
- replay/history state
- any leakage or stale UI state

## E. Replay privacy

Pass/fail:

- Raw replay logs are not autosaved by default.
- Replay analysis updates provenance.
- Parsed/derived replay information is distinguished from raw log storage.
- User can understand what was used.
- User can understand what was not saved.
- Generic Gen 9 logs do not receive Champion-specific overclaims.

Evidence to capture:

- replay input
- replay analysis result
- Sources replay provenance card
- privacy copy
- confidence label

## F. Sim vs replay matching

Pass/fail:

- Upload replay before running sim: app says run sim first / needs sim data.
- Run sim with Team A, upload Team A replay: app shows same/similar team if evidence matches.
- Run sim with Team A, upload Team B replay: app blocks comparison.
- Change team after replay: app requires rerun before improvement claim.
- Change format after replay: app blocks stale comparison.
- One replay does not rewrite Battle IQ or sim model.

Evidence to capture:

- active team
- replay team
- match classification
- sim comparison status
- recommended next action
- confidence label

## G. Mobile and UI polish

Pass/fail:

- Sources tab opens on mobile.
- Mobile picker/tab navigation works.
- Coach Recommends card does not clutter the screen.
- Strategy tab still renders.
- Battle Sensei remains readable.
- No internal team IDs show in trainer-facing UI.
- No loss labels appear as win paths.

Evidence to capture:

- mobile screenshots
- tab navigation recording if possible
- any visual clutter notes

## Internal account matrix

Fill this out using:

- [INTERNAL_AUTH_TEST_ACCOUNTS_TEMPLATE.md](/Users/kevinmedeiros/Pokemon-Champions-Sim-Planner-yours/docs/release/INTERNAL_AUTH_TEST_ACCOUNTS_TEMPLATE.md)

Minimum checks per account:

- can sign in
- correct tier shown
- correct tier source verified
- tier verified against trusted `app_metadata`, not `user_metadata`
- no premium from `user_metadata`
- profile memory only where expected
- replay logs not silently saved
- account switching clean
- cross-device restore tested where applicable
