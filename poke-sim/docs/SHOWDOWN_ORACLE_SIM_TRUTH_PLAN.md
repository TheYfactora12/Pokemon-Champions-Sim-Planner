# Showdown Oracle Sim Truth Plan

> Status: active execution plan.
> Last reviewed: 2026-06-19.
> Purpose: group simulator truth work into moves, damage, and engine logic using Pokemon Showdown as the executable baseline and human-reference sites as secondary checkers.

---

## Decision

The project should stop treating mechanics truth as a loose collection of notes and local tests.

Use this source hierarchy instead:

1. **Showdown simulator behavior** as the executable baseline for standard Gen 9 mechanics.
2. **`@smogon/calc`** as the targeted damage oracle for deterministic damage-range checks.
3. **Pokemon Showdown data CDN / mirrored normalized rows** as the source of truth for static move/species/item/ability data.
4. **Bulbapedia, Serebii, Game8, Victory Road, games.gg, and other human-readable references** as secondary checkers, not the primary execution source.
5. **Champions-specific overrides** only through explicit override docs, tests, and provenance.

That means:

- We do not hand-argue standard mechanics when Showdown can execute them.
- We do not silently patch local data to differ from Showdown.
- We do not let a human-reference site outrank an executable oracle for standard behavior.
- We do not let Showdown silently overrule a confirmed Champions-specific delta.

---

## Why This Split

The repo currently has two different truth problems:

- **static data drift**
  - stats, types, BP, accuracy, target, learnsets, forms
- **behavior drift**
  - damage order, rounding, protection behavior, weather, terrain, status timing, ability hooks, switching, and state transitions

Static rows alone cannot prove battle behavior. A generated move row can say `priority: 1`, but it cannot prove that our engine applies that priority in the correct phase with the correct blockers and side conditions.

So the project needs:

- a **data mirror truth track**
- a **behavior oracle truth track**
- a **Champions override truth track**

---

## Oracle Stack

### Standard Mechanics Oracle

Use Showdown simulator behavior for:

- move execution and targeting
- damage pipeline baseline
- turn order baseline
- status and weather interactions
- switch timing and state progression
- baseline ability and item behavior

Implementation target:

- `smogon/pokemon-showdown` simulator code or `@pkmn/sim` extraction for battle execution

### Damage Oracle

Use `@smogon/calc` for:

- deterministic damage-range comparisons
- modifier-order and rounding checks
- targeted unit tests where a full battle stream is heavier than needed

Do not use the damage calculator as the only oracle for:

- multi-turn state progression
- switch timing
- end-of-turn resolution
- ability callbacks that depend on battle flow

### Static Data Truth

Use Showdown data sources for:

- species stats and types
- moves, targets, flags, priority, base power, accuracy
- items and abilities metadata
- aliases and learnsets

### Secondary Human Checkers

Use Bulbapedia, Serebii, Game8, Victory Road, and similar sources to:

- confirm wording
- confirm Champions-specific published rule changes
- cross-check ambiguous findings
- document provenance in reviewer-friendly language

Use them as checkers, not as the executable baseline for standard mechanics.

---

## Workstreams

## 1. Move Truth

Goal: prove that move metadata and move execution stay aligned with Showdown unless a reviewed Champions override exists.

### Scope

- type
- category
- base power
- accuracy
- priority
- target
- flags
- drain
- recoil
- multihit
- side/field/status markers
- legality and learnset behavior

### Required outputs

- drift tests against generated Showdown move rows
- execution tests for move behaviors that rows alone cannot prove
- explicit override list for Champions-only move deltas

### First grouped tasks

1. Expand drift tests beyond priority into:
   - target
   - base power
   - category
   - type
   - accuracy
   - drain/recoil metadata
2. Build representative oracle tests for:
   - Protect-family
   - spread targeting
   - Helping Hand
   - Expanding Force
   - Weather Ball
   - status-inflicting moves with immunity rules

---

## 2. Damage Truth

Goal: make the local damage path match the documented standard baseline plus explicit Champions overrides.

### Scope

- base formula
- modifier order
- integer rounding
- crit behavior
- STAB
- type effectiveness
- spread modifier
- weather
- terrain
- screens
- Helping Hand
- burn/frostbite interaction
- recoil/drain
- Protect-reduction hooks
- Champions roll-window override

### Current repo concerns already visible

- the branch now routes damage rolls through runtime data overrides, with Champions formats using the discrete `86..100` window
- the local damage path has been tightened around stepwise modifier handling and targeted oracle coverage, but more move-by-move validation is still required
- a few damage-impacting abilities and edge cases are still not fully proven against Showdown in release-gate coverage

### Required outputs

- one canonical local damage pipeline implementation
- targeted `@smogon/calc` comparison suite for standard mechanics
- Champions override tests for intentional deltas
- explicit findings for every known unresolved mismatch

### First grouped tasks

1. Patch the local damage pipeline to match the documented order and per-step rounding.
2. Decide whether the Champions roll window is:
   - immediate patch behind `format: champions`, or
   - temporary finding gated behind release docs until replay/oracle confirmation lands.
3. Audit weather and terrain modifiers against Showdown and Champions docs.
4. Add a damage oracle matrix covering:
   - neutral hit
   - STAB hit
   - resisted hit
   - spread move
   - crit
   - Reflect / Light Screen
   - Helping Hand
   - burn physical
   - weather boost / penalty
   - terrain boost / penalty

---

## 3. Engine Logic Truth

Goal: prove that the simulator resolves full battle state correctly, not just isolated damage numbers.

### Scope

- turn order
- Trick Room
- priority brackets
- switching
- status timing
- end-of-turn effects
- weather and terrain durations
- screen durations
- ability callbacks
- item consumption
- faint/KO side effects
- spread target resolution
- log/state export consistency

### Required outputs

- small oracle battle harness using Showdown simulator behavior
- local-vs-oracle findings written to tracked artifacts
- grouped golden scenarios for shipped teams and high-risk mechanics

### First grouped tasks

1. Add a minimal oracle battle harness using Showdown simulator code or `@pkmn/sim`.
2. Start with deterministic baseline cases:
   - single-target neutral hit
   - spread move into two targets
   - Protect interaction
   - Tailwind / Trick Room order
   - burn / poison end-of-turn
3. Expand into shipped-team scenarios once the harness is stable.

---

## 4. Champions Override Governance

Goal: separate true Champions differences from local bugs and from standard Showdown behavior.

### Rules

- Every Champions delta must be named and documented.
- Every Champions delta must have:
  - source note
  - confidence level
  - local test coverage
  - override classification
- No hidden local behavior should differ from Showdown without an explicit override entry.

### Core override buckets

- damage roll window
- status nerfs
- Protect-related ability deltas
- custom Megas / custom abilities
- any format-specific stat/item restrictions affecting battle math

---

## 5. Release Gates

Goal: block trust claims until the proof stack is green.

Required gates before stronger readiness language:

1. source-truth suite passes
2. fast local suite passes
3. grouped move-drift suite passes
4. grouped damage-oracle suite passes
5. grouped engine-oracle smoke suite passes
6. fresh exported logs from the claimed build validate cleanly
7. every remaining high-severity mismatch is documented as:
   - `champions-override`
   - `known-open`
   - `blocked-by-evidence`

---

## Issue Grouping

Treat the work as four grouped issue streams instead of isolated bug reports:

1. **Move Truth**
   - metadata drift
   - target drift
   - move execution mismatches
2. **Damage Truth**
   - formula order
   - rounding
   - weather/terrain/screen math
   - Champions roll override
3. **Engine Truth**
   - turn order
   - switching
   - end-of-turn/state logic
   - ability/item callback correctness
4. **Override Governance**
   - provenance
   - confidence
   - release-gate classification

This keeps the work visible and stops one-off fixes from looking like full readiness.

---

## Execution Order

1. **Lock the damage path**
   - patch formula order / rounding
   - fix obvious weather/math bugs
   - write focused damage oracle tests
2. **Expand move drift coverage**
   - target / BP / category / type / accuracy / recoil / drain
3. **Stand up the Showdown behavior harness**
   - one or two deterministic oracle battles first
4. **Classify every known mismatch**
   - local bug
   - Showdown baseline
   - Champions override
   - unknown
5. **Promote into release gates**
   - CI should fail on unresolved high-severity sim-truth drift

---

## Near-Term Definition Of Done

This plan is working when all are true:

- the repo has a runnable Showdown damage oracle suite
- the repo has a runnable Showdown behavior oracle smoke suite
- damage-path disagreements are tracked explicitly, not discovered ad hoc
- every Champions-specific delta is labeled as an override, not hidden in local logic
- partner-facing accuracy language is tied to passing gates, not intuition

---

## External Baselines

- Pokemon Showdown simulator repo: <https://github.com/smogon/pokemon-showdown>
- Pokemon Showdown damage calculator repo: <https://github.com/smogon/damage-calc>
- `@pkmn` modular Showdown packages: <https://github.com/pkmn/ps>
