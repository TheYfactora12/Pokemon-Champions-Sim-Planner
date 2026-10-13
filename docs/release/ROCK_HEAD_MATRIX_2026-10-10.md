# Rock Head and matchup headings

## Candidate v204

Fixes the shared ordinary move-recoil path: active Rock Head prevents recoil.
Struggle remains on its separate path; contact damage is not suppressed.
The seven matchup headings now match opponent, win percentage, wins, losses,
average turns, average Trick Room turns and assessment. No draw-count or
win-condition claim is made for columns that do not contain those values.

## Evidence

- Flare Blitz, Head Smash and Double-Edge Rock Head tests failed before the fix.
- 19 focused checks pass, including both sides in doubles, exact recoil HP,
  Rough Skin contact damage and target overkill.
- Eight synthetic pinned Champions reference probes verify ordinary recoil
  exemption and Struggle exception (not random-damage parity).
- Repeated the prior 6,370-battle reference sweep: 247 exact reruns, zero checked
  invariant failures, Rock Head recoil candidates reduced from 580 to zero.
- Local report: `poke-sim/reports/artifacts/team-variations-1791607420862.json`.
  Private replay-derived artifacts are not published with the code.
- Independent read-only review confirmed the narrow guard and required stronger
  doubles tests and a new release/cache identity; both were added.

## Boundaries

General ability suppression (Gastro Acid/Neutralizing Gas), all ability changes,
all indirect damage and complete-game oracle parity are not established here.
Struggle rounding remains separate follow-up, not certified by the recoil
presence check. Official M-C approval, remaining mechanics/data gaps and all
team-strength claims stay open. This fix does not certify a competitive win rate.

## Deployed receipt

PR261 merged as `4aa63b62b2e68653fe6ffcd76719e9e539cc7f7c`. Final candidate
`06bedc3` passed the project gate (213 fast files, 12 DB/mock files), battle
audit and hosted CI `38025372689`. Bundle/cache checks passed; Pages
`38025633022` succeeded. Administrative DB checks remain unverified.
HTTP artifact/external-asset alignment passed at 2026-10-10T04:57:03.496Z.
Bundle SHA: `e11335b0ddb5243509439788439b21113593901c26ed6cdb49f90a880cb08049`.

Local browser sample seed 2259227547,1810816234,3071600574,3852133663:
42 log-type events accounted for, two Rock Head Head Smash hits without recoil.
Live browser batch: 16 included matchups, one Bo1 each, unchanged user team;
10 wins/6 losses are diagnostic only, not statistical strength evidence.
Downloaded live sample seed 4068147069,2578241400,4229479111,2934443990:
six-turn loss versus Mega Altaria, 36 log-type messages, 33 verbatim and
three equivalent formatted miss/Leftovers rows. Flare Blitz on turn 3 dealt
the remaining 1 HP to Whimsicott with no Rock Head recoil event. Other batch
games were not individually visually audited. Corrected matrix headings
were checked in the deployed browser. No private raw replay is committed.

Initial full checks caught stale v203 fallback/export labels; corrected in
06bedc3, followed by successful final checks. A synthetic Struggle oracle
initially hit Protect; both targets were made non-protecting to test recoil.
