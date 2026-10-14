# M-C Mega candidate preparation — October 14, 2026

## Scope and baseline

Separate draft from verified main `d8daf0b69eddda11dc486a1ed7afa4ffa138a636`; no merge, deployment or competitive package promotion requested. PR267 Pages38620609539 passed, and HTTP verification at19:08:33UTC still matched the v210 bundle and all external assets. Current live receipt: [V210_LIVE_2026-10-14.md](V210_LIVE_2026-10-14.md).

Pinned reference: `efe4948570d5e8189751792136d26e71710c6c66`; compiled fingerprint `fb67973e517fbe62d28ea922a2ca3fd737e3da848843ceae254cd2f72c648489`. Source and compiled cleanliness are checked before generation. Official roster remains262 review-only identities; current-client full-team evidence and exact-package human approval remain absent.

## Changes and discovered boundaries

- Generate22 review-only descriptor candidates in `poke-sim/source/reg-m-c-mega-descriptor-candidates.json`:19 previously missing forms and3 legacy aliases. Exact registered form, taxonomic base, stone mapping, stats, types, gender, ability, weight and legacy differences are recorded. The catalog is outside browser/runtime assets; every row has `execution_enabled:false` and `competitive_use:false`. Executable reference descriptors remain the same three forms.
- Female Meowstic Mega incorrectly inherited male Prankster and omitted Competitive because the generator used taxonomic `baseSpecies`. Use exact `changesFrom`/`battleOnly`, corroborated by stone mapping. The resulting reference artifact changes exactly one species ability pool. Eternal Floette and female Meowstic retain their own registered identities.
- `resolveMcMega` previously recognized only form strings beginning with Mega. Recognize gender-prefixed M-Mega/F-Mega so a canonical name cannot avoid the missing-lifecycle rejection. This tightens only the explicit M-C reference path.
- Legacy female Mega Meowstic has base stats74/48/76/83/81/104, while the pinned Mega has74/48/76/143/101/124. Candidate evidence records this discrepancy; historical `data.js` is untouched. Canonical female Mega import also remains blocked by its existing legacy stone-name mismatch. Do not fix that by routing into the incorrect legacy descriptor.
- Independent source review found the initial audit compared too few identity fields. Full-record and packet-context comparison plus candidate-file fingerprint now reject altered IDs, gender, abilities, aliases, stats and approval flags. Mutation regressions and repeat review passed.

Engine source, historical tables, approved mirror/overrides, rulesets and saved histories are unchanged. A fresh cache/build identity binds the changed reference asset; no old record is relabeled. Candidate coverage is reported separately from runtime coverage: **19 execution gaps and3 alias activation gaps remain**, despite22 prepared records.

## Validation

- `npm test`:222 fast files +12 offline DB files passed;4 manual/helper files intentionally skipped. Log: task-local `project-gate-v211.log`.
- `npm run test:source-truth` and `npm run test:battle-audit`: passed, exit0. Battle audit retains partial/open families; no universal accuracy assertion.
- Five candidate tests pass, including malformed mappings, exact-form ability pools, candidate nonactivation and audit mutation controls. Related draft import/execution/registration tests pass; all are included in the aggregate.
- `node tools/verify-mc-mega-candidates.cjs`:22 source-backed descriptor records pass independent field assertions against the pinned Dex. This is metadata evidence, not ability/lifecycle parity.
- Repeated reference/candidate generation is byte-identical. Source syntax and `git diff --check` pass. Final manifest checks12/12 include preserving candidate catalog bytes under all Windows Git newline modes. No separate lint/typecheck scripts exist.
- Browser desktop `browser-replay-QUYcTR`:2 games,3 pairs,18 pair-turns,1373 observable checks; touch390px `browser-replay-mp0RUx`:2 games,3 pairs,12 pair-turns,993 checks. Zero mismatches/page errors. Light/dark390/1440px screenshots retained. Official M-C remains blocked, valid reference runs retain matching downloads/provenance, invalid short roster rejects, and actual female canonical import rejection is retained. Six comparisons include repeated continuity captures;30 pair-turns are not30 unique turns.

Earlier failures remain explicit: first candidate regression reproduced the missing Competitive ability. A provisional Floette test incorrectly assumed Symbiosis was absent; pinned source shows it present and the test now asserts that actual pool. One sandbox manifest run could not initialize its temporary Git checkout; the same check passed under the complete host aggregate. First desktop/touch browser attempts (`E9STck`/`VGEVkb`) timed out expecting canonical female Mega import; the importer correctly rejected the unresolved stone alias. The final scripts assert that actual rejection instead of claiming an executable female Mega.

Independent source review closed its audit-field finding; independent release review passed12 manifest checks and verified all six browser pair hashes,2366 observable checks and zero mismatches. Its verdict supports the separate draft only, not activation or deployment.

## Artifact identity and remaining work

Candidate build `v2.2.211-mega-candidates`, engine1.1.18. Bundle11,533,746bytes, SHA256 `4935a86effe85691fe1924ad8e09acb73d9a054ce4102c69212bea5291765ba2`. Reference SHA256 `f4cb1251e195b57af7baabc9a591cad6f76e5f35778fa516cf71b9122acfa01c`; candidate catalog SHA256 `67e15e951a99251978fed2d51baca89ee39c67f380539acc6ab97ef1957a8b3b`.

Next implementation must prove individual lifecycle and ability boundaries before moving any candidate into executable descriptors. Unknown source availability/combination behavior stays unresolved. In particular, alias normalization must preserve Eternal Floette and Meowstic gender, and female stats must not inherit the legacy error. Eelevate, Fire Mane, Aura Guard, Emergency Exit and other relevant effect families require separate mechanical proof.

Kevin's minimum useful game recording remains version/platform/context, complete six-member sets, actual acceptance and four participants/two leads; isolated rejection/selector checks can follow. Public roster, form evidence, dates, item clause, Mega limit and timers need no duplicate capture. Full approval additionally needs unresolved availability/mechanics evidence, independent review and named human sign-off on the final immutable package digest. This draft is not that package. Live DB, real-device Safari and candidate deployment were not run. Known Strategy-heading contrast remains outside this change.
