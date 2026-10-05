# Local And Production Checkpoint

October 5, 2026. Candidate v174 / engine 1.1.15. Production v142.
This is bounded smoke testing, not approval to deploy or a game-accuracy score.

## Input Fix

Anchored spread parsing rejects negative/fractional/malformed entries, unknown
stat labels and duplicate canonical stats, including duplicates across lines.
Errors survive into both Champions and SV import validation before persistence.
Case/whitespace variants of SPs/EVs/IVs headers are recognized instead of ignored.
Valid aliases and distinct-stat multiline inputs remain supported.

Independent review reproduced 16 malformed-input/format cases admitted by the
prior revision; current guarded paths reject all 16 without persistence. Review
also found the header-variant bypass, addressed before finalizing this patch.
No regulations, historical teams, DB policies or sources changed.

Final validation: 191 fast files and 12 offline DB files pass, four helper/manual
skips; release asset hashes pass. Independent final header check: 16 cases pass
without rejected persistence calls. Reloaded final local browser rejects
`sps : -1 HP` visibly. Hosted verification is separate from these results.

## Browser Findings

| Check | Local | Production |
| --- | --- | --- |
| Build observed | v174 on fresh port 8773 | v142 on GitHub Pages |
| Home/navigation | Loads, retro intro present | Loads, old preview illustration |
| News date | October 5 | October 5 |
| Practice battle | Mega Altaria vs Mega Dragonite: win, 7 turns | TR Counter Squad vs Mega Altaria: loss, 10 turns |
| Advice | Observed series wins, 1-game evidence | Avoid 0% and escaped coaching markup still visible |
| Actual download | JSON present in Downloads | Click performed; no new production file found |
| Responsive result page | Portrait 385/385 and landscape 839/839 client/scroll width | Mobile not established in this pass |
| DB | Local roster, not configured | Connected badge says 0 accepted, 36 blocked rows; not security proof |

These are different matchups, not a seeded cross-version parity comparison.
The production run remains unpaired; do not count it as export correctness.
No existing browser saves were deleted or rewritten for this check.

Port 8772 refused HTTP connections while its browser cache displayed v172 and
old news. Started a fresh loopback server on port 8773 and confirmed v174 in the
browser. An offline cached page is not proof that the local server is current.

The browser visibly rejected `SPs: -1 HP` with `Blocked until fixed` and an
explicit spread error. The retained seven-turn battle predates the final
header-case follow-up; it does not certify that later bundle byte-for-byte.

## Download Evidence

File: `champions-turn-log-1899151385,918650365,340482630,3732960270.json`

SHA-256: `da9382047695d32c0811815426975ca1b76aea22a78c2f99883687f53f93d127`

462206 bytes, one replay, seven turns, 12 damage events, seven effect events.
`audit-qa-downloads.mjs` reports `scoped_checks_pass`, no findings. Local derived
reports are under `poke-sim/artifacts/download-audits/<sha>/`.

All seven visible turn texts were compared with exported events: matching move
order, damage/remaining HP, faints, replacements, rain and Tailwind transitions.
T5/T6 collapse a repeated Protect message; this is not one-to-one event parity.
No complete snapshot/PP/item comparison or independent in-game oracle in this
pass. Planned target versus resolved target semantics also merit explicit QA;
for example T1 Hurricane retargets after Typhlosion-Hisui faints.

## Release Decision

HTTP comparison at 20:20 UTC fails: v174 versus v142; move pools, M-C reference
and both retro sprites return 404 on production. GitHub push is not deployment.

Do not merge the accumulated candidate simply to eliminate version drift.
Open gates: evidence confidentiality/trusted-writer authorization, final exact
revision browser/export checks, complete mobile edit flow, hosted checks and
release review. Login feature work is deferred; security findings are not waived.

Next: finish these gates or obtain an explicitly reviewed reduced release scope,
then deploy and rerun the same hosted hash, asset and user-flow checks. Preserve
Alfredo synchronization as the final post-production-verification step.

## Page-By-Page Follow-Up: v175 Versus Live v142

Audited all eleven navigation sections through browser clicks and DOM snapshots.
Candidate: `793473e`, v2.2.175-local-save-release on port 8773. Production still
reports v2.2.142-pp-replay-proof. This is a comparison, not deployment approval.
The old port 8772 was offline while its tab retained cached v172 content.

| Section | Observed difference | Interpretation / remaining work |
|---|---|---|
| Home | Local retro Gengar/Nidorino opening; live abstract Team Test/Benchmark preview. Local leaderboard locked; live experimental preview. | Real release drift. Verify sprites and layout after deployment. |
| News on Home | Same 11-story feed and October 5 14:34 UTC check time; different currently rotated story. | Feed contents match after line-ending normalization. Carousel position is not missing news. |
| Simulator | Local exposes M-C review option; live offers Practice/M-A/M-B. Selected opponents differ. | Real ruleset-interface drift plus origin-specific selection state. Review availability is not verified legality. |
| QA Tester | Same observed content except release/data-mode badge. | Navigation/read-only comparison only; did not rerun QA here. |
| Roadmap | Local reviewed October 5 with later audit evidence; live reviewed September 2. | Real documentation drift. Local blanket database release-gate wording also needs reconciliation with explicit local-only scope. |
| Teams | Local six preloads plus one custom card and 28 needs-review entries; live 16 preloads. Local has M-C unverified labels and Speed Stats rather than Speed Tiers. | Filtering/label changes plus local saved state; do not copy old teams into the verified pool to equalize counts. |
| Set Editor | Different selected teams and therefore different editor contents. | No controlled same-team equivalence claim from these snapshots. |
| Strategy | Local shows literal `undefined` in Eruption, Heat Wave and Focus Blast advice. Other content differs with selected team. | Confirmed visible local defect; reproduce against a fixed team/evidence fixture and repair missing attribution before treating advice as reliable. |
| Review | Local private test-team options absent on live. | Expected separate-origin storage; not evidence of lost production saves. |
| Replay Log | Live contains historical saved results absent locally. | Preserve user history. Do not erase or overwrite saves to make screens identical. |
| Sources | Local static bundle/no live rows; live approved DB rows and generation ID. | Intentional candidate local-only scope; does not prove backend security or current source accuracy. |
| Pilot Guide | Same observed content except release/data-mode badge. | Read-only content check, not full interaction proof. |

### News HTTP Evidence

Both `generated/news_feed.js` requests returned HTTP 200:

- Local: 12051 bytes, SHA-256 `2a43b963d9085addfa2ac33a0b10c968f14b63007522955c2646ca61cd2552d6`.
- Live: 12047 bytes, SHA-256 `a2a692cc73c853d635acf38532d5f9a8a47eccd3042b9b694acbcd634bea2f08`.
- Entire text is equal after CRLF-to-LF normalization. Raw byte hashes are not equal.
- This verifies served feed equivalence, not independent freshness of upstream sources.

### Documentation And Release Disposition

Compared candidate documentation with fetched `origin/main`: 37 files differ
across `docs`, `ROADMAP.md` and `STATUS.md` (3437 insertions, 17 deletions at this
audit baseline). This includes later replay, regulation, import and release
reports; branch documentation must not be represented as published main evidence.

The v175 scope decision is in `LOCAL_SAVE_RELEASE_SCOPE_2026-10-05.md`.
Database findings remain open for reconnection and existing backend exposure;
disabling this browser's connection does not fix the backend. The earlier
connected-release gate above is historical, not a claim that every database
feature must ship in the disconnected artifact.

Latest observed PR checks were pending (Supabase Preview skipped), not passed.
Remaining order: repair Strategy attribution and reconcile roadmap scope;
finish exact-revision applicable checks; review and deploy; compare served
artifact and all sections again; only then synchronize Alfredo. Retain existing
bounded simulation evidence rather than rerunning unchanged mechanics for this
documentation-only audit. No new battle, database-security test or deployment
was performed in this follow-up.
