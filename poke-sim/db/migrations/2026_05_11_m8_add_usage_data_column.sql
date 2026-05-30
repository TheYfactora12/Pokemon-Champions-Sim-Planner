-- M8: Add usage_data JSONB column to prior_snapshots
-- Contains per-species, per-item, per-move usage frequencies from Smogon stats
-- Applied via Supabase SQL editor or apply_migration tool

ALTER TABLE prior_snapshots
  ADD COLUMN IF NOT EXISTS usage_data JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN prior_snapshots.usage_data IS
  'Smogon usage stats: {species: [{name, usage}], items: [{name, usage}], moves: [{name, usage}]}';
