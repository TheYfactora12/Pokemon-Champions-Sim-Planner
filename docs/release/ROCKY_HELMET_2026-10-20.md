# Rocky Helmet contact damage - October 20, 2026

Local component of v221 / engine 1.1.25. No publication. This component commit
is reviewable separately; the final coordinated candidate owns versioned bundle
and acceptance receipts. Do not publish/cherry-pick an unrebuilt intermediate.

The prior engine omitted Rocky Helmet damage. A corrected admitted reference
fixture failed 14/30 before the item repair (helmet-confirmed-before.log); earlier
fixture attempts failed format/ability validation and are not mechanics proof.
Actual damage now causes floor(user max HP / 6), at least one, per successful
contact hit. Protect, Substitute, consumed item, active Klutz, Protective Pads,
Long Reach and Magic Guard gates are represented. Neutralizing Gas and Ability
Shield combinations have named tests. Item ownership is retained; structured HP
and source identity events record the effect. Contact faint prevents pivoting.

Neighbor multi-hit tests found Double Hit/Double Kick were not routed to the
existing multi-hit executor. Both now use their fixed two-hit count. Independent
review found Skill Link incorrectly overrode fixed counts; fixed counts now win,
including the existing Dual Wingbeat path. Low-HP reference tests disproved the
initial Helmet-before-Rough-Skin assumption: Rough Skin order 1 precedes item
order 2. Rough Skin KO prevents Helmet activation; combined damage faints once.

Final focused evidence: 56/56 pinned Champions custom-battle cases, both sides:
contact/noncontact, Protect/Substitute, item consumption, Pads/Klutz, Long Reach,
Magic Guard, Gas/Shield, user/holder KO, two-hit/Skill Link, early faint, combined
Rough Skin and source/actor identity/effect HP arithmetic. Independent mechanics
review approved. Synthetic teams and injected starting states are not current
client certification or legal competitive registrations. Accuracy was controlled
independently; equal seeds are not a claim of equal random damage.

Reference: installed pokemon-showdown 0.11.11, referenceIdentity pin validation.
- dist/data/items.js SHA-256: `8f9336fee2de514bbd80884014009676c0a751f0fb514a728d28b9892310aa8f`
- dist/data/abilities.js SHA-256: `53acce98287c9d3cae5a30c2c5e442cf53287d4c5eb4bc219270b58e868b30dd`

Remaining: general contact-effect ordering (e.g. other ability mutations), Magic
Room/Embargo support, and general Rough Skin suppression are not established by
these fixtures. Do not extend this scope to all contact abilities or all items.
Full candidate gates are in OVERNIGHT_ACCEPTANCE_GATES_2026-10-20.md.
