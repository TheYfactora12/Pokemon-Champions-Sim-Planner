# Fake Out / Struggle bounded repair evidence

Exact reference: Pokemon Showdown commit 9b136a8c8cdb860a8ab96fa063f906604e352547, actual Champions doubles mod asserted by independent reviewer. Synthetic shared-mechanics fixtures; no client certification or team legality claim.

Source distinction: data/mods/champions/moves.ts Fake Out onDisableMove disables after activeMoveActions; inherited data/moves.ts onTry rejects late execution. data/conditions.ts choicelock disables other moves. Request-time absence of usable moves selects Struggle; a late injected Fake Out execution fails and does not manufacture a second attack.

Repair: engine injected late Fake Out now records failure then returns. Default policy usable() respects spent Fake Out before Encore/Choice early returns; disabled Choice-locked Fake Out cannot escape into Tackle. General Choice handling remains outside this correction.

Fail-first evidence: fakeout-failfirst.log (B3/B4/B5 fail), fakeout-encore-failfirst.log, fakeout-choice-failfirst.log. Initial aggregate preserved as v239-project-before-fakeout-fix.log. t9j17 behavior controls subsequently pass 48/48; default policy 4 groups and 40 mutation runs pass, both sides including fresh Fake Out positive and consumed Scarf/Klutz unlock controls.

Independent executable receipts at task-2/fakeout-independent-9b.json and task-2/fakeout-choice-independent-9b.json include both orientations, raw logs and request state. Reviewer independently reran local48 and policy controls and accepted final correction.

Methodology stale anchor repair: struggle_fixed injects quarter-target-HP damage into captureBattleDamageImpl; numerical mutant assertion remains actual38 versus expected29, two failures. Full23 methodology tests passed before Fake Out correction; final combined175+23 rerun recorded separately.

No installed reference changes, golden regeneration, version changes, commit or publication by this agent.
