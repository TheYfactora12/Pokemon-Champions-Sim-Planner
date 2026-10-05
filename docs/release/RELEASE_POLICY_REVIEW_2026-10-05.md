# Release Policy Review

## Purpose

Ship the reviewed local experience to TheYfactora12 primary production promptly,
without using local success to bypass hosted checks. Alfredo follows only after
primary verification. This review does not authorize or record a deployment.

## Current Evidence

- Fetched origin/main: zero main-only commits, 66 candidate-only commits at
  f6ada80. Diff spans 218 files. Treat this as a coordinated catch-up release,
  not an isolated UI hotfix; preserve all existing work.
- v176 runtime proof is recorded in IMP-0064: 192 fast files and 12 offline DB
  files passed. Live DB remains unverified. Later policy edits do not change
  those runtime inputs and do not create fresh simulation proof.
- CI run 37371165862 for f6ada80 is queued. Its two initial jobs have no assigned
  runner and no steps. Pending-deployments API returns an empty list. This is
  not a confirmed test failure or environment-review wait. Cause unconfirmed.
- Primary production remains unaligned according to the preceding eleven-tab
  audit. No claim that the current candidate is deployed.

## Policy Scenario Review

These are tabletop rule checks, not executable application tests.

| Scenario | Required decision |
|---|---|
| Docs only; runtime identical | Check consistency; reuse named runtime evidence; final required CI still applies. |
| UI change using existing mechanics | Focused regression and browser check, rebuilt/versioned artifact; no new mechanics-accuracy claim. |
| Engine or generated legality change | Relevant oracle/source review plus affected integration checks; no automatic promotion. |
| Local tests pass; hosted jobs queued | Pending, not passed; diagnose runner/queue separately; do not bypass. |
| Unrelated edit arrives during validation | Defer it from frozen release; release-blocking edits invalidate affected evidence. |
| Disconnected build with backend findings | Reviewed scope may exclude cloud-save gates; findings remain open and backend is not repaired. |
| Deployment succeeds; assets or user flow fail | Release verification fails; reopen/retain ticket and use reviewed rollback. |
| Primary passes; backup untested | Primary verified only; no failover-ready claim. |

All eight decisions are explicitly covered by AGENTS.md. No gates or workflow
permissions were removed in this policy update.

## Remaining Gates And Ownership

| Gate | State | Owner / next action |
|---|---|---|
| Local v176 project suite | Passed, bounded | Implementer: retain IMP-0064; rerun affected tests if inputs change. |
| Required hosted checks | Pending | Release manager: inspect queued runner cause; repository owner if account-level action is needed. |
| Final coordinated release review | Pending | Independent release reviewer: include changes since earlier scope review. |
| Pages identity and affected flows | Pending | Release manager: verify after reviewed deployment; include animation, news, navigation and saves. |
| Connected DB release | Blocked / outside interim artifact | Security owner: resolve before reconnection; do not close existing findings. |
| Alfredo failover | Pending | Release manager: sync and verify only after primary succeeds. |

Track release progress in TheYfactora12/Pokemon-Champions-Sim-Planner#103 and
Strategy attribution in #209. Keep candidate frozen after this policy record
unless a release-blocking repair is required. Do not create repeated status-only
commits while waiting for unchanged hosted checks.

## References

- [GitHub deployment controls](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments)
- [GitHub deployment environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)
- LOCAL_SAVE_RELEASE_SCOPE_2026-10-05.md
- LOCAL_LIVE_COMPARISON_2026-10-05.md
