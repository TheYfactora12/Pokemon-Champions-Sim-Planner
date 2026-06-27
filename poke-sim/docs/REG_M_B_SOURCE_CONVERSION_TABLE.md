# Reg M-B Source Conversion Table

Status: active conversion ledger, not runtime legality.

Last reviewed in repo: June 27, 2026.

Primary structured artifact: `../regmb_source_conversion.js`

## Why This Exists

Reg M-B is the active external Champion regulation window, but the simulator should not become a guessing engine. Victory Road gives strong source facts for the regulation window, Worlds usage, Mega Evolution availability, the full allowed-Pokemon image sheets, and the 16 new Mega names. It does not give this repo a ready-to-run legality table by itself.

The top-1% simulator standard is:

- Source fact goes into the conversion ledger first.
- Runtime legality changes only after the source fact becomes explicit reviewed data.
- Every promotion has positive and negative fixtures.
- Historical Reg M-A behavior stays test-protected.

## Verified Source Facts

| Claim | Source | Status |
|---|---|---|
| Reg M-B runs June 17 to September 2, 2026 | Victory Road Champion regulations | Verified |
| Reg M-B is used for in-game Ranked Battles and VGC events on those dates, including Worlds 2026 | Victory Road Champion regulations | Verified |
| Mega Evolutions are allowed | Victory Road Champion regulations | Verified |
| All Reg M-A Mega Evolutions remain allowed | Victory Road Champion regulations | Verified |
| Reg M-B adds 16 new Mega Evolutions | Victory Road Champion regulations + `NewMegasRMB.png` | Names verified only |
| Full allowed-Pokemon list exists | Victory Road image sheets `Reg-M-B-Pokemon1.jpg` and `Reg-M-B-Pokemon2.jpg` | Needs extraction |

## New Mega Name Rows

These rows are source-reviewed names only. They are not implemented Mega forms until stone names, stats, typing, abilities, sprites, and fixtures are reviewed.

| Base species | Mega form | Source label | Runtime status |
|---|---|---|---|
| Raichu | Raichu-Mega-X | Mega Raichu X | Blocked |
| Raichu | Raichu-Mega-Y | Mega Raichu Y | Blocked |
| Sceptile | Sceptile-Mega | Mega Sceptile | Blocked |
| Blaziken | Blaziken-Mega | Mega Blaziken | Blocked |
| Swampert | Swampert-Mega | Mega Swampert | Blocked |
| Mawile | Mawile-Mega | Mega Mawile | Blocked |
| Metagross | Metagross-Mega | Mega Metagross | Blocked |
| Staraptor | Staraptor-Mega | Mega Staraptor | Blocked |
| Scolipede | Scolipede-Mega | Mega Scolipede | Blocked |
| Scrafty | Scrafty-Mega | Mega Scrafty | Blocked |
| Eelektross | Eelektross-Mega | Mega Eelektross | Blocked |
| Pyroar | Pyroar-Mega | Mega Pyroar | Blocked |
| Malamar | Malamar-Mega | Mega Malamar | Blocked |
| Barbaracle | Barbaracle-Mega | Mega Barbaracle | Blocked |
| Dragalge | Dragalge-Mega | Mega Dragalge | Blocked |
| Falinks | Falinks-Mega | Mega Falinks | Blocked |

## Required Promotion Fields

Each Reg M-B Mega row must carry:

- `baseSpecies`
- `megaForm`
- `megaStone`
- `megaBaseStats`
- `types`
- `ability`
- `spriteFallback`
- `itemSourceUrl`
- `statsSourceUrl`
- `abilitySourceUrl`
- `typeSourceUrl`
- `learnsetPolicy`
- `positiveFixture`
- `negativeFixture`

## Runtime Promotion Blockers

- The full allowed-Pokemon list is still image-sheet source data, not explicit species/form rows.
- The 16 new Mega names are verified, but stone/item names are not source-promoted.
- Mega stats, typing, abilities, and sprite handling are not source-promoted.
- No accepted/rejected Reg M-B legality fixtures exist yet.
- Reg M-A historical fixtures must remain stable through any Reg M-B promotion.

## Dataset And Coaching Poisoning Guard

Ruleset data must protect downstream learning.

- `source_review` rulesets may be visible in the UI but must not be treated as legal sim evidence.
- DB analysis rows must carry `ruleset_status`, `learning_eligibility`, `data_policy`, `coaching_policy`, and `poisoning_guard`.
- Review-only runs should use `review_only_do_not_train_or_rank` until the ruleset is promoted.
- Illegal teams should use `illegal_team_do_not_train_or_rank`.
- Historical implemented lanes can remain replayable, but coaching must label them as historical so current-meta recommendations do not silently mix seasons.
- No aggregate matchup stat, Battle Sensei trend, or branch-memory recommendation should combine rows from different implemented rulesets unless the report explicitly asks for cross-regulation comparison.

## Next Implementation Slices

1. Convert `Reg-M-B-Pokemon1.jpg` and `Reg-M-B-Pokemon2.jpg` into explicit species/form rows with reviewer notes.
2. Source-confirm the 16 new Mega stones/items.
3. Source-confirm stats, typing, and abilities for each new Mega.
4. Add Reg M-B legality fixtures.
5. Only then promote runtime legality from source-review to implemented Reg M-B.
