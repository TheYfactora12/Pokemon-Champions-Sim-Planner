# v164 release handoff

Candidate: v2.2.164-mobile-selection. No production deployment or regulation
approval. Engine unchanged. Release date uses America/New_York.

## Bounded changes

- Input-independent narrow simulator layout; bounded bring slots and tables.
- Team headings and rosters refresh after catalog rebuilding and final gating.
- Three selection regressions failed before the fix and passed afterward.
- Canonical build, fallback labels and service-worker cache advanced together;
  bundle and artifact metadata regenerated with the canonical builder.
- Previous combined fast gate: 186 files passed, four manual/helper skips.
- Final v164 `npm test`: 186 fast files and 12 offline/mock DB files passed.
  Four manual/helper files and live administrative checks remain skipped, not
  verified. Local log: ignored artifacts/v164-project-gate-final.log.
  Final bundle SHA-256: c1bc7c9ba95eca62c80fb5ee5f328a2dd74d7157f654f50dd45438d74b1f9dde.
- Local browser confirms v164 after restarting the stopped preview server.
  Initial browser readback was stale v163 served from cache, not a passing check.

## Release reconciliation

Read-only merge-tree against origin/main at 40edcc4 found four conflicts:
news-feed-sync.yml, STATUS.md, docs/IMPROVEMENT_LOG.md and generated/release_artifact.json.
At inspection the committed candidate had 35 unique commits and main had 30.
No merge was applied to the worktree.

Reconciliation must preserve main's tested-news auto-publish boundary, current
feed and disposable DB workflow. Reconcile documentation chronologically; do
not delete unresolved evidence. Rebuild generated HTML and metadata from the
resolved source instead of choosing either generated side. Rerun offline gates
and hosted CI on that exact merge candidate before any deployment.

The September 9 release review still blocks wholesale candidate promotion.
Prefer a narrowly reviewed release of these UI fixes if the broader mechanics,
regulation and live-security gates cannot be closed. Do not merge PR #195 merely
to remove conflict warnings.

## Remaining work

1. Reconcile the branch/release scope and obtain hosted review/CI.
2. Diagnose practice-save eligibility separately from missing execution identity.
3. Fix replay event fidelity with paired visible/export evidence.
4. Validate database team provenance rather than inventing version fields.
5. Verify physical mobile devices and the exact deployed artifact.

No raw private replay/team data is included. News/regulation schedule and DB
readback details remain in RECURRING_DB_CHECK_2026-09-30.md. Improvement records:
IMP-0045 and IMP-0046. No new paid resources or recurring jobs.
