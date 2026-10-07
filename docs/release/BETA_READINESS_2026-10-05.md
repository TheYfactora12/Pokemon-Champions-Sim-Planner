# Beta Readiness

## Decision

Keep Preview until the remaining core journeys below pass. Target a limited
local-save practice beta, not a verified competitive simulator. A beta may have
known limitations, but must disclose them and preserve users' teams and evidence.
No universal or 99% accuracy claim is supported.

## Shipped Evidence

Latest checkpoint, October 6: v179 shipped through PR215 (fe5a44a), successful
Pages run 37552163599 and exact HTTP artifact comparison (October 7 00:31 UTC).
Live desktop onboarding sample preview and disposable-team save/reload passed.
#214 closed. Local phone testing passed, but the live viewport override did not
apply; live phone save/reload is still unproved (#211/#213). A 12-turn production
battle exposed #216 (unsupported Tailwind win attribution); its download timed
out, so the visible/export comparison remains open. Candidate v180 addresses
the label, not battle mechanics. Earlier release evidence follows for history.

- PR195 merged as 90bff31; Pages run 37371824754 completed successfully.
- October 5, 20:51:17 UTC: production artifact checks matched local v176,
  with zero errors. Includes the required external asset checks.
- Live browser DOM confirms v176/local roster, retro opening and animation
  pause control, news navigation and corrected Strategy move-evidence wording.
  DOM inspection does not establish smooth animation or complete visual QA.
- Local full gate: 192 fast files and 12 offline DB files passed; live DB
  verification remains separate. No new interactive battles in this review.

## Before The Beta Label

- [ ] Prove old-cache upgrade preserves saved teams and replay history.
- [ ] Export a team, verify downloaded content and test import round trip.
- [ ] Complete mobile edit/save/reload without clipping or data loss.
- [ ] Run a deployed practice battle and pair downloaded events with visible log.
- [ ] Publish clear experimental/local-only limits, feedback route and rollback reference.
- [ ] Disposition remaining included-feature findings; do not infer legality or accuracy from deployment.

Official M-C approval, expanded mechanics parity, stable-ID coaching and live
database confidentiality remain separate open work. Do not advertise cloud saves
in this release. Alfredo is not a verified failover until independently checked.

## Traceability

### October 5 Follow-Up

Local v177 fixes #211 editor intrinsic sizing. Browser measurements after
opening Typhlosion-Hisui: client/scroll widths 315/315, 385/385, 763/763 and
1275/1275 at requested 320, 390, 768 and 1280 viewports. No overflow hiding;
grid tracks and inputs shrink. Static regression protects sizing contracts;
it is not a substitute for browser layout proof. Save/reload still open.

Feedback email: intentionally unset at user request. Do not invent an address,
create a mailbox, or present a nonfunctional contact link as working. Before
public beta, owner supplies the address and a delivery/reply test confirms it.
Feedback template should request build, format, steps, expected/actual behavior
and an optional redacted replay; never passwords or private account credentials.

Release tracking: TheYfactora12/Pokemon-Champions-Sim-Planner#103.
Strategy follow-up: TheYfactora12/Pokemon-Champions-Sim-Planner#209.
The last successful earlier Pages revision was 45c9e282b1a288609ced4d136d7461509d899256;
review its connected configuration before rollback, rather than silently restoring
database access. The safer incident response may be a reviewed corrective release.
