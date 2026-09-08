# One-Time Overnight Handoff

Session: September 8, 2026, starting approximately 00:04 Eastern and ending at
08:00 Eastern. This document is updated during work; it is not final clearance.

## Completed Evidence

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

## Dependency Intake

Fresh candidate `npm audit` reports 11 affected packages (one critical, six high,
two moderate, two low), not the same counting unit as GitHub's 16 advisory alerts.
Several suggested automatic fixes downgrade the pinned Showdown oracle to 0.9.2;
do not run `npm audit fix --force`. Scope dependency paths and compatible fixes
first. No dependency or lockfile change has been made in this intake.

## Remaining Priority

1. Verify Vivillon 0666-018 and Floette 0670-005 exact form identities with official
   visual/client evidence. Review all candidate aliases before promotion.
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
