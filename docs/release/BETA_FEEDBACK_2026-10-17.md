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
