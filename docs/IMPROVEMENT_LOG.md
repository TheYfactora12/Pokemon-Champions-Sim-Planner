# Improvement Log

## IMP-0072: QA Brain Uncertainty And Team-Bound Printing (#209)

October 6 v183 candidate. QA Brain opportunity volume no longer creates
confidence or causal coaching. Ledger observations remain inspectable; only
evidence-review steps are suggested, not a better move or promised outcome.
Team Evidence printing is directly accessible and bound to its displayed team.
See [surface audit](release/COACHING_SURFACE_AUDIT_2026-10-06.md) for open branch
analysis, legacy report and browser print-layout gates. No mechanics changes.

## IMP-0071: Withdraw Unsupported Public Strategy Claims (#209)

October 6 candidate v182. Browser inspection found invented tactical templates,
roster-based 10/10 legality and quality scores, and confidence inferred from
sample volume. Public Strategy and printing now share an evidence-only report:
current sets, exact team/format/registration-matched player action attempts,
unknown confidence and no claimed legality. Old cached reports cannot bypass
this boundary. Saved teams/history remain untouched; legacy template functions
remain for audit but are not called by these public report paths.

Tests cover unsafe cached output, exaggerated volume, team/format isolation,
set edits and printing. This withdraws unsupported advice rather than claiming
the templates have become accurate. Re-enabling each recommendation requires
an evidence contract and correctness fixtures. Other replay and simulator advice
surfaces need separate review; this is not a whole-app coaching certification.

Lesson: when a model of advice is unvalidated, remove its authority at every
affected presentation path instead of adjusting a confidence badge.

## IMP-0070: Bind Move Observations To Registered Player Actions (#209)

October 6 candidate v181. The legacy move-gap helper searched winning prose
for names, conflating sides and duplicate names and excluding losses. New
battles retain a detached player registration snapshot. Move observations need
an exact current-registration match plus an unambiguous player participant
stable key and original team slot. Reordered/edited sets and legacy logs fail
closed. Any missing action evidence remains unknown, never zero executions.
Recorded attempts include blocked moves and do not establish successful use.
PDF, coaching and dashboard no longer recommend a swap from absent log text.
Historical exports remain unchanged; no battle execution or legality changes.

Regression covers legacy prose, losses, mirror names/sides, duplicate identities,
changed nature and missing action keys. Release PR owns final gate and deployed
journey proof. Exact JSON registration matching is intentionally conservative;
equivalent sets with different serialization can produce unknown observations.

Lesson: identify the registered participant before interpreting an action, and
separate an observed attempt from success, usage completeness and team quality.

## IMP-0069: Report Outcomes Without Inventing Causes (#216)

October 6 candidate v180. Live v179 replay used opponent-only Tailwind, yet
reported a player Tailwind Win. The result classifier searched both sides' prose;
it also treated any Trick Room appearance and total faint count as causal proof.
New count-resolved player wins record Opponent team defeated or Pokemon-count
advantage instead. Timer and HP resolution remain unchanged. UI uses Recorded
outcome; the legacy winCondition export key remains compatible. Historical
exports are not rewritten and can retain unsupported old labels.

Regression covers player/opponent Tailwind and Trick Room in synthetic one-turn
fixtures. These prove outcome-label behavior, not legal teams or game parity.
The live v179 replay download timed out and was not paired with its visible log.
Independent review, final tests and deployment proof belong to the release PR.

Lesson: a move appearing in a winning battle is not evidence that it caused the win.

## IMP-0068: Validate Onboarding Samples And Bind Editor Drafts (#213)

October 6 candidate v179. Live user-journey testing found a sample rejected by
the same import checker and an editor still showing the previous team's form.
Sample selection now round-trips through import validation without changing
legality data. Editor drafts bind to their team; stale save/remove are blocked.
Local phone-width Save Changes/reload retained the test spread and set details.
Same-slot roster replacement also invalidates drafts after independent review.
Reopening the saved form repairs stat-summary refresh locally (#214). See the dated
[journey report](release/MOBILE_SAVE_JOURNEY_2026-10-06.md) and #213 for final
tests, independent review and deployed proof. No new simulation accuracy claim.

Lesson: onboarding must use the actual admission path, and editable UI context
must be tied to the record being saved, not a mutable global selection.

## IMP-0067: Preserve Parenthetical Forms In Paste Imports (#212)

October 5, v178 candidate. Catalog round-trip test reproduced a species identity
loss: Floette (Eternal Flower) became Eternal Flower. Parser now removes the
outer gender suffix first and preserves exact known form names before interpreting
nickname parentheses. A backward balanced-group scan preserves nested form text
and parenthetical nicknames; independent review caught the first regex repair
misparsing Buddy (Ace) (Incineroar), now covered by regression.
Focused suite passes 37 tests, including 408 member round trips under SPs and
legacy EVs labels plus seven nickname/gender cases. Browser preview preserved
Buddy (Floette (Eternal Flower)) (F) as Floette (Eternal Flower); draft cancelled,
no save or battle. No regulation promotion or cross-tool EV-conversion claim.

Lesson: text export/import must preserve species identity, not only numeric
spread totals. Retain known-form and nickname regressions together. Full suite,
independent review and hosted proof are recorded on #212/PR210 before closure.

## IMP-0066: Mobile Editor Intrinsic Sizing (#211)

October 5, v177 candidate e49c232. Live v176 selected-editor content exceeded
phone width (385 client / 425 scroll). Zero-minimum grid tracks and scoped input
sizing remove intrinsic expansion without hiding overflowing content. Local
selected-editor measurements: 315/315, 385/385, 763/763 and 1275/1275.
Static sizing regression and full project gate pass; offline DB tests do not
establish live security. Independent review found no release-blocking code defect
and verified bundle reproduction, manifest/external assets and roadmap consistency.

A separate 390px custom-team paste edit changed the disposable Incineroar fixture
from 30HP/32Atk/4Spe to 29HP/32Atk/5Spe and retained that spread after reload.
This proves that paste-edit persistence path, not all Set Editor controls or
competitive legality of a one-member fixture. No new battle was run.

Lesson: grid items and input intrinsic sizes must both be constrained; hiding
overflow would mask inaccessible controls. Hosted checks and deployed editor
verification remain required before #211 closure. Export retrieval, old-cache
migration and paired live replay remain beta-label gates, not passed by this fix.

## IMP-0065: Prompt Release And Primary/Backup Ownership

October 5, 2026. User requested that tested fixes stop accumulating locally.
AGENTS.md now requires prompt reviewed publication, live artifact and affected-flow
verification before closure, and explicit blocker records when deployment cannot
proceed. TheYfactora12 is primary; Alfredo is a separately verified backup after
primary release, not a competing development baseline. Existing approval gates
and saved data remain protected. Documentation-only consistency/whitespace review;
no deployment, failover test or new automation performed.

## IMP-0064: Strategy Move-Evidence Attribution (#209)

October 5, 2026, v176 candidate. The producer returned `pokemon` while the
dashboard read `owner`, `times_used` and `games_sampled`; visible output leaked
undefined values and claimed zero calls without execution evidence. The dashboard
now uses the producer's name, withholds unattributed rows and labels counts unknown.
It asks for structured replay inspection rather than recommending replacement
from missing text mentions. Regression failed before the fix; local browser
confirmed named Eruption attribution and cautious copy afterward.

Lesson: test the real producer-consumer contract, not only handcrafted dashboard
fixtures. This narrow presentation fix does not upgrade the legacy text detector
to stable participant-ID evidence, fix every coaching consumer, or prove mechanics.
Release/cache identity and bundle regenerated. Ticket stays open for hosted proof;
deployment alignment remains #103. No database or engine behavior changed.

Verification: full project gate passed, 192 fast files and 12 offline DB files,
four manual/helper files skipped. Live DB checks are not verified. Local v176
Strategy browser snapshot shows Typhlosion-Hisui - Eruption with unknown count
and no undefined fields in the inspected section. Artifact SHA-256:
`fd3385c6f53793819f02821bfca7f75935b9fa80bf4732c8658a5d05b5f2eb5e`.
No new interactive simulation batch was run for this presentation-only change.

## IMP-0048: Current-Regulation Team Review

October 4, 2026, local v165 candidate. Historical legal tags and narrow preload
tests did not establish M-C legality. Added a reproducible pinned reference
inventory and per-member diagnostic for all Teams cards, including imported and
edited sets. Shows reference species availability, move/ability/item issues,
duplicate items and IV discrepancies; passing limited checks remains unverified.
No historical metadata, mechanics, DB rows or approval gates changed. Four
regressions cover full catalog, edit recomputation, starting-form Mega abilities
and escaped nonmutating output.
Full-team reference/official approval, new upstream drift review and hosted visual
verification remain separate gates. Audit: docs/release/PRELOADED_MC_LABEL_AUDIT_2026-10-04.md.

Purpose: show what improved, why it improved, how we checked it, and what is still open. This is a change history, not another roadmap or a percentage-accuracy score.

`STATUS.md` owns current status. `ROADMAP.md` owns future outcomes. Detailed dated reports own the underlying evidence. New entries use stable ascending IDs; append verification/rollback/recurrence notes to existing entries without deleting history. Only evidence-supported states may advance from local to staging, merged or deployed.

## Review Index

### IMP-0060: Verify Remaining Evidence Confidentiality Boundaries

October 5, candidate 13bded3, disposable local Supabase only. Real Auth/REST
verification confirmed an unresolved evidence confidentiality boundary while
positive public controls and denied browser writes passed. A separate
trusted-writer-dependent scenario was reproduced, but its unprivileged
creation path was not established. The earlier reference-isolation fix is
not a claim to close these separate boundaries.

Synthetic fixtures/user from this verification were cleaned up; no production
data accessed or changed. Sensitive reproducible script and detailed evidence
are retained outside public GitHub in the local security artifact collection.
Lesson: protected team rows do not by themselves prove protection of derived
evidence. Require direct API tests, legitimate controls and explicit writer
preconditions. No additional fix or release approval claimed in this pass.

### IMP-0059: Real Local Supabase Isolation Tests

October 5: started a disposable local Supabase stack with CLI 2.119.0, using
repository baseline and selected Team Lab migrations, not production data.
Two real synthetic Auth users demonstrated owner save/read, cross-user read
and update denial, and anonymous private-team read denial over HTTP. A shared
evidence insert was denied with permission error 42501; readback found no
browser mutation grants across the six containment tables.

The existing SQL diagnostic failed before a new additive reference-visibility
migration and passed afterward. Expanded rollback-only tests cover public
positive controls, participant ordering, owner/nonowner access, and empty,
null-element and missing-reference jobs. Twelve offline DB files and four
security-reporting tests pass. Independent boundary investigation completed;
independent patch review found no new bypass in the changed predicates. Added
and passed authenticated owner-positive/nonowner-negative run/job tests after
the review requested them. The pre-existing job-owner exception still depends
on trusted-writer authorization and needs separate proof. Detailed evidence is
retained in the local security artifact collection, not the public repository.

Lesson: green mocked policies do not establish row-security behavior. Exercise
the actual SQL engine and Auth/REST boundary, and require positive authorization
for referenced records. Scope remains limited: hidden-detail raw evidence,
additional mutations/surfaces and actual production verification are open.
Synthetic HTTP fixtures remain only in the disposable local environment.

### IMP-0058: Production Artifact Alignment Checkpoint

October 5: added an explicit read-only HTTP checkpoint to prevent conflating
local, pushed and deployed state. Six fixtures cover matching artifacts,
configuration-injected HTML provenance, old builds, stale HTML, altered assets
and missing assets. A live run reports local v172 versus hosted v142 and four
missing v172 external assets. GitHub main's manifest independently reports v142.
No production change. This verifies declared artifact identity, not independent
manifest approval, browser-cache behavior, mechanics or live database security.
Run the command in the public-practice release checklist after an approved
deployment, then perform the actual user journey. No new recurring job added.

### IMP-0057: Replace Unknown Security Status With Live Readback

October 5: authorized metadata-only Supabase readback replaced an access gap
with a confirmed unmet containment gate. No user data or secrets retrieved,
no production writes, and no sensitive policy detail published. Re-ran the
existing isolated PostgreSQL containment suite successfully (60 denied writes,
public reads preserved, six trusted writes, idempotency and rollback checks).
Independent release review rejected offline/experimental labeling as a waiver.
Lesson: healthy service status and a quiet advisor do not prove the application's
ownership or write policy. Read actual effective permissions; keep synthetic
fixtures distinct from live user isolation. Staging, exact production-change
approval and readback remain required. Details and next actions:
`docs/release/V172_RELEASE_GATE_REVIEW_2026-10-05.md`.

### IMP-0056: Mobile Results Intrinsic-Width Guard

October 5 local v172. Populated Simulator results previously stretched a 385px
document to 412px. Chart canvas intrinsic width and audit grid minimum sizing
were the observed causes. Use minmax(0,1fr) tracks, min-width:0 cards and
max-width:100% chart canvases with automatic height. Earlier browser checks of
this candidate measured 385/385 portrait and 839/839 landscape document widths.
These are bounded viewport checks, not a complete mobile journey.

The first full gate failed because t174 required the old literal 1fr chart
track. Updated that assertion and added canvas/card/audit shrink guards; all
five focused assertions pass. The full gate rerun passed: 190 fast test files
and 12 offline DB files, with four manual/helper files skipped. Offline DB tests
do not establish live database security. git diff --check passed.
Lesson: keep source-contract tests aligned with intentional layout fixes, and
pair them with populated browser measurements rather than treating CSS text
matching alone as visual proof. Reference: MDN CSS minmax() sizing documentation.
Production deployment and hosted verification remain pending.

### IMP-0055: True Starting-State Evidence

October 5 local v171 / engine 1.1.14. IMP-0054's Turn 0 finding was confirmed:
the UI used the first post-Mega pre-action snapshot. Add first-turn `initial`
after entry abilities and before the battle loop, leaving `pre` unchanged.
Renderer and comparator prefer initial; old logs disclose their limitation.
Four starting-state assertions failed before and passed after. Fourteen
ability/execution tests, 38 turn-log/export checks and 15 comparator checks pass.
Independent review instrumented 3,200 snapshot calls without input mutation or
shared mutable objects; 136 paired doubles games across 34 teams and two seeds,
both sides, had identical RNG and returned outcomes after ignoring the additive
snapshot/version. Full 190-file fast gate, 12 offline DB files and scoped
4,500-game battle audit passed; manual/helper and live DB gaps remain.
Browser v171 shows Cloud Nine before Mega; nine-turn loss seed
`1449608657,4090077655,3318158718,3721624941` remains unpaired because its file
was not found in Downloads after attempts. Do not promote it to visual parity.
Lesson: capture evidence at the named boundary, not the nearest convenient one.
Remaining: full paired/mobile journey, source approval, security and deployment.

Reconciliation note: main 45c9e28 refreshed tested news and conflicted only in
generated release metadata. Preserved its feed byte-for-byte and regenerated
the bundle/manifest. Subsequent mobile Simulator check exposed 27px horizontal
overflow (400px chart intrinsic width and audit grid minimums); this is separate
from the narrower Replay Log viewport pass and remains an actionable finding.

### IMP-0054: Visible Downloads And Converted-Type Execution

October 5 local v169/v170. Browser operation found a hidden download fallback
and a real Pixilate execution failure despite passing damage-preview tests.
Fix active-tab fallback placement, folder/browser element transitions, shared
effective move type resolution and the audit tool's single-replay provenance
schema. Each change has a failing-before/passing-after regression. Fourteen
conversion cases now cover both sides and once-only power/event evidence;
independent mechanics review accepted the bounded type/immunity fix.
The actual v169 download was ingested and five turns manually compared for
move order and damage, not a complete board/comparator proof. v170's 190-file
fast gate, 12 offline DB files and battle audit passed; the full project gate
passed again after the final test/audit edits. No live approval follows.
See [detailed findings](release/REPLAY_EXECUTION_FINDINGS_2026-10-05.md).
Lesson: test execution, not only damage previews; check actual files despite
tool timeouts; an auditor must respect each artifact's versioned schema.
Next: true starting-state evidence, final paired/mobile journey and release gates.

### IMP-0053: Shared Base Abilities And Pilot Guide Evidence

October 5, local v168 / engine 1.1.12 candidate. Extends IMP-0052 without
rewriting its historical limits. The expanded registration test failed on
Audino Healer before the fix. Constructor now checks the existing species
ability lookup before replacing an ability shared with the Mega form. Ten
cases pass, including Healer, Infiltrator, Protean, Iron Fist and Berserk,
previous alternate selections and legacy Mega-only inputs. Independent
read-only review found no additional mechanics source blocker; it verified
fallback probes and flagged the stale bundle, which was regenerated.

The separate Pilot Guide still inferred threats from fainted opponent names
and prescribed strategy from win rate. Four revised regression assertions
failed before correction; all 32 analytics checks now pass. Removed those
inferences, replaced Favorable/Avoid with observed series wins, distinguished
retained versus recorded lead counts and escaped dynamic observation text.
Separate Mega/threat-response renderers are unchanged and not newly certified.

Full project gate passed: 189 fast files and 12 offline DB files, zero failures;
four manual/helper files skipped and live administrative DB checks unverified.
Battle audit passed its declared scope including 4,500 games. Root-entry browser
smoke showed v2.2.168-pilot-evidence. This is not a paired replay/export test,
competitive accuracy percentage, live DB proof or production deployment.
Lesson: ability-name equality does not establish form exclusivity; frequency
and fainted names do not establish a causal coaching recommendation.
Next: complete export pairing and mobile journey, then remaining release gates.

### IMP-0052: Registered Ability, Startup Selection And Inline Evidence

October 5 v167 / engine 1.1.11 candidate. A failing Altaria Cloud Nine fixture
showed the constructor unconditionally replaced a selected base ability.
Preserve explicit abilities that differ from the Mega ability; retain the
legacy fallback for missing/Mega-only input. Five base/legacy/transformation
cases pass. Independent read-only battle review passed 62 focused cases but
identified pre-existing shared-ability ambiguity (Audino Healer, Chandelure
Infiltrator, Greninja Protean, Crabominable Iron Fist, Drampa Berserk). These
remain OPEN: this is not universal registration preservation or legality proof.

Independent selection review reproduced startup Altaria/Altaria changing to
Altaria/Dragonite at Run without user selection. Rebuild preserved duplicates
but Run enforced distinct teams. Apply the existing distinct policy before
display and refresh bring pickers. The mirror-startup regression failed before
and passes after; the legacy helper test now explicitly creates its duplicate
input instead of assuming startup remains broken. Run All mirror policy is
unchanged.

Inline Pilot Notes no longer judge Favorable/Avoid or recommend speed control
from win rate. They label observed series wins, name sample limits and describe
winning-lead frequency. Removed unsupported injected strategy rule text,
including escaped strong markup. Three red/green assertions; 32 analytics
checks pass. The separate generated Pilot Guide still needs review.

Browser: v167 shows Altaria/Dragonite before Run; one Bo1 practice game completed
in four turns (win). Result table retained Cloud Nine; inline notes displayed
observed wins and uncertainty. JSON download event still timed out, with no
captured console errors. Exact export/visible pairing remains unverified and
this sample is not mechanics parity proof. Final engine-version/date metadata
was rebuilt after that visual check. Full-gate receipt:
poke-sim/artifacts/v167-gate-release.log: 189 fast files and 12 offline DB files
pass; four manual/helper skips. Declared battle audit also passes, including
the 4,500-game matrix (v167-battle-audit.log). No production deployment.

Lesson: validate the setup users see against the inputs execution actually
receives, and inspect every advice consumer rather than just the replay summary.

### IMP-0051: Align The Public Practice Release Queue

October 5: added a dated seven-step release checklist, updated the shared
roadmap next action and regenerated Markdown/browser data. Preserved all older
audits and milestone history; no deletion, issue closure or rule promotion.
Read-only constructor diagnostic confirms Cloud Nine is overwritten by Natural
Cure for Altaria-Mega with its stone. This narrows the next mechanics regression
without claiming a fix. Roadmap generation check and 11 overview tests pass.
Lesson: distinguish cleanup of current direction from erasure of historical
evidence; preserve concrete reproductions before changing shared behavior.

### IMP-0050: Replay Download Lifecycle And Nested Controls

October 5: replay JSON used a detached link and zero-delay URL revocation,
unlike the existing shared helper. It now uses the shared attached-link,
retained-URL path. This removes a concrete lifecycle risk, not proof that it
caused the in-app browser download timeout. Nested details/buttons/links no
longer toggle the replay card. The new regression failed before the fix and
passes after; v166 browser raw-log expansion remains open as intended.

One new explicit Mega Altaria/Mega Dragonite practice battle completed in four
turns (win). Download still timed out, so visible/export pairing and exact
mechanics correctness are NOT proven. No extra stress claim from this sample.
Pilot Notes again produced Favorable/100% from one win and remain open, along
with selected ability and initial opponent consistency.

Removed percentage-based completion guidance from the release discipline
document; historical UI/docs still need broader consolidation. First full gate
caught stale app-shell build identity and the old policy assertion; corrected
both. Rerun receipt: poke-sim/artifacts/v166-gate-final.log. Build/cache/header
and generated metadata move together as v2.2.166-replay-download.
Lesson: a download request is not saved-file proof; never close the evidence
gate until the file is read back and paired with its exact visible battle.

### IMP-0049: Reconcile Candidate With Current Main

October 5: resolved four merge conflicts against main a5c2224. Preserved main's
tested-news-only publishing workflow and latest feed; retained both branches'
audit records and marked superseded main candidate notes as historical.
Regenerated the HTML and release metadata with the canonical builder.
No mechanics, regulation approval, DB permissions or release gates were changed.
Local full-gate receipt: poke-sim/artifacts/alignment-2026-10-05.log.
Hosted review and deployment remain distinct steps, not implied by conflict
resolution. Lesson: retain operational fixes from main and regenerate derived
artifacts; never select a stale release hash to resolve a merge.

### IMP-0047: Package And Reconcile Before Deployment

October 1: package IMP-0045/0046 as v164, preserving the same engine and distinct
cache identity. Initial full gate caught the UI-only replay exporter fallback
still reporting v163; corrected the fallback without changing the assertion.
Read-only merge analysis identifies four conflicting files; no blanket merge or
production rollout. Preserve main's approved news-only automation during future
reconciliation. [Release handoff](release/V164_RELEASE_HANDOFF_2026-10-01.md).
Lesson: a visible header is not enough; exported evidence and cache identity must
agree, and cached offline content must not count as fresh browser proof.

### IMP-0046: Render Final Catalog Selections

Uncommitted local candidate: startup rendered rosters before catalog rebuilding,
leaving stale headings and potentially a different opponent roster. Rebuild now
refreshes both headings and rosters from final selector values after gating.
Three regression scenarios (fallback, mirror, empty catalog) fail before and pass
after the fix. Local browser reload confirms matching selections, headings and
first members. No battle/DB behavior is changed; deployment remains blocked.
Lesson: filtering a catalog is a selection transition, not just an option-list edit.
Final combined mobile/selection fast gate: 186 test files, zero failures,
four manual/helper skips. This supersedes the earlier mobile-only incomplete
gate receipt; it is not hosted CI, a DB write test or deployed proof.

Persistence investigation: the adapter's generic missing/conflicting-provenance
warning also covers non-promotable practice rulesets. Earlier console evidence
alone does not prove missing identity. Preserve quarantine until exact payload
and policy diagnosis; private practice retention is a separate contract.

### IMP-0045: Size Simulator Layout By Available Width

Uncommitted local candidate, September 30: live v142 overflowed a 390px viewport
to 567px. Narrow stacking depended on pointer detection; landscape inherited
explicit grid positions and bring slots used intrinsic minimum widths. Make
narrow stacking input-independent, reset landscape placement, constrain bring
tracks and contain audit/source tables. CSS contract test passes; browser checks
cover 360/390 portrait, 844 landscape and 1280 desktop. Bundle regenerated.
No mechanics, legality, database or production changes. Full journey, real-device,
release/cache identity and hosted verification remain open. Lesson: test narrow
mouse/hybrid views as well as touch, and test intrinsic child widths.
[Receipt and newly observed separate identity concern](release/LIVE_OPERATIONAL_CHECK_2026-09-30.md).

### IMP-0044: Audit Downloaded Raw Evidence Independently

September 24, local candidate: add on-demand Downloads intake with a source hash,
strict retained turn-log checks and separate provenance/legality warnings. The
supplied 240-card artifact passes those structural checks but needs review; its
own ready labels are not certification. Corrected an initial mixed-denominator
auditor bug and added a regression before retaining the report. Five new tests
and 30 validator regressions pass. No runtime/deployment change.
[Evidence, workflow and built-in QA backlog](release/DOWNLOAD_QA_AUDIT_2026-09-24.md).
Lesson: test the test harness, compare identical scopes and never turn event
presence or historical volume into correctness proof. Visual pairing remains open.
Follow-up: added a plain-English player report and compact AI JSON from the same
audit, excluding raw private team data and local paths. Eight focused tests pass;
the earlier 182-file gate preceded this reporting-only addition. Companion files
are local, not deployed UI downloads or self-contained reproduction packages.
Independent review then reproduced empty-turn false passes, malformed-history
aborts and nested build-metadata disclosure in the shareable pack. Added shape
requirements, indexed errors and bounded identifier validation; 11 focused tests
pass and the original 240-card audit was rerun. These are intake fixes, not closed
mechanics findings. Full hosted verification is tracked on the pushed candidate.
Full-detail follow-up: retain the complete original payload in a full AI evidence
file and generate self-contained per-match JSON/Markdown with valid turn pointers.
Keep planned actions separate from recorded execution and explicitly block exact
engine reruns until the missing restoration contract is implemented. Fourteen
focused tests pass. Detailed packages intentionally contain raw team data; only
the compact index is privacy-minimized. No mechanics or browser changes.

### IMP-0040: Test M-C Drafts Before Importing Into An Older Runtime

September 9, local reference-only: three full doubles drafts, explicit Champions
SP, base/Mega stat checks and six reproducible random-policy games. Negative
controls reject legacy EVs, duplicate items and an unavailable move. Live v142
has no M-C selection; no imports or browser battles were falsely counted as
M-C evidence. [Results and limits](release/MC_DRAFT_TEAMS_2026-09-09.md).
Lesson: familiar moves, usable artwork and successful reference battles do not
prove deployed support. Keep reference drafts separate until runtime parity and
the regulation approval gate are complete. No runtime, DB or deployment change.
Independent review caught a wall-clock-dependent repeat assertion. Preserve both
raw logs; normalize only timestamp records for event-repeat checks, and test
across a real time delay instead of relying on same-second runs.
First hosted run also caught upstream's verbatim config-example.js copy retaining
Windows CRLF. Normalize only that file for the canonical build fingerprint,
retain raw fingerprints, and require the same canonical bytes on Linux.

### IMP-0039: Replace Stale Regulation Blockers With Captured Evidence

September 9, v163: capture/hash the now-public M-C roster, preserve ambiguous
form IDs, and stage a pinned upstream inventory with explicit historical M-B
routing. Runtime warning text acknowledges completed evidence without silently
granting legality or learning eligibility. [Evidence and remaining activation gates](release/REG_MC_INTAKE_2026-09-09.md).
Lesson: active dates, available reference data and verified implementation are
different states. Bad probe inputs must be corrected as harness failures, not
counted as illegal-team evidence. No installed reference upgrade or DB promotion.

### IMP-0038: Align The Next-Work Queue

September 9, v162: STATUS and the generated Markdown/browser roadmap now put
security staging, known mechanics defects, broader identity/legality and reviewed
deployment in the same order. The stale v145 manual-QA target is retired. Runtime
labels/cache are bumped so roadmap changes can be distinguished from v161;
battle logic and engine version are unchanged. Both remote main branches remain
different from the candidate; no deployment or cross-repo parity is implied.
Lesson: one generated roadmap should describe future work, with STATUS recording
current proof, not competing outdated task lists.
Verification: 180 fast test files passed, four manual/helper files skipped;
11 release checks and roadmap generation check passed. Local browser reads show
the new queue and v162 label at 1440px and 390px, with no mobile horizontal
overflow. Screenshots: local `poke-sim/artifacts/roadmap-v162-desktop.png` and
`roadmap-v162-mobile.png`. No battles or database writes were performed in this
documentation/UI-label check; no new simulation proof is claimed.

### IMP-0037: Bind Required External Assets To Release Evidence

September 9: the HTML digest omitted the required move-pool file. The generator
now records that file and both intro sprites; freshness and staged Pages checks
reject changed or missing bytes. Eleven focused groups pass, including negative
fixtures. Runtime behavior is unchanged. [Release review and remaining gates](release/RELEASE_REVIEW_2026-09-09.md).
Lesson: a reviewed HTML hash alone cannot identify separately shipped inputs.
Independent review caught checkout line-ending drift; LF attributes and real
Git-filter coverage now protect the hashed text asset across platforms.
Local verification is not deployment; shared-evidence security and mechanics
review remain open.

### IMP-0036: Preserve Member Identity Across Edits

Paste edits no longer erase IDs/annotations, and individual species replacements
no longer inherit the displaced Pokemon's ID. Exact unique identities survive
reordering; ambiguous matches block saving. Real upload/edit/reload and paired
battle exports verify the custom-team path. See [proof and remaining gaps](../poke-sim/reports/member_edit_identity_2026-09-08.md).
Lesson: durable registration identity must not depend on current slot position.

### IMP-0035: Keep Imported Names Literal In The Edit Dialog

The edit dialog now applies the established output-escaping helper to imported
names. Stored names, titles, selections and custom/preloaded guidance remain
unchanged. A negative-control regression, independent boundary review and actual
local upload/Edit checks pass for both HTML builds. This is scoped local display
hardening, not a repository-wide or deployed security sign-off.
Lesson: safe rendering in the catalog must continue into every detail/edit view.

### IMP-0034: Bind Move Validation To Explicit Context

The shared helper now uses a reproducible pinned Champions inherited-pool
artifact, not historical move presence. Imported formats survive storage;
missing/conflicting replay context stays unchecked. Stale catalog records remain
available for repair without entering runnable selections. All 235 reviewed
identity pools agree locally; separate complete-team and official approval gates
remain. [Evidence, tests and DB limits](../poke-sim/reports/champions_move_context_validation_2026-09-08.md).
Lesson: a source is trustworthy only within its named context, and stricter
validation must not destroy the original data it rejects.

### IMP-0033: Compare Inherited Runtime Move Pools

Added a separate inherited-pool/runtime acceptance audit without relabeling the
old direct-row diagnostic. Seven narrowed full-set disagreements are reproduced;
235-key census differences remain candidates, not an accuracy denominator.
Five harness tests validate the detector, not the current app's correctness.
Independent review expanded its move universe and installed-reference fingerprint
so hidden acceptance and changed dependencies cannot masquerade as agreement.
See [reproductions and shared-path fix plan](../poke-sim/reports/champions_move_pool_alignment_2026-09-08.md).
Lesson: historical learn-method presence is not a current-format move pool;
form traversal must use the pinned reference rather than ad hoc inheritance.

### IMP-0032: Separate Team Checks From Competitive Approval

The Teams page combined unverified/historical regulation badges with a green
LEGAL shortcut. It now labels local validation without claiming tournament
approval. Mobile roster rows wrap full-width Details controls instead of crushing
Pokemon text. Actual browser checks cover 16 cards across five viewport/input
cases, with no hidden games. See [scope and evidence](../poke-sim/reports/team_review_clarity_2026-09-08.md).
Lesson: independent badges must not contradict each other, and source-string CSS
tests cannot substitute for checking rendered geometry.

### IMP-0031: Check Every Consumer, Not Only Mirrored Rows

Correct database/baseline rows did not guarantee correct roster displays. The UI
used stale species and nature tables, while an accepted Floette alias missed the
engine resolver. Runtime-backed types and starting Speed now replace those paths;
unknown formats remain unknown, and the species-only radar withdraws unsupported
safety ratings. See [tests, review and limits](../poke-sim/reports/roster_runtime_validation_2026-09-08.md).
Lesson: prove identity and field parity through each consumer, including imports
and presentation. A valid source row alone does not prove a valid user experience.

### IMP-0030: Resolve Official Form Identity Without Promoting Legality

Official rendered IDs and sprite positions distinguish Fancy Vivillon and
Eternal Flower Floette where text labels alone were ambiguous. Explicit aliases
now complete 235 review-only mappings. Source asset hashes, screenshot hashes,
named official references and independent visual-review limits are retained.
The generated artifact binds the added evidence fingerprint and rejects missing
form records or identity/source drift. All 235 baseline stats/types/ability slots
and Dex numbers match pinned Champions; this does not test every runtime consumer.
Lesson: reconcile identity with evidence, then validate fields and combinations
separately. No human approval or competitive publication. See
[M-B sign-off audit](release/REG_MB_SIGNOFF_AUDIT.md).

### IMP-0029: Templates Report Facts Without Inventing Confidence

Separate generic coach templates invented causes, best plans, default scores and
confidence from volume. They now retain current matchup/recorded row facts and
explicit uncertainty. Missing turns no longer reuse the last turn; a real zero
heuristic score stays zero. Removed dead aggregate-inference helpers and an
unverified performance tagline. Four negative reproductions fail before/pass
after; the voice suite passes with two incorrect old expectations corrected.
See [scope and remaining gates](../poke-sim/reports/coach_template_validation_2026-09-08.md).
Lesson: uncertainty must hold in every presentation path, not just one summary.

### IMP-0028: Withdraw Unsupported Decision Diagnoses

Independent replay review reproduced a zero-PP Recover recommendation and an
execution diagnosis from a heuristic score gap, even on a different turn from
the recorded turning point. Historical move inventories are not action legality.
The decision audit now preserves its empty API shape without authoritative flags;
the summary keeps factual replay review and states the evidence limit. Nine
negative regressions fail before/pass after, and three wrong old expectations
were corrected. Lesson: positive PP is necessary, not sufficient, and a utility
score is not a counterfactual outcome. See the
[evidence and re-enabling gate](../poke-sim/reports/decision_evidence_validation_2026-09-08.md).
This withdraws unsupported advice; it does not prove the rest of coaching.

### IMP-0027: Intentional Runs And Readable Replay Evidence

Removed a startup simulation that silently added games before the requested run.
Paired browser testing exposed it, then screenshots exposed light-theme contrast
and mobile reserve overflow. Corrected all three without altering mechanics or
discarding user history. Independent review strengthened the harness: exported
matchup identity must match the selected teams, and actual re-downloads must
retain all historical fields, excluding only two documented creation timestamps.
Lesson: replay/export agreement alone can agree on the wrong requested matchup;
DOM parity also does not prove readable pixels. Scope and unsuccessful captures
remain documented in the [replay audit](../poke-sim/reports/intentional_replay_validation_2026-09-08.md).
Unsupported causal coaching was independently reproduced and remains next.
No live database changes, deployment, regulation approval or 99% accuracy claim.

### IMP-0026: Perish Song Countdown, Recipients And Terminal Result

Ten initial probes reproduced an early third-turn KO and missing recipient
defenses. Candidate v153 / engine 1.1.9 preserves four-turn timing, existing
countdowns, Soundproof/Mold Breaker/Ability Shield and concealed recipients with
No Guard exceptions. Two-wave games exposed a false terminal draw; the candidate
uses pinned residual action-speed order and last-faint resolution. Review then
caught an initially omitted Trick Room transformation; new fixtures reproduced
and corrected it. Charge-start actions are now present in logs.
Independent final review passes 22 probes and has no remaining scoped findings.
Lesson: duration, recipient selection, action evidence and winner resolution are
separate contracts. A valid alternative replacement choice is not an engine bug,
but prevents full trace parity unless both harnesses use the same choices.
Full local gate passed 165 fast and 12 offline/mock DB files with four skips;
standing audit passed its selected suites, three unchanged goldens and 4,500
matrix games with zero JS errors. Local version/roadmap smoke passes with no page
errors. Hosted CI and paired interactive replay proof remain separate; no
deployment or regulation promotion.
See [Perish Song audit](../poke-sim/reports/perish_song_validation_2026-09-08.md).

### IMP-0025: PP Drain And Substitute Defense Boundaries

The old local Spite test asserted the wrong Substitute result. New paired
reference probes exposed that mistake, sound bypass and immunity gaps, then
reflection and secondary-effect protections during independent review.
Candidate engine 1.1.8 uses mirrored bypass flags, protects Eerie Spell's
secondary from Sheer Force/Shield Dust/Covert Cloak, and checks relevant Spite
defenses. Additive Substitute HP evidence supports direct preservation checks.
The knockout fixture also needed correction: Choice Specs had locked Splash.
Lesson: challenge fixtures against the reference, and assert the intended action
actually occurred; a passing local expected value is not an oracle.
Eighty focused reference probes pass. Independent final review rechecked all
reported fixes and found no remaining findings in that scope. Final artifact gate
passed 164 fast and 12 offline/mock DB files, with four manual/helper skips.
Three golden traces remained unchanged and
4,500 matrix games had zero JS errors. Local browser version/roadmap smoke passes
with zero page errors; no new interactive simulation or deployed proof claimed.
See [boundary audit](../poke-sim/reports/pp_substitute_validation_2026-09-08.md).

### IMP-0024: Explicit Official Roster Identity Candidates

Added a deterministic review-only mapper and hash-bound identity artifact for
the official M-B capture. 233 candidates resolve; two nondefault forms fail closed.
Tests cover altered labels, unknown IDs, dex mismatch, exclusions, duplicates,
input immutability and generated-artifact freshness. Sixteen Mega records also
match pinned Showdown Champions fields and each stone's actual owner map.
The initial test assumed an old Showdown string field; inspection showed the
pinned API uses an owner-to-form object, so the harness was corrected without
changing engine data. These are identity/field checks, not live game approval.
Independent review exposed default-form substitution within one Dex number and
CRLF false drift. Both were reproduced or exercised in executable regressions
and corrected before push. Named default states remain supported.
See [overnight handoff](release/OVERNIGHT_HANDOFF_2026-09-08.md).

### IMP-0023: Official M-B Roster And Extension Audit

Observed: the M-B end date was stale and the visual ledger's 235 rows hid duplicate
and mismatched species. Captured 235 unique official roster IDs with source hash
`8b0c6db8dcd403bb1f5453c1c6f9ac35c80192762219a308c80023375a93d617`.
Corrected the September 9 Ranked deadline, reproduced the old date failure, and
passed 15 selection, six M-C transition, 20 legacy audit tests plus official
presence/absence and form-ID checks. Marked the old visual ledger superseded for
eligibility; kept it as historical evidence. Roadmap source and generated site view
now prioritize exact mapping and full validation. See
[M-B sign-off audit](release/REG_MB_SIGNOFF_AUDIT.md).
Lesson: equal row counts and green review-only tests do not establish roster truth.
v151 candidate only; no competitive approval, database change, or deployment.

### IMP-0021: Retro Homepage Battle Opening

Replaced the abstract Team Test/Benchmark preview with a decorative Gengar versus
Nidorino pixel-sprite opening, authored CSS lunge/dodge motion, a keyboard-accessible
pause checkbox, and reduced-motion support. Removed the preview's unused base styles.
This is not engine output and does not affect teams, mechanics, or coaching evidence.
Overview checks and all 160 fast-gate files pass (four manual/helper skips);
real Chromium checks at 1440px and 390px prove sprite loading,
scene bounds, movement, pause and reduced-motion behavior. Screenshots were inspected
and Nidorino spacing corrected. Reproduce with `tools/verify-retro-intro.cjs` and
Playwright available through NODE_PATH, against localhost:8770. Sprite provenance and
artwork-rights caveat are in `poke-sim/assets/retro-intro/README.md`.
Promoted to v150 candidate identity with sprite precache entries and PNG checks.
Desktop/mobile browser checks pass again. Offline browser behavior and commercial
artwork permission remain unverified. No mechanics or deployment claim added.

### IMP-0022: Migration Filename Boundary And Staging Discovery

Moved manual migration input from shell-source interpolation into an environment
variable, with a restricted SQL filename alphabet; existing traversal and file-existence
guards remain. Bash execution of the actual workflow validation block accepts the
existing migration and rejects 11 invalid/injection examples without execution.
The regression runs inside the workflow governance suite on CI.
Dispatch still requires repository permissions and production environment handling;
this is defense in depth, not a claim of an unauthenticated exploit.
An independent agent could not start due to the session agent limit; the parent
performed a second source-to-sink review and executable compatibility checks.

Both repositories' GitHub inventories and the connected Supabase project were read
without mutation. See [staging discovery](release/SUPABASE_STAGING_DISCOVERY.md).
Live migration ledger still contains four entries; the advisor's informational
missing-policy notice does not certify application security. Policy/grant readback
confirms the existing shared-write containment gate remains unresolved. Do not
publish a production security clearance or run write tests without isolated staging.

v150 local verification: `npm test` passes 160 fast files and 12 offline/mock DB
files, with four manual/helper skips. Browser checks pass at 1440px and 390px.
No live write checks ran. Repository push is distinct from a Pages deployment.

### IMP-0020: Company Audit Trust-Boundary Fixes

Changed: Leftovers precedes status damage; Toxic rounds before tick multiplication; replay plans cannot impersonate verified matches; timing-only coaching stays outside scoring and critical-mistake selection; news discovery uses compatible CLI options. Separate shared-write containment is locally tested but not applied live. Evidence: [OODA remediation](release/OODA_COMPANY_FINDINGS_2026-09-08.md), eight bounded reference probes, six new regression groups, independent review, isolated PostgreSQL denial/positive controls and two manual replay reviews. Lesson: follow incorrect evidence into every downstream consumer and test later turns, not just the reported example. v149 candidate only; live security, verified matching, broader mechanics/coaching and hosted release remain open.

### IMP-0019: Independent Company Audit

Observed: five focused suites pass while fresh reference, replay-identity and causal-coaching counterexamples fail. Changed: recorded [independent audit and ordered OODA backlog](release/INDEPENDENT_COMPANY_AUDIT_2026-09-08.md), distinguished public v142 from candidate v148, and rechecked release/source/security gates. Verification: parent reproduced three reviewer findings; read-only live metadata and public navigation were inspected. Lesson: test contracts and player decisions, not just battle volume. Documentation only; no finding is closed, no security migration applied and no release deployed. Detailed live authorization evidence remains private.

### IMP-0014: OODA Strategy Identity And Advice

Observed: nature edits and separately registered identical teams reused the wrong Strategy report, while two heuristics invented mistakes. Root cause: incomplete cache identity and advice without action evidence. Changed: canonical full-input Strategy/Mega keys and disabled unsupported Fake Out/redirection predicates. Three regression groups failed before and pass after; all 69 focused Strategy checks pass. See [OODA evidence](release/OODA_STRATEGY_FIX_2026-09-08.md). Lesson: reproduce player-visible correctness separately from existing green suites. Local v146 candidate only; confidence, mechanics, persisted UI and live verification remain open.
### IMP-0041: Repair Scheduled News And Permit Tested News-Only Publishing

September 23: traced repeated failures to incompatible GitHub CLI flags before
source retrieval. Owner explicitly approved automatic publication of tested news
only. The replacement uses trusted main, a three-generated-file boundary,
non-forced publication and the existing Pages gate. Year-only relevance matches
are removed. YouTube outages remain visible, never reported as fresh coverage.
[Repair contract and evidence](release/NEWS_AUTOPUBLISH_2026-09-23.md).
Lesson: a fix on an unmerged simulator branch does not repair scheduled main;
ship independently scoped operational repairs and verify their hosted runs.

| Record | Improvement | Recorded proof state |
|---|---|---|
| [IMP-0001](#imp-0001) | Homepage destinations and neutral replay preview | Deployed v138; bounded live verification |
| [IMP-0002](#imp-0002) | Explicit reference intake and error classification | Local candidate; not published |
| [IMP-0003](#imp-0003) | Honest security-readiness reporting | Local candidate; live security clearance blocked |
| [IMP-0004](#imp-0004) | Persistent improvement documentation | Local policy/docs candidate |
| [IMP-0005](#imp-0005) | Replay evidence boundary and player-trust audit | Local candidate; not deployed |
| [IMP-0006](#imp-0006) | Seismic Toss fixed-damage baseline | Local candidate; scoped parity, not Champions certification |
| [IMP-0007](#imp-0007) | Live turn order and per-target stage moves | Local candidate; scoped parity, not Champions certification |
| [IMP-0008](#imp-0008) | Persistent PP, Pressure and resolved replay identity | Local candidate; 100% clean scoped invariant gate |
| [IMP-0009](#imp-0009) | Authorized Supabase security readback | Live read-only audit; public launch blocked |
| [IMP-0010](#imp-0010) | Fresh-user simulator starts in safe Practice lane | Local candidate; browser and export verified |
| [IMP-0011](#imp-0011) | Expired regulation and rejected DB catalog are explicit | Local candidate; live DB read-only diagnosis |
| [IMP-0012](#imp-0012) | Eerie Spell and Spite preserve exact PP state | Local candidate; scoped Showdown parity |

Historical entries below summarize already-recorded evidence, not new runs. This index is intentionally not an exhaustive reconstruction of older work.

<a id="imp-0001"></a>
## IMP-0001: Homepage Navigation And Preview

- Recorded: 2026-08-30. Lane: experience/release.
- Before: homepage navigation did not consistently focus the destination; Edit a Team did not go directly to the editor; static preview copy implied a replay result without an uploaded replay.
- Change: focus the destination panel, route editing directly, show a neutral no-replay state.
- Evidence: [publication record](release/SITE_NAVIGATION_PUBLISH_2026-08-30.md). Hosted checks, deployed HTML fingerprint and three live button destinations/focus were verified. [PR 193](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/pull/193), merge `4f2cb179265d647706f4a1749c47d85e3e707043`, public build `v2.2.138-site-navigation-fixes`.
- Lesson: navigation should move focus along with the view; placeholder UI must not manufacture evidence.
- Remaining: full beginner/accessibility/responsive testing, cramped preview content and separate news/database issues. This release did not change battle mechanics or publish the broader audit branch.

<a id="imp-0002"></a>
## IMP-0002: Reference Intake And Learnset Diagnostics

- Recorded: 2026-08-30. Lane: source/evidence tooling. State: uncommitted local candidate.
- Before: unsupported input could be confused with a completed reference rejection; source/setup errors could be flattened into other outcomes. Team metadata and missing fields obscured meaningful comparison.
- Change: strict default intake plus explicit, recorded normalization; retain original/canonical hashes and transformations; distinguish unsupported, rejected and reference-error outcomes. Direct learnset differences are reported, not automatically promoted.
- Evidence: [intake report](../poke-sim/reports/reference_intake_policy_2026-08-30.md); `reference_intake_policy_tests.mjs` and `showdown_reference_tests.mjs` cover policy boundaries and error propagation.
- Lesson: fix the comparison's input contract before interpreting discrepancies as battle-engine defects. Reference acceptance does not prove official Champions legality.
- Remaining: source/form/IV alignment, three mechanics disagreements, complete-game and visible-log parity. No database data was changed and no 99% accuracy claim is established.

<a id="imp-0003"></a>
## IMP-0003: Security Verification Must Not Invent Passes

- Recorded: 2026-08-30. Lane: database verification. State: uncommitted local candidate; no production security change.
- Before/root cause: three checks labeled live used a local file or mock result, and skipped checks could be counted as passes.
- Change: unperformed administrative checks remain explicitly not verified; a request for their unimplemented live verification fails closed. Added read-only metadata inventory and a guarded staging SQL fixture, both clearly separated from runtime proof.
- Evidence: `poke-sim/tests/security_readiness_reporting_tests.mjs` passed four focused checks, including permissive-policy/grant mutations. The full local gate before the final guard refinement passed 149 fast and 12 offline/mock DB files. M9 reports eight local passes and three unverified administrative checks. SQL fixtures have not been executed. Independent tooling review corrections were retained and retested.
- Lesson: test the test harness itself. A green offline suite cannot substitute for real identity, permissions or deployment evidence; even ordinary omitted/default syntax needs negative regression coverage.
- Remaining: administrative readback, approved migration reconciliation, two real staging users, visitor denial tests, backup/restore and abuse-limit proof. Detailed security evidence is restricted under scan ID `459dc437-1bfb-4cf3-8fa3-367f20386396`; do not copy unresolved exploit details to public records.
- Next: obtain authorized read-only project access and an isolated staging environment. Do not apply earlier hardening proposals blindly or relax protection just to make saves work.

<a id="imp-0004"></a>
## IMP-0004: Record The Learning With The Fix

- Recorded: 2026-08-30. Lane: documentation/process. State: uncommitted local candidate.
- Before: dated reports existed, but there was no single compact improvement history or required before/after/lesson reference in each PR.
- Change: `AGENTS.md` now requires stable improvement records and explicit proof boundaries; contributor guidance and the PR template reference the same log. Removed the PR checklist's conflicting requirement to use historical `MASTER_PROMPT.md` as current status.
- Evidence: `node tests/agent_configuration_tests.mjs` passed, including log references, unique IDs and retained unverified-security scope. `git diff --check` passed for the touched files. No application/runtime behavior changed; the full application suite was not rerun for this documentation-only policy change.
- Lesson: preserve evidence in one place, link it from reviews, and make failed attempts and remaining gaps visible. Updating rules/tests through review is learning; silently rewriting production is not.
- Remaining: publish these policy/docs changes through review, then append evidence-backed entries as future fixes ship. The website and other repository are not automatically synchronized by this local change.

<a id="imp-0005"></a>
## IMP-0005: Require Evidence Before Replay Coaching

- Recorded: 2026-08-30. Lane: replay/evidence/experience. Local v139 candidate only.
- Before: plain prose generated a B/82 review on public v138. An edited or replaced log could retain old review state; a reference change could restore invalid save eligibility.
- Change: require observed positive turns and structurally populated events; invalidate review actions when evidence changes; require analysis before UI saves and retain unchanged uploaded HTML provenance.
- Evidence: [player-trust audit](release/PLAYER_TRUST_AND_JOURNEY_AUDIT_2026-08-30.md), new `replay_evidence_gate_tests.js`, existing parser/UI contracts and full local project gate. The audit records separate baseline, final-candidate and browser evidence instead of treating them as one proof.
- Lesson: test invalid evidence and transitions between valid/invalid inputs, not only successful fixtures. Preserve original-source identity separately from normalized display text. Independent review must challenge the test harness and the patch.
- Remaining: partial-log confidence, full protocol validity, async recovery, authenticated persistence and deployed verification. Three mechanics disagreements, live security proof and measured beginner usability remain open. No engine or DB schema change; no public accuracy certification.

<a id="imp-0006"></a>
## IMP-0006: Fixed Damage Is Not Zero Power

- Recorded: 2026-08-30. Lane: mechanics/evidence/release. Local engine `1.1.3`, build `v2.2.140-seismic-toss-proof`; not published.
- Before: Seismic Toss left a target at 197 HP instead of the pinned reference's 147. The zero-base-power guard conflated fixed damage with a status move.
- Change: retain immunity but bypass normal damage/crit calculation for Seismic Toss. Independent review exposed an additional Unseen Fist/Protect caller multiplier; side-swapped regressions reproduced 12 instead of 50 and now pass after the bounded correction.
- Evidence: [scoped validation](../poke-sim/reports/seismic_toss_validation_2026-08-30.md), 20 focused test groups including ten pinned doubles probes, local modifier/HP-application tests, independent read-only review and broad gate results recorded in that report.
- Lesson: validate both the damage calculator and its callers; a correct intermediate number can still be altered incorrectly. Isolate mechanics without hiding mixed-fixture failures, and exercise each side rather than one favorite team.
- Remaining: same-turn Tailwind and Growl/Leer, other fixed-damage callbacks, wider ability/item interactions, full-game/browser parity and official Champions proof. Coverage is partial, not universal. DB security and public activation remain separately gated.

<a id="imp-0007"></a>
## IMP-0007: Reorder What Has Not Moved Yet

- Recorded: 2026-09-01. Lane: mechanics/evidence/release. Local engine `1.1.4`, build `v2.2.141-tailwind-stage-proof`; not published.
- Before: the engine sorted the entire action queue before the turn, so same-turn Tailwind could not reorder waiting moves. Growl and Leer had mirrored metadata but no executable multi-target stage path. Clear Amulet did not block the shared opponent stat-drop helper.
- Change: re-sort only pending runtime actions against live priority, effective Speed and Trick Room; route Growl/Leer through a per-target Showdown-ordered resolver; expand shared stage handling for protection, reflection, inversion and allied spread-drop boundaries.
- Evidence: [scoped validation](../poke-sim/reports/tailwind_growl_leer_validation_2026-09-01.md), 25 focused checks, 5/5 declared runner probes, 153-file fast gate, 12-file offline/mock DB gate, two independent adversarial review passes and a 4,500-battle stress audit. Exact reviewer findings live in the report.
- Lesson: a turn queue is live state, not a frozen list. Spread status moves need per-target failure gates just like spread damage. Mirrored metadata is source data, not executable behavior by itself.
- Remaining: wider mid-turn Speed/priority and stat-stage inventories; complete-game/visible-log parity; official Champions proof; authorized live Supabase security checks. Coverage remains partial and cannot establish 99% or universal accuracy.

<a id="imp-0008"></a>
## IMP-0008: PP Belongs To The Pokemon, Not The Active Slot

- Recorded: 2026-09-02. Lane: mechanics/evidence/release. Local engine `1.1.5`, build `v2.2.142-pp-replay-proof`; not published.
- Before/root cause: move PP did not persist on a Pokemon, Pressure was an explicit no-op and an exhausted move could not drive the normal Struggle path. Replay rendering also discarded some non-damaging action order.
- Change: store PP by stable Pokemon identity; consume one PP normally and additional PP for each applicable opposing Pressure; derive Champion-effective max PP from the pinned Showdown mirror plus generated overrides; route exhaustion to Struggle. Preserve ordered status/action events in visible replay output.
- Evidence: `tests/pp_pressure_tests.mjs`, `tests/showdown_complete_game_tests.mjs`, `tests/phase5_turn_log_tests.js`, `tests/turn_log_export_validator_tests.js`, `tests/accuracy_harness_tests.mjs`, and `reports/pp_pressure_replay_validation_2026-09-02.md`. PP passes 11/11, complete-game comparison passes 4/4, the 155-file fast gate passes, and the final three-turn browser/export pair has zero observable mismatches. The 4,624-battle invariant gate has zero errors, warnings and repeatability failures.
- Lesson: resource state follows the registered Pokemon through switching, `BeforeMove` denial must happen before PP deduction, and replay proof needs stable action identity plus exact execution position. Generated overrides make differences inspectable instead of hiding them in hand-maintained code. Regulation/version/promotion drift must fail the harness until its exact evidence lane is reviewed.
- Remaining: Disable, Encore, Spite, Grudge and wider resource-changing interactions; more complete games, imported teams and official Champion-specific confirmation. The cross-format harness is 100% clean in its declared scope, not universal game accuracy.

<a id="imp-0009"></a>
## IMP-0009: Live Security Readback Replaces Assumptions

- Recorded: 2026-09-02. Lane: database/security. State: live read-only audit complete; no production mutation.
- Before/root cause: local tests correctly refused to label administrative checks as passed, but production policy state and migration alignment were unknown.
- Change: inspect the named Supabase project's live RLS flags, policies, role grants, functions, migration ledger and anonymous read surface. Reconcile those results with the existing local hardening migration and public-launch checklist.
- Evidence: `docs/release/SUPABASE_PUBLIC_LAUNCH_GATE_2026-08-30.md` records the sanitized readback. All 16 public tables have RLS, but production still allows anonymous shared-evidence inserts and unrestricted branch-coverage updates. The live ledger has only four entries, and no owner identity exists in the public schema.
- Lesson: RLS being enabled is not the same as least privilege, and two-user isolation cannot be tested until ownership exists in the data model. Keep production unchanged until the exact migration and staging denial evidence are reviewed together.
- Remaining: apply the hardening migration in protected staging, run anonymous HTTP mutation denials, add owner-scoped private persistence, test two real staging users, verify backups/restore and add abuse controls.

<a id="imp-0010"></a>
## IMP-0010: A Safe Gate Must Still Let A New User Practice

- Recorded: 2026-09-02. Lane: regulation/experience/release. Build `v2.2.142-pp-replay-proof`; local candidate, not published.
- Before/root cause: a fresh browser selected historical Reg M-A by default. The legality gate correctly blocked bundled teams because regulation-specific species, forms and learnsets are not approved, but a new user could not run the first simulation without understanding that Practice must be selected.
- Change: default fresh sessions to `champions_custom_practice`. Keep saved user choices, historical/review options and all competitive evidence blocks unchanged.
- Evidence: a fresh-origin browser opened Start Team Test on `Practice (unverified)`, ran one doubles Bo3 without a preflight block, rendered three retained replay samples and exported JSON. The visible sample (`loss`, seven turns) matched the exported game, which retained build `v2.2.142-pp-replay-proof`, practice ruleset/version, team digests, four stable participants per side and registered items. Regulation selection/execution, release-manifest and bundle load-order tests pass.
- Lesson: fail-closed competitive rules and a runnable practice experience are separate requirements. The safe default must never imply that practice results are regulation-approved or trusted learning evidence.
- Remaining: repeat the journey on the hosted candidate and mobile; validate detailed downloaded turn logs against visible events for more teams. This manual path proves usability of one bounded journey, not 99% universal mechanics accuracy.

<a id="imp-0011"></a>
## IMP-0011: Reachable Data Is Not Approved Data

- Recorded: 2026-09-03. Lane: regulation/database/experience. Local v143 candidate; no production mutation.
- Before/root cause: after M-B ended, the UI had no explicit current-coverage warning. A successful Supabase request still displayed `[DB connected]` when all 36 returned teams were rejected, hiding catalog and migration drift behind network health.
- Change: use the recorded M-B UTC end to report `successor_required` without inventing a regulation; classify DB roster rejection reasons and show `[DB review needed]` when zero returned teams pass the catalog gate.
- Evidence: [regulation and DB diagnosis](release/REGULATION_AND_DB_DIAGNOSIS_2026-09-03.md), deterministic regulation boundary tests, DB status tests, read-only row/migration queries and live Supabase advisors.
- Lesson: connection health, catalog acceptance, regulation approval and competitive trust are different states. Unknown current rules must fail closed while Practice remains clearly unverified.
- Remaining: human capture of the post-M-B regulation, digest-bound review, protected DB migration/reseed, anonymous-denial and two-user staging tests. No 99% accuracy or public-launch claim is established.

<a id="imp-0012"></a>
## IMP-0012: PP-Draining Moves Use One Auditable Rule

- Recorded: 2026-09-03. Lane: mechanics/evidence/release. Local engine `1.1.6`, build `v2.2.144-pp-drain-proof`; not published.
- Before/root cause: ordinary PP spending and Pressure were persistent, but Eerie Spell and Spite had no executable drain behavior and the Pressure registry comment still described the old no-op state.
- Change: add one zero-clamped PP-drain helper with structured before/after evidence; wire Eerie Spell after a successful direct hit and Spite to the target's last used move; preserve Protect, Substitute and missing-history failures.
- Evidence: [PP-drain validation](../poke-sim/reports/pp_drain_validation_2026-09-03.md), `tests/pp_drain_move_tests.mjs`, and the pinned-reference PP probe in `tests/showdown_reference_tests.mjs`.
- Lesson: resource-changing moves need exact state evidence and an independent post-turn comparison, not only a matching log sentence. Their state remains attached to stable Pokemon identity.
- Remaining: Grudge, Disable, Leppa Berry restoration, switching/called-move interactions, complete-game/browser parity and Champion-specific source approval. Scoped agreement is not a 99% or universal accuracy result.

<a id="imp-0013"></a>
## IMP-0013: Announced Is Not Approved

- Recorded: 2026-09-07 EDT. Lane: regulation/source/experience. Build `v2.2.145-reg-mc-source-review`; candidate only.
- Before/root cause: M-B had ended and the app correctly required an unknown successor, but the newly published M-C notice was not represented. Adding only the name would have hidden the incomplete roster, absent Showdown M-C format and missing sprites.
- Change: add M-C as a versioned source-review lane with exact UTC boundaries, official confirmed facts, explicit unknown roster fields, partial Showdown observations and sprite status. The app recognizes scheduled/active M-C but blocks competitive legality, trusted learning and coaching.
- Evidence: [M-C readiness review](../poke-sim/reports/reg_m_c_readiness_2026-09-07.md), `source/reg-m-c-source-review.json`, six focused M-C tests, regulation-boundary tests, sprite-fallback tests and the refreshed official-source inventory.
- Lesson: a regulation announcement is enough to create a quarantined candidate, not enough to create an allowlist. Upstream Future rows and base-form sprite fallbacks must remain visibly provisional.
- Remaining: complete in-game Singles/Doubles roster and rule captures, accepted/rejected teams, exact sprites, Z Mega mechanics fixtures, reviewed Showdown pin, immutable package approval and database publication. No M-C legality or 99% universal accuracy claim is established.

<a id="imp-0015"></a>
## IMP-0015: Replay Claims Follow Events, Not Turn-Wide Coincidence

- Recorded: September 8 UTC / September 7 EDT. Local candidate `v2.2.147-replay-attribution`; no deployed proof.
- Before: forced replacements became switch criticism, weather upkeep became fresh control, damage borrowed another hit's effectiveness, and candidate catalog matches became trusted IDs.
- Root cause: turn/species grouping and implicit/global export identity instead of event/slot and explicit context.
- Change: event-scoped parser distinctions, cautious field attribution, separated activations, unverified candidate IDs and unknown source versions distinct from exporter build.
- Evidence: [OODA report](release/OODA_REPLAY_ATTRIBUTION_2026-09-08.md), eight regression groups, 158 fast files passing, and manual local replay review.
- Lesson: shared species, shared turn and shared catalog membership are not proof of the same event or registered team. Unknown must survive serialization.
- Remaining: replay URL fetch, physical export readback, unsupported endgame/IQ judgments, extended protocol coverage, full competitive mechanics/security gates and independent review. No 99% claim.

<a id="imp-0016"></a>
## IMP-0016: Do Not Grade Decisions From Outcomes Or Missing Errors

- Local candidate: `v2.2.148-evidence-not-outcome`, September 8 UTC.
- Problem: terminal losses automatically generated Endgame Misplay; missing detected errors generated positive IQ evidence.
- Change: remove both unsupported inference paths without removing observed results or faints.
- Evidence: [OODA outcome report](release/OODA_OUTCOME_CLAIMS_2026-09-08.md), two failing-then-passing regression groups covering both formats/sides and sparse evidence.
- Lesson: an outcome does not prove an avoidable error, and absent findings do not prove skill. Keep historical records separate from revised analysis.
- Remaining: broader score/confidence calibration, downstream inference audit and public-launch gates. No manual browser or deployed proof for this candidate yet.

<a id="imp-0017"></a>
## IMP-0017: Seasonal Maintenance Is A Reviewed Evidence Loop

- September 8 UTC: added `$pokemon-season-update`, its impact checklist and read-only `season_reviewer`; routed existing engineering guidance to them.
- Reuses existing watcher/staging/sync/audit workflows rather than duplicating scheduling or granting production authority to an agent.
- [Validation and live findings](release/SEASONAL_AGENT_READINESS_2026-09-08.md): skill/TOML validation, byte-identical local installation, independent adversarial scenario test and four existing regulation test files passing.
- Lesson: workflow enabled, source healthy, candidate reviewed and rules approved are separate states. Unknown registered sets remain unknown.
- Remaining: three failed scheduled watcher runs require per-source/parser diagnosis and hosted recovery proof. New agent selection by name, actual seasonal promotion and production readiness are not established.

<a id="imp-0018"></a>
## IMP-0018: Standing Adversarial Review Mandate

- September 8 UTC: recorded the user's standing request to challenge designs and stress-test material changes in AGENTS.md.
- Requires risk-scaled failure-path tests, reproducible evidence, scrutiny of the test harness itself, and clear alternatives when assumptions fail.
- Documentation-only change: checked patch consistency; no new battle, live-service, accuracy or deployment proof claimed.
- Lesson: useful disagreement and independently grounded acceptance criteria matter more than larger passing test counts. Existing production approval boundaries remain intact.

<a id="imp-0061"></a>
## IMP-0061: Stat Input Types Must Match Runtime Arithmetic

- October 5, local v173 / engine 1.1.15: shared SP validation accepted coercible
  nonnumeric shapes and unknown stat keys. Numeric strings passed validation
  but concatenated in battle arithmetic; Blastoise HP reproduced as `"793275"`
  instead of 186.
- Reject coercible shapes/unknown keys; copy stat values into numeric runtime
  fields, preserving saved registration. Regression tests cover JSON rejection
  without persistence and numeric/string imported stat equivalence.
- Independent battle review verified unchanged guard verdicts for 204 bundled
  members and found additional paste parsing gaps, retained as open work in
  [simulation priorities](release/SIMULATION_PRIORITY_2026-10-05.md).
- Lesson: validating a number-like value is not enough; test its actual runtime
  arithmetic and avoid mutating the registered evidence.
- No deployment, official legality promotion or universal accuracy claim.
- Final local gate: 191 fast files and 12 offline DB files pass, four manual/
  helper skips. Scoped battle audit and roadmap/asset checks pass. Earlier gate
  failures exposed stale version surfaces; aligned them and rebuilt before the
  successful final run. Independent evidence: 204 member equivalences, 68
  numeric/string games and 272 before/after compatibility pairs.

<a id="imp-0062"></a>
## IMP-0062: Preserve Paste Errors And Verify The Served Build

- October 5, v174: unanchored spread matching changed negative/fractional
  inputs and dropped unknown stat labels. Added full-entry matching, canonical
  duplicate detection and parse-error propagation before import persistence.
  Independent review found ignored header variants; normalize those explicitly.
- Eleven import tests cover rejection, valid aliases, both format paths and
  registration preservation. Final full-gate result is recorded in STATUS.md.
- Browser blocked negative SPs; downloaded and audited a seven-turn local match.
  Production still v142 with old advice and four missing assets. Port 8772 was
  offline despite rendering cached v172; fresh 8773 confirms the new build.
- [Evidence and limits](release/LOCAL_LIVE_COMPARISON_2026-10-05.md).
- Lesson: preserve malformed input as an actionable error; verify HTTP and
  visible build identity before treating a browser page as a current candidate.
- No production deployment or security-gate closure; repeated Protect display
  collapsing and full replay/mobile/hosted parity remain open.

<a id="imp-0063"></a>
## IMP-0063: Separate Disconnected Publishing From DB Reconnection

- October 5, v175 candidate: user chose alignment before DB work. Pages previously
  required live credentials and changed the reviewed HTML during deployment.
- Local-only manifest disables adapter initialization even with stale credentials;
  Pages consumes no secrets and stages identical repository bundle bytes.
  Runtime/source checks remain, with explicit local-only policy assertions.
- Two focused isolation tests pass; three outdated connected-workflow contracts
  now pass focused reruns. Browser create/edit/reload preserves a custom spread.
- [Scope, evidence and pending gates](release/LOCAL_SAVE_RELEASE_SCOPE_2026-10-05.md).
- No backend mitigation, credential revocation, DB mutation or deployment claim.
  Reconnection requires security proof and separately reviewed policy changes.

## Entry Template

```text
ID / date / change lane:
Problem before and observed impact:
Root cause (confirmed or hypothesis):
Bounded change:
Regression/evidence links and related cases:
Proof state / environment / revision or build:
Reusable lesson:
Remaining gaps and next action:
Dated verification / rollback / recurrence notes:
```

For documentation-only work, use a document consistency check instead of claiming a runtime regression. For sensitive security work, keep the public entry general and point to an access-controlled record by ID.
