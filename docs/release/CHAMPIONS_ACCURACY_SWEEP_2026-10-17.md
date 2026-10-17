# Current Champions accuracy sweep

## Decision and scope

No-go for claiming game-accurate public Champions simulation. This decision is
separate from publishing the small v216 feedback link. A preview disclaimer or
passing reference tests does not satisfy the requested accuracy standard.
No numerical 99% confidence estimate is supported by a sampling/error model.

Inspected baseline: `4b18b0656ebcf7d9bf77754fcadab633fdbe7cde`, engine 1.1.20.
The v216 UI release changes no engine, legality, reference or source-data bytes.
Independent read-only battle and season reviewers examined the current inputs.
No source package was promoted and no mechanics repair was attempted here.

## Primary game evidence versus reference evidence

[Nintendo update history](https://www.nintendo.com/en-gb/Support/Purchases-Subscriptions/Games/How-to-Update-Pokemon-Champions-3079895.html),
read October 17, identifies client v1.2.2 (October 7). The September 9 v1.2.0
changes include removing Pound from Politoed, removing Mirror Coat/Metal Burst
from Archaludon, enabling Slash and changing Wish/Strength Sap maximum PP to 8.

Six complete six-member fixtures with natural abilities and explicit bring-four
were checked through application admission, and the runtime PP function was run:

| Case | Default Practice | M-C reference practice |
|---|---|---|
| Politoed / Pound | Admitted, stale | Rejected |
| Archaludon / Mirror Coat | Admitted, stale | Rejected |
| Archaludon / Metal Burst | Admitted, stale | Rejected |
| Archaludon / Slash | Rejected by older pool | Admitted |
| Clefable / Wish | Admitted; 12 PP, stale | Admitted; 8 PP |
| Vileplume / Strength Sap | Admitted; 12 PP, stale | Admitted; 8 PP |

These are application admission/runtime checks, not observed game-client battles.
Default practice/editor uses the older pool (`rulesets.js` practice context).
Proposed repair: version the current-practice data against official patch changes,
preserve historical pools, and add admission/PP regressions before release.

[Official M-C notice](https://champions-news.pokemon-home.com/en/page/816.html)
confirms September 9 02:00 through December 2 01:59 UTC, one Mega per battle and
the duplicate-item restriction. The 262 captured roster identities and Showdown
pin `efe4948570d5e8189751792136d26e71710c6c66` are reference intake, not complete
game-mechanics proof. Complete primary evidence for per-species training pools,
stat math and accepted/rejected game teams remains missing. The fixed-IV and
32-point assumptions must not be called independently game-proven.

The latest three regulation-watch runs inspected failed. The newest, September
30 [run 36756395700](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/actions/runs/36756395700),
failed its required-source-completeness gate. Monitoring is not established healthy.

## Admitted gameplay and advice limitations

- **Fly:** M-C admits Dragonite / Inner Focus / Fly in a complete roster. With
  seed `[3,7,11,13]`, one turn, it damages Charizard immediately and then takes
  Surf. The pinned Champions reference instead emits preparation and no first-turn
  Fly damage. The engine charge registry omits Fly/Bounce/Sky Drop while admission
  does not exclude them. This is an admitted unsupported path, not an illegal
  ability injection. Current-client evidence still must anchor any replacement
  implementation. First add a permanent regression, then implement the complete
  lifecycle or reject unsupported execution until it is verified.
- **Switching:** the action queue chooses moves/targets, not voluntary switch
  actions. Existing helpers cover pivots/forced effects. This omits a fundamental
  player decision and prevents realistic whole-match strategy claims.
- **Simultaneous Mega weather:** admitted Charizard/Charizardite Y versus
  Abomasnow/Abomasite, Hardy zero points, all Protect, seed `[3,7,11,13]`, evolves
  player then opponent. Swapping sides changes final weather snow to sun. The
  speed/RNG comment does not describe cross-side execution. Current Champions
  ordering needs primary/client proof before choosing a repair; side sensitivity
  is demonstrated, but no guessed alternative order is declared correct.
- **Policy:** full registered-state greedy selection can inspect unrevealed
  opponent moves/abilities. Competitive strength is explicitly unverified.
  Matchup outcomes are model experiments, not human win probabilities or proof
  of optimal team recommendations.

The earlier Turboblaze/Teravolt Inner Focus reproduction uses illegal sets. Four
natural holders and the two illegal Liepard abilities are rejected in M-C;
the legal Prankster control is accepted. Do not equate that synthetic finding
with the admitted Fly workflow. The original nine priority failures are repaired.

## Evidence denominators and limits

- Family manifest: 15 total, 4 regression-covered, 9 partial, 2 gaps.
- Edge matrix: 57 total, 18 covered, 34 partial, 5 open.
- Inventory: 123/134 shipped moves have declared regression coverage; 84 curated
  abilities are modeled. These counts do not enumerate all legal interactions.
- Current scoped battle audit passes: deterministic family suites, three golden
  battles and 4,500 curated matrix battles without JS errors. These are regression
  and invariant checks, not actual-game outcome agreement.
- Accuracy runner: 2,312 doubles battles, zero state/validator errors or warnings;
  34 repeat checks, zero failures. Another 2,312 singles runs/34 repeat checks are
  isolated shared-mechanics evidence, not doubles interaction coverage.
- Independent season reviewer: 13 harness cases (including 18 selection and eight
  execution assertions) plus 27 M-C import/registration/execution cases passed.
- Local v216 touch flow: two games, three Download JSON/visible-DOM pairs,
  21 paired turns, 1,576 observable checks, zero mismatches/page errors. The loop
  supports importing, selecting four/two leads, running and inspecting exports;
  this does not prove the battle model or every coaching recommendation correct.

The reference comparator can report agreement with exact-HP comparison disabled
even when Fly prepares in one engine and damages in the other. The raw-log
damage-presence predicate exposes this; comparator success alone is insufficient.
Production database persistence and full real-game parity were not tested.

Next highest-value work: fix current-practice patch drift and close admitted
unsupported move execution using game-backed fixtures, then design and verify
voluntary switching and policy-information boundaries. These need a separately
authorized repair slice; the feedback-link release does not silently include them.
