-- Approved species/form move legality view.
-- Exposes the governed DB answer to:
--   "Can this exact species/form use this move, and what base power/type data
--    will the generated runtime snapshot draw from?"
--
-- Battle simulation still uses generated runtime assets for deterministic
-- GitHub Pages/offline behavior. This view is for DB governance, QA review,
-- editor/autocomplete reads, and future runtime generation gates.

CREATE OR REPLACE VIEW approved_species_move_legality
WITH (security_invoker = true) AS
WITH approved_species AS (
  SELECT
    entity_id,
    sync_run_id,
    entity_key,
    display_name,
    source_hash,
    data,
    approved_at,
    created_at
  FROM approved_showdown_entities
  WHERE entity_kind = 'species'
),
approved_moves AS (
  SELECT
    entity_id,
    sync_run_id,
    entity_key,
    display_name,
    source_hash,
    data,
    approved_at,
    created_at
  FROM approved_showdown_entities
  WHERE entity_kind = 'move'
),
species_moves AS (
  SELECT
    s.*,
    learned.move_id,
    learned.learn_method_codes
  FROM approved_species s
  CROSS JOIN LATERAL jsonb_each_text(
    CASE
      WHEN jsonb_typeof(s.data -> 'moves') = 'object' THEN s.data -> 'moves'
      ELSE '{}'::jsonb
    END
  ) AS learned(move_id, learn_method_codes)
)
SELECT
  sm.sync_run_id AS species_sync_run_id,
  m.sync_run_id AS move_sync_run_id,
  sm.entity_key AS species_id,
  COALESCE(NULLIF(sm.data ->> 'speciesKey', ''), sm.display_name) AS species_key,
  COALESCE(NULLIF(sm.data ->> 'displayName', ''), sm.display_name) AS species_name,
  COALESCE(NULLIF(sm.data ->> 'baseSpecies', ''), sm.display_name) AS base_species,
  COALESCE(sm.data ->> 'forme', '') AS forme,
  COALESCE(sm.data ->> 'requiredItem', '') AS required_item,
  COALESCE(sm.data -> 'types', '[]'::jsonb) AS types,
  COALESCE(sm.data -> 'stats', '{}'::jsonb) AS stats,
  sm.move_id,
  COALESCE(NULLIF(m.data ->> 'move_name', ''), NULLIF(m.data ->> 'name', ''), m.display_name, sm.move_id) AS move_name,
  COALESCE(m.data ->> 'type', '') AS move_type,
  COALESCE(m.data ->> 'category', '') AS category,
  CASE
    WHEN COALESCE(m.data ->> 'base_power', m.data ->> 'basePower', '') ~ '^-?[0-9]+(\.[0-9]+)?$'
      THEN COALESCE(m.data ->> 'base_power', m.data ->> 'basePower')::numeric
    ELSE NULL
  END AS base_power,
  COALESCE(m.data ->> 'accuracy', '') AS accuracy,
  CASE
    WHEN COALESCE(m.data ->> 'priority', '') ~ '^-?[0-9]+$'
      THEN (m.data ->> 'priority')::integer
    ELSE 0
  END AS priority,
  COALESCE(m.data ->> 'target', '') AS target,
  COALESCE(m.data ->> 'flags', '') AS flags,
  m.data -> 'recoil' AS recoil,
  sm.learn_method_codes,
  sm.source_hash AS species_source_hash,
  m.source_hash AS move_source_hash,
  sm.approved_at AS species_approved_at,
  m.approved_at AS move_approved_at,
  sm.created_at AS species_created_at,
  m.created_at AS move_created_at
FROM species_moves sm
LEFT JOIN approved_moves m
  ON m.entity_key = sm.move_id;

GRANT SELECT ON approved_species_move_legality TO anon, authenticated;
