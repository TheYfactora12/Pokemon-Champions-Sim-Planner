# M-C Reference Practice

## Decision

The owner explicitly requested getting past the saved-draft Run All gate after
being told official M-C approval and Raichu's runtime transition were incomplete.
Provide an explicit, separate `champions_mc_reference` mode. This replaces the
earlier wait-only execution choice, not the official data approval requirements.
No ruleset is labeled officially approved; no production database promotion.

## Scope

- Revalidate both teams against pinned reference membership and structural
  checks on every execution, not a trusted flag from an imported file.
- Preserve saved registrations, draft restrictions and historical regulation
  behavior. Official M-C still requires #232. Reference supports doubles Bo1/Bo3.
- Experimental Raichu-Mega-X is scoped to the reference constructor argument;
  `CHAMPIONS_MEGAS` is unchanged. Base Raichu stats and selected Static/Lightning
  Rod precede Mega; legacy Mega-ability registrations use Static as the explicit
  base fallback. Mega stats, Electric Surge and weight 38 kg apply at evolution.
- Stone ownership, one Mega per side and entry-ability/terrain dispatch reuse
  existing engine paths. Tests cover delayed Mega and Electric Seed timing.
- Run All skips incompatible opponents with visible reasons and records those
  exclusions in result/game provenance. They are not wins or simulated games.
- Pin, artifact digest, ruleset/build/team identity and unresolved source gaps
  accompany UI/export provenance. Direct engine results carry reference policy.
- Trusted ranking/coaching remains disabled; reference UI runs do not call
  database analysis writers. Ordinary-mode adapter positive control is tested.

```text
Saved team -> explicit M-C reference selection -> revalidation of both teams
  -> supported runtime / scoped Mega lifecycle -> experimental battle logs
  -> local results + exported provenance, never verified competitive ranking
```

## Sources

Pinned Showdown `efe4948570d5e8189751792136d26e71710c6c66`:
`data/pokedex.ts` Raichu-Mega-X; `data/items.ts` Raichunite X;
`data/mods/champions/items.ts`; existing repository candidate rows in
`regmb_source_conversion.js`. Reference artifact SHA256:
`fba0dbf7a01f95a57727923a948afb575b36ef7bb2a883600d2702596dad2905`.
Official notice: https://champions-news.pokemon-home.com/en/page/816.html .
Reference data is not proof of official eligibility.

## Checks And Limits

`tests/mc_reference_execution_tests.js` covers opt-in boundaries, immutable
registration, actual transformation/seed timing, delayed Mega, base abilities,
repeatability, invalid identity/move/SP/stone/scope rejection, missing pin and
Run All inclusion/exclusion with negative/positive adapter controls.
Independent review found conflicting species/name and case-variant duplicate
moves admitted by the initial candidate; both were repaired with regressions.

This is not full game parity or an official competitive win-rate predictor.
Known item activation/suppression gaps (#235), AI policy limitations and other
unverified mechanics remain. Test counts do not establish a 99% accuracy claim.
Full gate, independent clearance, local browser/export proof, CI and live proof
are recorded with the PR. Private teams and raw battles stay outside GitHub.

## Local Evidence

- Full gate: 204 fast test files and 12 offline/mock database test files passed;
  four manual/helper files skipped. This does not verify live database security.
- Seven focused reference-execution tests passed, including null-reference
  failure, Mega weight, historical-mode rejection and ordinary adapter control.
- Headless app-engine sweep: all 34 preloaded entries checked; 12 execution-ready
  references, 22 explicitly excluded. 360 games cover all 15 bring-four subsets
  with two lead orders/seeds each; 12 retained samples repeat exactly.
  These are limited-policy diagnostics, not independent mechanics validation or
  competitive win-rate estimates. Raw team and battle data remain private.
- One actual local browser battle: JSON retrieved from Downloads and all three
  turns compared with visible replay DOM; zero observable-field mismatches.
  The final catalog UI exposes all 34 preloads plus the saved custom team.
- Final-candidate browser Run All: 14 admitted loaded entries (including mirror),
  21 excluded with reasons. All 14 downloads retrieved; 69 turns compared with
  visible DOM and zero observable-field mismatches. Browser-local overrides and
  normalization differ from the raw preloaded headless inventory above; these
  are distinct populations, not interchangeable samples.
- Independent reviewer Popper cleared the scoped candidate after verifying the
  seven tests, scoped Mega transition, admission/persistence controls, artifact
  bytes and local comparison receipt. No official approval was granted.
- Initial full gate found a bundle-size failure. Compact generated roadmap JSON
  removed formatting bytes without changing roadmap data or raising the budget.
  Final candidate HTML SHA256:
  `a985ae97bb5b78b0801cbe1301ebdabd09a4bbcbd4d36f309d9a71f6f8ba4bcb`.

Follow-up observations: replay cards still show registered item metadata after
consumption, and Bellibolt's faint badge can inherit an earlier charge event.
The event/HP log comparison is not proof these UI labels correctly explain the
current held item or faint cause; keep them in the replay audit backlog.

Rollback: revert the release commit; saved drafts remain intact and review-only.
