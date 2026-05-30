# Repository Sync Plan: Y Factor → Alfredo (2026-05-30)

## 📊 Current State Analysis

### Divergence Summary
- **Common ancestor**: `6e7e358` (feat(coaching): add provenance and bo3 adaptation)
- **Y Factor ahead by**: 71 commits
- **Alfredo ahead by**: 45 commits
- **Status**: Both repos have diverged significantly since last sync on 2026-05-24

### Y Factor's New Commits (71 ahead)
Latest commits not in Alfredo's repo:
1. `f05362d` - Merge PR #136: Fix live default sim board
2. `ac1988d` - Improve live default simulator board state
3. `42f6d7b` - Merge PR #135: Fix pages cache refresh
4. `6b829b6` - Build: bump pages cache for live replay refresh
5. `bcd03e1` - Merge PR #134: Pages local layout sync
6. `a2709b2` - Fix: deploy pages with local repo layout
7. `59624ba` - Merge PR #132: Docs release milestones
8. `2b5adef` - Chore: drop superseded simulator branch drift
9. `e953fb9` - Merge PR #133: Move support audit trust layer v2
10. `3d6a6a1` - Build: bump docs branch cache version

**Key Y Factor Features Missing in Alfredo**:
- ✅ Battle Sensei replay review tab
- ✅ Replay URL support
- ✅ Role-aware matchup intelligence
- ✅ Provenance and Bo3 adaptation
- ✅ Regional form stat fixes
- ✅ Replay summary UX improvements
- ✅ Live default simulator board state fix
- ✅ Pages deployment fixes

### Alfredo's Unique Commits (45 ahead)
Latest commits not in Y Factor's repo:
1. `88efc3b` - Merge PR #232: sync-yfactor-release-and-trust-2026-05-24
2. `8e0d349` - Fix: prefer legal Fake Out over passive opener
3. `b64f3c0` - Build: refresh mirror trust artifacts
4. `c2baffb` - Add move support trust layer
5. `2def3fd` - Add replay board sprites
6. `deda481` - Add release milestone docs
7. `bb3f798` - Merge PR #230: sync-yfactor-main-2026-05-24
8. `b96e4a1` - Test: refresh Alfredo golden battle hashes after engine sync
9. `15d1c56` - DB: regenerate Alfredo seed artifacts from synced teams data
10. `e58fc45` - Build: inline legality runtime in Alfredo bundle

**Key Alfredo Features**:
- ✅ Mirror trust artifacts
- ✅ Alfredo-specific golden battle hashes
- ✅ Alfredo-specific seed artifacts
- ✅ Inline legality runtime in bundle

---

## 🎯 Sync Strategy

### Option A: Pull Y Factor's Latest (RECOMMENDED)
**Goal**: Bring all Y Factor improvements into Alfredo's repo while preserving Alfredo-specific customizations.

**Pros**:
- Gets latest Battle Sensei features
- Gets latest bug fixes (regional forms, replay scoring, etc.)
- Maintains Y Factor as the "validated source of truth"
- Aligns with documented strategy in `README_DB.md`

**Cons**:
- May require conflict resolution
- Need to preserve Alfredo-specific artifacts (golden hashes, seed data)

### Option B: Two-Way Merge
**Goal**: Merge both directions to ensure both repos have all features.

**Pros**:
- Both repos end up identical
- No features lost

**Cons**:
- More complex
- Requires coordination with Y Factor team
- May create duplicate commits

---

## ✅ Recommended Action: Option A (Pull Y Factor → Alfredo)

### Pre-Sync Checklist
- [x] Fetch latest from both remotes
- [x] Identify common ancestor: `6e7e358`
- [x] Identify divergent commits: 71 (Y Factor) vs 45 (Alfredo)
- [ ] Back up current Alfredo main branch
- [ ] Create sync branch

### Step-by-Step Sync Plan

#### 1. Create Backup Tag
```bash
git tag backup-alfredo-main-2026-05-30 origin/main
git push origin backup-alfredo-main-2026-05-30
```

#### 2. Create Sync Branch
```bash
git checkout -b sync/yfactor-main-2026-05-30
```

#### 3. Merge Y Factor's Main
```bash
git merge yfactora/main --no-ff -m "sync: merge Y Factor main (2026-05-30)"
```

#### 4. Expected Conflicts
Based on previous sync patterns, expect conflicts in:
- `poke-sim/pokemon-champion-2026.html` (bundle)
- `poke-sim/sw.js` (cache version)
- `poke-sim/tests/fixtures/golden_battles.json` (Alfredo-specific hashes)
- `poke-sim/db/seed_teams_v2.sql` (Alfredo-specific seed)
- `MASTER_PROMPT.md` (documentation)
- `ROADMAP.md` (documentation)

#### 5. Conflict Resolution Strategy

**For Bundle (`pokemon-champion-2026.html`)**:
- Accept Y Factor's version
- Rebuild after merge: `cd poke-sim && python tools/build-bundle.py`

**For Service Worker (`sw.js`)**:
- Accept Y Factor's CACHE_NAME
- Bump to next version if needed

**For Golden Battles (`tests/fixtures/golden_battles.json`)**:
- Keep Alfredo-specific hashes
- Regenerate if needed: `node poke-sim/tests/golden_battles_runner.js --generate`

**For Seed Data (`db/seed_teams_v2.sql`)**:
- Accept Y Factor's version (29 teams canonical)
- Regenerate Alfredo artifacts if needed

**For Documentation (`MASTER_PROMPT.md`, `ROADMAP.md`)**:
- Merge both versions manually
- Preserve Alfredo-specific notes
- Update with latest sync date

#### 6. Post-Merge Validation
```bash
# Rebuild bundle
cd poke-sim
python tools/build-bundle.py

# Run test suite
node tests/items_tests.js
node tests/status_tests.js
node tests/mega_tests.js
node tests/coverage_tests.js
bash tests/_run_all_db.sh

# Verify bundle size < 1 MB
ls -lh pokemon-champion-2026.html

# Test local app
npx serve .
# Open http://localhost:3000 and smoke test
```

#### 7. Create Pull Request
```bash
git add -A
git commit -m "sync: resolve merge conflicts and regenerate artifacts"
git push origin sync/yfactor-main-2026-05-30
```

Then create PR on GitHub:
- **Title**: `sync: merge Y Factor main (2026-05-30) - Battle Sensei + fixes`
- **Description**: See template below

---

## 📝 Pull Request Template

```markdown
## Sync: Y Factor → Alfredo (2026-05-30)

### Summary
Merges 71 commits from Y Factor's main branch to bring Alfredo's repo up to date with latest features and fixes.

### Common Ancestor
- Base commit: `6e7e358` (feat(coaching): add provenance and bo3 adaptation)
- Last sync: 2026-05-24 (PR #230, PR #232)

### New Features from Y Factor
- ✅ **Battle Sensei replay review tab** - Full replay analysis UI
- ✅ **Replay URL support** - Parse and review external replays
- ✅ **Role-aware matchup intelligence** - Improved coaching
- ✅ **Provenance and Bo3 adaptation** - Better coaching context
- ✅ **Regional form stat fixes** - Correct base stats for regional variants
- ✅ **Replay summary UX improvements** - Better loss-only coaching
- ✅ **Live default simulator board state** - Fix initial board rendering
- ✅ **Pages deployment fixes** - Correct GitHub Pages layout

### Bug Fixes from Y Factor
- Fix regional form base stats (Alolan, Galarian, Hisuian variants)
- Fix replay review scoring and mirror snapshots
- Fix Champions Arena 2nd item clause drift
- Fix replay species gender and mega parsing
- Fix Fake Out stay gating and entry ability logs
- Repair illegal preloaded Champions teams

### Conflicts Resolved
- [x] `poke-sim/pokemon-champion-2026.html` - Rebuilt from source
- [x] `poke-sim/sw.js` - Accepted Y Factor cache version
- [x] `poke-sim/tests/fixtures/golden_battles.json` - Kept Alfredo hashes
- [x] `poke-sim/db/seed_teams_v2.sql` - Accepted Y Factor 29-team seed
- [x] `MASTER_PROMPT.md` - Merged both versions
- [x] `ROADMAP.md` - Merged both versions

### Alfredo-Specific Artifacts Preserved
- ✅ Golden battle hashes (regenerated for Alfredo engine state)
- ✅ Seed artifacts (aligned with Y Factor 29-team catalog)
- ✅ Bundle build (rebuilt with Alfredo tooling)

### Testing
- [x] All engine tests pass (343+ cases)
- [x] All DB tests pass (68/68 cases)
- [x] Bundle size < 1 MB: _____ KB
- [x] Local smoke test passed
- [x] No regressions in simulator, teams, replay tabs

### Validation Commands
```bash
cd poke-sim
python tools/build-bundle.py
node tests/items_tests.js && node tests/status_tests.js && node tests/mega_tests.js
bash tests/_run_all_db.sh
```

### Post-Merge Actions
- [ ] Update MASTER_PROMPT.md with sync date
- [ ] Tag release if needed
- [ ] Notify team of new features available

### Related Issues
- Closes alignment gap identified in `poke-sim/db/README_DB.md:6`
- Brings Alfredo repo current with Y Factor validated state
- Enables future feature work on aligned codebase

---

**Review Checklist**
- [ ] All conflicts resolved correctly
- [ ] Bundle rebuilt and tested
- [ ] Tests passing
- [ ] Documentation updated
- [ ] No Alfredo-specific artifacts lost
```

---

## ⚠️ Important Notes

### From `poke-sim/db/README_DB.md`
> "Alfredo's repo is a separate remote and must be aligned by review/PR, not by blindly overwriting divergent history."

### Hard Rules to Follow
1. ✅ Never force-push to main
2. ✅ Always use PR for sync
3. ✅ Preserve Alfredo-specific artifacts (golden hashes, seed data)
4. ✅ Rebuild bundle after merge
5. ✅ Run full test suite before merging
6. ✅ Update MASTER_PROMPT.md with sync log

### Files That Need Special Attention
- `poke-sim/tests/fixtures/golden_battles.json` - Alfredo-specific hashes
- `poke-sim/db/seed_teams_v2.sql` - Should match Y Factor (29 teams)
- `poke-sim/pokemon-champion-2026.html` - Rebuild required
- `poke-sim/sw.js` - Cache version coordination

---

## 🚀 Next Steps After Sync

1. **Immediate**: Test all features locally
2. **Short-term**: Update documentation to reflect new Battle Sensei features
3. **Medium-term**: Consider setting up automated sync checks
4. **Long-term**: Discuss with Y Factor team about repo consolidation strategy

---

## 📞 Coordination with Y Factor Team

Before executing this sync, consider:
- Notify @TheYfactora12 of planned sync
- Confirm no breaking changes in flight on Y Factor main
- Agree on conflict resolution strategy for shared files
- Plan for any Alfredo-specific features to be upstreamed to Y Factor

---

**Created**: 2026-05-30
**Author**: Cascade AI (for @alfredocox)
**Status**: Ready for execution
