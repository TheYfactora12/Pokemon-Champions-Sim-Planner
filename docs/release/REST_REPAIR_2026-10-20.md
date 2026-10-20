# Scoped Rest repair

Candidate v2.2.229-rest / engine 1.1.31 follows 2669c065ec97c9c55128ac6e30b5b7af1e1e57fb. Ordinary Rest uses three before-action countdowns, effective Early Bird decrements twice, and Sleep Talk cannot heal/reset Rest while already asleep. Self action identity and failed-move state are retained. Insomnia/Vital Spirit use effective Gas/Shield handling; Comatose remains blocking.

The initial 32 tests all failed before implementation and passed afterward against installed Showdown and separately compiled upstream 9b136a8c8cdb860a8ab96fa063f906604e352547. Twelve admission cases additionally pass against the installed reference. Source: data/moves.ts Rest, data/conditions.ts slp, Champions inherited before-move sleep handler. Existing reference dependency and lockfile are unchanged. Exact upstream execution requires NODE_PATH to existing poke-sim/node_modules; the first invocation without it failed dependency resolution and was corrected, not counted as a mechanics failure.

Independent read-only battle review reproduced 32/32 in each reference and found no blocker for this scope. Added direct called-Rest failure flag/event assertions. Generic sleep distribution, switch/re-entry, cure then subsequent sleep, broader ally/terrain immunity and failed-Rest follow-on numeric damage remain unproved. Synthetic abilities are not legal-team or current-client proof. No client footage was verified.

Contract passes with 66 cases: 18 covered, 43 partial, 5 open. Full project and battle checks are running; hosted checks for this candidate have not run. Bundle is 11,533,929 bytes, below the unchanged 11 MiB ceiling. No golden traces changed. Competitive release remains NO-GO, including new independent S1-S4 evidence survivors on the preceding checkpoint.
