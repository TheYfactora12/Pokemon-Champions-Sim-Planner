# LLM Brain Context

Date: 2026-07-05
Status: documentation-only context for the evidence-backed LLM Brain analyst layer

## Purpose

The LLM Brain is an analyst layer for Poke-E Sim Champion. It is not the battle engine, not an autonomous battler, and not a replacement for deterministic Pokemon Champions simulation.

The product goal is to make simulator evidence easier for players and the team to understand:

```text
existing simulator
  -> deterministic analysis tools
  -> evidence bundle
  -> mock BrainAnalysis output
  -> validation guardrails
  -> evidence-based UI cards
  -> optional DB persistence
  -> real LLM endpoint later
```

The first user-facing version should be labeled as Evidence Mode Beta. It should explain what the simulator saw and what remains uncertain. It should not claim perfect coaching, complete legality proof, or real ladder truth.

## Source Of Truth

The simulator remains the source of truth for:

- battle rules
- team legality
- Pokemon and form legality
- move legality
- damage calculation
- speed order
- move priority
- weather
- terrain
- Trick Room
- status
- abilities
- items
- targeting
- RNG
- battle outcome
- replay logs
- validation logic

The LLM Brain must never calculate damage, decide legality, invent turn order, override RNG, promote unknown Champion legality to legal, or replace `simulateBattle`.

## What The LLM Brain May Do

The Brain may explain, summarize, rank, and organize deterministic evidence.

Allowed output:

- team identity summaries
- win-condition explanations
- best lead candidates from deterministic lead evidence
- major threat summaries
- replay turning-point explanations
- recommended tests or changes with legality status
- confidence and uncertainty summaries
- evidence references for every major claim

Blocked output:

- mechanics claims without evidence IDs
- legal/illegal claims not backed by source-truth validation
- damage numbers invented by the model
- speed or priority claims not backed by simulator evidence or a clearly labeled pre-battle estimate
- replay-only observations stated as universal matchup truth
- hidden-information guesses
- high confidence when evidence is sparse or stale

## MVP Requires No New Infrastructure

The MVP should not call a real model.

The first build can use a mock brain adapter:

```text
simulator facts
  -> EvidenceBundle
  -> mock BrainAnalysis JSON
  -> BrainAnalysis validator
  -> UI cards
```

This proves the architecture before adding API keys, paid inference, Supabase Edge Functions, or any other model endpoint.

## EvidenceBundle Control Boundary

`EvidenceBundle` is the packet of facts the Brain is allowed to use. It is the main safety boundary.

Every bundle should include:

- schema version
- bundle ID
- creation timestamp
- analysis type
- regulation and format metadata
- simulator and ruleset version metadata
- input references
- findings
- uncertainty

Every finding must include:

- `id`
- `category`
- `claim`
- `confidence_prior`
- `evidence`
- `provenance`

No evidence ID means no major Brain claim.

Recommended initial files:

```text
poke-sim/analysis/schemas.js
poke-sim/analysis/evidence_bundle.js
poke-sim/analysis/confidence.js
poke-sim/analysis/provenance.js
```

## BrainAnalysis Output And Validation

Brain output should be structured JSON, not open-ended chat.

Recommended initial files:

```text
poke-sim/analysis/brain/brain_schema.js
poke-sim/analysis/brain/brain_prompt.js
poke-sim/analysis/brain/brain_adapter.js
poke-sim/analysis/brain/brain_output_validator.js
poke-sim/analysis/brain/brain_guardrails.js
poke-sim/analysis/brain/index.js
```

For the MVP, `brain_adapter.js` should run in mock mode only.

The validator must reject output when:

- evidence IDs do not exist in the bundle
- major claims lack evidence IDs
- the model invents mechanics not present in evidence
- illegal suggestions are marked legal
- sparse evidence produces high confidence
- user-supplied claims override simulator evidence
- replay-only findings are overstated as global conclusions

Confidence should be validated or downgraded by code. It should not be freely invented by the model.

## UI Direction

The MVP should not be chat-first.

Use an evidence-based panel:

```text
AI Brain Analysis - Evidence Mode
```

Initial cards:

- Team Identity
- Win Conditions
- Best Leads
- Major Threats
- Recommended Changes
- Confidence
- Evidence Used
- Uncertainty

The UI should show evidence IDs and uncertainty clearly. If evidence is missing, the UI should say that directly.

Example:

```text
Insufficient evidence: no damage matrix was available for this matchup.
```

## Privacy And Security Rules

Real LLM integration must come later behind a secure server-side endpoint. Do not call a real model directly from GitHub Pages or expose model API keys in browser code.

Treat the following as sensitive:

- imported teams
- replay logs
- usernames
- private Trainer Room data
- custom notes
- tournament preparation

Future model calls should receive validated evidence bundles or cleaned summaries, not raw user text. Raw team and replay input can contain prompt-injection text and should not be trusted as instructions.

## Supabase And Persistence

Supabase is optional persistence and audit infrastructure. It is not the battle engine and should not be required for the first Brain MVP.

Design table concepts can be drafted early, but runtime writes should wait until the evidence schema, BrainAnalysis schema, validator, and mock tests are working.

Recommended persistence order:

1. evidence schema and local tests
2. deterministic analysis contracts
3. BrainAnalysis schema and validator
4. mock brain adapter and benchmark fixtures
5. DB tables for requests, bundles, outputs, feedback, and benchmark results
6. optional Supabase/local adapter methods

Do not store unvalidated AI blobs as trusted analysis.

## Release Learning Loop

The Brain should improve through reviewed releases, not silent production self-training.

Recommended loop:

```text
app collects simulator and replay evidence
  -> users, QA, and Codex label what was useful, wrong, missing, or confusing
  -> Codex turns labels into rule updates, templates, guardrails, tests, and fixtures
  -> CI and benchmark checks prove the change
  -> a new release ships the improved Brain behavior
```

This keeps the learning path auditable. User feedback can create evidence for better prompts, templates, validators, and deterministic analysis tools, but it should not directly mutate mechanics, legality, source-truth rows, or production Brain behavior without review.

Every feedback item should eventually answer:

- what evidence was reviewed
- what the user or reviewer labeled good, bad, missing, or confusing
- which rule, template, validator, test, or fixture changed
- which release contains the improvement
- what the improvement still does not prove

## Files That Should Not Change For The MVP Foundation

Do not change these during the documentation and schema foundation slices:

- `poke-sim/engine.js`
- `poke-sim/data.js`
- `poke-sim/generated/*`
- `poke-sim/pokemon-champion-2026.html`
- `poke-sim/sw.js`
- `poke-sim/release_manifest.js`
- `poke-sim/index.html`
- `poke-sim/tools/build-bundle.py`
- `poke-sim/supabase_adapter.js`
- `poke-sim/db/migrations/*`
- `poke-sim/rulesets.js`
- `poke-sim/source/*`
- `poke-sim/legality.js`
- `poke-sim/team_lab.js`
- `poke-sim/source_truth.js`
- `poke-sim/legality_evidence_package.js`

No release bump is needed for documentation-only or schema-only work unless a later release task explicitly requests it.

## Recommended Phased Build Order

### Phase 0 - Documentation And Guardrails

Create the architecture context and audit docs. Do not change runtime behavior.

Exit criteria:

- source-of-truth boundaries are documented
- no runtime files changed
- no LLM calls added
- no DB writes added
- no release identity changed

### Phase 1 - EvidenceBundle Schema

Add:

```text
poke-sim/analysis/schemas.js
poke-sim/analysis/evidence_bundle.js
poke-sim/analysis/confidence.js
poke-sim/analysis/provenance.js
poke-sim/tests/analysis/evidence_bundle_tests.js
```

Exit criteria:

- valid bundles pass
- invalid analysis types fail
- invalid evidence categories fail
- invalid confidence levels fail
- missing finding fields fail
- duplicate evidence IDs fail
- missing provenance fails

### Phase 2 - Deterministic Analysis Tool Contracts

Add conservative tools under:

```text
poke-sim/analysis/tools/
```

Initial tools:

- `validate_team_analysis.js`
- `speed_tiers.js`
- `damage_matrix.js`
- `threat_detection.js`
- `lead_recommendations.js`
- `role_coverage.js`
- `replay_summary.js`
- `index.js`

Each tool returns evidence findings and uncertainty, not final coaching prose.

### Phase 3 - BrainAnalysis Schema, Validator, And Mock Adapter

Add structured BrainAnalysis output, guardrails, and a mock-only adapter.

Do not call external models.

### Phase 4 - Benchmarks And Red-Team Fixtures

Add fixtures for tricky simulator evidence:

- Trick Room
- priority moves
- speed ties
- item consumption
- faint and switch replacement
- weather and terrain
- status and action denial
- ability and item triggers
- replay parser gaps

### Phase 5 - UI Cards

Render validated mock BrainAnalysis output in Evidence Mode cards.

Do not add open-ended chat in the MVP.

### Phase 6 - Optional DB Persistence

Add DB tables and adapter methods only after schemas and validators are proven.

Store what the Brain saw, what it said, whether validation passed, and what evidence IDs were used.

### Phase 7 - Real LLM Endpoint

Add a disabled-by-default server-side endpoint only after the mock pipeline, validator, and benchmarks are stable.

No model keys in browser code.

### Phase 8 - Learning And Meta Intelligence

Defer leaderboard, global meta, and large-scale learning until the simulator truth, evidence ledger, privacy model, and anti-poisoning controls are stronger.

## Accepted Direction As Of 2026-07-05

The accepted direction is:

- Evidence Mode Beta first
- schema before AI UI
- mock brain before real model
- validator before persistence
- privacy-aware LLM use later
- team-review first before broader matchup and replay coaching
- Milestone A active work before opening later phases as implementation issues

## Challenge Notes For The Team

The main risk is not adding AI too slowly. The main risk is making AI sound authoritative before the simulator evidence is complete enough.

If a Brain feature cannot answer these questions, it should not ship as user-facing coaching:

- What exact evidence supports the claim?
- Which simulator, ruleset, regulation, and source versions produced that evidence?
- What is missing or uncertain?
- Is the claim team-review, matchup-review, replay-only, or global?
- Could this expose private team or replay information?
- Would a stale ruleset, stale engine, or stale parser change the conclusion?

The Brain can help players understand evidence. It cannot change the rules.
