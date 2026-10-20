# Shared switch-out hooks — 2026-10-20

Local v2.2.223-switch-hooks / engine1.1.27 component; no publication.
The new 36-case baseline failed18 cases before repair: Natural Cure left status
behind on successful U-turn and Regenerator healed under active Neutralizing Gas.
`hooks-before.log` retains failures. Natural Cure now clears status and associated
sleep/freeze/toxic counters and records a stable effect event. The onSwitchOut
hook gate respects living active Gas and intact versus consumed Ability Shield.

Expanded reference suite64/64: both sides x Natural Cure/Regenerator x normal,
Gas, intact Shield, consumed Shield x burn/poison/toxic/no-status. Each uses an
actual successful pinned U-turn then replacement, original input and both logs.
Retained evidence: poke-sim/artifacts/switch-out-hooks/. The referenceIdentity pin
and local source hashes are saved in each artifact. No RNG-stream equivalence claim.
Diagnostic suite63/63 additionally proves Natural Cure sleep/freeze/paralysis
switch-out; this justified admitting that ability to the development allowlist.
Incoming sleeping/frozen members still reject; simultaneous switching/Mega and
other unsupported contexts remain rejected.

Independent battle_review_v216 verification passed64/64 and63/63. This does not
prove general ability suppression, suppression of Gas itself, arbitrary item
inhibition or official Champions client parity. Final aggregate, resilience and
browser receipts belong to the consolidated continuation report.
