# Expanded team matrix and draw reporting

## Scope

The unchanged registered user team was loaded from its retained v204 replay.
M-C reference practice remains unverified, not official competitive evidence.
PR262's documentation CI passed and the PR was merged before this work.

## Repeatable engine diagnostics

- 34 bundled teams plus the registered user team checked; 13 accepted, 22
  excluded by current reference admission. No excluded set was silently altered.
- 100 deterministic seeds per ordered accepted pairing, plus 360 ordered
  bring-four variants per six-member team against rotating opponents.
- Final report `team-variations-1791935658495.json`: 21,580 primary battles,
  247 exact reruns, zero checked invariant failures and zero Rock Head flags.
- All 21,580 were terminal; 103 ended by the engine timer; zero hard-cap
  truncations. This describes engine outcomes, not real-game timer parity.
- Checks cover participant identity/count, registered items, bring order,
  damage HP accounting, deterministic repeats and persistent input mutation.
- Independent review found summaries counted before validation and omitted
  terminal classification. Both were repaired before repeating the batch.
  Initial report `team-variations-1791935417763.json` is superseded for summary
  classification, not erased. Both reports retain source/harness hashes locally.

This is not every joint selection, action sequence or RNG outcome. First ten
seeds overlap earlier evidence; repeats and reruns are not independent samples.
Default headless picks and browser selections differ. Their win rates must not
be pooled or interpreted as controlled side swaps or competitive rankings.

## Browser evidence

Live v204: 100 Bo1 per 16 browser-loaded opponents, 1,600 games. Browser
inventory includes additional locally saved/reference teams not in the static
harness catalog. Selected player bring: Raichu, Bellibolt, Sneasler, Arcanine.
Observed win counts include Altaria 30/100, Dragonite 96/100, Houndoom 84/100,
Rin Sand 56/100, Juan Benitez 32/100, rain Meganium 79/100, Gengar sand 29/100,
Floette/Aerodactyl 27/100. These are policy-specific diagnostic outcomes only.

Downloaded nine-turn sample seed 2829975504,1015822683,472777528,1774196600:
50 log messages accounted for (47 verbatim, three equivalent Protect-failure
rows). The other 1,599 games were not individually visually inspected. The
sample shows Fake Out selected into Armor Tail: mechanical blocking is logged,
but action-policy quality needs further review before team-strength advice.

Local v205: 16 one-series matchups completed with eight consistent columns.
Six-turn sample seed 3919172489,2056935793,3326267048,48663530: all 32 log
messages accounted for (26 verbatim, two formatted Imprison failures and four
formatted Grassy Terrain heals). Local series/bring settings differ from live;
these are UI checks, not a comparable competitive batch. Uninspected games
remain outside visual proof. Raw private replays are retained locally only.

## Fixes and release gate

1. Actual live draw: 65 wins plus 34 losses in a 100-game row omitted one draw.
   v205 adds D after L and updates loading colspan to eight. A renderer fixture
   executes the real row template with 65W/34L/1D and checks every cell.
2. Windows checkout converted generated HTML to CRLF, causing local manifest
   drift. Normalizing LF exactly matched the approved hash. Pin generated HTML
   to LF; regeneration restored HTTP alignment without weakening byte checks.
3. Audit harness supports bounded configurable seed count, hashed helper and
   phase-separated validated summaries with terminal/timer/truncated counts.

No battle-engine, legality, database or user-team changes. Candidate v205;
hosted CI, deployment and live draw-column verification must pass before closure.
General suppression, other mechanics/source gaps and official M-C approval
remain open. Large simulation counts do not establish game accuracy.

## Hosted verification

PR263 merged as `d2cd77678f138307476c651a04cd092db22e12ed` after all required
PR checks passed, including battle audit (CI38487226759). Pages38487715884
passed. HTTP provenance and assets matched at 2026-10-14T00:04:40.665Z
(October13 local time). No live database-security claim.

Structured visible/export comparison additionally passed 651 observable-field
checks on the nine-turn v204 live sample and 457 on the six-turn v205 local
sample. Zero discrepancies; exact hidden stats, all repeated same-name action
multiplicity and independent real-game mechanics remain outside this proof.
Narrow390x844 local matrix shows D without overlap; wide table is contained
in a horizontal auto-scroll wrapper. Desktop eight-column layout inspected.

Move-choice quality and selection-provenance follow-up is tracked in #264.
Do not combine different selection policies into one team-strength score.

Post-deployment v205 browser batch completed 100 Bo1 per16 included opponents;
Run All returned enabled. Every row sums W+L+D to100. Nonzero examples:
rain Meganium77W/22L/1D; Floette/Aerodactyl22W/76L/2D. Aggregate997W/600L/3D
is descriptive of this selected policy/opponent set, not a calibrated rating.
The 22 excluded teams were not simulated or declared legal. No user sets edited.
Downloaded sample seed1170107274,1088310494,3062691367,100752621 passed396
observable-field comparisons across five turns, zero discrepancies. Other1599
games were not individually visually audited. Screenshot retained locally as
`v205-live-matrix.png`; runtime and UI changes are now deployed verified.
