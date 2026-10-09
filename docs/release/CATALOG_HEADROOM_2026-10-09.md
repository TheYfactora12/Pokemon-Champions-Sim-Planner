# Catalog Serialization Headroom

## Scope

Issue #255: v202 had only 145 bytes remaining under the unchanged 11 MiB
bundle cap. v203 removes JSON formatting whitespace from the generated
tournament catalog, preserving every field, wrapper, inline loading order,
HTML escaping and service-worker caching. Human-readable source JSON remains.
No mechanics, team promotion, legality, database or source approvals change.

## Local Evidence

- Catalog: 44,806 -> 28,375 bytes (16,431 saved).
- Versioned bundle: 11,517,795 bytes; 16,541 bytes remaining under the cap.
- Tournament tests compare evaluated generated data to the complete source,
  prove deterministic serialization and escaped-script round trips, retain
  all 13 teams / 78 members and reject promotion into runtime teams.
- Eleven release-manifest tests pass, including exact build reproduction,
  asset fingerprints and deployment mismatch rejection.
- Full local project gate passed. Independent read-only review found no blocker
  and independently compared the previous/current evaluated catalog values.

## Production Receipt

PR257 merged as `07e36dc1d084235f353763ea1306e67c9cb3e748`. Hosted CI
`37935730695` (including battle audit), bundle/cache checks passed. Pages
`37936291758` succeeded. HTTP artifact checks at 2026-10-09T13:24:15.049Z
matched v203 and external assets. Bundle SHA-256:
`1889ba9309156fb6b3bd81adf0b8b60216d0c0a8dcf55b9f06e15d13f95112e4`.

Production browser displayed v203. Roadmap catalog text exactly matched local:
all 13 names, review-only status and Navjit Joshi's expanded six-member sheet.
No new simulation was needed for the whitespace-only data change; v202's paired
live battle/download receipt remains the scoped mechanics smoke evidence.
Offline inclusion is covered by contract tests; a disconnected browser journey
was not performed and is not claimed. No DB or official regulation certification.

## Follow-up

This is limited headroom, not a long-term size solution. The legal mirror has
3,554,410 bytes of species move payloads, with 615,045 duplicate payload bytes
across equal entries. Any deduplication requires separate mutation/identity,
reconstruction, legality and offline tests. Do not remove fields or increase
the cap to conceal growth. Lum lifecycle work remains tracked in #235.
