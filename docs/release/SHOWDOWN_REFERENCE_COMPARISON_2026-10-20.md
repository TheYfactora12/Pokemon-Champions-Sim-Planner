# Pinned Showdown source comparison

Compared installed npm 0.11.11 with official smogon/pokemon-showdown commit 9b136a8c8cdb860a8ab96fa063f906604e352547. Public raw source downloads only; no dependency changes, upstream build or upstream battle execution.

Installed Dex runtime: gen9championsvgc2026regmc exists=false; gen9championsvgc2026regmb exists=true, mod=champions, doubles. Never execute an unknown format fallback. Upstream config explicitly declares M-C doubles using champions and moves M-B to championsregmb. Both package versions remain 0.11.11; version alone is insufficient identity.

All nine initially selected source files differ; inventory.json preserves SHA256 and separate unified diffs. Source hashes are distinct from executable dist hashes and must not be compared as equivalent artifacts. Existing referenceIdentity hashes selected dist files but omits config/formats, Champions moves/conditions/abilities, inherited moves/abilities/items, battle-actions and battle-queue, among other dependency graph members.

Champions damage formula in scripts.ts unchanged in inspected diff. Sleep condition differences are optional-chaining refactors. Base Amnesia and Rest definitions are byte-identical as text blocks; no Champions override for either was found. Thus these two findings are not explained by this upstream drift.

Material deltas: Champions Encore removes manual retained-priority arithmetic and sets onOverrideAction undefined; Disable gains special onBeforeMove handling; Strength Sap/Wish gain base PP5 overrides (Champions calculatePP yields8); Curse targeting rewritten; Sheer Force/Emergency Exit lifecycle handling changes; Run Away trap handling added. Learnsets contain substantial updates. Do not extrapolate installed-reference Encore or secondary/lifecycle conclusions to this upstream commit without isolated executable retesting.

M-C upstream source declaration is verified; executable upstream M-C validation/battles were NOT run. No current-client certification is established. Initial sandbox DNS failure resolved by approved read-only network fetch.

## Pinned source inventory

Upstream source: https://github.com/smogon/pokemon-showdown/tree/9b136a8c8cdb860a8ab96fa063f906604e352547

These are source-file hashes, not built runtime identity or approval. Original downloaded files and unified diffs are retained in the isolated audit workspace.

| Source | Installed SHA256 | Upstream SHA256 |
|---|---|---|
| `config/formats.ts` | `da9c9deb1f08a7d7f97d709f067d6cb420e77cb158a0218d6b1d39e9c5102d57` | `bae366653b9e42662878e8535a65ead60248f81db9111495c9860d1a4ed35a4e` |
| `data/mods/champions/abilities.ts` | `5e370ba986e026c37b9f446cd3c40c9abf8b88a896597e1819be3755256af23f` | `5c10f24808e26605d2a104139cd25ae76cb9ba12c3cd5331e29cb70659b37bb0` |
| `data/mods/champions/conditions.ts` | `851507309dde0b58807e33b17d8ce7e607dad70893546f67bad294ad70249005` | `42f814656a23a386398fc66f20915f9d4df1dd9f23c5ad0071dc50a799faa738` |
| `data/mods/champions/learnsets.ts` | `78fc395c01406008e054f63b168fe0b4ec7f7fec6ff6454f4d14a502147d2a9b` | `826d302703358260a1c4967e2bf8edd15f1fe7e0f664c8ab14aff734906cc9d0` |
| `data/mods/champions/moves.ts` | `25060fc40be0125c47b285e8addb4bf860282d884a389158310b2f16e8c88bf5` | `7830b5386ef0aad255ec8d02f9f2d35c1b89a5ecbb44c7ecb000892127b55e19` |
| `data/mods/champions/rulesets.ts` | `31671152a6ff1f09d81a5306baadaa1593ef235e5c7cdcc9180c67bac8e84cd9` | `1184015414d7464a37d39db0bdde59ee68de0c60209e58fa13575b2530b9970e` |
| `data/mods/champions/scripts.ts` | `8282488fa630255417e8bd4d6037d45e8d382ae28cdd84c230e59b33befa5fc2` | `ad8f41b53ee4ec256e442ba9c03ffd799ebe36fdd8e6c287ae03feea8ecc4666` |
| `sim/battle-actions.ts` | `a30408e2f9a53a43333bf4a865366d6adbe26d3d91a836ba51042accce4d9437` | `9d477a6296f8916cbbbfc36ae18bb0729dfda0646e4ee1c00ccb4199661c56d4` |
| `sim/battle-queue.ts` | `cf462e9d63fa1e910608329e11fb4e5ed8a8f8215392aee48ef541518b670590` | `029c257b2a8ef4ada6c96d63319b4d2290ad3f6b4ee168b18c232e4d05b98b87` |

## Next review boundary

Prepare an isolated commit-pinned upstream executable reference only after dependency setup authorization. Validate the explicit M-C format and reject unknown-format fallbacks. Expand runtime provenance to the format definitions and inherited mechanics dependency graph; run existing and foundation probes on both references, review every changed expectation, and retain the old reference as historical evidence. Do not silently upgrade the package, retarget old goldens, or treat Showdown as current-client certification. Online game footage can supply only visibly observable evidence with recording-date, set and RNG uncertainties retained.

## Online investigation leads (not observed goldens)

Parent research identified the upstream M-C profile as tournament doubles with Open Team Sheets and six registered/four picked. It must not silently substitute for ranked registration or information visibility. Proposed upstream switch/Eject Button/Emergency Exit probes and replacement-queue ordering require executable and client cross-checks.

The October 19 ranked video https://www.youtube.com/watch?v=VpQqdykD2PU has transcript leads at 45:33–45:40 (weather/speed), 1:05:49–1:06:12 (self Volt Switch/Electro Shot), and 1:11:29 (Electric Terrain/Sleep Powder). Frames were not visually verified here. Recording date, complete sets, RNG and server behavior remain unverified; no outcome or mechanics golden derives from these leads.

## Subsequent isolated executable validation

The exact upstream archive (SHA256 ee1cc7a756e6f520f8afd4eeb97269ea66316137bfae0c70d250d6af72755f42) was transpiled outside the checkout with existing cached esbuild0.25.12/ts-chacha20; no install, package replacement or server startup. The build bypassed the automatic install entrypoint and recorded hashes for 1,080 compiled files. This was not a TypeScript/full-upstream-suite check.

Nine bounded probes executed Amnesia, Rest and ordinary Encore in installed custom, upstream custom and explicit upstream M-C. All agree: Amnesia self +2 SpD; Rest blocks turns2/3 and wakes/actions turn4 after turn1 use; Encore replaces queued Flamethrower with prior Will-O-Wisp. All final M-C six-member registrations validated and selected four under Open Team Sheets. An initial ineligible Blissey helper was rejected and replaced with eligible Venusaur. Randomized HP and Encore priority-contribution boundaries were not compared. Inputs, logs, frames and executable hashes remain in the isolated `upstream-reference-audit/executable` evidence directory. Current-client certification remains absent.
