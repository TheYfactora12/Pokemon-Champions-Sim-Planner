# Independent boundary and evidence retest

Exact target: `a7657d414d98cac95cc8212cfc8825bea633a3f8`, detached isolated `retest-a7657d4`. Previous artifacts preserved. Scope: Struggle/Fake Out, bounded enrollment, historical golden containment and CI change detection.

## Verdict and material findings

**Struggle repairs pass the bounded retest. Positive enrollment is broken in a clean checkout. Additional conditional provenance controls survive.** No current-client, full legal-combination, production or competitive-release certification follows.

### High: required enrolled evidence is absent from the pushed commit

`poke-sim/source/bounded-assertions/index.json:83` references `independent/discrete.log` beneath snapshot `8a13b340b33ddf3bcda1a7395298317c90f72887b4114af0818a4f9cc81575c5`. It is absent from `git ls-files` and the clean worktree. `.gitignore:25` matches it with `*.log`.

`readBoundedRegister` fails with ENOENT at `tools/bounded-register.mjs:24,37`. The unchanged bounded suite produces eight failures and four passes; the failures include the healthy historical enrollment. The separate golden suite passes nine tests. The combined first run also had a Windows MSYS workflow-fixture failure, which is a separate environment issue resolved by approved host execution.

The missing file's expected SHA-256 is `7156dc2e2aaef99ce4760fcaa82427a61274fdf7c845f762ccaa887047f7c6a5`. It matches this auditor's preserved `focused-retest-evidence/discrete.log` exactly. Supplying those original bytes **only through an in-memory read interceptor** lets all 12 bounded tests pass. This is a diagnostic conditional result, not a repair or clean-checkout pass. No checkout file was added to hide the omission.

Acceptance: commit the exact retained evidence bytes; verify every indexed artifact exists in a fresh checkout and matches its declared hash; rerun enrollment/export and owning tests there. Do not resolve this by dropping the evidence link. Retain the failed clean-checkout receipt.

### Medium: conditional enrollment does not fully bind corroborating evidence to its retained audit

Location: `tools/bounded-register.mjs:33–43,56`. With only the exact missing bytes supplied in memory, these additional mutations are accepted:

- Replace `buckets.json` with a contradictory sampler report and update only that enrollment reference's hash. The original `focused-receipt.json` and its evidence hashes remain unchanged. The loader returns historical `passed_declared_scope`, current `stale`, no errors.
- Remove the corroborating report, script, sampler grid and test log, retaining only `focused-receipt.json` and `candidate-check.json`; historical pass remains.
- Duplicate an independent evidence entry; no uniqueness error.
- Change the exported execution date to `2099-01-01T00:00:00Z`; it is exported unchanged with the historical pass.

These are provenance-consistency defects/limits, not cryptographic authorship bypasses or current-green promotion: current status remains stale, client status unknown, and competitive use false. The adapter explicitly disclaims author authentication. Nevertheless, a claim that linked evidence is the unchanged retained audit should reject a digest that contradicts that audit's own manifest.

An unrelated index `case_id` is also ignored in favor of the receipt's correct case ID; this was tested but is not counted as a wrong exported case. Engine/data/test/runner/checker mutations change current dependency identities and preserve historical results; no stale-to-current promotion reproduced.

Acceptance: require the declared corroborating evidence inventory and unique logical identities; resolve each retained artifact to its original audit-manifest hash; bind/validate the capture date rather than copy arbitrary enrollment text. Keep these checks distinct from execution and author authentication. Reproduce: `node boundary-enrollment.mjs`; full conditional results are in `boundary-retest-evidence/enrollment.json`.

## Struggle and Fake Out: scoped resolution

- Preserved 19-condition/two-side probe: **38/38 endpoint agreements** against independently compiled upstream `9b136a8c8cdb860a8ab96fa063f906604e352547`. This closes the original probe's Imprison, shield, Disguise, suppression and Unseen Fist failures within those conditions.
- Supplied current-reference suites: **175/175 pass**. The original 96 numerical expectations remain unchanged. These are overlapping executions, not 175 independent mechanics or an accuracy percentage.
- Five Struggle reversal controls plus three Fake Out reversal controls: **8/8 caught**, with healthy baselines passing and `MUTATION_APPLIED` receipts. Failures are owning assertions, not missing anchors/imports. Logs are retained from `artifacts/test-method-controls` in the machine receipt.
- Independent two-turn Fake Out probes: **12/12 action-choice agreements**, two orientations across only Fake Out, remaining Tackle, active Choice Scarf lock, consumed Scarf, Klutz and Encore. Active Choice-locked spent Fake Out correctly yields Struggle despite Tackle's PP. Consumed Scarf/Klutz permit Tackle. The Encore setup is a synthetic volatile-state probe with the reference DisableMove event explicitly applied.
- Injected late Fake Out is separately covered by the unchanged 48-check legacy suite and its extra-attack reversal: failed late execution has no invented Struggle damage/recoil. This differs from request-time fallback when there is no usable move.
- Preserved unforced target sampling: local hits slots 0/1 in **14/10** of 24 seeds; reference **13/11**. This disproves the original always-first-slot behavior. It does not prove a statistical distribution or identical PRNG consumption. Supplied endpoint tests independently cover both acting sides/slots and fainted-target exclusion.

For the 38 damage probes, both engines deliberately target the first live opponent to isolate numerical mechanics. This is the only necessary harness adaptation after random targeting was repaired; random targeting was tested separately without that override. Synthetic abilities/teams are not legality or client evidence. Endpoint agreement does not establish every intermediate state or all Disguise paths.

Evidence: `boundaries.json`, `fakeout-independent.json`, `targeting.json`, `struggle.log`, `mutants.log`. Scripts use the exact new engine sources; executable reference pin is recorded separately from the installed adapter package identity. An initial Encore calibration omitted the reference DisableMove lifecycle event and falsely differed; its raw result is preserved as `fakeout-calibration.json`, excluded from defect counts. Two initial harness setup errors (missing explicit format and reference nickname lookup) were corrected before results.

## Golden loading: containment verified, current expectations unapproved

Nine loader tests pass. Missing/reordered modules, changed bytes and historical-as-current claims reject; generation cannot overwrite historical fixtures. The explicit current custom-practice profile loads nine modules including runtime data, while the historical loader stays explicitly historical.

Independent execution of `currentProfileReport()` reproduces **three differing traces with unchanged winners**, `current_golden_status: not_approved`, and review-required differences. Full traces, source identities and first differences are retained in `boundary-retest-evidence/goldens.json`. Passing byte/profile integrity and determinism is not a trusted oracle for the new traces. No golden expectations were refreshed.

## CI change detection

Diff inspection finds only the explanatory comment and `token: ''` addition in the change-detection action. Path filters, job dependencies and failure handling are unchanged. Battle audit is not waived by a false engine path result; detect-job failure still blocks its dependents.

The action's current v4 primary source explicitly routes tokenless pull-request events to Git comparison of the event base SHA and checked-out ref, and its Git helper uses `--no-renames --name-status -z` with errors thrown on failure. Sources read during this audit: [main.ts](https://raw.githubusercontent.com/dorny/paths-filter/v4/src/main.ts), [git.ts](https://raw.githubusercontent.com/dorny/paths-filter/v4/src/git.ts). These are v4-tag source observations, not attestation of the action bytes executed by a hosted job.

Offline workflow checks: **29 assertions and 11 injection fixtures pass** after approved host execution resolved the Windows MSYS sandbox restriction. An independent temporary Git fixture confirms rename reports retain the deleted original filtered path, deletions/additions remain visible, and a missing base fails nonzero. This is invocation-level evidence, not a hosted-event replay. No CI scope regression reproduced. Hosted run 39480292694 was not certified here.

## Final acceptance and limits

Keep the scoped mechanics repairs. Fix the missing enrolled artifact before claiming the pushed enrollment/export gate passes. Then reject the conditional provenance contradictions and retest from another clean checkout. Keep historical scoped pass, current staleness, supported implementation, official legality and client proof as separate fields.

No full-project, actual browser, live DB, production or deployment validation was performed. No active implementation checkout or settings were changed. Approved fetch/dependency installation and offline fixture execution completed; no operation remains denied, pending or uncertain. Current-client proof, official completeness and broader prior foundation findings remain open. No repository behavior/policy change was made by the auditor, so no improvement record was created.

Machine receipt: `boundary-receipt.json`; earlier receipts and all immutable worktrees remain preserved.
