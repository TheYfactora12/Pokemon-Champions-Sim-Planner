-- STAGING / DISPOSABLE DATABASE ONLY. Synthetic identities, not real Auth sessions.
-- Requires psql, an authorized SET ROLE operator and the Team Lab migrations.
-- No grants or policies are changed; all fixture writes are rolled back.
-- Invoke with: psql "$STAGING_DB_URL" -X -v security_disposable=true -f <this-file>
\set ON_ERROR_STOP on
\if :{?security_disposable}
\else
  \set security_disposable false
\endif
\if :security_disposable
\else
  \echo 'Refusing fixture writes without explicit disposable-environment confirmation.'
  SELECT 1 / 0;
\endif

BEGIN;
SET LOCAL statement_timeout = '15s';
SET LOCAL lock_timeout = '2s';

-- Ensure missing roles/tables never masquerade as a successful access denial.
SELECT 'anon'::regrole, 'authenticated'::regrole,
       'public.team_lab_teams'::regclass,
       'public.team_lab_team_members'::regclass,
       'public.team_lab_sim_runs'::regclass,
       'public.team_lab_sim_jobs'::regclass;

-- Privileged setup of public/private mixed evidence; no real user data is used.
INSERT INTO public.team_lab_teams
  (id, owner_user_id, name, format, regulation_id, visibility, source_type, legality_status)
VALUES
  ('10000000-0000-4000-8000-000000000003', NULL, 'Security public fixture', 'doubles', 'security-test', 'public', 'dev_seed', 'verified');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', true),
       set_config('request.jwt.claims', '{"sub":"20000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
INSERT INTO public.team_lab_teams
  (id, owner_user_id, name, format, regulation_id, visibility, source_type, legality_status)
VALUES
  ('10000000-0000-4000-8000-000000000001', auth.uid(), 'Security A private', 'doubles', 'security-test', 'private', 'user_custom', 'needs_verification');
INSERT INTO public.team_lab_team_members (team_id, slot, pokemon_id, moves)
VALUES ('10000000-0000-4000-8000-000000000001', 1, 'pikachu', ARRAY['protect']);
DO $$
BEGIN
  IF (SELECT count(*) FROM public.team_lab_teams WHERE id = '10000000-0000-4000-8000-000000000001') <> 1
    THEN RAISE EXCEPTION 'Owner A cannot read its saved team'; END IF;
  IF (SELECT count(*) FROM public.team_lab_team_members WHERE team_id = '10000000-0000-4000-8000-000000000001') <> 1
    THEN RAISE EXCEPTION 'Owner A cannot read its saved member'; END IF;
END $$;

SELECT set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000002', true),
       set_config('request.jwt.claims', '{"sub":"20000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
INSERT INTO public.team_lab_teams
  (id, owner_user_id, name, format, regulation_id, visibility, source_type, legality_status)
VALUES
  ('10000000-0000-4000-8000-000000000002', auth.uid(), 'Security B private', 'doubles', 'security-test', 'private', 'user_custom', 'needs_verification');
DO $$
DECLARE affected integer;
BEGIN
  IF (SELECT count(*) FROM public.team_lab_teams WHERE id = '10000000-0000-4000-8000-000000000002') <> 1
    THEN RAISE EXCEPTION 'Owner B cannot read its saved team'; END IF;
  IF EXISTS (SELECT 1 FROM public.team_lab_teams WHERE id = '10000000-0000-4000-8000-000000000001')
    THEN RAISE EXCEPTION 'User B can read user A private team'; END IF;
  IF EXISTS (SELECT 1 FROM public.team_lab_team_members WHERE team_id = '10000000-0000-4000-8000-000000000001')
    THEN RAISE EXCEPTION 'User B can read user A private member'; END IF;
  UPDATE public.team_lab_teams SET name = 'forbidden' WHERE id = '10000000-0000-4000-8000-000000000001';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'User B can edit user A team'; END IF;
  BEGIN
    INSERT INTO public.team_lab_team_members (team_id, slot, pokemon_id, moves)
    VALUES ('10000000-0000-4000-8000-000000000001', 2, 'pikachu', ARRAY['protect']);
    RAISE EXCEPTION 'User B can attach members to user A team';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    UPDATE public.team_lab_teams SET owner_user_id = '20000000-0000-4000-8000-000000000001'
    WHERE id = '10000000-0000-4000-8000-000000000002';
    RAISE EXCEPTION 'User B can reassign team ownership';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;

RESET ROLE;
INSERT INTO public.team_lab_sim_runs
  (id, team_a_id, team_b_id, regulation_id, format, engine_version, ruleset_version, seed, result_reason, replay_log)
VALUES
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001',
   'security-test', 'doubles', 'test', 'test', 'test', 'draw', '{"private_fixture":true}');
INSERT INTO public.team_lab_sim_jobs
  (id, owner_user_id, job_type, regulation_id, format, engine_version, ruleset_version, team_ids, opponent_team_ids, games_per_matchup)
VALUES
  ('30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'team_vs_team',
   'security-test', 'doubles', 'test', 'test', ARRAY['10000000-0000-4000-8000-000000000003'::uuid],
   ARRAY['10000000-0000-4000-8000-000000000001'::uuid], 1);

-- Positive public control and reversed private-participant regression.
INSERT INTO public.team_lab_sim_runs
  (id, team_a_id, team_b_id, regulation_id, format, engine_version, ruleset_version, seed, result_reason)
VALUES
  ('30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', 'security-test', 'doubles', 'test', 'test', 'test', 'draw'),
  ('30000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003', 'security-test', 'doubles', 'test', 'test', 'test', 'draw');
INSERT INTO public.team_lab_sim_jobs
  (id, job_type, regulation_id, format, engine_version, ruleset_version, team_ids, opponent_team_ids, games_per_matchup)
VALUES
  ('30000000-0000-4000-8000-000000000005', 'team_vs_team', 'security-test', 'doubles', 'test', 'test', '{}', '{}', 1),
  ('30000000-0000-4000-8000-000000000006', 'team_vs_team', 'security-test', 'doubles', 'test', 'test', ARRAY[NULL::uuid], '{}', 1),
  ('30000000-0000-4000-8000-000000000007', 'team_vs_team', 'security-test', 'doubles', 'test', 'test', ARRAY['99999999-0000-4000-8000-000000000001'::uuid], '{}', 1),
  ('30000000-0000-4000-8000-000000000008', 'team_vs_team', 'security-test', 'doubles', 'test', 'test', ARRAY['10000000-0000-4000-8000-000000000003'::uuid], '{}', 1);

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claim.sub', '', true), set_config('request.jwt.claims', '{"role":"anon"}', true);
DO $$
BEGIN
  IF (SELECT count(*) FROM public.team_lab_teams WHERE id = '10000000-0000-4000-8000-000000000003') <> 1
    THEN RAISE EXCEPTION 'Public positive control failed'; END IF;
  IF EXISTS (SELECT 1 FROM public.team_lab_teams WHERE id IN ('10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002'))
    THEN RAISE EXCEPTION 'Anonymous private team disclosure'; END IF;
  IF EXISTS (SELECT 1 FROM public.team_lab_sim_runs WHERE id = '30000000-0000-4000-8000-000000000001')
    THEN RAISE EXCEPTION 'Anonymous mixed public/private replay disclosure'; END IF;
  IF EXISTS (SELECT 1 FROM public.team_lab_sim_jobs WHERE id = '30000000-0000-4000-8000-000000000002')
    THEN RAISE EXCEPTION 'Anonymous mixed public/private job disclosure'; END IF;
  IF EXISTS (SELECT 1 FROM public.team_lab_sim_runs WHERE id = '30000000-0000-4000-8000-000000000004')
    THEN RAISE EXCEPTION 'Reversed private run disclosure'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.team_lab_sim_runs WHERE id = '30000000-0000-4000-8000-000000000003')
    THEN RAISE EXCEPTION 'Public run positive control failed'; END IF;
  IF EXISTS (SELECT 1 FROM public.team_lab_sim_jobs WHERE id IN (
    '30000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000006', '30000000-0000-4000-8000-000000000007'))
    THEN RAISE EXCEPTION 'Empty, null or dangling job disclosed'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.team_lab_sim_jobs WHERE id = '30000000-0000-4000-8000-000000000008')
    THEN RAISE EXCEPTION 'Public job positive control failed'; END IF;
END $$;

RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', true),
       set_config('request.jwt.claims', '{"sub":"20000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.team_lab_sim_runs WHERE id = '30000000-0000-4000-8000-000000000001')
    THEN RAISE EXCEPTION 'Private participant owner lost run access'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.team_lab_sim_jobs WHERE id = '30000000-0000-4000-8000-000000000002')
    THEN RAISE EXCEPTION 'Job owner lost access'; END IF;
END $$;
SELECT set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000002', true),
       set_config('request.jwt.claims', '{"sub":"20000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.team_lab_sim_runs WHERE id = '30000000-0000-4000-8000-000000000001')
    THEN RAISE EXCEPTION 'Other authenticated user sees private run'; END IF;
  IF EXISTS (SELECT 1 FROM public.team_lab_sim_jobs WHERE id = '30000000-0000-4000-8000-000000000002')
    THEN RAISE EXCEPTION 'Other authenticated user sees private job'; END IF;
END $$;
RESET ROLE;
ROLLBACK;
\echo 'SQL isolation subset passed and fixture writes rolled back. Real Auth/HTTP, delete, hidden-details and additional surfaces still require testing.'
