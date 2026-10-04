# Full Team Inventory Audit

## Findings

1. Current M-C reference rejects 20/34 bundled teams. Historical legal tags are
   not current-regulation approval. See the per-team table and per-member JSON
   in `poke-sim/reports/team-catalog-audit-2026-10-04/`.
2. Live Supabase read-only inventory contains 34 builtin teams (204 members)
   and two retired legacy rows with no members. All 36 rows lack
   `metadata.ruleset_version` and use the historical champions_reg_m_doubles_bo3
   identity. No rows were written or promoted.
3. The 34 database builtin teams produce 16 reference rejections and 18 reference
   acceptances. Four apparent improvements over repository results are IV
   omissions, NOT demonstrated corrections: perish_trap_gengar,
   trick_room_golurk, sun_offense_charizard and hiroto_imai_snow. The member schema
   has no IV column; the reference defaults absent IVs. These are conditional
   reference acceptances, not proof of DB/runtime parity.
4. All 13 tournament-review teams are incomplete: their stat spreads are
   undisclosed. Some display-form names also need explicit identity mapping.
   They remain review-only; no spreads or nature values were invented.
5. No stored base-stat mismatches were found where data.js and the reference
   both resolve the member. Missing mappings are not passes. This does not
   validate effective runtime stats, form transitions or battle calculations.

## Scope And Method

83 team records, not 83 unique teams: 34 bundled, 13 tournament reference, 36 DB.
486 member records total, with repository/database duplicates. Doubles M-C
complete-team and individual-set validation uses pinned Showdown
efe4948570d5e8189751792136d26e71710c6c66. Levels default to 50 only when absent;
species names are not nicknames. The two documented Eternal Flower aliases are
normalized. Known fields are preserved and validation receives independent copies.
Missing tournament stats prevent a whole-team acceptance claim.

Official notice https://champions-news.pokemon-home.com/en/page/816.html confirms
M-C until December 2, 2026 at 01:59 UTC. The prior same-day roster readback matches
the retained 262-row SHA-256. This audit does not promote reference data to
official complete-set legality. Upstream drift review remains open.

Database project: ymlahqnshgiarpbgxehp. Only builtin/retired roster fields were read;
no private user teams or credentials were published. Raw readback is ignored
under artifacts; report records its hash. Runtime and data files have input hashes.

## Reproduction And Limits

`node poke-sim/tools/audit-team-catalog.cjs` audits checked-in catalogs.
Add the local snapshot path as the first argument to include DB evidence.
The tool fails on a wrong/modified upstream source checkout, asserts that source
teams remain unchanged, and writes deterministic Markdown and JSON reports.

No battles, browser-private imports, sprite checks, singles legality, independent
reviewer or hosted deployment were performed in this audit. Existing browser
diagnostic tests do not establish full engine accuracy. User-private teams require
an explicit export to extend this inventory.

## Ordered Corrections

1. Prevent unversioned/historical catalog tags from implying current M-C legality.
   v165 diagnostics are candidate-only, not a deployed correction.
2. Reconcile database/member stat semantics and add versioned ruleset provenance
   through a reviewed migration; do not rewrite production rows during auditing.
3. Create corrected copies of reference-rejected historical teams, preserving
   original team identity/history. Review move replacements rather than guessing.
4. Resolve tournament form aliases, retain unknown spreads and keep incomplete
   teams excluded from exact-stat benchmarks.
5. Obtain current-client evidence for source disagreements, validate immutable
   regulation data, then review and deploy a scoped release with hosted checks.
