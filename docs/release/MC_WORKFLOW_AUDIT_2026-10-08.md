# M-C Workflow Audit

## Sources And Scope

The official [M-C notice](https://champions-news.pokemon-home.com/en/page/816.html)
was read again October 8. It states September 9 02:00 UTC through December 2
01:59 UTC, one Mega Evolution per battle, no duplicate held items, and named
timers. It does not enumerate every permitted item or species-specific move.
The other inventoried pokemon.com M-C article returned only an iframe to the
web reader; do not count that response as fresh structured evidence.

The pinned reference and official roster captures in the repository remain
separate evidence types. No item or move has been promoted solely on user feedback.
The current question to the owner is whether to allow explicitly unverified
reference simulations while formal review remains unfinished. Until answered,
the existing execution policy is preserved.

## Findings And Repairs

| Path | v193 finding | v194 candidate |
| --- | --- | --- |
| New paste | M-C draft saving worked | Retained |
| Existing draft paste | Older item/learnset checks rejected sets | Stored context retained |
| Set Editor save | Older checks rejected unchanged valid draft | Same intake policy; invalid edit is atomic |
| Bulk and JSON | Older checks rejected M-C-only sets | Explicit selected M-C uses reference intake |
| JSON round-trip | Restrictive metadata discarded | Restrictions preserved and revalidated, never approval |
| Item/move suggestions | M-C default choices empty | Pinned M-C choices, labeled reference only |
| Direct engine | Invalid draft logged but executed unless strict | Drafts return error/zero turns in all strict modes |
| DB persistence | Guard worked only if context survived | Round-trips keep restriction; central guard retained |
| Unknown stored context | Could fall back to historical checks | Explicit rejection without mutation |

```text
New import selection OR saved restrictive context
  -> shared intake options
  -> structural and pinned-reference checks
  -> canonical restrictive provenance
  -> local save / edit / JSON export / re-import
  -> same execution and trusted-evidence policy
```

## Proof

`tests/mc_draft_import_tests.js` has twelve focused tests, independently rerun
and cleared. Existing source-gap,
JSON context, identity and execution checks provide historical regression coverage.
Independent audit found the JSON and non-strict engine failures; the earlier v193
claim that validator rejection established unconditional engine blocking was too
broad. This report preserves that correction rather than rewriting history.

A pre-final full gate found stale generated page bytes after the last source
patch. Rebuilding and rerunning against frozen runtime files is required; that
earlier gate is not counted as a pass.

Final frozen local gate passed 202 fast and 12 offline/mock DB test files, with
four manual/helper skips. These are not live database security tests. Local
browser saves of unchanged reference item/move sets succeeded, and saved move
data survived a reload. Private sets remain private. No battle was run.

Final bundle SHA256:
`70c5a299476399161f467d1eba4bc97cd716133c8d23bbc1c8a5d441bce80a4c`
(11,525,726 bytes; v2.2.194-mc-intake-parity).

Final full-gate results, reviewed commit, CI, deployment hashes and browser proof
are recorded in the release PR. Private team contents remain outside public logs.

## Remaining Work

- Resolve official M-C package approval (#232), or separately authorize the
  reference-simulation lane. Do not equate simulator uncertainty with illegality.
- Centralize source-specific rules behind a versioned regulation adapter before
  another season, with contract tests spanning all import/edit/run paths.
- Add actual approved/rejected complete-team evidence, not just individual pools.
- Keep unknown identities separate from proven illegal choices; report the exact
  missing source or implementation rather than a generic blocked message.
- Re-run this workflow matrix for each season and source-pin change. Historical
  registrations must retain their original context and result provenance.

No claim of zero remaining defects, official approval or 99% game accuracy.
