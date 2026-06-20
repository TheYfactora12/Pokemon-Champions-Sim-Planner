# Turn Log QA Batch — 2026-06-20

Source logs:
- `champions-turn-log-1455805346,4187374283,3182266765,1308075680.json`
- `champions-turn-log-1297106231,2147183713,2494043063,3341422368.json`
- `champions-turn-log-551271714,2161664590,3506433802,1766642325.json`
- `champions-turn-log-3007188011,3636988410,1062435128,1773365396.json`

Validation command:
`node tools/validate-turn-logs.mjs --require-stable <all-four-files>`

## Validator outcome
- PASS on all files
- Errors: `0`
- Warnings: `0`
- Stable identities present: yes

## Per-log summary

| File seed key | Turns | Result | Win condition | Turning point | Total actions | Top event mix |
| --- | ---: | --- | --- | --- | ---: | --- |
| 1455805346,4187374283,3182266765,1308075680 | 7 | win | TR Win | turn 7 (player, position improved) | 25 | damage 16, field 9, ko 6, log 25, status 1 |
| 1297106231,2147183713,2494043063,3341422368 | 6 | loss | Opponent Win | turn 6 (opponent, position lost) | 21 | damage 13, ko 6, log 30 |
| 551271714,2161664590,3506433802,1766642325 | 7 | win | KO Sweep | turn 7 (player, position improved) | 26 | damage 15, ko 6, log 36 |
| 3007188011,3636988410,1062435128,1773365396 | 7 | win | Tailwind Win | turn 5 (player, position improved) | 26 | damage 17, field 3, ko 6, log 33 |

## Cross-batch checks

- `position_path` length matches `turns + 1` for all files.
- Action and event arrays are present on each turn.
- Active/bench mapping and speed-order key coverage passed validator constraints.
- No duplicate/invalid action entries detected.
- HP snapshots remain in `[0,1]` range and are structurally stable.

### Move coverage signal (this batch)
- Total move actions: `98`
- Unique moves seen: `20`
- Support levels from current local move registry:
  - `legacy_verified`: 23
  - `registry_verified`: 24
  - `not_verified` (baseline only): 51

Not-verified moves used most frequently:
- Knock Off: `13`
- Blizzard: `13`
- Dragon Claw: `7`
- Moonblast: `6`
- Shadow Ball: `3`
- Scald: `3`
- Earthquake: `3`
- Hyper Voice: `1`
- Focus Blast: `1`
- Fire Punch: `1`

### Risk note
The four logs are structurally trustworthy and parse cleanly, but the replay actions are heavily weighted toward baseline-only moves. For trust parity work, this is the next gap to lock down with explicit verified behavior tests (`move_support` + damage engine checks).
