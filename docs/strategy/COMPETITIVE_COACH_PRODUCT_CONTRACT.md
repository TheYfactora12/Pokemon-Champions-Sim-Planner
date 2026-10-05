# Competitive Team Coach Product Contract

Agreed direction: October 5, 2026. Scope: doubles first, local/no paid API.
This is a product and acceptance contract, not a claim of shipped capability.

## Promise

Help players build, understand, test and improve a team they can explain and
pilot. Coach the construction process, not only completed battles. Never promise
the perfect team, a tournament title, or superior accuracy without measurement.

Build -> validate -> test -> inspect -> explain -> change -> retest -> practice.

## Adaptive Coaching

Begin with the player's preferred core, experience, playstyle and target format.
Guide roles, win conditions, speed control, defensive coverage, move/item choices
and stat benchmarks. Offer alternatives with tradeoffs rather than one universal
best choice. Ask for missing constraints; withhold unsupported legality claims.

Advice is conditional on team version, selected four/leads, opponent assumptions,
format, approved regulation fingerprint, engine/data versions and available
battle evidence. For turn advice include HP, status, field, stages, PP, items and
revealed information. Unknown opponent information stays unknown; no omniscient
coaching disguised as player knowledge.

Invalidate stale advice when any relevant input changes. Display what changed,
why the recommendation changed, evidence IDs and uncertainty. Recompute only
affected analysis; never reuse another team's identity. If inputs are unchanged,
deterministic rules should not produce arbitrary new advice.

Each recommendation needs: proposed change, reason, supporting evidence,
assumptions, downside, expected benchmark and a test the player can run. A proposed
benefit is a hypothesis until measured. Sample volume alone cannot prove confidence.
The explanation layer cannot change mechanics, approve legality or mutate rules.

## Competitive Landscape

First-party pages inspected October 5, 2026; feature descriptions are not
independent accuracy benchmarks or market-share rankings.

- [Pokemon Showdown](https://pokemonshowdown.com/): team building and online
  battles, with replay and calculator resources. Treat as a baseline/reference
  and practice complement, not an engine we are assumed to outperform.
- [Pikalytics builder](https://pikalytics.com/team) and
  [calculator](https://pikalytics.com/calc): usage-informed sets, team building,
  damage and field-condition tools. An integrated builder alone is not unique.
- ChatGPT and general assistants are comparison baselines for explanations.
  We have not run a head-to-head benchmark and cannot claim higher accuracy.
- Human coaching and actual competitive play remain necessary external checks.
  LabMaus lookup timed out; no current feature claims were verified for it.

Our proposed distinction: a guided, versioned team experiment in one place,
with reproducible battles, exact team context, inspectable evidence, comparison
history and coaching that changes for a documented reason. This must be delivered
and validated, not merely advertised. ChatGPT could also use reliable tools;
the advantage must be the evidence and workflow, not the absence of an LLM.

## How To Prove Value And Accuracy

Separate five scores: legality correctness, mechanic/reference agreement,
replay fidelity, recommendation quality, and user task success. No blended 99%
claim and no raw battle-count proxy.

Predeclare a benchmark: format/ruleset/date, reviewed source coverage, fixtures,
opponent policies, retained seeds, pass criteria and exclusions. Compare candidate
sets on matched conditions/seeds; retain uncertainty and rare failures. Test on
held-out archetypes and different opponent policies to expose simulator exploits.
Enumerate bring/lead options within a fixed legal team where tractable; do not
claim exhaustive search over all possible legal teams or battle continuations.

Before claiming advantage over a general assistant, run the same blind tasks
with the same evidence, specified model/tools/date and independent domain review.
Score factual errors, illegal suggestions, unsupported claims and practical
usefulness. Include human/in-game checks where Showdown is not Champions proof.
Player success measures: can they build a valid team, explain a tradeoff, inspect
a loss and test a change? A ranking gain is not automatically caused by our tool.

## Ordered Delivery

1. Close beta journey blockers: mobile editor, reliable evidence retrieval,
   save/import round trip and paired live replay checks.
2. Complete approved format coverage and named mechanics/source gaps.
3. Add one bounded build-coaching slice: one team weakness, two alternatives,
   legal/unknown labels, evidence, downside and retest action. No live LLM required.
4. Add context invalidation regressions for team/stat/item/move/format/opponent
   changes, stale datasets and incomplete replay evidence.
5. Evaluate held-out matchups and beginner/competitive player comprehension.
6. Expand only after measured value; feedback becomes reviewed tests/releases,
   never automatic production learning.

Existing roadmap evidence-brain milestone owns coaching. Release #103, Strategy
#209 and mobile #211 remain existing blockers, not replaced or closed by this plan.
