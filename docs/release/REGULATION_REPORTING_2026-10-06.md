# Regulation Reporting And M-C Gates

## Bounded Fix

v184 candidate follows live audit #221. Team cards reuse the selected regulation
result used by Simulator and Set Editor. A review-only lane can report malformed
input or unsupported roster size while retaining its approval gap. No historical
species/item/learnset validator is run as a fallback for M-B, M-C or unknown
future regulations. Missing original registration is unknown; provenance labels
do not describe selected-regulation approval. Strategy's statement that its
report does not assess legality remains intentional.

## Incremental Regulations

Reuse verified baseline evidence only for unchanged scope and pinned inputs.
Each season needs explicit additions, removals, changed restrictions, effective
dates and immutable approval identity. Do not inherit approval from a parent.
Historical results retain their original version. This release does not add a
new regulation inheritance engine or modify eligibility data.

## M-C Evidence Check

On October 6 (America/New_York), the official notice was re-read:
https://champions-news.pokemon-home.com/en/page/816.html
It states September 9 02:00 UTC through December 2 01:59 UTC, one Mega Evolution
per battle, no duplicate held items, and 20-minute total / 7-minute player /
45-second turn / 90-second preview timers. It does not enumerate the complete
eligible move, item or Ability inventory. No rule data was promoted by this read.

Existing intake: REG_MC_INTAKE_2026-09-09.md. Unclosed gates remain exact
Maushold/Squawkabilly form evidence, full inventory reconciliation, complete-team
accepted/rejected fixtures, new Mega mechanics proof, explicitly versioned
M-B/M-C reference routing and exact-package human approval. General approval to
fix the site is not approval of an unreviewed regulation fingerprint.

## Proof And Exclusions

18 focused regulation tests and 7 badge tests passed locally and in independent
review. Browser testing caught stale cards on selection change; independent
review caught the saved-selection restoration path. Both now have refresh
regressions. Local browser confirms the single-member import displays roster
failure together with the M-C approval gap after changing regulation. Cases include
malformed/undersized imported teams, retained source gaps, unknown future lanes,
no historical item rejection in review lanes, and no team mutation. Full gate,
review and deployment proof will be recorded in the release PR. This is not
battle parity, live DB validation or competitive legality certification.

Separate #221 work remains: stale Sources/roadmap metadata, Review claims,
Replay Log empty state, and a broader source-specific legality result contract.
