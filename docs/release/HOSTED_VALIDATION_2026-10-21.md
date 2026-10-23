# Hosted validation boundary and proposed preview

Draft completion is not launch completion. The existing CI browser job serves
127.0.0.1 inside the runner, checks actual loaded bytes and compares visible replay
with exports. It uploads evidence, not a deployed website. The remote auditor
continues to deny unknown origins; no preview hostname has been approved.

Read-only inspection at2026-10-21T02:35:55Z found production main/deployed commit
1620ed14188ec87bc082d49b093d72bf793aee81, v2.2.216-beta-feedback, bundle11530211bytes
SHA2569059bbd907067d990c3d7792ba9227c870176cebabb2b96e9f2c06aef27ef197.
HTTP bytes matched the committed artifact. Pages run39502064984 passed. Only the
github-pages environment was found in the latest100deployments. The current draft
is not deployed there. No live DB records were queried or modified.

The concrete proposed isolated target is a NEW private ChatGPT Sites project on
the existing connected account, proposed slug pokemon-champions-preview, expected
hostname pattern <slug>.kevinemail12.chatgpt.site. The service must return the
actual hostname before it is placed in an explicit allowlist. No Site was created
or published. Private automated access needs separately authorized site-scoped
authentication; no bypass token was generated. A public audience is not implied.
Existing unrelated Sites must not be reused or changed.

Current official documentation says Plus/Pro Sites hosting is included and building
uses Codex limits; no paid upgrade is authorized. See
https://help.openai.com/en/articles/20001339-creating-and-using-chatgpt-sites and
https://openai.com/policies/chatgpt-sites-terms/ . A private Sites deployment is
still a real publication requiring the requested approval, not merely a local
preview. Its source export will contain only allowlisted static runtime assets and
synthetic fixtures, with local-only credentials and no production DB/secrets.

Required release proof is now separate from loopback CI: hosted-preview-e2e,
production-smoke and rollback-verification. Each requires a remote HTTPS origin,
explicit environment, immutable source commit/bundle/external hashes, deployment
and publication-approval references, dated parsed inputs, fresh-profile journeys,
cache upgrade and offline reload. Preview must have a different origin from
production. Rollback requires a reviewed previous commit/artifact. Null targets
in source/hosted-validation-targets.json block enrollment; a localhost receipt,
missing stage, wrong commit or false journey cannot become READY. Existing package
signature approval remains mandatory. No remote receipt currently exists.

After preview approval: bind the returned exact origin and frozen bundle hash,
prepare a narrow remote auditor mode retaining deny-unknown-origin and read-only
network guards, publish that reviewed artifact, then exercise team construction,
validation, simulation, replay/export comparison, reload/cache/offline and mobile
layout using synthetic data. Production smoke runs only after separately approved
merge/deployment, against exact production bytes. Rollback must be authorized and
verified independently; a candidate CI pass cannot stand in for either operation.

Same-origin paths are not isolated: localStorage and CacheStorage are origin-wide.
The service-worker candidate now deletes only obsolete champions-sim-/
champions-sprites- caches and tests coexistence with unrelated apps. This repair
has not been deployed and does not make same-origin preview copies safe.

The predeployment check uses --predeployment and can return only PREDEPLOY_ELIGIBLE,
never READY. It still requires authenticated review, client/mechanics evidence and
actual isolated preview evidence. The final default check additionally requires
production smoke and rollback verification after separately authorized deployment.
This prevents a circular demand for production smoke before deployment; it does
not authorize deployment or waive final launch gates.
