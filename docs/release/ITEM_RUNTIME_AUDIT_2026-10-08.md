# Item Runtime Audit

## Evidence Boundaries

On October 8, the inventoried official M-C notice was read again:
https://champions-news.pokemon-home.com/en/page/816.html . Its effective window
includes today; it prohibits duplicate held items but is not an exhaustive item
or learnset list. Do not convert that omission into an illegal-item verdict.

The repository's pinned Showdown checkout remains
`efe4948570d5e8189751792136d26e71710c6c66`. Read `data/items.ts`,
`data/mods/champions/items.ts`, and `sim/pokemon.ts:ignoringItem` there.
The current evidence is not a newly approved M-C package. No automatic sync,
eligibility promotion, database write or private team publication occurred.

## Item Inventory

| Item | Expected reference behavior | Runtime/test status |
| --- | --- | --- |
| Electric Seed | Matching terrain consumes it and raises Defense; airborne holders can activate; Unburden follows actual consumption | Existing terrain/Unburden lifecycle tests rerun |
| Shuca Berry | Halves a qualifying super-effective Ground hit, then consumed; respect protection, Substitute and suppression | Existing 18-case lifecycle suite rerun |
| Magnet | Electric-type base-power modifier 4915/4096 with game rounding | Active/consumed/Klutz and actual damage regression added |
| Miracle Seed | Grass-type base-power modifier 4915/4096 | Same type-booster regression; not an unconditional final-damage multiplier |
| Sitrus Berry | At half HP or below, restores floor(max HP/4); no activation after KO; consume once | Existing runtime verified directly; Klutz defect repaired |
| Raichunite X | Reference stone maps Raichu to Raichu-Mega-X; Champions mod marks it available | Source row exists, but runtime transition is not yet wired through approved CHAMPIONS_MEGAS |

These item names are a mechanics inventory, not a published user team or an
official eligibility certification.

## Confirmed Repair

`_heldItemTypeBoostMod` and `Pokemon.applyItem` ignored Klutz while terrain seed
and Shuca paths already checked it. Four of the first five new tests failed
before the repair. Two localized guards now suppress these effects without
discarding held items or altering registered sets. The six-test suite also
checks actual Magnet/Miracle Seed damage, reactivation after Klutz is removed,
one-time berry consumption and Sitrus thresholds. Lum/Oran/Mental Herb share the
same trigger guard; this does not certify all of their other interactions.

## Remaining Work

- Raichu-Mega-X constructor probe keeps the Mega name and Electric Surge before
  and after `megaEvolve`; the runtime table lacks the transition row. Do not
  claim that successful draft import proves correct base stats or terrain timing.
  Bind the existing candidate row to reviewed source and test base ability,
  Mega stats, stone ownership and turn-of-transformation terrain activation.
- General Magic Room/Embargo suppression is not implemented by this patch.
  Inspect all item callbacks before claiming universal item parity.
- Independent actual-action review reproduced Lum failing to consume after
  Spore locally while the pinned reference consumes it. This is a separate
  missing status hook, not caused or solved by the new Klutz guard.
- Choice Scarf, Power Herb and Focus Sash still contain direct item-effect
  checks without Klutz guards. Follow up with action-level regression fixtures.
- Sitrus update timing outside direct damage (residual HP changes and ability
  changes), Ripen/Cheek Pouch interactions and cross-item exchanges need broader
  independent parity evidence. These are audit gaps, not newly proven failures.
- Keep #232 open for the exact M-C package approval. Eligibility, implementation
  and sprite presence remain separate checks.

## Release Proof

Candidate: v2.2.195-item-suppression. Six focused regressions pass; related item,
seed, Shuca, Unburden and Mega suites pass. Independent review reran 6/6 and
cleared the narrow fix, with actual-action Sitrus/Oran/Mental Herb controls
against the pinned reference. It independently confirmed Raichu's missing row,
null megaForm and false megaEvolve return. Full release gate and deployed proof
are recorded in the release PR, not assumed from local tests.

Local full gate passed 203 fast + 12 offline/mock DB files, four helpers skipped.
The cache version was corrected during that run; final release-manifest checks
were rerun separately (11/11), along with roadmap freshness. Hosted CI will run
the exact committed revision. No live DB verification or user battle is claimed.
Remaining item activation/suppression work is tracked in #235; Mega readiness
is recorded on #232. Final HTML SHA256:
`7a8187aaf14c2616da2a2597aeec60e62829f7bf286df5ddce54bede9fc3c878`.
