# QA Environment Handoff Rules - 2026-06-19

Audience: Kevin, Josh, Alfredo, and any reviewer validating branch work, DB wiring, or release readiness.

## Mistake This Fixes

We mixed up testing targets.

- GitHub Pages proves only what is deployed from `main`.
- Branch issue comments sometimes pointed at `rollback-main` previews.
- Current review work is on `feature/showdown-db-writer`.

That made it too easy to send someone to the wrong site and then treat the result as evidence for the wrong branch.

## Environment Selection Rules

Use the review target that matches the code being claimed.

| Review type | Correct target | Never use |
|---|---|---|
| Merged `main` validation | GitHub Pages or `main` htmlpreview | feature-branch preview as proof for `main` |
| Feature-branch UI/runtime review | exact branch raw/htmlpreview URL, or local `poke-sim/pokemon-champion-2026.html` | GitHub Pages if the branch is not merged |
| Credential-gated browser review | local file or local server with `poke-sim/local-credentials.js` present | GitHub Pages unless the deployed site already has the same runtime config |
| Node/live DB test review | local terminal run with `.env.local` or CI run tied to the branch | browser-only smoke as proof of DB write-path behavior |

## Required Handoff Block

Every QA request should include this exact information:

```text
Repo:
Branch:
Commit:
Review target:
Preview URL or local file:
Required local files:
Required secrets:
Required DB state:
Acceptance checks:
```

## Naming Rules

- Say `GitHub Pages` only when you mean the deployed `main` site.
- Say `branch preview` only when you include the exact branch URL.
- Say `local review` only when the reviewer must open a local file or run a local server.
- Do not say `live site` for a feature branch.

## Evidence Rules

- Do not close an issue based on evidence from a different branch.
- Do not treat `rollback-main` comments as proof for `feature/showdown-db-writer`.
- Do not treat local DB proof as GitHub Pages proof.
- If the review needs Supabase, say whether it is:
  - read-only anon browser validation
  - local live DB tests with `.env.local`
  - admin migration/write validation in CI or workflow logs

## Current Safe Defaults

- Public stable share link: GitHub Pages on `main`
- Current Showdown DB review branch snapshot: `docs/release/SIM_AND_DB_SNAPSHOT_2026-06-19.md`
- Current branch-specific review branch: `feature/showdown-db-writer`
- Current stable branch-proof rule: no branch-only claim is complete until the branch, commit, and target URL all match

## Reviewer Checklist

Before Josh starts a pass, verify:

1. The repo and branch names match the claim.
2. The commit SHA is included.
3. The preview target actually serves that branch.
4. Any required local credential files are called out.
5. The acceptance checks match the environment being used.
