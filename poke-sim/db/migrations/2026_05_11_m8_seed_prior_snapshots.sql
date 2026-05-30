-- M8: Seed prior_snapshots with 3 months of VGC 2026 Reg M usage data
-- Source: Smogon stats (simulated for testing, replace with real data when available)

INSERT INTO prior_snapshots (prior_id, source, format, cutoff, month, location, usage_data)
VALUES
  (
    'smogon-vgc2026-regm-2026-03',
    'smogon-usage',
    'vgc2026regm',
    1695,
    '2026-03-01',
    'https://www.smogon.com/stats/2026-03/gen9vgc2026regm-1695.txt',
    '{"species":[{"name":"Incineroar","usage":0.45},{"name":"Flutter Mane","usage":0.38},{"name":"Rillaboom","usage":0.35},{"name":"Urshifu-Rapid-Strike","usage":0.32},{"name":"Iron Hands","usage":0.30},{"name":"Tornadus","usage":0.28},{"name":"Amoonguss","usage":0.27},{"name":"Kingambit","usage":0.25},{"name":"Landorus-Therian","usage":0.23},{"name":"Ogerpon-Wellspring","usage":0.21}],"items":[{"name":"Assault Vest","usage":0.18},{"name":"Focus Sash","usage":0.16},{"name":"Choice Scarf","usage":0.14},{"name":"Life Orb","usage":0.13},{"name":"Sitrus Berry","usage":0.11}],"moves":[{"name":"Fake Out","usage":0.40},{"name":"Protect","usage":0.65},{"name":"Close Combat","usage":0.22},{"name":"U-turn","usage":0.20},{"name":"Flare Blitz","usage":0.18}]}'::jsonb
  ),
  (
    'smogon-vgc2026-regm-2026-04',
    'smogon-usage',
    'vgc2026regm',
    1695,
    '2026-04-01',
    'https://www.smogon.com/stats/2026-04/gen9vgc2026regm-1695.txt',
    '{"species":[{"name":"Incineroar","usage":0.47},{"name":"Flutter Mane","usage":0.36},{"name":"Rillaboom","usage":0.34},{"name":"Iron Hands","usage":0.33},{"name":"Urshifu-Rapid-Strike","usage":0.31},{"name":"Amoonguss","usage":0.29},{"name":"Tornadus","usage":0.27},{"name":"Kingambit","usage":0.26},{"name":"Landorus-Therian","usage":0.24},{"name":"Ogerpon-Wellspring","usage":0.22}],"items":[{"name":"Assault Vest","usage":0.19},{"name":"Focus Sash","usage":0.17},{"name":"Choice Scarf","usage":0.15},{"name":"Life Orb","usage":0.12},{"name":"Rocky Helmet","usage":0.10}],"moves":[{"name":"Protect","usage":0.67},{"name":"Fake Out","usage":0.42},{"name":"Close Combat","usage":0.23},{"name":"U-turn","usage":0.21},{"name":"Grassy Glide","usage":0.19}]}'::jsonb
  ),
  (
    'smogon-vgc2026-regm-2026-05',
    'smogon-usage',
    'vgc2026regm',
    1695,
    '2026-05-01',
    'https://www.smogon.com/stats/2026-05/gen9vgc2026regm-1695.txt',
    '{"species":[{"name":"Incineroar","usage":0.48},{"name":"Flutter Mane","usage":0.37},{"name":"Rillaboom","usage":0.36},{"name":"Iron Hands","usage":0.34},{"name":"Urshifu-Rapid-Strike","usage":0.30},{"name":"Amoonguss","usage":0.28},{"name":"Kingambit","usage":0.27},{"name":"Tornadus","usage":0.26},{"name":"Landorus-Therian","usage":0.25},{"name":"Ogerpon-Wellspring","usage":0.23}],"items":[{"name":"Assault Vest","usage":0.20},{"name":"Focus Sash","usage":0.18},{"name":"Choice Scarf","usage":0.14},{"name":"Life Orb","usage":0.13},{"name":"Sitrus Berry","usage":0.12}],"moves":[{"name":"Protect","usage":0.68},{"name":"Fake Out","usage":0.43},{"name":"Close Combat","usage":0.24},{"name":"U-turn","usage":0.22},{"name":"Flare Blitz","usage":0.20}]}'::jsonb
  )
ON CONFLICT (prior_id) DO UPDATE
  SET usage_data = EXCLUDED.usage_data,
      source     = EXCLUDED.source,
      cutoff     = EXCLUDED.cutoff,
      location   = EXCLUDED.location;
