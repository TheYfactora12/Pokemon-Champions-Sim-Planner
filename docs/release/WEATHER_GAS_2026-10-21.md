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
