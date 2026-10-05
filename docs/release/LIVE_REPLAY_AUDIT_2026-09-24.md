# Live Replay Audit - September 24, 2026

## Scope And Receipt

- URL: https://theyfactora12.github.io/Pokemon-Champions-Sim-Planner/poke-sim/pokemon-champion-2026.html
- Visible build: `v2.2.142-pp-replay-proof`. This is not the newer local candidate.
- Browser-operated run at 15:41 UTC: Doubles, Practice (unverified), Bo1, one series.
- Player: TR Counter Squad; manual leads Incineroar / Arcanine; bench Garchomp / Whimsicott.
- Opponent: Mega Altaria; manual leads Typhlosion-Hisui / Altaria; bench Whimsicott / Rotom-Wash.
- Result: loss, five completed turns, six total fainted participants.
- Inspected all five displayed turns and the expanded raw engine log in the same retained replay.
- One game simulated, one replay retained, zero verified JSON downloads, zero automated visual/JSON pairs. No additional games run after the export blocker.

## Confirmed Display And Persistence Findings

| ID | Evidence | Required fix and acceptance test | State |
| --- | --- | --- | --- |
| LIVE-0924-01 | T1 raw engine log has two `Whimsicott was sent out!` events, one per side. Formatted Battle log shows one. Both boards show a Whimsicott replacement. | Preserve event multiplicity and side/member identity. Regression: two opposing same-species replacements must produce two distinct display events. | Open; reproduced live |
| LIVE-0924-02 | T3 raw engine log records Protect blocking Moonblast and then Flamethrower. Formatted log retains one protection message and ends with an unexplained Flamethrower announcement. T4 raw log has two Whimsicott faints; formatted log retains one. | Do not globally deduplicate event text. Bind defensive outcomes and faints to their individual actions and participants; test repeated Protect outcomes and mirror-species KOs. | Open; reproduced live |
| LIVE-0924-03 | T4 formatted log prints Moonblast damage twice: a structured one-HP damage line followed by the raw one-HP damage line. Raw log contains one move announcement and one damage record. | Coalesce announcement/damage representations by executed action identity, not number of planned same-name moves. Include a same-species opponent KO before its queued action. | Open; reproduced live |
| LIVE-0924-04 | Browser warning at 15:41:34.577Z: `[persistence] saveAnalysis quarantined: missing or conflicting execution provenance`. Saved Analyses does not contain the fresh result. | Diagnose the run's provenance envelope; preserve quarantine rather than weakening it. Add a fresh-run save/reload test with exact execution versions and team identities. | Open; quarantine working, producer cause not established |

Candidate code inspection at `18425c9`: `csRenderReplayPlayByPlay` in `poke-sim/ui.js` still filters repeated non-move text using a global `seen` map (around line 4827). Its move representation limit uses planned action counts (around line 4780). These are concrete candidate regression targets, not evidence of a deployed fix.

## Further Investigations

- Opposing Whimsicott activates Focus Sash at T3 but its subsequent board still lists Focus Sash. Determine whether the snapshot preserves a consumed item, the renderer falls back to the registered item, or the UI lacks a consumed label. Do not infer that the engine granted a second activation.
- Incineroar ends T3 at 97/202 HP after recoil while still showing Sitrus Berry and no healing event. Check recoil-triggered item activation against the pinned reference and exact export before classifying the mechanics fault.
- Arcanine's T1 impact summary omits its lethal 48-HP Hyper Voice damage while showing Focus Blast and recoil. Determine whether the summary is truncated or loses a multi-target event.
- Coaching calls T1 an execution issue and recommends comparing Knock Off with Flare Blitz; this is not independently verified counterfactual advice.

## Export Blocker

Clicked this retained replay's Download JSON button using accessibility and semantic browser actions. A download-event wait timed out; no fresh matching file was found in Downloads or the checked local Codex/temp artifact locations. No browser error explained the export. The browser content-export API is unsupported on this in-app browser.

This does not prove downloads fail in every browser. Do not fabricate a JSON file from visible text or claim ingestion passed. Keep this replay open for a normal-browser/manual download or a supported in-app export recovery. Pair by exact replay seed and roster, not newest filename alone.

## Ordered Next Work

1. Obtain this exact replay export and run `compare-visible-replay.mjs` with a DOM-only visible capture.
2. Add minimal regressions for same-name replacements, Protect outcomes, faints and announced-versus-resolved moves; fix the formatter without changing engine outcomes.
3. Validate consumed-item snapshots and recoil-triggered Sitrus behavior against pinned Showdown; separate renderer defects from mechanics defects.
4. Repair missing execution provenance at the producer and prove save/reload isolation; do not relax the quarantine.
5. Re-run the paired case after changes, then a team-swap continuity case. Only then widen the battle sample.

No runtime fixes, rules approvals, database changes or deployment were made by this audit. It is not M-C legality proof or an accuracy percentage.
