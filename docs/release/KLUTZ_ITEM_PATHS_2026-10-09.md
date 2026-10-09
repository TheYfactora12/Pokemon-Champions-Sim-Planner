# Klutz Direct Item Paths

## Candidate Scope

Follow-up to #235, after v201. No legality/data promotion or DB changes.
Six direct checks ignored Klutz: Choice Scarf speed, lock setting/enforcement,
Power Herb charge preview/execution, and Focus Sash survival. Failing-before
fixtures reproduce active effects on Klutz holders; candidate guards suppress
them without consuming the held item.

## Verified Scoped Evidence

- Eleven focused local tests pass: active/suppressed controls for each item,
  Scarf move-lock behavior, turn-two charge completion and actual sunlight
  execution without consuming the suppressed Herb.
- Six pinned pokemon-showdown 0.11.11 Champions synthetic probes pass for
  named speed, consumption and HP boundaries. Random damage is not a parity claim.
- Reference snapshots reorder Pokemon on replacement; the test selects the
  target by its unique fixture species, not the new active-slot occupant.
- Independent read-only review cleared the narrow guards. Battle audit passed
  its declared scope and 4,500 seeded stress battles. Full project gate and
  bundle build passed locally. Hosted checks and deployment passed below.

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

## Production Receipt

- PR254 candidate `2e8dc5c`, runtime merge
  `698957eeaa142b41d72c96a439fc6e62f196611c`.
- Required CI `37933950819`, bundle `37933950398`, cache `37933950517`
  passed. Pages `37934590584` succeeded. Supabase preview was skipped,
  not verified; no live DB security claim.
- HTTP alignment at 2026-10-09T13:10:36.268Z matched v2.2.202-klutz-items
  and external assets. Bundle SHA-256:
  `99d1365c5550a3c7d9bab6cb88a760375347a5b9a35737bc2bbb2c2d143d1d43`.
- Live browser displayed v202; imported the same synthetic team into a new
  save and ran one Bo1 against Mega Dragonite. Downloaded
  `champions-turn-log-1780987744,1164141272,1234413476,510961015.json`
  into Downloads. Five turns, 27 log-type events: 26 verbatim matches and one
  equivalent formatted Leftovers 10-HP recovery. Exported Lopunny pre-turn
  base/effective Speed both 157 with Klutz and Choice Scarf. Turn-one Liepard
  Fake Out visibly flinched Lopunny before its action. This is a smoke test,
  not a complete-game oracle or a competitive team-strength measurement.
- Bundle size is 11,534,191 bytes, only 145 below the existing cap. #255 tracks
  recovering headroom without raising the cap or weakening offline/cache gates.
