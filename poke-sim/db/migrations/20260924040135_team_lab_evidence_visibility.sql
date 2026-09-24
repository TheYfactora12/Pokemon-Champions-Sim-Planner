-- Additive correction: raw evidence requires access to every participant's details.
-- No security-definer bypass, new grants, or production execution implied.
BEGIN;

DROP POLICY team_lab_read_sim_runs_visible_teams ON public.team_lab_sim_runs;
CREATE POLICY team_lab_read_sim_runs_visible_teams ON public.team_lab_sim_runs
FOR SELECT TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.team_lab_teams t
    WHERE t.id = team_lab_sim_runs.team_a_id AND
      ((t.visibility = 'public' AND t.legality_status <> 'illegal') OR t.owner_user_id = (SELECT auth.uid())))
  AND EXISTS (SELECT 1 FROM public.team_lab_teams t
    WHERE t.id = team_lab_sim_runs.team_b_id AND
      ((t.visibility = 'public' AND t.legality_status <> 'illegal') OR t.owner_user_id = (SELECT auth.uid())))
);

DROP POLICY team_lab_read_public_or_owner_sim_jobs ON public.team_lab_sim_jobs;
CREATE POLICY team_lab_read_public_or_owner_sim_jobs ON public.team_lab_sim_jobs
FOR SELECT TO anon, authenticated USING (
  cardinality(team_ids || opponent_team_ids) > 0
  AND NOT EXISTS (
    SELECT 1 FROM unnest(team_ids || opponent_team_ids) AS participant(id)
    WHERE NOT EXISTS (SELECT 1 FROM public.team_lab_teams t
      WHERE t.id = participant.id AND
        ((t.visibility = 'public' AND t.legality_status <> 'illegal') OR t.owner_user_id = (SELECT auth.uid())))
  )
);

DROP POLICY team_lab_read_visible_replays ON public.team_lab_replays;
CREATE POLICY team_lab_read_visible_replays ON public.team_lab_replays
FOR SELECT TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.team_lab_teams t
    WHERE t.id = team_lab_replays.team_a_id AND
      ((t.visibility = 'public' AND t.legality_status <> 'illegal') OR t.owner_user_id = (SELECT auth.uid())))
  AND EXISTS (SELECT 1 FROM public.team_lab_teams t
    WHERE t.id = team_lab_replays.team_b_id AND
      ((t.visibility = 'public' AND t.legality_status <> 'illegal') OR t.owner_user_id = (SELECT auth.uid())))
);
COMMIT;
