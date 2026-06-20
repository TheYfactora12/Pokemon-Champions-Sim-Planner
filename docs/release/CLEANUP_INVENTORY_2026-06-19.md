# Cleanup Inventory - 2026-06-19

Purpose: separate clearly safe cleanup from items that need a content merge decision, historical-review decision, or branch-pruning decision.

This inventory does not delete anything. It records what can likely move next and why.

## Confirmed Safe Documentation Cleanup Already Done

- Historical status notes added to older audit/research docs so they are less likely to be mistaken for current branch truth.
- Stale test-count and branch-state language updated in current-facing docs.
- `poke-sim/docs/SPECS_INDEX.md` no longer instructs deletion of `poke-sim/MASTER_PROMPT.md`, because that file is not identical to the root `MASTER_PROMPT.md`.

## Safe To Delete Right Now

None confirmed yet.

Reason:
- Several candidate files are historical drafts or superseded plans, but they still provide design lineage or are still referenced by other Markdown files.
- Local branch deletion is reversible only if the commit remains reachable elsewhere; that needs an explicit call from the user.

## Likely Archive Candidates

These look historical or superseded, but should be archived or moved intentionally rather than deleted blindly.

- `ROADMAP_DRAFT.md`
  - Historical April 2026 roadmap draft.
  - Active planning has moved to `ROADMAP.md` and `docs/release/SIMULATION_FIRST_REALIGNMENT_2026-06-06.md`.

- `COACHING_LAYER_SPEC.md`
  - Early coaching-layer draft.
  - Current product direction pauses coaching expansion behind the simulation-truth gate.

- `POKE_SIM_DB_INTEGRATION_PLAN_v2.md`
  - Still useful as DB integration history.
  - Current operational DB guidance is better represented by `poke-sim/db/README_DB.md` plus the Showdown DB handoff docs.

- `ENGINE_AUDIT_REPORT.md`
- `CHAMPIONS_MECHANICS_SPEC.md`
- `CHAMPIONS_MECHANICS_VERIFICATION.md`
- `CHAMPIONS_MEGA_AUDIT_REPORT.md`
  - Historical research and audit artifacts.
  - Useful for provenance and issue backtracking, but no longer current branch-state truth on their own.

- `docs/release/SHOWDOWN_DB_WIRING_STRESS_TEST_2026-06-06.md`
  - Historical snapshot superseded by `docs/release/SHOWDOWN_DB_RUNTIME_HANDOFF_2026-06-10.md`.
  - Still worth keeping as a dated evidence artifact.

## Needs Merge Or Consolidation Decision

- `MASTER_PROMPT.md`
- `poke-sim/MASTER_PROMPT.md`
  - These are not duplicates.
  - `cmp -s` shows they differ.
  - `git diff --no-index --stat` reports substantial content differences.
  - Recommendation: compare responsibilities and either consolidate into one canonical prompt plus one short repo-local companion, or keep both with a clearer boundary.

- `ROADMAP.md`
- `ROADMAP_DRAFT.md`
  - If the draft remains, it should probably move into an `archive/` or `historical/` docs area.

- `POKE_SIM_DB_INTEGRATION_TDD_PLAN.md`
- `POKE_SIM_DB_INTEGRATION_PLAN_v2.md`
  - The TDD plan explicitly calls the v2 file its companion.
  - If v2 is archived, the TDD plan should either be updated to point to the new canonical DB doc or archived with it.

## Draft Files That Need Human Intent Before Deletion

These appear to be implementation-diff drafts. They are not clearly current, but they may still be useful as design history.

- `T9j2_ENGINE_DIFF_DRAFT.md`
- `T9j3_ENGINE_DIFF_DRAFT.md`
- `T9j3b_DIFF_DRAFT.md`
- `T9j4_DIFF_DRAFT.md`
- `T9j6_DIFF_DRAFT.md`
- `T9j7_DIFF_DRAFT.md`
- `T9j8_DIFF_DRAFT.md`
- `poke-sim/PHASE5_TURN_LOG_SPEC_DRAFT.md`

Why they are not auto-deletion candidates:
- Some are still mentioned indirectly by surrounding specs or historical planning.
- They encode old implementation reasoning that may still matter when auditing why a subsystem landed the way it did.

Recommendation:
- Either move them under a clearly named historical folder such as `docs/archive/engineering-drafts/`, or keep them in place with a one-line historical note at the top.

## Local Branch Cleanup Candidates

These local branches track deleted upstream branches (`[origin/...: gone]`):

- `add-supabase-root-cert`
- `fix-db-url-p-secret`
- `issue-33-structured-logger`
- `issue-43-data-placeholder-guard`
- `issue-44-audit-mirror-hard-fail`
- `issue-47-team-stat-detail-panel`
- `issue-55-phase4d-threat-response`
- `issue-56-phase4e-policy-audit`
- `issue-57-phase5-turn-log`
- `issue-58-phase6-coaching-voice`
- `issue-db-admin-migration-workflow`
- `prefer-db-url-t-secret`

These are inventory-only candidates. Do not delete without user approval.

Reasons:
- A gone upstream branch does not prove the local branch is no longer needed.
- Some local branches may still hold useful historical checkpoints or unmerged work.

## Branches Not Good Prune Targets Yet

- `feature/showdown-db-writer`
  - Active review branch.

- `main`
  - Local baseline branch.

- `rollback-main`
  - Still tied to `origin/rollback-main`; not a gone-remote cleanup target.

- `issue-46-canonical-role-classifier`
- `issue-48-random-lead-highlights`
- `codex/public-release-hardening`
  - Remote tracking branches still exist.

## Suggested Next Cleanup Order

1. Decide whether to create a dedicated historical-docs folder.
2. Move the obvious historical drafts there instead of deleting them.
3. Compare the two `MASTER_PROMPT.md` files and pick a canonical split.
4. Review each gone-upstream local branch before pruning any of them.
5. Only then consider actual deletions.

## Minimum-Risk Execution Plan

If the next pass should stay conservative:

1. Add historical notes to the remaining draft docs.
2. Create `docs/archive/` and move only clearly historical drafts there.
3. Leave branches untouched.

If the next pass should be more aggressive:

1. Review the content diffs for both prompt files.
2. Decide which historical drafts can be removed instead of archived.
3. Approve a list of local branches to delete.
