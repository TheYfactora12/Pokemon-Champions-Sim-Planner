# Live Beta Player Journey

Tested production v176 through visible controls on October 5. One doubles
practice Bo1, one series: Mega Altaria versus Mega Dragonite, four-turn win.
Seed from download filename: 4109855487,613218595,2947026012,414412668.
No subsequent battle or team swap was run while export pairing was blocked.

## What Worked

- Practice/unverified regulation warning visible before running.
- Run Selected Matchup produced a result and View Replay opened the saved card.
- All four turn texts inspected: Fake Out immunity, Focus Sash, damage/HP,
  Leftovers, weather duration, faints and replacements were visible.
- Pilot Notes identifies one series/one game and warns against competitive
  matchup-strength inference. This is useful context for interpreting a sample.
- Team Export opens six-member text with items, moves, abilities and spreads.
- Phone simulator page at 390x844: client width385, scroll width385.

## Findings And Limits

1. Mobile Set Editor after selecting Typhlosion-Hisui: client385, scroll425.
   Move comboboxes/stat panel/SP inputs extend beyond the content width.
   No edits saved; draft cancelled. Beta blocker: fix and verify save/reload.
2. Download JSON and its visible fallback link were clicked; tool download
   timed out and exact filename was absent from Downloads. User confirmation
   requested. Export/visible pairing NOT performed; no mechanics pass claimed.
3. Turn2 Weather Ball shows a move line without its own visible outcome; Protect
   was shown earlier. Investigate message deduplication versus missing evidence
   using the JSON before diagnosing mechanics.
4. Compact Score percentages remain easier to misread as probabilities than
   the longer heuristic disclaimer. Prefer explicit heuristic labeling nearby.
5. Team export labels 66-point spreads as EVs, while editor calls them SPs.
   Check cross-tool interpretation and importer contract before changing format.
6. Phone screenshot shows subdued move/item text and a tall navigation/header
   stack. Qualitative readability concern, not a measured contrast-compliance fail.

## Value Assessment

Useful as an experimental battle-inspection tool: the result gives a concrete
sequence to review. Not yet proven as reliable competitive team optimization.
One win does not establish team strength, correct mechanics or user satisfaction.
Keep Preview until remaining beta journeys and evidence gaps are dispositioned.
No old-cache migration, export/import round trip, mobile save/reload, external
oracle comparison or complete battle-state parity was proved in this pass.
