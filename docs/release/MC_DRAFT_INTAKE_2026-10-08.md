# M-C Draft Intake

## Scope

Correct a historical-context rejection at new paste intake, not certify official
legality or enable simulation. Selected M-C uses the pinned reference for local
draft saving. Existing registrations, JSON/bulk intake and battle approval remain
unchanged. No private team or replay is published in this record.

Reference: `efe4948570d5e8189751792136d26e71710c6c66`.
Reference artifact SHA256:
`fba0dbf7a01f95a57727923a948afb575b36ef7bb2a883600d2702596dad2905`.

## Contract

```text
Selected M-C + new paste
  -> structural and exact-species reference checks
  -> canSave (local draft only)
  -> preserve sets + pin + artifact digest
  -> visible, official status unverified
  -> every execution gate remains blocked
```

Unknown identities, missing sources, invalid spreads, wrong abilities/stones,
duplicate moves/items/species and banned mechanics remain rejected. Saving
never sets competitive flags. Direct engine validation and selected-regulation
checks enforce draft status; central DB persistence excludes these records even
after editing. No live DB test or write was performed.

## Evidence

- `tests/mc_draft_import_tests.js`: five passing focused tests, including actual
  preview/save handling, unchanged sets, reload, visibility, Practice switching,
  forged metadata and a positive mocked DB control.
- Independent reviewer reproduced and cleared two initial lifecycle blockers and
  a conflicting identity bug; five focused tests rerun independently.
- Local browser v193: unchanged private six-member paste, zero errors, local save,
  reload and selector/roster readback. The team is explicitly not executable.
- Two early full-gate failures were stale v192 build expectations/fallbacks;
  corrected release markers and regenerated the bundle before final testing.
- Final gate, hosted CI and deployment evidence belong in the PR/check run.

## Remaining

This does not satisfy the request to run the team against every opponent. That
requires M-C execution approval (#232) or a separately agreed reference-testing
scope. Existing edit/replacement and JSON/bulk import checks remain restrictive.
Neither owner feedback nor reference membership is labeled official certification.

Rollback: restore reviewed v192 merge `03701c6247b928ce52d11a8cdd44da42a6c237f0`
through the release process; preserve all saved user teams.
