# Repeatable season and accuracy workflow

The [current decision register](COMPETITIVE_READINESS_2026-10-20.md) owns gates,
failures, owners and closure. This runbook defines the repeatable process; it
cannot eliminate all defects.

1. **Observe.** Reuse Regulation Watch, source inventory and Showdown Sync.
   Retain exact URL, language, UTC capture, hash, effective window, client version,
   mode and server-maintenance context. Failed fetch or empty sprite parser is
   unknown, never “unchanged.” Record contradictions before selecting a source.
2. **Diff.** Compare normalized old/new rules by stable entity/form IDs, eligibility,
   moves/PP, abilities, items, training and clauses. Keep rules-data changes separate
   from engine-mechanics changes. Preserve old packages for historical replays.
   Neither sprite existence nor an extracted learnset proves client legality.
3. **Stage.** Reuse Regulation Stage's exact watcher run/attempt/candidate digest;
   do not refetch during approval. Candidate effective dates, format, complete
   roster and unresolved fields travel together. Staging is not promotion.
4. **Prove.** Complete registered-team accepted/rejected fixtures precede bring-four
   selection. Test impacted mechanics, opposing-side/slot permutations, information
   boundaries, complete games and replay pairs. Pin reference package/source hashes.
   Distinguish reference-only, synthetic, current-client and historical evidence.
   Add mutants for the property being claimed; retain every failed attempt.
5. **Review.** Independent reviewer retests reproduction and negative controls.
   Golden changes require retained before/after traces, first-divergence explanation
   and independent expected behavior; do not regenerate an answer to hide a bug.
   Client package review signs exact immutable bytes only after the required proof
   exists. Human key enrollment and protected review controls are separate prerequisites.
6. **Decide.** Run development checks and separately the strict competitive gate.
   Missing/stale/wrong-mode evidence, unresolved included mechanics or absent service
   proof is NO-GO. No agent auto-approves a regulation; no default Practice fallback.
7. **Release only when authorized.** Freeze reviewed commit and bundle/external
   assets. Deploy through gates; verify deployed bytes, cache transition, affected
   journeys and paired logs. Record previous verified release and rollback method
   preserving saved teams. Deployment verification is not inferred from CI.
8. **Learn.** Keep each defect's impact, root cause, missed-check explanation,
   repair, negative control, independent retest and closure receipt in the decision
   register/improvement log. Update current status once; retain historical receipts.

Automated in this candidate: existing fast/DB contracts, unconditional battle audit,
methodology/reference/mutation job, explicit-runtime invariant matrix, exact-head
artifact inventory, readiness report and strict Pages pre-deploy assessment.
The readiness package is intentionally absent; report NO-GO is not a failed
development repair.

Manual/unavailable: fresh client captures; human approval/key enrollment;
representative policy evaluation; Supabase Auth/PostgREST and current live readback;
hosted browser runtime approval; repository protection settings; production
authorization and deployed cache/rollback verification. Local cached browser
audits remain separate evidence. No new scheduler or paid service is introduced.
