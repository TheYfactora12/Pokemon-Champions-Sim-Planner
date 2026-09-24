-- Synthetic PostgreSQL CI only; transaction rolls back all fixtures.
\set ON_ERROR_STOP on
BEGIN;
SET LOCAL statement_timeout = '15s';
CREATE TEMP TABLE fixtures (n integer, id uuid);
INSERT INTO fixtures SELECT n, ('10000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid
FROM generate_series(1,6) n;
INSERT INTO public.team_lab_teams (id,owner_user_id,name,format,regulation_id,visibility,source_type,legality_status)
SELECT id, CASE WHEN n IN (3,5) THEN '20000000-0000-4000-8000-000000000001'::uuid
  WHEN n=4 THEN '20000000-0000-4000-8000-000000000002'::uuid END,
  'Synthetic ' || n, 'doubles','security-test',
  CASE WHEN n IN (3,4) THEN 'private' WHEN n=5 THEN 'hidden_details' ELSE 'public' END,
  'dev_seed', CASE WHEN n=6 THEN 'illegal' WHEN n=2 THEN 'needs_verification' ELSE 'verified' END
FROM fixtures;
-- All 36 ordered pairs cover side swaps and same-team matches.
INSERT INTO public.team_lab_sim_runs
 (team_a_id,team_b_id,regulation_id,format,engine_version,ruleset_version,seed,result_reason)
SELECT a.id,b.id,'security-test','doubles','test','test','test','draw' FROM fixtures a CROSS JOIN fixtures b;
INSERT INTO public.team_lab_replays
 (team_a_id,team_b_id,regulation_id,format,engine_version,ruleset_version,seed,result_reason)
SELECT a.id,b.id,'security-test','doubles','test','test','test','draw' FROM fixtures a CROSS JOIN fixtures b;
INSERT INTO public.team_lab_sim_jobs
 (owner_user_id,job_type,regulation_id,format,engine_version,ruleset_version,team_ids,opponent_team_ids,games_per_matchup)
SELECT '20000000-0000-4000-8000-000000000002','team_vs_team','security-test','doubles','test','test',ARRAY[a.id],ARRAY[b.id],1
FROM fixtures a CROSS JOIN fixtures b;
-- Empty, NULL-element and missing references must not pass, even for job owner.
INSERT INTO public.team_lab_sim_jobs
 (owner_user_id,job_type,regulation_id,format,engine_version,ruleset_version,team_ids,opponent_team_ids,games_per_matchup)
SELECT '20000000-0000-4000-8000-000000000002','team_vs_team','security-test','doubles','test','test',ids,'{}',1
FROM (VALUES ('{}'::uuid[]), (ARRAY[NULL]::uuid[]),
 (ARRAY['ffffffff-ffff-4fff-8fff-ffffffffffff'::uuid])) v(ids);
-- Duplicate references and empty opponent list are legitimate.
INSERT INTO public.team_lab_sim_jobs
 (job_type,regulation_id,format,engine_version,ruleset_version,team_ids,opponent_team_ids,games_per_matchup)
SELECT 'archetype_sweep','security-test','doubles','test','test',ARRAY[id,id],'{}',1 FROM fixtures WHERE n=1;

CREATE FUNCTION pg_temp.assert_counts(expected integer) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF (SELECT count(*) FROM public.team_lab_sim_runs) <> expected THEN RAISE EXCEPTION 'Run visibility matrix failed'; END IF;
  IF (SELECT count(*) FROM public.team_lab_replays) <> expected THEN RAISE EXCEPTION 'Replay visibility matrix failed'; END IF;
  IF (SELECT count(*) FROM public.team_lab_sim_jobs) <> expected + 1 THEN RAISE EXCEPTION 'Job visibility matrix failed'; END IF;
END $$;
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claim.sub','',true);
SELECT pg_temp.assert_counts(4);
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000001',true);
SELECT pg_temp.assert_counts(16);
SELECT set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000002',true);
SELECT pg_temp.assert_counts(9);
RESET ROLE;
ROLLBACK;
\echo 'Visibility matrix passed for anonymous and two synthetic owners; fixtures rolled back.'
