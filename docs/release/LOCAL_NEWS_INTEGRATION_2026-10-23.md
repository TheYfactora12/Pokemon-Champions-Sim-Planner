# Local news integration candidate

Release-only content reconciliation of frozen `ceec7941023514d36c1dc0b06bd96cdce99d9665` with main `b0092cf0fcb08c12d3de79b35c45ef6c77c9b4a3`. Main's seven newer commits change only news_feed.js and its generated bundle/manifest. The imported news blob is exactly `fcd017def2a09f2051654a3eabac4153e42febb2`. The bundle and artifact manifest were regenerated together with tools/build-bundle.py; neither conflicting manifest was selected as the result.

The existing v2.2.248-eviolite-activation runtime identity is retained for this news-only refresh, consistent with the existing news-sync process. Bundle: 11,532,727 bytes; SHA256 `3f9afa6c038962851ab4c430bfc9509746b5a647788ef7a27b17fb0e12ffa682`. No simulator mechanics or release gate changed. Frozen checkout remains unchanged.

Local Git transport failed before fetching main (`getaddrinfo() thread failed to start`). Main's read-only GitHub compare supplied the exact news delta. This is content reconciliation, not a merge commit: main's ancestry still needs integration once Git transport is available. Do not claim GitHub mergeability has been repaired.

Validation: news resilience 4/4 passed; release identity 11/12 passed. The remaining Windows checkout-filter fixture failed because its sandbox temporary Git repository could not write .git/config (Permission denied). This is a failed gate, not a pass or waiver. No alternate temporary path or retry was attempted. The full aggregate includes this owning fixture and remains unrun pending environment resolution. No hosted, preview, deployment, current-client or whole-inventory verification is implied.

Publication is held until local gates and independent review pass. Existing preview credential/provenance and 78 hosted regression gates remain separate. No credentials, security settings, remote writes, merge or deployment occurred in this preparation.

Improvement record: RELEASE-NEWS-RECONCILIATION-20261023. Preserve current news by verifying its exact blob, then regenerate all dependent release bytes rather than resolving an artifact conflict by choosing a stale manifest. Remaining action: obtain a working authorized test environment for the blocked checkout fixture and Git transport, then complete aggregate/review before publication.
