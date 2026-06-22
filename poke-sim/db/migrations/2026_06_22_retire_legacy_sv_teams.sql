-- Retire legacy v1 teams that are no longer part of the active 27-team
-- Champion catalog.
--
-- Rationale:
-- - The active source of truth is generated from poke-sim/data.js and
--   aligned by 2026_06_20_align_shared_27_team_catalog.sql.
-- - These old rows can remain referenced by historical analyses, so keep the
--   team rows but remove stale members/items and mark them retired.
-- - Active app/CI catalog checks should ignore metadata.retired = true rows.

BEGIN;

ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

DELETE FROM team_members
WHERE team_id IN ('chuppa_balance', 'kingambit_sneasler');

UPDATE teams
SET
  mode = 'retired',
  source = 'retired_legacy',
  description = description || ' [Retired 2026-06-22: superseded by the active 27-team Champion catalog.]',
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'retired', true,
    'retired_at', '2026-06-22',
    'retired_reason', 'Superseded by the active 27-team Champion catalog; kept only for historical analysis references.',
    'active_catalog', false
  )
WHERE team_id IN ('chuppa_balance', 'kingambit_sneasler');

COMMIT;
