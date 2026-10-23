# Bounded weather ability lifecycle repair

The candidate routes Drizzle, Drought, Sand Stream and Snow Warning through
effective ability suppression. Ending the last Neutralizing Gas restarts only
weather setters, in Speed order, excluding active Ability Shield holders. The
same weather does not refresh its duration. Gas departure is processed before
incoming entry; move-caused fainting resolves before the next action. Simultaneous
Gas KOs share one restoration, and weather restored during residual processing
retains its initial duration until the next turn's weather tick.

Source: pinned Showdown9b136a8c8cdb860a8ab96fa063f906604e352547,
data/abilities.ts neutralizinggas.onEnd and the four setter onStart handlers;
sim/field.ts setWeather; sim/battle.ts faintMessages. Executable synthetic
Champions custom doubles comparisons are reference evidence, not official M-C
legality or client proof. The source's explicit switch-order FIXME also restores
weather when one Gas switches directly into another; this is a named reference
limitation, not a current-client claim.

The original38ec157/aba6fd33 Drizzle counterexamples are retained. New probes
compare initial weather, duration, charge, SpA, PP, actual KO/switch traces and
setter HP. Both sides, four setters, Shield present/consumed, two Gas users,
re-entry and competing weather are included. Independent review added real burn
KO duration and double-Gas Earthquake KO controls; original failures are retained
alongside repaired results. Reversal controls protect the named rules.

Unresolved: physical U-turn into Ice under snow gave24extra damage locally in four
Shield/pivot/re-entry probes. Those original failures remain preserved; activation
fixtures pivot into a neutral partner to separate that damage defect. Transformed
or copied Gas, unrelated entry hooks, full residual speed ordering, weather rocks
and every mixed ability interaction are not certified. Public Fly stays blocked.

This changes runtime dependencies and therefore stales historical tracker results.
Fresh dated captures and independent review must precede re-enrollment. Exact
local, clean-checkout and hosted outcomes belong to the generated lifecycle export.
No merge, production publication, database mutation or watcher enablement.

## Frozen runtime and fresh evidence

Runtime commit: 6bfd980f03380ad6663f3da974ba4f4f0e52ae52. The focused suite passed
140 assertions against both installed and pinned current references; independent
review retained exact engine hashes and the residual/simultaneous counterexamples.
Current capture has 130 passing comparisons plus two matching simultaneous-KO
sequences. Baseline engine aba6fd33 reproduces 88 failures / 42 controls under
that same harness; baseline receipt explicitly names other current harness inputs.
These are synthetic pinned-reference cases, not current-client proof.

The v9 dated tracker has six current bounded passes, 43 stale historical versions
and six blocked attempts. New current/history export identity is
62cbc48216423a313b820d4ee6aa8c6c7f74fa19b807621885ff83021604de6d.
The six cases retain their narrow scopes; weather cases are separate reviewed
receipts, not blanket checked-off moves. Aggregate, clean-checkout and exact-head
hosted completion must still be recorded in lifecycle evidence before completion.
