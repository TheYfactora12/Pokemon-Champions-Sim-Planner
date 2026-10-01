# Live operational check - September 30, 2026

Scope: production GitHub Pages smoke test, not mechanics certification.

## Passed

- Live HTML and deployment manifest returned HTTP 200.
- Latest inspected Pages run 36784589135 succeeded for commit 7b90610a769debd8f4fa361bbf16c895be6183ed.
- Browser header and manifest identify v2.2.142-pp-replay-proof. Newer candidate work is not established as deployed.
- Home rendered visually; Home, Teams, Simulator and Replay Log navigation responded.
- News displayed a September 30, 22:14 UTC check timestamp. This check did not independently validate every article.
- One Doubles Practice Bo1 completed: TR Counter Squad versus Mega Altaria, one game, loss in six turns. Results and a retained replay appeared.

## Open findings reproduced

- Console warned: `[persistence] saveAnalysis quarantined: missing or conflicting execution provenance`. The fresh result was not present in Saved Analyses. Do not remove this protective quarantine; repair the producing evidence contract.
- DB connection tooltip reported zero accepted teams and 36 blocked stale/illegal rows. Connectivity is not evidence of usable current data or verified permissions.
- Turn 3 displayed the same Whimsicott Moonblast one-HP hit twice.
- Turn 4 displayed one Protect response alongside additional attacks with no displayed resolution. Needs raw-export comparison to identify omitted events.
- Consumed Sitrus Berry and Focus Sash remained displayed in subsequent state cards. Determine whether these labels are incorrectly falling back to initial loadout before claiming an engine item-consumption defect.
- Teams displayed LEGAL alongside Unknown ruleset and historical labels; current competitive legality is not established.

## Limits and next work

### Mobile follow-up

Local patch follow-up: input-independent single-column layout and bounded bring
tracks now measure 385/390 and 355/360 document/viewport pixels in portrait,
839/844 in landscape, and 1275/1280 on desktop. A CSS contract regression passes.
These are local candidate geometry checks, not live or physical-device proof.
Candidate browser also shows a player heading/selected-team mismatch and an
opponent roster/selection mismatch on initial load. Preserve this as a separate
identity investigation before running further candidate battle batches.

Fast suite: 185 files ran, one failure, four manual/helper skips. The sole
failure was t168_mobile_strategy_audit_tests.js requiring the removed 520px
mobile table minimum. Updated its contract to retain internal horizontal
scrolling while bounding the table to its container; all four focused assertions
then passed. The new mobile CSS contract also passes. The entire suite has not
been rerun after that test correction; no complete final gate claim is made.
PR #195 remains open and CONFLICTING at fb0f09c. This patch is not pushed or
deployed and retains the old candidate identity pending release preparation.

- Browser viewport testing only, not physical iOS/Android verification.
- At 390x844, Home rendered without document horizontal overflow; Start Team Test opened Simulator.
- FAIL: Simulator document scrollWidth was 567 pixels at a 390-pixel viewport. Screenshot showed compressed side-by-side roster/control columns and off-screen content.
- Mobile Main sections select successfully navigated to Replay Log.
- At 360x800, Replay Log rendered with document scrollWidth 355 pixels (no horizontal document overflow).
- No new mobile battle or export was run. The existing six-turn replay appeared in Replay Log. Restored default viewport after inspection.
- Mobile release sign-off remains blocked on simulator responsive layout, followed by real-device interaction/download testing.

This was a browser operational check, not a paired JSON replay audit. No fresh export was captured or independently rerun. No database writes, migrations, permission changes, regulation approvals or production code releases were performed.

Prioritize execution-provenance persistence, replay event fidelity and consumed-item presentation, then reconcile the reviewed release with production. Keep M-C and universal accuracy claims blocked until their separate evidence gates pass.
