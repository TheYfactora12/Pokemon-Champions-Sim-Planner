# Improvement Log

Purpose: show what improved, why it improved, how we checked it, and what is still open. This is a change history, not another roadmap or a percentage-accuracy score.

`STATUS.md` owns current status. `ROADMAP.md` owns future outcomes. Detailed dated reports own the underlying evidence. New entries use stable ascending IDs; append verification/rollback/recurrence notes to existing entries without deleting history. Only evidence-supported states may advance from local to staging, merged or deployed.

## Review Index

| Record | Improvement | Recorded proof state |
|---|---|---|
| [IMP-0001](#imp-0001) | Homepage destinations and neutral replay preview | Deployed v138; bounded live verification |
| [IMP-0002](#imp-0002) | Explicit reference intake and error classification | Local candidate; not published |
| [IMP-0003](#imp-0003) | Honest security-readiness reporting | Local candidate; live security clearance blocked |
| [IMP-0004](#imp-0004) | Persistent improvement documentation | Local policy/docs candidate |
| [IMP-0005](#imp-0005) | Replay evidence boundary and player-trust audit | Local candidate; not deployed |
| [IMP-0006](#imp-0006) | Seismic Toss fixed-damage baseline | Local candidate; scoped parity, not Champions certification |
| [IMP-0007](#imp-0007) | Live turn order and per-target stage moves | Local candidate; scoped parity, not Champions certification |
| [IMP-0008](#imp-0008) | Persistent PP, Pressure and resolved replay identity | Local candidate; 100% clean scoped invariant gate |
| [IMP-0009](#imp-0009) | Authorized Supabase security readback | Live read-only audit; public launch blocked |
| [IMP-0010](#imp-0010) | Fresh-user simulator starts in safe Practice lane | Local candidate; browser and export verified |
| [IMP-0011](#imp-0011) | Expired regulation and rejected DB catalog are explicit | Local candidate; live DB read-only diagnosis |
| [IMP-0012](#imp-0012) | Eerie Spell and Spite preserve exact PP state | Local candidate; scoped Showdown parity |

Historical entries below summarize already-recorded evidence, not new runs. This index is intentionally not an exhaustive reconstruction of older work.

<a id="imp-0001"></a>
## IMP-0001: Homepage Navigation And Preview

- Recorded: 2026-08-30. Lane: experience/release.
- Before: homepage navigation did not consistently focus the destination; Edit a Team did not go directly to the editor; static preview copy implied a replay result without an uploaded replay.
- Change: focus the destination panel, route editing directly, show a neutral no-replay state.
- Evidence: [publication record](release/SITE_NAVIGATION_PUBLISH_2026-08-30.md). Hosted checks, deployed HTML fingerprint and three live button destinations/focus were verified. [PR 193](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/pull/193), merge `4f2cb179265d647706f4a1749c47d85e3e707043`, public build `v2.2.138-site-navigation-fixes`.
- Lesson: navigation should move focus along with the view; placeholder UI must not manufacture evidence.
- Remaining: full beginner/accessibility/responsive testing, cramped preview content and separate news/database issues. This release did not change battle mechanics or publish the broader audit branch.

<a id="imp-0002"></a>
## IMP-0002: Reference Intake And Learnset Diagnostics

- Recorded: 2026-08-30. Lane: source/evidence tooling. State: uncommitted local candidate.
- Before: unsupported input could be confused with a completed reference rejection; source/setup errors could be flattened into other outcomes. Team metadata and missing fields obscured meaningful comparison.
- Change: strict default intake plus explicit, recorded normalization; retain original/canonical hashes and transformations; distinguish unsupported, rejected and reference-error outcomes. Direct learnset differences are reported, not automatically promoted.
- Evidence: [intake report](../poke-sim/reports/reference_intake_policy_2026-08-30.md); `reference_intake_policy_tests.mjs` and `showdown_reference_tests.mjs` cover policy boundaries and error propagation.
- Lesson: fix the comparison's input contract before interpreting discrepancies as battle-engine defects. Reference acceptance does not prove official Champions legality.
- Remaining: source/form/IV alignment, three mechanics disagreements, complete-game and visible-log parity. No database data was changed and no 99% accuracy claim is established.

<a id="imp-0003"></a>
## IMP-0003: Security Verification Must Not Invent Passes

- Recorded: 2026-08-30. Lane: database verification. State: uncommitted local candidate; no production security change.
- Before/root cause: three checks labeled live used a local file or mock result, and skipped checks could be counted as passes.
- Change: unperformed administrative checks remain explicitly not verified; a request for their unimplemented live verification fails closed. Added read-only metadata inventory and a guarded staging SQL fixture, both clearly separated from runtime proof.
- Evidence: `poke-sim/tests/security_readiness_reporting_tests.mjs` passed four focused checks, including permissive-policy/grant mutations. The full local gate before the final guard refinement passed 149 fast and 12 offline/mock DB files. M9 reports eight local passes and three unverified administrative checks. SQL fixtures have not been executed. Independent tooling review corrections were retained and retested.
- Lesson: test the test harness itself. A green offline suite cannot substitute for real identity, permissions or deployment evidence; even ordinary omitted/default syntax needs negative regression coverage.
- Remaining: administrative readback, approved migration reconciliation, two real staging users, visitor denial tests, backup/restore and abuse-limit proof. Detailed security evidence is restricted under scan ID `459dc437-1bfb-4cf3-8fa3-367f20386396`; do not copy unresolved exploit details to public records.
- Next: obtain authorized read-only project access and an isolated staging environment. Do not apply earlier hardening proposals blindly or relax protection just to make saves work.

<a id="imp-0004"></a>
## IMP-0004: Record The Learning With The Fix

- Recorded: 2026-08-30. Lane: documentation/process. State: uncommitted local candidate.
- Before: dated reports existed, but there was no single compact improvement history or required before/after/lesson reference in each PR.
- Change: `AGENTS.md` now requires stable improvement records and explicit proof boundaries; contributor guidance and the PR template reference the same log. Removed the PR checklist's conflicting requirement to use historical `MASTER_PROMPT.md` as current status.
- Evidence: `node tests/agent_configuration_tests.mjs` passed, including log references, unique IDs and retained unverified-security scope. `git diff --check` passed for the touched files. No application/runtime behavior changed; the full application suite was not rerun for this documentation-only policy change.
- Lesson: preserve evidence in one place, link it from reviews, and make failed attempts and remaining gaps visible. Updating rules/tests through review is learning; silently rewriting production is not.
- Remaining: publish these policy/docs changes through review, then append evidence-backed entries as future fixes ship. The website and other repository are not automatically synchronized by this local change.

<a id="imp-0005"></a>
## IMP-0005: Require Evidence Before Replay Coaching

- Recorded: 2026-08-30. Lane: replay/evidence/experience. Local v139 candidate only.
- Before: plain prose generated a B/82 review on public v138. An edited or replaced log could retain old review state; a reference change could restore invalid save eligibility.
- Change: require observed positive turns and structurally populated events; invalidate review actions when evidence changes; require analysis before UI saves and retain unchanged uploaded HTML provenance.
- Evidence: [player-trust audit](release/PLAYER_TRUST_AND_JOURNEY_AUDIT_2026-08-30.md), new `replay_evidence_gate_tests.js`, existing parser/UI contracts and full local project gate. The audit records separate baseline, final-candidate and browser evidence instead of treating them as one proof.
- Lesson: test invalid evidence and transitions between valid/invalid inputs, not only successful fixtures. Preserve original-source identity separately from normalized display text. Independent review must challenge the test harness and the patch.
- Remaining: partial-log confidence, full protocol validity, async recovery, authenticated persistence and deployed verification. Three mechanics disagreements, live security proof and measured beginner usability remain open. No engine or DB schema change; no public accuracy certification.

<a id="imp-0006"></a>
## IMP-0006: Fixed Damage Is Not Zero Power

- Recorded: 2026-08-30. Lane: mechanics/evidence/release. Local engine `1.1.3`, build `v2.2.140-seismic-toss-proof`; not published.
- Before: Seismic Toss left a target at 197 HP instead of the pinned reference's 147. The zero-base-power guard conflated fixed damage with a status move.
- Change: retain immunity but bypass normal damage/crit calculation for Seismic Toss. Independent review exposed an additional Unseen Fist/Protect caller multiplier; side-swapped regressions reproduced 12 instead of 50 and now pass after the bounded correction.
- Evidence: [scoped validation](../poke-sim/reports/seismic_toss_validation_2026-08-30.md), 20 focused test groups including ten pinned doubles probes, local modifier/HP-application tests, independent read-only review and broad gate results recorded in that report.
- Lesson: validate both the damage calculator and its callers; a correct intermediate number can still be altered incorrectly. Isolate mechanics without hiding mixed-fixture failures, and exercise each side rather than one favorite team.
- Remaining: same-turn Tailwind and Growl/Leer, other fixed-damage callbacks, wider ability/item interactions, full-game/browser parity and official Champions proof. Coverage is partial, not universal. DB security and public activation remain separately gated.

<a id="imp-0007"></a>
## IMP-0007: Reorder What Has Not Moved Yet

- Recorded: 2026-09-01. Lane: mechanics/evidence/release. Local engine `1.1.4`, build `v2.2.141-tailwind-stage-proof`; not published.
- Before: the engine sorted the entire action queue before the turn, so same-turn Tailwind could not reorder waiting moves. Growl and Leer had mirrored metadata but no executable multi-target stage path. Clear Amulet did not block the shared opponent stat-drop helper.
- Change: re-sort only pending runtime actions against live priority, effective Speed and Trick Room; route Growl/Leer through a per-target Showdown-ordered resolver; expand shared stage handling for protection, reflection, inversion and allied spread-drop boundaries.
- Evidence: [scoped validation](../poke-sim/reports/tailwind_growl_leer_validation_2026-09-01.md), 25 focused checks, 5/5 declared runner probes, 153-file fast gate, 12-file offline/mock DB gate, two independent adversarial review passes and a 4,500-battle stress audit. Exact reviewer findings live in the report.
- Lesson: a turn queue is live state, not a frozen list. Spread status moves need per-target failure gates just like spread damage. Mirrored metadata is source data, not executable behavior by itself.
- Remaining: wider mid-turn Speed/priority and stat-stage inventories; complete-game/visible-log parity; official Champions proof; authorized live Supabase security checks. Coverage remains partial and cannot establish 99% or universal accuracy.

<a id="imp-0008"></a>
## IMP-0008: PP Belongs To The Pokemon, Not The Active Slot

- Recorded: 2026-09-02. Lane: mechanics/evidence/release. Local engine `1.1.5`, build `v2.2.142-pp-replay-proof`; not published.
- Before/root cause: move PP did not persist on a Pokemon, Pressure was an explicit no-op and an exhausted move could not drive the normal Struggle path. Replay rendering also discarded some non-damaging action order.
- Change: store PP by stable Pokemon identity; consume one PP normally and additional PP for each applicable opposing Pressure; derive Champion-effective max PP from the pinned Showdown mirror plus generated overrides; route exhaustion to Struggle. Preserve ordered status/action events in visible replay output.
- Evidence: `tests/pp_pressure_tests.mjs`, `tests/showdown_complete_game_tests.mjs`, `tests/phase5_turn_log_tests.js`, `tests/turn_log_export_validator_tests.js`, `tests/accuracy_harness_tests.mjs`, and `reports/pp_pressure_replay_validation_2026-09-02.md`. PP passes 11/11, complete-game comparison passes 4/4, the 155-file fast gate passes, and the final three-turn browser/export pair has zero observable mismatches. The 4,624-battle invariant gate has zero errors, warnings and repeatability failures.
- Lesson: resource state follows the registered Pokemon through switching, `BeforeMove` denial must happen before PP deduction, and replay proof needs stable action identity plus exact execution position. Generated overrides make differences inspectable instead of hiding them in hand-maintained code. Regulation/version/promotion drift must fail the harness until its exact evidence lane is reviewed.
- Remaining: Disable, Encore, Spite, Grudge and wider resource-changing interactions; more complete games, imported teams and official Champion-specific confirmation. The cross-format harness is 100% clean in its declared scope, not universal game accuracy.

<a id="imp-0009"></a>
## IMP-0009: Live Security Readback Replaces Assumptions

- Recorded: 2026-09-02. Lane: database/security. State: live read-only audit complete; no production mutation.
- Before/root cause: local tests correctly refused to label administrative checks as passed, but production policy state and migration alignment were unknown.
- Change: inspect the named Supabase project's live RLS flags, policies, role grants, functions, migration ledger and anonymous read surface. Reconcile those results with the existing local hardening migration and public-launch checklist.
- Evidence: `docs/release/SUPABASE_PUBLIC_LAUNCH_GATE_2026-08-30.md` records the sanitized readback. All 16 public tables have RLS, but production still allows anonymous shared-evidence inserts and unrestricted branch-coverage updates. The live ledger has only four entries, and no owner identity exists in the public schema.
- Lesson: RLS being enabled is not the same as least privilege, and two-user isolation cannot be tested until ownership exists in the data model. Keep production unchanged until the exact migration and staging denial evidence are reviewed together.
- Remaining: apply the hardening migration in protected staging, run anonymous HTTP mutation denials, add owner-scoped private persistence, test two real staging users, verify backups/restore and add abuse controls.

<a id="imp-0010"></a>
## IMP-0010: A Safe Gate Must Still Let A New User Practice

- Recorded: 2026-09-02. Lane: regulation/experience/release. Build `v2.2.142-pp-replay-proof`; local candidate, not published.
- Before/root cause: a fresh browser selected historical Reg M-A by default. The legality gate correctly blocked bundled teams because regulation-specific species, forms and learnsets are not approved, but a new user could not run the first simulation without understanding that Practice must be selected.
- Change: default fresh sessions to `champions_custom_practice`. Keep saved user choices, historical/review options and all competitive evidence blocks unchanged.
- Evidence: a fresh-origin browser opened Start Team Test on `Practice (unverified)`, ran one doubles Bo3 without a preflight block, rendered three retained replay samples and exported JSON. The visible sample (`loss`, seven turns) matched the exported game, which retained build `v2.2.142-pp-replay-proof`, practice ruleset/version, team digests, four stable participants per side and registered items. Regulation selection/execution, release-manifest and bundle load-order tests pass.
- Lesson: fail-closed competitive rules and a runnable practice experience are separate requirements. The safe default must never imply that practice results are regulation-approved or trusted learning evidence.
- Remaining: repeat the journey on the hosted candidate and mobile; validate detailed downloaded turn logs against visible events for more teams. This manual path proves usability of one bounded journey, not 99% universal mechanics accuracy.

<a id="imp-0011"></a>
## IMP-0011: Reachable Data Is Not Approved Data

- Recorded: 2026-09-03. Lane: regulation/database/experience. Local v143 candidate; no production mutation.
- Before/root cause: after M-B ended, the UI had no explicit current-coverage warning. A successful Supabase request still displayed `[DB connected]` when all 36 returned teams were rejected, hiding catalog and migration drift behind network health.
- Change: use the recorded M-B UTC end to report `successor_required` without inventing a regulation; classify DB roster rejection reasons and show `[DB review needed]` when zero returned teams pass the catalog gate.
- Evidence: [regulation and DB diagnosis](release/REGULATION_AND_DB_DIAGNOSIS_2026-09-03.md), deterministic regulation boundary tests, DB status tests, read-only row/migration queries and live Supabase advisors.
- Lesson: connection health, catalog acceptance, regulation approval and competitive trust are different states. Unknown current rules must fail closed while Practice remains clearly unverified.
- Remaining: human capture of the post-M-B regulation, digest-bound review, protected DB migration/reseed, anonymous-denial and two-user staging tests. No 99% accuracy or public-launch claim is established.

<a id="imp-0012"></a>
## IMP-0012: PP-Draining Moves Use One Auditable Rule

- Recorded: 2026-09-03. Lane: mechanics/evidence/release. Local engine `1.1.6`, build `v2.2.144-pp-drain-proof`; not published.
- Before/root cause: ordinary PP spending and Pressure were persistent, but Eerie Spell and Spite had no executable drain behavior and the Pressure registry comment still described the old no-op state.
- Change: add one zero-clamped PP-drain helper with structured before/after evidence; wire Eerie Spell after a successful direct hit and Spite to the target's last used move; preserve Protect, Substitute and missing-history failures.
- Evidence: [PP-drain validation](../poke-sim/reports/pp_drain_validation_2026-09-03.md), `tests/pp_drain_move_tests.mjs`, and the pinned-reference PP probe in `tests/showdown_reference_tests.mjs`.
- Lesson: resource-changing moves need exact state evidence and an independent post-turn comparison, not only a matching log sentence. Their state remains attached to stable Pokemon identity.
- Remaining: Grudge, Disable, Leppa Berry restoration, switching/called-move interactions, complete-game/browser parity and Champion-specific source approval. Scoped agreement is not a 99% or universal accuracy result.

## Entry Template

```text
ID / date / change lane:
Problem before and observed impact:
Root cause (confirmed or hypothesis):
Bounded change:
Regression/evidence links and related cases:
Proof state / environment / revision or build:
Reusable lesson:
Remaining gaps and next action:
Dated verification / rollback / recurrence notes:
```

For documentation-only work, use a document consistency check instead of claiming a runtime regression. For sensitive security work, keep the public entry general and point to an access-controlled record by ID.
