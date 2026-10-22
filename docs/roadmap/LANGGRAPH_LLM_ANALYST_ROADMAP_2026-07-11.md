# LangGraph Orchestration and LLM Analyst Roadmap

**Date:** 2026-07-11  
**Status:** Proposed; gated by simulation truth

## Decision

Use LangGraph as the orchestration framework for a future LLM analyst and coaching layer while preserving the deterministic simulator as the sole authority for legality, mechanics, damage, speed order, battle state, and replay truth.

LangGraph coordinates tools, state, routing, retries, evidence checks, and approval steps. It does not calculate battle outcomes, invent mechanics, or bypass the simulation-truth gate.

## Responsibility boundary

### Deterministic engine

- legality and format validation
- move, ability, item, weather, terrain, status, and priority rules
- damage, speed order, and battle-state transitions
- replay and turn logs
- repeatable simulations and fixtures

### LangGraph

- workflow routing and typed shared state
- approved tool sequencing
- bounded retries and failure handling
- evidence collection and confidence gates
- checkpointing and optional human approval

### LLM analyst

- translates verified outputs into understandable coaching
- compares options using simulator evidence
- summarizes matchup risks and win conditions
- explains why a suggestion is supported

The LLM is never the source of battle truth.

## Proposed graph

```text
START
  -> intake
  -> validation
      -> invalid: return validation report
      -> valid: evidence planner
  -> approved deterministic tools
  -> evidence gate
      -> insufficient evidence: limited answer with explicit gaps
      -> sufficient evidence: coach writer
  -> optional human review
  -> final response
  -> feedback capture
END
```

No unbounded agent loops. Retries must be capped and limited to tool, schema, or transient provider failures.

## Initial state

The typed graph state should include:

- request ID and user question
- format and regulation
- player and opponent teams
- legality results
- simulator and data versions
- mechanics-support flags
- damage and matchup samples
- speed-order evidence
- lead-pair scores
- replay evidence
- candidate findings
- confidence and unresolved evidence gaps
- final response
- user feedback

## Initial nodes

1. **Intake** — normalize and classify the request.
2. **Validation** — call deterministic legality and format checks.
3. **Evidence Planner** — select a bounded set of approved tools.
4. **Team Analysis** — roles, coverage, weaknesses, speed control, and resources.
5. **Matchup Analysis** — lead pairs, damage, speed order, and win conditions.
6. **Simulation** — bounded deterministic simulations with recorded seeds.
7. **Replay Evidence** — supported turning points and decision opportunities.
8. **Evidence Gate** — map every material claim to deterministic evidence.
9. **Coach Writer** — explain evidence in player-friendly language.
10. **Human Review** — optional approval for experimental or public claims.
11. **Feedback** — store helpfulness and corrections with version metadata.

## Delivery phases

### Phase 0 — Preserve simulation truth

- retain mechanics, legality, replay-log, CI, and release gates
- document prohibited LLM responsibilities
- define evidence levels: verified, modeled, incomplete, unsupported
- block confident AI claims when high-severity mechanics drift remains unresolved

**Exit:** Stable deterministic interfaces expose versioned evidence and mechanics-support status.

### Phase 1 — Tool contracts without an LLM

Create typed, UI-independent contracts for:

- `validateTeam(input)`
- `analyzeTeam(input)`
- `analyzeMatchup(input)`
- `runDamageSamples(input)`
- `computeSpeedOrder(input)`
- `computeLeadPairs(input)`
- `runSimulationBatch(input)`
- `extractReplayEvidence(input)`
- `computeWinConditions(input)`

Requirements:

- identical inputs and seeds produce deterministic outputs
- structured errors and schemas
- simulator and data version metadata
- evidence references
- fixture and schema tests in CI

### Phase 2 — Minimal LangGraph proof of concept

Build one CLI/test workflow:

```text
intake -> validation -> team analysis -> evidence gate -> report
```

Constraints:

- one model provider behind an adapter
- local checkpointing only
- no production UI
- no autonomous code changes
- no new infrastructure unless the proof of concept demonstrates the need

**Exit:** Inspectable state, controlled failures, evidence-linked claims, and recorded runtime/token usage.

### Phase 3 — Matchup and lead analysis

Add opponent-team input, lead-pair analysis, speed-control comparison, damage thresholds, primary and secondary win conditions, and bounded simulation batches.

Reports must distinguish simulator observations from LLM interpretation and reduce confidence when mechanics support is incomplete.

### Phase 4 — Replay coaching

Add replay/native turn-log parsing, decision-opportunity detection, evidence-supported turning points, bounded legal-alternative comparison, loss-cause classification, and practice recommendations.

Dependencies:

- trustworthy turn logs
- speed-control payoff interpretation
- decision-opportunity ledger
- alternative-action evaluation

Every flagged mistake must include the turn, board state, legal alternatives, evidence, and confidence. Variance and matchup disadvantage must not be mislabeled as player error.

### Phase 5 — Product integration

Add:

- backend or controlled local service boundary for model calls
- UI job status and cancellation
- evidence panel and confidence labels
- AI-generated-content disclosure
- rate and cost controls
- deterministic fallback when AI is unavailable

Security gates:

- no model API secrets in browser code
- strict tool allowlist
- prompt and tool inputs treated as untrusted
- output encoding and XSS controls
- replay/team retention policy
- audit log for model, prompt, graph, tools, and evidence versions

### Phase 6 — Feedback and memory

Store analysis summaries, evidence references, model/workflow version, helpful/not-helpful votes, optional corrections, and category tags.

Use feedback for offline evaluation, prompt revisions, ranking, and regression tests. The production graph must not rewrite mechanics, tools, or prompts automatically.

### Phase 7 — Multi-model specialization

Only after the single-workflow design is stable, evaluate specialist roles such as planner, battle analyst, replay reviewer, evidence critic, and explanation writer.

Adopt multi-model routing only when benchmarks show measurable quality or cost improvement over the added complexity.

## Proposed structure

```text
poke-sim/
  src/
    engine/                 # deterministic battle truth
    tools/                  # stable callable contracts
    ai/
      graph/
        state.*
        workflow.*
        routing.*
        checkpoints.*
      nodes/
        intake.*
        validate.*
        plan-evidence.*
        analyze-team.*
        analyze-matchup.*
        simulate.*
        replay-evidence.*
        evidence-gate.*
        coach-writer.*
        feedback.*
      providers/
        model-adapter.*
      prompts/
        versioned prompts only
      schemas/
        state and node I/O schemas
  tests/
    ai/
      graph-routing tests
      node-contract tests
      evidence-grounding tests
      failure and retry tests
      evaluation fixtures
```

Exact paths should align with existing module-split work rather than force premature restructuring.

## Quality gates

- every material claim cites structured simulator or replay evidence
- engine, data, graph, and prompt versions are recorded
- unsupported mechanics are visible
- deterministic reports remain available
- tests cover invalid input, partial mechanics, model timeout, malformed output, tool failure, checkpoint resume, and prompt injection
- no AI node may directly mutate canonical mechanics data

## Immediate actions

1. Keep implementation gated behind simulation-truth priorities.
2. Approve the deterministic-engine versus LLM responsibility boundary.
3. Inventory existing functions that can become stable tools.
4. Define contracts for `validateTeam`, `analyzeTeam`, and one matchup evidence tool.
5. Build the CLI-only proof of concept after those contracts are green.
6. Compare LangGraph with a small hand-built workflow before committing to production adoption.

## Non-goals

- replacing the simulator with an LLM
- allowing agents to invent or patch mechanics dynamically
- unrestricted repository, shell, database, or deployment access
- adding infrastructure before the proof of concept demonstrates value
- treating user votes or model conclusions as battle truth

## Roadmap placement

This initiative belongs after simulation-truth and tool-contract foundations and before broad AI-generated coaching claims. It supports Dynamic Strategy Coach, Piloting Analytics, Replay Coach, and future Agent-007 integration while remaining subordinate to deterministic correctness.
