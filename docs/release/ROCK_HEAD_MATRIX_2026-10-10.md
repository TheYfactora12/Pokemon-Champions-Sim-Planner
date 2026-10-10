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

Full gate, CI and deployed receipt are recorded separately when complete.
