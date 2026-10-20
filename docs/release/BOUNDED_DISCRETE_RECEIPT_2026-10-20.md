# Bounded discrete-damage receipt

The move-register workflow can export a separate bounded assertion table:

`node poke-sim/tools/generate-move-support-audit.mjs --register --bounded`

Add `--check` to verify an existing export. This does not regenerate or upgrade historical move inventory snapshots. The assertion table retains `implementation_coverage: unverified`, unknown client verification and `competitive_use: false`.

The first enrollment is `DAMAGE-ROLL-DISCRETE-016.tackle-vector.v1`: level-50 Hardy, zero-EV Snorlax Tackle into Venusaur, no critical hit, 16 explicit RNG bucket midpoints, Champions doubles custom format. The expected damage vector is `[30,30,30,31,31,31,31,33,33,33,33,34,34,34,34,36]`. Exact teams, actions, seed, RNG controls and per-bucket observations are retained with the contract.

The local simulation is executed using raw source bytes authenticated against the *retained audit's hashes* for commit `146ba91093ad9c0c3c3b7e675850e2e0f5f57475`. The separately loaded upstream is source pin `9b136a8c8cdb860a8ab96fa063f906604e352547`, compiled fingerprint `de66162a28b270bdf17ea17a804a7ec65c6d2f286815ae17eaa3336273405f61`. Original focused report, audit receipt, sampler script/results, discrete test log and compiled-reference check are copied without alteration.

This is provenance consistency, not cryptographic author authentication. The source audit independently corroborated the original case; the new capture translates it into structured local/reference observations. The capture adapter is not itself independently audited. The independent report's 4,096-point sampler grid and 45 boundary checks remain linked supporting evidence, not additional enrolled assertions.

The enrollment loader requires the fixed engine/data/test inventory. Raw copies of these audited sources must match the original audit receipt; their LF-canonical hashes must reproduce the captured dependency identities. Rewriting both result envelopes to current dependency hashes cannot change this historical binding. The reference commit and compiled fingerprint must agree with the independent audit, and exported move IDs must match the structured actions. Runner/checker hashes identify the local adapter only.

`historical_execution_status` describes the immutable captured comparison. `status` compares its contract, inputs and dependency hashes with current enrollment/source identities. Engine/data/test/runner/checker changes invalidate current status without deleting the historical result. The reference target is the explicitly enrolled pin/fingerprint, not an automatically discovered newest upstream. Changing that target requires review and a new capture.

No PRNG-sequence equivalence, full damage pipeline, whole-move correctness, complete legal combinations, current-client parity or competitive readiness is established. A current engine change can therefore leave a historically passing assertion stale. Do not relabel it as current positive evidence until retested.

Reproduction uses `tools/capture-discrete-assertion.mjs UPSTREAM AUDIT_DIRECTORY`. It requires the retained `retest-146ba91` checkout, original audit files, and the independently fingerprinted compiled reference. If the reference resolves dependencies through `NODE_PATH`, point it at the existing locked project `node_modules`; do not install or modify upstream as part of capture. The source index is a reviewed enrollment list, not a verifier-key registry.
