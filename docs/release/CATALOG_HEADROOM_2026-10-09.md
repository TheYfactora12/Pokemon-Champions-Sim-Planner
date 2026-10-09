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
- Hosted deployment and browser checks must be recorded before calling v203 live.

## Follow-up

This is limited headroom, not a long-term size solution. The legal mirror has
3,554,410 bytes of species move payloads, with 615,045 duplicate payload bytes
across equal entries. Any deduplication requires separate mutation/identity,
reconstruction, legality and offline tests. Do not remove fields or increase
the cap to conceal growth. Lum lifecycle work remains tracked in #235.
