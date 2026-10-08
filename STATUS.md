# Project Status

> Current evidence only. Direction and acceptance gates live in [ROADMAP.md](ROADMAP.md); dated reports preserve historical proof.

Review how changes improved the project in [the improvement log](docs/IMPROVEMENT_LOG.md). Its recorded history does not replace current gates or imply that local changes are deployed.

## Latest Follow-Up

- October 8 v197 full regression: project and battle gates pass; 4,624 headless
  battles pass state/export/repeat checks after repairing a missing experimental
  profile in the accuracy manifest. Adversarial Mega admission, item mechanics,
  live result-column and Sources mobile defects remain open. Not competitive
  accuracy sign-off. See [full audit](docs/release/FULL_REGRESSION_V197_2026-10-08.md).
  Harness repair is a separate test/documentation candidate; runtime unchanged.

- v196 deployed through PR237 / Pages37850111959 at merge 209e58e. HTTP artifact
  and four external assets match. Live Run All executed 14 games; all exports
  downloaded. Of 58 compared turns, one exposed an extra late Fake Out line after
  Armor Tail already blocked it. v197 fixes that renderer issue and refreshes
  selector catalogs on regulation changes; official approval remains open.

## Prior Candidate Evidence

- October 8: v195 deployed (PR236 / Pages37846757234); exact HTML and assets
  verified. v196 candidate adds explicit, unverified M-C reference practice
  following the owner's request to get through the saved-draft gate. Official
  approval remains #232. Scoped Raichu transition and Run All exclusions are
  documented in [reference practice](docs/release/MC_REFERENCE_PRACTICE_2026-10-08.md).
  Local gate passed (204 fast / 12 offline-mock DB files); independent scoped
  review cleared. Browser Run All: 14 games / 69 turns paired with downloaded
  exports, zero observable mismatches. Hosted CI and live checks remain pending.

- October 8: v194 deployed via PR234 / Pages37845035178. Live HTML and all four
  assets matched; live unchanged-set save/reload succeeded. No battle approval.
- v195 candidate fixes Klutz suppression for type boosters and triggered items.
  Six targeted regressions pass; four failed before the fix. Item audit:
  [current source/runtime gaps](docs/release/ITEM_RUNTIME_AUDIT_2026-10-08.md).
  Raichunite X source exists, but base-to-Mega runtime transition remains unwired.
  Independent bounded review cleared; 203 fast + 12 offline/mock DB files pass,
  four helpers skipped. Final release/cache tests 11/11. CI/deployment pending.
  No M-C source promotion. Further item hooks/suppression tracked in #235.

- October 8: v194 candidate aligns M-C draft paste, bulk/JSON and editor intake.
  Reference move/item suggestions no longer depend on the older pool. Follow-up
  audit found JSON could drop draft restrictions and non-strict direct engine
  calls could execute drafts; both now have failing-before/passing-after coverage.
  Twelve focused tests pass, independently rerun and cleared. Frozen full gate:
  202 fast + 12 offline/mock DB files pass, four helpers skipped. Local browser
  unchanged-set save and reload pass. Deployment pending; unknown contexts reject.
  The question of enabling clearly labeled reference battles is awaiting owner
  direction; this candidate does not promote M-C or claim complete game accuracy.

- October 8: M-C new-paste draft intake now uses the pinned M-C reference,
  avoiding historical item/learnset rejection while retaining structural checks.
  Drafts stay local and unverified; existing-team replacement, JSON/bulk intake
  and battle execution are unchanged. Candidate tests cover preview/save parity,
  no DB write, immutable sets and rejection boundaries. Not deployed yet;
  independent review and full release gate pending. M-C approval remains #232.

- October 8: v191 Electromorphosis deployed via PR230 / Pages37833771226;
  live HTML and all four external assets match the reviewed candidate. Browser
  build/Simulator navigation passed, not a private-team battle. Shuca candidate
  now has 18 passing focused regressions and independent mechanics/release
  review clearance. Final local gate passed 201 fast + 12 DB files;
  hosted CI/deployment remain pending. DB checks are not live DB verification.
  Current item/learnset admission and M-C approval remain open in #228.

- October 8: Soak v190 deployed via PR229 / Pages37831482167; exact HTML hash
  and browser Simulator navigation verified. Electromorphosis candidate has
  18 focused tests passing after repairing a reference-discovered abort/type
  boundary. Independent mechanics/release reviews passed; full local gate
  passed 200 fast + 12 DB files. Shuca and current-regulation admission
  still block trustworthy private-team viability testing (#228).

- October 8 follow-up: v189 is deployed through PR227 / Pages37827800816;
  exact HTML SHA256 and browser Simulator navigation verified. Soak is the
  next local candidate: 31 focused cases pass, including actual type-change,
  reflection, absorption, switch restoration and subsequent damage traces.
  Independent bounded review and final gate (199 fast + 12 DB files) passed.
  Electromorphosis, Shuca, current import data and
  M-C approval still block a trustworthy full-team viability claim (#228).

- October 8: Acrobatics itemless power candidate follows Unburden PR226.
  Production-shaped mirror/runtime tests reproduced three failures; all six
  now pass. Held or disabled items retain normal power; consumed/removed items
  allow doubling. Full gate: 198 fast + 12 DB files passed. Independent review
  passed eight reference probes and actual Trick/seed battle trace checks. No eligibility
  change or private team-strength conclusion.

- October 8: Unburden switch-reset candidate separates active ability state
  from item consumption history (IMP-0077); five focused regressions pass.
  Final local gate: 197 fast + 12 DB test files passed. Independent review found
  no blocking regression (8 additional checks and 14 reference checks).
  PR225 passed hosted checks and merged; Pages37825900939 succeeded. Live v187
  HTML SHA256 matches the reviewed 6e0caa0 artifact (HTTP, not battle UI proof).
  v186 artifact and Simulator navigation were verified in production. M-C
  approval/import gates remain open; no competitive team-strength claim.

- Team viability blockers: static review found no executable Acrobatics itemless
  doubling, Electromorphosis activation, Soak type replacement or Shuca Berry
  reduction/consumption. Add failing executable regressions before repairs.
  Current and historical practice results must remain separate; no trusted
  win-rate claim until mechanics and regulation admission are verified.

- October 8 release checkpoint: PR224 merged after hosted CI/Battle Audit passed
  as 9b7e040. Pages37824723588 pending at this checkpoint; v187 remains separate.
  Independent follow-up review found/fixed a zero-HP seed-consumption edge case;
  final focused lifecycle suite passes 13/13, final full gate rerunning.

- October 8 follow-up: `fix/terrain-seed-change-dispatch` builds on PR224 without
  changing its frozen revision. Terrain-setting abilities now check both active
  sides; capped-stage logs, Klutz and shared Simple/Contrary handling have scoped
  regressions. 11 tests pass, including 20 one-turn doubles entry cases. No M-C
  approval or hosted-team claim; suppression lifecycle and Unburden remain open.

- October 8: terrain seed grounding correction on `fix/terrain-seed-reference-audit`.
  Focused regression reproduced two failures, then passed 48/48. M-C intake
  already contains 18 reference item additions; importer still uses the older
  item list. No eligibility promotion or deployment. Full seed lifecycle and
  source approval remain open: docs/release/MC_ITEM_AUDIT_2026-10-08.md.

- October 6: v184 deployed in PR222 / 26e7c20 / Pages37563372479;
  exact artifact check and live selected-regulation/reload verification passed
  at 22:47 EDT. v185 candidate separates historical/current Sources metadata,
  aligns the roadmap checkpoint and bounds Review wording. See
  docs/release/RELEASE_HANDOFF_2026-10-06.md for the ten-item worklist and limits.

- October 6: v183 deployed in PR220 / c72cba7 / Pages37562090643;
  production artifact alignment passed at 22:30 EDT. Candidate v184 aligns
  team-card checks with the selected regulation and retains structural errors
  alongside review gaps. No M-C approval or mechanics promotion.

- October 6: v182 deployed via PR219 / 71922ad / Pages37560818502; HTTP
  alignment and live evidence-only Strategy passed October7 02:14 UTC.
  v183 candidate removes QA Brain volume-confidence/causal prescriptions and
  adds team-bound printing. See the coaching surface audit for unclosed gates.

- October 6: v181 deployed via PR218 / c0367b0 / Pages37559335076.
  HTTP artifact alignment and live move-evidence panel passed October7 01:57 UTC.
  v182 candidate withdraws unvalidated Strategy/PDF coaching, grades and
  confidence scores. It exposes registered sets and matched action attempts only;
  unknowns stay unknown. Legacy templates are retained for audit, not endorsed.

- October 6: v180 deployed in PR217 / db71f0d / Pages37558126534.
  HTTP exact artifact alignment passed October7 01:41 UTC; live build/Roadmap
  navigation confirmed. v181 candidate binds Strategy move observations to
  registered sets and stable player action identity; legacy evidence is unknown.
  #209 remains open until deployed journey verification. No mechanics promotion.

- October 6 checkpoint: v179 shipped in PR215, merge fe5a44a; Pages run
  37552163599 succeeded. HTTP artifact alignment passed at October 7 00:31 UTC.
  Live desktop sample preview and disposable-team save/reload passed; #214 closed.
  Live phone save/reload and paired replay/download verification remain open
  (#211/#213). Candidate v180 removes unsupported Tailwind/Trick Room result
  attribution (#216); release evidence will be recorded on its PR.

The entries below retain historical checkpoints, not the latest deployment state.

- October 6: v178 is deployed via PR210 / merge2508d75 / Pages37376456724.
  HTTP artifact comparison passed October5 21:40 UTC; public import identity and
  320/390px editor width checks passed. #212 closed. Candidate v179 addresses
  the rejected onboarding sample and stale editor team context found during
  mobile save/reload testing (#213). It is not yet deployed. See
  [the journey report](docs/release/MOBILE_SAVE_JOURNEY_2026-10-06.md).

The entries below retain historical checkpoints, not the latest deployment state.

- October 5 deployed baseline: PR195 merged as 90bff31, Pages run37371824754
  succeeded, and HTTP artifact alignment passed for v176. Live browser confirms
  homepage opening markup/news controls and corrected Strategy attribution.
  Roadmap catch-up is a separate documentation candidate, not yet deployed.
  [Beta readiness](docs/release/BETA_READINESS_2026-10-05.md): limited practice
  beta is the target; keep Preview until remaining core journeys pass.

- October 5 standing release policy added to AGENTS.md: promptly publish tested,
  reviewed fixes through existing gates; verify primary production before closure;
  record blockers explicitly and sync Alfredo only after primary verification.
  This policy update does not itself deploy v176 or establish backup readiness.

- October 5 v176 / #209: Strategy move-evidence dashboard now consumes the
  detector's `pokemon` field, withholds unnamed rows and stops inventing zero
  execution counts from absent winning-log mentions. Regression reproduced the
  name failure before the fix; browser shows Typhlosion-Hisui / Eruption and
  explicitly unknown execution count. Legacy detector remains name/text-based,
  not stable-participant action proof. Hosted verification and #103 alignment
  remain open; no deployment or ticket closure implied.

- October 5 tracking update: created GitHub #209 for missing Strategy actor
  attribution and updated existing deployment-hardening #103 with the eleven-tab
  audit and closure gates. Roadmap source now orders alignment before database
  follow-up and distinguishes disconnected scope from backend remediation.
  Neither ticket is closed; no new deployment or mechanics proof in this update.

- October 5 page-by-page follow-up: all eleven navigation sections inspected
  against production. Live remains v142 versus local v175; homepage, roadmap,
  roster filtering and data mode differ. News feed text matches after line-ending
  normalization. Local Strategy renders missing actor names as `undefined`;
  this remains open. [Comparison and remaining work](docs/release/LOCAL_LIVE_COMPARISON_2026-10-05.md#page-by-page-follow-up-v175-versus-live-v142).
  Hosted checks were pending; no deployment or alignment sign-off.

- October 5 v175 alignment scope: user requested production/local alignment
  before database work. Prepared an explicit local-save-only release: manifest
  disables DB initialization despite credentials; Pages no longer consumes or
  injects DB secrets and preserves bundle bytes. No DB mutation or security
  closure. [Scope and acceptance](docs/release/LOCAL_SAVE_RELEASE_SCOPE_2026-10-05.md).
  Deployment is not yet confirmed; connected release remains blocked.

- October 5 v174: anchored pasted-spread validation preserves errors, rejects
  duplicate/unknown stats and recognizes case/whitespace header variants.
  Fresh local server 8773 is browser-confirmed; old 8772 was offline with a
  cached v172 page. Local seven-turn download has bounded visible-text pairing;
  live v142 completed a ten-turn smoke test but its export remains unpaired.
  [Local/live comparison](docs/release/LOCAL_LIVE_COMPARISON_2026-10-05.md).
  Production is active but not aligned or release-approved. No deployment.
  Final local gate: 191 fast files and 12 offline DB files pass, four helper/
  manual skips. Independent header follow-up: 16 checks pass, zero rejected
  persistence calls. Final browser reload rejects `sps : -1 HP` visibly.

- October 5 simulation-first candidate v173 / engine 1.1.15: reject malformed
  coercible SP values and unknown stat keys; normalize runtime numeric-string
  spreads without mutating registration. Independent review reproduced the
  HP concatenation bug and identified remaining paste-parser/direct-call gaps.
  Final project gate: 191 fast files and 12 offline DB files pass (four manual/
  helper skips); scoped battle audit, roadmap generation and asset checks pass.
  Independent review: 204 member equivalences, 68 numeric/string battle pairs
  and 272 before/after compatibility pairs. Earlier gate attempts caught stale
  release-version surfaces, now aligned and rebuilt. Browser/hosted proof open.
  [Ordered queue](docs/release/SIMULATION_PRIORITY_2026-10-05.md).
  Login feature work deferred, security gates still open; not deployed.

- October 5 follow-up verification: local real Auth/REST tests confirm that
  evidence confidentiality still fails its intended boundary. Public controls
  and browser write denial pass, but trusted-writer authorization remains
  unverified. Sensitive reproducer/results are retained in the local security
  artifact collection. No production mutation or new policy fix in this pass;
  the security release gate remains blocked (IMP-0060).

- October 5 isolated Supabase: local Auth, REST, gateway and PostgreSQL now
  run without a production link. Basic two-user private-team HTTP tests pass.
  Existing SQL isolation diagnostics exposed a reference-visibility bug;
  an additive local-only migration now passes the reproduced case and expanded
  owner/public/invalid-reference controls. Twelve offline DB files pass.
  Independent static patch review found no new predicate bypass; hidden-detail
  confidentiality and trusted-writer authorization still need proof;
  this does not authorize a production migration or close the security gate.

- October 5 audit index: [release traceability](docs/release/RELEASE_TRACEABILITY_2026-10-05.md)
  maps recent fixes to immutable commits, scoped evidence and open gates, with
  a required record contract for subsequent changes. Older unmapped history
  is explicitly not certified. This documentation does not close release gates.

- October 5 documentation checkpoint: the [v172 release review](docs/release/V172_RELEASE_GATE_REVIEW_2026-10-05.md)
  now includes status inventory and diagrams for deployment, security approval
  and reversible Docker recovery. Docker startup is verified repaired; local
  Supabase/Auth testing and production deployment are not complete. The live
  artifact comparison still records v142 versus local v172 (IMP-0058).

- October 5 release/security follow-up: v172 pushed as b998541. Independent
  release review found no additional CSS/version defect and reproduced bundle
  and asset checks. Authorized live metadata readback now works, but does not
  meet the shared-evidence containment contract; private-save prerequisites
  are absent and isolated cloud staging was not found. No production mutation.
  Existing containment passes fresh isolated PostgreSQL fixtures, not live
  Auth/ownership. Production remains held. See
  `docs/release/V172_RELEASE_GATE_REVIEW_2026-10-05.md` for scope and next steps.

- October 5 v172 / engine 1.1.14: mobile results intrinsic-width overflow fixed;
  chart canvases and audit cards shrink within zero-minimum grid tracks. Five
  focused layout assertions and the full 190-file fast / 12-file offline DB
  gate pass (four manual/helper skips). Prior populated-browser measurements
  are 385/385 portrait and 839/839 landscape document widths. IMP-0056 records
  the obsolete CSS expectation and its corrected regression guards. The final
  replay download pairing, complete edit journey and production gates remain.
  Hosted v171 commit 2f34e15 checks passed; Supabase Preview was skipped.
  Those results do not yet cover v172 or prove live database isolation.

- October 5 v171 / engine 1.1.14: first turn now preserves a separate entry
  snapshot before Mega Evolution and actions; prior pre-action semantics remain
  unchanged. Legacy replays explicitly disclose missing starting evidence.
  Independent review compared 136 paired doubles games across all 34 bundled
  teams with unchanged RNG/results after excluding added evidence/version.
  Full project gate and scoped battle audit passed. Browser shows starting
  Cloud Nine; the new nine-turn run still needs its actual download paired.
  Reconciled main's 45c9e28 news refresh without altering its feed; rebuilt
  release metadata instead of choosing one conflicting generated hash.
  Fresh hosted checks and production verification remain separate. See IMP-0055.

- October 5 v170 / engine 1.1.13 candidate: browser testing exposed converted
  Normal moves incorrectly blocked by Ghost immunity. Shared type resolution
  fixes that boundary; independent pinned-Showdown review accepted its scope.
  Download fallback is visible in Replay Log and an actual v169 file was
  ingested. Audit schema handling now reads its execution provenance correctly.
  Turn 0's post-Mega labeling remains a confirmed open finding. Full evidence
  and limits: `docs/release/REPLAY_EXECUTION_FINDINGS_2026-10-05.md` (IMP-0054).

- October 5 v168 / engine 1.1.12: shared base/Mega abilities now preserve a
  confirmed base-form selection. Separate Pilot Guide no longer derives
  matchup verdicts, threats or generic strategy from win rate/fainted names.
  Ten ability cases and 32 analytics checks pass; independent mechanics review
  found no additional source blocker. Rebuilt root entry visibly loads v168.
  Battle audit passed its declared scope (4,500 games); universal parity remains
  unproved. Export pairing, mobile journey, live security, regulation review,
  hosted checks and production verification remain open. See IMP-0053.

- October 5 v167 candidate: selected base abilities distinct from their Mega
  ability survive construction; startup resolves duplicate matchup selections
  before rendering; inline Pilot Notes report observations instead of matchup
  verdicts. Browser confirms Cloud Nine in result stats and stable default
  matchup. Shared base/Mega ability collisions, separate Pilot Guide claims,
  downloaded-log pairing and live security/ruleset gates remain open. IMP-0052.

- October 5 active execution queue: see
  `docs/release/PUBLIC_PRACTICE_RELEASE_CHECKLIST_2026-10-05.md`.
  No history removed or gates closed. Constructor diagnostic reproduces
  selected Cloud Nine becoming Natural Cure before Mega Evolution; this is
  not just a result-table label. Fix requires scoped mechanics regression and
  review, preserving legacy Mega-ability input compatibility.

- October 5 v166 candidate: replay export reuses the retained-URL download
  helper; nested raw-log controls no longer close the replay card. Browser
  confirms the interaction repair but download completion remains unverified.
  Selection/ability consistency and Pilot Notes findings remain open. See
  IMP-0050; no production deployment or mechanics approval.

- October 5 reconciliation: merged main at a5c2224 into the v165 candidate,
  preserving main's news-only auto-publish workflow and current feed. Rebuilt
  the bundle instead of choosing conflicting generated metadata. This resolves
  branch conflicts, not the documented mechanics/security release gates; no
  production deployment is authorized by a green local gate alone.

- October 5 gate recheck: battle audit, 187-file fast gate, 4,624 cross-format
  invariant runs and six bounded Showdown probes pass locally. M-B/M-C remain
  source-review blocked; reference catalog normalization and hosted replay
  findings remain open. PR #195 is conflicting. See
  `docs/release/RULESET_GATE_RECHECK_2026-10-05.md`.

- October 4 live player audit: one fresh hosted v142 doubles game completed.
  Raw/formatted replay discrepancies, one-game coaching overconfidence, and
  save/export evidence gaps remain open. Not an accuracy certification. See
  `docs/release/LIVE_PLAYER_AUDIT_2026-10-04.md`.

- October 4 full team inventory: 34 bundled + 13 tournament-review + 36 live DB
  records inspected. 20 bundled and 16 builtin DB records fail pinned M-C
  reference checks; different IV persistence explains four apparent DB passes.
  All tournament entries lack stat spreads. Read-only evidence and limitations:
  `docs/release/FULL_TEAM_AUDIT_2026-10-04.md`.

- October 4: v165 adds per-member M-C reference diagnostics for bundled and
  imported teams, without rewriting historical sets or approving M-C. Local
  candidate only, not deployed. See IMP-0048 and
  `docs/release/PRELOADED_MC_LABEL_AUDIT_2026-10-04.md`.

- October 1: v164 packages the mobile/selection fixes with a distinct build/cache
  identity. [Release handoff](docs/release/V164_RELEASE_HANDOFF_2026-10-01.md)
  records four merge conflicts and preserves the broader release blockers.
  Older uncommitted notes below describe the implementation stage; no live
  deployment is implied by packaging this candidate.

- Final-selector rendering fix: three red/green regressions and local browser
  reload align headings and rosters after catalog filtering. Candidate-only,
  no deployment. See IMP-0046. Save quarantine diagnosis remains open: the same
  warning covers non-promotable practice as well as missing identity.

- Mobile layout patch is an uncommitted local candidate: width-based stacking,
  bounded bring slots and contained audit tables. Initial browser geometry checks
  pass at 360/390 portrait, 844 landscape and 1280 desktop. Not deployed; physical
  devices and paired battle/export checks remain open. See
  [operational check](docs/release/LIVE_OPERATIONAL_CHECK_2026-09-30.md).
  Next: investigate candidate team heading/selection mismatch, then fresh-result
  execution provenance and replay fidelity. Do not weaken validation to ship.

- September 24 Downloads intake: `npm --prefix poke-sim run qa:downloads`
  validates the newest matching local export without uploads. The supplied
  240-replay artifact passes strict turn-log checks but lacks complete per-replay
  execution provenance and includes old history plus regulation-blocked testing.
  [Receipt and built-in QA correction list](docs/release/DOWNLOAD_QA_AUDIT_2026-09-24.md).

- September 24 live browser audit: one v142 practice doubles game inspected
  against its on-page raw engine log. Repeated same-name replacement, Protect
  and faint events are omitted from formatted replay text; one damage line is
  duplicated. Fresh analysis saving was quarantined. JSON download could not be
  verified in the in-app browser, so automated pairing remains blocked.
  [Evidence and ordered fixes](docs/release/LIVE_REPLAY_AUDIT_2026-09-24.md).
  These findings are open, not a mechanics-accuracy certification.

- M-C draft-team reference smoke tests: three complete doubles teams validate;
  base/Mega stats checked; six distinct games reproduce battle events across
  delayed repeats (12 executions; raw timestamp records retained separately).
  Live v142 has no M-C option, so these are not live-app results or competitive
  approval. [Exact scope and next integration gate](docs/release/MC_DRAFT_TEAMS_2026-09-09.md).

- v163 captures the newly published 262-row official M-C roster and an isolated
  pinned Showdown M-C/M-B reference. 260 identity candidates map; two form IDs
  remain unresolved. 42 individual-set reference probes pass, not full-team or
  in-game proof. Stale warning text is corrected without approving M-C.
  [M-C intake, migration risks and remaining gates](docs/release/REG_MC_INTAKE_2026-09-09.md).

- Cross-repo candidate handoff: Alfredo draft PR #276 now carries the same v162
  candidate as Yfactor PR #195. Read-only merge simulation found no conflicts and
  no content delta from the tested candidate. Main branches and live deployment
  remain unchanged. See [exact comparison and release gates](docs/release/CROSS_REPO_ALIGNMENT_2026-09-09.md).

- v162 is a roadmap/release-label update only; engine 1.1.10 and battle logic
  are unchanged from v161. Markdown and the browser roadmap now use the same
  ordered queue. This candidate is not a new mechanics-accuracy claim or deployment.

- September 9 release review: v161 remains candidate-only; live artifact readback
  identifies v142. Required move-pool and intro-sprite bytes now have generated
  digests and pre-upload verification. See [release review](docs/release/RELEASE_REVIEW_2026-09-09.md).
  Open mechanics reviews and live security gates still prevent merging the full
  candidate. Read-only database access works; isolated staging remains absent.

- v161 preserves registered member IDs through unambiguous paste edits and
  reordering; species replacements get fresh IDs. Conflicts block saving, and
  SV preview uses the saved format. Actual upload/edit/reload plus paired battle
  exports pass. [Identity evidence and limits](poke-sim/reports/member_edit_identity_2026-09-08.md).
  Local full gate and hosted CI `34294165076` pass for code commit `e3705db`.
  Final independent review was
  unavailable after agent usage limits, so parent verification is identified.

- v160 fixes the shared Champions move-pool path exposed by the preceding audit.
  All 235 reviewed identities and eight narrowed set probes agree with pinned
  Champions. Imports/replays use explicit context; stale teams remain editable
  under Needs review but cannot enter runnable selections. Full local gate,
  independent review and browser failure-path checks pass; hosted CI `34198148786`
  passed for `31b7d92`. Complete-set,
  official approval and DB publication remain open. See
  [scope and evidence](poke-sim/reports/champions_move_context_validation_2026-09-08.md).

- The paste-editor identity/preview findings are addressed in v161 above.
  Broader copy/restore identity, SV IV roundtrip fidelity and complete-set legality
  remain open; the bounded custom-team test does not close those contracts.

- v159 separates team validation from regulation approval and fixes compressed
  mobile roster text. Five browser viewport/input checks cover the actual Teams
  page. [Team review evidence](poke-sim/reports/team_review_clarity_2026-09-08.md)
  retains remaining contrast and broader legality-path gaps.

- v158 aligns roster types and unboosted Speed with generated/runtime data and
  fixes Eternal Flower Floette alias fallback. Unknown formats stay unknown;
  species-only radar entries no longer claim matchup safety. Verification and
  exclusions: [runtime consumer audit](poke-sim/reports/roster_runtime_validation_2026-09-08.md).

- M-B identity review now resolves all 235 official rows. Two explicit aliases
  are backed by official sprite/DOM evidence and independent visual review.
  All mapped baseline stats/types/ability slots/Dex numbers match pinned
  Showdown Champions. No runtime legality or in-game approval is inferred.
  [Sign-off audit](docs/release/REG_MB_SIGNOFF_AUDIT.md) retains the remaining gates.

- v156 generic coach templates stop inventing causes, best plans, absent scores
  and confidence from volume. They retain recorded facts and explicit unknowns.
  [Template audit](poke-sim/reports/coach_template_validation_2026-09-08.md)
  records the bounded withdrawal; broader strategy correctness remains open.

- v155 withdraws unsupported decision-audit alternatives and execution diagnoses.
  Current snapshots cannot establish full historical action availability; the
  UI retains actual replay evidence and states this limit. See
  [regressions and re-enabling gate](poke-sim/reports/decision_evidence_validation_2026-09-08.md).
  Broader coaching correctness remains open.

- v154 removes hidden startup games and corrects replay contrast/mobile reserve
  overflow. Browser audits download each intentional game, bind requested team
  identity and recheck retained history after swapping. See the
  [scoped audit](poke-sim/reports/intentional_replay_validation_2026-09-08.md).
  Independent review reproduced unsupported causal coaching and zero-PP
  alternatives; the v155 entry records their bounded withdrawal, not full coach approval.

- v153 Perish Song follow-up: 22 independent-review-confirmed probes cover
  countdown, recipient defenses, concealment/No Guard and terminal faint order
  with/without Trick Room. Full gate passed 165 fast and 12 offline/mock DB files,
  with four manual/helper skips; battle audit and local version smoke passed. See
  [evidence and exclusions](poke-sim/reports/perish_song_validation_2026-09-08.md).

- v152 PP/Substitute candidate, engine 1.1.8: 80 scoped synthetic reference probes
  pass after corrections to bypass, status protection, sound immunity, secondary
  PP drain and Clangorous Soul cost/evidence. Three wrong historical expectations
  were corrected only after reference checks. See the
  [boundary audit](poke-sim/reports/pp_substitute_validation_2026-09-08.md).
  Final artifact full gate passed 164 fast and 12 offline/mock DB files, with four
  manual/helper skips. No deployment or competitive legality approval.

- [One-time overnight handoff](docs/release/OVERNIGHT_HANDOFF_2026-09-08.md):
  initial 233 review-only identity candidates (now 235 after form review), and 16
  pinned-baseline Mega field comparisons. No regulation promotion. Independent
  review caught and verified fixes for form substitution and CRLF artifact drift.

- v151 M-B sign-off audit: official deadline correction and 235 unique official
  roster IDs captured. The old visual ledger has a duplicate and species
  discrepancies, so full approval remains blocked. See
  [acceptance work and evidence](docs/release/REG_MB_SIGNOFF_AUDIT.md).
  Bundle: 11,478,185 bytes, SHA-256
  `8a9882d50d0a646dc6f0516d777433612a183a27f149c118452550e6e9cdd265`.

- [Staging discovery](docs/release/SUPABASE_STAGING_DISCOVERY.md): GitHub and the
  connected Supabase account checked read-only. Only main is confirmed; CI test
  secret names are absent at repository scope. `_T` alone does not prove isolation.
  Staging mutation and two-user tests remain gated; no database changes made.

- v150 candidate: retro Gengar/Nidorino opening, sprite precache, and migration
  filename hardening. See IMP-0021/0022. Bundle: 11,477,562 bytes, SHA-256
  `d025ef402e86007c8fcf8169018e7cc7f73b18224ce8c330938a5e35cedd8549`.
  Desktop/mobile motion checks and 12 Bash filename cases pass. Production database,
  staging creation and Pages deployment are unchanged.

- [Seasonal skill/reviewer readiness](docs/release/SEASONAL_AGENT_READINESS_2026-09-08.md): reusable season skill and read-only reviewer added, locally validated and independently scenario-tested. Existing regulation/staging/selection gates pass. Live Regulation Watch is enabled but its latest three inspected scheduled runs failed; September 7 reports 28 unavailable sources. Source/parser recovery is open, not masked by adding another scheduler.

- September 8 audit correction: [product trust audit](docs/release/PRODUCT_TRUST_AUDIT_2026-09-08.md) reproduces stale/misattributed Strategy reports and evidence-free advice; unresolved PR #195 mechanics and regulation findings remain release blockers despite green CI. The requested destination now includes both singles and doubles; existing doubles-only roadmap scope requires reconciliation. Do not treat Josh QA as the only remaining release gate.

- Branch: `candidate/v143-regulation-db-diagnosis`, based on merged `origin/main` at `81bb0ef250da`.
- Current runtime candidate: `v2.2.164-mobile-selection`; engine `1.1.10`. Earlier mechanics receipts retain their original scope. The installed reference is not upgraded. Candidate updates go through PR #195; no new Pages deployment is claimed.
- [Company-findings OODA cycle](docs/release/OODA_COMPANY_FINDINGS_2026-09-08.md): eight Leftovers/Toxic reference probes pass; replay matching is contained pending a verified identity resolver; timing-only coaching is excluded from scoring and critical-mistake cards. Six new regression groups and manual doubles/p1 plus singles/p2 replay reviews pass. News CLI repair is candidate-only. Shared-write containment passed isolated PostgreSQL controls but is not applied to Supabase; staging and private-schema verification remain open.
- [Independent company audit](docs/release/INDEPENDENT_COMPANY_AUDIT_2026-09-08.md) preserves the original findings. The linked OODA report owns their subsequent disposition. Live security and watcher health remain release gates; the inspected public site is v142.
- [Outcome-claim OODA cycle](docs/release/OODA_OUTCOME_CLAIMS_2026-09-08.md): removed automatic endgame-error judgments from final losses and positive IQ evidence from missing errors. Two regression groups pass across both formats/sides and sparse evidence; full fast gate passed 159 files with four manual/helper skips. Roadmap source/browser view regenerated. Broader IQ calibration, downstream inference, URL/download and all independent release/security gates remain open; no manual v148 browser verification is claimed.
- [Replay OODA cycle](docs/release/OODA_REPLAY_ATTRIBUTION_2026-09-08.md): forced-switch/weather-upkeep classification, damage/move attribution, ability/item separation and unverified export identity corrected. Eight focused groups and 158 fast files pass. Manual pasted M-B replay confirms scoped visible fixes; URL fetch and physical download readback remain unverified. Outcome-based Endgame Misplay/Battle IQ claims still need correction. This is agent QA, not Josh approval.
- [First OODA fix cycle](docs/release/OODA_STRATEGY_FIX_2026-09-08.md): full-input Strategy/Mega cache identities, separate cloned-team reports, and disabled unsupported Fake Out/redirection claims; 69 focused checks pass. Saved-history/UI continuity, confidence, PP and regulation findings remain open.
- Historical v149 project gate: 160 fast files and 12 offline/mock DB files passed, with four manual/helper skips and three administrative security checks explicitly unverified. Its battle audit included 4,500 matrix runs and three golden battles. See the v161 entry and latest release review for current receipts. Production was not mutated.
- [Regulation M-C source review](poke-sim/reports/reg_m_c_readiness_2026-09-07.md): exact official UTC dates, six named Mega additions, the 24-Pokemon statement and Rillaboom example are captured from the official notice. M-C is visible but noncompetitive and blocked pending the complete in-game roster, rules, legality fixtures, mechanic deltas and reviewed reference format. Five named forms use base-form sprite placeholders because exact upstream assets returned 404.
- [Eerie Spell and Spite PP-drain validation](poke-sim/reports/pp_drain_validation_2026-09-03.md): four focused boundary groups and all 19 pinned Showdown reference contracts pass, including exact post-turn PP parity for a doubles probe. Protect, Substitute, missing move history and zero-PP failure behavior are covered. Broader PP-changing moves, Pressure interactions and complete-game parity remain open.
- [September 3 regulation/database diagnosis](docs/release/REGULATION_AND_DB_DIAGNOSIS_2026-09-03.md): M-B coverage now expires at the retained exact UTC boundary and requires an unknown successor rather than inventing one. Live Supabase returned 36 legacy teams and 204 members, but all rows lack current version identity, so the UI reports `[DB review needed]` and keeps the bundled roster authoritative.
- September 23 news-only repair: owner approved tested news autopublishing on
  the existing six-hour schedule. See [scope, tests and source outages](docs/release/NEWS_AUTOPUBLISH_2026-09-23.md).
  This does not approve or include the separate M-C simulator candidate.

- Historical main-branch note (superseded by candidate status above): `audit/project-open-items-2026-07-05`; dirty worktree preserved. Cached `origin/main` comparison after PR #193: 9 commits ahead, 4 behind.
- Historical candidate: `v2.2.141-tailwind-stage-proof`; engine `1.1.4`. Final local bundle: 11,460,764 bytes, SHA-256 `30de68bb9212981ba340d31a60768439e77e952f28818075db7c31a3e782053b`. No deployment is claimed.
- Full project gate after final Tailwind/Growl/Leer release corrections: 153 fast files and 12 offline/mock DB files passed. Battle audit: 44 deterministic files, three golden traces and 4,500 completed headless battles, zero execution errors. M9 retains eight local passes and three administrative checks not verified. Live DB permissions were not exercised.
- [Tailwind/Growl/Leer validation](poke-sim/reports/tailwind_growl_leer_validation_2026-09-01.md): 25 focused checks and all five declared pinned probes agree in bounded synthetic doubles scope. Two independent adversarial review passes closed live priority, reflection, accuracy/Substitute and selected ability/item boundary mismatches. Coverage remains partial; complete games, browser parity, broader interactions and official Champions proof remain open.
- [Seismic Toss validation](poke-sim/reports/seismic_toss_validation_2026-08-30.md): 20 focused groups pass, including ten pinned side-swapped doubles probes for ordinary damage, Ghost, Protect, Unseen Fist and Parental Bond. Independent reviewer confirmed 18 additional probes and closed its scoped finding. Coverage remains partial. Local v140 header/roadmap loaded without captured console errors; no browser battle or production save was performed.
- [Player trust and journey audit](docs/release/PLAYER_TRUST_AND_JOURNEY_AUDIT_2026-08-30.md): inspected all 11 public sections and bounded desktop/mobile journeys; 4,500 headless battles completed without execution errors, but three pinned mechanics disagreements remain. Local replay guard rejects absent/malformed observations, clears stale review actions/status and preserves original HTML provenance. Local browser positive/negative checks passed. Public Strategy counts/coaching, roster trust labels, stale source/roadmap text and navigation friction remain open. Zero browser simulation batches or paired exported games were produced in this audit.
- [Site quick wins](docs/release/SITE_QUICK_WINS_2026-08-30.md): homepage destination focus, direct editor routing, removal of canned replay advice, native roadmap disclosure markers and only the first blocker expanded. Desktop and 390px iframe checks passed in their stated scope; the full beginner, physical-device and screen-reader audits remain open. Independent scoped release review found no actionable issue.
- [First intake diagnostic fix](poke-sim/reports/showdown_intake_diagnosis_2026-08-30.md): unsupported inputs no longer become top-level reference rejections; 18/18 reference contracts pass. Fresh pinned probes still report 2 scoped agreements, 3 mechanics mismatches and zero completed games. Corrected the old explanation of unsupported catalog inputs; no team/learnset data changed.
- [Explicit reference intake and learnset audit](poke-sim/reports/reference_intake_policy_2026-08-30.md): strict defaults preserved; opt-in level/provenance normalization, original/canonical hashes, structured reasons and separate reference-error counters implemented. Seven new intake/audit tests plus 18 reference checks pass. Per pinned format, 1,517 direct rows yield 995 equal, 232 review-required and 290 unresolved; this is not official eligibility or DB alignment.
- Shared roadmap source: [project-roadmap.json](poke-sim/source/project-roadmap.json). It generates both this repo's [ROADMAP.md](ROADMAP.md) and the local browser Roadmap data. Stable roadmap IDs are not GitHub milestone numbers.
- Browser evidence links target GitHub main; local candidate documents may not be published there yet. Current Markdown/evidence paths were checked locally, not proven deployed.
- [Consolidation audit](docs/release/ROADMAP_CONSOLIDATION_2026-08-30.md): removed stale active percentage scores and monetization-first blockers, merged overlapping plans, and preserved historical notes.

## Remote Evidence

- [PR #194](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/pull/194) merged v142 through green hosted checks at `81bb0ef250dab05d46c7435f3a1a25899c9521b1`; Pages deployment `33746502806` passed and the public artifact was manually smoke-tested. V143 remains a candidate until its own review and deployment finish.
- Narrow clean-main site fixes merged through [PR #193](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/pull/193) after green hosted checks on candidate `6fe9cd1`; merge commit `4f2cb179265d647706f4a1749c47d85e3e707043`. Pages run `33344630879` succeeded. Public v138 bytes/hash and all three homepage button destinations/focus were verified. This is not the full audit worktree or Node-only normalization deployment. See [publication evidence](docs/release/SITE_NAVIGATION_PUBLISH_2026-08-30.md).

- [August 30 live GitHub reconciliation](docs/release/GITHUB_QUEUE_RECONCILIATION_2026-08-30.md): canonical repo has 69 open issues, 17 open milestones and 2 open PRs; Alfredo has 56, 15 and 4 respectively.
- 54 matching-title cross-repo issue pairs are reconciliation candidates, not proven duplicate acceptance contracts. No issue/milestone was closed.
- Remote main commit identities differ; repo, deployment and DB 1:1 alignment are not established. Canonical branch API reports unprotected; full environment/ruleset verification remains open.
- Historical Pages evidence (August 30 EDT / August 31 UTC): deployed `v2.2.138-site-navigation-fixes`, 11,293,894 bytes, SHA-256 `078fff650a4ef2fe154d1b50e09534f031de3232e48a464e6c3c947136cffa1a`. September 9 manifest readback identifies v142; this does not constitute a fresh manual battle audit.
- August 29 public Supabase audit: 8,653 approved Showdown rows, 36 teams / 204 members / 34 complete teams, zero active Champions overrides. Public connectivity does not prove applied private schema, migrations, persistence or safe writer permissions.

## Active Gates

Immediate priority: [Supabase public-launch security gate](docs/release/SUPABASE_PUBLIC_LAUNCH_GATE_2026-08-30.md). Live administrative readback is available and confirms remaining security work; protected staging and two-user isolation proof are missing. No production security change is claimed.

| Gate | Local evidence | Still open |
|---|---|---|
| Simulation and replay | [Identity/bring-four fixes](poke-sim/reports/identity_validation_2026-08-30.md), [Seismic Toss proof](poke-sim/reports/seismic_toss_validation_2026-08-30.md), [Tailwind/Growl/Leer proof](poke-sim/reports/tailwind_growl_leer_validation_2026-09-01.md), [PP-drain proof](poke-sim/reports/pp_drain_validation_2026-09-03.md), [paired replay audit](poke-sim/reports/visual_replay_audit_2026-08-30.md) | Team translation; complete-game and visible action/Tailwind parity; broader fixed-damage, timing, stage and resource-changing interactions; Strategy-cache context and misleading coaching; broader mechanics coverage |
| Regulations and sources | [Watcher/staging safeguards](docs/release/REGULATION_WATCH_2026-08-30.md): 35 watcher tests, 39 staging checks, 10 legacy approval checks; [M-C source review](poke-sim/reports/reg_m_c_readiness_2026-09-07.md): exact dates and named additions captured while runtime promotion fails closed | Capture the complete M-C in-game Singles/Doubles roster and rules, accepted/rejected legality fixtures, move/item/Ability deltas and reviewed reference format. M-A/M-B remain unverified. Hosted activation, evidence keys and atomic human approval/publication remain open |
| Database and evidence | [DB audit](docs/release/SUPABASE_FULL_AUDIT_2026-08-29.md), [September 3 diagnosis](docs/release/REGULATION_AND_DB_DIAGNOSIS_2026-09-03.md), private staging migration prepared | Reconcile four live migrations and 36 legacy teams; protected migration/reseed, anonymous denials, two-user isolation, roster pagination, indexes and trusted private writers |
| Release and repo alignment | Local manifest/cache, test gate and Pages asset checks exist | Reconcile incoming changes, dependency/install-policy review, protected main/environments, hosted CI, reviewed deploy, rollback and parity proof |
| News/reference catalog | [Curated feed](docs/release/HOMEPAGE_NEWS_REFRESH_2026-08-30.md), [13 Worlds review-only teams](poke-sim/reports/worlds_top_cut_validation_2026-08-30.md) | Hosted refresh/deployment proof, full replay coverage, private stat points and approved regulation mapping |

Current competitive product scope is **doubles only**. Singles fixtures are shared-mechanics regressions. No verified 99% game-accuracy claim follows from passing tests.

## Next Task

1. Establish protected staging; test shared-evidence write containment and private-save ownership before explicitly approved production changes.
2. While those approvals are pending, reproduce and fix Toxic rounding, Spite hit resolution, suppressed-item effects and Wish/Leftovers ordering against pinned Showdown. Each fix needs a failing regression, related cases and independent review.
3. Extend copy/restore identity, SV IV roundtrip and complete-set legality tests. Complete M-C source evidence without silently approving rules.
4. Review the exact final candidate, run hosted CI, then have `@jdoutt38` test that revision with paired visible/export logs. The old v145 checklist is historical, not the current sign-off target.
5. Deploy only after applicable gates pass; verify live artifact/assets and user journeys. Reconcile Alfredo through a reviewed PR, not an overwrite.

September 9 remote readback: origin candidate `08451b7`, origin main `81bb0ef`, Alfredo main `15f0f98`. Both main branches differ and neither is the tested candidate. Documentation alignment does not establish repository parity. The [release review](docs/release/RELEASE_REVIEW_2026-09-09.md) owns detailed evidence and blockers; the generated roadmap uses this same priority order.

Preliminary agent walkthrough is recorded in the player-trust audit. The full [beginner homepage/navigation study](ROADMAP.md#beginner-experience) and its [checklist](docs/strategy/BEGINNER_HOMEPAGE_AUDIT_PLAN.md) remain queued after simulation readiness. Neither roadmap consolidation nor an agent walkthrough proves A+ usability. Evidence-backed Brain expansion follows trusted simulation/evidence; optional LLM, social, premium and broader product ideas remain deferred.

## History

The [previous status snapshot](docs/archive/STATUS_PRE_CONSOLIDATION_2026-08-30.md) retains earlier builds, test counts and dated observations. Historical reports do not override current gates. Use [AGENTS.md](AGENTS.md) for policy and fully qualified GitHub references for issue actions.
