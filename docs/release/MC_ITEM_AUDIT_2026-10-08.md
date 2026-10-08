# M-C Item Intake And Terrain Seed Audit

## Scope

October 8, 2026. Local candidate, not deployed and not regulation approval.
No private team or replay is included. Source-truth and mechanics are separate gates.

The existing `poke-sim/source/reg-m-c-reference-intake.json` already records
18 added items against its prior reference, with no removed/changed entries.
Electric Seed is not a newly invented item or a newly discovered record.
The browser importer still consults the older implemented item allowlist.

## Evidence

- Registry: `poke-sim/tools/champions_source_inventory.json`.
- Official notice read October 8: https://champions-news.pokemon-home.com/en/page/816.html
  confirms M-C dates September 9 02:00 UTC to December 2 01:59 UTC,
  six new Mega forms, one Mega per battle, and no duplicate held items.
  It does not enumerate the complete non-Mega held-item pool.
- The registry's pokemon.com M-C article returned only an iframe to the web reader;
  this is unavailable content, not evidence that an item is prohibited.
- Pinned reference: `efe4948570d5e8189751792136d26e71710c6c66`,
  `data/items.ts` Electric/Grassy/Psychic/Misty Seed callbacks.
  Item activation checks terrain, not holder grounding. Full eligibility approval
  cannot be inferred from those mechanics callbacks.

## Stored Reference Additions

| Group | Items | Follow-up |
| --- | --- | --- |
| Terrain seeds | Electric Seed, Grassy Seed, Psychic Seed, Misty Seed | Field activation, Defense versus Sp. Def., consumption, suppression, Unburden, switching |
| Other held items | Air Balloon, Binding Band, Eject Button, Leek, Normal Gem, Red Card, Rocky Helmet, Terrain Extender | Inventory/source review and item-specific event-order parity |
| Mega stones | Absolite Z, Baxcalibrite, Garchompite Z, Golisopite, Lucarionite Z, Salamencite | Species mapping, transformation timing and mechanics, source approval |

These are reference additions, not a claim that all were newly introduced to
the franchise or are approved in the app. Do not add them to the historical
M-A allowlist or silently overwrite earlier regulations.

## Confirmed Local Defect

`tryTerrainSeed` incorrectly rejected Flying/Levitate holders. Existing test E7
asserted that incorrect behavior. Replaced that assertion and added all four
seeds with Levitate: two tests failed before the fix, then the focused suite
passed 48/48 after removing the grounding gate. The fix changes only that
precondition; it does not promote any item or regulation.

## Remaining Release Blockers

- Audit terrain-setting hooks: the current entry path checks the entrant, not
  every active holder whenever terrain changes. Mega and mid-turn activation
  must be exercised in full battles before claiming Electric Seed support.
- Check maximum stat stages, Contrary/Simple, Klutz/item suppression, item
  transfer, consumption evidence, and Unburden reset/Acrobatics interactions.
- Resolve imported move-pool version drift separately from item availability.
- Bind official/in-game availability evidence and independent review to the
  exact seasonal candidate before human approval and runtime promotion.
- Regenerate the browser bundle under a new release identity and complete
  required full/hosted tests before deployment. Hosted import remains blocked.

No complete M-C item implementation or live-team usability claim is made here.

## Independent Review And Reproducibility

Read-only reviewer Popper approved only the grounding correction, finding no
new regression in that diff. Independent synthetic probes confirmed all four
seeds on Start/TerrainChange for Flying, Levitate, capped stages, Klutz,
Embargo and Magic Room: 48/48 passed in the pinned reference.
The reusable command is `node poke-sim/tools/check-terrain-seed-reference.cjs`;
it asserts the exact reference pin and canonical compiled fingerprint.
The implementer reran it successfully. These are reference event probes, not
48 app parity tests or complete games.

Review confirmed three pre-existing app gaps: active holders miss terrain-change
dispatch, suppression is not respected, and the log claims a raise at +6.
The reference consumes a seed at +6 without raising the stat; retaining it
would be an incorrect repair. Keep each boundary open until regression-tested.

Candidate build is v2.2.186-terrain-seed-grounding. Initial broad checks exposed
stale generated bundle bytes/CRLF size and the case-count assertion after adding
one partial matrix entry. Regeneration and explicit case-count update fixed
the focused release-manifest (11/11), audit-system and security-reporting (4/4)
checks. A complete final gate is required before merge; no hosted claim yet.

## Follow-Up Candidate

Branch fix/terrain-seed-change-dispatch, based on the unchanged PR224 revision:
all four Surge abilities and Seed Sower now dispatch to living active seed
holders on both sides. Bench/fainted holders are excluded. Seed effects use
the shared stage helper (Simple/Contrary); consumption is logged separately,
so +6 does not produce a false raise. Klutz blocks activation.

Nine red regression cases became green; tests/terrain_seed_lifecycle_tests.js
now passes 11 cases including 20 one-turn synthetic doubles entry simulations.
These exercise holder/setter slot orders and opposite sides, not legal teams or
complete-game parity. General ability suppression, Embargo/Magic Room lifecycle,
item transfer, Unburden reset and approved seasonal eligibility remain open.
The original findings above are historical; this follow-up is not yet deployed.

Independent follow-up review found a lethal-hit bug in the new dispatch:
Seed Sower can run with zero HP before faint finalization sets alive=false.
The helper now also rejects hp<=0. A retained actual battle regression confirms
the victim keeps its seed while the surviving holder activates. Focused suite:
13/13, including 20 entry variants and one lethal-hit battle. The original
pre-fix 11-case count above is retained as history. Broader final gate is rerun
after this repair; no pre-repair gate is represented as final approval.

PR224 grounding-only revision f7ce7cf passed hosted CI, including Battle Audit,
and merged as 9b7e0404b7790cfa918d3a850b66e6ea23473ad7. Pages run37824723588
was in progress at this checkpoint. Follow-up v187 is separate and not deployed.
