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
