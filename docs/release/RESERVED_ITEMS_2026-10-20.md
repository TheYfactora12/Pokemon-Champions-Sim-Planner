# Red Card / White Herb isolated repair

Mechanics candidate, **not release-ready**. Base verified exactly:
`2769879d005f10102754d6fa539e5925bfe9a836`. Work used a separate clone on
`fix/reserved-items`; the active implementation checkout was not modified.
No push, merge, deployment, live database operation or repository-setting change.

Integration sequence (the final lifecycle behavior requires the sequence):

1. `4a631c30b984c03c2a1b18b5fc4bcd9ef5afdc38`: White Herb boundary restoration.
2. `8ab9f33805d027b9d21dcb7a8dcb88434f93bd52`: Red Card, deferred move switches,
   review counterexamples, source-bound tests and negative controls.
3. `f88a073eef84f8d3ace8331bc74144cff32b94ec`: generated candidate artifact.
4. This documentation/evidence commit.

The generated artifact is a review candidate under the inherited manifest label,
not a newly approved release identity. Integration must assign its own release
identity and rebuild after combining other work.

## Sources and behavior

Current upstream HEAD observed and compiled locally:
`9b136a8c8cdb860a8ab96fa063f906604e352547`.
This is the official **Showdown repository**, not an official Pokémon battle
specification or fresh Champions client observation.

- [Red Card source](https://github.com/smogon/pokemon-showdown/blob/9b136a8c8cdb860a8ab96fa063f906604e352547/data/items.ts#L5170-L5191):
  surviving distinct source/holder, active source and living reserve; consumption
  precedes DragOut; forced dragging bypasses voluntary traps.
- [White Herb source](https://github.com/smogon/pokemon-showdown/blob/9b136a8c8cdb860a8ab96fa063f906604e352547/data/items.ts#L7682-L7736):
  clear all negative stages together, preserve positive stages, one consumption;
  check entry, Mega, after-move and residual boundaries.
- [Champions move lifecycle](https://github.com/smogon/pokemon-showdown/blob/9b136a8c8cdb860a8ab96fa063f906604e352547/data/mods/champions/scripts.ts#L575):
  AfterMoveSecondary runs despite Sheer Force. Copying Scarlet/Violet's suppression
  would be incorrect for this reference.
- `sim/battle.ts`, `sim/battle-actions.ts`, `sim/pokemon.ts`, and Champions
  abilities establish cached event speed, deferred dragging and suppression.

White Herb now runs after complete stage maps and before a move's switches.
Red Card collects actual HP-damage targets, waits for all hits/contact/recoil,
uses cached action-start event speed for spread holders, consumes once per
eligible holder, and defers random eligible-reserve dragging until after White
Herb. Suction Cups/Guard Dog can prevent dragging after consumption. Klutz/Gas
use existing effective-ability handling. The existing switching helper retains
identity, switch-out hooks and replacement entry effects.

## Anti-drift contract

[`reserved_items_contract.json`](../../poke-sim/tests/fixtures/reserved_items_contract.json)
version `2026-10-20.1` retains stable `ITEM-RED-CARD-FULL-SIX` and
`ITEM-WHITE-HERB-FULL-SIX` IDs, exact six-member setup, seed, brought members,
leads and structured expected outcomes. These are authored expectations, not
regenerated output goldens. The test consumes/asserts those fields.

The helper rejects a changed upstream HEAD, six named source/runtime files, or
the aggregate digest of **every `dist/**/*.js` file** in the selected current or
historical reference. Digest algorithm: sorted relative POSIX path, NUL, file
SHA-256, LF; SHA-256 of the concatenation. Both package versions say 0.11.11;
the distinct runtime digests prevent confusing them. The existing lockfile and
dependency remain unchanged. Current reference installation/build is isolated;
no upstream server or ladder was started.

Reproduce from `poke-sim`:

```text
node --test tests/white_herb_reference_tests.mjs tests/red_card_reference_tests.mjs tests/item_lifecycle_reference_tests.mjs
node tools/run-item-negative-controls.mjs
```

For current comparisons set `CHAMPIONS_REFERENCE_SIM` to a compiled checkout
of the exact upstream pin. Hash mismatches fail closed; a different compiler
output requires explicit review of the artifact pin, not silent refresh.
Without the variable, tests use the existing shared npm reference.
Optional `ITEM_EVIDENCE_DIR` retains raw bilateral full-six logs and input.
`ITEM_DIAGNOSTIC_MC=1` additionally exercises synthetic M-C branches; this does
not turn synthetic abilities/states into legal teams.

## Evidence and review

Evidence directory: [reserved-items-2026-10-20](../../poke-sim/reports/reserved-items-2026-10-20).
Historical finding JSON files remain unchanged. Original natural reproductions
were executed on the exact base before editing. The baseline mutant still fails
all four bilateral item assertions under the final harness.

| Check | Result and limits |
| --- | --- |
| Frozen current upstream suite | 148/148 expected outcomes passed |
| Frozen shared reference suite | 148/148 expected outcomes passed, **including historical disagreements**, not 148 parity agreements |
| Current M-C | Four bilateral full-six cases pass local admission and current upstream M-C TeamValidator; bring four enforced |
| Synthetic M-C branch run | 84/84 passed before the final eight status/recoil controls; those eight passed in the ordinary current-reference suite |
| Negative controls | 9/9 killed by assertions: original base, no consumption, clearing positive stages, only clearing Attack, no Red Card, absent bench gate, deterministic first reserve, post-hit event speed, Herb after pivot |
| Battle audit | 89 test files, three unchanged goldens and 4,500 seeded battles passed; zero JS errors; partial/gap families remain |
| Full project gate | 252 fast + 12 DB test files ran; six initially failed; three environment/harness failures passed targeted retests; three size-related files remain failing |
| Release artifact retest | 12/12 passed, including disposable Git checkout identity test outside sandbox |
| Workflow retest | 27 checks plus 11 invalid/injection fixture controls passed outside sandbox |
| Default policy retest | Four groups, 40 production mutation runs and aggregate checks passed; extracted Mega-policy harness now supplies the new lifecycle-hook dependency |

Historical drift is explicit: shared npm suppresses Red Card for Sheer Force;
it also drags a Close Combat user before White Herb activates, retaining that
Herb. Current upstream activates Red Card and consumes Herb before dragging.
Local expectations always require the current behavior. Initial exploratory
test setup errors (spread target syntax and an uncontrolled critical hit) were
corrected; they are not counted as implementation-failure proof.

Independent read-only `battle_auditor` found and reproduced two defects:

1. Parting Shot's replacement Intimidate ran before White Herb. Deferred move
   switching now leaves the later Attack drop at -1, matching upstream.
2. Icy Wind changed dual-Red-Card holder ordering. Cached action-start speed
   now activates the correct holder. Duplicate held items are a deliberately
   synthetic event-order probe, not M-C legality evidence.

Both counterexamples are permanent tests. The reviewer independently observed
132 current item cases and six lifecycle cases passing, then reran four final
full-six cases against each reference. It also challenged incomplete reference
hash binding and unused fixture declarations; both were corrected and reviewed.
No remaining demonstrated mechanics blocker was reported for this bounded
candidate. The 12-seed reserve test proves both reserves are reachable and kills
a first-reserve mutant; it does not prove statistical uniformity.

Reviewed/tested engine SHA-256:
`3ae31d3aef4e414b4aaa398e0c0516046b56eafb9f2a4ebe462dee39e6576bd9`.
Committed bundle SHA-256:
`697b219b170648f000c0d58d13cc7b155ee954cea4aa4662b093e393f32d2dfd`.
Runtime candidate commit: `f88a073eef84f8d3ace8331bc74144cff32b94ec`.

## Remaining blockers and exclusions

**Bundle budget failed:** 11,538,816 bytes versus the unchanged 11,534,336-byte
(11 MiB) limit; 4,480 bytes over. `db_m1_wiring_tests.js`,
`db_m9_hardening_tests.js` and `security_readiness_reporting_tests.mjs` therefore
remain failing. No limit was increased and no expectation was weakened. Parent
integration must resolve size with a reviewed artifact change, then rerun gates.
Initial sandbox Git-fixture restrictions were resolved by targeted permitted
retests; no approval denial remains.

No fresh current-client/server experiment, browser interaction proof, hosted CI,
deployment or live DB verification was performed. Three administrative DB
security checks remain explicitly NOT VERIFIED. Current-client accuracy is not
certified by this candidate.

Magic Room, Embargo, Ingrain, complete forced-switch interactions, general
suppression chains, Mega/re-entry and residual cross-products remain unproved.
Recoil-triggered Emergency Exit activation logging differs even when the resulting
Red Card drag agrees; exact event-log parity is not claimed. Item restoration
and transfer combinations beyond the tested paths remain open.

Next highest-value action: integrate the reviewed source/tests as a coupled item
lifecycle change, resolve bundle size, rerun exact-head gates and obtain current
client evidence before making a competitive release claim. Competitive release
remains NO-GO.
