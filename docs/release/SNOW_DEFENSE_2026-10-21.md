# Bounded snow Defense repair

The candidate applies snow's 1.5x modifier to an Ice target's defensive Defense,
after stage handling, using fixed-point half-down rounding. It includes special
moves that explicitly target Defense and does not boost Body Press's offensive
Defense. Cloud Nine/Air Lock now use effective ability under Neutralizing Gas;
active Ability Shield preserves them and consumed Shield does not.

Pinned executable reference: Showdown9b136a8c8cdb860a8ab96fa063f906604e352547,
data/conditions.ts704–707, sim/battle-actions.ts1727–1763 and
sim/battle.ts2348–2358. Synthetic Champions custom doubles are reference evidence,
not current-client or legal-team certification.

The original maximum U-turn discrepancy is74local/50reference. Both-side
fail-before inputs and all16roll outputs are retained in
poke-sim/reports/snow-defense-2026-10-21/fail-before.json. Focused tests compare
exact damage, stages, criticals, current typing, Defense override moves,
stage-zero Eviolite, effective suppression and reversal controls. Independent
review challenged the initial patch and exposed the combined Gas/suppression
failure, now included in the owning suite.

Unresolved boundaries are preserved rather than certified: Eviolite plus negative
Defense stages has a pre-existing truncation error (Snover95/-1 snow reference
44–52 versus42–50); clear weather also differs. Bug-versus-Poison resistance is
missing from the existing local type chart (U-turn/Venusaur62–74 versus31–37).
Tera-specific behavior, all mixed suppression/restoration sequences, full paired
format/spread coverage and client proof remain unverified. Fly/Eject Button stays
separate and public Fly remains rejected. No golden approval or live change.

Runtime changes stale earlier bounded receipts. Fresh capture, independent review,
canonical export, clean checks and exact-head hosted CI are required before this
draft checkpoint completes. Actual hosted preview, production smoke and rollback
remain separate gates; the prepared previous preview is not automatically updated
or published by this change.
