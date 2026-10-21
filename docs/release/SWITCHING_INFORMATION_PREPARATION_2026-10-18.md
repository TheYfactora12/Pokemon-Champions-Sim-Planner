# Switching And Information Boundary Preparation — 2026-10-18

## PR278 recommendation

Recommend approval of the narrow move/PP/Fly repair at
`8282089cf2f49d61fe167e2227cb04549a6d1540`, followed by an explicit human merge
and release decision. At this review PR278 is open/draft, has no review comments
or submitted reviews, six successful hosted checks, and skipped Supabase Preview.
No merge/deployment authorization was inferred. Main remains `0b57b13`.

This preparation is on separate local branch `prep/switching-information-boundary`.
It does not change PR278, browser code, engine behavior, bundles or source truth.

## Confirmed defects

`node poke-sim/tools/diagnose-hidden-information.cjs` isolates the existing selector.
With identical visible state and only hidden opponent moves changed:

| Observer | Opponent has unrevealed Tackle | Opponent has unrevealed Scratch |
|---|---|---|
| Player | selects Imprison | selects Tackle |
| Opponent | selects Imprison | selects Tackle |

This is synthetic implementation evidence, not a recorded Champions battle.
The policy explicitly identifies as `full_registered_state`. Other access routes
include exact opponent HP/maxHP, defense stats, held item and ability through
`calcDamage`, plus field-side live object references. Removing only `enemy.moves`
would leave substantial leakage.

The action queue contains moves only. `_switchOutActiveMon` picks a replacement
itself and serves pivot/ability paths; it is not a user-selected voluntary switch.
Review found incomplete trapping checks, no Natural Cure switch-out handling,
allied targets held as object references, and inactive queued actor checks limited
to M-C. These are prerequisites, not claims of verified Champions defects.

## Evidence and limits

[Official Champions gameplay](https://champions.pokemon.com/en-us/gameplay/)
confirms Ranked, Casual and Private modes and single/double formats. It does not
specify the exact opponent-information policy or switch-phase ordering needed
here. Targeted searches did not establish those details. Do not substitute
Scarlet/Violet tournament team-sheet rules for current Champions evidence.
Pinned Showdown is a baseline comparison only, not official Champions approval.

Required Champions capture packet: client version, regulation, mode, Bo format,
team-sheet setting if present, pre-choice screens, selected actions, continuous
turn footage and both original teams retained privately. Capture:

1. What species/forms, HP precision, moves, ability, item, stats and selected
   actions are visible before selection, after reveal, after switch, and next game.
2. Ordinary switch versus an attack; both sides and slots; target follows the slot.
3. Switch while asleep/frozen/paralyzed; PP unchanged; out-and-back persistence.
4. Trapping and exemptions, source faint/switch, Regenerator/Natural Cure, entry effects.
5. Switch plus Mega, simultaneous switches, speed ties and Trick Room separately.

Unknown details remain unverified. Do not enable guessed behavior to satisfy a test.

## Prepared contracts (not integrated fixes)

`tools/preparation/decision-contract.cjs` provides:

- A detached immutable observation: own selected facts, explicit public opponent
  fields, and viewer/identity/turn/sequence-scoped reveal facts with evidence IDs.
  Unknown opponent move/item/ability remains empty/null. No raw stats, HP,
  object methods, selected moves or side references pass through.
- A one-switch intent validator: explicit stable actor/replacement IDs, same side,
  living brought bench member, valid active slot, one switch only, no Mega phase,
  and explicit availability evidence. It reports execution unsupported.

These helpers accept trusted adapter DTOs, not arbitrary replay claims. The
adapter is still to be written/reviewed. Public identifiers must be opaque and
must not encode hidden species/form information. Ability/item reveal expiry,
transformations, suppressed abilities and open-sheet modes need explicit rules.
The observation contract is a conservative design proposal, not a declaration
that every field is visible in every Champions mode.

## Next independently reviewable patches

### 1. Information boundary, before automatic switching

- Build a side-specific reveal ledger from reviewed public events, before choices.
- Pass only immutable DTOs to a separate selector; no live engine objects or
  callbacks/closures that can inspect registered opponents.
- Replace exact opponent damage scoring with documented estimates using public
  inputs; unknown information must remain unknown, not false immunity knowledge.
- Return actor/move/target IDs, resolve against authoritative state only in execution.
- Freeze both sides' observations before either chooses; isolated decision RNG
  must not consume combat RNG. Preserve historical full-state mode explicitly.
- Version policy and information model, provenance, caches and stale results.
- Acceptance: hidden moves/items/abilities/stats/bench/current choice mutation
  cannot change a decision until an authorized reveal. Side swaps, switch reuse,
  same-name Pokemon, no alias references and reveal cutoffs must all pass.

### 2. Explicit diagnostic voluntary switch

- One scripted switch per turn first; no automatic policy or public control yet.
- Explicit replacement identity; never silently substitute a different bench member.
- Capture both sides' actions first, then use evidenced switch/Mega/action ordering.
- Incoming/outgoing actor receives no additional move; switching consumes no PP
  and bypasses move-attempt sleep/freeze/confusion handling.
- Resolve every ally/opponent target by side and slot; reject inactive actors in
  every supported lane. Entry/exit callbacks exactly once; denial is atomic.
- Reject simultaneous switches, switch-plus-Mega and unsupported trap/lifecycle
  contexts until independently evidenced.
- Acceptance: both sides × both slots; self/active/fainted/omitted/unknown/duplicate
  replacements; PP/HP/status/item identity round-trip; trap-source lifetime;
  targeting and spread; deterministic traces; unchanged pivots/faint replacements.
- Every actual browser game needs Download JSON/visible replay pairing.

## Verification

Initial preparation suite: 9 tests passed, including 100 hidden-field variants,
viewer/sequence filtering, immutable snapshots, both-side/slot switch admission,
and rejection boundaries. Aggregate result recorded after completion below.
Diagnostic leak reproduction remains a known failure of the existing engine.
No new browser game or real-game mechanics claim is made. Existing runtime and
artifact hashes remain those of PR278; no release identity bump is appropriate.

Next decision: approve or defer merge of PR278 separately. The next coding gate
is the reviewed public-event adapter and information-isolated selector; switching
execution must wait for the named lifecycle/order evidence and diagnostics.

Independent contract review reproduced two defects: missing IDs/brought state
could pass switch admission, and out-of-order reveal arrays overwrote newer facts.
Three added regression groups failed before repair. Final focused result: 12/12
passed, including malformed identities/rosters, duplicate active slots, exact
cutoff inclusion, chronological ability/item updates and explicit item removal.
Conflicting same-sequence facts fail closed. Every denial remains immutable and
explicitly execution-unsupported. IMP-0110 records the lesson.
Final aggregate: `npm test` passed **230 fast files + 12 offline DB files**,
zero failures, four manual/helper files skipped. Final log:
`switch-preparation-final-gate.log`. New CJS/test syntax checks and diff check passed.
Independent read-only review passed the revised 12-case contract suite.
Engine/UI/bundle/release-artifact equality against PR278 was verified.
No new source-truth or full battle/accuracy rerun was required for these isolated
preparation files; PR278's exact-head hosted battle audit remains unchanged.
No live database, browser/game execution, merge, deployment or push occurred.
