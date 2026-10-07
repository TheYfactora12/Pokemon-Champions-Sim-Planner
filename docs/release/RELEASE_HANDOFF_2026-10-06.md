# Release Worklist Handoff

Date: October 6, 2026, America/New_York. No blanket accuracy or beta-readiness claim.

| Priority | Work | Current evidence / next action |
| --- | --- | --- |
| 1 | M-C form identities | Official roster page opened but rendered no roster content in this browser; Maushold/Squawkabilly remain unresolved. Do not infer from numeric suffix alone. |
| 2 | Eligibility inventory | Official notice confirms limited rules, not complete move/item/Ability inventory. Current-client or other authoritative evidence still needed. |
| 3 | Complete teams | Existing pinned reference harness rerun successfully: 3 teams, 18 sets, 3 rejection controls. Not runtime approval. |
| 4 | Mega mechanics | Six reference games plus repeats exercised two Mega events each. Not app-engine parity or in-game confirmation; targeted interactions remain open. |
| 5 | Exact M-C approval | Blocked on evidence/package/test gaps. No automatic inheritance of parent approval. |
| 6 | Sources/Roadmap | v185 candidate separates historical/current metadata and records shipped v184. |
| 7 | Coaching | v182-v184 scoped fixes shipped. v185 bounds Review wording; move-replacement and legacy report correctness remain #209. |
| 8 | Live paired logs | Not run this pass. Reference logs are not paired live UI/export proof. |
| 9 | Mobile/download UX | #211/#213 and empty-state/download checks remain open; no phone proof this pass. |
| 10 | Beta/failover | Still local-save preview. No DB security approval, beta certification or Alfredo backup synchronization this pass. |

## Reused Reference Harness

Executed `node tools/test-mc-draft-teams.cjs` from poke-sim. Pinned upstream:
`efe4948570d5e8189751792136d26e71710c6c66`.
Canonical compiled fingerprint:
`2ac4f2a3fd74a17a1509ebb5e1b191c55a7bf9292dfe76c2a0da468a411c59ad`.
Six completed reference games lasted 11, 8, 12, 17, 7 and 14 turns. Every
seeded repeat reproduced normalized events. Rejection controls: duplicate item,
main-series EV encoding, and Incineroar Knock Off. No app battle was run.

Local retained evidence: `poke-sim/artifacts/mc-draft-teams/report.json` and its
companion logs. Report SHA256:
`b2fddce54871c041eafc293dbe5dc6fcade78412556989f731bd86b50e0b8a5d`.
The existing generated TEAMS.md has a stale v142 explanatory footer; do not use
that sentence as current deployment status. Report inputs/pin define this proof.

## Release Boundaries

v185 changes display and roadmap only, not battle behavior, eligibility or DB
permissions. Full gate, independent review and hosted proof belong in its PR.
Previous verified release v184 / 26e7c20 is the rollback baseline. Preserve
captured source dates and user saves. Keep #221 open for remaining surfaces.
