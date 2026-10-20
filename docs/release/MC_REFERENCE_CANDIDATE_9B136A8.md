# Offline M-C reference candidate at 9b136a8

This tool prepares a new versioned reference candidate only. It does not change installed Showdown0.11.11, runtime data, release identity, the existing move register, official eligibility, or approval keys.

## Reproduce

From `poke-sim`, use the already compiled clean upstream revision `9b136a8c8cdb860a8ab96fa063f906604e352547`. Independently verify the sorted compiled JS inventory against the retained auditor receipt before supplying its digest. For the audited checkout that digest is `de66162a28b270bdf17ea17a804a7ec65c6d2f286815ae17eaa3336273405f61`. The tool compares actual bytes before loading upstream code. Historical M-B must route to `championsregmb` and M-C to `champions`.

```
node tools/prepare-mc-reference-candidate.mjs <compiled-upstream> <previous-register.json> <independent-compiled-sha256> <new-output-directory>
node --test tests/mc_reference_candidate_tests.mjs
```

If that isolated checkout uses existing locked dependencies outside its directory, set `NODE_PATH` explicitly to that installed dependency directory before starting Node. No dependency installation is performed by this tool. The receipt records the app dependency-lock hash; this is not a full installed dependency-tree attestation.

The output directory must not exist. It contains candidate.json, species/moves/items/abilities/pairs JSON and CSV tables, and a review.json with null approval. Every table row retains regulation, format, reference revision and unresolved official/client status. Candidate identity binds the previous register bytes, source/compiled fingerprints, generator/helper LF-normalized hashes, tables, differences and saved validator inputs/results. A different generator creates a different candidate; old candidates remain preserved.

## Executed receipt

Final candidate: `88c61769046f9d9165dab2e2eda3cdc282f44b53468fd8854604e54fcb36ab33`, retained under `poke-sim/reports/mc-reference-candidates/` (original generation in artifacts/).

Two full builds produced the identical candidate identity. Counts independently checked:392species/forms,537moves,166items,225abilities,23,756pairs. The available-species comparison reproduces636missing and205extra pairs against the current broad register. Broad historical catalog extras remain separate from active reference differences.

Six complete-team controls reproduce: healthy and Sirfetch'd/Meteor Assault accept; Choice Band, Venusaur/Hydro Pump, duplicate species and five moves reject. Existing parameterized intake also executes its42individual-set historical/current format probes. These are reference results, not current-client observations or proof of all legal move combinations. Thirteen new focused tests pass, including wrong pin/mod/format/fingerprint, duplicate inventory IDs, bidirectional differences, spreadsheet quoting, no-overwrite behavior, predecessor content identity and rehashed dangling joins. Syntax check passes.

The initial sandbox Git read was denied; approved offline execution resolved that access restriction. The first executable-reference attempt then lacked dependency resolution; explicit NODE_PATH to existing workspace node_modules resolved it without installation. Neither attempt generated a completed candidate. An earlier successful pre-provenance candidate remains separately retained; only the final digest above describes the final tool.

## Required review before any later promotion

Review full old/new pair differences, battle-only versus registrable forms, required stones and ability dependencies. Reconcile official removals Politoed/Pound, Archaludon/Mirror Coat and Metal Burst. Retain previous snapshot and invalidate dependent pair/interaction/team/result claims. The separate runtime M-C artifact still needs its own reviewed update and full runtime admission regression; this candidate does not repair that runtime rejection by itself.

Official completeness remains unresolved. Neither upstream availability nor the42individual probes or6complete-team controls establishes a complete official eligibility package, mechanics accuracy or current-client parity. No promotion or publication is performed.

The latest predecessor passes the strict provenance-v2 register validator; this is internal provenance consistency, not authenticated official evidence. The exact historical d2dab943 snapshot is accepted only after canonical content-identity and unique pair/move-join checks; its old schema has no embedded species inventory, and that missing species-join proof is explicitly recorded. Unknown historical identities do not receive this exception. The independent636/205delta is enforced only for the retained known pool source hash; the three official removals must be absent. All candidate rows carry explicit unknown implementation and unreviewed status plus empty assertion/test IDs.

Independent read-only review reproduced all table identities, predecessor identity, 636/205 differences, compiled fingerprint and six complete-team controls. This does not approve runtime promotion or official completeness.

Final regeneration used the frozen helper and explicit v2 predecessor path. Two complete builds produced the same d02c935 candidate digest before writing its new report directory. The six full-team controls, counts and636/205delta above reproduced. No old candidate, runtime artifact, dependency or canonical move register was overwritten.
