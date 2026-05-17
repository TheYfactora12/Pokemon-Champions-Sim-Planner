# Battle IQ Scoring Spec

## Core equations

### Sub-score baseline
Each sub-score starts at `70`.

`raw_sub = clamp(70 + positives - negatives, 0, 100)`

### Evidence model
- `positives`: weighted sum of validated positive signals.
- `negatives`: weighted sum of validated negative signals.
- context/outcome modifiers may adjust signals, never replace them.

### Endgame absence redistribution
If endgame evidence is absent:
- Remove Endgame weight from 10%
- Redistribute proportionally across:
  - Turn 1, Resource, Threat Recognition, Win Condition

```
redistribute_weight = 0.10 / 4 = 0.025 each
Turn1 += 2.5%
Resource += 2.5%
ThreatRecognition += 2.5%
WinCondition += 2.5%
```

### Composite raw
Weighted mean over active sub-scores:

`composite_raw = Σ(raw_sub_i * w_i) / Σ(w_i)`

### Provisional standard score conversion
Without robust norming:

`standard_score = 100 + ((raw_sub - 70) / 15) * 15`

Equivalent:
- raw 70 -> 100
- raw 85 -> 115
- raw 55 -> 85

Clamp to `[1, 200]` before percentiles.

### Standard score with norms
When norms exist:
- `standard_score = z_to_scale(z_raw, mean=100, sd=15)`
- include `percentile`, `ci_95_lo`, `ci_95_hi`
- `n < n_min` => provisional, widen CI

### Win/loss correction
No sub-score is a direct function of win/loss label.
- Outcome used only as evidence context.
- Winning variance events reduce certainty, not automatically inflate score.

## Confidence model
Inputs:
- `log_completeness` (0..1)
- `team_visibility` (0..1)
- `turns_seen` normalized
- `sample_size_factor`
- `context_certainty`

Simple composition:

`confidence = weighted_avg([log_completeness, team_visibility, turns_seen, sample_factor, context_certainty])`

Mapping:
- `>=0.78 => high`
- `0.55..0.77 => medium`
- `<0.55 => low`

Rules:
- Low => provisional true, hide trend/percentile/causal claims
- Medium => allow single-number explanation + limited trend
- High => full narrative + percentiles where available

## Banding
- 130+ Elite Battle IQ
- 120–129 Advanced
- 110–119 Strong
- 90–109 Average / Developing
- 80–89 Needs Focus
- <80 Major Coaching Opportunity

## Score flow for each sub-score
1. Detect event windows
2. Emit evidence markers
3. Apply signal weights
4. Baseline correction by context
5. Clamp
6. Convert to standardized score when requested

## Outcome-bias and variance rules
- If high-confidence good play + variance-loss event: keep subscore near observed evidence.
- If bad read + lucky win: reduce Risk Discipline and do not reward via outcome.
- Variance markers adjust confidence down by up to 0.2 each high-impact event.

## Sub-score signal examples (short)

### Lead IQ
Evidence: lead matchup fit, early pressure, plan continuity, win-path safety.

### Turn 1 IQ
Evidence: threat priority, denial action quality, tempo and setup checks.

### Speed Control IQ
Evidence: speed-control creation/denial, conversion of turns, board reset timing.

### Resource IQ
Evidence: Tera/Protect/Sash/Fake Out timing, outs preservation.

### Threat Recognition IQ
Evidence: threat targeting quality, response after reveals, adaptation speed.

### Win Condition IQ
Evidence: route preservation, blocker removal, plan shifts.

### Endgame IQ
Evidence: late-game conversion/defense, target correctness, board collapse management.

### Risk Discipline IQ
Evidence: stable line selection, fallback availability, unnecessary variance usage.

## Confidence decay and longitudinal reliability
- `single_battle_weight = 1.0`
- `N battles` increases weight logarithmically toward cap.
- Recent battles can be weighted by recency but still bounded.

Suggested reliability: `reliability = 1 - exp(-N / 12)`

Composite reported confidence combines reliability with evidence confidence:

`final_confidence = min(1, confidence * reliability)`

## Acceptance math checks
- Denominators must be explicit per stat.
- Every normalized score must preserve original raw for audit.
- No division by zero path; use guard values + reason_code.

