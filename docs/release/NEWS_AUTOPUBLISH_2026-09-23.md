# News Automation Repair

## Cause And Authorized Change

News Feed Sync run 35922695037 failed before fetching sources: GitHub CLI
rejects combining `--slurp` with `--jq`. The earlier candidate fix never reached
main. This patch is isolated from the unmerged simulator candidate.

The owner explicitly approved **Automatically publish tested news only** on
September 23. This supersedes the news-only human-PR publication policy, not
competitive rules, source approvals, simulator mechanics or database controls.

## Delivery Contract

- Existing six-hour schedule retained; no second scheduler or autonomous model.
- Trusted main checkout only. No pending PR code, persistent credential checkout,
  production secrets, force pushes or branch-protection bypass.
- Fetch only approved hosts/channels; dated relevant items only. Removed `2027`
  as a standalone relevance match. Do not invent fresh stories to fill space.
- Regenerate feed and bundle, run the full offline fast gate, and verify every
  tracked mutation is one of news_feed.js, the bundled HTML or release_artifact.json.
- Upload the current health receipt before restoring its tracked historical copy.
  Failed early runs must not upload a stale receipt as if it were new.
- Push generated artifacts non-forcibly to main. A concurrent main change causes
  safe rejection. Explicitly dispatch the existing Pages workflow because a
  GITHUB_TOKEN push does not trigger another push workflow.
- Pages retains its own validation, seed-parity and deployment checks. Sync
  success means a deployment was requested, not that deployment succeeded.

## Tests And Current Source Limits

Focused news suites pass: relevance, provenance, escaping, unsafe redirects,
malformed dates, stale fallback, cache refresh and three-file publishing guards.
The fresh local feed contains 11 dated items. All 11 remote thumbnail checks pass.
Official Champions source is available. Victory Road is reachable but its current
entries fail the stricter Champions relevance filter. Three YouTube Atom feeds
return HTTP 404; retained videos remain marked stale, not freshly retrieved.

Browser automation could not attach to the existing page or local preview during
this run. Do not count asset fetches or parser tests as visual browser proof.
Hosted sync, deployment and live readback receipts will be recorded on the PR.
No battle simulation or DB changes belong to this repair.
