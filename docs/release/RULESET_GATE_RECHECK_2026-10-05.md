# Ruleset and simulation gate recheck - October 5, 2026

Tested revision: 37ecc6012450790f99273227f87e4a15ba8db440.
Scope: local candidate, repository-declared rules and pinned reference. No
production mutations, rule approvals, deployment or fresh browser battle.

## Executed results

| Command (npm --prefix poke-sim run) | Result | Limit |
| --- | --- | --- |
| test:battle-audit | Exit 0; declared suites and 4,500-game matrix completed | 5 regression-covered, 8 partial, 2 gap families; 18 covered, 23 partial, 5 open edge cases |
| test:fast | 187 files, zero failures; four helper/manual skips | Local contracts, not live service verification |
| test:accuracy | 2,312 doubles and 2,312 singles battles; zero state failures, validator errors/warnings, or repeat failures; 34 repeat checks per format | Shared mechanics/invariant proof, not M-C certification |
| showdown:reference | Six agreements, zero mismatch/unsupported/rejected probes | Zero complete reference games; bounded probes only |

The reference catalog separately reports one rejected and 33 unsupported inputs
for EACH M-A and M-B lane. Successful probe exit does not mean catalog acceptance.
The accuracy manifest explicitly leaves M-B/M-C in source_review with empty
format lanes. Historical M-A has a doubles lane; practice has both formats.
Do not reinterpret its runtime_promotable metadata as fresh official approval.

Local console evidence: poke-sim/artifacts/qa-2026-10-05-{fast,accuracy,reference}.log.
The accuracy runner writes to the older-named artifacts/accuracy-2026-08-30/
cross-format directory even on this rerun. Its path is not its execution date.
Raw artifacts remain local; this document records the fresh execution date.

## Open findings and challenges

1. Current-regulation coverage cannot be claimed: M-C is deliberately blocked
   rather than tested as an approved competitive runtime lane.
2. Passing tests do not close the October 4 hosted replay defects. Duplicate
   displayed damage, omitted Protect outcomes, item-state ambiguity and export
   verification still need exact battle evidence and regressions.
3. Reference normalization remains incomplete for the legacy catalog. Unsupported
   input is neither legal nor illegal and must not become a pass/fail substitute.
4. There is no full item-behavior registry in the manifest; move, ability and
   species inventories retain partial coverage. Broad random battles cannot
   replace named interaction fixtures.
5. PR #195 is OPEN and CONFLICTING at the tested SHA. GitHub's returned check
   rollup only contains a SKIPPED Supabase Preview. No hosted CI or preview
   success is established by these local runs.
6. Dated harness output directories risk overwriting historical evidence on
   rerun. Follow-up should assign immutable execution directories and explicit
   build/ruleset identities rather than treating folder names as provenance.

## Next work and human evidence

First repair paired replay/export evidence and add the concrete hosted failures
as fixtures. Then extend full-team normalization and complete-game oracle lanes.
Do not edit historical teams to force M-C acceptance or remove blocked rulesets
to obtain a green gate.

Human evidence request: source-linked Champions M-C in-game captures for disputed
stat rules and new Mega/ability interactions, if available. Record exact game
version, teams, actions and expected outcome. Opinion or approval alone cannot
substitute for mechanics evidence. No need to send credentials.

No mechanics changes were made, so no independent mechanics sign-off is claimed.
This is a main-agent audit, not an independent reviewer certification. No 99%
accuracy, current-legality approval, live DB verification or deployment claim.
