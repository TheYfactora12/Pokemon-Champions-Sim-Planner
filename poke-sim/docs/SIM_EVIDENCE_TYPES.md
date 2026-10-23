# Simulation evidence record types

Reference documentation moved from sim_evidence.js to keep browser payload within its unchanged size budget. Runtime contracts are enforced by its validators.

```js
  /** @typedef {'team_vs_team'|'team_vs_leaderboard'|'archetype_sweep'|'full_leaderboard_recalc'|'qa_regression'} SimJobType */
  /** @typedef {'queued'|'running'|'completed'|'failed'|'cancelled'} SimJobStatus */
  /** @typedef {'ko'|'timer'|'forfeit'|'draw'|'error'} SimResultReason */
  /**
   * @typedef {Object} SimJob
   * @property {string=} id
   * @property {SimJobType} job_type
   * @property {string} regulation_id
   * @property {string} ruleset_version
   * @property {string} engine_version
   * @property {'singles'|'doubles'} format
   * @property {string[]} team_ids
   * @property {string[]=} opponent_team_ids
   * @property {string[]=} opponent_archetypes
   * @property {number} games_per_matchup
   * @property {SimJobStatus} status
   * @property {Object=} status_report
   * @property {string[]=} confidence_flags
   * @property {string[]=} source_gaps
   */
  /**
   * @typedef {Object} ReplayRecord
   * @property {string=} id
   * @property {string=} sim_run_id
   * @property {string=} job_id
   * @property {string} team_a_id
   * @property {string} team_b_id
   * @property {string} regulation_id
   * @property {'singles'|'doubles'} format
   * @property {string} engine_version
   * @property {string} ruleset_version
   * @property {string} seed
   * @property {string=} winner_team_id
   * @property {SimResultReason} result_reason
   * @property {number=} turns
   * @property {Object[]} event_log
   * @property {Object[]=} turn_log
   * @property {Object[]=} damage_events
   * @property {Object[]=} effect_events
   * @property {Object=} qa_coverage_summary
   * @property {string[]=} confidence_flags
   * @property {string[]=} source_gaps
   */
   /**
    * @typedef {Object} ReplayEvidenceSummary
    * @property {number} events
    * @property {number} turns
    * @property {number} damage_events
    * @property {number} effect_events
    * @property {boolean} has_qa_coverage
    * @property {string[]} confidence_flags
    * @property {string[]} source_gaps
    */

```
