# Mobile Save Journey

## Live v178 Findings

- The sample button selected Kevin Meta Sun; import blocked Incineroar Knock Off.
  Do not weaken move checks to repair onboarding.
- Selecting a new custom team in Simulator left the previous Mega Altaria form
  visible in Set Editor. Save reads the selected team, not the displayed draft's
  original team. No stale save was performed on production.
- A one-member Incineroar fixture was added as a new custom team on production;
  existing teams were not overwritten. It is explicitly not a competitive team.

## Candidate v179

- Sample selection validates exported/reparsed six-member bundled teams, uses
  Champions SP labels, and preserves the user's paste when none passes.
- The button says practice sample, not legal sample. Regulation remains unverified.
- Editor entry refreshes a changed team context. Save/remove refuse a draft
  belonging to a different selected team or changed roster. Independent review
  found same-slot imports also needed roster-content binding; a regression now
  covers that case.
- Local browser at390x844: selected the separate custom fixture, opened Set
  Editor, changed30HP/32Atk/4Spe to29HP/32Atk/5Spe and clicked Save Changes.
  Reload, reselect and reopen retained29/32/5 plus Sitrus Berry, Intimidate,
  Adamant, level50, Fake Out, Flare Blitz, Darkest Lariat and Protect.
- The immediate stat summary initially displayed the old spread until reload
  (#214). Final candidate reopens the saved form after persistence. Browser
  verification changed29HP/32Atk/5Spe to28HP/32Atk/6Spe; both the stat summary
  and inputs immediately displayed28/32/6. Deployed confirmation remains open.

## Boundaries

No new battle was run. Replay download pairing remains open, including the prior
browser-tool download limitation. No database, legality or mechanics promotion.
Local browser proof is not deployed proof. Track review, tests and release on
#213; keep #211 open until the deployed save/reload acceptance is complete.
# Deployed Checkpoint

v179 shipped through PR215, merge fe5a44a and successful Pages run 37552163599.
Exact HTTP artifact comparison passed October 7 00:31 UTC. Live desktop sample
preview and a disposable team's save/reload passed, including immediate stat
summary refresh (#214 closed). The production viewport remained 1412px despite
the requested phone override; do not treat this as live phone evidence.
#211/#213 remain open for that final journey. Existing user teams were untouched.
