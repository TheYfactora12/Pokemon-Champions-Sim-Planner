-- 2026_05_17_auth_profile_memory.sql
-- Adds authenticated profile-memory tables and strict RLS for subscriber paths.
-- Raw replay logs remain opt-in and are not required by this schema.

CREATE TABLE IF NOT EXISTS team_profiles (
  team_profile_id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  canonical_format TEXT,
  canonical_ruleset TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_versions (
  team_version_id TEXT PRIMARY KEY,
  team_profile_id TEXT NOT NULL REFERENCES team_profiles(team_profile_id) ON DELETE CASCADE,
  version_label TEXT,
  fingerprint_hash TEXT,
  format TEXT,
  ruleset_id TEXT,
  source TEXT,
  team_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_run_snapshots (
  team_run_snapshot_id TEXT PRIMARY KEY,
  team_profile_id TEXT REFERENCES team_profiles(team_profile_id) ON DELETE CASCADE,
  team_version_id TEXT REFERENCES team_versions(team_version_id) ON DELETE CASCADE,
  opponent_fingerprint TEXT,
  opponent_team_key TEXT,
  format TEXT,
  ruleset_id TEXT,
  bo INT,
  source TEXT,
  sim_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  strategy_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS replay_artifacts (
  replay_artifact_id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL DEFAULT 'showdown_log',
  source_url TEXT,
  format TEXT,
  ruleset_profile TEXT,
  player_fingerprint TEXT,
  opponent_fingerprint TEXT,
  normalized_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_log_saved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS replay_team_matches (
  replay_team_match_id TEXT PRIMARY KEY,
  replay_artifact_id TEXT NOT NULL REFERENCES replay_artifacts(replay_artifact_id) ON DELETE CASCADE,
  team_profile_id TEXT REFERENCES team_profiles(team_profile_id) ON DELETE CASCADE,
  team_version_id TEXT REFERENCES team_versions(team_version_id) ON DELETE CASCADE,
  match_status TEXT NOT NULL DEFAULT 'unknown',
  similarity_score NUMERIC(6,4) NOT NULL DEFAULT 0,
  confidence TEXT NOT NULL DEFAULT 'low',
  evidence_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS replay_sim_comparisons (
  replay_sim_comparison_id TEXT PRIMARY KEY,
  replay_artifact_id TEXT NOT NULL REFERENCES replay_artifacts(replay_artifact_id) ON DELETE CASCADE,
  team_run_snapshot_id TEXT REFERENCES team_run_snapshots(team_run_snapshot_id) ON DELETE CASCADE,
  team_profile_id TEXT REFERENCES team_profiles(team_profile_id) ON DELETE CASCADE,
  team_version_id TEXT REFERENCES team_versions(team_version_id) ON DELETE CASCADE,
  comparison_status TEXT NOT NULL DEFAULT 'needs_sim_data',
  calibration_action TEXT NOT NULL DEFAULT 'none',
  confidence TEXT NOT NULL DEFAULT 'low',
  summary_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coaching_reports (
  coaching_report_id TEXT PRIMARY KEY,
  replay_artifact_id TEXT REFERENCES replay_artifacts(replay_artifact_id) ON DELETE CASCADE,
  team_profile_id TEXT REFERENCES team_profiles(team_profile_id) ON DELETE CASCADE,
  team_version_id TEXT REFERENCES team_versions(team_version_id) ON DELETE CASCADE,
  report_type TEXT NOT NULL DEFAULT 'battle_sensei_replay',
  confidence TEXT NOT NULL DEFAULT 'low',
  report_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_trend_rollups (
  team_profile_id TEXT NOT NULL REFERENCES team_profiles(team_profile_id) ON DELETE CASCADE,
  team_version_id TEXT REFERENCES team_versions(team_version_id) ON DELETE CASCADE,
  format TEXT,
  ruleset_id TEXT,
  battle_count INT NOT NULL DEFAULT 0,
  repeat_fingerprints JSONB NOT NULL DEFAULT '[]'::jsonb,
  battle_iq_rollup JSONB NOT NULL DEFAULT '{}'::jsonb,
  matchup_rollup JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (team_profile_id, team_version_id)
);

CREATE INDEX IF NOT EXISTS idx_team_profiles_user_id ON team_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_team_versions_team_profile_id ON team_versions(team_profile_id);
CREATE INDEX IF NOT EXISTS idx_team_run_snapshots_profile_version ON team_run_snapshots(team_profile_id, team_version_id);
CREATE INDEX IF NOT EXISTS idx_replay_artifacts_user_id ON replay_artifacts(user_id);
CREATE INDEX IF NOT EXISTS idx_replay_team_matches_replay_artifact_id ON replay_team_matches(replay_artifact_id);
CREATE INDEX IF NOT EXISTS idx_replay_sim_comparisons_replay_artifact_id ON replay_sim_comparisons(replay_artifact_id);
CREATE INDEX IF NOT EXISTS idx_coaching_reports_replay_artifact_id ON coaching_reports(replay_artifact_id);

ALTER TABLE team_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_run_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE replay_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE replay_team_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE replay_sim_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_trend_rollups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_select_own_team_profiles"
  ON team_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "auth_insert_own_team_profiles"
  ON team_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_update_own_team_profiles"
  ON team_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_delete_own_team_profiles"
  ON team_profiles FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "auth_select_own_team_versions"
  ON team_versions FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM team_profiles tp
    WHERE tp.team_profile_id = team_versions.team_profile_id
      AND tp.user_id = auth.uid()
  ));
CREATE POLICY "auth_insert_own_team_versions"
  ON team_versions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM team_profiles tp
    WHERE tp.team_profile_id = team_versions.team_profile_id
      AND tp.user_id = auth.uid()
  ));
CREATE POLICY "auth_update_own_team_versions"
  ON team_versions FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM team_profiles tp
    WHERE tp.team_profile_id = team_versions.team_profile_id
      AND tp.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM team_profiles tp
    WHERE tp.team_profile_id = team_versions.team_profile_id
      AND tp.user_id = auth.uid()
  ));
CREATE POLICY "auth_delete_own_team_versions"
  ON team_versions FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM team_profiles tp
    WHERE tp.team_profile_id = team_versions.team_profile_id
      AND tp.user_id = auth.uid()
  ));

CREATE POLICY "auth_select_own_team_run_snapshots"
  ON team_run_snapshots FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM team_profiles tp
    WHERE tp.team_profile_id = team_run_snapshots.team_profile_id
      AND tp.user_id = auth.uid()
  ));
CREATE POLICY "auth_insert_own_team_run_snapshots"
  ON team_run_snapshots FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM team_profiles tp
    WHERE tp.team_profile_id = team_run_snapshots.team_profile_id
      AND tp.user_id = auth.uid()
  ));

CREATE POLICY "auth_select_own_replay_artifacts"
  ON replay_artifacts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "auth_insert_own_replay_artifacts"
  ON replay_artifacts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_update_own_replay_artifacts"
  ON replay_artifacts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_delete_own_replay_artifacts"
  ON replay_artifacts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "auth_select_own_replay_team_matches"
  ON replay_team_matches FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM replay_artifacts ra
    WHERE ra.replay_artifact_id = replay_team_matches.replay_artifact_id
      AND ra.user_id = auth.uid()
  ));
CREATE POLICY "auth_insert_own_replay_team_matches"
  ON replay_team_matches FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM replay_artifacts ra
    WHERE ra.replay_artifact_id = replay_team_matches.replay_artifact_id
      AND ra.user_id = auth.uid()
  ));

CREATE POLICY "auth_select_own_replay_sim_comparisons"
  ON replay_sim_comparisons FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM replay_artifacts ra
    WHERE ra.replay_artifact_id = replay_sim_comparisons.replay_artifact_id
      AND ra.user_id = auth.uid()
  ));
CREATE POLICY "auth_insert_own_replay_sim_comparisons"
  ON replay_sim_comparisons FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM replay_artifacts ra
    WHERE ra.replay_artifact_id = replay_sim_comparisons.replay_artifact_id
      AND ra.user_id = auth.uid()
  ));

CREATE POLICY "auth_select_own_coaching_reports"
  ON coaching_reports FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM replay_artifacts ra
    WHERE ra.replay_artifact_id = coaching_reports.replay_artifact_id
      AND ra.user_id = auth.uid()
  ));
CREATE POLICY "auth_insert_own_coaching_reports"
  ON coaching_reports FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM replay_artifacts ra
    WHERE ra.replay_artifact_id = coaching_reports.replay_artifact_id
      AND ra.user_id = auth.uid()
  ));

CREATE POLICY "auth_select_own_team_trend_rollups"
  ON team_trend_rollups FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM team_profiles tp
    WHERE tp.team_profile_id = team_trend_rollups.team_profile_id
      AND tp.user_id = auth.uid()
  ));
CREATE POLICY "auth_insert_own_team_trend_rollups"
  ON team_trend_rollups FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM team_profiles tp
    WHERE tp.team_profile_id = team_trend_rollups.team_profile_id
      AND tp.user_id = auth.uid()
  ));
CREATE POLICY "auth_update_own_team_trend_rollups"
  ON team_trend_rollups FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM team_profiles tp
    WHERE tp.team_profile_id = team_trend_rollups.team_profile_id
      AND tp.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM team_profiles tp
    WHERE tp.team_profile_id = team_trend_rollups.team_profile_id
      AND tp.user_id = auth.uid()
  ));
