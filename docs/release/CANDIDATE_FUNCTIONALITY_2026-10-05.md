# Candidate functionality check - October 5, 2026

Revision 5004ee8, local port 8772, v2.2.165-mc-team-review, local roster.
Not the deployed GitHub Pages build; no live database verification.

## Observed passes

- Home Start Team Test opens Simulator.
- Simulator exposes practice and historical/review regulations with M-C explicitly
  unverified, rather than declaring competitive approval.
- One Bo1 practice battle completes: Mega Altaria versus Mega Dragonite, seven
  turns, player loss. Replay opens and contains turn states and action events.
- Replay coaching explicitly says alternatives and their outcomes are not proven.
- Set Editor opens the selected Altaria set. A draft of HP SP 99 is rejected:
  per-stat maximum 32 and total 133/66 are reported; Save is disabled.
- Cancel restores HP SP 32 and the original 66/66 spread. No draft was saved.
- Homepage news discloses three unavailable sources and cached coverage.

## Failures and unresolved observations

- Pilot Notes still say Avoid/0% after one game and display literal strong tags.
  Correct uncertainty in the replay summary does not fix this separate consumer.
- Initial observed opponent was Mega Altaria; by execution it was Mega Dragonite
  with random bring mode. Only Bo1, sample size and Run were changed by this test.
  Possible initialization/selection race; cause not established. Preserve this
  as a regression candidate, not a proven engine identity error.
- Editor/roster show Cloud Nine for Altaria; result Team Stats show Natural Cure.
  Both differ from post-Mega Pixilate as expected for different phases, but the
  Cloud Nine/Natural Cure registration discrepancy requires identity review.
- Download JSON click produced no download event within five seconds. Downloads
  has no fresh champions-turn-log file (newest matching file remains September 2).
  Browser limitation versus app defect is unresolved. Export/raw/visible pairing
  therefore NOT passed; no seed reproduction or numerical damage certification.
- The seven-turn result was inspected, but not every event compared against raw
  or exported evidence. Do not count this as a fully audited accuracy sample.

## Release status

PR195 is mergeable following reconciliation. At this check, hosted syntax,
bundle freshness, cache bump and experimental M-C reference checks pass; Test
Suite is pending and Supabase Preview skipped. Local full gate passed 187 fast
and 12 offline DB files, with four manual/helper skips. Existing release gates
remain; this browser test does not approve deployment.

Next: reproduce the selection transition, preserve actual selected ability
through result reporting, and repair the export/paired-evidence path before
expanding battle volume. Then fix small-sample Pilot Notes independently.
