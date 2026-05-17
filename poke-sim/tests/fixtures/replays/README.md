# Replay Fixtures

## Purpose
This folder holds Pokemon Showdown replay fixtures for Battle IQ parser, ruleset-profile, and scoring tests.

Fixtures must separate parser validation from Champion-specific training. Generic Gen 9 logs can validate event grammar and parser resilience, but they must not become Champion Battle IQ norms or Strategy Guide priors unless their ruleset is explicitly marked compatible.

## Required files per fixture
- raw replay log or JSON snapshot
- manifest entry in `manifest.json`
- expected parser class and warning behavior

## Compatibility classes
- `champion_exact`: confirmed Pokemon Champions ruleset.
- `champion_compatible`: explicitly approved as close enough for Champion priors.
- `generic_gen9`: useful for parser and broad event handling only.
- `parser_only`: useful only for parser robustness.
- `unknown`: cannot affect scoring, norms, or coaching until classified.

## Fixture intake rules
- Store source URL and source ID.
- Store expected format and battle type.
- Store expected ruleset profile.
- Store expected minimum event count.
- Store expected confidence class.
- Store expected parser warnings.
- Never promote a fixture into Champion training without updating `compatibility_class` and explaining why.
