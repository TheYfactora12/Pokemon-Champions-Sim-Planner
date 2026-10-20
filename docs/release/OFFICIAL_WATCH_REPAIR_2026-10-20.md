# Official source watcher repair candidate

This is a local repair under review, not an operational monitoring or legality approval.

The registered M-C notice and roster hosts were absent from the fetch allowlist.
The roster also stores its grid in a JSON array inside an inline script; visible
text extraction alone cannot detect additions or removals. The candidate adds
the two exact official hosts and Nintendo's exact support host, parses the
observed JSON grammar without executing scripts, and binds roster IDs, names,
flags, surrounding text and official links. Unknown layouts, duplicate IDs,
unknown flags and unapproved redirects fail closed. Parser version 2 produces
quarantined candidates and remains compatible with offline staging validation.

## Observed sources

- M-C notice: https://champions-news.pokemon-home.com/en/page/816.html
- Roster: https://web-view.app.pokemonchampions.jp/battle/pages/events/rs178713870219xeaaio/en/pokemon.html
- Nintendo updates: https://en-americas-support.nintendo.com/app/answers/detail/a_id/71525/~/how-to-update-pok%C3%A9mon-champions

Retained October 20 pages parse locally. The roster contains 262 source form IDs;
this is not the app's species/form denominator or a complete move/item eligibility
proof. Nintendo's generic fixes do not certify individual mechanics. Full page
bodies are retained outside the repository; no third-party scripts are executed.

## Operational status

Read-only GitHub inspection: workflow ID 349252390,
`.github/workflows/regulation-watch.yml`, is `disabled_manually`.
Its declared schedule is `43 12 * * *` on the default branch. Permissions are
contents: read and issues: write. It fetches sources, retains evidence, creates
review alerts and advances observation baselines; it does not approve rules.
Latest observed scheduled run 36756395700 failed on September 30, as did the
three preceding listed runs. No current healthy watch is established.

No workflow enabling, dispatch, issue creation, database write, merge or deployment
was performed. Default-branch presence of these repairs must be verified before
any separately authorized enabling decision.

## Gates still pending

Fresh one-time health report: `poke-sim/reports/official-watch-2026-10-20/source-health-seeds.json`.
Nine of 15 registered seed URLs parsed. The three required www.pokemon.com articles
returned Incapsula request-unsuccessful bodies, not article content; they remain
unavailable. Two optional support pages returned 403, and the optional championship
page lacked the expected layout. Discovered links were not traversed. No access
control was bypassed and no required source was removed to make health green.

Clean-checkout tests at `43c5e0f`: 98 Node tests, 12 release-manifest checks, 29 workflow
checks and 11 invalid migration-input controls passed. Browser evidence: 2 games,
3 pairs, 22 turns, 0 mismatches, 0 page errors. Fresh v5 independent capture: 6 agreements,
36 negative controls rejected. The failed v4 module-resolution attempt remains
blocked history; v5 used the existing local dependency path, without installation.

Local aggregate: 275 fast test files and 12 offline database test files passed,
with zero failures. Fresh reviewed receipts and generated exports restore six
bounded checks, while retaining all failed/stale history. Hosted validation of
this source candidate remains pending. Preserve the cancelled76b29f3run and its
CI-budget repair at63c1e91 separately; cancellation is not a pass.
October 20 read-only default-branch inspection confirms `main` lacks all three
new host entries and the roster parser. Enabling the workflow now would run the
unrepaired implementation.

Operational monitoring, full official eligibility reconciliation and client proof
remain separate unresolved gates.

## Independent4303684 follow-up

The independent retest found that embedded roster data bypassed common challenge/context rejection, and the aggregate lifecycle digest omitted owning tests. The follow-up applies visible challenge detection before specialized extraction, requires the recognized English roster heading, and retains the last good source baseline on rejection. It does not approve roster legality.

Lifecycle fingerprint version aggregate-inputs-v2 discovers tests (including helpers/fixtures), tools, DB inputs, generated data, root runtime/package files, source inputs and workflow definitions. Text inputs normalize LF; binary fixtures retain exact bytes. Receipt/output history remains content-addressed and separately checked, avoiding circular result/source identity. Older selected-inputs-v1 facts remain historical and cannot satisfy the new aggregate source identity. Added/removed/weakened owning tests invalidate the local aggregate stage. Documentation-only receipts preserve identity.

Both new audit controls fail against the prior checkout. Focused repair controls44/44 pass, including real Git committed-versus-working identity and binary-byte mutation. Full candidate validation and independent review remain separate gates. No engine changes, watcher enablement, live DB/settings change or deployment.
