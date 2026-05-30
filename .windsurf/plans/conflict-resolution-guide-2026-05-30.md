# Conflict Resolution Guide: Y Factor → Alfredo Sync (2026-05-30)

## 📊 Merge Status

**Branch**: `sync/yfactor-main-2026-05-30`
**Conflicts**: 17 files
**Auto-merged**: 9 files
**Status**: In progress - awaiting conflict resolution

---

## 🔴 Files with Conflicts (17 total)

### Documentation Conflicts (5 files)
1. ✅ `DEVELOPMENT_RUNBOOK.md`
2. ✅ `POKE_SIM_DB_INTEGRATION_PLAN_v2.md`
3. ✅ `POKE_SIM_DB_INTEGRATION_TDD_PLAN.md`
4. ✅ `README.md`
5. ✅ `ROADMAP.md`

### Database Conflicts (3 files)
6. ✅ `poke-sim/db/README_DB.md`
7. ✅ `poke-sim/db/migrations/2026_05_24_align_shared_29_team_catalog.sql` (both added)
8. ✅ `poke-sim/db/migrations/2026_05_24_upsert_seed_teams_v2_repair.sql` (both added)

### Source Code Conflicts (6 files)
9. ✅ `poke-sim/pokemon-champion-2026.html` (bundle - REBUILD REQUIRED)
10. ✅ `poke-sim/style.css`
11. ✅ `poke-sim/sw.js` (service worker cache version)
12. ✅ `poke-sim/tools/build-bundle.py`
13. ✅ `poke-sim/tests/db_m1_wiring_tests.js`
14. ✅ `poke-sim/tests/README.md`

### Test/Report Conflicts (3 files - both added)
15. ✅ `poke-sim/reports/ability_coverage_audit.md`
16. ✅ `poke-sim/tests/ability_coverage_audit_tests.js`
17. ✅ `poke-sim/tests/fixtures/ability_gap_classification.json`

---

## ✅ Auto-Merged Files (9 files - no action needed)

- `.github/workflows/pages.yml`
- `poke-sim/docs/SPECS_INDEX.md`
- `poke-sim/legality.js`
- `poke-sim/ui.js` ✅ (auto-merged successfully!)
- `poke-sim/tests/champion_pack_legality_tests.js` (new)
- `poke-sim/tests/t94_team_grid_xss_tests.js`
- `poke-sim/tools/generate-pokemon-data-audit.js` (new)
- `poke-sim/tools/generate-pokemon-stats-validation.mjs` (new)
- `poke-sim/db/migrations/2026_05_24_fix_champions_arena_2nd_item_clause.sql` (new)

---

## 🎯 Conflict Resolution Strategy

### Priority 1: Accept Y Factor's Version (Theirs)
These files should use Y Factor's version as the source of truth:

```bash
# Documentation - Y Factor is more current
git checkout --theirs DEVELOPMENT_RUNBOOK.md
git checkout --theirs README.md
git checkout --theirs ROADMAP.md

# Database migrations - Y Factor canonical
git checkout --theirs poke-sim/db/README_DB.md
git checkout --theirs poke-sim/db/migrations/2026_05_24_align_shared_29_team_catalog.sql
git checkout --theirs poke-sim/db/migrations/2026_05_24_upsert_seed_teams_v2_repair.sql

# Style - Y Factor has latest mobile fixes
git checkout --theirs poke-sim/style.css

# Test/Report files - Y Factor has complete ability coverage audit
git checkout --theirs poke-sim/reports/ability_coverage_audit.md
git checkout --theirs poke-sim/tests/ability_coverage_audit_tests.js
git checkout --theirs poke-sim/tests/fixtures/ability_gap_classification.json

# Mark as resolved
git add DEVELOPMENT_RUNBOOK.md README.md ROADMAP.md \
        poke-sim/db/README_DB.md \
        poke-sim/db/migrations/2026_05_24_align_shared_29_team_catalog.sql \
        poke-sim/db/migrations/2026_05_24_upsert_seed_teams_v2_repair.sql \
        poke-sim/style.css \
        poke-sim/reports/ability_coverage_audit.md \
        poke-sim/tests/ability_coverage_audit_tests.js \
        poke-sim/tests/fixtures/ability_gap_classification.json
```

### Priority 2: Manual Merge Required

#### `POKE_SIM_DB_INTEGRATION_PLAN_v2.md`
**Strategy**: Merge both versions - Y Factor has updates, Alfredo has sync notes
- Keep Y Factor's technical content
- Preserve Alfredo's 2026-05-24 sync notes at top
- Update "Last updated" date to 2026-05-30

#### `POKE_SIM_DB_INTEGRATION_TDD_PLAN.md`
**Strategy**: Accept Y Factor's version (likely more current)
```bash
git checkout --theirs POKE_SIM_DB_INTEGRATION_TDD_PLAN.md
git add POKE_SIM_DB_INTEGRATION_TDD_PLAN.md
```

#### `poke-sim/sw.js` (Service Worker)
**Strategy**: Accept Y Factor's CACHE_NAME, then bump to next version
```bash
git checkout --theirs poke-sim/sw.js
# Then manually edit to bump cache version if needed
# Current Y Factor: champions-sim-v??-???
# Bump to: champions-sim-v16-sync-2026-05-30
git add poke-sim/sw.js
```

#### `poke-sim/tools/build-bundle.py`
**Strategy**: Accept Y Factor's version (has latest build improvements)
```bash
git checkout --theirs poke-sim/tools/build-bundle.py
git add poke-sim/tools/build-bundle.py
```

#### `poke-sim/tests/db_m1_wiring_tests.js`
**Strategy**: Accept Y Factor's version
```bash
git checkout --theirs poke-sim/tests/db_m1_wiring_tests.js
git add poke-sim/tests/db_m1_wiring_tests.js
```

#### `poke-sim/tests/README.md`
**Strategy**: Merge both - Y Factor has new tests, Alfredo may have notes
```bash
git checkout --theirs poke-sim/tests/README.md
git add poke-sim/tests/README.md
```

### Priority 3: Rebuild After Resolution

#### `poke-sim/pokemon-champion-2026.html` (Bundle)
**Strategy**: Accept Y Factor's version, then rebuild to ensure consistency
```bash
# Accept Y Factor's bundle first
git checkout --theirs poke-sim/pokemon-champion-2026.html
git add poke-sim/pokemon-champion-2026.html

# After all conflicts resolved, rebuild:
cd poke-sim
python tools/build-bundle.py
cd ..
git add poke-sim/pokemon-champion-2026.html
```

---

## 🚀 Step-by-Step Resolution Commands

### Step 1: Accept Y Factor's versions for straightforward files
```bash
git checkout --theirs DEVELOPMENT_RUNBOOK.md
git checkout --theirs README.md
git checkout --theirs ROADMAP.md
git checkout --theirs POKE_SIM_DB_INTEGRATION_TDD_PLAN.md
git checkout --theirs poke-sim/db/README_DB.md
git checkout --theirs poke-sim/db/migrations/2026_05_24_align_shared_29_team_catalog.sql
git checkout --theirs poke-sim/db/migrations/2026_05_24_upsert_seed_teams_v2_repair.sql
git checkout --theirs poke-sim/style.css
git checkout --theirs poke-sim/sw.js
git checkout --theirs poke-sim/tools/build-bundle.py
git checkout --theirs poke-sim/tests/db_m1_wiring_tests.js
git checkout --theirs poke-sim/tests/README.md
git checkout --theirs poke-sim/reports/ability_coverage_audit.md
git checkout --theirs poke-sim/tests/ability_coverage_audit_tests.js
git checkout --theirs poke-sim/tests/fixtures/ability_gap_classification.json
git checkout --theirs poke-sim/pokemon-champion-2026.html

git add DEVELOPMENT_RUNBOOK.md README.md ROADMAP.md \
        POKE_SIM_DB_INTEGRATION_TDD_PLAN.md \
        poke-sim/db/README_DB.md \
        poke-sim/db/migrations/2026_05_24_align_shared_29_team_catalog.sql \
        poke-sim/db/migrations/2026_05_24_upsert_seed_teams_v2_repair.sql \
        poke-sim/style.css \
        poke-sim/sw.js \
        poke-sim/tools/build-bundle.py \
        poke-sim/tests/db_m1_wiring_tests.js \
        poke-sim/tests/README.md \
        poke-sim/reports/ability_coverage_audit.md \
        poke-sim/tests/ability_coverage_audit_tests.js \
        poke-sim/tests/fixtures/ability_gap_classification.json \
        poke-sim/pokemon-champion-2026.html
```

### Step 2: Manual merge for POKE_SIM_DB_INTEGRATION_PLAN_v2.md
**Action Required**: Open file in editor and manually merge
- Keep Y Factor's technical updates
- Preserve Alfredo's sync notes
- Update date to 2026-05-30

### Step 3: Verify service worker cache version
```bash
# Check current cache name in sw.js
grep "CACHE_NAME" poke-sim/sw.js
# If needed, manually bump version
```

### Step 4: Rebuild bundle
```bash
cd poke-sim
python tools/build-bundle.py
cd ..
git add poke-sim/pokemon-champion-2026.html
```

### Step 5: Add untracked Alfredo-specific files
```bash
git add .windsurf/plans/sync-yfactor-2026-05-30.md
git add .windsurf/plans/conflict-resolution-guide-2026-05-30.md
# Note: M8 files are WIP, decide if they should be included
```

### Step 6: Commit the merge
```bash
git commit -m "sync: resolve merge conflicts and regenerate artifacts

- Accept Y Factor's versions for documentation, DB migrations, styles
- Manually merge POKE_SIM_DB_INTEGRATION_PLAN_v2.md
- Rebuild bundle from Y Factor source
- Preserve Alfredo-specific sync notes and plans

Merged commits: 71 from Y Factor main
New features: Battle Sensei, replay review, role-aware coaching
Bug fixes: regional forms, replay scoring, item clause
"
```

### Step 7: Verify merge
```bash
git status  # Should show clean working tree
git log --oneline -5  # Verify merge commit
```

---

## 🧪 Post-Merge Testing Checklist

### Build Verification
```bash
cd poke-sim

# Rebuild bundle
python tools/build-bundle.py

# Check bundle size
ls -lh pokemon-champion-2026.html
# Expected: < 1 MB
```

### Test Suite
```bash
# Engine tests
node tests/items_tests.js
node tests/status_tests.js
node tests/mega_tests.js
node tests/coverage_tests.js

# DB tests
bash tests/_run_all_db.sh

# New ability coverage tests
node tests/ability_coverage_audit_tests.js

# Champion pack legality
node tests/champion_pack_legality_tests.js
```

### Smoke Test
```bash
npx serve .
# Open http://localhost:3000
# Test:
# - Simulator tab works
# - Battle Sensei tab appears (NEW!)
# - Replay review works (NEW!)
# - Teams load correctly
# - No console errors
```

---

## 📝 Files to Update After Merge

### `MASTER_PROMPT.md` (root)
Add entry to Team Changelog:
```markdown
| 2026-05-30 | @alfredocox | Sync Y Factor main (71 commits) | Battle Sensei replay review, role-aware coaching, regional form fixes, replay URL support. Merged via PR #XXX. |
```

### `poke-sim/sw.js`
Bump CACHE_NAME if not already done:
```javascript
const CACHE_NAME = 'champions-sim-v16-sync-2026-05-30';
```

---

## ⚠️ Known Issues to Watch For

### Bundle Size
- Y Factor bundle may be larger due to Battle Sensei features
- Verify < 1 MB after rebuild
- If > 1 MB, may need to optimize

### Cache Version
- Ensure cache version is bumped
- Old cache may cause stale UI

### Golden Battle Hashes
- Alfredo's golden hashes may differ from Y Factor
- If tests fail, regenerate: `node tests/golden_battles_runner.js --generate`

### DB Seed Alignment
- Both repos should now have 29-team seed
- Verify with: `grep "INSERT INTO teams" poke-sim/db/seed_teams_v2.sql | wc -l`

---

## 🎯 Success Criteria

- [ ] All 17 conflicts resolved
- [ ] Bundle rebuilt successfully
- [ ] Bundle size < 1 MB
- [ ] All engine tests pass (343+ cases)
- [ ] All DB tests pass (68/68 cases)
- [ ] New ability coverage tests pass
- [ ] Local smoke test passes
- [ ] No console errors in browser
- [ ] Battle Sensei tab visible and functional
- [ ] Service worker cache version bumped
- [ ] MASTER_PROMPT.md updated with sync log

---

## 📞 If You Get Stuck

### Abort and Start Over
```bash
git merge --abort
git checkout main
git branch -D sync/yfactor-main-2026-05-30
# Then restart from Step 1 in main sync plan
```

### Get Help
- Check Y Factor's recent PRs for context on changes
- Review previous sync PRs: #230, #232
- Consult `poke-sim/db/README_DB.md` for DB alignment rules

---

**Status**: Ready for execution
**Created**: 2026-05-30
**Last Updated**: 2026-05-30
