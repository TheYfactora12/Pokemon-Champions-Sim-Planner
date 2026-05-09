---
description: Enforced development standards for all implementation work on this repo
---

# Development Standards — Pokémon Champion 2026

These rules apply to **every** implementation session. Follow them in order before writing any code.

## Pre-Implementation Gate

1. **Pull latest & check branch** — Run `git fetch origin && git status` and read `MASTER_PROMPT.md` before touching any code. Confirm you are on the correct branch and aware of current progress.

2. **Read the plan** — If a plan file exists in `.windsurf/plans/`, read it. If no plan exists, create one before implementing.

## Implementation Rules

3. **Embedded Systems Logic** — Organize all code into well-named functions and classes. Entry points (`main`, event handlers, top-level scripts) must be clean orchestrators that call into those functions — no inline business logic in `main`. Keep cyclomatic complexity low per function.

4. **Test-Driven Development (TDD) + Modular** — Write or update tests BEFORE implementation. Each module/feature gets its own test file. Follow the RED → GREEN → REFACTOR cycle. Never merge code that breaks existing tests.

5. **Precise, Concise Plans** — All plans must be:
   - Bullet-format, scannable in under 60 seconds
   - Each step is a single concrete action (not a paragraph)
   - Written so that any AI agent (including free-tier SWE models) can follow and implement precisely
   - Include file paths, function names, and acceptance criteria where applicable

## Post-Implementation Gate

6. **Update MASTER_PROMPT.md** — After completing work on a branch, update `MASTER_PROMPT.md` with:
   - What was done (module, PR, key changes)
   - Current status of the integration plan
   - Any blockers or open questions
   - This ensures any team member or AI can pick up where you left off.

7. **Verify before push** — Run the test suite, confirm no regressions, and check that the bundle builds cleanly before pushing.
