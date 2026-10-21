# Independent current bounded-enrollment retest

Exact target: `6dd24ce93eb0fe829fbc909b6b830aa6f94136e5`, isolated detached `retest-6dd24ce`.

**Verdict: the six enrolled bounded cases reproduce, dependency/review controls pass, and the historical assertion remains stale. One new capture-adapter input-validation defect survives.** It does not invalidate the six original slot-zero outcomes or certify broader mechanics/client accuracy.

## Medium — discrete capture ignores serialized target selection

Location: `poke-sim/tools/bounded-runtime-capture.mjs:19`, `:55` and `:76` (`validateInput` and the local/reference discrete branches). Local execution constructs the attacker and defender from `teams[0].members[0]` and `teams[1].members[0]`; reference execution similarly uses active slot zero. Neither branch uses the serialized action's target slot.

Independent control: take the healthy discrete case and change all 16 action `targetSlot` fields from 0 to 1. Leave expected values unchanged. `captureCurrent` still accepts and emits passing local/reference results for Venusaur in slot zero:

`[30,30,30,31,31,31,31,33,33,33,33,34,34,34,34,36]`

A separate direct upstream calculation using the specified slot-one Blastoise yields:

`[25,27,27,27,27,27,28,28,28,28,28,30,30,30,30,31]`

Both adapter paths share the wrong fixed-target assumption, so their agreement does not detect the contradiction. The six stored cases use slot zero and reproduce correctly. This control generates an unreviewed capture; it does **not** bypass the existing enrolled review's input hashes or promote that new capture to the sheet.

Reproduce with `node current-replay.mjs` and the locked dependencies/reference checkout. Full mutated input, independent vector and emitted capture files are retained in `current-retest-evidence/replays.json` and `adversarial-target/`.

Acceptance: either implement supported actor/side/slot/target selection from each serialized action, or reject every action configuration outside the fixed case before executing. Add negative controls for unsupported target, actor, side and bucket mapping. Keep the original healthy vector. The contradictory input must not emit a passing capture merely because both adapters ignore the same field.

## What passed

- Focused suites: **111/111** with the exact external reference enabled. This includes seven reference/capture checks beyond the 104 local-only total; counts overlap other probes and are not accuracy percentages.
- Re-executed all six stored inputs against the candidate source and independently fingerprinted Showdown `9b136a8c8cdb860a8ab96fa063f906604e352547`. Structured expected, local and reference observations agree with the stored results.
- Generated six fresh captures with new actual timestamps and separate result envelopes in isolated artifacts. They were not enrolled or substituted for the reviewed captures.
- Genuine mismatch control: White Herb initial Special Attack +5 against expected +3 fails specifically on both `special_attack_stage` observations. This confirms the capture path detects a mismatch when it executes the changed input.
- All **23 declared dependency-file mutations** make all six current rows stale. Included engine, rules, legality, generated data, reference target, fixture, capture runner and both bounded checker/dispatcher modules. The loaded local VM module list is entirely covered by the declared inventory.
- Documentation-only changes preserve dependency identity and current passes. The supplied fixture performs an actual temporary Git documentation commit; independent read interception agrees. All loaded runtime module bytes, normalized to LF, match the retained fd3d00a runtime baseline despite the later evidence/documentation commits.
- Wrong item label, whole-move/client scope, future date and omitted dispatcher reject. Invented verified/competitive index flags do not override computed status or unknown-client/false-competitive output.
- Structured review tests catch missing/duplicate cases, changed independent observations, missing evidence roles and hash mismatches. Review, receipt, inputs, contract and both result observations are compared per assertion. This remains consistency and independent rerun evidence, not cryptographic author authentication.

## Export and provenance

Export identity `b4cf484e54d6552f996047a97a5d53cb8c9e4846d16d5082924addfd0940ecfa` reproduces with `--check`. All CSV fields match the loader's seven JSON rows. There are **six current `passed_declared_scope` rows and one historical `stale` row**. Current entries retain `bounded_assertion_only`; client verification is unknown, competitive use false, and regulation/client-version scope null.

The six cases cover only: exhausted-PP Struggle damage/recoil, grounded Rest rejection in Electric Terrain, an Encore queued-move replacement, one-reserve Red Card replacement, White Herb stage clearing, and the 16-draw Tackle damage vector. Red Card and White Herb item labels are derived from inputs and independently bound to review decisions. They do not check off whole moves/items or complete legal teams.

All **59 recursively referenced artifacts** are tracked, present and hash-matched. Original execution/review times and fresh rerun times are retained separately. The reviewed capture time is `2026-10-20T19:52:20.596Z`; review time is `2026-10-20T19:52:49.418Z`. Runtime source attribution remains fd3d00a, with per-file dependency identity deciding freshness rather than Git HEAD alone. Reference raw-source and compiled fingerprints were recalculated before reruns.

The dependency checks verify the declared capture/runtime/checker inventory. They are not a full installed dependency-tree or arbitrary transitive-module execution attestation. The retained review's replay script calls the same capture adapters, which is why the independent direct target calculation above matters.

## Deliverables and limits

Scripts: `current-replay.mjs`, `current-invalidation.mjs`, `current-artifacts.mjs`. Raw results: `current-retest-evidence/`. Machine receipt: `current-receipt.json`.

No full unchanged mechanics audit, actual browser run, hosted CI certification, production or DB action was performed. Hosted run 39488540970 is outside this receipt. Prior foundation findings retain their original scope. No active implementation checkout, settings or enrolled artifacts were modified. Approved fetch/install/offline test execution completed; no operation remains pending or uncertain. A mistaken workspace-root invocation of the export command was rerun successfully from the isolated project directory and was not treated as a product failure.

No repository behavior/policy change was made by this audit, so no improvement record was created. Next highest-value repair: reject or honor unsupported discrete action targets, then retest the exact new capture adapter without broadening the six existing claims.
