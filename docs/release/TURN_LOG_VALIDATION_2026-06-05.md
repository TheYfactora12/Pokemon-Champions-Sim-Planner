# Turn Log Validation - 2026-06-05

## What Was Checked

Five user-provided `champions-turn-log-*.json` exports were checked with the new exported-log validator:

- roster identity across active, bench, and fainted states
- item ownership across switches and replacements
- active/bench key consistency
- HP map key coverage
- speed-order key coverage
- observed move order against move priority plus snapshot speed order

## Result

All five logs passed with zero hard errors.

The validator did not find:

- item drift between Pokemon
- active/bench key mismatches
- HP keys pointing at the wrong live Pokemon
- speed-order keys pointing at non-active Pokemon
- observed priority/speed order mismatches

The new Showdown priority drift audit also found and fixed local priority mismatches for:

- `Feint`: Showdown priority +2
- `Ice Shard`: Showdown priority +1
- `King's Shield` and related Protect-family shields: Showdown priority +4

## Important Warning

All five exports were missing the stable identity fields added by the current source:

- `stableKey`
- `active_stable_keys`
- `bench_stable_keys`
- `hp_pct_stable`
- `speed_order_stable_keys`
- `itemConsumed`

That means these files are valid legacy exports, but they are not strong proof that the live preview was using the newest stable-identity bundle when the logs were downloaded. They still use volatile keys such as `player:active:0:Incineroar`, which naturally change when a Pokemon moves from bench to active or active to fainted.

## Team Guidance

For future bug reports, use a hard refresh of the GitHub Pages preview before exporting logs. New exports should pass:

```bash
cd poke-sim
node tools/validate-turn-logs.mjs --require-stable path/to/champions-turn-log.json
```

If `--require-stable` fails, the log probably came from a cached or older app bundle. It can still be useful, but it cannot fully prove stable Pokemon identity across switches.

## Showdown Sync Direction

The database should mirror Pokemon Showdown for canonical upstream data:

- moves: priority, target, flags, type, category, base power, accuracy, status, secondaries, terrain/weather/field markers
- species/forms: stats, typing, aliases, required item/form data
- items and abilities: names, metadata, descriptions, berry/mega metadata
- type chart and learnsets

Champions-specific differences should be explicit overrides, not hidden edits to Showdown-derived rows. The intended model is:

```text
Pokemon Showdown source data
  -> normalized showdown_entities
  -> reviewed approved_app_data
  -> champions_overrides
  -> generated app assets and engine validation
```

Battle behavior still needs local engine code or oracle tests because many Showdown mechanics are callbacks, not plain database fields.
