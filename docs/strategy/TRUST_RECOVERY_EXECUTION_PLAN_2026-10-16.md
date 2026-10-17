# Trust recovery engineering plan

Owner: primary implementation agent; independent review by affected boundary.
Baseline: origin/main b757b12, v2.2.213-roadmap-receipt, engine 1.1.19.
Issue references below belong to TheYfactora12/Pokemon-Champions-Sim-Planner.
STATUS.md owns release truth; this plan owns sequencing and acceptance criteria.

## Objective and limits

Make build -> validate -> simulate -> inspect -> improve dependable for doubles.
Do not equate run volume, reference parity, or an accepted team with complete
Champions accuracy. Keep reference practice distinct from official M-C approval.
No paid services, new schedulers, destructive cleanup or save resets are planned.

## Baseline reconciliation

- PR268 has merged. Its 19 Mega lifecycles and three aliases are deployed in the
  experimental lane; they are not an outstanding implementation batch.
- The 22 move-row reconciliation, scoped Imprison preference and context-error
  handling have shipped. Reuse their receipts only for unchanged behavior.
- News sync38893211368 and Pages38893466185 passed October16. The live feed
  matched main, all five sources responded, and13 URLs were unique. After reload,
  browser news timestamp and Next navigation worked. Keep six-hour updates enabled.
- A fresh production visit exposed #271; reload recovered. Prior successful
  browser checks do not invalidate that new observation.
- See [v213 receipt](../release/V213_LIVE_2026-10-15.md) and
  [v212 receipt](../release/V212_LIVE_2026-10-15.md) for bounded prior proof.

## Ordered work packages

| Order / issue | Owner and scope | Deliverable and acceptance | State |
|---|---|---|---|
| 1 / #271 | UI/release engineer: startup | Capture first error, fix confirmed initialization dependency, test fresh/cache-upgrade/offline visits and saved-team preservation; verify deployed Home, Teams and news with no startup exception | Investigating |
| 2 / #264 | Battle-policy engineer + independent battle reviewer | Audit available-information decisions, not omniscient choices; fixture Fake Out/Armor Tail, Imprison already active, switching and unknown opponent information; record chosen action, alternatives, reason and policy version | Queued; scoped Imprison fix already shipped |
| 3 / #235,#252,#260 | Mechanics engineer + pinned-reference reviewer | One interaction family per fix: Lum/status/suppression, late Fake Out/Encore/Struggle, recoil/suppression boundaries; failing fixture, actual pinned oracle comparison and Champion-specific uncertainty | Queued; ordinary Rock Head repair already shipped |
| 4 / #238,#216,#240 | Evidence/UI engineer | Consumed item distinct from registered item; cause of faint grounded in events; Tailwind attribution to correct side; exclusions keep controls reachable; rendered/export comparisons | Queued |
| 5 / #228 | QA engineer | Unchanged user team against all eligible loaded teams with declared seeds, side, bring-four/leads and policy; report excluded teams, draws and incomplete games separately; sample paired visible/export logs | Depends on affected fixes above |
| 6 / #232 | Source reviewer + human approver | Current-client rules, complete six accepted, select four/two leads, targeted rejection evidence; immutable package digest and scoped human sign-off | Evidence blocked; practice remains available |
| 7 / #211,#213,#209,#190 | Experience and independent QA | Desktop/mobile/keyboard core journey, honest coaching text and limitations; no undefined advice or blocked controls; real-device Safari separate | Queued |
| 8 / #247 and database gates | Security/database specialists | Triage actual dependency exposure and later authorized live isolation checks; record skipped vs passed | Separate gate; no DB promotion in this plan |

## Execution loop and evidence

1. Observe: read linked issue and latest implementation; retain sanitized failure,
   exact revision/build, inputs, seed when applicable and actual vs expected result.
2. Orient: identify shared cause, affected surfaces and trusted evidence. Label
   hypotheses explicitly. Do not alter expected results just to obtain green tests.
3. Decide: smallest independently reviewable change, non-goals and rollback.
   Add the failing regression before the repair whenever practical.
4. Act: repair, focused tests, related boundaries, aggregate gate and independent
   review. New runtime changes rebuild artifacts/cache identity through generators.
5. Release: PR against primary main; exact-head CI, bundle/cache checks, Pages,
   HTTP committed-byte comparison and affected browser journeys. News races are
   reconciled from sources, never by overwriting generated files or forcing main.
6. Learn: dated receipt, improvement entry, STATUS and issue update. Close only
   acceptance criteria proved on the deployed revision; preserve failed evidence.

## Startup investigation protocol

Initial execution on October16: the diagnostic reproduced the exact `player`
exception with the registry absent, and returned false for player / true for
champions_arena_1st after the actual registry assignment. Existing catalog,
import and persistence tests passed41/41 (`node poke-sim/tests/t9j11_tests.js`),
including408 member round-trip checks. These tests do not exercise interrupted
browser initialization. `git diff --check` passed. No new battle runs or production
repair is claimed; runtime files remain unchanged in this planning batch.

Observed stack: teamMatchesFilter -> countTeamsByFilter -> renderTeamsFilterRow
-> renderTeamsGrid -> DOMContentLoaded. The read is TOURNAMENT_TEAM_KEYS[key];
the key in the observed exception was player. The var assignment is later than
the registration of the DOMContentLoaded handler. Normally a synchronous script
finishes before that event; declaration order alone does not prove the trigger.

`node poke-sim/tools/audit-startup-filter.cjs` executes the real filter with a
missing vs initialized registry. It is a diagnostic, not a passing startup gate.
The helper dependencies are stubbed to isolate this access. Preserve the distinction
between reproducing the exception condition and reproducing the entire browser fault.

Next: capture the earliest page error and script/network timing on cold and
upgrade visits; inspect earlier top-level calls and late globals. Do not silently
catch the error, classify all tournaments as absent, clear storage, or blame the
service worker without evidence. A safe patch must preserve catalog membership.

Acceptance matrix (pending, not executed by this plan): fresh and existing-save
visits; old-to-new cache transition; normal/hard reload; offline after successful
load; desktop and390px touch; Home/Teams/news navigation. Run ten controlled loads
per supported browser-state combination, report observed failures/attempts, and
retain first-error traces. Zero failures in that sample is not a universal claim.

## Team evaluation contract

Preserve all six registered sets and digest. Separate game wins from series wins.
Compare paired seeds and the same opponents/bring policy before and after a policy
fix; never pool incompatible versions. Use a small diagnostic batch first, then a
larger declared sweep only when invariant/log checks pass. Show matchup uncertainty,
policy limitations and exclusion reasons; do not claim an optimal team from self-play.
Inspect representative wins/losses/draws and every anomalous trace. Uninspected games
remain explicitly uninspected. All combinations of all actions are not feasible.

## Release checklist

- [ ] Root cause and failing regression recorded for the first runtime fix.
- [ ] Focused tests and applicable full project gate passed on final candidate.
- [ ] Independent review complete; mechanics review only when mechanics change.
- [ ] Exact-head required GitHub checks passed; no gate bypass.
- [ ] Primary deployed bytes/build and changed user journeys verified.
- [ ] Receipt, improvement log and issue acceptance states updated.
- [ ] Backup divergence reviewed separately; no forced Alfredo synchronization.

Planning documentation may ship independently without runtime version changes.
This plan does not approve M-C, certify live database security, or set a public
beta date. Human evidence is needed for work package6, not for starting1-5.
