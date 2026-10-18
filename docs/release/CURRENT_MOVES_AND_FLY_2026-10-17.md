# Current Move Corrections And Unsupported Fly — 2026-10-17

Local candidate only: v2.2.217-current-moves, engine 1.1.21,
Practice ruleset champions-practice-v2. Base main f167437003f869d04e325b09b4b3306245adb4cc.
No push, remote PR, merge or deployment is part of this receipt.

## Evidence and scope

[Nintendo's official update notice](https://www.nintendo.com/en-gb/Support/Purchases-Subscriptions/Games/How-to-Update-Pokemon-Champions-3079895.html)
records v1.2.0 effective September 9: remove Politoed/Pound and
Archaludon/Mirror Coat/Metal Burst; Wish and Strength Sap PP change 12 to 8;
Slash becomes usable. This does not establish every species' Slash eligibility.
That portion remains reference-only, pinned to M-C
`efe4948570d5e8189751792136d26e71710c6c66`.

Current Practice applies a distinct overlay; generated historical 0.11.11 pools
remain unchanged. Explicit ruleset context reaches Pokemon construction before
PP initialization. M-C reference already has these six corrections.

Fly's two-turn lifecycle lacks Champions proof and implementation. All registered
Fly users, including omitted bench members and accepted spelling aliases, block
simulation before any turn, damage or outcome. Forced Fly also blocks. The error
states unsupported simulation, not an official move ban. Team records stay intact.
Mega sweep and Monte Carlo errors cannot create completed recommendation samples.

## Verification

Initial regression: 12 failed, 2 passed (six admission/PP errors and six fabricated
Fly outcomes). Expanded focused suite: 26 pass at first review-complete checkpoint.
Final aggregate, source-truth, battle audit, accuracy and browser receipts are
recorded below when complete. Two intermediate aggregate failures were corrected:
the source assertion expected the old Practice pool; the isolated UI fixture did
not load the now-required pinned reference. Assertions were updated to require
new provenance, and fixture loading now matches the browser dependency.

## Boundaries

No full game-accuracy or competitive-strength claim. Voluntary switching,
hidden-information policy, simultaneous Mega ordering, broader move mechanics
and complete primary stat/data evidence remain open. No production data approval,
paid service, AI Labs or unrelated project changes. The separate engine-hash
receipt correction remains untouched in the prior checkout.

## Final candidate receipt

- Focused move/PP/Fly suite: **27 passed**. Actual JSON intake suite: **12 passed**,
  including all six patch cases. Explicit historical and SV contexts preserved.
- `npm test`: **229 fast files + 12 offline DB files, zero failures**; four
  manual/helper files intentionally skipped. Final log: `repair-project-gate-complete.log`.
- `npm run test:source-truth`: passed. `npm run test:battle-audit`: passed for its
  declared bounded scope; partial/gap families remain unproved.
- `npm run test:accuracy`: 2,312 doubles games and 2,312 isolated singles games;
  zero state failures, validator errors/warnings or repeatability failures;
  34 repeat checks in each lane. Singles do not establish doubles parity.
- Release manifest: **12/12 passed** on host. A sandbox-only attempt could not
  create its temporary Git checkout; host rerun completed without a waiver.
- Roadmap: eight milestones match source. `git diff --check`: passed.
- No standalone lint or TypeScript check is configured in package scripts.
  Live database/security checks, deployment and real-game Fly parity were not run.
- Independent season, battle and release reviews found no scoped blocker.

Browser artifact directory: `poke-sim/artifacts/browser-replay-1whRXt` (local,
ignored). Three games, four paired downloads/visible replays, **3,502 checks**,
50 captured turn rows, zero mismatches and zero page errors. Includes actual
current-Practice Slash/Wish import and execution, visible Fly rejection with the
saved team retained, M-C reference games and historical replay continuity.
The Practice export identifies engine 1.1.21 and champions-practice-v2.

Bundle SHA-256:
`b3f9ad4e9a7cad76719ff690df3fbcd3abfc167974c437cf6ae402344aa96483`.
Bundle size 11,534,197 bytes remains below the unchanged 11 MiB gate. Shortened
comments/roadmap copy recovered space; no test threshold was raised.

Intermediate checks also exposed actual historical-pool intake disagreement,
fixed in the shared UI context helper, plus omitted reference dependencies in
isolated UI bootstraps. Final tests load the browser's dependency and retain
all behavioral assertions. The accuracy manifest was updated to Practice v2.
No production approval, push, PR, merge or deployment occurred.
