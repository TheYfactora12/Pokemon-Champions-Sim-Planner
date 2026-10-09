# Klutz Direct Item Paths

## Candidate Scope

Follow-up to #235, after v201. No legality/data promotion or DB changes.
Six direct checks ignored Klutz: Choice Scarf speed, lock setting/enforcement,
Power Herb charge preview/execution, and Focus Sash survival. Failing-before
fixtures reproduce active effects on Klutz holders; candidate guards suppress
them without consuming the held item.

## Evidence In Progress

- Eleven focused local tests pass: active/suppressed controls for each item,
  Scarf move-lock behavior, turn-two charge completion and actual sunlight
  execution without consuming the suppressed Herb.
- Six pinned pokemon-showdown 0.11.11 Champions synthetic probes pass for
  named speed, consumption and HP boundaries. Random damage is not a parity claim.
- Reference snapshots reorder Pokemon on replacement; the test selects the
  target by its unique fixture species, not the new active-slot occupant.
- Independent read-only review cleared the narrow guards. Battle audit passed
  its declared scope and 4,500 seeded stress battles. Full project gate and
  bundle build passed locally. Hosted checks and deployment remain pending.
  Do not describe this candidate as live until a receipt is recorded.

## Remaining Work

#235 remains open for Lum Berry status activation. Magic Room, Embargo,
ability suppression/transitions and all other items remain outside this fix.
The shared item-ownership helper is intentionally unchanged: a suppressed item
is still held and can participate in removal/ownership mechanics.
Power Herb is marked Past in the pinned Champions mod: its synthetic custom-game
fixtures prove mechanics only, not availability. Choice-lock behavior is locally
tested, not oracle-compared. No arbitrary imported item becomes legal here.

## Local Browser

Imported a new synthetic four-member Lopunny/Charizard/Pelipper/Farigiraf team
without replacing user saves. Five-turn reference-practice sample seed:
1636277089,1311122747,2637420262,3974738474. Downloaded JSON had 28 log-type
events: 27 matched visible replay verbatim, one Leftovers row matched formatted
10-HP recovery. Lopunny retained Scarf/Klutz and its exported pre-turn base and
effective Speed both equaled 157. This is an item smoke check, not team advice
or validation of every mechanic in the battle.
