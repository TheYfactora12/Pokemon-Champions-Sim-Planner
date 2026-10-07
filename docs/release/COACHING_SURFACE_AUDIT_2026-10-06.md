# Coaching Surface Audit

## Scope

Follow-up to PR219/v182. Static inspection plus focused regression testing;
not a claim of whole-app or competitive coaching accuracy.

| Surface | Finding | Disposition |
| --- | --- | --- |
| Strategy and printable report | Legacy templates/grades unsupported | v182 evidence-only view; preserve saved data |
| Pre/in/post coach | Explicitly withholds best plans and root causes; labels position heuristic | Preserve existing bounded wording; not independent replay parity proof |
| Inline Pilot Notes | Aggregate observations, not matchup prediction | Keep observational scope; legacy outcome labels still require historical caution |
| Replay summary | Explicit insufficient-evidence fallback | Do not invent alternatives |
| QA Brain summary | Opportunity count created confidence and causal prescriptions | v183 withholds causality/confidence; recommends evidence review only |
| Branch move analysis | Sample-volume strength labels and replacement signals | Open: identity, coverage, alternative availability and paired outcome contracts required |
| Legacy report APIs/history | Retain unvalidated templates and old stored summaries | Open: migration/consumer inventory before re-enabling or external reliance |

## First Safe Recommendation

The QA Brain may recommend inspecting underlying action events and participant
identities. It cannot prescribe a better move, promise a result, or infer player
skill from ledger totals. No amount of volume promotes this recommendation into
competitive confidence. Rebuilding tactical recommendations requires immutable
team/format/ruleset/build identity, legal available alternatives, referenced
events, tested comparison policy, uncertainty, and stale-evidence invalidation.

## Print Verification

The Team Evidence view now has a direct Print team evidence command, bound to
the displayed team rather than a later mutable selection. The real page has a
single print container and print-specific readable colors. Regression tests
verify report contents, explicit team targeting and print invocation. The
connected browser exposes no print-media emulation/PDF capability; source and
mock tests are not visual verification of browser pagination. Record a real
print-preview result before closing this gate.

Manual checkpoint: the local v183 button click timed out in the browser tool;
the user confirmed "Print preview opened and looks readable." This is user
visual confirmation of that local preview, not agent-inspected pagination or
production/device-wide proof. No printed file was retrieved.

## Remaining Gates

Verification checkpoint: final local project gate passed, including the offline
database contract gate (not live database verification). Independent review
reran 32 Strategy/print tests and 12 export tests successfully. The first full
run caught a changed tactical_interpretation schema; the existing object schema
was restored before the final passing run. Browser print readability is the
human confirmation recorded above. Deployment proof belongs in the release PR.

- Hosted print invocation/readback; local preview readability confirmed by user.
- Branch analysis and legacy report consumer correctness.
- Reintroduce tactical suggestions only with tested evidence contracts.
- Paired live replay/export verification remains separate.
