# Scripted one-switch diagnostic — 2026-10-20

Local v2.2.222-switch-diagnostic / engine1.1.26 component, based on v221
fc0850b. Superseded by the later consolidated continuation candidate when present.
No publication is authorized; complete final aggregate gates before release.

An injected development-only helper accepts explicit stable actor/replacement IDs,
one switch globally per turn. It is not loaded by HTML/bundle/service worker;
missing helper and aggregate calls reject. No automatic policy or UI control added.
The script captures both sides' moves before switching, omits the switcher's action,
resolves enemy and ally target slots, uses explicit replacement, preserves stable
identity and PP, and records a structured switch event. Existing public behavior
and ordinary inactive-actor guard remain unchanged.

Positive allowlists reject Mega/transformation, unsupported moves/abilities/items,
trapping/volatile lifecycle, hazards and unsupported field state. Incoming sleeping
or frozen members reject because their counter reset is not proved. Switch-out of
sleep/freeze/paralysis is tested. Simultaneous switches and switch-plus-Mega reject.
Unused directives and conflicting forced moves reject rather than silently disappear.

51 tests pass: 48 synthetic reference cases over both sides/slots, enemy/ally and
spread targeting, statuses, return/consumed item, Regenerator, Intimidate, Trick Room
and self moves, plus three admission groups. Intimidate compares Attack stages and
reference activation counts. Retained inputs, seeds, raw local/reference logs and
source/package hashes: poke-sim/artifacts/scripted-switch/. Pinned dependency identity
is enforced by referenceIdentity(); equal seeds do not claim equal random damage.

Independent battle_review_v216 review passed 51/51. Its delayed-first-switch finding
was fixed by checking allowed actions on every diagnostic turn, plus field-state
admission. Both earlier and later unsupported actions now reject. Golden/default
policy checks retain existing behavior. Final aggregate/browser gates belong to the
consolidated continuation report. No client parity, legal registration or public
voluntary switching claim is made.
