# Jdoutt38 Issue Investigation - 2026-06-06

> Historical note, updated 2026-06-19: this file originally described the `merge-candidate/alfredo-main-2026-06-06` branch only. Do not use it as the current source of truth for `feature/showdown-db-writer`.

## What Was Originally Investigated

The original pass compared a shared merge-candidate branch between:

- `TheYfactora12/Pokemon-Champions-Sim-Planner`
- `alfredocox/Pokemon-Champions-Sim-Planner`

That investigation was useful for the 2026-06-06 merge candidate, but later issue comments introduced branch-specific changes on `rollback-main` that were not present on the current Showdown DB review branch.

## 2026-06-19 Correction

Three things are now confirmed:

1. Later issue-thread comments for `#106`, `#107`, and `#108` reported shipped work on `rollback-main`.
2. Those shipped comments are branch-specific evidence only. They do not prove the same code exists on `feature/showdown-db-writer`.
3. The current `feature/showdown-db-writer` branch still does not contain `TeamRunSnapshot`, `ReplayTeamMatch`, or the shipped Coach Recommends UX from those `rollback-main` handoff comments.

Because of that, the old wording in this file was too easy to misread as a repo-wide or branch-agnostic status report.

## Current Reliable Takeaways

| Workstream | Reliable status as of 2026-06-19 |
|---|---|
| `#123` Pokemon data audit workbook | Still a valid Josh review task. Workbook artifacts exist and should be reviewed against the exact branch/commit under review. |
| `#105` Manual QA smoke test | Still a valid human QA task, but the test target must be stated explicitly. Do not send reviewers to GitHub Pages when the work only exists on a feature branch. |
| `#106` Sources/Data Provenance cleanup | Later comments say this shipped on `rollback-main`. That is not proof for `feature/showdown-db-writer`; reviewers must use branch-specific evidence. |
| `#108` Team Snapshot + Replay Match MVP | Later comments say this shipped on `rollback-main`, but the current Showdown DB review branch does not contain `TeamRunSnapshot`, `TeamFingerprint`, or `ReplayTeamMatch`. |
| `#107` Coach Recommends UX MVP | Later comments say this shipped on `rollback-main`, but the current Showdown DB review branch still only contains a pause note, not the shipped UX contract. |

## Handoff Rule Going Forward

Every QA or review request tied to Josh or Jdoutt38 should include:

- repo
- branch
- commit SHA
- exact preview URL or local file path
- required local files such as `local-credentials.js` or `.env.local`
- required DB state, if any

Use `docs/release/QA_ENVIRONMENT_HANDOFF_RULES_2026-06-19.md` for the required format.
