# Team variation audit - 2026-10-09

## Scope and proof state

Local diagnostic harness, not a runtime change or new production release.
M-C pinned-reference execution only; no official regulation approval implied.
Source SHA-256 hashes, exclusions, seeds and bounded finding samples are retained
in `poke-sim/reports/artifacts/team-variations-1791593385222.json`.
The full artifact includes a user-team snapshot input hash and stays local.

## Coverage

- All 34 bundled team entries were preflighted: 12 accepted, 22 excluded.
- A second run added the user's unchanged replay-registered team: 13 accepted.
- Every accepted six-member team exercised all 360 ordered bring-four selections
  (including both lead positions and bench order), against rotating opponents.
- Every accepted ordered team pairing also ran ten deterministic seeds with
  default selection: 169 pairs, 1,690 battles.
- Second run: 4,680 explicit-bring battles plus 1,690 pairing battles = 6,370.
- 247 additional exact reruns compared complete serialized battle output.
- Initial bundled-only pass: 5,760 battles and 216 reruns. Do not treat overlapping
  coverage as independent statistical evidence.
- M-C execution contract suite: 11 passed.

## Findings

1. Rock Head recoil remains open (#260). The second run flagged 580 recoil
   events with recorded attacker ability Rock Head and a non-Struggle move.
   These are candidate events, not 580 independently adjudicated failures;
   suppression context needs checking when minimizing fixtures. Live replay
   evidence already confirms the unsuppressed Flare Blitz and Head Smash defect.
2. No checked invariant failures: four distinct registered participants,
   requested bring order, original item ownership, direct-damage HP accounting,
   deterministic replay, or source-team mutation.
3. The previous 15-team audit uses historical/default validation. Its successful
   legality checks do not establish M-C acceptance. The 22 exclusions were kept,
   not bypassed, silently corrected, or labeled officially illegal.
4. The manifest contract reports 4 regression-covered, 9 partial, 2 gap families;
   18 covered, 30 partial, 5 open edge cases. Universal accuracy remains false.

## Limits and next work

This is not the Cartesian product of both teams' 360 bring orders (129,600 per
pair), every RNG state, every move decision, or all possible legal teams. The
automated move policy is not a competitive human. No fresh visual browser proof
was performed for these local runs; previous live v203 evidence remains separate.
Passing invariants does not prove damage formulas, move choice, or rule parity.
Win-rate coaching remains unsuitable while the known mechanic is wrong.

Priority: minimize and oracle-test Rock Head across recoil moves, active and
suppressed ability states and Struggle controls; fix and rerun this sweep.
Then repair the matrix headings (#242), review each M-C exclusion against its
source context, and add action-policy and paired-side interaction coverage.

## Reproduce

Run `node poke-sim/tools/audit-team-variations.cjs` for bundled teams. An optional
replay JSON path adds its registered player team without changing source data.
Exit zero means no structural invariant failures, not no mechanic findings.
