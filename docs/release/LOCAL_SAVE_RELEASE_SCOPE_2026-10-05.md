# Local-Save Alignment Release

User direction: align local, GitHub and production before resuming database
work. The interim scope is bundled data and local browser saves, not a connected
database release. Preserve database code, migrations and stored data.

## Containment

- Manifest `data_mode: local-only` disables the adapter even if stale runtime
  credentials are supplied. This release cannot enable it through credentials.
- Pages consumes no database secrets and performs no runtime credential
  injection. The reviewed repository HTML is staged byte-for-byte unchanged.
- Existing local team storage and offline roster remain available.
- Reconnection requires a separately reviewed manifest/deployment change and
  completed database security gates. No production SQL or permission changes.

This isolates the new browser release; it does NOT repair existing database
permissions, revoke credentials from older clients or remove direct API exposure.
Those findings remain open and are the next phase, not marked resolved.

Independent review concurs that live seed parity, cloud-save ownership and DB
migration approval do not apply to this disconnected artifact. Browser/cache
journeys, hosted checks, mechanics/input evidence and post-deploy parity still
apply. This is scope concurrence, not deployment approval.

Local v175 browser evidence: imported one test member, refreshed, located it in
Teams, edited SPs from 32/32/2 to 30/32/4, refreshed and reopened its edit paste
with the edited values intact. The import destination dropdown did not show the
saved team until opened through Edit; this is a separate UI limitation, not data
loss. No existing saves were removed. This one-member fixture is not a legal
competitive team. Full cache transition and actual export remain unproved.

Local suite ran 192 fast files and 12 offline DB files: three failures were old
connected-workflow expectations. All three updated contracts pass focused
reruns; unchanged passing results are retained, not relabeled as a fresh full
rerun. Hosted CI must validate the exact committed revision.

## Evidence Reuse

Battle engine unchanged from 1.1.15; reuse IMP-0061 paired-battle proof and v174
download/manual evidence with their original limits. Do not claim new oracle
coverage. Run focused no-client tests, workflow tests, one final project gate,
exact-SHA hosted checks and post-deployment artifact/browser smoke checks.

## Acceptance

1. Independent review of runtime isolation and deployment policy.
2. Passing final local and hosted checks; preserve main's current news changes.
3. Same reviewed build and asset hashes on local/main/Pages.
4. Live loading, local-roster status, navigation and practice workflow smoke.
5. Record Pages run and commit. No 99% accuracy, verified M-C legality or
   database-security claim. Existing simulation gaps stay explicitly open.

Earlier connected-release gates are not declared passed by this scope change.
This is an experimental practice release, not an invitation to store sensitive
information. Full replay event parity and mobile edit journeys remain bounded
by the existing evidence reports.
