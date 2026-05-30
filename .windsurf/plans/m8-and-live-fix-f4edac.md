# Live App Fix + M8 Plan

Fix the critical bundle rendering bug and create two plan documents (live fix + M8 prior_snapshots).

---

## ROOT CAUSE IDENTIFIED

**`supabase_adapter.js` line 23 contains `//   </script>` in a comment.** When the build script inlines all JS into a single `<script>` block (build-bundle.py line 98), the HTML parser hits this `</script>` and closes the script tag. Everything after — the adapter's runtime code — renders as visible text instead of executing.

### Evidence
- `poke-sim/supabase_adapter.js:23` → `//   </script>`
- `poke-sim/tools/build-bundle.py:98` → all source files concatenated into one `<script>` block
- `poke-sim/pokemon-champion-2026.html:15951` → the offending `</script>` in the built bundle
- User sees raw JS source as page text starting from `const DISABLED = ...`

---

## Ordering Recommendation

**Fix live app FIRST, then M8.**

| Factor | Live App Fix | M8 (prior_snapshots) |
|---|---|---|
| Priority | P0 — user-facing breakage | Low — R&D / deferred |
| Dependency | None | Requires stable M1-M7 + live DB |
| User impact | All users see broken app NOW | Advanced sim accuracy only |

---

## Deliverable 1: `poke-sim/docs/LIVE_APP_FIX_PLAN.md`

### Root cause

`</script>` inside a JS comment in `supabase_adapter.js` breaks the bundle's `<script>` tag. Secondary issue: placeholder Supabase creds (`YOUR_PROJECT_REF`/`YOUR_ANON_KEY_HERE`) in both `index.html` and the bundle mean DB features are invisible.

### Fix (SWE-1.5 followable)

- **Step 1**: In `poke-sim/supabase_adapter.js` line 20-23, replace the `<script>...</script>` example in the comment with escaped versions (`<scr`+`ipt>` / `</scr`+`ipt>`) or remove the HTML example entirely
- **Step 2**: In `poke-sim/tools/build-bundle.py`, add a sanitization pass on all inlined JS: `content.replace('</script>', '<\\/script>')` — defense-in-depth against future occurrences
- **Step 3**: Rebuild bundle: `cd poke-sim; python tools/build-bundle.py`
- **Step 4**: Bump `sw.js` CACHE_NAME to `champions-sim-v14-live-fix`
- **Step 5**: Verify bundle locally: open `pokemon-champion-2026.html` in browser, confirm no raw JS text visible, no console errors
- **Step 6** (secondary): Inject real Supabase creds for production — create `tools/inject-credentials.py` to replace placeholders from env vars, or update `index.html` with real project URL (`ymlahqnshgiarpbgxehp`)
- **Step 7**: Verify GitHub Pages deployment at `alfredocox.github.io/Pokemon-Champions-Sim-Planner`

### Acceptance criteria
- No raw JS source text visible in browser
- Zero JS console errors on page load
- All 13+ teams in dropdowns, Bo1/Bo3 sim works
- All tabs functional (Pilot Guide, Replay Log, Set Editor)
- DB adapter runs in local-only mode silently (with placeholder creds) or connects (with real creds)

---

## Deliverable 2: `poke-sim/docs/M8_PRIOR_SNAPSHOTS_PLAN.md`

### Context

- `prior_snapshots` table exists in schema (0 rows): `prior_id TEXT PK, source TEXT, format TEXT, cutoff INT, month DATE, location TEXT`
- `analyses.prior_id` FK already exists (nullable)
- `analyses.hidden_info_model` column exists
- Engine currently stubs: `hidden_info_priors: { note: 'No hidden-set priors applied', source: 'exact-input' }`
- No test file exists yet (`db_m8_priors_tests.js` placeholder mentioned in TDD plan)

### Plan contents (SWE-1.5 followable)

- **Step 1**: Write TDD suite `poke-sim/tests/db_m8_priors_tests.js` — RED cases:
  - T-prior-1: `prior_snapshots` seed fixture exists with ≥3 snapshots
  - T-prior-2: `loadPriorSnapshot(format, month)` adapter method exists and returns snapshot or null
  - T-prior-3: Snapshot contains per-species usage rates, item frequencies, move frequencies
  - T-prior-4: Engine `selectMove()` incorporates prior usage rates when prior is loaded
  - T-prior-5: Engine without prior → identical behavior to current (determinism preserved)
  - T-prior-6: `saveAnalysis` payload includes `prior_id` when prior was used
  - T-prior-7: `hidden_info_model` field populated with prior metadata
  - T-prior-8: Prior data stale (>60 days) → warning logged, still usable
  - T-prior-9: Prior load fails → fail-soft, engine runs without prior
  - T-prior-10: Prior snapshot version increment on update

- **Step 2**: Create seed fixture `poke-sim/tests/fixtures/prior_snapshots_sample.json` — 3 months of Smogon VGC 2026 Reg M usage data (top 30 species, items, moves)

- **Step 3**: Create migration `poke-sim/db/migrations/2026_05_XX_seed_prior_snapshots.sql` — INSERT 3 snapshot rows + companion data (usage stored as JSONB in a new `usage_data JSONB` column via ALTER TABLE)

- **Step 4**: Add adapter method `loadPriorSnapshot(format, month)` in `supabase_adapter.js`:
  - Query: `from('prior_snapshots').select('*').eq('format', format).lte('month', month).order('month', {ascending: false}).limit(1)`
  - Returns parsed snapshot or null
  - Fail-soft: catch → null

- **Step 5**: Wire prior into engine — `engine.js` changes:
  - Add `applyPrior(prior, oppTeam)` function that overlays usage-rate weights onto opponent set inference
  - In `selectMove()`, if prior is loaded, weight move selection toward countering likely opponent sets
  - Pass `prior_id` through battle context so `buildAnalysisPayload` can include it

- **Step 6**: Wire UI — `ui.js` changes:
  - Before calling `runBoSeries`, check if a prior is available for the current format/date
  - Pass prior into engine context
  - Include `prior_id` in `_buildAnalysisPayload`

- **Step 7**: Rebuild bundle + bump `sw.js` CACHE_NAME

- **Step 8**: Flip tests GREEN — verify all T-prior-* cases pass

### Acceptance criteria
- `prior_snapshots` has ≥3 rows in Supabase
- Running sim with prior → `analyses.prior_id` is non-null
- Running sim without prior → identical to current behavior (no regression)
- `hidden_info_model` populated in saved analysis
- All existing 343+ engine tests still pass
- `db_m8_priors_tests.js` all GREEN

---

## Steps (this plan)

- [x] Read all .md docs (MASTER_PROMPT ×2, ROADMAP, integration plan v2, TDD plan)
- [x] Check git branch status (`main` at `2a5e6bf`, M1-M7 merged, PR #177 merged)
- [x] Analyze live app URL issue (placeholder creds, 944KB bundle, runtime errors confirmed)
- [x] Analyze M8 scope (prior_snapshots schema, engine hidden-info stubs, no existing tests)
- [ ] Create `poke-sim/docs/LIVE_APP_FIX_PLAN.md` with full SWE-1.5-followable steps
- [ ] Create `poke-sim/docs/M8_PRIOR_SNAPSHOTS_PLAN.md` with full SWE-1.5-followable steps
- [ ] Report file locations to user
