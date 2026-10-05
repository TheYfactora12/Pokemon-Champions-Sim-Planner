# Live Player Audit - October 4, 2026

## Scope and evidence

Actual browser interaction with the public GitHub Pages site, not an HTTP-only
check or a headless engine batch. Displayed build: v2.2.142-pp-replay-proof.
Local v165 changes are not evidence of hosted behavior.

One NEW doubles Bo1 game was run through Simulator with `1 series (inspect
replay)`. Earlier 50-series results and older replay entries were excluded.
The new result timestamp was 1:08:35 PM EDT. Ruleset: Practice (unverified).
This is NOT an M-C legality or competitive accuracy certification.

Player: TR Counter Squad. Manual bring-four: Incineroar, Arcanine, Garchomp,
Whimsicott. Opponent: Mega Altaria, random bring-four; observed members were
Typhlosion-Hisui, Altaria-Mega, Whimsicott, Rotom-Wash.
Result: loss, five completed turns, seven KOs, no Trick Room or Tailwind.

The formatted replay and expanded Raw engine log were inspected. JSON download
was attempted with a download listener, which timed out; no new matching file
was found in Downloads. Thus exported JSON pairing, seed identity, deterministic
rerun, and full numerical damage validation remain UNVERIFIED. This report is
a transcribed observation record, not a substitute for a replayable QA artifact.

## Findings

1. **High: unsupported small-sample advice.** The result says `Avoid` and 0%
   after one game. One loss cannot establish matchup quality. Replay coaching
   calls Flare Blitz a better T1 line (+28) without exposing validated
   counterfactual evidence; the actual Knock Off finished Typhlosion.
2. **High: legality context is misleading.** Preloaded cards combine Unknown
   ruleset/HISTORICAL with LEGAL. The live simulator has no M-C selection.
   Reference the separate full-team audit rather than assuming these are legal
   current-regulation competitive inputs.
3. **High: evidence/save path incomplete.** Export completion could not be
   established. Browser console at 17:08:35.479Z reports `saveAnalysis
   quarantined: missing or conflicting execution provenance`. Quarantine is a
   protective behavior, not permission to bypass provenance validation.
4. **Medium: duplicate formatted damage.** T3 shows Moonblast damage twice.
   Raw log has one move announcement and one damage event (1 HP, opposing
   Whimsicott 0/136). This supports a presentation/aggregation defect, NOT two
   engine damage applications.
5. **Medium: formatted log drops distinct Protect outcomes.** T4 raw log shows
   Protect against Earthquake, Hydro Pump, and Hyper Voice. Formatted output
   retains one Protect outcome and leaves Hydro Pump without its resolution.
   Event deduplication must preserve action/target identity.
6. **Medium: item-state ambiguity.** Post-consumption snapshots still display
   Sitrus Berry and Focus Sash. Determine whether these are registered-loadout
   labels or stale current-state labels. No repeated activation was observed.
7. **Decision-policy hypothesis, not a mechanics finding.** T5 Moonblast KOs
   Altaria before Garchomp's Earthquake; Earthquake then KOs its ally while
   Rotom is immune. Moves may have been selected while Altaria was alive.
   Test joint-action prediction and friendly-fire cost, not mid-turn reselection
   that would give the simulated player information unavailable at choice time.
8. **Usability:** literal `<strong>` markup appears in coaching; same-species
   Whimsicott events lack clear side labels; replay list mixes the new run with
   50 older entries without obvious run identity. Clicking Raw engine log also
   collapsed its parent replay; reopening revealed the raw section expanded.
   This suggests click propagation and needs isolated reproduction.

## Observed turn trace

| Turn | Observation |
| --- | --- |
| 1 | Focus Blast hits Incineroar for 138 (64/202); Sitrus restores HP; Hyper Voice later leaves 53/202. Flare Blitz hits Typhlosion for 84, recoil 28. Knock Off finishes Typhlosion for 66. Opposing Whimsicott enters. |
| 2 | Opposing Moonblast KOs Incineroar. Flare Blitz leaves opposing Whimsicott at 1/136 via Focus Sash, recoil 45. Hyper Voice leaves Arcanine at 6/167. Player Whimsicott enters. |
| 3 | Player Moonblast KOs opposing Whimsicott for 1. Flare Blitz hits Altaria for 65; Arcanine faints to recoil capped at remaining 6 HP (raw calculated recoil 21). Flamethrower leaves player Whimsicott 15/137. Garchomp and Rotom enter. |
| 4 | Whimsicott Protects. Earthquake hits Altaria for 72; Rotom is immune. Hydro Pump is blocked by Protect. Hyper Voice hits Garchomp for 158 (27/185), also blocked on Whimsicott. |
| 5 | Moonblast KOs Altaria for 45. Earthquake KOs allied Whimsicott for 15; Rotom is immune. Hydro Pump finishes Garchomp for 27. |

## Next acceptance gates

- Recover reliable JSON export and stable run/seed/build identity; compare the
  exact same battle across raw, formatted, exported, and saved representations.
- Add fixtures for mirror-species damage, multiple Protect outcomes in one
  turn, consumed-item state, and one-game coaching abstention.
- Test the T5 joint-decision scenario with frozen pre-choice state and legal
  alternatives. Separate agent quality from mechanics fidelity.
- Recheck after reviewed deployment. Do not close these hosted findings solely
  because a newer local candidate passes tests.

The run proves that the public simulator can complete and expose a battle.
It does not establish a satisfaction percentage, damage parity, current-regulation
legality, or 99% accuracy. The highest-value improvement is trustworthy,
traceable feedback, not a larger uninspected battle count.
