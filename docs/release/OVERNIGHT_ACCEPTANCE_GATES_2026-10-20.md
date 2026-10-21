# Overnight acceptance gates — 2026-10-20

Current continuation: [v224 acceptance register](CONTINUATION_ACCEPTANCE_2026-10-20.md).
This document preserves the completed v221 slice.

## Candidate and decision

Unpublished `v2.2.221-own-policy`, engine `1.1.25`, branch
`fix/default-policy-and-contact`. Exact main base:
`ae3f52ce481924512bff523fdcef75d04935b7a3`; explicit GitHub read confirmed this
remains remote main on October 20. Utility fix `0fa05c6` is included. PR278 remains
OPEN/DRAFT at `8282089cf2f49d61fe167e2227cb04549a6d1540`; its earlier hosted checks
are not checks of this candidate. Issue #264 remains open. Original utility,
current-main, pivot and diagnostic branches are preserved. Unrelated work is untouched.

This slice repairs Rocky Helmet and the actual default decision information
boundary. It does not certify a game-accurate Champions launch, human-like play,
all legality packages or competitive strength. No push, remote PR, merge, deploy,
spending, security or access changes were performed. AI Labs are completed and excluded.

## Changes and evidence scope

- Mechanics component `3ad564c`: 56 pinned Showdown reference cases for active Rocky
  Helmet, contact suppression, hit-by-hit damage, KO, fixed two-hit routing and
  Rough Skin ordering. See [detailed reference limits](ROCKY_HELMET_2026-10-20.md).
- Actual default `own-public-heuristic-v4` uses detached frozen own-state,
  public-field and living target-slot snapshots. Both sides are prepared before
  either chooses. Hidden opponent moves, stats, HP, types, items, abilities and
  intended actions do not enter the chooser. Execution still enforces mechanics.
  Own locks, PP, imposed seals, healing, roles and public field setters remain.
- Default Mega candidate selection uses eligible own slot order. The prior Speed
  sort could consult hidden weather suppressors. This does not repair the still
  player-then-opponent simultaneous Mega execution order.
- Four boundary test groups include 40 production mutation runs, throwing-accessor
  guards and aggregate/provenance checks. The separate opt-in diagnostic remains
  available; it is not being substituted for the actual default repair.
- Priors are deliberately simple. Hidden Imprison restrictions are enforced at
  execution, and choices can be ineffective. Richer opponent awareness requires
  a product visibility contract and a versioned public observation ledger.
- Three golden traces were reviewed before regeneration. All original hashes
  reproduced with engine `482ac63`; all six before/after hashes were independently
  checked. First divergence is move choice. Outcomes: gb001 win/5 to win/5,
  gb002 loss/4 to loss/5, gb003 loss/4 to win/6. This is no strength benchmark.
  Retained local traces: `poke-sim/artifacts/v221-policy-goldens/`.
- Mechanics fixtures now force the action/target under test for Stalwart, Feint
  and blocked sound moves. Replacement seeds exercise the same Protect, spread
  and paralysis assertions after the chooser stopped consuming combat RNG.
  A real status-category fallback and own support-role priority were repaired.

Bundle: 11,529,148 bytes; SHA-256
`5996474789e0d3b306c13e21f14fb32941345ce3797931375b9288779970a12e`.
Independent mechanics, policy/golden and release reviewers approved their bounded
lanes. Release reviewer independently passed 12/12 checks and external assets.
Final aggregate receipts are below. Browser proof covers three games, four pairs,
62 turns and 4,343 observable checks, with zero mismatches or page errors.
Offline policy-helper loading passed. Screenshot inspection confirmed the mobile
replay layout; this is not a real-user comprehension study. Evidence directory:
`poke-sim/artifacts/browser-replay-6pvyrs/`.

## Acceptance register

Status describes this local candidate or explicitly historical evidence. Database,
hosted services and deployed behavior were not freshly audited here. Each row names
what must be supplied before its gate can close; local mocks do not close live gates.

| Milestone / acceptance gate | Status and concrete blocker | Owner / next action |
| --- | --- | --- |
| Simulation: declared benchmark has no critical mechanics errors | Partial. Matrix has 62 cases: 18 covered, 39 partial, 5 open. Mid-turn Speed/stages, Mirror Armor/Contrary, fixed moves, entry/residual, Grudge/Disable/berries and import edges still lack complete scoped proof. | Engine owner: select the next declared benchmark, retain counterexamples and add reference regressions. |
| Simulation: policy evidence supports recommendation claims | Boundary fixed locally; strength unverified. No approved closed-reveal versus open-sheet contract or public event ledger exists. Strategy cache context mixing/misleading coaching remain broader audit gates. | Product + policy owner: decide visibility scope, stable identities/reveal cutoffs and benchmark denominator before richer policy. |
| Simulation: voluntary switching | Execution absent; preparation contract alone is not proof. Need both-side/slot fixtures for replacement targeting, PP/HP/status/item continuity, trap lifetime, callbacks and ties/Trick Room. | Engine owner: implement the prepared contract against explicit reference/capture cases. |
| Simulation: simultaneous Mega order | Candidate choice fixed; execution remains player then opponent. Champions same-priority/tie/weather-ability capture evidence is missing. | Evidence approver + engine owner: approve captures before choosing semantics. |
| Simulation: complete contact and game-stat parity | Helmet bounded cases pass; general contact-effect ordering, Magic Room/Embargo and broader Rough Skin suppression are not proved. No complete official client corpus/accuracy denominator. | Battle auditor: expand named cases; human evidence owner supplies approved client captures. |
| Simulation: visible replay parity | Local 3-game/4-pair sample passes; broader complete-game corpus remains incomplete. | QA owner: pair every sampled DOM game with its exported log and report uninspected scope. |
| Regulations: current complete package | 262 M-C IDs remain review-only. 42 individual set probes are not an approved complete item/move/ability package; M-A/B/C remain unverified. | Source owner + human approver: review format/effective scope and complete-package digest. |
| Regulations: accepted/rejected team and delta proof | Complete-team fixtures and Z-Mega/Aura Guard contact/suppression/multihit/spread proof remain incomplete. | Source/engine owners: add evidence-backed admission and execution fixtures. |
| Regulations: safe durable promotion | Hosted monitoring, encrypted retention, permissions, immutable candidates and digest-bound atomic approval/history are not verified. Publication unauthorized. | Data approver: approve exact candidate and separately authorize promotion after gates. |
| Database: live access and ownership | Historical audit recorded unapplied hardening and anonymous analysis/coverage write exposure. Private owner-scoped saves and two-user isolation unproved. No security/access change authorized. | DB/security owner: review exact migration and authorize live allow/deny verification. |
| Database: identity/completeness/history | Four migration ledger checksums need reconciliation; 36 legacy rows need versioned roster reseed. Local DB tests do not prove live state. | DB owner: reconcile ledger and identity rows with retained audit receipts. |
| Database: query and evidence lifecycle | Index/query-plan, pagination completeness, promotion and retention proof missing. | DB owner: measure approved queries and prove complete digest-identified persistence. |
| Release: reviewed exact head | PR278 prerequisite integration decision pending; this candidate exists only locally. Hosted CI has not seen this exact head. | Release owner: review commits and obtain publication authorization before push/PR. |
| Release: deploy/cache/rollback/repo parity | No candidate deployment. Protection/dependency-install policy review and primary/backup head/tree reconciliation pending. | Release owner: after authorization, verify exact deployed bytes, cache upgrade and rollback on primary then backup. |
| News/tournament: reliable published provenance | Current main news preserved. Hosted refresh/failure/deployed-feed behavior not checked; Worlds replay coverage incomplete; community data remains review-only. | Source/release owners: capture refresh failure and deployed-feed evidence; complete reference coverage. |
| Beginner experience: core comprehension and recovery | Bounded automated mobile flows only. Fresh-user task comprehension, starter results, back/reload and error recovery not measured against declared thresholds. | UX owner: run a small real beginner/competitive-user study with predeclared tasks and thresholds. |
| Beginner experience: accessibility/resilience | Keyboard accessibility, network/DB failures and rapid interaction matrix incomplete. | UX/QA owner: targeted failure and keyboard audit; retain mobile evidence. |
| Evidence Brain: trustworthy end-to-end learning loop | Deferred until simulator gates. Evidence-to-validated-analysis-to-feedback-to-improvement-pack flow not proved end to end. | Evidence owner: use a real failure through a controlled fix/test/release loop, with citations and invalidation. |
| Evidence Brain: private coaching workspace | Lead/lineup/turning-point/drill and private Trainer room consolidation awaits evidence and ownership gates. | Product/evidence owners: promote only supported claims; feedback cannot override mechanics or self-train production. |
| Optional expansion | Deferred; not a blocker to the bounded free doubles lab. Accounts/sync, subscriptions and LLM learning require separate need/privacy/cost decisions. | Product owner: keep deferred; no spending or expansion in this slice. |

## Validator correction discovered by final stress

The first final accuracy sweep failed with two order discrepancies (doubles00493
turn7 and doubles00967 turn6). Both are mid-turn Sitrus/Unburden: Speed189 becomes
378 before the compared move, ahead of Venusaur264 or Rotom212. The engine order
was correct; the validator still compared turn-start Speed. A narrow legacy-event
handler now requires unchanged stable identity/ability/item, false-to-true
consumption, unique active name, exact prior Sitrus restoration and sufficient
recomputed Speed. It declines suppression and mixed modifier/switch cases.
Later fainting does not invalidate the earlier activation. Priority checks remain.
Independent review approved the helper: focused suite32/32, both retained artifacts
with strict identity and eight independently corrupted controls. The focused
regression failed before repair and now passes, including negative
controls for timing, identity, ability, consumption, ambiguity, insufficient Speed,
Trick Room and Neutralizing Gas. Original failed sweep receipt is retained under
`poke-sim/artifacts/v221-policy-goldens/accuracy-before-unburden.json`.
The initial full project run also encountered a documentation link before its target
was written; the completed roadmap/link suite now passes 15/15. These failed runs
are preserved and are not reported as passing.

## Final verification

- `npm test`: 235 fast test files and12 local DB test files passed;4 manual/helper
  files skipped. Receipt `v221-final2-project.log`. Validator suite32/32 is included.
- `npm run test:battle-audit`: passed for declared scope; receipt
  `v221-final2-battle.log`. Partial and gap families remain unproved.
- `npm run test:accuracy`: 2,312 doubles +2,312 singles shared-mechanics runs;
  34 repeat checks per format; zero state failures, validator errors/warnings or
  repeat failures. Receipt `v221-final3-accuracy.log`; retained report at
  `poke-sim/artifacts/accuracy-2026-08-30/cross-format/report.json` (historical directory
  name; report/provenance identify this run). Singles is not doubles product proof.
- Release12/12, external assets and bundle bytes independently verified. Roadmap
  15/15, generated roadmap check, changed JS syntax and `git diff --check` passed.
- Browser3games/4pairs/62turns/4,343checks, zero mismatches/errors. Both390px/1440px
  light/dark layout checks showed no sampled low contrast or Pokemon overflow.
  Offline helper loadedv221. All agent-run games have paired evidence.
- Independent reviewers: battle_review_v216 (Helmet and validator), move_reviewer
  (default boundary/goldens), release_review_v216 (artifact/docs). No open review blockers.

No standalone lint or type-check script is configured;
JavaScript syntax checks are not a substitute for static type checking. Live DB,
production services, hosted exact-head CI and deployment checks are not run.
