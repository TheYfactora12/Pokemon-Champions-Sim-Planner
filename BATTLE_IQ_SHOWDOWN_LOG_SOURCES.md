# Battle IQ Showdown Log Sources

## Notes
- These are real Pokemon Showdown replay pages suitable for sourcing first-pass fixtures.
- For parser testing, prefer raw replay JSON or saved replay logs from these pages rather than hand-written mocks.
- Use both wins and losses. Include at least one incomplete or noisy replay later.
- Treat each replay as a ruleset-profiled fixture. Generic Gen 9 logs can harden the parser, but they should not train Champion-specific Battle IQ norms or Strategy Guide recommendations unless marked Champion-compatible.

## Doubles candidates
1. Gen 9 Champions VGC 2026 Reg M-A (Bo3)
- https://replay.pokemonshowdown.com/gen9championsvgc2026regmabo3-2603658926-httgv1tqdo3c77qckkhvycsfxuc3vvqpw
- Good for: Bo3 adaptation, lead adjustments, set-level evidence.
- Suggested compatibility class: `unknown` until confirmed against Pokemon Champions rules; candidate for `champion_compatible`.

2. Gen 9 VGC 2026 Reg I
- https://replay.pokemonshowdown.com/gen9vgc2026regi-2573242187
- Good for: standard doubles parsing, speed-control evidence.
- Suggested compatibility class: `generic_gen9`.

3. Gen 9 VGC 2026 Reg F
- https://replay.pokemonshowdown.com/gen9vgc2026regf-2575505554
- Good for: regulation-era doubles sample with current-ish VGC structure.
- Suggested compatibility class: `generic_gen9`.

4. Gen 9 VGC 2026 Reg F (Bo3)
- https://replay.pokemonshowdown.com/gen9vgc2026regfbo3-2544014887-4og3y0igem3tihbawqyf0gbbrlxtxy4pw
- Good for: series-level adaptation and repeated decision patterns.
- Suggested compatibility class: `generic_gen9`.

## Singles candidates
1. Gen 9 National Dex
- https://replay.pokemonshowdown.com/gen9nationaldex-2504810481
- Good for: standard singles line parsing and broader move variety.
- Suggested compatibility class: `generic_gen9`.

2. Gen 9 National Dex
- https://replay.pokemonshowdown.com/gen9nationaldex-2524170199
- Good for: second singles sample so the parser is not tuned to one replay only.
- Suggested compatibility class: `generic_gen9`.

3. Gen 9 Random Battle
- https://replay.pokemonshowdown.com/gen9randombattle-2361075929
- Good for: noisy singles fixture and adaptation to partially unknown team structure.
- Suggested compatibility class: `parser_only` for Champion training, because random battle team construction is not Champion-compatible.

## Recommended first fixture pack
1. One doubles Bo1 replay
2. One doubles Bo3 replay
3. One singles standard replay
4. One singles noisy replay

## Suggested first pass
- Doubles Bo1: `gen9vgc2026regi-2573242187`
- Doubles Bo3: `gen9championsvgc2026regmabo3-2603658926-httgv1tqdo3c77qckkhvycsfxuc3vvqpw`
- Singles standard: `gen9nationaldex-2504810481`
- Singles noisy: `gen9randombattle-2361075929`

## Why these are useful
- They give both singles and doubles coverage.
- They include both single-game and set-based structures.
- They exercise different confidence conditions for Battle IQ.
- They are external replays, so they help catch parser assumptions hidden by synthetic local fixtures.
- They are ruleset-varied, so they force Battle IQ to separate parser validation from Champion-specific scoring.
