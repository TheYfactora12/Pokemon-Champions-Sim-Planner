# Independent Rest retest

Exact immutable head **8bfccd3a35b2d2f8be185ef4e8196741235504f2**, PR279, v2.2.232-rest-admission / engine 1.1.33. Detached isolated worktree `retest-8bfccd3`; prior artifacts preserved.

**Verdict: the previously reported terrain and ally Sweet Veil failures are resolved in the tested scope. Rest remains partial because effective Leaf Guard in sun still allows incorrect healing/sleep.** This is shared-reference evidence, not current-client proof.

## Confirmed repair

The unchanged independent original probe (`rest-original-boundaries.mjs`) now agrees in all ten executions: two sides × ordinary, grounded Electric Terrain, airborne Electric Terrain, Misty Terrain and ally Sweet Veil. The six former mismatches now reject before healing, retain the 20-HP deficit and mark failure. Four positive controls continue to heal/sleep. Misty remains a synthetic custom-game fixture, not M-C roster certification.

Unchanged supplied suite: **114 pass, zero fail**, against installed, locked Showdown **0.11.11**. Denominator:

- 28 timing cases: seven variants × two sides × two active slots.
- Four called-Rest/Sleep Talk cases.
- 12 own-ability admission cases.
- 68 terrain/ally cases: 17 variants × two sides × two slots.
- Two rejected-Rest/Stomping Tantrum executed-damage cases.

These repeat a fixed seed and are scoped scenario executions, not independent accuracy observations. Gravity is initialized as field state in the supplied tests, not established through actual Gravity move execution. Several abilities/items and teams are synthetic. I did **not** independently rebuild/run the owner's separate upstream `9b136a8...` compilation; its 114-case claim remains attributed to that prior report.

The supplied `rest_admission` mutation applies its unique anchor and fails both selected Electric Terrain/ally cases for the intended reason: local status `sleep` versus expected null. Healthy versions of those cases pass within the 114-case run. Expected answers were not edited.

## Surviving finding — effective Leaf Guard does not reject Rest

**High impact within shared mechanics scope; not established as a new regression.**

At `poke-sim/engine.js:4937`, the admission guard covers terrain, effective Sweet Veil, sleep/full HP, Comatose, Insomnia and Vital Spirit. It omits Leaf Guard under effective sun.

`node rest-adversarial.mjs` uses **Leafeon with native Leaf Guard**, Rest and 20 HP missing, with Torkoal's actual Drought entry activation. Both player sides reproduce:

| Condition | Pinned reference | Local |
|---|---|---|
| Leaf Guard + sun | No status; 20 HP missing; Rest PP 7 | Sleep; full HP; PP 7; failure false |
| Leaf Guard + sun + Gas + Ability Shield | Same rejection | Same incorrect heal/sleep |
| Leaf Guard + clear weather | Heals/sleeps | Agrees |
| Leaf Guard + sun + Gas, no shield | Heals/sleeps | Agrees |

Primary installed reference sources: `node_modules/pokemon-showdown/data/abilities.ts:2281` rejects status through effective Leaf Guard in sun; `data/moves.ts:14978` makes Rest set sleep successfully **before** healing. Reference/source hashes and complete logs are retained. The Gas case gives Torkoal Ability Shield so sun setup remains observable; it is a mechanics probe, not certification of this complete team's current legality.

The repair report explicitly leaves wider ability/lifecycle combinations unproved. Thus this finding narrows overall Rest closure; it does not invalidate the demonstrated terrain/Sweet Veil fix.

## Beyond the supplied cases

Independent additional probe: **20 conditions × two sides = 40 executions; 36 status/HP/PP agreements, four Leaf Guard disagreements**. This denominator is separate from the supplied suite and includes overlapping controls; do not add it into a unique-accuracy percentage.

Healthy cases include:

- Self Sweet Veil rejects; an opponent's Sweet Veil does not.
- Rejected Rest preserves burn: 20 HP deficit plus 14 end-turn burn damage, no healing/cure.
- Flying versus Electric/Misty Terrain; Iron Ball grounding; Air Balloon with an existing burn.
- Sweet Veil ally actually faints to Seismic Toss before the slower Rest actor; Rest then succeeds.
- Ally Ability Shield consumed under Gas versus intact Shield.
- Flower Veil combinations, including Grass actor and suppression, agree with the executed reference's self-Rest behavior. No assumed “all status guards block Rest” rule was used.

Original generic Snorlax/Leaf Guard exploration is preserved separately; final findings use Leafeon. Tests execute entry abilities and actions rather than reuse the new admission predicate as their expected-result oracle. They do not prove every intermediate event, switching/cure lifecycle, Roost/Tera grounding or generic sleep distribution.

## Regression scope and limits

S1: reran all 35 adverse representations through proof reevaluation/JSON, simulation, aggregation, series, ranking, replay attachment, history and payload building; all remain excluded. S3/S4: stale contracts, contradictory capture metadata, content/identity counterexamples and failed/missed/duplicate replay controls still reject; positive package remains READY.

S2 Amnesia/Tantrum test and relevant damage expression are unchanged from 91c8206; its numerical mutation receipt is **carried forward, not rerun**. No unrelated full audit, actual browser, hosted CI, live DB or client-video verification was performed. Prior Struggle failures, item repairs, Encore and damage-roll issues are not closed here.

Acceptance: retain the scoped admission repair, add native Leaf Guard sun/suppression/shield cases to its owning gate, then retest no-heal/status preservation and failed-action follow-on damage. Do not promote full Rest/client parity or weaken existing release gates.

No implementation checkout, settings, expected golden answers or live data changed. No denied or pending action remains.
