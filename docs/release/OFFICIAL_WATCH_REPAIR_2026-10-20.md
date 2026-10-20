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

Local targeted tests and independent review must precede the source checkpoint.
Refresh source-dependent tracker exports: changed dependencies must invalidate
current checkmarks until fresh execution and review. Then run clean-checkout and
applicable aggregate checks, publish only the draft candidate and observe its
exact hosted result. Preserve the prior tracker checkpoint at 76b29f3 separately.
October 20 read-only default-branch inspection confirms `main` lacks all three
new host entries and the roster parser. Enabling the workflow now would run the
unrepaired implementation.

Operational monitoring, full official eligibility reconciliation and client proof
remain separate unresolved gates.
