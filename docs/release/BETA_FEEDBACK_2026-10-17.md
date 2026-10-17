# Visible beta feedback route

## Scope

v2.2.216-beta-feedback keeps engine 1.1.20 and all mechanics/data unchanged.
The public app previously had no discoverable bug-report destination across its
11 tabs. A shell-level **Report a bug** link now opens the primary repository's
Issues page in a new tab. Visible copy explains GitHub sign-in and public reports.
The link has a 44px minimum target, keyboard focus outline and accessible help.
It does not upload teams, replays or credentials, or create an issue automatically.

Kevin explicitly authorized adding and publishing this link on October 17.
This is not authorization to change mechanics, approve regulations or make a
complete-Champions-accuracy claim. The original nine-defect notice is not added.

## Candidate evidence

Baseline: main `4b18b0656ebcf7d9bf77754fcadab633fdbe7cde`, v215.
Owner task was idle and no open PR duplicated feedback work. GitHub reports
Issues enabled on the verified primary repository.

Local browser checks cover 390px touch and 1440px desktop, dark/light themes,
keyboard focus, no horizontal overflow, all 11 tabs, reload and opening the exact
Issues destination. Local team workflow: two games, three actual Download JSON /
visible-DOM pairs, 21 paired turns, zero mismatches or page errors.

The first aggregate/audit run caught a stale UI export-version fallback; it was
corrected before publication. Sandbox-only temporary Git writes also failed;
these are not passing tests. Final host aggregate passed 228 fast files and 12 offline DB files (four manual
helpers skipped). The declared battle audit and accuracy invariants passed; see
[the separate accuracy sweep](CHAMPIONS_ACCURACY_SWEEP_2026-10-17.md) for their
limits and material findings. Independent release review approved this narrow
change; release-manifest 12/12 and Overview 11/11 passed independently. Changed
JavaScript syntax and diff checks passed. No separate lint/typecheck script is
defined. Hosted CI and live checks are pending here.

Bundle SHA-256:
`a9759750654a4cc73426654579c797da683549d2ceb8e515305b57e984749b3a`.

## Claim boundaries

Feedback availability does not establish game accuracy. The broader read-only
sweep finds materially incomplete Champions evidence and gameplay coverage;
these remain independent of this small UI release. Reference-suite results are
not observed game-client parity or a defensible 99% accuracy estimate. Keep the
existing preview/uncertainty labels and do not advertise complete M-C readiness.

Production DB, paid services and social posting are outside scope. Rollback is a
reviewed revert to v215 runtime bytes from the baseline above, preserving saves.
After deployment verify exact artifact/assets and the live link, then append the
receipt in a documentation-only change without another runtime version bump.

## Deployed verification

PR [276](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/pull/276)
merged reviewed candidate `3d3b4af9893f4e1d437d7589365fbed7ef9649cb` as
`35855867fe98d6566ea342762e85e7ee6a880e8d`. PR CI 39012887704, bundle
freshness 39012887654 and cache gate 39012887656 passed. Pages 39013211933
and main CI 39013211926 passed. All eight deployed files matched exact committed bytes at
2026-10-17T07:22:50.328462Z; bundle hash is the v216 hash above.

The actual Report a bug link opened the primary Issues page at 390px touch and
1440px desktop, both themes, with keyboard focus and all 11 tabs checked.
18 fresh/reload startup visits had zero page errors. A separately retained v215
profile upgraded to v216, removed the old app cache, preserved a local-storage
sentinel and loaded the app/reference helper offline. This is not exhaustive
saved-team migration evidence; this release changes no persistence schema.

Two live games produced three actual downloaded-JSON/visible-DOM pairs across
15 paired turns: 1,191 observable comparisons, zero mismatches or page errors.
Import, invalid-roster rejection, bring-four/two-leads, swap continuity and offline
reload passed. Coaching explicitly returned insufficient evidence for alternative
actions. This confirms an inspectable model workflow, not real-game correctness.

The official-update admission and Fly/Mega diagnostics were rerun on the merged
revision; the unchanged engine and data preserve those documented blockers.
The public bug-report route is shipped. Current-Champions accuracy remains
no-go as detailed in the separate sweep. No mechanics repairs, official approval,
production DB writes, paid services or social posts were included.
