# Pokemon Data Audit Review

This project generates a Pokemon data audit workbook for human review:

- `poke-sim/reports/pokemon_data_audit.xlsx`
- `poke-sim/reports/pokemon_data_audit.csv`

Josh (`jdoutt`) should review the workbook whenever a change affects any of these areas:

- Pokemon species or form normalization
- base stats or type data
- legal move lookup or learnset data
- replay import parsing that can change species/form resolution
- Set Editor move legality warnings
- generated Pokemon data artifacts

Tracking issue: #123.

## Regeneration Rule

After any supported Pokemon data, parser, or legality-source change, regenerate the workbook before review.

Use the current project command:

```bash
node poke-sim/tools/generate-pokemon-data-audit.js \
  --pokedex /private/tmp/pokedex.ts \
  --learnsets /private/tmp/learnsets.ts \
  --moves /private/tmp/moves.ts \
  --source-commit 3f5079d395ad018f13e8f785a675a13bd4cbf59e \
  --source-date 2026-05-24
```

The source commit/date must be updated when the upstream Pokemon Showdown source files are refreshed.

## Josh Review Checklist

Josh should confirm:

- The workbook README has the source repository, source commit/version, generated timestamp, and generator path.
- `Species_Stats` contains expected supported species and forms.
- `Learnsets` separates regional and gendered forms where the source data separates them.
- `Form_Differences` includes Arcanine versus Arcanine-Hisui when they differ.
- `Validation_Errors` does not contain new high-severity mismatches without an explanation.
- Replay Turn 0 samples show starting state before moves, not post-turn state.

## Engineering Notes

- Standard Pokemon / Pokemon Showdown-style data is the source of truth for this audit.
- Supabase is not the source of truth for Pokemon stats or legal moves.
- Do not manually type broad stat or move tables unless there is no safer generated path.
- If generated artifacts change, rerun the relevant parser, move-legality, audit, bundle, and diff checks before PR review.
