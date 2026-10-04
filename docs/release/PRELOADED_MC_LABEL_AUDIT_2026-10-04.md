# Bundled Team M-C Label Audit

## Scope And Evidence

Read-only legality audit on October 4, 2026. No regulation approval, team rewrite,
database change or deployment. Inspected origin/main at 95c158b and candidate
8053ba2. The source explicitly marked preloaded contains 17 teams; the full
bundled TEAMS catalog contains 34, including one custom-key entry. Source-tag
filtering alone misses half the shipped catalog.

Official current notice: https://champions-news.pokemon-home.com/en/page/816.html
states M-C runs September 9 at 02:00 UTC through December 2 at 01:59 UTC.
Fresh eligible-roster capture has 262 rows and SHA-256
122529cebbc15cd2a22c781e0fb43ca814be86a18951f1ceaf37cf65297a3627,
identical to the retained September 9 capture. Amoonguss is absent.

Complete-team reference: isolated Showdown revision
efe4948570d5e8189751792136d26e71710c6c66, format
gen9championsvgc2026regmc. Catalog names were passed as species, not nicknames;
Floette (Eternal Flower)-Mega was explicitly mapped to Floette-Mega for the
reference probe. Level 50 was explicit. Existing moves, items, abilities, SP and
IV fields were retained. Initial unnormalized alias/nickname errors were harness
errors and are excluded from the result below. No battles were executed.

## Result

Full bundled catalog: 14 reference-accepted, 20 reference-rejected. Acceptance
does not prove official complete-set legality or simulator implementation.
All 20 rejected entries carry legal or legal_inferred metadata. The 17 explicitly
preloaded entries alone contain 11 reference rejections after normalization.

| Team keys | Reference rejection |
| --- | --- |
| player, suica_sun, champions_arena_1st, champions_arena_2nd, aurora_veil_froslass | Incineroar U-turn |
| cofagrigus_tr | Dusclops, Ursaluna-Bloodmoon availability; Blood Moon |
| fire_ice_fullroom | Ursaluna-Bloodmoon availability; Blood Moon |
| perish_trap_gengar | Sinistcha non-31 IVs |
| trick_room_golurk | Farigiraf, Golurk, Torkoal non-31 IVs |
| sun_offense_charizard | Hatterene, Farigiraf non-31 IVs |
| hiroto_imai_snow | Aegislash non-31 IVs |
| swirlingroses_meganium_vivillon, kevin_meta_sun | Incineroar Knock Off |
| fabulous_sunroom | Arcanine Power Gem |
| targeted_stat_source_proof | Hatterene Recover |
| targeted_proof_legal | Kangaskhan Wish; Garchomp Tackle |
| indeedee_hatterene_tr | Amoonguss availability; Indeedee-F Expanding Force |
| rillaboom_archaludon_balance, arboliva_seed_sower_balance, pelipper_basculegion_rain | Amoonguss availability; Archaludon Body Press |

Reference wording that a species does not exist in Gen 9 means unavailable in
this reference mod, not absent from all Generation 9 games.

## Coverage Gap And Next Fix

Existing preloaded_team_legality_tests.js passes 5/5 against local validation.
That test uses the same local rules as the catalog and only source=preloaded;
it is not an independent current-regulation check. Candidate UI already uses
LEGALITY UNVERIFIED rather than treating metadata as competitive approval.
This audit did not visually recheck the live Teams page or database-loaded teams.

Next: add full-catalog, regulation-versioned reference fixtures; show separate
species eligibility, complete-set validation and regulation approval statuses.
Do not rewrite historical legality metadata as a universal M-C verdict. Preserve
team identities and surface precise member-level reasons. Approved runtime
activation and publication remain separately gated. The September reference pin
also requires current-upstream drift review before a fresh production claim.

## October 4 Implementation Follow-Up

v165 adds `mc_review.js` and a generated review-only reference asset. All Teams
cards get per-member species/move/ability/item/IV findings from current contents,
not a saved team tag. It also checks duplicate held items. This is a limited
diagnostic, not a replacement for the complete team validator or official roster
approval. Unknown identities remain unresolved; reference acceptance is never
displayed as legal. Historical team data and simulator gates are unchanged.

Four focused regressions pass. Local browser verification at port 8772 confirms
v165 and per-member warnings. Browser inspection caught a Mega starting-ability
false positive, fixed by including base-form abilities only for Mega rows.
The initial fast gate failed two files: Pages omitted the new assets, and inline
reference data exceeded the bundle size budget. Explicit staging and a hashed
external reference asset fix these without raising the size limit.
Final fast gate: 187 test files, zero failures; four manual/helper files skipped.

PR195 remains conflicting. No live deployment or current upstream/official
complete-set approval is claimed. Full private-save tests are outside this UI
change. Reproduce inventory with `node poke-sim/tools/build-mc-review.cjs` using
the pinned isolated checkout; build via the canonical Python bundle builder.
