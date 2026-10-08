# Pokémon Champion 2026 — VGC Team Simulator

A Pokemon Champions competitive team simulator under evidence-gated development for 2026 doubles play. It is a fully offline-capable PWA with a static-site deployment path and optional Supabase-backed user features; current regulation data remains review-gated rather than advertised as complete.

**Live public site:** https://theyfactora12.github.io/Pokemon-Champions-Sim-Planner/

**App entry point:** [`pokemon-champion-2026.html`](./poke-sim/pokemon-champion-2026.html). Serve the `poke-sim` directory with its `generated` and `assets` directories intact. The HTML alone is not a complete offline download; offline PWA use requires a successful initial asset cache.

## Where the App Lives (Shareable URLs)

Use the primary GitHub Pages URL for the deployed preview. A merged branch is
not proof of a successful deployment; the tested revision and live receipt are
recorded in [STATUS.md](./STATUS.md).

| Channel | Name | What it serves | Updates when | Use it for | Status |
|---|---|---|---|---|---|
| **Candidate** | reviewed PR or local server | Work in progress at an identified commit | When explicitly built/shared | Scoped testing; no deployment assumption | Check PR evidence |
| **Repository** | `main` branch | Merged source and generated bundle | After approved merge | Inspect source; not a separate hosted environment | Check STATUS.md |
| **Deployed preview** | GitHub Pages | Successfully deployed main artifact | After deployment succeeds | Public practice; not certified competitive advice | Check live receipt |

**Links:**
- **Primary deployed preview**: [GitHub Pages](https://theyfactora12.github.io/Pokemon-Champions-Sim-Planner/)
- **Dev preview**: use the active branch preview URL shared in the PR under review

> **Note:** Raw HTML proxy previews are not deployment evidence and can miss external assets. Use the primary Pages site or a local server with the complete asset tree.
>
> For QA handoffs, always pin the exact repo, branch, commit SHA, preview target, and required local/DB credentials. Do not send branch-only review to GitHub Pages. See [`docs/release/QA_ENVIRONMENT_HANDOFF_RULES_2026-06-19.md`](./docs/release/QA_ENVIRONMENT_HANDOFF_RULES_2026-06-19.md) and [`docs/release/SIM_AND_DB_SNAPSHOT_2026-06-19.md`](./docs/release/SIM_AND_DB_SNAPSHOT_2026-06-19.md).

## Release Direction

Current priority is the free doubles team lab: build, validate, simulate, inspect,
improve. Prove mechanics, regulation data and evidence before expanding coaching.
Accounts, paid services, subscriptions and LLM orchestration are deferred ideas,
not release prerequisites or authorization to incur costs.

See [ROADMAP.md](./ROADMAP.md#release-alignment) for reviewed release gates; optional revenue features remain deferred behind trust and demonstrated player value.

---

## Repository Structure

```
Pokemon-Champions-Sim-Planner/
├── README.md                          ← This file
├── DEVELOPMENT_RUNBOOK.md             ← Historical runbook archive entry point
├── MASTER_PROMPT.md                   ← Historical prompt archive entry point
├── index.html                         ← Landing redirect to bundle
└── poke-sim/                          ← App sources + bundle
    ├── pokemon-champion-2026.html     ← HTML bundle; requires generated data and assets
    ├── index.html                     ← App shell, tabs, PWA meta
    ├── style.css                      ← Mobile-first dark theme
    ├── data.js                        ← Baseline stats, preloaded teams and type data
    ├── engine.js                      ← Battle sim engine, damage formula, Bo runner
    ├── ui.js                          ← All UI logic, import/export, pilot guide, PDF
    ├── legality.js                    ← Team legality validator
    ├── strategy-injectable.js         ← Strategy tab knowledge base
    ├── manifest.json                  ← PWA manifest
    ├── sw.js                          ← Service worker (network-first app shell, cached assets)
    ├── icon-192.png                   ← PWA icon
    ├── icon-512.png                   ← PWA icon large
    └── tests/                         ← Node regression suite (items, status, mega, coverage, audit)
```

---

## Local Preview

Clone the repository, then serve the complete application directory:

```bash
cd poke-sim
python -m http.server 8765
```

Open `http://localhost:8765/pokemon-champion-2026.html`. Use another port if
occupied. Keep generated files and assets together. This serves the committed
build; rebuilding and running tests require the development dependencies.

---

## Features

- Seeded practice simulation; supported series formats depend on the selected ruleset
- Doubles product scope; singles is retained for shared-mechanics testing
- Preloaded and imported teams, revalidated against the selected context
- Poképaste + Showdown import/export
- Team Preview bring-N-of-6 picker with drag+tap UI and Random 4/6 opponent mode (T9j.10)
- Simulator-tab inline bring pickers for player + opponent sharing state with the Teams tab (T9j.12)
- Custom team bulk import/export via file + filter chips on Teams tab (T9j.11)
- Replay Log with All / Wins / Losses / Clutch filters
- Pilot Guide and Strategy evidence surfaces; unverified advice is not competitive guidance
- Meta Threat Radar, Speed Tiers, Team Coverage checker
- PDF report (after Run All Matchups)
- PWA support; device-specific behavior requires testing, not an installation claim

---

## Run Tests

```bash
cd poke-sim
npm ci
npm test                       # fast tests plus offline/mock DB contracts
npm run test:battle-audit       # declared mechanics coverage and gaps
npm run test:accuracy           # state/repeatability, not game certification
npm run roadmap:check          # source and generated roadmap consistency
```

Current evidence belongs in [STATUS.md](STATUS.md) and its linked dated reports. `npm run test:fast` runs the non-DB gate; `npm test` adds offline/mock DB checks. Live verification requires explicit configuration and cannot be inferred from either command passing.

When a change touches Showdown source data, generated runtime artifacts, fallback stats/types, or DB-generation wiring, also run `npm run test:source-truth` from `poke-sim/`. That is the focused drift guardrail suite for source-truth changes.

---

## Rebuild Bundle (after any source file change)

```bash
cd poke-sim
python tools/build-bundle.py
```

Use the canonical builder for module inclusion, inline-script escaping, and release-manifest handling. Do not use the historical three-script inline recipe. Building locally is not deployment; follow the current gates in `STATUS.md` before publishing.

---

## See Also

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — current contribution workflow
- [`DEVELOPMENT_RUNBOOK.md`](./DEVELOPMENT_RUNBOOK.md) — archived historical context
- [`MASTER_PROMPT.md`](./MASTER_PROMPT.md) — archived prompt, not active agent instructions
- [`docs/repo-sync-playbook.md`](./docs/repo-sync-playbook.md) — fastest safe process for syncing validated fixes into mirror repos
- [`CHAMPIONS_VALIDATOR_FRAMEWORK.md`](./CHAMPIONS_VALIDATOR_FRAMEWORK.md) — validator framework governing engine change tickets
