# Utility move-inventory boundary — October 20, 2026

Local candidate v2.2.218-utility-policy / engine 1.1.22, on
`fix/utility-policy-move-leak`, based on preparation commit `265b3ca` and
PR278 head `8282089`. No publication, merge or deployment is authorized.
PR278 remains an independent draft with six passing hosted checks and no
reviews/comments at inspection. GitHub main is `ae3f52c` (news update);
this candidate has not incorporated that newer news. Preserve its separate
release/rebase gate and the unrelated accuracy-report edit in the audit checkout.

## Bounded result

Seven utility moves used four direct enemy move-inventory queries:
Imprison, Quick Guard, King's Shield, Spiky Shield, Baneful Bunker, Obstruct
and Taunt. With identical visible state, changing hidden Tackle to Scratch
changed Imprison selection on both sides. The new regression failed before repair.

Remove those queries and retain their former threat-present scores as fixed,
explicit heuristic priors. PP, Taunt, Encore, Choice locks and Imprison's
existing-seal penalty remain in place. A strong-damage control verifies that
utility is not selected unconditionally. Policy identity is
`greedy-state-aware-v3`; its information model remains `full_registered_state`.
Damage/priority scoring still reads opponent stats, items and abilities.

This is a policy contract change, not a Champions mechanics override or a claim
of stronger play. Fixed priors can favor unnecessary guards or repeated Taunt.
No observation/reveal adapter has been integrated. No complete hidden-information,
open-team-sheet, human-play or competitive-quality claim is justified.

## Remaining-work roadmap and acceptance gates

1. **Information boundary:** immutable per-side decision inputs, trusted reveal
   ledger, no live engine references/callbacks, both choices captured before
   execution, independent decision RNG. Hidden moves/items/abilities/stats/bench
   and pending choices must not affect decisions before an authorized reveal.
   Champions visibility evidence is still required for each promoted field.
2. **Switching:** repair the reproduced U-turn/Shadow Tag mismatch separately,
   then establish explicit switch lifecycle and ordering. Require both sides
   and slots, failure atomicity, HP/item/status/PP identity, entry/exit once,
   target-slot continuity and no extra incoming/outgoing action.
3. **Mega/order and broader parity:** separate reference probes and current-client
   evidence; do not imply these are solved by policy or pivot repairs.
4. **Doubles workflow/release:** build/import → validate → simulate → inspect
   paired replay/export → revise/save. Require applicable aggregate, accuracy,
   battle, artifact/cache and hosted gates. Merge/release approval and exact live
   artifact verification remain separate from local success. AI Labs are out of scope.

## Independently reproduced next switching defect

Default doubles, seed `[3,7,11,13]`, one turn, Hardy level 50, no items/investment:
Scizor/Technician/U-turn and Blissey/Natural Cure/Protect lead; Pikachu and
Gengar are reserves. Opposing Gothitelle/Shadow Tag/Tackle and
Snorlax/Immunity/Protect lead, with Venusaur and Blastoise in reserve.

The local engine deals U-turn damage, then reports Scizor trapped by Shadow Tag.
Independent reviewer ran pinned `pokemon-showdown` 0.11.11 Champions custom:
the successful U-turn produces `forceSwitch:[true,false]` and accepts Pikachu.
This is a synthetic baseline probe, not legal-team certification or damage parity.
The evidence is a reviewer reproduction; a retained executable fixture is the next
step before repair. Do not extend this conclusion to every pivot or trapping rule.

The MC-only inactive-action guard is defensible hardening (reference
`dist/sim/battle.js` rejects inactive actors), but no ordinary-practice queued
bench action was reproduced. It is not falsely presented as a repaired defect.

## Verification

- Focused utility test: 168 checks, both sides and seven utilities; hidden inventory
  mutations, throwing accessors, PP/Taunt/Encore/Choice and strong damage.
- Existing Imprison suite: 14 checks, including two seeded doubles integrations.
- Existing priority policy suite passed, including 78 suppression assertions.
- Independent read-only battle review passed the narrow removal; repeated guard/
  Taunt quality remains a named tradeoff.
- Browser: three games, four downloaded-JSON/visible-DOM pairs, 46 paired turns,
  zero mismatched pairs and zero page errors. Retained local evidence:
  `poke-sim/artifacts/browser-replay-HszJPx`. Includes Practice, M-C reference,
  team swap/re-download continuity, desktop/touch themes and offline helper load.
  The Practice start screenshot was manually inspected.
- Aggregate, battle, accuracy and final release checks: final receipt below.

No live DB check or hosted CI was run for this local candidate. There is no
standalone lint or typecheck script; syntax checks and repository gates are
reported separately. IMP-0111 records the fix and limits.

### Final local gate receipt

- `npm test`: 231 fast files + 12 offline DB files passed; zero failures;
  four manual/helper files skipped. Log: task workspace `v218-project-gate.log`.
- `npm run test:battle-audit`: passed focused suites, golden traces and curated
  stress. Contract: 15 families (4 regression-covered, 9 partial, 2 gap);
  case matrix 18 covered, 35 partial, 5 open. No universal parity claim.
  Log: `v218-battle-gate.log`.
- `npm run test:accuracy`: 2,312 doubles + 2,312 isolated singles regressions;
  zero state failures, validator errors/warnings or repeat failures; 34 repeat
  checks per format. Singles are shared-mechanics regression evidence only.
  Log: `v218-accuracy-gate.log`.
- `npm run roadmap:check`, battle contract and `git diff --check`: passed.
  `node --check` passed for engine, app shell, UI, release manifest, service
  worker and the new test.
- Release manifest: 12/12 passed on host. A sandbox-only rerun failed its temporary
  Git config write; host rerun passed without changing assertions or code.
  Log: `v218-release-gate.log`.
- Browser total: 3,239 observable-field comparisons; every captured export has
  policy v3 and `full_registered_state`. This verifies rendering/export agreement,
  not independent battle truth or comparative win rates.
- Generated bundle: 11,532,847 bytes; SHA-256
  `8f5ff1ab6e120c0cf5e9c5dfa4a2654940b00b925789017432ea0bf7718d887b`.
  Freshness reproduction passed; 1,489 bytes remain below the 11 MiB gate.

Issue264 remains open after fresh GitHub read; its hidden-information and
win-rate interpretation investigation is broader than this patch. Publication
of PR278 or this stacked candidate still needs an explicit decision. No paid
service, account/access change or unrelated project modification was made.

### Current-main reconciliation

October 20 continuation: separate `review/utility-current-main` starts at
`ae3f52ce481924512bff523fdcef75d04935b7a3`. Cherry-picked PR278 repair,
preparation and v218 as `9b1a307`, `cf8961f`, `0fa05c6`. Original commits/branch
are preserved. Only generated release metadata conflicted; the builder resolved
it. Current news is byte-identical to main; engine/UI/test source is identical
to original v218. Historical PR278 publication receipt is retained.

Reconciled bundle: 11,531,929 bytes; SHA-256
`3c15d45a4e0c5f7c15c56241018ec88af58e3807bfa1f0ccb481267622bd188a`.
Focused utility/Imprison and 12 release checks passed; broader v218 mechanics
evidence above is reused only because those source inputs are unchanged.
No remote state changed.
