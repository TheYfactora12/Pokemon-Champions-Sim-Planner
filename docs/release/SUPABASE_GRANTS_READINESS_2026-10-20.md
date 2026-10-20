# Supabase explicit Data API grants assessment — 2026-10-20

Read-only assessment of v224 commit bcc39d75b4f363771be5e3e045c6803b23cc15b3, base ae3f52ce481924512bff523fdcef75d04935b7a3. No candidate files, migrations, grants, policies, credentials, live data or deployment were changed.

## Official behavior verified

Sources: https://github.com/orgs/supabase/discussions/45329 and https://supabase.com/docs/guides/api/securing-your-api . The changelog markdown fetch failed due unsupported content type; the HTML changelog and linked official notice were read instead.

The October 30 rollout removes automatic public-schema access for future tables; existing object grants remain. A newly provisioned database or dropped/recreated table needs explicit role privileges. ALTER-only migrations and existing tables are not automatically revoked. Direct Postgres connections are unaffected by this platform-default change, but Data API verification after a direct migration can fail. RLS does not replace GRANT; missing table privilege fails before row policy evaluation. The notice also removes future sequence default privileges. Do not use discussion replies' broad grants or temporary CLI switches as the repository remedy.

## Source findings

1. Fresh bootstrap is incomplete under explicit-only defaults. poke-sim/db/README_DB.md steps run schema_v1.sql, seed, rls_policies_v1.sql and two Showdown migrations. The schema and RLS files contain no positive table GRANT. Therefore anon reads of teams, team_members, rulesets, prior_snapshots, analyses, analysis_logs, analysis_win_conditions and branch_coverage_runs lack declared access in that route. Team loading falls back locally; ruleset/prior/history and coverage reads fail or degrade. golden_battles is also ungranted but is a QA/reference table, not a demonstrated browser runtime requirement. Do not expose it just because it exists.
2. The later 2026_08_29_public_data_integrity_hardening.sql restores explicit SELECT on six shared tables (teams, team_members, analyses, analysis_win_conditions, analysis_logs, branch_coverage_runs) for anon/authenticated. If applied, this closes those ACL gaps, not rulesets/prior_snapshots/golden_battles. That migration is absent from the documented fresh bootstrap; historical live status is not proof it ran. The baseline migration does not install the separate baseline RLS file. No tracked supabase/config.toml or reset/preview database provisioner exists. Filename formats are mixed; do not assume sorting all migrations reproduces a valid schema (timestamp files and legacy underscore files have dependencies).
3. Actual runtime anon SELECT consumers: supabase_adapter.js lines 534/539 teams/members, 602 rulesets, 727/802 analyses, 821 analysis_logs, 841 prior_snapshots, 887/931/940/1003 approved_showdown_entities, 895 showdown_sync_runs, 955 showdown_source_files, 1033 branch_coverage_runs. RLS/view dependencies count as access requirements too. Approved Showdown/Champions/species-move views are security_invoker, and their underlying tables have explicit anon/authenticated SELECT plus filtered policies. Keep those existing boundaries; do not bypass them with definer views.
4. Showdown ingestion is affected even though it uses a privileged key. tools/write_showdown_data_to_db.mjs lines 214–250 POSTs merge-duplicate upserts to showdown_sync_runs, showdown_source_files, showdown_entities, showdown_entity_diffs with service_role credentials. No explicit service_role table grants exist for these four tables in the reviewed migrations. BYPASSRLS is not a table ACL grant. A fresh explicit-only database therefore cannot run that writer as declared. Existing grants may mask this. The direct psql db-migrate workflow remains able to run DDL, while its REST prior_snapshots verification can fail.
5. regulation_review_candidates is already explicit: service_role SELECT plus column-limited INSERT, no browser privileges; immutable triggers remain. No compatibility broadening is needed there.
6. Team Lab/Trainer Room are NOT automatic grant candidates. Five Team Lab foundation tables, admin/mapping/promotion tables, Trainer Room and replay import foundations rely on policies without positive grants. sim_jobs/replays have SELECT grants, but their RLS references ungranted team_lab_teams (and other visible-reference dependencies), so selected queries can still fail. Trainer ownership policies alone do not make authenticated CRUD usable. These are deferred/private/trusted surfaces with unresolved visibility gates; adding grants would activate behavior requiring separate privacy/product approval. Keep them outside the compatibility patch.
7. Legacy browser insert/upsert functions are not justification to restore public writes. Current hardening and write-containment migrations intentionally prohibit shared writes. Do not grant INSERT/UPDATE/DELETE to anon/authenticated to make old save functions succeed.
8. schema_v1 has BIGSERIAL team_members_team_member_id_seq; baseline uses different identity details. Read-only browser access needs no sequence privilege. The four scoped Showdown tables use explicit text/UUID identities, not an auto-increment sequence requirement. No blanket sequence or function grants are justified. Trigger helpers are not browser RPCs; no actual .rpc consumer was found.

## Exact proposed changes for later review (NOT applied)

Generate a properly named additive migration with the installed CLI only when an isolated implementation is authorized. Do not rewrite historical applied migrations. For the existing anonymous read-only runtime, the minimal missing grants after the existing reviewed hardening prerequisites are:

```sql
BEGIN;
GRANT SELECT ON TABLE public.rulesets, public.prior_snapshots TO anon;
COMMIT;
```

No authenticated grant is proposed for these two: current baseline policies target anon and the shipped free browser uses the anonymous client. Signed-in access would require a separately reviewed role/row contract. Prerequisite checks must assert RLS enabled and expected read policies before approval. For fresh bootstrap, apply the already-reviewed shared-table hardening/containment migrations in an explicit dependency order after creating their referenced objects; do not silently grant around missing migrations. Alternatively include exact anon SELECT for the six already-approved shared tables in a new bootstrap-specific access manifest only after its policy assertions pass.

Separate server-writer compatibility proposal, if Showdown ingestion is selected for deployment:

```sql
BEGIN;
GRANT SELECT, INSERT, UPDATE ON TABLE
  public.showdown_sync_runs,
  public.showdown_source_files,
  public.showdown_entities,
  public.showdown_entity_diffs
TO service_role;
COMMIT;
```

SELECT supports conflict/update expressions; INSERT/UPDATE support current upserts. No DELETE/TRUNCATE or browser writes. These statements add only the specified privileges; they do not remove pre-existing broader privileges, isolate service credentials globally or constitute the pending hardening migration. Existing broad ACL remediation remains a separate approval. No golden_battles, Team Lab, Trainer Room, admin tables, blanket schema/default privileges, sequences or function EXECUTE grants in this proposal.

Update README_DB.md to describe a dependency-ordered disposable bootstrap, separate schema/RLS/grant/seed steps, explicit-only defaults, and no production reset. Document that DB-migrate is a single selected-file production workflow, not preview provisioning. Keep local fallback status truthful on 42501; never auto-apply error-message SQL.

## Exact proposed tests

Add a source access contract test under poke-sim/tests/data_api_grants_contract_tests.mjs and an explicit object/role/operation manifest. Assert the named two anon reads and four server upserts have grants; assert no new anon/authenticated writes, no blanket/default grants and no deferred-table additions. Include invoker-view and RLS relation dependencies. A text parser is only a drift guard, not authorization proof.

Add isolated integration test tools/test-data-api-grants.mjs, using a newly disposable Postgres/PostgREST fixture and fixed dependency-ordered bootstrap. Never accept production credentials or an arbitrary shared URL. Test explicit-only defaults from database creation; do not run default-privilege changes on existing environments. Proposed cases:
- Before proposed migration: rulesets/prior_snapshots reads fail 42501; service writer upserts fail. Separate table-ACL errors from RLS empty results.
- After migration: exact anon reads and service-role insert/conflict-update succeed; browser shared POST/PATCH/DELETE remain denied.
- Approved view returns approved/active rows only; unapproved source rows remain hidden. Exercise all underlying invoker-view privileges.
- Deferred Trainer/Team Lab/private/admin tables remain inaccessible; regulation candidate append-only behavior remains unchanged.
- Table recreate/reset loses implicit access, then replay of explicit grants restores only declared privileges; ordinary ALTER preserves grants.
- Verify has_table_privilege and column ACLs for each role, effective inherited PUBLIC access, RLS state and policy predicates. Verify no unwanted sequence/function exposure.
- Fresh DB seed/migration path and REST readback succeed without automatic exposure. Test real PostgREST error shape as well as SQL permissions.
- UI 42501 catalog/history paths show unavailable/retry or bundled fallback without reporting accepted live data. No browser attempt to repair grants.

## Tests actually run and limits

Offline supabase_governance_tests.js: 5/5. showdown_db_writer_tests.js: 6/6 (intercepted HTTP/dry-run). db_status_retry_tests.js: 4/4. All pass, but NONE execute PostgreSQL ACL/RLS or prove reset compatibility. Existing DB mocks accept tables without modeling grants.
Docker CLI exists; `docker version --format '{{.Server.Version}}'` failed because dockerDesktopLinuxEngine pipe is absent. psql and Supabase CLI were not found on PATH. No disposable SQL/PostgREST execution environment was available, none was started or installed, no credentials were created, and no live/shared database was queried or changed. Thus breakage is a source/official-semantics assessment, not a freshly reproduced DB failure. No application suite rerun is needed for this report-only task.

## Decision

Fresh schemas using documented bootstrap WILL lack required Data API grants under the new defaults; a more complete migration route still lacks the two runtime reads and four server-writer grants described above. Existing production tables are not predicted to break solely on October 30; their actual ACLs/defaults were not read back. Offline/bundled simulations remain independent of Data API availability.

Smallest next decision: approve an isolated compatibility patch for the two anon reads, and separately confirm whether the existing Showdown server writer belongs in that patch. Provide/authorize a disposable local database test runtime before claiming the migration validated. Live application remains a later, separate exact-migration approval. Preserve v224 as reviewed throughout.
