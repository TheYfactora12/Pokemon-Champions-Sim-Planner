# Showdown Replay Coach Roadmap Plan

## Goal

Turn the Replay Coach idea into a tracked, implementable milestone without changing runtime app behavior yet.

## Steps

- Update `poke-sim/docs/SHOWDOWN_REPLAY_COACH_SPEC.md` with the access/data model:
  - anonymous temp review
  - account/profile saved history
  - premium/advanced full coaching report as a later business decision
- Keep raw log privacy explicit.
- Keep sim data and replay data merged through normalized summaries and feedback packets.
- File mirrored GitHub issues for the implementation phases.
- Update roadmap references if issue numbers are created.
- Validate docs with `git diff --check`.
- Push docs and tracker state to both repos.

## Acceptance Criteria

- Spec explains where Replay Coach lives in the UI.
- Spec explains what data is temporary vs saved.
- Spec explains what requires profile/account persistence.
- Both repos have aligned issues for the Replay Coach milestone.
- No runtime app source is changed.
