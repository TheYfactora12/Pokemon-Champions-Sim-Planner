# Independent integrated retest

Audit target: `ee93569bde6e9d4c28bc2d168c46f38c29fdc1b8`, detached isolated `retest-ee93569`. Earlier receipts and worktrees are preserved. This is a scoped repair retest, not certification of simulator accuracy or current-client parity.

## Material survivors

### High — Unburden ordering proof accepts a noncausal trigger and impossible early ordering

Location: `poke-sim/tools/validate-turn-logs.mjs:503–523`, especially line 518.

The validator binds the proof to an earlier actor/move, but does not establish that this action caused the item consumption. An independent synthetic doubles battle has White Herb/Unburden Drifblim using Amnesia, allied Blastoise using Protect, opposing Whimsicott using Moonblast and Garchomp using Swords Dance. Seed `[8885,16085,22955,39595]` triggers Moonblast's Special Attack drop and White Herb consumption. Both player/opponent orientations reproduce:

- Unedited engine trace: zero findings.
- Remove activation proof: `observed-action-order-mismatch`.
- Change proof source from Moonblast to earlier unrelated Protect: zero findings.
- Additionally move Drifblim's action before the real Moonblast trigger, maintaining the action/log-index ordering and moving the proof boundary to that earlier position: zero findings.

The full original and mutated traces, identities and findings are retained in `integrated-retest-evidence/noncausal-item-proof.json`; run `node integrated-proof-source.mjs`. Mutation anchors are explicit and throw if absent. This establishes an evidence-checker failure, not an engine execution failure. These synthetic teams are not offered as official M-C legality evidence.

Four committed item-order fixtures also passed unmodified. Duplicate-proof, wrong-side and wrong-ability controls were detected. An attempted unrelated Protect edit in those four fixtures had no applicable anchor and is NOT counted as a tested rejection; the separate synthetic battle supplies that missing case.

Acceptance: bind consumption to a unique causal action/effect and affected holder, including effect phase and state transition. Reject noncausal Protect substitution and an activation before its causal stat drop while retaining the healthy trace and Sleep Talk child-action regression. Actor/move identity alone is insufficient.

### Medium — Register validator still accepts contradictory row provenance

Location: `poke-sim/tools/move-register.mjs:6–32`. Six additional generated-data controls return an empty error list:

1. Replace a move's source SHA with 64 zeroes.
2. Replace its source revision with `invented-current-client-source`.
3. Point a species/move pair to existing but wrong-kind `regulation` evidence.
4. Invent an inheritance ancestor and replace the pair source SHA.
5. Duplicate an evidence ID.
6. Remove all 17 species-gap entries.

Reproduce with `node integrated-register-extra.mjs`; results in `integrated-retest-evidence/register-extra.json`. These are schema/provenance contract holes, not a demonstrated bypass of immutable artifact byte checking. The shipped artifact was not edited, and its unknown/unverified labels remain conservative.

Acceptance: require unique evidence IDs; validate row hash/revision and evidence kind against the declared source; validate inheritance against the pinned lineage; bind the gap inventory to source reconciliation. A recomputed snapshot identity must not make contradictory provenance valid.

### Surviving — M-C reference reconciliation remains incomplete

Independent source checkout: Pokémon Showdown `9b136a8c8cdb860a8ab96fa063f906604e352547`, locally compiled with source/runtime hashes retained. Reference inventory: 392 species/forms, 537 moves, 166 items and 23,756 species/move pairs. Broad app catalog: 1,517 species/forms, 954 moves, 583 items and 68,025 exported pairs.

No reference move/item/species IDs are absent from the broad catalog. This does not establish legal combinations. Among reference-available species, exported learnsets still have **636 missing and 205 extra pairs**. Historical catalog extras are not, by themselves, illegal runtime admissions.

Runtime M-C species/items match this reference inventory. Runtime still rejects `sirfetchd:meteorassault`, which the independently pinned M-C validator accepts. Healthy full-six registration passes both; Choice Band and Venusaur/Hydro Pump reject both. Existing runtime responses correctly remain experimental and competitively ineligible.

Evidence and exact pair lists: `integrated-retest-evidence/mc-reconciliation.json`; reproduce with `node integrated-mc.cjs`. Complete official eligibility evidence and current-client proof remain UNRESOLVED. Prior official-source observations were not refreshed this turn. Upstream M-C availability is reference coverage, not official proof.

## Scoped repairs verified

| Area | Exact-head result | Limit |
|---|---|---|
| Original register controls | All 12 previously accepted adverse controls now reject; two healthy rejection controls also reject | Does not close the six new controls above |
| Register source/mod handling | Wrong mod/version reject; eight source hashes match; Windows generated check passes | Source catalog is still historical |
| Regulation-change invalidation | Source-only change stales 954 moves, 68,025 pairs and 69 interactions | Receipt enrollment and official completeness remain open |
| Rest | Supplied 134/134 on each reference; independent 40/40 agree, including all four prior Leaf Guard failures | Synthetic interaction coverage, not client certification |
| Encore | 36/36 on each reference | Installed suite explicitly uses base Gen 9; current suite uses Champions M-C |
| Red Card | 92/92 on each reference | Bounded cases, not exhaustive |
| White Herb | 48/48 on each reference | Bounded cases, not exhaustive |
| Item lifecycle | 8/8 on each reference | Includes admitted full-six and ordering boundaries |
| Supplied item negative controls | 9/9 killed with assertion failures | Original-base plus eight controlled mutations; not nine independent mechanics |
| Item evidence validator | Supplied 6/6 pass | Internal consistency tests; new causal-proof counterexample survives |

The two references are installed 0.11.11 and independently compiled upstream pin above. Historical/current behavior distinctions in the tests are explicit; passing both does not mean they implement identical rules. Counts are case executions, not accuracy percentages or unique interactions. Logs and mutant assertion outputs are retained under `integrated-retest-evidence/`.

## Release acceptance and remaining scope

Keep checked-off claims bounded to the executed assertion, exact source/runtime/regulation pins, engine commit, date and receipt. Do not elevate a reference pass to current-client verification or a catalog row to legal availability. Preserve season snapshots and invalidate dependent rows after reviewed semantic differences.

Before closing this repair checkpoint: kill the causal ordering counterexample for the intended reason, enforce the six provenance contracts, reconcile missing/extra legal pairs against a genuinely independent source, and retain the official completeness gate as unresolved until complete authoritative evidence exists.

No full-suite, hosted CI, live-browser capture, production or database test was performed this turn. Hosted run 39467917919 is not certified here. Discrete damage rolls are outside this checkpoint; broader Struggle, clock, competitive-policy and foundation findings are not closed by these results. No active development checkout, settings, external data or production state was changed. No operation remains pending or uncertain.

Machine receipt: `integrated-receipt.json`, with exact heads, clean-tree checks and source/evidence SHA-256 hashes.
