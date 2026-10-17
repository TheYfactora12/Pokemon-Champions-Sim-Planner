# Startup hardening candidate - October 17, 2026

Related: #271, PR272 and the October16 trust recovery execution plan.
Candidate build: v2.2.214-startup-diagnostics; engine1.1.19 unchanged.

## Evidence and bounded repair

The original October16 browser visit showed an undefined `player` lookup at
`teamMatchesFilter`, after which reload recovered. Five production reload probes
on October17 passed without a page error. Independent source/VM inspection did
not establish why the original UI initialization stopped before its registry
assignment. Do not describe cache timing as a proven cause or close #271.

The production filter regression failed before the repair with the same exception.
Replace its late-initialized object with a hoisted membership function, preserving
all seven intended keys, custom-team exclusion and visibility checks. Prototype
names cannot count as tournament teams. The filter no longer needs that state
assignment, including during partial initialization.

The error banner previously replaced the first exception with later errors.
Retain the first error in memory and render it through textContent, without
persisting or transmitting diagnostics. Independent review caught an initial
conversion regression for null-prototype rejection objects; tests reproduced it,
then guarded conversion with a plain-text fallback repaired it. A reload starts
a fresh diagnostic. No runtime error is silently declared resolved.

## Tests and release gates

- Focused filter:29 assertions pass; absent-registry condition failed before patch.
- Error reporter:12 assertions pass, including absent DOM at first report,
  repeated errors, rejection-first, text-only rendering, null-prototype and
  throwing-toString reasons. Conversion regression failed before correction.
- Local browser:10 desktop reloads and10 at390x844 completed Home rendering
  without console errors. Both navigated to Teams and rendered the three visible
  Tournament-filter entries. These are Chromium viewport checks, not real Safari
  or touch-device certification. No battle was run or team registration changed.
- Fresh localhost origin completed startup; subsequent v213-to-v214 load worked.
  Broader interrupted-load, existing-save, offline and cache-transition matrices
  remain incomplete. Do not infer a universal startup repair from these checks.
- Local aggregate passed:226 fast test files and12 offline DB files, zero failures.
  The reporter conversion correction occurred during that run; final focused
  reporter/filter tests were rerun. Final immutable-head hosted CI remains required.
- Final release manifest:12/12; team round-trip:41/41 with408 member checks.
- Independent review approved the bounded hardening after the conversion repair.
  Reviewed bundle SHA256:
  `cb6c16fe3cd2066214d2dc7bceeee9e4fd3cc88a69523b8b0b8890f4bbbc782e`.
- At candidate submission, hosted CI and live receipt were pending; resolved below.

## Deployed receipt

PR272 merged as `b7f668f56a3f98402118da1a3bd337b08ec96024` with reviewed
head `1f164b82a5bafe8a94ba8de8e30ac354d199b50a`.
Final PR CI39003446904 (including battle audit), bundle39003446922 and
cache39003446901 passed. Main CI39003792247 and Pages39003792322 passed.
Supabase Preview was skipped, not passed; this is an unchanged local-save release.

HTTP alignment at2026-10-17T04:49:21.118Z passed for the deployed bundle,
manifest provenance and all five tracked external assets. Browser verification
then showed v214, completed Home rendering on five repeated reloads, and rendered
Rin Sand after selecting the Tournament filter. Zero captured console errors.
Four existing custom teams remained listed; no edit, import, battle or bring/lead
selection occurred. This is not exhaustive saved-state or battle parity proof.
One initial automation locator mistakenly requested an animation button instead
of the actual checkbox; corrected to the visible Start Team Test control. This
was a harness selector failure, not an observed application startup exception.
News still labels three unavailable sources; freshness was not certified here.

## Next diagnostic: priority suppression

Run `node poke-sim/tools/audit-priority-suppression.mjs` from repository root.
This diagnostic is not a pass/fail release suite; completion is not mechanics success.
The retained15 synthetic forced-action probes against pinned Showdown0.11.11
reproduce nine PP/event disagreements involving Mold Breaker, Neutralizing Gas
and priority-blocking abilities. Six controls agree on blocking but expose the
comparator counting blocked `[still]` announcements as resolved moves.
No exact random HP equality is claimed. Ability Shield ownership must be evaluated
on the blocker, not just its protected ally. Issue264 retains the evidence summary.
Next: add failing formal regressions, repair shared active-ability semantics,
cover side swaps/direct targets/suppression removal, independently review, then
release through the same gates. No engine fix is included in this diagnostic.

## Scope, rollback and next action

No engine, rules, approved sources, database permissions or save data are changed.
Generated roadmap now points to startup investigation followed by policy audit.
Rollback through reviewed deployment to v213 if changed journeys regress; preserve
saves. News may refresh independently, so compare immutable commit bytes rather
than assuming build ID alone implies an identical bundle.

After the scoped release, collect the first exception on any recurrence of #271.
Then continue #264: existing priority/Imprison policy fixes are already present;
audit remaining information boundaries and choice provenance rather than repeating
those repairs. The policy explicitly declares full registered state, not human
hidden-information play. No team-strength verdict follows from this patch.
