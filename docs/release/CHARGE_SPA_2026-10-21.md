# Bounded Meteor Beam / Electro Shot repair

Both moves raise Special Attack on preparation, including Power Herb and weather
skips, and do not raise it again on release. A subsequent new use raises it again.
Effective Simple/Contrary respects Neutralizing Gas and Ability Shield. Damage
previews retain their nonmutating contract and do not preview an extra release boost.
Interrupted release clears the stored charge for these two moves.

The eight preserved first-preparation cases reproduce stage0 locally versus stage1
in pinned Champions reference9b136a8, on both sides and active slots. The earlier
Herb repeat-use discrepancy is covered by the same timing repair. The initial new
suite also exposed24 retained-charge interruption mismatches; those counterexamples
are preserved separately, not silently replaced by passing output.
The legacy registry's sleep-pause expectation was explicitly corrected to cancel
and restart preparation on waking, using the pinned causal probes; historical
whole-battle golden expectations were not regenerated or approved.

`tests/charge_spa_timing_tests.mjs` has186 checks, including six missing/delayed/double
boost reversal controls, exact stage/HP/PP/item/charge comparisons, first/release/
repeat use, suppression/caps, rain/Cloud Nine, Protect/miss and causal sleep/freeze/
paralysis/flinch/confusion assertions. `tests/charge_herb_suppression_tests.mjs`
retains91 shared-Herb checks. Executed receipts and actual dates are retained under
`poke-sim/reports/charge-spa-2026-10-21/` when captured.

Sources: immutable upstream `data/moves.ts` Electro Shot onTryMove4642 and Meteor
Beam onTryMove11749 at9b136a8c8cdb860a8ab96fa063f906604e352547. Executable custom
doubles reference probes use synthetic diagnostic teams; they do not prove official
M-C legality, current-client behavior, singles parity or whole-move correctness.
Switching/re-entry, wider target and ability interactions remain outside this scope.
Fly admission, Eject Button, historical golden approvals and sourcewatch settings
are unchanged. Competitive release remains NO-GO.

Engine1.1.43 / shellv2.2.243-charge-spa. Bundle generation retains the unchanged
11MiB limit. Runtime changes invalidate prior bounded claims; a newly dated capture
and independent review are required before the canonical tracker can check them off.
Exact aggregate and hosted outcomes belong to the lifecycle export, not this note.
