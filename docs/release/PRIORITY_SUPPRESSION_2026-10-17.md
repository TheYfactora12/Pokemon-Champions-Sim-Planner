# Priority-blocker suppression repair

## Live receipt and subsequent harness correction

PR274 merged as `fb481d904972084be6665e56e415c9732b15dc44`; the immutable
candidate was `fee5fff`. PR CI39005261806 including battle audit, bundle39005261710
and cache39005261735 passed. Pages39005599477 passed. HTTP alignment at
2026-10-17T05:19:12.665Z matched v215 bundle and five tracked external assets.
The live M-C reference-practice battle (Mega Altaria versus Mega Dragonite)
completed five turns. Seed619815971,642260276,850837837,3052013669 downloaded
successfully and matched399 visible replay checks with zero discrepancies and
zero captured page errors. Local/live used different seeds/bring settings and
practice modes; these are independent UI/export checks, not identical outcome tests.

The subsequent harness-only patch normalizes only a `[still]` move announcement
with a matching priority-blocker `cant` event, same move and `[of]` attacker,
within that move/turn segment. Raw protocol is untouched.14 parser fixtures retain
Protect, misses, failed healing, successful boost-stealing and mismatched rejection
events.96 oracle tests now require zero differences; the original15 probes all
agree. Independent review restored the old blocker in memory and confirmed the
comparator still detects move-order and PP errors. Final harness aggregate passed
(228 fast files and12 offline DB files). This follow-up does not change browser
code, engine version, cache, bundle or assets. Its hosted merge gate is separate.

The candidate notes below preserve the earlier comparator limitation; that one
limitation is superseded by this tested normalization. Broader suppression and
policy/legality boundaries remain open. No99% or universal accuracy claim.

Related: TheYfactora12/Pokemon-Champions-Sim-Planner#264. Candidate:
v2.2.215-priority-suppression, engine1.1.20. Official M-C approval is unchanged.

## Observed defect and repair

The original15 synthetic probes found nine substantive disagreements: Fake Out
was blocked locally when the pinned Showdown0.11.11 reference allowed damage and
flinch. Six controls agreed on blocking but exposed a separate comparator issue:
reference blocked `[still]` announcements are counted as resolved moves.

Selection and execution checked raw blocker ability names without bypass or
suppression. Both now share `_priorityAbilityBlocker`. It evaluates the protecting
holder's unconsumed Ability Shield, living active Neutralizing Gas occupants,
and Mold Breaker/Turboblaze/Teravolt. Shield on a protected ally does not protect
another Pokemon's blocking ability. Gas occupancy is reread, not cached.
This is not a general Neutralizing Gas implementation or full active-ability refactor.

## Evidence

- `tests/priority_suppression_reference_tests.mjs`:96 synthetic oracle cases,
  three blockers, eight modes, direct/ally targets and both sides. Before repair:
  54 failed,42 passed. After:96 passed. Checks damage presence, target Tackle PP,
  blocker events and the exact known order-only discrepancy; no blanket mismatch waiver.
- `tests/priority_selection_policy_tests.js`:78 added selection/state assertions,
  including consumed Shield, Gas removal/fainting, dead blocker, Quick Guard and
  Psychic Terrain independence. Existing locks, alternative targets and policy
  provenance tests also pass. These state mutations are not switch-lifecycle parity.
- Independent mechanics review approved the scope and additionally ran72 in-memory
  combinations of Gas with all three bypass abilities, Shield ownership, direct/ally
  targets and side swaps. Those supplemental probes are not permanent regression files.
- Local browser: one Bo1 Mega Altaria versus Mega Dragonite practice battle,
  six turns, downloaded JSON seed1515950343,1517520224,2081791324,1899564017.
  The visible/export comparison passed464 checks with zero issues. This is a UI
  integration check, not a battle containing the synthetic suppression scenario.
- Declared battle audit passed. Initial aggregate gate failed the exact case-count
  assertion (57 versus56) after the new partial case was registered. Corrected the
  inventory expectation and explicitly asserted the new case remains unproved.
  Final aggregate passed (227 fast files,12 offline DB files, zero failures).
  Independent release review approved manifest/cache/bundle/registry consistency.
  Hosted CI and deployed proof are pending at candidate preparation.

Reviewed bundle SHA256:
`d0d209a16485d4d366779b9fd8fcf19a39c3be2f632cbc8932394152ab9ea286`.

Private browser artifacts remain local; no user saves or credentials are published.
Raw reference and local hashes are emitted by `tools/audit-priority-suppression.mjs`.
Run that diagnostic to reproduce the original15-case inventory; its completion
alone is not a passing release gate. Tests name the stricter claims above.

## Boundaries and next steps

Gastro Acid, transformed Gas, Magic Room/Embargo, broad Gas effects and complete
switch/removal lifecycle parity remain unproved. The case registry stays partial.
The shared comparator's blocked-move representation is still a documented gap;
do not hide it by discarding arbitrary differences. Existing historical win rates
are not comparable across changed engines/policies without rerunning matched inputs.

Release only after final checks and independent release review, then compare exact
Pages artifacts and a paired live battle/export. Roll back through reviewed deployment
to v214 if a regression appears; preserve saved teams and old result provenance.
Next retain combined-suppression fixtures, correct the comparator with independent
tests, and continue #264 policy-information boundaries before team-strength claims.
