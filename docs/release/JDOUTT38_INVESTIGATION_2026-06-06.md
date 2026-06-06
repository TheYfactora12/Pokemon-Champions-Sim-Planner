# Jdoutt38 Issue Investigation - 2026-06-06

## Current Alignment State

The shared candidate branch is aligned in both repositories:

- Branch: `merge-candidate/alfredo-main-2026-06-06`
- Latest shared candidate SHA at this investigation pass: `cee485ab096cb995a99d64c6ad67d06db2fdefdd`
- Repos:
  - `TheYfactora12/Pokemon-Champions-Sim-Planner`
  - `alfredocox/Pokemon-Champions-Sim-Planner`

The `main` branches are still not aligned. The candidate PRs are not open yet in either repo.

## Investigation Result

Do not close the Jdoutt38 issues yet. Some are ready for human review, but none are fully closed until the candidate branch is merged, live preview is verified, and Josh records pass/fail evidence where required.

## Issue-by-Issue Findings

| Y Factor | Alfredo | Current Evidence | Status |
|---|---|---|---|
| `#123` Pokemon data audit workbook | `#231` | `poke-sim/reports/pokemon_data_audit.csv` and `.xlsx` exist. `pokemon_data_audit_tests.js` passed 5/5. | Ready for Jdoutt38 review, not closed |
| `#105` Manual QA smoke test | `#216` | Candidate has Battle Sensei local-only/raw-log privacy language and parser/UI/learning tests pass. Live Pages loads, but candidate docs are not deployed yet. | Ready after PR merge/live preview, not closed |
| `#106` Sources/Data Provenance cleanup | `#217` | Sources tab exists and Strategy provenance exists, but the Sources tab is still too thin for the full acceptance criteria. | Needs implementation |
| `#108` Team Snapshot + Replay Match MVP | `#218` | No `TeamFingerprint`, `TeamRunSnapshot`, or `ReplayTeamMatch` contract found in candidate source. | Needs implementation |
| `#107` Coach Recommends UX MVP | `#219` | No `Coach Recommends` card or `Recommendation` contract found in candidate source. | Needs implementation |

## Verification Run

```text
pokemon_data_audit_tests.js: 5 pass, 0 fail
t188_battle_sensei_parser_tests.js: 10 pass, 0 fail
t190_battle_sensei_summary_timeline_tests.js: 7 pass, 0 fail
t192_battle_sensei_learning_tests.js: 13 pass, 0 fail
t191_overview_tab_tests.js: 6 pass, 0 fail
```

## Live Preview Check

Checked:

```text
https://theyfactora12.github.io/Pokemon-Champions-Sim-Planner/poke-sim/pokemon-champion-2026.html
```

Current live page returned HTTP 200 and contains:

- `Overview`
- `Data Sources`
- `Local review`
- `raw log not saved`

Current live page does not yet contain candidate-only report links:

- `Closure Confidence`
- `Repo Parity Report`

That is expected because the candidate branch has not been merged to `main` yet.

## Recommended Work Order

1. Open candidate PRs in both repos.
2. Let CI run and fix failures.
3. Merge both PRs once green.
4. Verify both `main` branches are aligned or have equivalent reviewed merge state.
5. Verify the GitHub Pages preview after merge.
6. Hand Jdoutt38 the workbook and manual QA tasks:
   - `#123` / `#231`
   - `#105` / `#216`
7. Implement `#106` / `#217` Sources/Data Provenance cleanup.
8. Implement `#108` / `#218` Team Snapshot + Replay Match MVP.
9. Implement `#107` / `#219` Coach Recommends UX MVP.

## Why This Order

- `#123` and `#105` can produce human QA signal without large engineering.
- `#106` is a release blocker and makes the evidence vocabulary clear before new UX is layered on top.
- `#108` creates the state needed to compare sim teams to replay teams safely.
- `#107` depends on the state from `#108`; otherwise the recommendation card would be guessing.

## Close Rules

Close an issue only when all are true:

- code/docs are merged, not just present on the candidate branch
- focused tests pass
- bundle is rebuilt when runtime files changed
- live preview is verified when user-facing UI changed
- Jdoutt38 has commented approval or concrete row/browser evidence for review-only QA tasks

