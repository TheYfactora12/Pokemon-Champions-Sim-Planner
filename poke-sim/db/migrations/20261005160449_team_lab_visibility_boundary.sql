-- Positive reference checks: RLS-hidden teams must not disappear from validation.
-- Staging first. Raw hidden-details publication requires separate review.
BEGIN;
ALTER POLICY team_lab_read_sim_runs_visible_teams
ON public.team_lab_sim_runs USING (
  NOT EXISTS (
    SELECT 1 FROM unnest(ARRAY[team_lab_sim_runs.team_a_id,
                              team_lab_sim_runs.team_b_id]) AS ref(id)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.team_lab_teams t
      WHERE t.id = ref.id AND (
        (t.visibility IN ('public', 'hidden_details') AND t.legality_status <> 'illegal')
        OR t.owner_user_id = (SELECT auth.uid())
      )
    )
  )
);
ALTER POLICY team_lab_read_public_or_owner_sim_jobs
ON public.team_lab_sim_jobs USING (
  owner_user_id = (SELECT auth.uid())
  OR (
    team_ids IS NOT NULL AND opponent_team_ids IS NOT NULL
    AND cardinality(team_ids || opponent_team_ids) > 0
    AND NOT EXISTS (
      SELECT 1 FROM unnest(team_lab_sim_jobs.team_ids ||
                          team_lab_sim_jobs.opponent_team_ids) AS ref(id)
      WHERE NOT EXISTS (
        SELECT 1 FROM public.team_lab_teams t
        WHERE t.id = ref.id
          AND t.visibility IN ('public', 'hidden_details')
          AND t.legality_status <> 'illegal'
      )
    )
  )
);
COMMIT;
