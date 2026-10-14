# M-C reference Mega lifecycles — local v212

## Scope and publication boundary

Continuation of [v211 descriptor preparation](MC_MEGA_CANDIDATES_2026-10-14.md) on `audit/mc-mega-descriptors`, draft [PR268](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/pull/268). This implements experimental reference execution; it does not approve the official M-C regulation, modify historical species data or deploy a release. Verified live v210 remains unchanged.

The reference is Showdown commit `efe4948570d5e8189751792136d26e71710c6c66`, compiled fingerprint `fb67973e517fbe62d28ea922a2ca3fd737e3da848843ceae254cd2f72c648489`. Source cleanliness and compiled identity are checked by the inventory verifier. All competitive eligibility flags remain false.

## Implemented behavior

- The 19 missing Mega lifecycles now have executable reference descriptors: Sceptile, Blaziken, Swampert, Mawile, Absol-Z, Metagross, Staraptor, Garchomp-Z, Lucario-Z, Scolipede, Scrafty, Eelektross, Pyroar, Malamar, Barbaracle, Dragalge, Golisopod, Falinks and Baxcalibur.
- Three canonical/legacy form pairs resolve consistently through draft import, admission and construction: Eternal Floette and male/female Meowstic. The exact registered form comes from `changesFrom`/`battleOnly` corroborated by the stone mapping, rather than taxonomic `baseSpecies`.
- Female Mega Meowstic uses 74/48/76/143/101/124 in reference mode. Its starting form retains Competitive when explicitly registered. The legacy historical descriptor (74/48/76/83/81/104), saved input names and team identities are preserved.
- Reference-only ability paths add Lightning Rod immunity/redirection, Speed Boost residual stages, Sharpness fixed-point power, Fire Mane offensive-stat modification, Aura Guard resolved-contact reduction, global Fairy Aura, Eelevate grounding/KO boosts, Thermal Exchange and Emergency Exit. Tough Claws moves to the correct fixed-point base-power phase. Trace excludes pinned `notrace` abilities, samples eligible targets, retries on entry/update and preserves the evolved ability through switching.
- The original offline candidate packet remains immutable preparation evidence. It cannot independently activate a missing or disabled runtime descriptor. Runtime descriptors have a separate execution flag; official M-C remains blocked.
- `mc_review.js` is a synchronous external script at its former initialization position, already present in the PWA cache and Pages staging. It and the reference asset are required by the staged hash verifier. LF attributes and Git clean/checkout tests bind committed bytes. The 11 MiB bundle cap is unchanged.

## Evidence and limitations

- `verify-mc-expanded-megas.cjs`: **88** pinned doubles comparisons (22 forms, both sides, immediate/delayed activation); exact base/active identities, stats, ability, types and HP over two Protect turns. These are lifecycle probes, not complete battle parity.
- `verify-mc-mega-abilities.cjs`: **78** pinned comparisons covering selected damage modifiers, Aura Guard Long Reach/Protective Pads/Mold Breaker, global Fairy Aura/nonstacking/Aura Break, Speed Boost, Thermal Exchange, Lightning Rod immunity/redirection, Trace exclusions and Eelevate KO stages, plus Emergency Exit threshold/berry/KO boundaries. Synthetic fixtures bypass team availability deliberately; they are mechanics evidence only.
- Offline regressions: **69** expanded identity/lifecycle checks, **33** ability checks, **15** draft import tests, **11** reference execution tests and **5** candidate isolation/mutation tests. Existing lifecycle 15 and remaining-effect 74 checks also pass. The Trace regression performs actual Mega evolution, pivot and re-entry on both sides.
- Initial complete host aggregate: **224 fast files + 12 offline DB files**, zero failures; four manual/helper files skipped. Source-truth and battle gates passed. No standalone lint or typecheck scripts exist; changed JavaScript passes `node --check`.
- Final frozen artifact aggregate, expanded battle manifest and browser receipt are recorded below after completion. Source-truth and battle gates were rerun successfully after the final Trace and display corrections.

Independent source review found four omitted historical Floette aliases; all are now covered by import tests. Mechanics review reproduced stale Trace bookkeeping across Mega evolution and re-entry; clearing it at evolution plus both-side actual-switch regressions closes that defect. A final mechanics review also reproduced premature recursive Trace entry causing double Intimidate; an own-entry marker and both-side pinned regressions close it. Display review found the admitted female alias lacked a type and sprite; exact display aliases and a type-only fallback now cover both genders without changing stored names or historical stats. Release review reproduced CRLF working bytes differing from the LF bytes Git would commit; normalization plus clean-filter-aware checkout tests closes it.

Earlier failed attempts are not counted as proof: adding the named partial coverage case required reconciling the explicit audit inventory count (55 to 56), after which its contract tests passed. the first fast sandbox run had obsolete Sceptile rejection assertions after intentional activation and two sandbox temporary-Git permission failures. The assertions now prove successful lifecycle plus explicit disabled-descriptor rejection; host checks pass. The damage oracle initially omitted upstream ModifyMove/TryPrimaryHit events, then exposed the real Long Reach/Aura Guard mismatch; the corrected oracle and implementation pass. The final aggregate also detected the QA baseline source fingerprint stale after sprite aliases changed data.js; the generator refreshed that report, with all seven baseline tests passing. A Trace re-entry fixture initially selected a different bench Pokemon; an explicit speed-control move makes the intended re-entry deterministic without changing engine selection.

Remaining uncertainty includes simultaneous Emergency Exit crossings, wider recoil/residual/multi-hit combinations, arbitrary copied-ability timing and exhaustive ability suppression interactions. These are not certified by the named passing probes. Current-client full-team/format evidence and exact immutable-package human approval are still required for official M-C promotion. Live DB and real-device Safari remain untested. No paid service or unrelated project change is included.

## Frozen artifact

- Build: `v2.2.212-mega-lifecycles`; engine `1.1.19`.
- Bundle: 11,529,171 bytes; SHA-256 `b0f56899b20001e2e9b2e17cd187bd269262f1ca37aca5bc592d34a245e26885`.
- Reference: SHA-256 `9b2262a492e6320816edfd1e482386c597eacbbcfccf9860cbd05d18d283c630`.
- External reference helper: 15,102 bytes; SHA-256 `30c577d7a5d278a5752a748994c42e618b85eedd361b615267f2eacd0404a5e7`.
- All external assets are bound in `poke-sim/generated/release_artifact.json`.

Final frozen battle gate passed (75 RUN entries including both new Mega files, golden traces and seeded matrix). Manifest 12/12 and load order 4/4 pass. Desktop `browser-replay-H5VHpM`: two games, three pairs, 50 pair-turns, 3,421 observable checks. Touch390 `browser-replay-eavnw1`: two games, three pairs, 25 pair-turns, 1,833 checks. All six comparisons have zero mismatches/page errors; both offline reloads loaded v212 and the external reference helper. Repeated continuity captures are included in pair-turn/check counts. Female legacy import succeeds, official M-C still rejects, and reference battles retain stable identity through evolution and replay/export. Screenshots and raw downloads remain in those local artifact directories.

Final frozen aggregate: **224 fast files + 12 offline DB files, zero failures**; four manual/helper files skipped. Log: `project-gate-v212-complete.log` in the local checkout (ignored). Final source-truth and battle logs are `source-truth-v212-closed.log` and `battle-audit-v212-closed.log`. Independent mechanics and release reviewers closed their Trace/display findings on these final bytes. Previous PR268 hosted checks passed only for e9edd92; new local changes require their own hosted checks before publication. No merge or deployment is authorized by this report.
