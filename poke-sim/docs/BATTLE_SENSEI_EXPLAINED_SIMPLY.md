# Battle Sensei Explained Simply

This document explains what Battle Sensei is supposed to do in plain language.

Imagine Pokemon battles like a game of chess with timers.

The app should not only say:

- who won
- who lost
- what moves happened

The app should explain:

- why a turn mattered
- what changed the battle
- what the player should try next time
- what the sim learned from many tries

## The Big Goal

Battle Sensei should help a player get better.

It should answer:

- Did I bring the right Pokemon?
- Did I lead with the right two Pokemon?
- Did I use Tailwind or Trick Room at the right time?
- Did my setup turn actually help me win later?
- Did I lose because of my team, my move, my target, my switch, or bad luck?

The app should teach decisions, not just show battle history.

## The Team Rule

If the player manually chooses a team, that team is locked for the sim run.

In a best-of-three or best-of-five set:

- the registered six Pokemon stay the same
- the player can change which three or four Pokemon they bring each game
- the app must not secretly swap to a totally different team

This matters because players need to learn what works from their actual team.

## Speed Control

Speed control means changing who moves first.

Common examples:

- Tailwind makes one side faster.
- Trick Room makes slower Pokemon move first.
- Icy Wind can make the other side slower.
- Priority moves can jump ahead.

Speed control is important because moving first can decide who gets knocked out before they can act.

## Tailwind Example

If you use Tailwind, your team may move first.

But Tailwind is only good if it helps you do something useful, like:

- get a knockout
- force the opponent to Protect
- save your important Pokemon
- set up a safer next turn

If you use Tailwind and nothing useful happens, the app should say:

> You got speed, but you did not turn it into pressure.

## Trick Room Example

Trick Room flips the battle.

Usually faster Pokemon move first.

Under Trick Room, slower Pokemon move first.

So if the opponent has fast Pokemon and you have slow Pokemon, Trick Room can be a good plan.

The app should check:

- Did Trick Room become active?
- Did your slow Pokemon move before their fast Pokemon?
- Did you gain value while Trick Room was active?

If Trick Room helped, the app should say:

> Trick Room changed the speed order and your slow Pokemon used that window well.

If Trick Room did not help, the app should say:

> Trick Room was active, but you did not convert it into enough pressure.

## Deferred Payoff

Sometimes a good turn does not look good right away.

Example:

- Turn 1: You use Tailwind.
- Turn 1: You do not get a knockout.
- Turn 2: You move first and damage the right target.
- Turn 3: You get the knockout.

The app should not call Turn 1 bad just because it did not win immediately.

It should look ahead a few turns.

If the setup helped within the next three turns, the app should say:

> That setup paid off later.

## Complementary Turns

Some turns are helper turns.

Examples:

- Protect keeps a Pokemon safe.
- Redirection protects a partner.
- Ally Switch changes targeting.
- Trick Room or Tailwind sets up the next turns.

These turns are only good if they help the next part of the plan.

The app should connect the turns together.

It should not judge every turn alone.

## What The QA Artifacts Prove

QA artifacts are evidence files.

They show what the app actually saw in simulations.

They can prove things like:

- how many battles ran
- whether Tailwind appeared
- whether Trick Room appeared
- whether speed order was recorded
- whether damage and healing were recorded
- whether the database saved evidence

Example from the current proof:

- Trick Room appeared in retained evidence.
- Tailwind appeared in retained evidence.
- Speed order details were exported.
- Turn logs showed position-score changes.

That means the app has the raw evidence needed to teach better lessons.

## What The App Must Not Do

The app must not make up coaching.

It should not say:

- this was the best move unless alternatives were checked
- this was always correct
- this team is perfect
- the player only lost because of luck

Instead, the app should say what it can prove.

Good coaching language:

> The replay shows Tailwind was active and your side improved over the next two turns.

Bad coaching language:

> Tailwind was definitely the best possible play.

The second claim needs more proof.

## Source Truth Rule

Source truth means the app should know where its claims come from.

Examples:

- Pokemon stats and move data should come from approved Showdown data or documented Champions overrides.
- Battle mechanics should be tested before we trust them.
- Coaching claims should point to replay evidence, sim evidence, or missing-data notes.

If the app is unsure, it should say so.

## Current Battle Sensei Labels

The app is being taught these labels:

- `speed_control_reversal`: you answered their speed plan, such as Trick Room into Tailwind.
- `speed_control_neutralized`: both sides used matching speed control, so nobody got a clean speed edge.
- `speed_control_converted`: speed control quickly became pressure or material.
- `deferred_payoff`: setup looked quiet at first but paid off within the next few turns.
- `planned_speed_transition`: a speed state ended and your next board was ready for normal speed.
- `complementary_turn_payoff`: a helper turn, like Protect or setup, helped create later value.
- `speed_control_without_pressure`: speed control happened but did not create enough value.

## What We Still Need

The next source-truth work is to make structured sim turn logs teach the same lessons as replay parsing.

The app should read sim logs and say:

- Trick Room was established.
- Trick Room converted.
- Trick Room failed to convert.
- Tailwind converted.
- Tailwind expired before enough value was gained.
- A Protect/setup turn helped later.

After that, the next larger layer is the Decision Opportunity Ledger.

That means the app should count decisions like:

- Speed Control: 2 of 3 correct
- Protect Usage: 1 of 2 correct
- Target Choice: needs more evidence

This should come after the tactical interpreter is solid.

## Simple Summary

Battle Sensei should be like a coach.

It should say:

> Here is what happened.
> Here is why it mattered.
> Here is what changed the battle.
> Here is what you should try next.
> Here is how confident we are.

If the app cannot prove something, it should not pretend.

