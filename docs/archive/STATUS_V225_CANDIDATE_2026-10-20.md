# Historical v225 candidate status

## Draft review candidate

v2.2.225-strategy-context / engine 1.1.27 is the local follow-up for
[draft PR279](https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner/pull/279).
Main is reconciled through `3eb6ab1ce7f026a82934901ac386ae46505c3dde`; all v224 and
earlier overnight repairs remain. PR278 is preserved pending integration review.
Strategy/Print now require current execution and both-team identity before showing
an observed attempt; My Data export preserves archived reports without calling them
current coaching. [Scope and verification](docs/release/STRATEGY_CONTEXT_2026-10-20.md).

Development-only scripted switching has 63 reference/admission cases; public and
automatic switching remain unavailable. Natural Cure/Regenerator switch-out fixes
have 64 reference cases. The v224 full project, battle and accuracy gates passed;
v225 independent reviews, 6-game/7-pair browser audit and aggregate gate pass
(238 fast + 12 offline DB files; four helpers skipped). Exact hosted-head results
are tracked in PR279; prior-head checks are not final-head proof. Publication for draft review is
authorized; merge/deployment and live DB/security changes remain unauthorized.
Client mechanics, full regulation approval and live DB gates remain open. See the
[consolidated acceptance register](docs/release/CONTINUATION_ACCEPTANCE_2026-10-20.md)
and [explicit-grant assessment](docs/release/SUPABASE_GRANTS_READINESS_2026-10-20.md).

v2.2.217-current-moves / engine 1.1.21 is draft PR278, not deployed.
Current Practice uses the September 9 official move removals and PP corrections;
Slash species eligibility remains pinned-reference evidence. Unsupported Fly
blocks execution and aggregate recommendations while saved teams remain editable.
[Repair scope and checks](docs/release/CURRENT_MOVES_AND_FLY_2026-10-17.md).

