# Hybrid DB Architecture: Showdown Game Data + Custom Team Management

This plan establishes a hybrid database architecture where **game data** (Pokemon stats, moves, items, abilities) is sourced from Showdown's CDN via daily sync to read-only Supabase tables, while **team data** remains in user-controlled Supabase tables with full CRUD operations.

---

## Architecture Overview

### **Two-Layer Data Model**

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  (engine.js, ui.js, data.js - runtime consumption)          │
└──────────────────┬──────────────────────┬───────────────────┘
                   │                      │
         ┌─────────▼──────────┐  ┌───────▼────────────┐
         │  GAME DATA LAYER   │  │  TEAM DATA LAYER   │
         │  (Read-Only)       │  │  (Read-Write)      │
         └─────────┬──────────┘  └────────┬───────────┘
                   │                      │
    ┌──────────────▼──────────┐  ┌────────▼────────────┐
    │ Showdown Sync Tables    │  │ Existing DB Tables  │
    │ - showdown_entities     │  │ - teams             │
    │ - showdown_source_files │  │ - team_members      │
    │ - Generated JS assets   │  │ - analyses          │
    └─────────────────────────┘  └─────────────────────┘
                   │                      │
    ┌──────────────▼──────────┐          │
    │ Showdown CDN (upstream) │          │
    │ - Daily sync via GH     │          │
    │ - pokedex.js, moves.js  │          │
    └─────────────────────────┘          │
                                          │
                               ┌──────────▼──────────┐
                               │ User Input / Import │
                               │ - Pokepaste URLs    │
                               │ - Manual edits      │
                               └─────────────────────┘
```

---

## Module Breakdown

### **Module 1: Showdown Data Sync (Phase 4 - NEW)**
**Status**: Infrastructure exists (Phases 1-3 complete), needs implementation  
**Purpose**: Convert Showdown sync artifacts into consumable game data

#### **Components**
1. **Entity Normalization**
   - Input: Daily sync artifacts from `.github/workflows/showdown-sync.yml`
   - Process: `tools/fetch_showdown_data.mjs` produces normalized JSON
   - Output: Stable entity snapshots in Supabase

2. **Generated Asset Builder**
   - Input: Normalized Showdown entities from Supabase
   - Process: New tool `tools/generate_showdown_data.mjs`
   - Output: `generated/pokemon_showdown_legal_data.js`

3. **Runtime Data Loader**
   - Modify `data.js` to load from generated asset
   - Fallback: Keep current hardcoded data for offline mode
   - Merge strategy: Showdown base + Champions overrides

#### **Files to Create/Modify**
- `poke-sim/tools/generate_showdown_data.mjs` (NEW)
- `poke-sim/generated/pokemon_showdown_legal_data.js` (GENERATED)
- `poke-sim/data.js` (MODIFY - add loader logic)
- `poke-sim/db/migrations/2026_06_06_showdown_entities_tables.sql` (NEW)

#### **Testing Requirements**
- **Unit Tests**: `tests/showdown_data_loader_tests.js`
  - Verify BASE_STATS loaded from generated file
  - Verify POKEMON_TYPES_DB loaded correctly
  - Verify move data, item data, ability data
  - Verify fallback to hardcoded data when offline
  - Verify Champions overrides applied on top

- **Integration Tests**: `tests/showdown_sync_integration_tests.js`
  - Run full sync workflow
  - Verify generated file determinism
  - Verify engine.js can consume new data format
  - Verify no regressions in battle simulation

---

### **Module 2: Team Data Management (M3 Enhancement)**
**Status**: Partially complete (M3 done), needs enhancement  
**Purpose**: Maintain full CRUD for user teams while consuming Showdown game data

#### **Current State (M3)**
- ✅ `loadTeamsFromDB()` loads teams from Supabase
- ✅ `teams` and `team_members` tables exist
- ✅ UI merges DB teams with hardcoded `TEAMS` array
- ⚠️ Still relies on hardcoded `BASE_STATS` in `data.js`

#### **Enhancement Needed**
1. **Team Validation Against Showdown Data**
   - When user imports/edits team, validate species exists in Showdown data
   - Validate moves are legal for that species (learnsets)
   - Validate items, abilities exist
   - Show warnings for regional form mismatches

2. **Dynamic Team Builder**
   - Species dropdown populated from Showdown entities
   - Move picker filtered by learnsets
   - Item/ability pickers from Showdown data
   - Real-time legality checking

3. **Team Import Enhancement**
   - Pokepaste import validates against Showdown data
   - Auto-resolve regional form names via `aliases.js`
   - Suggest corrections for typos/outdated names

#### **Files to Modify**
- `poke-sim/ui.js` (MODIFY - team builder, validation)
- `poke-sim/supabase_adapter.js` (MODIFY - add validation helpers)
- `poke-sim/legality.js` (MODIFY - use Showdown learnsets)

#### **Testing Requirements**
- **Unit Tests**: `tests/team_validation_tests.js`
  - Verify species validation against Showdown data
  - Verify move legality checking
  - Verify regional form resolution
  - Verify Champions-specific overrides allowed

- **Integration Tests**: `tests/db_m3_enhanced_tests.js`
  - Load teams from DB with Showdown data validation
  - Import Pokepaste with Showdown validation
  - Edit team with real-time legality checks
  - Save team with validated data

---

### **Module 3: Data Merge Strategy**
**Status**: New design needed  
**Purpose**: Merge Showdown base data with Champions-specific overrides

#### **Merge Layers**

```
Layer 1: Showdown Base (Read-Only)
  ↓
Layer 2: Champions Overrides (Curated)
  ↓
Layer 3: Runtime Merge (In-Memory)
  ↓
Application Consumption (engine.js, ui.js)
```

#### **Champions Override Table**
New Supabase table to track intentional differences:

```sql
CREATE TABLE champions_overrides (
  override_id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'pokemon', 'move', 'item', 'ability'
  entity_id TEXT NOT NULL,   -- e.g. 'dragonitemega', 'protect'
  field_name TEXT NOT NULL,  -- e.g. 'base_stats', 'base_power', 'damage_roll'
  showdown_value JSONB,      -- What Showdown says
  champions_value JSONB,     -- What Champions uses
  rationale TEXT NOT NULL,   -- Why we override
  source TEXT,               -- Citation (Game8, RotomLabs, etc.)
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'under_review')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Example Overrides**:
- Damage roll: Showdown `85-100`, Champions `86-100`
- Mega Dragonite stats: Showdown N/A, Champions `91/124/115/145/125/100`
- Mega Drampa stats: Showdown N/A, Champions `78/85/110/160/116/36`

#### **Files to Create/Modify**
- `poke-sim/db/migrations/2026_06_06_champions_overrides_table.sql` (NEW)
- `poke-sim/db/seed_champions_overrides.sql` (NEW)
- `poke-sim/tools/merge_showdown_champions_data.mjs` (NEW)
- `poke-sim/data.js` (MODIFY - apply overrides at runtime)

#### **Testing Requirements**
- **Unit Tests**: `tests/champions_override_tests.js`
  - Verify override application logic
  - Verify Showdown base preserved when no override
  - Verify override precedence order
  - Verify deprecated overrides ignored

- **Integration Tests**: `tests/data_merge_integration_tests.js`
  - Load Showdown data + Champions overrides
  - Verify Mega Dragonite has Champions stats
  - Verify damage roll uses Champions range
  - Verify non-overridden Pokemon use Showdown stats

---

### **Module 4: Offline Fallback Strategy**
**Status**: Design needed  
**Purpose**: Ensure app works without DB connection

#### **Fallback Hierarchy**

1. **Primary**: Showdown data from DB (via generated asset)
2. **Secondary**: Cached generated asset (service worker)
3. **Tertiary**: Hardcoded data.js (current state)

#### **Implementation**
- Service worker caches `generated/pokemon_showdown_legal_data.js`
- On load, try to fetch latest from CDN/DB
- If offline, use cached version
- If cache miss, use hardcoded data.js
- Show UI indicator of data freshness

#### **Files to Modify**
- `poke-sim/sw.js` (MODIFY - cache generated asset)
- `poke-sim/data.js` (MODIFY - fallback logic)
- `poke-sim/ui.js` (MODIFY - show data freshness indicator)

#### **Testing Requirements**
- **Unit Tests**: `tests/offline_fallback_tests.js`
  - Verify fallback to cached asset
  - Verify fallback to hardcoded data
  - Verify freshness indicator updates

- **Integration Tests**: `tests/offline_mode_tests.js`
  - Simulate offline mode
  - Verify app loads with cached data
  - Verify battles run with fallback data

---

### **Module 5: Migration Path**
**Status**: Execution plan  
**Purpose**: Migrate from current hardcoded data to hybrid architecture

#### **Phase 1: Infrastructure (Week 1)**
1. Apply Showdown sync migrations (already done)
2. Create `champions_overrides` table
3. Seed initial Champions overrides
4. Create `showdown_entities` table (Phase 3 follow-up)

#### **Phase 2: Generated Asset Pipeline (Week 2)**
1. Build `tools/generate_showdown_data.mjs`
2. Run first sync to populate entities
3. Generate first `pokemon_showdown_legal_data.js`
4. Verify determinism and correctness

#### **Phase 3: Runtime Integration (Week 3)**
1. Modify `data.js` to load from generated asset
2. Implement Champions override merge
3. Add offline fallback logic
4. Update service worker caching

#### **Phase 4: Team Validation (Week 4)**
1. Enhance `legality.js` with Showdown learnsets
2. Add team builder validation
3. Enhance Pokepaste import
4. Add real-time legality checking

#### **Phase 5: Testing & Rollout (Week 5)**
1. Run full test suite (all modules)
2. Manual QA with Trick Room teams, Mega teams
3. Verify no regressions in battle outcomes
4. Deploy to staging, then production

---

## Testing Matrix

### **Test Categories**

| Category | Test File | Coverage |
|----------|-----------|----------|
| **Showdown Data Loading** | `showdown_data_loader_tests.js` | BASE_STATS, POKEMON_TYPES_DB, moves, items, abilities |
| **Team Validation** | `team_validation_tests.js` | Species, moves, items, abilities, regional forms |
| **Champions Overrides** | `champions_override_tests.js` | Override application, precedence, deprecation |
| **Data Merge** | `data_merge_integration_tests.js` | Showdown + Champions merge, Mega stats, damage rolls |
| **Offline Fallback** | `offline_fallback_tests.js` | Cache, hardcoded fallback, freshness |
| **DB Integration** | `db_m3_enhanced_tests.js` | Team CRUD with Showdown validation |
| **Sync Integration** | `showdown_sync_integration_tests.js` | Full sync workflow, determinism |
| **Regression** | `golden_battles_regression_tests.js` | Verify no battle outcome changes |

### **Acceptance Criteria**

#### **Module 1: Showdown Data Sync**
- [ ] Daily sync runs successfully
- [ ] Generated asset is deterministic (same input = same output)
- [ ] Generated asset includes all required data (stats, moves, items, abilities, type chart, aliases, learnsets)
- [ ] Generated asset size < 500 KB
- [ ] CI blocks release if generated asset is stale

#### **Module 2: Team Data Management**
- [ ] Teams load from DB with Showdown data validation
- [ ] Pokepaste import validates species/moves/items
- [ ] Team builder shows only legal moves for selected species
- [ ] Regional form names auto-resolve via aliases
- [ ] Custom teams save to DB with validation

#### **Module 3: Data Merge Strategy**
- [ ] Champions overrides apply correctly
- [ ] Non-overridden data uses Showdown base
- [ ] Mega Dragonite has Champions stats (91/124/115/145/125/100)
- [ ] Damage roll uses Champions range (86-100)
- [ ] Override table tracks all Champions-specific deltas

#### **Module 4: Offline Fallback**
- [ ] App loads offline with cached generated asset
- [ ] App loads offline with hardcoded data.js fallback
- [ ] UI shows data freshness indicator
- [ ] Service worker caches generated asset

#### **Module 5: Migration Path**
- [ ] All existing teams still work
- [ ] All existing battles produce same outcomes
- [ ] No regressions in golden battles
- [ ] All 343+ engine tests pass
- [ ] All DB tests pass (M1-M9)

---

## File Structure

### **New Files**
```
poke-sim/
├── tools/
│   ├── generate_showdown_data.mjs         (NEW - Phase 4)
│   └── merge_showdown_champions_data.mjs  (NEW - merge logic)
├── generated/
│   └── pokemon_showdown_legal_data.js     (GENERATED - Phase 4)
├── db/
│   ├── migrations/
│   │   ├── 2026_06_06_showdown_entities_tables.sql  (NEW - Phase 3 follow-up)
│   │   └── 2026_06_06_champions_overrides_table.sql (NEW)
│   └── seed_champions_overrides.sql       (NEW)
└── tests/
    ├── showdown_data_loader_tests.js      (NEW)
    ├── team_validation_tests.js           (NEW)
    ├── champions_override_tests.js        (NEW)
    ├── data_merge_integration_tests.js    (NEW)
    ├── offline_fallback_tests.js          (NEW)
    ├── db_m3_enhanced_tests.js            (NEW)
    └── showdown_sync_integration_tests.js (NEW)
```

### **Modified Files**
```
poke-sim/
├── data.js              (MODIFY - load from generated asset, apply overrides)
├── ui.js                (MODIFY - team validation, builder enhancements)
├── supabase_adapter.js  (MODIFY - validation helpers)
├── legality.js          (MODIFY - use Showdown learnsets)
└── sw.js                (MODIFY - cache generated asset)
```

---

## Risk Mitigation

### **Risk 1: Data Freshness**
**Problem**: Showdown data changes, app uses stale data  
**Mitigation**:
- Daily sync with hash verification
- CI blocks release if data > 7 days old
- UI shows data freshness indicator
- Manual sync trigger available

### **Risk 2: Breaking Changes**
**Problem**: Showdown changes data format, breaks parser  
**Mitigation**:
- Parse validation in sync workflow
- Fail job if parse errors
- Store raw source + normalized separately
- Rollback capability via source hashes

### **Risk 3: Champions Overrides Drift**
**Problem**: Override becomes outdated, conflicts with Showdown  
**Mitigation**:
- Track override status (active/deprecated/under_review)
- Validation findings table flags conflicts
- Manual review required for override changes
- Override rationale + source required

### **Risk 4: Performance**
**Problem**: Loading from DB slower than hardcoded data  
**Mitigation**:
- Generated asset is static JS (fast)
- Service worker caches asset
- Lazy load non-critical data
- Benchmark: load time < 100ms

### **Risk 5: Offline Mode**
**Problem**: App breaks without DB connection  
**Mitigation**:
- Three-tier fallback (DB → cache → hardcoded)
- Service worker caches all assets
- Offline indicator in UI
- Test suite includes offline scenarios

---

## Success Metrics

### **Technical Metrics**
- [ ] 100% test coverage for new modules
- [ ] 0 regressions in golden battles
- [ ] Generated asset load time < 100ms
- [ ] Sync workflow success rate > 99%
- [ ] Offline mode works 100% of time

### **User Experience Metrics**
- [ ] Team import success rate > 95%
- [ ] Legality validation accuracy > 99%
- [ ] Data freshness < 24 hours
- [ ] App load time unchanged (< 2s)
- [ ] No user-facing errors from data migration

### **Maintenance Metrics**
- [ ] Manual data updates reduced by 90%
- [ ] Override documentation 100% complete
- [ ] Sync failures auto-reported
- [ ] Rollback capability tested quarterly

---

## Open Questions

1. **Generated Asset Location**: Commit to repo or serve from CDN?
   - **Option A**: Commit `generated/pokemon_showdown_legal_data.js` to repo
   - **Option B**: Serve from Supabase storage, cache in service worker
   - **Recommendation**: Option A for simplicity, Option B for freshness

2. **Override Approval Process**: Who approves Champions overrides?
   - **Recommendation**: Require 2 approvals (Josh + Alfredo or Kevin)

3. **Sync Frequency**: Daily, weekly, or on-demand?
   - **Recommendation**: Daily for data freshness, weekly for full validation

4. **Backward Compatibility**: Support old teams with outdated data?
   - **Recommendation**: Yes, with warnings. Migrate on save.

5. **Champions-Only Pokemon**: How to handle (Mega Dragonite, etc.)?
   - **Recommendation**: Store in `champions_overrides` with full data

---

## Next Steps

1. **Review this plan** with Josh and Kevin
2. **Prioritize modules** (recommend order: 3 → 1 → 2 → 4 → 5)
3. **Create Linear tickets** for each module
4. **Assign ownership** (who builds what)
5. **Set timeline** (5-week estimate, adjust as needed)
6. **Start with Module 3** (Champions overrides table) - smallest, highest value
