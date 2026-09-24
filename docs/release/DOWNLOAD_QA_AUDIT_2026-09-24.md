# Downloads QA Intake And Built-In QA Review

## Workflow

Run `npm --prefix poke-sim run qa:downloads` after exporting from the site.
It reads the newest matching QA file directly in the current user's Downloads,
without recursively scanning other folders, deleting files or uploading data.
Pass an exact file path after `--` to select a specific export. This is an
on-demand command, not a background watcher. Browser download location remains
controlled by browser settings; the website cannot force an arbitrary local path.

Reports are written under ignored `poke-sim/artifacts/download-audits/<sha256>/`.
The command also produces `player-report.md` (plain-English results and next
actions) and `ai-review.json` (compact, versioned handoff with finding IDs,
bounded evidence pointers, the source fingerprint and explicit untested areas).
Both derive from the same audit. The compact handoff omits local paths, raw
teams, full logs and embedded recommendations from the untrusted source export.
Another AI still needs the original evidence for exact reproduction; the small
file is an index, not a replacement for raw proof. These companion outputs are
currently local intake features, not download buttons on the deployed website.
Eight focused intake/handoff tests pass after adding the companion outputs.
The original export is unchanged. JSON reports retain finding locations; Markdown
provides a short review. Do not commit private raw evidence or local paths.
Exit 0 means the supported structural checks completed, potentially with review
warnings; exit 1 means validated structural errors; exit 2 means intake failed.
None is a release approval or a game-accuracy score.

## Supplied Export

- `champions-sim-qa-artifact-2026-09-24T15-52-26.json`
- 110,269,238 bytes; SHA-256 `bd6ee690dc4412df861c754220d49e240a4ed6ad50a8bc014fb1af379f198239`.
- Exporter: live `v2.2.142-pp-replay-proof`; tactical-sweep artifact.
- 240 retained replay cards independently checked with strict stable-field validation.
- Retained scope: 1,300 turns, 3,245 damage events, 2,213 effect events.
- Zero turn-log validator errors or warnings. Report outcome: `needs_review`.
- Top-level totals additionally include targeted-sweep evidence; they are not
  the retained-card denominator. The retained coverage totals agree with raw cards.
- Per-card engine/ruleset/regulation fields are absent; exporter build does not
  establish historical execution identity. History includes older executions.
- Forced branch matrix is `blocked_regulation`; production gate rejects launch.
- The exported tactical evidence includes previously stored branch rows. Row
  volume and `ready_for_codex` are not independent correctness tests.

This is not the single replay from the earlier interactive audit, and is not
paired visual/JSON proof for it. No finding from that audit is closed by this file.

## Built-In QA Corrections Still Needed

1. Give every QA run an immutable execution envelope: run ID, engine version,
   ruleset fingerprint, regulation, selected team versions, seeds and policy.
2. Separate fresh-run results, retained historical replays, targeted fixtures and
   stored database branch evidence. Never pool them into a claimed fresh sample.
3. Replace readiness inferred from event presence with named assertions carrying
   pass/fail/blocked/unsupported results. Preserve blocked regulation tests.
4. Add a small export mode for one fresh run plus failure cases. The 110 MB file
   is useful diagnostically but cumbersome for routine user feedback.
5. Couple manual QA to exact replay downloads and visible comparisons, including
   the same-name replacement/Protect/faint defects recorded in the live audit.
6. Test malformed exports and intentional faults before trusting a green badge.

## Changes And Verification

Added `tools/audit-qa-downloads.mjs`, package command and five regression tests.
Tests cover unknown/empty evidence, misleading readiness labels, incorrect
retained counts, mixed coverage denominators and latest-download selection.
Existing 30 turn-log-validator regressions also pass. The project gate discovers
the new `.mjs` suite automatically.

Final verification: `npm run test:fast` ran 182 test files with zero failures;
four manual/helper files were skipped. Downloads auto-selection and explicit-file
intake both read the supplied file and produced the same `needs_review` outcome.
This gate excludes live DB verification and the separately gated battle matrix.

The first local auditor incorrectly compared full-artifact totals against retained
cards and reported mismatches. Code inspection established the scope difference;
the comparison and regression were corrected before retaining this result.

No browser bundle, mechanics, live database or deployment changed. Built-in QA
redesign is an open implementation task, not a completed feature.

## Pre-Push Adversarial Review

Independent read-only review reproduced three intake defects: an empty turn
object could pass vacuously, null/history shapes could abort the audit, and a
nested build value could smuggle private content into the compact AI pack.
Corrections require before/after roster and event/action shapes, retain indexed
malformed-history findings, and allow only bounded identifier strings for the
shared export build and filename. Eleven focused tests pass after these changes;
the supplied artifact was rechecked and remains `needs_review` with zero invalid
retained replays. The earlier 182-file fast-gate receipt predates these final
hardening changes; hosted CI must validate the pushed revision separately.

The live replay display findings remain open. Neither this intake repair nor a
green CI run certifies mechanics, approves M-C or changes the live site.

## Full Match Evidence Follow-Up

The intake command now also emits `full-ai-evidence.json`, preserving the entire
parsed original payload without removing or rewriting fields. An indexed match
map points to each before-state, selected action list, recorded event sequence,
damage calculation, effect sequence and after-state. Repeated same-name events
are not deduplicated. Coaching and source prompts remain explicitly untrusted.

For manageable AI context windows, `matches/match-NNNN.json` is a self-contained
recording of one retained match; `matches/match-NNNN.md` lists all its recorded
turns, full before/after snapshots, action selections, events, damage modifiers,
effects and engine text. The original source hash binds these files to the export.
These detailed files intentionally contain raw team/battle data. The earlier
privacy-minimized `ai-review.json` remains a separate compact index. Nothing is
uploaded; do not share detailed evidence without reviewing its contents.

Recorded trace inspection is available; exact engine re-execution is BLOCKED.
The current exports lack a verified canonical initial-input/RNG-restoration and
decision/replacement-policy contract. Per-match engine/ruleset/regulation IDs are
also absent in the supplied artifact. A seed and snapshots alone must not be
presented as deterministic re-simulation proof. Reference comparisons and
counterfactual move choices remain untested.

Fourteen focused tests pass, including lossless raw-field preservation, repeated
event multiplicity, valid full/single-match evidence pointers and Markdown fence
safety. The supplied export generated 240 detailed match packages. Raw artifacts
remain ignored and local; website export integration is not implemented here.
Actual generated-file readback confirmed lossless original-payload equality and
resolved every evidence pointer across all 240 matches / 1,300 turns. The full
file is 117,282,722 bytes; the first individual match is 306,680 bytes. Prefer
individual matches when an AI cannot accept the full file.
