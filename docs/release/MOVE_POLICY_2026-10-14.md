# Move-policy candidate and remaining completion gates

Base: primary main `2d1ae14b4cb7bab5bdd765bb78fcfd6e328375b9`.
Local branch: `fix/move-policy-audit-264`. Candidate v2.2.206-imprison-policy;
not pushed, hosted-tested, merged or deployed. Primary owner: Mechanics Engineer;
independent read-only reviews: battle_auditor and release_reviewer.

## Proven local slice

Refs TheYfactora12/Pokemon-Champions-Sim-Planner#264. A minimized regression
first failed because the selector chose Imprison again over a usable damaging
move while the actor's same seal was active. The candidate gives that redundant
choice a low score; it remains available when it is the sole usable move.
Encore and Choice locks retain precedence. No damage/effect execution changed.

Fourteen checks cover both sides, active/cleared/different-owner/changed-move
states, sole option, locks, no additional enemy-move read in the redundant
branch, seeded doubles repeatability and registered-input preservation. The
initial-use heuristic still reads opponents' moves; no information-limited or
competitive-strength claim. Lifecycle clearing is not newly oracle-proven.

Independent battle review found no blocking scoped regression. Release review
found a real Windows checkout issue: mc_review_reference.js CRLF bytes differed
from its committed LF bytes. Restored original Git bytes, pinned that file and
tournament_catalog.js to LF, and extended checkout-filter tests. No regulation
data or public team contents changed.

## Verification

- `node tests/imprison_policy_tests.js`: 14 passed (also independently rerun).
- `npm test`: 215 fast files and 12 offline DB-contract files, zero failures.
- `npm run test:battle-audit -- --report ../../battle-audit-final.json`: 64
  deterministic files, golden traces and seeded stress passed. Partial/gap
  families remain; this is not complete-game parity or M-C certification.
- `node tests/phase5_turn_log_tests.js`: 38 passed.
- `node tests/release_manifest_tests.js`: 11 passed in final aggregate gate.
- `node tests/t191_overview_tab_tests.js`: 11 passed.
- `python tools/build-bundle.py`: regenerated candidate and manifest;
  bundle SHA256 `0f2f9873ef9d40593c75b2192f7dca98453bbae603e0dd93fb8009a4eefcfa0e`.
- Initial aggregate runs failed inventory count, release fallbacks, Windows
  generated-file line endings and sandbox-restricted subprocess checks. Keep
  initial task-local logs; final logs supersede their gate status, not history.
- No separate lint/typecheck scripts exist; source syntax checks apply.
- Browser paired replay/mobile, hosted CI, deployed bytes and live DB checks
  were not run. No interactive simulation batch was performed.

## Ordered completion checklist

This patch does not finish the product or close #264.

1. Local Imprison policy regression and candidate gates: passed as above.
2. Reconcile current effective behavior for all 22 remaining move rows in #245
   against the pinned M-C reference; repair real defects with adversarial fixtures
   and applicable reference comparisons. Do not equate raw table deltas with bugs.
3. Finish policy/selection provenance and information boundaries, including
   Armor Tail decisions. Compare identical teams, bring/lead order, policy and
   seeds before interpreting a policy change; no pooled win-rate claim.
4. Complete exact M-C rules/package evidence (#232): format, dates, team/bring
   sizes, levels, clauses, Mega/item/ability boundaries and accepted/rejected
   complete-team evidence. Freeze source decisions and normalized bytes under
   one digest; independent review and human exact-digest approval remain required.
5. Exercise free doubles workflows on desktop and mobile: create/import/save,
   validate with accurate labels, choose four/leads, simulate, inspect matching
   replay/export, edit/rerun with stable identity and no stale results. Resolve
   scoped mobile/onboarding/replay blockers rather than declaring one patch done.
6. Final aggregate/source-truth/battle/release gates and independent review,
   then separate publication authorization, hosted checks and deployed journey
   proof. Current deployed receipt stays v205 until actually superseded.

M-C current source still has 262 noncompetitive identity candidates. Stored
42 set outcomes span six formats; only 14 are M-C doubles outcomes. Those do
not substitute for complete-team or mechanics evidence. There is no defensible
full-M-C completion date until the effective move inventory and evidence gaps
are classified. Human sign-off and external in-game evidence have separate
elapsed-time dependencies. Consulting and AI Labs are outside this work.
