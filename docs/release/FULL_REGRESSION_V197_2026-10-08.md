# v197 Regression Audit - October 8, 2026

## Decision

Not signed off for trustworthy competitive recommendations. Broad automated
checks pass, but adversarial probes reproduce mechanics defects. No percentage
of overall Champions accuracy is established. Official M-C approval remains
separate in TheYfactora12/Pokemon-Champions-Sim-Planner#232.

Frozen runtime: 2327af5c38cf4390bedafd33f9f4ecc786184dea, same tree as main
1b446e3b8b25b08239636e16d2dbd25f0a85792e. Live v2.2.197-reference-replay-order.
HTTP alignment at 2026-10-08T22:20:05Z passed HTML and four external assets.
HTML SHA-256: b4fcd664f24b1cc3c84042d5ce1a0b09a07ff13de458059693471039a6d8f04f.

## Gate Results

| Gate | Result and boundary |
| --- | --- |
| Project gate | 205 fast files and 12 offline/mock DB files passed; 4 helpers skipped. Not live DB verification. |
| Battle audit | Passed declared scope: 5 covered, 8 partial, 2 gap families; 18 covered, 27 partial, 5 open edge cases. |
| Accuracy harness, initial | FAILED: missing-regulation:champions_mc_reference. Preserve original log. |
| Accuracy harness, repaired | Added experimental, non-promotable reference manifest row and real-catalog contract test. 2,312 doubles + 2,312 singles battles; zero state/validator/repeat failures or validator warnings. 34 repeat checks per format. Not legality or complete-game parity proof. |
| Showdown reference | Six targeted probes agreed; zero complete reference games. Catalog intake: 33 unsupported and 1 rejected per M-A/M-B format. Unsupported does not mean illegal. |
| Live phone navigation | All 11 sections navigated at 390x844; Sources document width 552 vs viewport client width 385. Others had no document-wide horizontal overflow in observed initial states. Not exhaustive interaction/accessibility approval. |
| Live results | Column semantics wrong: D shows average turns, Avg Turns shows average Trick Room turns. |
| Independent audit | Read-only reviewer reproduced Mega admission and item failures below. |

Private local evidence under poke-sim/artifacts/: full-regression-v197-project.log,
full-regression-v197-battle.log, full-regression-v197-accuracy.log,
full-regression-v197-accuracy-retest.log, full-regression-v197-reference.log,
full-regression-v197-mobile.json and full-regression-v197-mobile-sources.png.
Accuracy report: accuracy-2026-08-30/cross-format/. Reference run:
showdown-reference/2026-10-08T22-24-01-148Z/.
Do not publish private team registrations or replay evidence.

## Findings In Priority Order

1. P1: mc_review.js literal -Mega guard accepts normalized lower-case
   raichu-mega-y. A reference battle starts already at Mega stats/No Guard,
   with no transformation lifecycle. Canonical Raichu-Mega-Y rejects.
   Canonicalize identity before lifecycle validation; test case variants.
2. P2: base-plus-stone imports can admit without evolution. Raichu/Raichunite Y,
   Dragonite/Dragoninite, Clefable/Clefablite, Charizard/Charizardite X reproduce
   megaForm:null and megaEvolve false. Resolve supported forms and reject
   unsupported lifecycles explicitly, not silently.
3. P2: known item failures persist (#235). Klutz Choice Scarf grants speed;
   Klutz Power Herb consumes/skips charging; Klutz Focus Sash prevents KO.
   Direct Spore leaves Lum holder asleep without consuming. Independent pinned
   efe4948 comparisons are isolated actions, not complete doubles parity.
4. P2: live matchup matrix labels misrepresent statistics. Headers have D and
   Avg Turns while corresponding cells contain average turns and average TR
   turns. Regress header-to-cell semantics, including draws.
5. P2: Sources mobile tables overflow. Constrain tables within scroll containers
   and test portrait navigation, long hashes and labels.
6. P2, repaired locally: accuracy manifest drift escaped the fast gate because
   its contract tests used synthetic catalogs only. Real-catalog test added.

## Remaining Boundaries

No new interactive battle batch was started in this audit. Earlier v197 evidence
of 14 downloaded games / 67 paired visible turns remains historical evidence,
not a new browser run. The fresh 4,624 battles are headless invariant checks.
No live database, two-user isolation, native-device, or full accessibility audit.
No changes to engine, official rules, saves, runtime assets or production.
HTML has only 522 bytes of budget headroom; do not relax the cap to hide growth.

## Next Work

Fix canonical Mega admission first with adversarial fixtures, then base/stone
lifecycle resolution and item suppression/activation. Correct result columns
before team-strength interpretation. Keep official approval and security open.
Each runtime repair needs focused proof, required hosted gates, deployment and
affected live-flow verification before its ticket closes. This audit's harness
change alone does not require a new site build because runtime bytes are unchanged.
