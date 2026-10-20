# Consolidated continuation candidate — 2026-10-20

Unpublished v2.2.224-replay-resilience / engine1.1.27 on
`fix/default-policy-and-contact`, continuing v221 at
`fc0850b02c0e45230e6a66c8e42544fe0114542a`. Main base remains
`ae3f52ce481924512bff523fdcef75d04935b7a3`; all earlier move/Fly, utility,
pivot, diagnostic, Helmet, default-boundary and validator repairs remain included.
PR278 prerequisite integration and exact-head hosted checks remain separate gates.
No push, remote PR, merge, deploy, spending, live DB writes, security/access changes,
external messages, optional expansion or Evidence Brain work occurred.

## Authorized slices completed

1. `414d257`: development-only scripted single switch. Explicit stable replacement,
   both-side frozen choices, enemy/ally slot targeting, no switcher/incoming move or
   PP spend, structured event and fail-closed admission. Helper is not shipped to
   browser or aggregate runner. Independent review found and closed delayed-action
   admission bypass. [Details](SCRIPTED_SWITCH_2026-10-20.md).
2. `d840232`: supported ordinary shared mechanics. New pinned tests reproduced
   18/36 failures: Natural Cure absent and Regenerator healing under Gas. Add cure
   and counters plus scoped Gas/Shield handling. Expanded64/64 reference cases and
   extended63/63 diagnostic cases pass independently. [Details](SWITCH_OUT_HOOKS_2026-10-20.md).
3. Replay resilience: keyboard headers, expanded state and visible focus; coalesce
   pending saved-log reads and display retry after failure. Unit failure reproduced
   two simultaneous reads, then passes after repair. This is mocked local DB-read
   behavior, not live DB verification. Browser pre-fix confirmed inaccessible
   header after one fully paired game (`browser-replay-NaUa1D`). Two earlier server
   startup timeouts produced no games and are not product failures.

No unsupported mechanic was enabled to satisfy a test. Incoming sleep/freeze,
unknown field/lifecycle, simultaneous switch/Mega and other unproved cases reject.
Synthetic custom-game teams deliberately isolate mechanics and do not prove legal
Champions registration or official client parity. The automatic policy remains v4;
no automatic switching or public switch control was added.

Bundle:11,534,293 bytes; SHA256
`82c548756e5d58c559089c082a47a17b1f0561e57ddf6e2d46f46602aedeaf30`.

## Final verification

- Full project passed: 238 fast test files and 12 local DB test files, zero failures;
  4 manual/helper files skipped (`v224-project-final.log`, exit 0). Live DB and
  three administrative hardening checks remain unverified. Initial run:
  238 fast files, one test-harness failure (new header helper not loaded by an
  extraction fixture);12 local DB files passed. The fixture now loads the real
  helper and tests keyboard activation/ARIA as well as nested-control isolation.
  Focused replay lifecycle and resilience tests pass. No runtime change was needed.
- Battle audit passed (`v224-battle.log`), including scoped reference cases, golden
  traces and curated seeded matrix. Accuracy:2,312 doubles +2,312 singles shared
  mechanics,34 repeat checks per format; zero state/validator/repeat failures or
  warnings (`v224-accuracy.log`). Singles is not doubles product validation.
- Focused mechanics independently pass64/64 shared-hook and63/63 diagnostic tests.
- Independent release review passed12/12 checks, external assets, bundle bytes and
  focused resilience. Diagnostic helper remains absent from browser/deployment assets.
- Final browser `browser-replay-GKLGuj`:6 games,7 pairs,125 turns,8,566 observable
  checks; zero mismatches/page errors. Keyboard Enter/Space and ten rapid toggles
  pass on each captured card. Eight immediate run clicks produce one game.
  Malformed JSON shows an error without changing team count; rejected ruleset/Fly
  runs produce no games and clear stale errors when corrected. Imported teams
  persist through reload; offline helper loads v224. Both390px/1440px light/dark
  checks show no sampled low contrast or Pokemon overflow; mobile screenshot inspected.
- All browser attempts retain paired evidence: pre-fix `browser-replay-NaUa1D`
  1game/1pair/23turns/1,538checks; first expanded attempt `browser-replay-f9Az81`
  3games/4pairs/65turns/4,531checks before harness selected a nonexistent team option.
  Both have zero replay mismatches. Corrected harness uses context-available imported
  teams. Across this continuation:10 games,12pairs,213turns,14,635checks; no unpaired
  game. The two earlier server timeouts produced zero games.
- Roadmap15/15, source/output check, JS syntax and diff checks pass. Upstream main
  was read-only rechecked at ae3f52ce481924512bff523fdcef75d04935b7a3.

Independent reviewers: battle_review_v216 (switch and hooks), release_review_v216
(UI/release). No remaining review blocker. Real-user comprehension, assistive
technology coverage and live DB behavior are outside the bounded local audit.
No standalone lint/typecheck scripts exist; syntax checks are separate. Live DB,
hosted exact-head CI, real client captures and deployment checks are not run.

## Acceptance register

Status describes this local candidate or explicitly historical evidence. Database,
hosted services and deployed behavior were not freshly audited here. Each row names
what must be supplied before its gate can close; local mocks do not close live gates.

| Milestone / acceptance gate | Status and concrete blocker | Owner / next action |
| --- | --- | --- |
| Simulation: declared benchmark has no critical mechanics errors | Partial. Matrix has 64 cases: 18 covered, 41 partial, 5 open. Mid-turn Speed/stages, Mirror Armor/Contrary, fixed moves, entry/residual, Grudge/Disable/berries and import edges still lack complete scoped proof. | Engine owner: select the next declared benchmark, retain counterexamples and add reference regressions. |
| Simulation: policy evidence supports recommendation claims | Boundary fixed locally; strength unverified. No approved closed-reveal versus open-sheet contract or public event ledger exists. Strategy cache context mixing/misleading coaching remain broader audit gates. | Product + policy owner: decide visibility scope, stable identities/reveal cutoffs and benchmark denominator before richer policy. |
| Simulation: voluntary switching | Development-only one-switch execution now has 63 reference/admission tests. Public/automatic switching remains absent. Simultaneous switches, switch-plus-Mega, hazards, traps and incoming sleep/freeze contexts reject; broader lifecycle and client proof remain missing. | Engine owner: expand only individually evidenced contexts; human evidence owner supplies approved Champions captures before public enablement. |
| Simulation: simultaneous Mega order | Candidate choice fixed; execution remains player then opponent. Champions same-priority/tie/weather-ability capture evidence is missing. | Evidence approver + engine owner: approve captures before choosing semantics. |
| Simulation: complete contact and game-stat parity | Helmet bounded cases pass; general contact-effect ordering, Magic Room/Embargo and broader Rough Skin suppression are not proved. No complete official client corpus/accuracy denominator. | Battle auditor: expand named cases; human evidence owner supplies approved client captures. |
| Simulation: visible replay parity | Expanded local6-game/7-pair sample passes; broader complete-game corpus remains incomplete. | QA owner: pair every sampled DOM game with its exported log and report uninspected scope. |
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
| Beginner experience: accessibility/resilience | Replay keyboard access and mocked saved-log read failure/retry are repaired. Bounded rapid-run, malformed import, reload and offline checks pass. Full accessibility and real network/DB matrix remain incomplete. | UX/QA owner: targeted failure and keyboard audit; retain mobile evidence. |
| Evidence Brain: trustworthy end-to-end learning loop | Deferred until simulator gates. Evidence-to-validated-analysis-to-feedback-to-improvement-pack flow not proved end to end. | Evidence owner: use a real failure through a controlled fix/test/release loop, with citations and invalidation. |
| Evidence Brain: private coaching workspace | Lead/lineup/turning-point/drill and private Trainer room consolidation awaits evidence and ownership gates. | Product/evidence owners: promote only supported claims; feedback cannot override mechanics or self-train production. |
| Optional expansion | Deferred; not a blocker to the bounded free doubles lab. Accounts/sync, subscriptions and LLM learning require separate need/privacy/cost decisions. | Product owner: keep deferred; no spending or expansion in this slice. |


## Authorized draft-review reconciliation

Publication for draft review was subsequently authorized; merge, deployment and live
DB/security changes remain unauthorized. Main advanced to
`3eb6ab1ce7f026a82934901ac386ae46505c3dde` through two news-only updates. Merge
`014524a` retains those updates and all v224 repairs. Rebuilt bundle: 11,534,312 bytes,
SHA256 `79b6dcf629c3cadfe1b0fb2ec498ed91dee869ee2da97c48f559dbfa608f57b1`.
The earlier bundle hash describes the pre-reconciliation snapshot.

PR278 remains open/draft and is preserved. Its functional repair commit `4bfeed9`
and local `9b1a307` differ only in news/generated release artifacts; PR278 head
`8282089` additionally contains its dated publication note. This consolidated
review includes the repair, and does not close or overwrite PR278. Reviewers must
choose integration order before merging; neither PR is authorized to merge.

The [Supabase grants assessment](SUPABASE_GRANTS_READINESS_2026-10-20.md) records
source-proven fresh-schema risks, exact proposals and 15 passing offline checks.
No migration or permissions change was made; disposable PostgreSQL was unavailable.
