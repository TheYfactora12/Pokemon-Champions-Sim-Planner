# Fly implementation containment

Reviewed development checkpoint:146ba91093ad9c0c3c3b7e675850e2e0f5f57475.
The independent focused audit tested312additional complete teams; six accepted by
pinned upstream are explicitly blocked by the simulator because Fly is unsupported:
Drampa, Flapple and four Squawkabilly forms. This is an implementation exclusion,
not a missing catalog entry or proof of official M-C legality.

Both normal-team and forced-action Fly rejection remain required. Removing those
gates merely because Fly exists in the reference catalog would admit unsupported
simulation. A bounded implementation is feasible but requires a separate reviewed
lifecycle change alongside existing charge/target/PP machinery.

Pinned upstream9b136a8c8cdb860a8ab96fa063f906604e352547 sources:
- data/moves.ts:5897, Fly charge and airborne interaction.
- data/conditions.ts:287, two-turn lifecycle.
- data/items.ts:4799, Power Herb.
- data/abilities.ts:2971, No Guard.
No Champions-specific Fly override was found in the inspected source.
These are reference semantics; no current-client observation is enrolled.

Required cases before admission: both sides/slots; charge/release and single PP
spend; hit/miss and Protect; permitted/blocked incoming attacks and No Guard;
Gust/Twister doubled damage; Gravity/Smack Down/Thousand Arrows interruption;
sleep/paralysis/flinch release cancellation; Power Herb/Klutz/Gas; target replacement;
switch/faint cleanup. Existing concealment handling is Phantom Force-specific and
cannot be reused unchanged. Source reading alone does not satisfy these cases.

The focused report and receipt are preserved under
poke-sim/reports/focused-independent-146ba91/. No Fly implementation or admission
change is included in this gap assessment. This preserves the containment while
Struggle and evidence workflow repairs proceed.
