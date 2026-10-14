# Reference-scoped M-C move candidate

Local candidate `v2.2.207-mc-move-audit`, engine `1.1.16`, following local Imprison commit `d51e47c`. Nothing pushed, merged, hosted-tested or deployed. This is a partial move gate, not completion of the free doubles lab or M-C approval.

## Source and isolation

The retained Showdown source is clean at `efe4948570d5e8189751792136d26e71710c6c66`. Inventory tooling verifies compiled fingerprint `fb67973e517fbe62d28ea922a2ca3fd737e3da848843ceae254cd2f72c648489` before regeneration or oracle execution. The generator adds move metadata to the existing review-only external asset. Only actors constructed with the explicit `champions_mc_reference` context read it. Default/historical metadata and competitive eligibility are not promoted.

The fresh raw inventory has 536 move rows: 463 matches and 73 differences. Existing PP overrides explain 51 of those rows. The remaining 22 named rows in #245 were all inspected. Effective accessor comparison now has zero differences across all 73 original difference rows. This is metadata evidence only, not evidence that every move effect works.

| Rows | Reference metadata repaired or reconciled |
| --- | --- |
| Apple Acid, Beak Blast, Bone Rush, Fire Lash, First Impression, Grav Apple, Infernal Parade, Mountain Gale, Night Daze, Psyshield Bash, Slash, Snipe Shot, Spirit Shackle, Trop Kick | Base power |
| Crabhammer, Make It Rain, Syrup Bomb | Accuracy |
| Growth, Snap Trap | Type |
| Strength Sap, Wish | Base PP and constructed maximum PP |
| Clangorous Soul | True accuracy; existing self-effect path already avoids a target accuracy roll |

## Scoped effects and proof

- Make It Rain: one two-stage Special Attack drop per successful action, both sides, zero/one/two Protect recipients, Simple and Contrary.
- First Impression: first-active-turn success; late forced action fails; disabled voluntary selection falls back to Struggle when no other move is available. Fresh-entry selector state works. The reference rejects late selection; this is deliberately separate from forced-action and Encore semantics.
- Infernal Parade: doubles against major status and unignorable Comatose. Independent review found the missing Comatose boundary before finalization; a regression now covers No Guard and Mold Breaker sources.
- Apple Acid, Fire Lash and Grav Apple: target-stage drops with Clear Body, Contrary, Shield Dust, effective Covert Cloak and Sheer Force guards. Real-action and helper tests have different scopes.
- Growth: both attack stats rise; effective sun doubles the rise; Cloud Nine suppresses that weather benefit.
- Snipe Shot: bypasses Follow Me in both side assignments.
- Mountain Gale: actual flinch and Inner Focus, Shield Dust, Covert Cloak and Sheer Force blockers.

`tests/mc_move_metadata_tests.js` has 24 checks; `tests/mc_move_effects_tests.js` has 50. `tools/verify-mc-move-effects.cjs` verifies the pin and compares 20 synthetic side-swapped reference scenarios. These fixtures deliberately mock team admission and are not accepted legal teams or full-game replay parity. First Impression re-entry currently tests selector state, not a full switch-out/back-in lifecycle.

The first aggregate run found one stale source-string assertion in `t9j17_tests.js`: its ACC_MAP check did not accept the new actor argument. The signature expectation was corrected; focused test passes. Follow-up review also exposed a mixed fallback case (late First Impression plus an imprisoned alternative); availability now includes Imprison and the combination has a regression. Final candidate aggregate results are recorded below.

Bundle SHA256: `b554b9adc05d8d0e4d77aa0b9a4cce0eeeeaca52a16d592e10f4b0c3e288634a`.

## Final local gate results

- `npm test`: 217 fast test files and 12 offline DB-contract files, zero failures (`project-gate-mc-verified.log`).
- `npm run test:source-truth`: passed (`source-truth-mc-verified.log`).
- `npm run test:battle-audit -- --report ../../battle-audit-mc-verified.json`: 66 deterministic files, golden trace and seeded stress passed; failures empty. Partial/gap families remain.
- `node tools/audit-mc-effective-moves.cjs`: all 73 originally differing rows match effective metadata, including never-miss semantics; CLI fails if a difference remains (`mc-effective-verified.json`).
- `node tools/verify-mc-move-effects.cjs`: 50 local checks and 20 pinned comparisons passed (`mc-effects-reference-verified.log`).
- All 14 CI source syntax checks plus changed source/tool/test syntax checks passed. No separate lint or typecheck scripts exist. `git diff --check` passed.
- Independent mechanics reviewer confirmed the reported Comatose and unavailable-selection corrections; no blocker remains from those findings. Independent release reviewer passed 11 manifest checks and exact external-asset/bundle verification. These reviews cover their stated slices only.
- Not run: live DB, hosted CI/Pages, deployed verification, interactive desktop/mobile paired replay/export journeys, complete legal-team M-C evidence. No publication.

The evidence logs are retained beside this isolated checkout in the task workspace. Earlier failing logs remain as history; only the `verified` reports describe final runtime bytes.

## Open gate, in execution order

1. Finish and oracle-check Beak Blast charge/contact burn, Snap Trap trapping/residual lifecycle, Syrup Bomb speed-drop lifecycle, Strength Sap healing/drop interactions and Gravity/Grav Apple interactions. These are confirmed missing or incomplete effect families; they are not cleared by the metadata audit.
2. Expand combined boundaries: full First Impression switch lifecycle and locks, Substitute interactions, generic redirection and suppression, actual historical/default mixed-battle regression coverage. The current partial matrix entry retains these gaps.
3. Re-run aggregate/source-truth/battle gates and independent mechanics review after further fixes. Seeded stress and golden traces alone cannot certify battle accuracy.
4. Exact M-C package evidence and approval (#232): 262 review-only identities remain noncompetitive; 21 missing Mega descriptors remain in the refreshed reference inventory. The stored 42 set outcomes include only 14 M-C doubles outcomes and do not establish complete-team acceptance/rejection. Human approval of frozen normalized package bytes and external in-game complete-team evidence remain outstanding.
5. Free doubles workflow evidence: desktop/mobile create/import/save, validate, choose four/leads, simulate, inspect matching replay/export, improve/rerun with no stale identity. No interactive browser batch or paired visible/download evidence was run here.
6. Separate publication authorization, remote CI/Pages checks, deployed-byte verification and hosted journey proof. Deployed receipt remains v205.

No full-M-C ETA is supported while those effect and external evidence gates remain open. AI Labs and consulting are untouched.


## v208 continuation: remaining effect families and honest policy evidence

Candidate `v2.2.208-mc-effect-lifecycle`, engine `1.1.17`, adds reference-context Strength Sap healing/drop and defensive boundaries; source-owned Syrup Bomb and Snap Trap residual lifecycles; Gravity duration, grounding, accuracy, unavailable-move selection and stored airborne-charge interruption; and Beak Blast preparation/contact burn. Beak Blast respects effective Leaf Guard weather, contact prevention, status immunities and action timing. These changes do not promote any species or package to competitive legality.

Independent move review passed all **74 local checks and 78 pinned comparisons**. The reference pin and compiled fingerprint are unchanged from the v207 section. The oracle compares bounded state/effect outcomes, deliberately excluding arbitrary random-damage and full-game parity. Snap Trap exposes trapping state, but this engine has no voluntary-switch action; tested pivot escape is not proof of an unimplemented switch UI. Complete Fly/Bounce/Sky Drop execution, arbitrary combined suppression/redirection, simultaneous residual ties and full historical mixed-team parity remain unproved.

A new complete-team matrix passes **60 cases** across both reference formats: six registered members, four brought, two leads; invalid sizes, duplicate items/species, excessive stat points, invalid moves/abilities and invalid bring selections. Three authored six-member drafts also ran in the pinned reference, with repeated seeded reference games. Reference acceptance does not make missing Mega lifecycle support available in the app. Reduced-roster four/five-member practice remains usable and is now labeled explicitly; strict `requireFullTeam` rejects undersized teams on either side. Neither strict registration nor reference games replace official in-game package evidence.

Damaging-priority selection deprioritizes moves blocked by recorded Armor Tail/Dazzling/Queenly Majesty, Quick Guard or grounded Psychic Terrain. Tests cover both sides, second targets, sole options, locks, Feint, other priority attacks and fainted blockers. This does not cover Prankster status scoring or certify competitive strength. Newly generated simulations label their policy `greedy-state-aware-v2`, full registered state, and unvalidated strength; legacy analysis without provenance retains `null` rather than acquiring a false current-policy identity. Independent policy review passed after that correction.

The five named missing effect families from gate 1 above now have this bounded implementation and oracle proof. They remain part of a partial mechanics inventory. Exact-package human approval, 262 review-only identities, 21 unsupported Mega descriptors, official complete-team evidence and hosted publication gates remain open.

Desktop/mobile interactive workflow proof was attempted but not completed: the browser tool's trusted Node process exited unexpectedly twice before returning a usable browser state. No interactive simulation batch or paired screenshot/download is claimed. The local static server was reachable only as a setup step; this is not visual acceptance evidence.

Aggregate v208 results are recorded below after completion. No push, remote PR, merge or deployment has been performed.


### Exact approval and browser blockers

“Official M-C approval” in older project wording means **internal human approval to promote a source-backed M-C package**. It does not mean certification by The Pokemon Company or the game publisher. AGENTS.md lines305–316 separates the data approver/human production operator from the implementing agent; `.agents/skills/pokemon-season-update/SKILL.md` requires the existing human boundary and says a changed digest invalidates prior approval. The package must be frozen and reviewed with official rules/roster/form evidence, effective format/date, item/move/ability differences, accepted/rejected complete-team in-game evidence, and supported Mega/Z-Mega mappings and lifecycle behavior. Issue232 tracks that package promotion. A human authorized for this project must approve those exact bytes; an agent or passing reference test cannot supply that approval.

Local work can still prepare immutable candidates, audit mapping/metadata, implement unsupported mechanics and add reference comparisons without promoting them. This slice did so for the five effect families and complete-team reference matrix. External current-client captures and human sign-off are not available in this task; no publisher certification is requested.

Browser recovery was attempted through a reset followed by the supported inventory call, not another identical page-open call. Exact diagnostic: `node_repl kernel exited unexpectedly`, `exited(code=1)`, stderr `MXC launcher: cannot locate required Windows platform directory: HRESULT 0x80070003`, reason `stdout_eof`. Edge is installed, but native computer APIs are disabled and no node_repl, Playwright, Selenium or Puppeteer automation runtime is exposed/installed for this task. No software was installed and no access denial was bypassed. Smallest recovery: repair/restart the bundled computer-use runtime so its required Windows platform directory resolves, then resume desktop/mobile paired visible/download evidence. This is an environment blocker, not a passing UI check.

The first aggregate attempt failed one stale source-signature assertion file and three files affected by the same 11 MiB bundle-size overflow. The grounding assertions now include field context. The bundle builder omits CSS indentation and standalone one-line comments, with an escaped-newline guard and first-comment-close restriction; source CSS remains unchanged and the existing size cap is unchanged. Downloaded turn logs and saved analysis JSON preserve supplied policy provenance and leave legacy unknowns null.


### Final v208 local receipt

- `npm test`: **220 fast files +12 offline/mock DB files, zero failures**;4 manual/helper files intentionally skipped. Final log: `../project-gate-v208-final.log` relative to checkout. Administrative/live DB checks remain not verified.
- `npm run test:source-truth`: passed, exit0 (`../source-truth-v208.log`).
- `npm run test:battle-audit`: **69 deterministic files, golden traces and seeded stress passed**, failures empty (`../battle-audit-v208-verified.json`).18 covered/32 partial/5 open edge cases; no universal accuracy claim.
-17 CI/changed-source syntax checks passed; final UI syntax, roadmap generation check and `git diff --check` passed. No separate lint/typecheck scripts are declared.
- Independent mechanics review:74 local +78 oracle checks passed. Independent policy review resolved missing historical provenance. Saved-analysis tests8 and replay/turn-log tests38 passed after export wiring.
- Independent release review:11 manifest tests, external asset verification, bundle reproducibility and CSS safety probes passed. Bundle **11,533,308bytes**, SHA256 **76b394e929d2be7fc0421bb348533b18d3d030b7b3e7c8221061ff7cfb167aa7**,1028bytes below unchanged11MiB cap.

No live DB, hosted CI, remote publication, deployed-byte verification, desktop/mobile paired workflow or complete-game M-C parity was run or claimed. Deployed receipt remains v205. The local candidate is reviewable; the overall free doubles workflow is not yet declared complete.


## v209 continuation and publication intent

Kevin subsequently requested the fixes on the live page following the GitHub README. This supersedes earlier no-publication instructions for these fixes, while preserving exact-package promotion and release gates. The intended public target is https://theyfactora12.github.io/Pokemon-Champions-Sim-Planner/ and its poke-sim/pokemon-champion-2026.html bundle. Prior verified commits remain intact.

The fresh Mega audit reproduced21 missing descriptors and3 aliases at e002edf. This candidate adds only Salamence-Mega and Raichu-Mega-Y in the explicit reference lane, generated from the pinned/compiled source together with the existing Raichu-X descriptor.19 descriptors and3 aliases remain; descriptor presence is not full lifecycle certification. Golisopod's Emergency Exit and Baxcalibur's broader Thermal Exchange behavior need separate work; no broad enablement is inferred from metadata.

15 local lifecycle checks and16 pinned synthetic doubles comparisons pass: base-plus-stone and Mega-name construction, base ability retention, delayed evolution on either side, exact stats/types/ability, local weight/HP preservation, wrong-stone rejection, one-per-side behavior, registration immutability, Aerilate versus Ghost and No Guard source/target accuracy with an ordinary-miss control. Generic switching/fainting persistence, arbitrary ability suppression and complete-game parity are not established by this slice.

Review also found a stale hardcoded reference hash in new draft and simulation provenance. The reference generator now writes the hash into the release manifest; the builder refuses mismatched bytes; both export paths read the manifest. Existing saved history is not relabeled. Regression checks bind actual generated bytes to new import/simulation provenance and release metadata. The new reference asset SHA256 is5029d9ad1e235330bec60b8773c919454dfca9bccb45abfde20a11fbea88504a.

### Human evidence packet

The262-row public roster and the two formerly ambiguous form identities already have captured evidence. The missing current-client proof is complete-team behavior: client version/platform, UTC capture, exact regulation/doubles/event scope, full six registered sets and stable identities, continuous capture through acceptance/rejection, four brought/two leads, and isolated negative controls for roster/bring counts, duplicate species/forms/items, unavailable move/ability and Mega/stone restrictions. Each observation needs its actual result, capture hash, source, independent reviewer and discrepancy status. Bind those records and normalized rules/mappings to an immutable package digest before internal human promotion approval under AGENTS.md305–316 and the season-update skill. This is not publisher certification; the app remains experimental.

A fresh local task can test whether the automation failure is confined to this execution environment, but cannot be promised to repair the missing Windows platform directory. No supported repair command for HRESULT0x80070003 is exposed here. Official troubleshooting suggests a fresh focused chat for stuck state and app restart after active work completes when problems persist; it does not document this specific launcher error: https://learn.chatgpt.com/docs/reference/troubleshooting. If a properly initialized fresh local task produces the same launcher error, restarting/repairing the app runtime is the next operator action. No runtime calls were repeated after the diagnostic failure.

Candidate merge/CI/Pages/live-browser status remains pending until recorded below. No current-client evidence, exact-package approval or completed live workflow is fabricated by these local checks.


### Frozen v209 local receipt and release hold

The candidate merges upstream news refresh 6220c113 without rewriting the earlier reviewed commits. Bundle SHA256 remains `1b832e383ee87c90f25a6779cd152e3adfbcbefa81ab39b392979a1ae06cab04` (11,533,293 bytes); engine1.1.18 / v2.2.209-mc-mega-reference. Independent release review passed12 manifest checks and external asset verification. Source-truth,70-file battle audit plus golden/stress,17 syntax checks and initial aggregate221 fast +12 offlineDB files passed.

The README accuracy gate initially failed one observed-order validation among4,624 battles. Retained doubles-01098, turn2, seed2775382101/1550552011/1607434386/758836025 shows Thunder Wave paralyzing Whimsicott before it acts: Speed173 becomes86, correctly preceding Dragonite128 under Trick Room. The validator only recognized “was paralysed”; the engine emits “is paralysed”. IMP-0098 repairs this evidence parser without changing the bundle.31 regression tests and independent review pass; the retained original eight-turn result now validates with zero errors/warnings. Full rerun:2,312 doubles +2,312 singles, zero state/validator/warning/repeat failures,34 repeat checks each. Initial failure outputs are preserved separately from the repaired rerun.

Merge remains held for applicable desktop/mobile browser inspection under the engineering lane matrix. AGENTS258 forbids converting unavailable evidence to passing evidence; AGENTS233 separately requires deployed identity/assets and user-flow verification. A supported alternative browser or independent QA may provide this evidence; the launcher error is not a failed product test. No interactive simulation batch or paired visible/download comparison is claimed. A labeled practice release could retain experimental M-C restrictions, but cannot waive this UI gate or establish full M-C accuracy. Current-client evidence and exact-package human approval remain separate promotion blockers.

Final aggregate after IMP-0098: `npm test` passed221 fast files and12 offlineDB files, zero failures. Source-truth, battle and17 syntax receipts above remain applicable to unchanged runtime/generated inputs; the validator changed only its recognized status-event wording and was covered by the full aggregate and complete accuracy rerun. Hosted CI remains pending.
