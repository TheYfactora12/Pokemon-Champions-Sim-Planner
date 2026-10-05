# Public practice release checklist

Owner: main implementer; independent mechanics/security/release review remains
required for the applicable changes. No deadline overrides a failed gate.
This is the October 5 execution queue, not competitive M-C approval.
STATUS.md owns proof state; source/project-roadmap.json owns milestone direction.

## Ordered work

1. [ ] Selection and identity: reproduce startup opponent changes; preserve
   registered ability, item, stats and bring-four through engine construction,
   result tables and exports. Known constructor diagnostic:
   `node poke-sim/tools/diagnose-mega-ability.cjs`. Add failing boundary tests
   before changes. Cover base-selected and legacy Mega-selected abilities,
   imports, alternate valid abilities and actual transformation separately.
2. [ ] Export and replay: v166 fixes nested disclosure and URL lifecycle only.
   Obtain a real downloaded file, validate exact run/build/seed/team identity
   and compare every displayed event; retain a human-readable report and raw
   machine evidence. No download event means unverified, not success.
3. [ ] Coaching: replace one-game Avoid/Favorable and unsupported best-lead
   assertions with observations and uncertainty; fix escaped HTML markup.
4. [ ] Team-building guards: same checks for bundled and imported sets; reject
   invalid stats/moves/items/abilities and preserve unknown legality labels.
   Historical teams stay historical rather than being silently rewritten.
5. [ ] User journey: desktop and mobile portrait/landscape choose/check/run/
   inspect/edit flow, accessible controls, no selection loss, clear errors.
6. [ ] Release review: hosted CI on exact SHA, applicable live security and
   ownership evidence, dependency review, external asset hashes and rollback.
7. [ ] Deploy and verify: only after prior gates; compare deployed artifact,
   cache identity and required assets, then repeat battle/export/user-flow QA.

## Production Alignment Checkpoint

Before declaring a release live, run from the tested checkout:

```powershell
node poke-sim/tools/check-production-alignment.cjs
```

Require exit 0 and retain the JSON report with the reviewed commit SHA and
Pages run URL. It verifies local manifest integrity, live build identity,
repository bundle provenance, deployed HTML hash/size and every declared
external asset. Pages intentionally injects runtime configuration, so deployed
HTML is checked against its deployed hash and repository provenance separately.
This is not independent attestation of the deployed manifest or browser-cache,
database, UI or simulation correctness. Repeat the visible user journey after
artifact verification. A failed or unavailable check must not be called aligned.

October 5 HTTP checkpoint: local v172 versus live/main v142, mismatch. Four
v172 external assets returned 404. No deployment performed by this check.

## Preservation Rules

- No branch deletion, force push, destructive DB cleanup or bulk issue closure.
- Keep dated audits as history; append supersession links instead of deleting
  contrary evidence. Historical percentages are not current readiness claims.
- Regenerate roadmap Markdown/browser data from the shared JSON source.
- Preserve main's news-only publishing and new feed commits when reconciling.
- Close a finding only with its named regression and environment evidence.

## LinkedIn sharing gate

Describe the release as experimental practice, not certified M-C strategy or
99% accuracy. Provide known limitations and an identifiable feedback path.
Do not invite broader use on the strength of candidate-only test results.
Private evidence must not be posted publicly by default.
