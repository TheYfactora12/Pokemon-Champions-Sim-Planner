# Champion Replay Coaching Philosophy

Champion Replay Intelligence should feel like a premium sports coaching room, not a parser report.

The product goal is to help every player leave a replay with a clearer next decision: what to repeat, what to change, and what to practice.

## Core promise

The system evaluates observable battle decisions, not the player's intelligence or worth.

It should answer:

1. What happened?
2. Why did it matter?
3. How confident are we?
4. What should I do next time?
5. What should I practice before the next set?

## Coaching principles

- Evidence first: every strong claim needs a turn, action, board state, or compliance finding behind it.
- Confidence visible: incomplete logs, hidden information, variance, or unsupported formats lower certainty.
- No shame language: bad turns are coaching moments, not character judgments.
- Outcome-bias resistant: a win can include poor decisions, and a loss can include strong play.
- Player-level adaptive: beginner reports explain fundamentals; elite reports discuss tempo, outs, sequencing, and matchup plans.
- Actionable by default: every major weakness maps to a correction and a drill.
- Team-aware: separate player execution from team construction, matchup pressure, legality/compliance, and variance.
- Premium polish: use clear grades, classifications, and next-step coaching instead of raw machine output.

## Player-level coaching ladder

### New player

Focus on clarity and confidence.

- Explain the most important turning point in plain language.
- Limit findings to the top one or two fixes.
- Prefer concrete drills like Lead Lab, Protect Value Drill, and Threat Callout Drill.
- Avoid jargon unless it is immediately explained.

### Developing player

Focus on repeatable habits.

- Identify the biggest repeated mistake category.
- Show how a single turn changed the board state.
- Explain whether the issue was lead choice, speed control, resource use, or win-condition recognition.
- Recommend one practice assignment for the next five battles.

### Competitive player

Focus on matchup plans and sequencing.

- Compare the player's actual line against the expected matchup plan.
- Identify stable lines versus gamble lines.
- Track whether speed-control windows, Tera timing, Protect turns, and switches created or lost tempo.
- Separate correct decisions that lost to variance from avoidable mistakes.

### Elite player

Focus on marginal edges.

- Highlight missed conversion windows, hidden collapse risk, and opponent adaptation.
- Discuss alternative lines in terms of outs, tempo, board control, and endgame inevitability.
- Compare simulator predictions against real execution.
- Emphasize best-of-three adaptation and repeated scouting patterns.

## Report tone

Use direct coaching language:

- "Your lead created pressure immediately."
- "The replay turned on Turn 3 because your actual win condition was left exposed."
- "This looks more like matchup pressure than a mechanical mistake."
- "Confidence is low because the replay does not reveal enough team information."

Avoid raw or fake-certain language:

- Do not say "you played badly".
- Do not invent opponent intent.
- Do not call a line optimal unless the evidence supports it.
- Do not bury the user in every detected event.
- Do not show internal team IDs or parser labels in trainer-facing copy.

## Finding structure

Every major finding should include:

1. Label: short trainer-facing category.
2. Evidence: turn/action/source that supports the finding.
3. Impact: why the decision changed the battle.
4. Better line: what to consider next time.
5. Drill: one practice assignment.
6. Confidence: high, medium, or low.

## Classification model

Replay outcomes should classify the lesson, not just the winner.

Supported coaching classifications:

- Simulator confirmed
- Simulator partially confirmed
- Simulator contradicted
- Player execution loss
- Team construction loss
- Matchup knowledge loss
- Variance-heavy result
- Parser confidence too low
- Compliance confidence too low

## EA Sports-style product feel

The user-facing experience should resemble a post-game coaching studio:

- Battle grade and confidence up front.
- Key turning point highlighted clearly.
- One best play and one biggest correction.
- Momentum and mistake flags shown visually when possible.
- Practice assignment presented as the next training task.
- Premium trend language that says how the player's profile is changing over time.

The final report should make the player think: "This system watched the battle the way a real coach would."
