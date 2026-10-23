# Independent register audit and M-C completeness gate

Fixed app head: **308da9b7d65eda80dae6e22daa39e7b3b177d68b**. Snapshot identity: `d2dab94398d97af9886f9cb266dc702612ba2ddd69b1314d543ff0699a9390d6`. Isolated detached checkout; no implementation edits.

**Verdict: useful historical/reference inventory, not ready to check off M-C completeness or mechanics verification.** The seven source hashes match and its generated semantic data matches, but Windows verification fails. Independent reconciliation exposes stale exported learnsets and one actual runtime reference rejection.

## Reproduced findings

**R1 — Medium: clean Windows checkout fails the advertised deterministic check.** Six supplied tests produce **five passes, one failure**. `tools/move-register.mjs:65` hashes its own raw file, while source inputs use LF normalization. The working file has 72 CRLF line endings:

- Stored/Git/LF generator hash: `179ce256d213b3c589332e172f3dfebb8c32e4b8dc72618f65d3f938ffe5afd7`.
- Raw Windows hash: `ee0bb464e4892d51bc15ce837ea1874f331ddc5232370b8a3c4ff67aeba8dc1e`.
- All generated data is canonically identical; LF hashing reconstructs the committed identity exactly.
- Actual `exportMoveRegister(...,{check:true})` instead seeks missing identity `a8f0cbcd67def96a2da0ab77fd23c1715011df1f003a75090ba72885a9ed16cf`.

Evidence: `register-retest-evidence/identity-diagnosis.json`, `supplied.log`. Fix generator hashing consistently; do not create a second “new source” snapshot solely for newline conversion.

**R2 — High for the requested M-C checklist: exported pair inventory is stale.** Independently fetched and compiled upstream **9b136a8c8cdb860a8ab96fa063f906604e352547**, using the existing locked tool dependencies. Unlike installed package 0.11.11, this source exposes `gen9championsvgc2026regmc`. The immutable revision, clean source state and all compiled JS hashes are retained.

| Dimension | Upstream reference availability | Broad app catalog | Missing catalog IDs | Catalog IDs outside this reference set |
|---|---:|---:|---:|---:|
| Species/forms | 392 | 1,517 | 0 | 1,125 |
| Moves reachable through these pools | 537 | 954 | 0 | 417 |
| Held items | 166 | 583 | 0 | 417 |

These are **reference availability**, not independently complete official legal sets. Catalog extras are not automatically incorrect admissions; historical catalog retention is legitimate. Mega/battle forms must be separated from directly registrable Pokémon.

The reference has 23,756 species/form–move pairs. The export has 68,025 across its broader inventory. Restricted to the reference's available species/forms, the export is **missing 636 pairs and contains 205 extra pairs**. Examples: missing Absol/Slash and Arboliva/Memento, Strength Sap and Synthesis; extra Arboliva/Absorb and Archaludon/Mirror Coat.

Three extras have direct official patch evidence: **Politoed/Pound, Archaludon/Mirror Coat, Archaludon/Metal Burst**. The export contains all three; current upstream and the separate runtime M-C mirror exclude them. This is stale reference export data, not proof the active runtime admits those three.

**R3 — High within experimental M-C reference execution: Sirfetch’d/Meteor Assault is falsely rejected.** Runtime M-C species and item ID sets match the upstream reference, but its pairs lack `sirfetchd:meteorassault`. A valid six-member reference team with this move passes the independent upstream validator and fails actual `checkMcReferenceExecution`. Healthy control passes both. Choice Band and Venusaur/Hydro Pump reject in both. The reference also rejects duplicate species and five individually learnable moves. No incompatible legal four-move combination was independently established here.

Evidence: `register-mc-reconcile.cjs`, `register-retest-evidence/mc-reconciliation.json`; all missing/extra IDs are retained. The pin yields **537**, not the earlier approximately 536 estimate.

**R4 — Medium: schema and source validation do not enforce the claimed joins/scope.** `tools/move-register.mjs:5–22` accepts all twelve negative controls:

- Orphan move pair; nonexistent species pair; dangling evidence ID.
- `verification_status='client_verified'` with invented assertion ID.
- Wrong row regulation/format; null accuracy.
- Empty source-hash map; empty evidence list.
- Explicit interaction link to a nonexistent move.
- “Confirmed working” with no executed bounded receipt, or with obsolete engine/regulation/source identities.
- A removed catalog move with adjusted summary counts.

These controls operate on generated-data objects, the same shape used before snapshot hashing. The committed snapshot hash does catch an unrehashed edit; this is **not** a claim of bypassing exact-byte `--check` with an ordinary file edit. Self-rehashing is not authority, and trusted-base/signature enrollment is already documented as pending.

More directly, isolated source fixtures changing the pool mod to `gen9` or pin to `0.0.0` still build and validate all 68,025 pairs. Changed hashes are recorded but not semantically rejected. Missing metadata (deleted accuracy) and direct `client_verification='verified'` do reject. Actual current snapshot has zero orphan move pairs; the counterexamples show absent defenses, not existing orphan rows.

**R5 — Medium: workbook columns can overstate implementation and omit reactions.** There are **148 `implementation_coverage='verified'` rows**, though the adjacent verification status correctly requires bounded assertion review. Struggle retains “fixed damage” notes and old test links, not its latest numerical suite. Keep that column explicitly legacy, not a green checked-off status.

All **67 interaction rows have zero explicit move links**. This gap is disclosed, but it prevents move-by-move reaction coverage. Exported `behavioral_effects` also drops source fields already available: Double-Edge recoil `[33,100]`, Reflect/Stealth Rock `sideCondition`, and other condition fields. Source descriptions are not executable rules; missing source fields such as some weather/healing details need separate unknown markers. “Effective metadata” is baseline plus PP overrides only, not executed move behavior (e.g. Struggle displays source Normal type).

**R6 — Medium: stale propagation is incomplete.** A source-only hash change marks 954 move rows stale, but yields **zero pair and zero interaction changes**. Pair dependency/provenance invalidation and a reviewed previous-base requirement remain pending. All 68,025 pair CSV rows lack their own regulation/format fields; workbook joins must retain the snapshot context explicitly.

CSV leading `=`, `+`, `@`, `-` escaping exists. Tab/CR-prefixed formula text is not escaped by the helper; downstream spreadsheet execution was not tested, so this is an export-hardening proof gap rather than a demonstrated spreadsheet exploit.

## Current official evidence and blocker

On this turn, [Nintendo's official update page](https://www.nintendo.com/en-gb/Support/Purchases-Subscriptions/Games/How-to-Update-Pokemon-Champions-3079895.html) was readable. It lists 1.2.2 released October 7, 2026, and the September 9 M-C changes, including the three removed species/move pairs, Slash availability and Wish/Strength Sap PP changes. It does **not** enumerate a complete legal roster or all held items/moves.

Fresh retrieval of the [Pokémon M-C notice](https://www.pokemon.com/us/news/get-ready-for-regulation-set-m-c-in-pokemon-champions) returned an Imperva security-check page. No bypass attempted. Previously stored official roster/package data is not a fresh independent completeness proof. No current-client frame evidence was obtained. Web observations are URL/time-scoped; no new raw official response-byte pin was captured.

Therefore **official M-C completeness remains UNRESOLVED**. The upstream result must be labeled reference coverage, not official legality or client accuracy.

## Gate required for the later Pokémon/items snapshot

The following are acceptance requirements for main's implementation, not controls implemented by this audit:

1. Emit separate stable-ID species/forms, held items, species/form–move pairs, ability dependencies, interactions, evidence and regulation-window tables. Retain original snapshot; this audit does not replace the canonical workbook export.
2. Compare both directions against an independent, immutable, scope-qualified expected inventory. Separate broad catalog extras from entries actually selectable/admitted for M-C. Use the exact missing/extra lists above as regression fixtures.
3. Check registered versus battle-only form identities, required Mega stones and abilities; validate full six-member registrations, complete sets, species/item clauses and positive controls. Mere presence/individual learnability is insufficient.
4. Require separate states for catalogued, reference-available, officially eligible, implemented, independently tested and client-observed. No global “verified” checkbox, no inherited green status from a prior regulation.
   A checked-off claim must resolve to an executed **bounded assertion**, its input/expected-result/receipt hashes, result, test date, exact engine commit/build, source revision, regulation/format and client version or explicit reference-only scope. Reject missing/mismatching/stale receipts. A successful damage assertion does not check off targeting, switching, suppression or the whole move; a reference pass cannot become current-client proof.
5. Source/version/format/effective-window changes must stale dependent species, moves, items, pairs, combinations, assertions, teams and saved-result claims. Test removals, additions, same-name rule changes and a source-only pin change.
6. Fail on malformed/missing identity, wrong mod/pin, dangling joins and contradictory status. Verify all rows, not only a precomputed difference list. Preserve signed/reviewed expected-result provenance; do not regenerate goldens to pass.
7. Require reviewed semantic old/new diffs and a historical snapshot before promotion. The official completeness subgate must remain unresolved when expected official sets cannot be independently established. Zero approval rows means no enrolled proof, not zero legally usable moves.
8. Demonstrate the update path end-to-end: discovery → immutable candidate → bidirectional reconciliation → dependent invalidation → tests/review sign-off → later workbook snapshot. Existing manual export and scheduled metadata collection do not prove this chain.

Implemented now: deterministic semantic data, seven source hashes, immutable snapshot comparison, explicit unknown legal/client claims, basic duplicate/count checks, source-change review queue. Partial: provenance validation, stale propagation, coverage labels and interaction linkage. Not implemented/proven here: item/Pokémon exports, official completeness, combination completeness, trusted-base enrollment and end-to-end seasonal promotion.

No active checkout, CI settings, production, live DB or expected golden answers changed. Fetch/build/dependency operations were confined to audit workspaces. The only unresolved external action is fresh complete official evidence retrieval; all code controls completed.
