# M-C Release Inventory - October 8, 2026

## Decision

Advance evidence intake, not full regulation approval. Candidate v198 updates
the roadmap and records all 262 official roster identity candidates. It does
not implement the remaining mechanics or remove official-mode warnings.
Official package approval remains TheYfactora12/Pokemon-Champions-Sim-Planner#232.

## Completed Evidence

- Fresh official roster readback at 22:29:54 UTC: 262 rows, unchanged source SHA
  `122529cebbc15cd2a22c781e0fb43ca814be86a18951f1ceaf37cf65297a3627`.
- Official notice https://champions-news.pokemon-home.com/en/page/816.html
  confirms current dates, Mega limit, duplicate-item restriction and timers.
  Earlier claim that the roster was available only in-game is superseded by
  the linked public official roster, not a request for another user capture.
- Parent live DOM/screenshot review and independent saved-image review bind
  Maushold 0925-001 to Maushold-Four and Squawkabilly 0931-002 to Yellow.
  Source/asset/screenshot/DOM hashes are in source/reg-m-c-form-identity-evidence.json.
- MC-only wrapper reconciles these two exact IDs. M-B mapper and its 235
  candidate rows remain unchanged. No generic numeric-form inference.
- Regenerated intake keeps all 262 mappings noncompetitive. Forty-two pinned
  individual-set validator outcomes reproduce; these are not in-game team tests.

## Inventory, Not Mechanics Certification

Run `node tools/audit-mc-release-inventory.cjs` from poke-sim. It requires clean
pinned source efe4948570d5e8189751792136d26e71710c6c66 and matching compiled
fingerprint, writes artifacts/mc-release-inventory/report.json, and never
changes runtime data. Raw mirror field differences may already have overrides;
trace effective engine behavior before calling each difference a bug.

| Reference inventory | Comparison result |
| --- | --- |
| 392 species/form rows | 388 mirrored field matches; 4 ability-field differences |
| 536 learnable moves | 463 mirrored core-field matches; 73 field differences to reconcile |
| 166 items | All names mirrored; this does not prove effects or legal combinations |
| 225 abilities | 224 names mirrored; Aura Guard missing from mirror |
| 82 Mega forms | 21 missing descriptors; 3 alias mismatches; descriptor presence is not lifecycle proof |

Four species differences: Absol-Mega-Z, Garchomp-Mega-Z, Lucario-Mega-Z,
Golisopod-Mega. Aliases: Floette-Mega and the two Meowstic Mega forms.
Reference counts include forms and are not official base-roster counts.
Earlier preliminary count of 24 missing descriptors is corrected to 21 plus
three aliases after independent review. Item name matches are not behavior passes.

## Release Work In Order

1. Canonical Mega admission and supported base-plus-stone lifecycle (#241).
2. Implement remaining Mega descriptors, base abilities, stats/types, timing and
   new ability effects with pinned oracle fixtures; preserve historical routing.
3. Reconcile 73 move-field differences against effective Champions overrides,
   then test PP, power, priority and move-specific effects in doubles.
4. Complete item consumption/suppression hooks (#235) and all new-item fixtures.
5. Bind normalized format, level, clauses, dates and remaining source evidence;
   obtain accepted/rejected complete-team evidence, then review exact package digest.
6. Human package sign-off, CI, deployed artifact checks, paired live logs.

## Verification And Limits

Ten focused tests pass after contract hardening; M-B identity test also passes.
Negative tests cover stripped evidence, wrong sprite class, changed source,
duplicate identities, missing/undefined compared fields and property-order-only differences.
Independent reviewer identified evidence-envelope weaknesses; repaired before
final review. Full project/hosted gate status belongs in the PR receipt.
No private team changed, database write, source promotion or mechanics claim.
Screenshots remain local; no third-party sprite sheets republished.
