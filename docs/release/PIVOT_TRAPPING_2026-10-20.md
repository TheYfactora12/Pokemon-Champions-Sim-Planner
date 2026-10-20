# Damaging pivots and trapping — October 20, 2026

Local v2.2.219-pivot-traps / engine1.1.23 on `fix/pivot-trapping-current-main`.
Base is reconciled `1cffa63`, which includes current main `ae3f52c` plus the
unmerged PR278 prerequisite and reviewed utility fix. No remote state changed.

## Reproduction and repair

U-turn hit an opposing Shadow Tag holder but `_switchOutActiveMon` then applied
the voluntary-switch trap gate. Reference Champions custom battle allowed the
pivot. The shared caller also handles Flip Turn and Volt Switch.

An explicit `damagePivot` cause now bypasses voluntary trap checks only at that
successful-damage caller. Its living-user, damage-success, available-bench and
Emergency Exit gates remain. Other pivot causes and voluntary-switch admission
are not changed.

Neighboring tests exposed missing Water Absorb against damaging Water moves.
Added its existing `onTryHit` immunity/quarter-HP healing contract, including
active Neutralizing Gas and Ability Shield handling. Shared ability bypass now
honors consumed Shield state and the Mold Breaker/Turboblaze/Teravolt family.
Consumed Shield is a synthetic state boundary, not proof of a gameplay
consumption transition.

## Evidence

- `tests/damage_pivot_trapping_tests.mjs`: 101/101 passed. Both sides/slots,
  Shadow Tag/Mean Look, Protect, Substitute, independently forced miss,
  Rough Skin user KO, no bench, burn/HP/item/PP preservation, entry once,
  no incoming queued action and later attack following the replaced slot.
- Water Absorb: full/partial health, Protect/Substitute, Heal Block, Gas,
  Shield, consumed Shield and three ability bypass names. Exact healing and
  pivot/no-pivot compared; not arbitrary damage or RNG parity.
- Independent reviewer also passed 96 priority-suppression reference cases
  and 35 expanded Mega ability checks, including Emergency Exit cancellation.
- Original failing logs retained locally: `pivot-before.log`, `pivot-after.log`,
  `pivot-shield-before.log`. Final focused log: `pivot-final-focused.log`.
  Fixture mistakes (snapshot zone versus ailment, poisoning Steel-type Scizor)
  were corrected without changing the intended state-persistence assertion.
- Pinned development reference: pokemon-showdown0.11.11,
  `gen9championsdoublescustomgame`; source `moves.js` declares selfSwitch for
  all three attacks; `battle-actions.js` requires a surviving source.
  SHA-256 `dist/sim/battle-actions.js`:
  `cb3871757876c9164698841eb8cf7a7ba48a502d1f10a23458e7cdd51a8cd037`.
  `dist/data/moves.js`:
  `99edf5f35b8f0757102976201fe7af2c84b6b7fcb82c2d53da3f2be9709cca19`.
  `dist/data/mods/champions/moves.js`:
  `4266002af1f3b4bdc05a7ec482412588c3a04cd715f4490bdffd73dd90b9157f`.
- Generated v219 bundle: 11,532,648 bytes, SHA-256
  `88a0458a856d2d9d652122d69bf7d91f90d3311c530648e2b8ae56d2334a7bec`.
  Aggregate/browser/release gates will be recorded against the final overnight
  candidate; this intermediate commit is not a release approval.

## Remaining gates

Rocky Helmet contact damage is not implemented: reference contact KO rows
failed locally and remain a separate finding, not erased by the Rough Skin
control. No claim is made for all items, other pivot moves or suppression.
The fixture is synthetic mechanics evidence, not current Champions client
certification or legal-team approval.

Voluntary switching still has no action-queue/UI implementation. Admission
preparation is not execution support. Needed evidence remains switch versus
move/Mega ordering, simultaneous switches and ties/Trick Room, trapping
exemptions and lifecycle callbacks; the exact capture packet is in
`SWITCHING_INFORMATION_PREPARATION_2026-10-18.md`. Do not silently simulate an
unsupported switch as an ordinary move.
