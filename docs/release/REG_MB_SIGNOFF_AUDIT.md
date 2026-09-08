# M-B Sign-Off Audit

Decision: full competitive sign-off is blocked by concrete data discrepancies and
missing field/behavior proof, not by an unfinished repeat of the initial source review.

## Closed In This Candidate

- Re-read official notice https://champions-news.pokemon-home.com/en/page/776.html:
  Ranked M-B ends September 9, 2026 at 01:59 UTC, not September 2.
- The date regression failed before the fix. Selection tests now retain M-B during
  the extension and select M-C at September 9 02:00 UTC. Both remain unapproved.
- Captured all 235 official eligible rows from the linked roster page as JSON,
  preserving official form IDs, original labels, retrieval time and source hash.
  Extraction parses JSON and never executes remote JavaScript.
- Added official-ID presence/absence and form-distinction regression checks.

## Findings Preventing Sign-Off

The 235-row visual ledger is not 235 distinct Pokemon: Hawlucha is duplicated.
Vikavolt, Centiskorch and Rabsca occur in that ledger but not in the official roster.
Crabominable, Falinks, Espathra and the official Floette row are missing from the
visual ledger. Official Floette ID is 0670-005; do not resolve its form from the
display label alone. Regional, gender, Rotom, Tauros, Gourgeist and Lycanroc names
also require explicit mapping, not string-equality or base-species collapse.

The existing Mega ledger contains 16 stone rows, 16 implementation rows and 16
learnset-policy rows. Their existence is not proof of Champions-specific mechanics.
The old readiness count says nine fields ready and five blocked; this is metadata,
not an executed competitive acceptance result.

## Remaining Acceptance Work

1. Review an exact official-ID-to-runtime-ID mapping for all 235 rows. Preserve
   historical visual evidence but never publish its known incorrect eligibility.
2. Verify every Mega's item, stats, typing, ability and learnset against pinned
   baseline plus Champions-specific evidence; report each disagreement separately.
3. Implement versioned M-B eligibility validation, positive and negative imported
   team fixtures, and singles/doubles scope. Species approval is not move/item approval.
4. Complete declared mechanics and full-battle comparisons, then paired browser
   and exported-log checks. Obtain in-game evidence for unresolved Champions deltas.
5. Human data approval must bind the exact reviewed package fingerprint before
   atomic publication. The user's request to finish is not approval of unseen data.

M-C preparation may reuse the corrected source pipeline while M-B promotion stays
blocked. Do not inherit the old visual ledger into M-C or call either regulation
99% accurate. No production database writes or regulation promotion occurred.

## Verification Receipt

Local `npm test`: 161 fast files and 12 offline/mock DB files pass; four
manual/helper files skipped. Focused selection 15/15, M-C source review 6/6,
legacy M-B source audit 20/20, plus the official-roster capture checks pass.
No new complete-battle or browser/export parity evidence is claimed by this audit.
The candidate is v2.2.151-mb-official-audit; hosted CI is verified separately from
local tests. No independent reviewer was available in this occupied agent session.
