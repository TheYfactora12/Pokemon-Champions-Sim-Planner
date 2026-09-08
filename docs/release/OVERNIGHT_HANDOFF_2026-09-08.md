# One-Time Overnight Handoff

Session: September 8, 2026, starting approximately 00:04 Eastern and ending at
08:00 Eastern. This document is updated during work; it is not final clearance.

## Completed Evidence

- Inherited-pool audit reproduced seven actual helper/pinned set-validator
  disagreements. Shared move validation must select Champions pools explicitly;
  a historical learnset match is not sufficient. Census and exact probes live in
  `poke-sim/reports/champions_move_pool_alignment_2026-09-08.md`.
  v159 hosted CI/cache/bundle checks passed. No deployment or new legality approval.

- v159 fixes the v158 screenshot findings: contradictory LEGAL shortcut and
  narrow roster text. Five browser viewport/input checks inspect 16 cards each,
  with working Details controls and no simulations. Full gate passes 172 fast
  and 12 offline/mock DB files, four skips; two additional paired browser games
  match all three captures. v158 hosted CI/cache/bundle checks passed;
  bring-four label/out-of-bring contrast remains open. See
  `poke-sim/reports/team_review_clarity_2026-09-08.md`.

- v158 runtime consumer fixes align roster types/starting Speed and Eternal
  Flower alias lookup. Six focused tests pass; battle audit completes 4,500
  games and three goldens. Two browser games/three visible-export pairs agree.
  Full gate passes 171 fast and 12 offline/mock DB files, four skips. Mobile
  inspection found roster text compression and Unknown ruleset/LEGAL conflict;
  both remain follow-up work, not accepted UX. See
  `poke-sim/reports/roster_runtime_validation_2026-09-08.md`.

- Later form review resolves the two initial identity gaps: Vivillon-Fancy and
  Floette-Eternal. The 235-row review artifact now binds official visual evidence
  and source asset hashes. All mapped baseline stats/types/ability slots/numbers
  match pinned Champions. Still no human approval, learnset or live DB proof.
  v157 full gate passes 170 fast and 12 offline/mock DB files, four skips;
  local version/roadmap smoke has zero page errors and starts no simulations.
- v153 `e2bc816` passed hosted CI after Perish Song fixes. v154 `d61a441` removed
  hidden startup games, fixed replay contrast/mobile overflow and added requested
  matchup/continuity browser contracts. v155 `28454d9` withdrew unsupported
  decision-audit advice; v156 `9ad8b89` removed generic template overclaims.
  All three hosted CI/cache/bundle checks passed. Latest local gate: 169 fast,
  12 offline/mock DB files, four skips. Dated reports retain paired browser
  evidence and uninspected failed-run remainder. No deployment.

- v151 / 6a88c4e: corrected official M-B extension, captured 235 unique roster IDs,
  exposed duplicate/incorrect visual-ledger entries. All hosted checks passed,
  including Battle Audit; Supabase Preview skipped. No deployment.
- Review-only mapping: 233 baseline identity candidates, two unresolved forms.
  Official IDs, labels and National Dex number must agree. Unknown forms and
  label drift fail closed; duplicates cannot collapse into one target silently.
- All 16 Mega records agree with pinned Showdown Champions fields and stone-owner
  mappings. Executable tests retain the no-promotion boundary.
- Independent reviewer found same-Dex form substitution and CRLF false-drift gaps
  in the initial mapper. Parent reproduced substitution, fixed both boundaries,
  and added executable isolated-CRLF plus changed-source-fingerprint regressions.
  Reviewer rechecked both fixes and reported no remaining findings in that scope.
  Final local `npm test`: 163 fast files and 12 offline/mock DB files pass; four
  manual/helper skips. This batch changes review tooling, not deployed runtime.
  Pushed as `3763b4b`; hosted run `34186299163` passed the test suite and battle
  audit. Bundle freshness and cache checks also passed; no deployment.

## Mechanics Candidate

Spite/Substitute and sound-move boundaries exposed incorrect expectations in an
existing test. New side-swapped reference probes drove shared Substitute bypass,
Soundproof, Spite defense gates, and Eerie Spell secondary suppression fixes.
Independent review then reproduced reflected Spite versus Good as Gold and
Eerie Spell versus Shield Dust/Covert Cloak disagreements. These are being fixed
with additional regressions; this batch is locally verified, not publicly released.
A knockout fixture was invalid because Choice Specs locked its first-turn Splash;
that is a harness defect, not evidence of a battle-engine failure. Corrected it
and the old Taunt expectation after pinned reference checks. A second reviewer
found Protect/Taunt/Encore and Soundproof/Parting Shot gaps; shared guards now have
80 passing reference probes. Independent final review closed its findings;
Perish Song's older countdown/per-recipient immunity needs the next bounded
investigation. Final artifact gate passed 164 fast and 12 offline/mock DB files,
with four manual/helper skips. Local version and
roadmap browser smoke passed without starting any simulation.

## Next Mechanics Investigation

v152 was pushed as `1088607`; hosted CI `34188336064` passed. No deployment.
Perish Song follow-up v153 has 22 passing probes after reproducing early faints,
missing recipient defenses, countdown reset, concealment and terminal result
defects. Independent final review is clear in scope. Full gate passed 165 fast
and 12 offline/mock DB files; battle audit passed 4,500 games and three unchanged
goldens. Local version smoke passes. Hosted CI and paired replay proof remain.
See
[Perish Song audit](../../poke-sim/reports/perish_song_validation_2026-09-08.md).

## Dependency Intake

Fresh candidate `npm audit` reports 11 affected packages (one critical, six high,
two moderate, two low), not the same counting unit as GitHub's 16 advisory alerts.
Several suggested automatic fixes downgrade the pinned Showdown oracle to 0.9.2;
do not run `npm audit fix --force`. Scope dependency paths and compatible fixes
first. No dependency or lockfile change has been made in this intake.

## Remaining Priority

1. Obtain human approval of the exact 235-row identity candidate and complete
   field/learnset/rules evidence. Review-only form reconciliation is now recorded.
2. Prove complete M-B team legality and Champions-specific moves/mechanics rather
   than mistaking roster membership or baseline field agreement for complete truth.
3. Extend full-battle and paired visible/exported-log comparisons; preserve honest
   coaching and uncertainty boundaries.
4. Provision or identify approved isolated staging, test shared-write containment
   and two-user isolation, then obtain production approval. No live writes tonight.
5. Triage dependency alerts with compatibility evidence; keep this separate from
   source approval. Never inherit the known-bad visual ledger into M-C.

## Release Boundary

Only tested candidate commits may go to PR #195. No merge, Pages deployment,
Alfredo push, production DB mutation or competitive regulation promotion is
authorized by this session. No defensible 99% game-accuracy claim exists yet.
