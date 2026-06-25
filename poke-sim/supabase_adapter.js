// supabase_adapter.js — Champions Sim v1 (M3: init / source-of-truth)
// Thin Supabase layer. Falls back to local silently if credentials missing or disabled.
// Load AFTER data.js, engine.js, ui.js — and AFTER supabase-js CDN script.
//
// Credentials injected via window.__SUPABASE_URL__ and window.__SUPABASE_KEY__
// Set these in index.html <script> block — do NOT hardcode here.
//   Original cred wiring: 2026-04-27 by TheYfactora12 (commit 001b37b)
//   Security hardening:   2026-04-27 by TheYfactora12 (commit effad08) —
//                         removed hardcoded fallbacks; inject at runtime only.
//   M3 refactor:          2026-04-27 — adds __DISABLE_SUPABASE__ test override,
//                                      loadRulesets(), explicit init contract.
//                                      Ownership of TEAMS-merge moved to ui.js.

(function () {
  'use strict';

  // ── Config ────────────────────────────────────────────────────────────────
  // Credentials must be injected at runtime — no hardcoded fallbacks.
  // In index.html, add before this script loads:
  //
  //     window.__SUPABASE_URL__ = 'https://ymlahqnshgiarpbgxehp.supabase.co';
  //     window.__SUPABASE_KEY__ = '<your-anon-key>';
  //
  // (See index.html credential block for the full inline snippet.)
  //
  // Tests / sandboxes can also set window.__DISABLE_SUPABASE__ = true to force
  // the adapter into local-only mode regardless of injected creds (defense-in-
  // depth: even if a future change re-introduces hardcoded creds, this flag
  // still wins).
  const DISABLED = !!(typeof window !== 'undefined' && window.__DISABLE_SUPABASE__);

  const SUPABASE_URL = DISABLED
    ? null
    : (typeof window !== 'undefined' ? window.__SUPABASE_URL__ : undefined);
  const SUPABASE_KEY = DISABLED
    ? null
    : (typeof window !== 'undefined' ? window.__SUPABASE_KEY__ : undefined);
  const ENABLED = !!(SUPABASE_URL && SUPABASE_KEY) && !DISABLED;
  const log = (typeof window !== 'undefined' && window.ChampionsSim && window.ChampionsSim.logger)
    ? window.ChampionsSim.logger.for('persistence')
    : { debug(){}, info(){}, warn(){}, error(){} };

  // Canonical ruleset_id — must match seed_teams_v2.sql (M2)
  const DEFAULT_RULESET_ID = 'champions_reg_m_doubles_bo3';

  if (!ENABLED) {
    log.info('No credentials; running in local-only mode');
  }

  // ── Supabase client ───────────────────────────────────────────────────────
  let _client = null;
  function getClient() {
    if (_client) return _client;
    if (!ENABLED) return null;
    if (typeof window.supabase === 'undefined') {
      log.warn('supabase-js not loaded');
      return null;
    }
    _client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    return _client;
  }

  // ── UUID helper ───────────────────────────────────────────────────────────
  function uuid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function normalizeDbError(err) {
    if (!err) return null;
    if (typeof err === 'string') return err;

    var details = {
      name: err.name || null,
      message: err.message || null,
      code: err.code || null,
      details: err.details || null,
      hint: err.hint || null,
      status: err.status || null,
      statusText: err.statusText || null
    };

    if (err.cause) {
      details.cause = normalizeDbError(err.cause);
    }
    if (typeof err.stack === 'string') {
      details.stack = err.stack;
    }

    var hasValue = false;
    Object.keys(details).forEach(function(key) {
      if (details[key] !== null && details[key] !== undefined && details[key] !== '') {
        hasValue = true;
      }
    });
    if (hasValue) return details;

    try {
      return JSON.parse(JSON.stringify(err));
    } catch (_e) {
      return String(err);
    }
  }

  // ── loadTeamsFromDB ───────────────────────────────────────────────────────
  // Returns {[team_id]: {team_id, name, label, description, source, metadata, members[]}}
  // or null if disabled / errored. NEVER throws.
  async function loadTeamsFromDB() {
    const sb = getClient();
    if (!sb) return null;
    try {
      const { data: teams, error: tErr } = await sb
        .from('teams')
        .select('*');
      if (tErr) throw tErr;

      const { data: members, error: mErr } = await sb
        .from('team_members')
        .select('*')
        .order('slot', { ascending: true });
      if (mErr) throw mErr;

      const memberMap = {};
      for (const m of (members || [])) {
        if (!memberMap[m.team_id]) memberMap[m.team_id] = [];
        memberMap[m.team_id].push({
          name:     m.species,
          item:     m.item      || '',
          ability:  m.ability   || '',
          nature:   m.nature    || '',
          level:    m.level     || 50,
          evs:      m.evs       || {},
          moves:    m.moves     || [],
          teraType: m.tera_type || '',
          role:     m.role_tag  || ''
        });
      }

      const result = {};
      for (const t of (teams || [])) {
        const rulesetId = t.ruleset_id || (t.metadata && t.metadata.ruleset_id) || DEFAULT_RULESET_ID;
        result[t.team_id] = {
          team_id:     t.team_id,
          name:        t.name,
          label:       t.label,
          description: t.description,
          source:      t.source,
          ruleset_id:  rulesetId,
          format:      t.format || 'champions',
          legality_status: t.legality_status || 'legal_inferred',
          metadata:    Object.assign({ ruleset_id: rulesetId }, t.metadata || {}),
          members:     memberMap[t.team_id] || []
        };
      }
      log.info('Loaded teams from DB', { count: Object.keys(result).length });
      return result;
    } catch (err) {
      log.warn('loadTeamsFromDB failed; using local data', err);
      return null;
    }
  }

  // ── loadRulesets ──────────────────────────────────────────────────────────
  // Returns array of ruleset rows (or [] if disabled / errored). NEVER throws.
  async function loadRulesets() {
    const sb = getClient();
    if (!sb) return [];
    try {
      const { data, error } = await sb
        .from('rulesets')
        .select('*');
      if (error) throw error;
      return data || [];
    } catch (err) {
      log.warn('loadRulesets failed', err);
      return [];
    }
  }

  // ── saveAnalysis ──────────────────────────────────────────────────────────
  const VALID_BO = [1, 3, 5, 10];

  async function saveAnalysis(payload) {
    const sb = getClient();
    if (!sb) return null;

    if (!payload || VALID_BO.indexOf(payload.bo) === -1) {
      log.warn('saveAnalysis rejected: invalid bo', { bo: payload && payload.bo });
      return null;
    }
    if (!payload.policy_model || typeof payload.policy_model !== 'string') {
      log.warn('saveAnalysis rejected: policy_model must be non-empty string');
      return null;
    }
    if (typeof payload.win_rate === 'number' && (payload.win_rate < 0 || payload.win_rate > 1)) {
      log.warn('saveAnalysis rejected: win_rate out of range', { win_rate: payload.win_rate });
      return null;
    }

    const analysis_id = uuid();
    const row = {
      analysis_id,
      engine_version:    payload.engine_version   || 'v1',
      ruleset_id:        payload.ruleset_id        || DEFAULT_RULESET_ID,
      player_team_id:    payload.player_team_id,
      opp_team_id:       payload.opp_team_id,
      prior_id:          payload.prior_id          || null,
      policy_model:      payload.policy_model      || 'random',
      sample_size:       payload.sample_size       || 0,
      bo:                payload.bo                || 1,
      win_rate:          payload.win_rate          || 0,
      wins:              payload.wins              || 0,
      losses:            payload.losses            || 0,
      draws:             payload.draws             || 0,
      avg_turns:         payload.avg_turns         || 0,
      avg_tr_turns:      payload.avg_tr_turns      || 0,
      ci_low:            payload.ci_low            || null,
      ci_high:           payload.ci_high           || null,
      hidden_info_model: payload.hidden_info_model  || null,
      analysis_json:     payload.analysis_json     || {}
    };

    try {
      const { error: aErr } = await sb.from('analyses').insert(row);
      if (aErr) throw aErr;

      if (payload.win_conditions && payload.win_conditions.length) {
        const wcRows = payload.win_conditions.map(wc => ({
          analysis_id,
          label: wc.label,
          count: wc.count
        }));
        const { error: wcErr } = await sb.from('analysis_win_conditions').insert(wcRows);
        if (wcErr) log.warn('win_conditions insert error', wcErr);
      }

      if (payload.logs && payload.logs.length) {
        const logRows = payload.logs.slice(0, 50).map((l, i) => ({
          analysis_id,
          log_index:     i,
          result:        l.result        || 'unknown',
          turns:         l.turns         || 0,
          tr_turns:      l.tr_turns      || 0,
          win_condition: l.win_condition || null,
          log:           l.log           || {}
        }));
        const { error: lErr } = await sb.from('analysis_logs').insert(logRows);
        if (lErr) log.warn('logs insert error', lErr);
      }

      log.info('Saved analysis', { analysis_id });
      return analysis_id;
    } catch (err) {
      log.warn('saveAnalysis failed; result not persisted', err);
      return null;
    }
  }

  // ── loadRecentAnalyses ────────────────────────────────────────────────────
  async function loadRecentAnalyses(limit) {
    limit = limit || 20;
    const sb = getClient();
    if (!sb) return [];
    try {
      const { data, error } = await sb
        .from('analyses')
        .select('analysis_id, created_at, player_team_id, opp_team_id, bo, win_rate, wins, losses, sample_size')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    } catch (err) {
      log.warn('loadRecentAnalyses failed', err);
      return [];
    }
  }

  // ── saveTeam (M5) ────────────────────────────────────────────────────────
  async function saveTeam(payload) {
    const sb = getClient();
    if (!sb) return null;

    if (!payload || !payload.team_id || !payload.name) {
      log.warn('saveTeam rejected: team_id and name required');
      return null;
    }

    const teamRow = {
      team_id:     payload.team_id,
      name:        payload.name,
      label:       payload.label        || 'CUSTOM',
      mode:        payload.mode         || 'opponent',
      ruleset_id:  payload.ruleset_id   || DEFAULT_RULESET_ID,
      source:      payload.source       || 'unknown',
      description: payload.description  || '',
      metadata:    payload.metadata     || { source: payload.source || 'unknown' }
    };

    try {
      const { error: tErr } = await sb.from('teams').upsert(teamRow);
      if (tErr) throw tErr;

      // Delete existing members then re-insert (normalized replace)
      await sb.from('team_members').delete().eq('team_id', payload.team_id);

      if (payload.members && payload.members.length) {
        const memberRows = payload.members.map(function(m, i) {
          return {
            team_id:    payload.team_id,
            slot_index: i,
            species:    m.species || m.name || 'Unknown',
            ability:    m.ability || null,
            item:       m.item    || null,
            nature:     m.nature  || null,
            evs:        m.evs     || null,
            ivs:        m.ivs     || null,
            moves:      m.moves   || [],
            level:      m.level   || 50,
            tera_type:  m.tera_type || m.teraType || null
          };
        });
        const { error: mErr } = await sb.from('team_members').insert(memberRows);
        if (mErr) log.warn('team_members insert error', mErr);
      }

      log.info('Saved team', { team_id: payload.team_id });
      return payload.team_id;
    } catch (err) {
      log.warn('saveTeam failed; team not persisted', err);
      return null;
    }
  }

  // ── loadAnalysesForPlayer (M6) ───────────────────────────────────────────
  async function loadAnalysesForPlayer(playerKey, limit) {
    limit = limit || 50;
    const sb = getClient();
    if (!sb) return [];
    try {
      const { data, error } = await sb
        .from('analyses')
        .select('analysis_id, created_at, player_team_id, opp_team_id, bo, win_rate, wins, losses, sample_size')
        .eq('player_team_id', playerKey)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    } catch (err) {
      log.warn('loadAnalysesForPlayer failed', err);
      return [];
    }
  }

  // ── loadAnalysisLogs (M6) — lazy-load turn logs for a single analysis ──
  async function loadAnalysisLogs(analysisId) {
    const sb = getClient();
    if (!sb) return [];
    try {
      const { data, error } = await sb
        .from('analysis_logs')
        .select('game_number, result, turns, tr_turns, win_condition, log')
        .eq('analysis_id', analysisId)
        .order('game_number', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (err) {
      log.warn('loadAnalysisLogs failed', err);
      return [];
    }
  }

  // ── M8: Load prior snapshot for hidden-info inference ───────────────────
  // Returns the most recent prior_snapshots row for the given format where
  // month ≤ targetMonth. Returns null if none found or on error (fail-soft).
  async function loadPriorSnapshot(format, targetMonth) {
    var sb = getClient();
    if (!sb) return null;
    try {
      var { data, error } = await sb
        .from('prior_snapshots')
        .select('*')
        .eq('format', format)
        .lte('month', targetMonth)
        .order('month', { ascending: false })
        .limit(1)
        .single();
      if (error) throw error;
      return data || null;
    } catch (err) {
      log.warn('loadPriorSnapshot failed', err);
      return null;
    }
  }

  // ── Showdown DB status probe ──────────────────────────────────────────────
  // Lightweight Overview-tab check. It proves whether the approved Showdown
  // views are reachable without loading the full mirrored data set.
  const SHOWDOWN_ENTITY_KINDS = [
    'species',
    'moves',
    'abilities',
    'items',
    'learnsets',
    'formats',
    'aliases',
    'typechart'
  ];

  function normalizeShowdownKind(kind) {
    if (kind === 'moves') return 'move';
    if (kind === 'abilities') return 'ability';
    if (kind === 'items') return 'item';
    if (kind === 'learnsets') return 'learnset';
    if (kind === 'formats') return 'format';
    if (kind === 'aliases') return 'alias';
    return kind;
  }

  async function loadShowdownDbStatus() {
    var sb = getClient();
    if (!sb) {
      return { enabled: false, available: false, mode: 'static', message: 'Static bundle' };
    }
    try {
      var approved = await sb
        .from('approved_showdown_entities')
        .select('entity_kind,entity_key,approved_at')
        .limit(1);
      if (approved.error) throw approved.error;

      var latestRun = null;
      try {
        var runs = await sb
          .from('showdown_sync_runs')
          .select('sync_run_id,status,finished_at,summary')
          .order('finished_at', { ascending: false })
          .limit(1);
        if (!runs.error && runs.data && runs.data.length) latestRun = runs.data[0];
      } catch (_runErr) {
        latestRun = null;
      }

      return {
        enabled: true,
        available: true,
        mode: approved.data && approved.data.length ? 'approved-db' : 'empty-db',
        approvedSample: approved.data && approved.data[0] ? approved.data[0] : null,
        latestRun: latestRun,
        message: approved.data && approved.data.length ? 'Approved DB rows' : 'DB views empty'
      };
    } catch (err) {
      log.warn('loadShowdownDbStatus failed', err);
      return { enabled: true, available: false, mode: 'missing-db', message: 'Showdown DB unavailable' };
    }
  }

  // Read-only inspector for the Overview tab. This intentionally uses only
  // anon-role SELECTs against approved views/audit rows; browser code never
  // uploads, approves, or receives service-role credentials.
  async function loadShowdownDbSnapshot() {
    var sb = getClient();
    if (!sb) {
      return { enabled: false, available: false, mode: 'static', message: 'Static bundle' };
    }
    try {
      var status = await loadShowdownDbStatus();
      if (!status || !status.available) return status;

      var sample = await sb
        .from('approved_showdown_entities')
        .select('sync_run_id,entity_kind,entity_key,display_name,source_hash,approved_at,created_at')
        .order('entity_kind', { ascending: true })
        .order('entity_key', { ascending: true })
        .limit(12);
      if (sample.error) throw sample.error;

      var countResults = await Promise.all(SHOWDOWN_ENTITY_KINDS.map(function(kind) {
        return sb
          .from('approved_showdown_entities')
          .select('entity_id', { count: 'exact', head: true })
          .eq('entity_kind', normalizeShowdownKind(kind))
          .then(function(result) {
            return { kind: kind, count: result && !result.error ? (result.count || 0) : null };
          })
          .catch(function() {
            return { kind: kind, count: null };
          });
      }));

      var sourceFiles = [];
      if (status.latestRun && status.latestRun.sync_run_id) {
        try {
          var files = await sb
            .from('showdown_source_files')
            .select('source_name,source_hash,normalized_hash,byte_size,parse_status,fetched_at')
            .eq('sync_run_id', status.latestRun.sync_run_id)
            .order('source_name', { ascending: true })
            .limit(20);
          if (!files.error && files.data) sourceFiles = files.data;
        } catch (_fileErr) {
          sourceFiles = [];
        }
      }

      return {
        enabled: true,
        available: true,
        mode: status.mode,
        message: status.message,
        latestRun: status.latestRun || null,
        approvedSample: sample.data || [],
        approvedCounts: countResults,
        sourceFiles: sourceFiles
      };
    } catch (err) {
      log.warn('loadShowdownDbSnapshot failed', err);
      return { enabled: true, available: false, mode: 'missing-db', message: 'Showdown DB unavailable' };
    }
  }

  async function loadBranchCoverageSummary(filters) {
    var sb = getClient();
    if (!sb) return [];
    filters = filters || {};
    try {
      var query = sb
        .from('branch_coverage_runs')
        .select('branch_key,player_team_id,opponent_team_id,player_leads,opponent_leads,player_bring,opponent_bring,forced_actions,tactical_summary,run_count,last_seen_at,result,turns,outcome_signature,outcome_drift_count')
        .order('last_seen_at', { ascending: false })
        .limit(filters.limit || 5000);
      if (filters.player_team_id) query = query.eq('player_team_id', filters.player_team_id);
      if (filters.opponent_team_id) query = query.eq('opponent_team_id', filters.opponent_team_id);
      var result = await query;
      if (result.error) throw result.error;
      return result.data || [];
    } catch (err) {
      log.warn('loadBranchCoverageSummary failed', err);
      return [];
    }
  }

  async function saveBranchCoverageRuns(payload) {
    var sb = getClient();
    if (!sb) return { enabled: false, saved: 0, updated: 0, inserted: 0 };
    payload = payload || {};
    var runs = Array.isArray(payload.runs) ? payload.runs.filter(function(run) {
      return run && run.branch_key;
    }) : [];
    if (!runs.length) return { enabled: true, saved: 0, updated: 0, inserted: 0 };

    try {
      var keys = runs.map(function(run) { return run.branch_key; });
      var existingResult = await sb
        .from('branch_coverage_runs')
        .select('branch_key,run_count,outcome_signature,outcome_drift_count')
        .in('branch_key', keys);
      if (existingResult.error) throw existingResult.error;

      var existing = {};
      (existingResult.data || []).forEach(function(row) {
        existing[row.branch_key] = {
          run_count: Number(row.run_count || 0),
          outcome_signature: row.outcome_signature || null,
          outcome_drift_count: Number(row.outcome_drift_count || 0)
        };
      });

      var rowsToWrite = [];
      var seenInBatch = Object.create(null);
      var inserted = 0;
      var updated = 0;
      for (var i = 0; i < runs.length; i++) {
        var run = runs[i];
        if (seenInBatch[run.branch_key]) continue;
        seenInBatch[run.branch_key] = true;
        var row = {
          branch_key: run.branch_key,
          ruleset_id: payload.ruleset_id || DEFAULT_RULESET_ID,
          player_team_id: payload.player_team_id || run.player_team_id || null,
          opponent_team_id: payload.opponent_team_id || run.opponent_team_id || null,
          player_leads: Array.isArray(run.player_bring) ? run.player_bring.slice(0, 2) : [],
          opponent_leads: Array.isArray(run.opponent_bring) ? run.opponent_bring.slice(0, 2) : [],
          player_bring: run.player_bring || [],
          opponent_bring: run.opponent_bring || [],
          forced_actions: run.forced_actions || [],
          tactical_summary: run.tactical_summary || {},
          qa_coverage_summary: run.qa_coverage_summary || {},
          result: run.result || null,
          turns: run.turns || 0,
          outcome_signature: run.outcome_signature || null,
          build_id: payload.build_id || null,
          source_url: payload.source_url || null,
          last_seen_at: new Date().toISOString()
        };
        var prior = existing[run.branch_key] || {};
        var priorOutcome = prior.outcome_signature || null;
        var changed = !!(priorOutcome && row.outcome_signature && priorOutcome !== row.outcome_signature);
        if (Object.prototype.hasOwnProperty.call(existing, run.branch_key)) {
          row.run_count = Number(prior.run_count || 0) + 1;
          row.outcome_drift_count = Number(prior.outcome_drift_count || 0) + (changed ? 1 : 0);
          updated++;
        } else {
          row.run_count = 1;
          row.outcome_drift_count = 0;
          inserted++;
        }
        rowsToWrite.push(row);
      }
      if (!rowsToWrite.length) {
        return { enabled: true, saved: 0, updated: 0, inserted: 0 };
      }
      var saveChunkSize = 80;
      var saveResult = { enabled: true, saved: 0, updated: 0, inserted: 0, errors: [] };

      for (var i = 0; i < rowsToWrite.length; i += saveChunkSize) {
        var chunk = rowsToWrite.slice(i, i + saveChunkSize);
        if (!chunk.length) continue;
        var chunkUpdated = 0;
        var chunkInserted = 0;
        for (var c = 0; c < chunk.length; c++) {
          var row = chunk[c] || {};
          if (existing[row.branch_key]) chunkUpdated += 1;
          else chunkInserted += 1;
        }
        var upsertResult = await sb
          .from('branch_coverage_runs')
          .upsert(chunk, { onConflict: 'branch_key' });
        if (upsertResult && upsertResult.error) {
          saveResult.errors.push(normalizeDbError(upsertResult.error));
        } else {
          saveResult.saved += chunk.length;
          saveResult.updated += chunkUpdated;
          saveResult.inserted += chunkInserted;
        }
      }

      if (saveResult.errors.length) {
        saveResult.error = 'one_or_more_branch_coverage_chunk_writes_failed';
        return saveResult;
      }
      return saveResult;
    } catch (err) {
      log.warn('saveBranchCoverageRuns failed', err);
      return {
        enabled: true,
        saved: 0,
        updated: 0,
        inserted: 0,
        error: normalizeDbError(err)
      };
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────
  window.SupabaseAdapter = {
    enabled:            ENABLED,
    DEFAULT_RULESET_ID: DEFAULT_RULESET_ID,
    loadTeamsFromDB,
    loadRulesets,
    saveAnalysis,
    loadRecentAnalyses,
    saveTeam,
    loadAnalysesForPlayer,
    loadAnalysisLogs,
    loadPriorSnapshot,
    loadShowdownDbStatus,
    loadShowdownDbSnapshot,
    loadBranchCoverageSummary,
    saveBranchCoverageRuns
  };

  // M3 NOTE: Auto-merge of DB teams into TEAMS has moved to ui.js's
  // DOMContentLoaded handler so that rebuildTeamSelects() is awaited
  // (no flash of static teams). See ui.js — search for
  // "M3 — DB init: source-of-truth merge".

})();
