# Fake Out Action Denial

## Scope

Candidate v201, baseline v200, issue #249. Owner: mechanics engineer;
independent read-only battle audit requested. No official regulation promotion,
database changes or team rewrites. Rollback: reviewed v200 runtime.

The v200 synthetic browser/export sample showed Liepard using Fake Out on
Charizard, then Charizard using Dragon Claw in the same turn. A failing
side-swapped regression reproduced the absent flinch. The move was missing
from FLINCH_MOVES; shared flinch also lacked target secondary-effect guards.

## Change And Proof

- Fake Out now has guaranteed secondary flinch and Sheer Force suppression.
- Shared flinch checks Substitute, Inner Focus, Shield Dust and active Cloak;
  tests retain Mold Breaker, Ability Shield, Infiltrator and Klutz interactions.
- 18 local boundary tests pass, including next-turn clearing, stable source
  attribution, denied-action PP preservation, Sheer Force base power and a
  synthetic guaranteed-roll spread test isolating per-target Cloak behavior.
- 16 side-swapped synthetic doubles probes agree with pinned Showdown 0.11.11
  for action order and PP. Exact random damage is not compared. These probes
  are not full games and do not approve Champions legality.
- Source: [pinned Fake Out](https://github.com/smogon/pokemon-showdown/blob/efe4948570d5e8189751792136d26e71710c6c66/data/moves.ts#L5078).
- First fast gate had only stale generated-artifact failure before rebuilding.
  Final full gate, independent review, browser/export and deployed receipts
  remain pending until recorded below or in the linked PR.

## Remaining Boundaries

Champions disables late Fake Out selection; forced/Encore timing needs its
own format-specific proof. Broader flinch chance modifiers, multi-hit timing and complete
Champions confirmation remain unproved. The case stays partial. No universal
accuracy, team-strength or official M-C claim follows from this repair.

## Local Candidate Receipt

Full npm test passed (including offline/mock DB contracts, not live DB).
Battle audit passed declared fixtures and 4,500 seeded stress battles; no
claim that those are oracle comparisons. Independent review found no narrow
implementation blocker and requested added Sheer Force and spread boundaries,
now covered. A direct consumed-Cloak fixture remains unproved.

Browser v201 ran one four-turn synthetic Charizard/X versus Mega Dragonite
match with Liepard in the leads. Download seed:
3330221009,2686741233,2955950489,930535373. Of 21 log-type export events,
19 matched visible text verbatim and two Leftovers rows matched formatted
10-HP recovery. First-turn Fake Out applied and skipped Dragon Claw; its PP
remained 16/16. Stable source/target keys survived lead reordering/evolution.
This is bounded replay evidence, not validation of all damage in that match.

## Rejected Follow-Up Hypothesis

The initial #252 claim that late Fake Out must simply fail was based on the
generic moves.ts onTry, not the Champions override. A two-turn reference probe
rejected selection: pinned mods/champions/moves.ts disables Fake Out after the
first active move action. The proposed deletion of the Struggle fallback was
withdrawn before commit or deployment. #252 now tracks format-specific
selection/Encore/PP proof, not an established universal replacement rule.
Failed local probe output is retained in artifacts/late-fake-out-before.log;
no claim that the rejected probe validated Champions behavior.

## Deployed Receipt

PR253 merged as 20ecb36; CI37932507880 and Pages37933058440 passed.
HTTP identity/assets passed at 2026-10-09T12:56:47.371Z. Two fresh live
four-turn samples were downloaded and compared: Armor Tail rejection and
successful flinch/action denial with Dragon Claw PP16/16. All log-type events
matched verbatim or reviewed equivalent UI formatting. Details and seeds:
[deployment receipt](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/pull/253#issuecomment-6081366821).
