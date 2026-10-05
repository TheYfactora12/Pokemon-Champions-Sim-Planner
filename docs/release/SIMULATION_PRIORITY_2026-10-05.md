# Simulation-First Queue

User direction: prioritize doubles simulation and trustworthy team inputs over
login/private-save feature work. Security findings remain open release gates.
No accuracy percentage or production approval is implied.

## Ordered Work

1. Input integrity: reject malformed spreads; ensure accepted inputs produce
   the same runtime stats across editor, import and saved presets.
2. Catalog truth: retain historical teams, clearly distinguish reference
   rejection, reference acceptance and official approval. Do not invent missing
   tournament spreads or silently alter registered teams.
3. Mechanics: expand reference-backed complete games and documented outstanding
   interaction cases, rather than treating battle volume as accuracy.
4. Evidence: pair actual downloaded replays with visible events and preserve
   seed, build, ruleset, selected participants and stable member identity.
5. Results: verify stale-report invalidation, team identity and coaching claims
   against the evidence actually retained.
6. Release: rerun desktop/mobile journeys, hosted CI and deployed artifact
   comparison after review. Resolve security gates before broad public release;
   synchronize Alfredo only after verified production deployment.

## This Candidate

Build v2.2.173-stat-input-guard; engine 1.1.15. Not deployed.

- Reproduced coercible SP values (`true`, arrays, blanks) and unknown stat keys
  being accepted by the shared validator. Reject them while retaining valid
  numeric strings and partial spreads.
- Independent review reproduced numeric-string concatenation in runtime stats:
  Blastoise with HP SP `"32"` produced `"793275"` HP instead of 186. Construct
  a fresh numeric runtime spread without changing registered input.
- Added rejection/no-persistence tests and imported numeric-string versus numeric
  construction equivalence, including all five non-HP stats and HP.
- Reran catalog audit: 20/34 bundled teams reference-rejected, 14 accepted but
  not approved; all 13 tournament-review teams incomplete. This is pinned
  reference evidence, not a new official source review or live DB audit.
- Preserved the October 4 combined report: the audit tool defaults to its dated
  output directory and a rerun without a DB snapshot drops previous DB sections.
  Restored only those tool-generated changes; no historical evidence discarded.

## Newly Confirmed Follow-Ups

- Paste parser accepts fragments: `-1 HP` becomes 1, `1.5 HP` becomes 5, and
  unknown stat labels are dropped. Preserve explicit parse errors through intake
  and prove rejected teams are not persisted. Not fixed by the JSON guard.
- Shared callers using `evs || {}` mask false/zero/empty-string whole spreads;
  JSON import has an earlier shape guard, but direct-call consistency remains.
- Audit output should require an explicit destination or preserve prior scopes
  when rerunning without a database snapshot.

## Independent Validation

- 204 bundled members: numeric/string runtime HP and five non-HP stats agree;
  changing runtime spreads does not mutate registration.
- 68 numeric/string paired games: complete results match.
- 272 before/after pairs against f17fc03: RNG draws and complete results match
  excluding engine version (136 Champions and 136 synthetic SV compatibility).
- 10 import, 47 spread/stat and 56 damage-oracle checks passed in independent
  review. Scoped battle-audit runner and release external-asset checks pass.
- Battle manifest remains bounded: 18 covered, 23 partial, five open edge cases.
  The full project gate and hosted results are recorded separately in STATUS.md.

Validation results belong in STATUS.md and IMP-0061. Local tests do not prove
official regulation approval, browser replay parity or production alignment.
