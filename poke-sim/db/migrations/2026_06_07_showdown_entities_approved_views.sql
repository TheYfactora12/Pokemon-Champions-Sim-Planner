-- Showdown approved entity and Champions override tables.
-- This is the reviewed source-of-truth layer for static simulator data.
-- Showdown rows are mirrored 1:1; Champions changes live in separate override rows.

CREATE TABLE IF NOT EXISTS showdown_entities (
  entity_id TEXT PRIMARY KEY CHECK (length(btrim(entity_id)) > 0),
  sync_run_id TEXT REFERENCES showdown_sync_runs(sync_run_id) ON DELETE SET NULL,
  entity_kind TEXT NOT NULL CHECK (entity_kind IN (
    'move',
    'species',
    'ability',
    'item',
    'typechart',
    'alias',
    'learnset',
    'format'
  )),
  entity_key TEXT NOT NULL CHECK (length(btrim(entity_key)) > 0),
  display_name TEXT NOT NULL CHECK (length(btrim(display_name)) > 0),
  source_hash TEXT NOT NULL CHECK (length(btrim(source_hash)) > 0),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  approved BOOLEAN NOT NULL DEFAULT false,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sync_run_id, entity_kind, entity_key)
);

CREATE TABLE IF NOT EXISTS showdown_entity_diffs (
  diff_id TEXT PRIMARY KEY CHECK (length(btrim(diff_id)) > 0),
  sync_run_id TEXT REFERENCES showdown_sync_runs(sync_run_id) ON DELETE CASCADE,
  entity_kind TEXT NOT NULL CHECK (entity_kind IN (
    'move',
    'species',
    'ability',
    'item',
    'typechart',
    'alias',
    'learnset',
    'format'
  )),
  entity_key TEXT NOT NULL CHECK (length(btrim(entity_key)) > 0),
  diff_type TEXT NOT NULL CHECK (diff_type IN ('added', 'removed', 'changed')),
  previous_hash TEXT,
  current_hash TEXT,
  previous_data JSONB,
  current_data JSONB,
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN (
    'pending',
    'approved',
    'rejected',
    'superseded'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS champions_overrides (
  override_id TEXT PRIMARY KEY CHECK (length(btrim(override_id)) > 0),
  entity_kind TEXT NOT NULL CHECK (entity_kind IN (
    'move',
    'species',
    'ability',
    'item',
    'typechart',
    'alias',
    'learnset',
    'format'
  )),
  entity_key TEXT NOT NULL CHECK (length(btrim(entity_key)) > 0),
  field_path TEXT NOT NULL CHECK (length(btrim(field_path)) > 0),
  override_value JSONB NOT NULL,
  reason TEXT NOT NULL CHECK (length(btrim(reason)) > 0),
  source_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active',
    'superseded',
    'rejected',
    'resolved'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_showdown_entities_kind_key_approved
  ON showdown_entities(entity_kind, entity_key, approved, approved_at DESC);

CREATE INDEX IF NOT EXISTS idx_showdown_entities_approved_latest
  ON showdown_entities(entity_kind, entity_key, approved_at DESC NULLS LAST, created_at DESC)
  WHERE approved = true;

CREATE INDEX IF NOT EXISTS idx_showdown_entities_sync_kind
  ON showdown_entities(sync_run_id, entity_kind);

CREATE INDEX IF NOT EXISTS idx_showdown_entities_source_hash
  ON showdown_entities(entity_kind, source_hash);

CREATE INDEX IF NOT EXISTS idx_showdown_entity_diffs_run_status
  ON showdown_entity_diffs(sync_run_id, review_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_showdown_entity_diffs_subject
  ON showdown_entity_diffs(entity_kind, entity_key, diff_type);

CREATE INDEX IF NOT EXISTS idx_champions_overrides_subject_status
  ON champions_overrides(entity_kind, entity_key, status);

CREATE INDEX IF NOT EXISTS idx_champions_overrides_field
  ON champions_overrides(entity_kind, entity_key, field_path);

CREATE OR REPLACE VIEW approved_showdown_entities
WITH (security_invoker = true) AS
SELECT DISTINCT ON (entity_kind, entity_key)
  entity_id,
  sync_run_id,
  entity_kind,
  entity_key,
  display_name,
  source_hash,
  data,
  approved_at,
  created_at
FROM showdown_entities
WHERE approved = true
ORDER BY entity_kind, entity_key, approved_at DESC NULLS LAST, created_at DESC;

CREATE OR REPLACE VIEW approved_champions_data
WITH (security_invoker = true) AS
SELECT
  override_id,
  entity_kind,
  entity_key,
  field_path,
  override_value,
  reason,
  source_url,
  status,
  created_at,
  resolved_at
FROM champions_overrides
WHERE status = 'active';

ALTER TABLE showdown_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE showdown_entity_diffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE champions_overrides ENABLE ROW LEVEL SECURITY;

REVOKE INSERT, UPDATE, DELETE ON showdown_entities FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON showdown_entity_diffs FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON champions_overrides FROM anon, authenticated;

DROP POLICY IF EXISTS "anon_read_approved_showdown_entities" ON showdown_entities;
CREATE POLICY "anon_read_approved_showdown_entities"
  ON showdown_entities FOR SELECT TO anon, authenticated USING (approved = true);

DROP POLICY IF EXISTS "anon_read_active_champions_overrides" ON champions_overrides;
CREATE POLICY "anon_read_active_champions_overrides"
  ON champions_overrides FOR SELECT TO anon, authenticated USING (status = 'active');

GRANT SELECT ON approved_showdown_entities TO anon, authenticated;
GRANT SELECT ON approved_champions_data TO anon, authenticated;
GRANT SELECT ON showdown_entities TO anon, authenticated;
GRANT SELECT ON champions_overrides TO anon, authenticated;
