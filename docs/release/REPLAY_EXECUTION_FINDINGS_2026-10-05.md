# Replay execution follow-up

## Evidence

Local browser v168, one Bo1 doubles game, Altaria versus Dragonite, seven turns,
seed `488025329,881064892,2379955491,990516553`: turns 5 and 6 showed Pixilate
Hyper Voice failing against Basculegion as Normal. No paired download was
obtained for this run; it is a browser finding, not a successful paired audit.

Local browser v169, one Bo1 doubles game, same teams, five turns, win, seed
`3616500366,698525933,2313990126,3317420372`: exact downloaded file found in
Downloads despite the automation download timeout. SHA-256:
`61d3ca3d4c1484c6081fef217bce2f540d196db5c66c08692b1649867e662ec6`.
The file preserves execution engine 1.1.12 and practice-only regulation policy.
All five visible turns were inspected against exported event text: move order,
damage amounts and endpoints, faint/replacement events and rain expiry agree
in that bounded manual comparison. Repeated Protect messages are collapsed
by the visible renderer; this is not a full-event or full-board comparator pass.
The earlier v168 game remains unpaired. No claim of every field inspected.

`audit-qa-downloads.mjs` independently counted one valid replay, five turns,
ten damage events and four effect events. Initially it falsely warned about
missing execution identity because it ignored the single-export provenance
envelope. The schema-specific fix removes that false warning while rejecting
missing envelope fields, unknown schemas and conflicting top-level identity.
The re-audit reports `scoped_checks_pass`, not game accuracy or release approval.
Generated full AI evidence, per-match report and player report remain local
under ignored `poke-sim/artifacts/download-audits/<sha256>/`.

## Fixes

- Download fallback was appended to hidden Simulator progress. It now appears
  in the active tab. Folder-save notices and browser links are replaced with
  the correct element type rather than retaining stale URLs or a span.
  The regression failed before repair and passed afterward. Browser visibility
  changed from false to true; an actual matching file was retrieved.
- Execution checked immunity before ability type conversion, unlike damage
  preview. Engine 1.1.13 shares effective type and power resolution across
  execution gates and calculation. Pixilate, Aerilate, Refrigerate and Dragonize
  no longer falsely encounter Normal immunity after conversion. Pinned
  Showdown exclusions prevent conversion/boost of Weather Ball, Terrain Pulse
  and other type-owning moves; active Tera Blast remains excluded.
- Fourteen retained conversion tests cover both sides, repeated seeds, mixed
  spread targets, correct event types, one power boost, registered Cloud Nine
  Mega/non-Mega execution and conversion exclusions. Nine of the original ten
  assertions failed before the fix. Independent read-only review accepted the
  bounded change and reran eight Mega/control probes against pinned Showdown
  0.11.11 plus 79 modifier/exclusion vectors. Random damage values are not
  asserted identical between engines; this proves the type/immunity boundary.

## Checks And Limits

v169 full gate: 189 fast files plus 12 offline DB files passed. v170 full gate:
190 fast files plus 12 offline DB files passed again after the final test-only
extensions and standalone audit-schema correction. Four manual/helper files
skipped. v170 battle audit passed
including 4,500 games; partial/gap families remain unproved.

v169 replay viewport checks: 390x844 portrait and 844x390 landscape had no
document horizontal overflow and the fallback remained visible. Portrait
screenshot inspected. This is not a completed mobile choose/edit/run journey
or final v170 visual proof. Desktop viewport restored afterward.

GitHub checks for b8f02a3/v168 passed test suite, battle audit, syntax, experimental
M-C team check, bundle freshness and cache bump. Supabase Preview skipped.
These checks do not cover the newer v170 candidate or establish live DB
security. No production deployment or Alfredo synchronization performed.

## Still Open

1. Turn 0 uses the post-Mega first-turn snapshot. Preserve a true immutable
   starting snapshot and label old evidence accurately; do not move existing
   pre-action timing without checking speed/order consumers.
2. Full visible/export board comparison, repeated-event fidelity and final
   mobile core journey.
3. Current regulation approval: documented sources exist in
   `poke-sim/tools/champions_source_inventory.json` and
   `poke-sim/source/reg-m-c-source-review.json`. The package explicitly remains
   `needs_review`; captured roster identity reconciliation, in-game boundaries
   and reviewed mechanics evidence are not equivalent to source availability.
4. Authorized live DB security/ownership proof, exact-revision hosted review,
   production artifact verification and rollback. Sync Alfredo last.
