# Live App Fix Plan — Bundle Script-Break Bug

> **Priority:** P0 | **Branch:** `fix/live-app-bundle-script-break` | **Date:** 2026-05-11

---

## Root Cause

`poke-sim/supabase_adapter.js` line 23 contained literal `</script>` in a JS comment. When `build-bundle.py` inlines all JS into one `<script>` block, the HTML parser closes the tag early. Everything after renders as visible text.

---

## Fix (3 files)

### 1. `poke-sim/supabase_adapter.js` (lines 19-23)

Remove `<script>...</script>` HTML tags from comment. Replace with plain comment referencing index.html.

### 2. `poke-sim/tools/build-bundle.py`

Add `sanitize_inline_js(src)` that escapes `</script>` → `<\/script>` in all inlined JS. Defense-in-depth against future occurrences.

### 3. `poke-sim/sw.js`

Bump: `champions-sim-v13-m7-golden-battles` → `champions-sim-v14-fix-bundle-script-break`

---

## Verification

```bash
cd poke-sim && python tools/build-bundle.py
# Expected: Bundle ~928KB

# No stray </script> in JS:
grep -n "//.*</script>" pokemon-champion-2026.html
# Expected: 0 matches

# Legitimate </script> count:
grep -c "</script>" pokemon-champion-2026.html
# Expected: 4
```

Browser smoke test:
- Open `pokemon-champion-2026.html` locally
- No raw JS text visible
- Zero console errors
- Bo1 sim completes
- All tabs functional

---

## Secondary: Placeholder Credentials

Bundle still has `YOUR_PROJECT_REF` / `YOUR_ANON_KEY_HERE` — adapter runs local-only (fail-soft, not a crash). To enable DB: replace with real Supabase project `ymlahqnshgiarpbgxehp` + anon key, or create CI injection script.

---

## Acceptance Criteria

- No raw JS source text visible in browser
- Zero console errors on load
- All 13+ teams in dropdowns
- Bo1/Bo3 sim works
- All tabs functional
- `sw.js` CACHE_NAME bumped
- Bundle < 1 MB
