# Dated validation and publication workflow

The canonical bounded assertion index owns executed/reviewed cases. Generated
current/history views are projections, not another manually edited checklist.
A pass applies only to its serialized inputs, expected fields, format, target scope,
source pin and runtime dependencies. A doubles pass never certifies singles, spread
rounding, ally damage or every target. Client/regulation fields remain null when
unknown. Inventory counts are not a denominator for a fully validated percentage.

## Mandatory cycle

1. Identify changed rules/data/implementation and affected assertions. Existing
   dependency hashes automatically make affected current claims stale. Preserve
   historical input/expected/source versions; review semantic changes explicitly.
2. Commit the intended runtime bytes locally. Stage a unique cycle/version:
   `node poke-sim/tools/validation-cycle.mjs stage poke-sim <pinned-upstream-directory> <40-character-runtime-commit> cycle-YYYYMMDD-vN`.
   Exact runtime Git blobs and pinned upstream source/compiled hashes are checked.
   The existing adapter accepts only its six supported bounded configurations.
   It does not regenerate expected values. A capture failure records a dated
   blocked attempt; a successful capture remains blocked pending independent review.
3. An independent reviewer reruns each case, checks inputs/expected outcomes and
   produces the existing per-assertion review/execution receipt format. No review
   is generated or approved by the staging/enrollment command itself.
4. Run `node poke-sim/tools/validation-cycle.mjs enroll poke-sim <capture-index.json> <independent-review.json>`.
   This validates the review, appends immutable enrollment and automatically exports
   newly dated current state plus full history. Old assertions remain unchanged.
5. Run `node poke-sim/tools/validation-cycle.mjs export poke-sim --check`.
   Changed implementation, missing receipts or skipped refresh fail this gate.
   The auto-discovered validation-cycle tests and explicit CI methodology step
   execute the negative controls. A partial failure must be reported, not counted
   as completion. The older direct enrollment primitive remains available to
   maintain historical tooling; CI still requires the generated views to match.
6. After local gates and review, push the authorized draft branch. Read exact-head
   GitHub PR and run JSON. Record them with:
   `node poke-sim/tools/record-validation-lifecycle.mjs poke-sim <hosted-run.json> <remote-pr.json> <local-validation.json> <independent-review.json>`.
   Then `node poke-sim/tools/validation-lifecycle.mjs poke-sim --check` verifies
   source identity, evidence hashes, matching pushed/CI commit and per-stage facts.
   Observe the hosted run through terminal status. A running/cancelled/failed run
   is never a pass. Repository CI changes do not alter branch-protection settings.

## Outputs and semantics

- `poke-sim/reports/move-register/bounded/latest.json`: all bounded assertions.
- `poke-sim/reports/move-register/validation/latest.json`: immutable current and
  history CSV/JSON, validation/review times, versions, source/evidence links, status.
- `poke-sim/reports/move-register/validation/lifecycle.json`: separate implementation,
  local tests, independent review, remote push, hosted checks, merge and deployment.
- `poke-sim/source/validation-lifecycle/`: immutable observed lifecycle fact snapshots.
- `poke-sim/source/bounded-assertions/attempts.json`: immutable dated future attempt
  references. Earlier successful v1-v3 captures retain their original receipt times;
  absent historic attempt timestamps are not invented.

`completed` means a bounded validated draft checkpoint, never competitive release,
merge or deployment. It requires successful exact-candidate CI and unchanged relevant
source. Relevant source hashes exclude generated receipts, docs and Git HEAD to avoid
circular self-hashing: a documentation/enrollment-only commit preserves behavior
identity, while actual runner/rules/engine/workflow changes invalidate completion.
Every hosted claim still names the exact commit that ran; source equivalence is not
presented as a run on a newer commit. Local logs without timestamps expose null time
and a limitation instead of fabricated execution dates. Publication time is observed
when fetched, not guessed from commit creation. Merge and deployment remain not performed.

A failed new capture is blocked because it cannot establish all requested outcomes;
it does not erase an older successful historical result. A failed/blocked pending
attempt cannot be silently enrolled. Missing/tampered evidence stops export and CI.
Completed captures receive actual execution dates and independent review dates.
Downloaded workbooks do not update themselves: a workbook refresh must consume the
new canonical export snapshot and preserve its exact commit/identity.

## Routine regulation update target

Target less than24hours from availability of authoritative rules and complete source
inputs to a validated, review-ready candidate for data/eligibility-only updates. This
is not a deployment guarantee. Record source-availability/intake, semantic diff,
impact mapping, local/reference singles/doubles tests, independent review, tracker
export, push and hosted CI as separate timestamps/durations. Unknown stages remain
not run; external evidence/access/approval waits are separate blockers.

New mechanics, conflicting official sources or unavailable complete eligibility
require an explicit blocked affected claim. Reuse pinned/cached inputs and rerun only
impacted cases plus owning gates; independently runnable suites may run in parallel.
Do not shorten the deadline by weakening checks or carrying green statuses across
changed dependencies. A representative regulation-delta timed dry run is the next
workflow exercise after this checkpoint. Permanent relevant coverage teams come last.

## Current scope and remaining coverage

Six v3 reference assertions were independently replayed at2026-10-20T22:27:12.831Z
against runtime366bbdcefce135c6c68dc65e26bb34219cb04ebd. They cover ordinary Struggle,
grounded ElectricTerrain Rest rejection, Encore queued replacement, a single RedCard
replacement, synthetic WhiteHerb stages and sixteen Tackle damage buckets. They do
not prove whole-move correctness, paired singles/doubles behavior or current client
mechanics. The reference catalog392forms/537moves/166items is not fully verified.

Fly remains rejected. EjectButton, repeat-charge SpA boosts and broader target/switch
boundaries remain open. The independent coverage map at historical433aaf4 reports
selected spread/guard/redirection/order tests, not complete paired-format coverage.
Future cases must explicitly include eligible target count, spread modifier/rounding,
ally damage, Protect/WideGuard, redirection, immunity and faint/switch order where
claimed. Do not promote source declarations or log-only checks into exact damage proof.
