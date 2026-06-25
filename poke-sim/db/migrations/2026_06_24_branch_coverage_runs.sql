-- Branch coverage memory for QA forced-branch sweeps.
-- This stores deterministic branch keys so repeated browser runs can prefer
-- combinations that have not been exercised yet.

CREATE TABLE IF NOT EXISTS branch_coverage_runs (
  branch_key          TEXT PRIMARY KEY,
  ruleset_id          TEXT NOT NULL DEFAULT 'champions_reg_m_doubles_bo3',
  player_team_id      TEXT,
  opponent_team_id    TEXT,
  player_leads        JSONB NOT NULL DEFAULT '[]'::jsonb,
  opponent_leads      JSONB NOT NULL DEFAULT '[]'::jsonb,
  player_bring        JSONB NOT NULL DEFAULT '[]'::jsonb,
  opponent_bring      JSONB NOT NULL DEFAULT '[]'::jsonb,
  forced_actions      JSONB NOT NULL DEFAULT '[]'::jsonb,
  tactical_summary    JSONB NOT NULL DEFAULT '{}'::jsonb,
  qa_coverage_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  result              TEXT,
  turns               INT NOT NULL DEFAULT 0,
  outcome_signature   TEXT,
  outcome_drift_count INT NOT NULL DEFAULT 0,
  run_count           INT NOT NULL DEFAULT 1,
  build_id            TEXT,
  source_url          TEXT,
  first_seen_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE branch_coverage_runs
  ADD COLUMN IF NOT EXISTS tactical_summary JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_branch_coverage_pair
  ON branch_coverage_runs(player_team_id, opponent_team_id);

CREATE INDEX IF NOT EXISTS idx_branch_coverage_last_seen
  ON branch_coverage_runs(last_seen_at DESC);

ALTER TABLE branch_coverage_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_branch_coverage_runs" ON branch_coverage_runs;
CREATE POLICY "anon_read_branch_coverage_runs"
  ON branch_coverage_runs FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_insert_branch_coverage_runs" ON branch_coverage_runs;
CREATE POLICY "anon_insert_branch_coverage_runs"
  ON branch_coverage_runs FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_branch_coverage_runs" ON branch_coverage_runs;
CREATE POLICY "anon_update_branch_coverage_runs"
  ON branch_coverage_runs FOR UPDATE TO anon USING (true) WITH CHECK (true);
