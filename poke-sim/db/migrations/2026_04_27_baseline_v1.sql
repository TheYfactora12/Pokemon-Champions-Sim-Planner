-- 2026_04_27_baseline_v1.sql
-- Baseline schema: 8 live tables for Pokemon Champions Sim Planner
-- Reference: M1-M3 implementation (PR #161-163)

-- ============================================================
-- REFERENCE TABLES (seed data, read-mostly)
-- ============================================================

CREATE TABLE IF NOT EXISTS rulesets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  format TEXT DEFAULT 'doubles',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
  team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  label TEXT DEFAULT 'CUSTOM',
  mode TEXT DEFAULT 'opponent',
  ruleset_id UUID REFERENCES rulesets(id),
  source TEXT DEFAULT 'unknown',
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID, -- nullable for anonymous imports
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  ability TEXT,
  item TEXT,
  nature TEXT,
  evs JSONB DEFAULT '{}',
  ivs JSONB DEFAULT '{}',
  moves TEXT[] DEFAULT '{}',
  level INTEGER DEFAULT 50,
  tera_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prior_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(team_id),
  snapshot_data JSONB NOT NULL,
  version TEXT DEFAULT 'v1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS golden_battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ruleset_id UUID REFERENCES rulesets(id),
  player_team_id UUID REFERENCES teams(team_id),
  opponent_team_id UUID REFERENCES teams(team_id),
  battle_data JSONB NOT NULL,
  result TEXT, -- 'win'/'loss'/'draw'
  turns INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ANALYTICS TABLES (write-heavy, user-generated)
-- ============================================================

CREATE TABLE IF NOT EXISTS analyses (
  analysis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_key TEXT NOT NULL,
  opponent_key TEXT NOT NULL,
  ruleset_id UUID REFERENCES rulesets(id),
  bo INTEGER NOT NULL DEFAULT 3, -- best-of series length
  sample_size INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  avg_turns DECIMAL(5,2),
  avg_tr_turns DECIMAL(5,2),
  policy_model TEXT DEFAULT 'vgc2026_reg_m_a',
  analysis_json JSONB DEFAULT '{}',
  created_by UUID, -- nullable for anonymous analyses
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analysis_win_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(analysis_id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  percentage DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analysis_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(analysis_id) ON DELETE CASCADE,
  turn_number INTEGER,
  tr_turn_number INTEGER,
  win_condition TEXT,
  log TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Teams lookup indexes
CREATE INDEX IF NOT EXISTS idx_teams_ruleset_id ON teams(ruleset_id);
CREATE INDEX IF NOT EXISTS idx_teams_label ON teams(label);
CREATE INDEX IF NOT EXISTS idx_teams_source ON teams(source);

-- Team members lookup
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_species ON team_members(species);

-- Analyses lookup indexes
CREATE INDEX IF NOT EXISTS idx_analyses_player_opponent ON analyses(player_key, opponent_key);
CREATE INDEX IF NOT EXISTS idx_analyses_ruleset_id ON analyses(ruleset_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at);

-- Analysis children indexes
CREATE INDEX IF NOT EXISTS idx_analysis_win_conditions_analysis_id ON analysis_win_conditions(analysis_id);
CREATE INDEX IF NOT EXISTS idx_analysis_logs_analysis_id ON analysis_logs(analysis_id);

-- ============================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rulesets_updated_at BEFORE UPDATE ON rulesets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
