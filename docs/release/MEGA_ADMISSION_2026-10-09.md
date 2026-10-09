# Canonical Mega Admission - October 9, 2026

## Scope

Repair the admission/construction mismatch from #241, only in experimental
M-C reference mode. This is not official M-C approval or complete Mega parity.
Baseline: main 4b2e4c2 (v199 plus automated news updates). Candidate: v200.

## Failure And Repair

Regression tests first reproduced lowercase Raichu-Mega-Y being admitted and
unsupported base Raichu/Raichunite Y not receiving a lifecycle error.
Admission now uses the same canonical species and mirrored stone mapping as
construction. Existing supported descriptors enter as base forms and evolve;
missing descriptors explicitly reject. Charizard X/Y remain distinct.
Saved registrations are not rewritten; ordinary modes keep prior semantics.

Independent review found a null stone metadata crash; a non-null guard and
regression now cover it. Existing Dragonite/Clefable descriptors can resolve
base-plus-stone registrations; their individual ability/weight parity is not
newly established. Form-sensitive aliases and missing descriptors remain open.

## Evidence

- Focused reference suite: 11/11, including case/ID/whitespace aliases,
  both-side rejection, base/stone selection, delayed evolution, one evolution
  per side, unchanged registration, wrong stone and policy quarantine.
- Battle audit passed its declared fixtures and 4,500 seeded stress battles.
  This is not 4,500 oracle comparisons. Transformations downgraded to partial:
  4 covered / 9 partial / 2 gap families; 18 covered / 28 partial / 5 open cases.
- Initial project checks failed during development. The later sole failure
  was the old hard-coded audit count; updated to reflect the disclosed downgrade.
  Final full project and hosted gates are recorded in the PR, not presumed here.
- Local browser imported a synthetic four-member base Charizard/X team, ran
  one three-turn reference game and downloaded its JSON to Downloads.
  Seed: 1097780393,3021429490,2513223523,1545647898.
  All 24 exported log-type event texts appeared in the expanded visible replay.
  Evolution and Tough Claws were present, and actor identity retained base slot.
  Damage/event semantic correctness beyond this scope is not established.
- That sample also exposed a possible Fake Out/action-denial issue, recorded
  separately in #249. Successful execution is not full-match accuracy proof.

## Release And Remaining Work

No source rows, official approval, database access or user teams are changed.
Bundle budget retained; adjacent historical comment prose shortened only.
Follow existing PR/CI/Pages gates, compare artifact and live affected flow,
then append deployment receipt to the PR. Rollback target is reviewed v199.
Keep #241 open for descriptor/alias completeness and #232 for exact-package
approval. Next mechanics work includes #249 and item suppression in #235.

All issue numbers refer to TheYfactora12/Pokemon-Champions-Sim-Planner.

## Verified Deployment

Final local project gate passed, with offline/mock DB checks only. PR250 merged
as 287c4e4804ab5c82ecee82556d4d363c24d72461 after required CI37929018619.
Pages37929506718 passed. HTTP artifact checks passed 2026-10-09T12:25:45.177Z.
Fresh live browser ran a six-turn synthetic game and retrieved its JSON.
Seed: 237452163,3434968491,1613702333,4246864003. Of 41 log-type events,
36 appeared verbatim; one Hurricane miss and four Leftovers heal rows matched
the equivalent formatted UI wording/amounts. This is presentation and lifecycle
evidence, not full battle correctness. [Receipt](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/pull/250#issuecomment-6080865766).
