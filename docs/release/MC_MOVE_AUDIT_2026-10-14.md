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
