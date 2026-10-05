# Recurring jobs and database check

Checked September 30 Eastern / October 1 UTC. Read-only production database
inspection; no migrations, permissions, team rows or source approvals changed.

## Database

- Project ymlahqnshgiarpbgxehp reports ACTIVE_HEALTHY; SQL reads succeeded.
- 36 teams, 204 members, 25,957 Showdown entity rows.
- All 17 public tables have RLS enabled. This is not a complete grants/policy or
  two-user isolation test.
- All 36 teams lack metadata.ruleset_version (and metadata.engine_version).
  Current app rejection is consistent with missing version provenance; do not
  invent version metadata to admit these rows.
- Security advisor reports one informational RLS-without-policy finding for
  showdown_entity_diffs. This may intentionally deny public access; no policy
  was added. No other security advisor findings returned.
- cron.job is absent; no pg_cron schedule inventory exists in this database.
- Private saves, applied migration parity and end-to-end user writes remain
  unverified by this read-only check.

## Recurring jobs

Reviewed the latest 60 scheduled GitHub runs in TheYfactora12 repository.

- News Feed Sync: latest successful run 36784367562; recent runs recovered from
  September 23 failures. Kept enabled.
- Showdown Sync: latest successful run 36759066009. Kept enabled; job success
  alone does not establish approved DB/runtime parity.
- Daily Sim Heartbeat: latest successful run 36757684496. Kept enabled.
- Champion Source Inventory: successful September 28 run 36477107072. Kept enabled.
- Battle Audit: successful September 28 run 36460118547. Kept enabled.
- Regulation Watch: repeated daily failures including 36756395700, with 28
  unavailable sources and explicit incomplete-check failure. Disabled under
  user's request; readback state disabled_manually. History retained. Restore
  only after source/parser repair and complete checks; regulation monitoring is
  unavailable meanwhile. Rules and approval gates remain unchanged.
- Friday Champions news review: local automation remains ACTIVE, weekly Friday
  09:00. September 25 review completed in this thread. Future runs not guaranteed.
- Deploy GitHub Pages is event-driven, not a recurring timer; latest three runs
  succeeded. Kept enabled. Unrelated CI/review/migration workflows untouched.

This inventory does not cover Alfredo's schedules or external schedulers outside
this project. No paid service or new automation was created.
