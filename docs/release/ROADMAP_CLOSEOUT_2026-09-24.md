# Roadmap Closeout Order

Scope: documentation reconciliation from GitHub main and PR receipts, not a new
mechanics audit or live database verification. Follow AGENTS.md priority gates.

## Delivered Slice

News-only PR #206 is merged. Sync run 35949792285 published only its three
allowlisted artifacts at 9770ee279a899dde95f3741fac3fafd0e2948417. Pages run
35949952049 passed. Live feed SHA-256 matched GitHub:
e1e1f55ac6a6432c7e1b97e549492c017a6e4eef3d8543fb0232a0241164565a.
Live HTML included feed timestamp 2026-09-24T03:03:05.082Z. Browser attachment
failed, so visual sign-off remains open. Three YouTube sources were unavailable;
retained videos stay stale. Tournament reference coverage is not complete.

## Ordered Work

1. Database/security: identify the authorized isolated environment, reconcile
   migrations and permissions, test anonymous denial and two-user isolation.
   Historical readbacks and offline tests are not current live proof. No
   production migration is authorized by this checklist.
2. M-C integration: reconcile PR #195 against current main without bringing back
   the old news workflow. Validate roster/form mappings, runtime/import support,
   item/move/ability evidence and exact-package approval. Latest candidate receipt
   identifies two unresolved forms; recheck rather than assume they are fixed.
3. Mechanics: reproduce the remaining Toxic, Spite, suppressed-item and residual
   ordering findings against the exact candidate and pinned reference. Add
   regressions, fix confirmed defects, and retain Champions-specific exclusions.
4. Release proof: independent review, hosted CI, exact artifact deployment,
   visible/exported battle comparisons, cache/asset checks and rollback evidence.
5. Team optimization: only after relevant gates pass, build legal doubles teams,
   test varied opponents and held-out matchups, and document weaknesses. Do not
   equate repeated simulated wins with a perfect team or universal accuracy.

## Queue Cleanup Decisions

- PR #145: compare its two documentation changes with current evidence before
  merging or closing as superseded. Its old template is not completion proof.
- PR #192 / issue #191: retain optional LLM planning as deferred, not a launch gate.
- Source-review alerts: compare fingerprints and scope before consolidating;
  multiple alerts for one URL can represent distinct changes.
- Issue #190: update QA to the exact reviewed candidate and accessible artifacts
  before requesting sign-off. Do not impersonate Josh's approval.
- Empty Stage 2 and Stage 5 milestones: review for archival, not completed work.
- Premium, payment and PDF features: keep deferred until explicitly promoted.

No issues or milestones were closed in this reconciliation. News delivery is the
only newly completed slice. M-C readiness, full tournament coverage, database
security and competitive accuracy remain unverified at their respective gates.

## Authority

### September 24 Database Readback

Authorized metadata-only connector reads succeeded for the configured project.
The account inventory returned one active project; its branch inventory returned
only main. All 16 inspected public base tables have RLS enabled. The migration
ledger still contains four April entries; repository migration parity is not
established. Policy/grant readback confirms the previously documented shared
evidence hardening gate remains open. Advisor output alone is not full security
proof. No private records were read, test writes performed, migrations applied,
or permissions changed. Isolated staging and two-user tests remain unverified.
Detailed live policy output is retained in the task, not republished here.

Next: select or provision an explicitly authorized isolated test environment,
review the existing hardening migration there, and collect allow/deny plus
two-user evidence before requesting exact production-change approval.

STATUS.md records delivery state. The shared roadmap JSON generates ROADMAP.md
and the site's Roadmap data. Historical reports remain evidence, not fresh status.
This checklist orders work; it does not authorize bypassing any approval gate.
