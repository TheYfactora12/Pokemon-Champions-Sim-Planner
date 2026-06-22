# Repo Parity Report - 2026-06-06

## Bottom Line

The shared merge candidate branch is 1:1 across both repositories.

The `main` branches are not 1:1 yet. They become 1:1 only after the shared branch is merged into both repos through PR + CI.

This report is committed on the same shared branch, so the branch head advances each time the report itself is edited. Treat the table below as the parity baseline before this report commit, then use `git ls-remote` or the PR pages for the live branch head.

## Branch Parity

| Repo | Branch | Baseline SHA Before This Report | Status |
|---|---|---|---|
| `TheYfactora12/Pokemon-Champions-Sim-Planner` | `merge-candidate/alfredo-main-2026-06-06` | `fa584f2c2d5cdeeff777e6f74a8d19e45516b9a5` | 1:1 |
| `alfredocox/Pokemon-Champions-Sim-Planner` | `merge-candidate/alfredo-main-2026-06-06` | `fa584f2c2d5cdeeff777e6f74a8d19e45516b9a5` | 1:1 |

Latest verification command:

```bash
git ls-remote origin refs/heads/merge-candidate/alfredo-main-2026-06-06
git ls-remote alfredo refs/heads/merge-candidate/alfredo-main-2026-06-06
```

Both commands must return the same SHA.

## Main Branch Difference

| Repo | `main` SHA | Status |
|---|---|---|
| `TheYfactora12/Pokemon-Champions-Sim-Planner` | `70a9c64d3a4a8a060cf631fffa60055736507ae0` | not yet merged with candidate |
| `alfredocox/Pokemon-Champions-Sim-Planner` | `6e90f347ddde6ad754ab2b736a2ed6d1305f9075` | not yet merged with candidate |

## Pull Request Links

Open these PRs to move the 1:1 candidate into both `main` branches:

- Y Factor repo: <https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/pull/new/merge-candidate/alfredo-main-2026-06-06>
- Alfredo repo: <https://github.com/alfredocox/Pokemon-Champions-Sim-Planner/pull/new/merge-candidate/alfredo-main-2026-06-06>

## What Is In The Shared Candidate

- Review tab restored as a top-level entry point.
- Overview tab added as the living checklist for shipped work, validation, gaps, milestones, open decisions, and doc links.
- Stable Pokemon identity and item-state export safeguards added for turn logs.
- Exported turn-log validator added.
- Move priority drift fixed and guarded against generated Pokemon Showdown metadata.
- Showdown DB source-of-truth plan documented.
- Alfredo `main` merged into the shared candidate.
- Closeout status documented.

## Jdoutt38 Review And QA List

| Workstream | Y Factor Issue | Alfredo Mirror | Purpose |
|---|---|---|---|
| Manual QA smoke test | `#105` | `#216` | Run browser QA against Champion replay intelligence and record pass/fail evidence. |
| Sources/Data Provenance cleanup | `#106` | `#217` | Keep evidence language aligned across Sources, Strategy, Battle Sensei, and paid/free boundaries. |
| Team Snapshot + Replay Match MVP | `#108` | `#218` | Match sim teams to replay teams before claiming deltas or improvement. |
| Coach Recommends UX MVP | `#107` | `#219` | Show one compact next-best-action coaching card. |
| Pokemon data audit workbook | `#123` | `#231` | Review generated Pokemon data audit workbook and report concrete row mismatches. |

## Tomorrow Checklist - 2026-06-07

1. Open both PRs from `merge-candidate/alfredo-main-2026-06-06` into `main`.
2. Let CI run in both repos.
3. Fix any PR CI failures.
4. Review service-worker cache version, M8 prior snapshot migrations, Overview docs, and Showdown DB docs.
5. Merge both PRs after CI is green.
6. Re-check both `main` SHAs and confirm they are 1:1.
7. Check the GitHub Pages preview after merge.
8. Hard refresh the preview, export fresh turn logs, and run strict validation:

```bash
cd poke-sim
node tools/validate-turn-logs.mjs --require-stable path/to/champions-turn-log.json
```

9. Start Jdoutt38 QA with the workbook review and replay smoke test.

## Definition Of Done

- Both PRs are open.
- Both PRs are green.
- Both PRs are merged.
- Both `main` branches point to the same commit or equivalent reviewed merge state.
- Deployed Pages preview contains Overview, Review, stable log fields, and current service-worker cache.
- One fresh hard-refreshed exported log passes strict validation.
