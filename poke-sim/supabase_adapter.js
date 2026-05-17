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

  function resolveAccessTier(user) {
    var appMeta = (user && user.app_metadata) || {};
    var userMeta = (user && user.user_metadata) || {};
    var tier = appMeta.subscription_tier || userMeta.subscription_tier || appMeta.role || userMeta.role || 'free';
    tier = String(tier || 'free').toLowerCase();
    if (['premium', 'admin', 'qa', 'qa_admin'].indexOf(tier) >= 0) return 'premium';
    return 'free';
  }

  function normalizeAuthState(session) {
    var user = session && session.user ? session.user : null;
    var accessTier = resolveAccessTier(user);
    return {
      authenticated: !!user,
      user_id: user ? user.id : null,
      email: user ? (user.email || '') : '',
      access_tier: accessTier,
      is_premium: accessTier === 'premium',
      session_expires_at: session ? (session.expires_at || null) : null
    };
  }

  // ── UUID helper ───────────────────────────────────────────────────────────
  function uuid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
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
        result[t.team_id] = {
          team_id:     t.team_id,
          name:        t.name,
          label:       t.label,
          description: t.description,
          source:      t.source,
          metadata:    t.metadata || {},
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

  async function saveTeamProfile(payload) {
    const sb = getClient();
    if (!sb) return null;
    if (!payload || !payload.team_profile_id || !payload.display_name) {
      log.warn('saveTeamProfile rejected: team_profile_id and display_name required');
      return null;
    }
    const row = {
      team_profile_id: payload.team_profile_id,
      user_id: payload.user_id || null,
      display_name: payload.display_name,
      canonical_format: payload.canonical_format || null,
      canonical_ruleset: payload.canonical_ruleset || null,
      metadata: payload.metadata || {}
    };
    try {
      const { error } = await sb.from('team_profiles').upsert(row);
      if (error) throw error;
      return payload.team_profile_id;
    } catch (err) {
      log.warn('saveTeamProfile failed; profile not persisted', err);
      return null;
    }
  }

  async function saveTeamVersion(payload) {
    const sb = getClient();
    if (!sb) return null;
    if (!payload || !payload.team_version_id || !payload.team_profile_id) {
      log.warn('saveTeamVersion rejected: team_version_id and team_profile_id required');
      return null;
    }
    const row = {
      team_version_id: payload.team_version_id,
      team_profile_id: payload.team_profile_id,
      version_label: payload.version_label || null,
      fingerprint_hash: payload.fingerprint_hash || null,
      format: payload.format || null,
      ruleset_id: payload.ruleset_id || null,
      source: payload.source || null,
      team_payload: payload.team_payload || {}
    };
    try {
      const { error } = await sb.from('team_versions').upsert(row);
      if (error) throw error;
      return payload.team_version_id;
    } catch (err) {
      log.warn('saveTeamVersion failed; version not persisted', err);
      return null;
    }
  }

  async function saveTeamRunSnapshot(payload) {
    const sb = getClient();
    if (!sb) return null;
    if (!payload || !payload.team_run_snapshot_id) {
      log.warn('saveTeamRunSnapshot rejected: team_run_snapshot_id required');
      return null;
    }
    const row = {
      team_run_snapshot_id: payload.team_run_snapshot_id,
      team_profile_id: payload.team_profile_id || null,
      team_version_id: payload.team_version_id || null,
      opponent_fingerprint: payload.opponent_fingerprint || null,
      opponent_team_key: payload.opponent_team_key || null,
      format: payload.format || null,
      ruleset_id: payload.ruleset_id || null,
      bo: payload.bo || null,
      source: payload.source || null,
      sim_summary: payload.sim_summary || {},
      strategy_summary: payload.strategy_summary || {}
    };
    try {
      const { error } = await sb.from('team_run_snapshots').upsert(row);
      if (error) throw error;
      return payload.team_run_snapshot_id;
    } catch (err) {
      log.warn('saveTeamRunSnapshot failed; snapshot not persisted', err);
      return null;
    }
  }

  async function saveReplayArtifact(payload) {
    const sb = getClient();
    if (!sb) return null;
    if (!payload || !payload.replay_artifact_id) {
      log.warn('saveReplayArtifact rejected: replay_artifact_id required');
      return null;
    }
    const row = {
      replay_artifact_id: payload.replay_artifact_id,
      user_id: payload.user_id || null,
      source_type: payload.source_type || 'showdown_log',
      source_url: payload.source_url || null,
      format: payload.format || null,
      ruleset_profile: payload.ruleset_profile || null,
      player_fingerprint: payload.player_fingerprint || null,
      opponent_fingerprint: payload.opponent_fingerprint || null,
      normalized_summary: payload.normalized_summary || {},
      raw_log_saved: !!payload.raw_log_saved
    };
    try {
      const { error } = await sb.from('replay_artifacts').upsert(row);
      if (error) throw error;
      return payload.replay_artifact_id;
    } catch (err) {
      log.warn('saveReplayArtifact failed; replay not persisted', err);
      return null;
    }
  }

  async function saveReplayTeamMatch(payload) {
    const sb = getClient();
    if (!sb) return null;
    if (!payload || !payload.replay_team_match_id || !payload.replay_artifact_id) {
      log.warn('saveReplayTeamMatch rejected: replay_team_match_id and replay_artifact_id required');
      return null;
    }
    const row = {
      replay_team_match_id: payload.replay_team_match_id,
      replay_artifact_id: payload.replay_artifact_id,
      team_profile_id: payload.team_profile_id || null,
      team_version_id: payload.team_version_id || null,
      match_status: payload.match_status || 'unknown',
      similarity_score: payload.similarity_score || 0,
      confidence: payload.confidence || 'low',
      evidence_json: payload.evidence_json || {}
    };
    try {
      const { error } = await sb.from('replay_team_matches').upsert(row);
      if (error) throw error;
      return payload.replay_team_match_id;
    } catch (err) {
      log.warn('saveReplayTeamMatch failed; match not persisted', err);
      return null;
    }
  }

  async function saveReplaySimComparison(payload) {
    const sb = getClient();
    if (!sb) return null;
    if (!payload || !payload.replay_sim_comparison_id || !payload.replay_artifact_id) {
      log.warn('saveReplaySimComparison rejected: replay_sim_comparison_id and replay_artifact_id required');
      return null;
    }
    const row = {
      replay_sim_comparison_id: payload.replay_sim_comparison_id,
      replay_artifact_id: payload.replay_artifact_id,
      team_run_snapshot_id: payload.team_run_snapshot_id || null,
      team_profile_id: payload.team_profile_id || null,
      team_version_id: payload.team_version_id || null,
      comparison_status: payload.comparison_status || 'needs_sim_data',
      calibration_action: payload.calibration_action || 'none',
      confidence: payload.confidence || 'low',
      summary_json: payload.summary_json || {}
    };
    try {
      const { error } = await sb.from('replay_sim_comparisons').upsert(row);
      if (error) throw error;
      return payload.replay_sim_comparison_id;
    } catch (err) {
      log.warn('saveReplaySimComparison failed; comparison not persisted', err);
      return null;
    }
  }

  async function saveCoachingReport(payload) {
    const sb = getClient();
    if (!sb) return null;
    if (!payload || !payload.coaching_report_id) {
      log.warn('saveCoachingReport rejected: coaching_report_id required');
      return null;
    }
    const row = {
      coaching_report_id: payload.coaching_report_id,
      replay_artifact_id: payload.replay_artifact_id || null,
      team_profile_id: payload.team_profile_id || null,
      team_version_id: payload.team_version_id || null,
      report_type: payload.report_type || 'battle_sensei_replay',
      confidence: payload.confidence || 'low',
      report_summary: payload.report_summary || {}
    };
    try {
      const { error } = await sb.from('coaching_reports').upsert(row);
      if (error) throw error;
      return payload.coaching_report_id;
    } catch (err) {
      log.warn('saveCoachingReport failed; report not persisted', err);
      return null;
    }
  }

  async function saveReplayHistoryBundle(payload) {
    const sb = getClient();
    if (!sb || !payload) return null;
    const result = {
      team_profile_id: null,
      team_version_id: null,
      team_run_snapshot_id: null,
      replay_artifact_id: null,
      replay_team_match_id: null,
      replay_sim_comparison_id: null,
      coaching_report_id: null
    };
    try {
      if (payload.teamProfile) result.team_profile_id = await saveTeamProfile(payload.teamProfile);
      if (payload.teamVersion) result.team_version_id = await saveTeamVersion(payload.teamVersion);
      if (payload.teamRunSnapshot) result.team_run_snapshot_id = await saveTeamRunSnapshot(payload.teamRunSnapshot);
      if (payload.replayArtifact) result.replay_artifact_id = await saveReplayArtifact(payload.replayArtifact);
      if (payload.replayTeamMatch) result.replay_team_match_id = await saveReplayTeamMatch(payload.replayTeamMatch);
      if (payload.replaySimComparison) result.replay_sim_comparison_id = await saveReplaySimComparison(payload.replaySimComparison);
      if (payload.coachingReport) result.coaching_report_id = await saveCoachingReport(payload.coachingReport);
      return result;
    } catch (err) {
      log.warn('saveReplayHistoryBundle failed', err);
      return result;
    }
  }

  async function getAuthState() {
    const sb = getClient();
    if (!sb || !sb.auth || typeof sb.auth.getSession !== 'function') {
      return normalizeAuthState(null);
    }
    try {
      const { data, error } = await sb.auth.getSession();
      if (error) throw error;
      return normalizeAuthState(data && data.session ? data.session : null);
    } catch (err) {
      log.warn('getAuthState failed', err);
      return normalizeAuthState(null);
    }
  }

  async function signIn(email, password) {
    const sb = getClient();
    if (!sb || !sb.auth || typeof sb.auth.signInWithPassword !== 'function') {
      return { ok: false, message: 'Auth is not available in this build.' };
    }
    try {
      const { data, error } = await sb.auth.signInWithPassword({ email: email, password: password });
      if (error) throw error;
      return { ok: true, auth: normalizeAuthState(data && data.session ? data.session : null) };
    } catch (err) {
      log.warn('signIn failed', err);
      return { ok: false, message: err && err.message ? err.message : 'Sign in failed.' };
    }
  }

  async function signOut() {
    const sb = getClient();
    if (!sb || !sb.auth || typeof sb.auth.signOut !== 'function') {
      return { ok: false, message: 'Auth is not available in this build.' };
    }
    try {
      const { error } = await sb.auth.signOut();
      if (error) throw error;
      return { ok: true };
    } catch (err) {
      log.warn('signOut failed', err);
      return { ok: false, message: err && err.message ? err.message : 'Sign out failed.' };
    }
  }

  function onAuthStateChange(callback) {
    const sb = getClient();
    if (!sb || !sb.auth || typeof sb.auth.onAuthStateChange !== 'function' || typeof callback !== 'function') {
      return { data: { subscription: { unsubscribe: function(){} } } };
    }
    return sb.auth.onAuthStateChange(function(_event, session) {
      try { callback(normalizeAuthState(session)); } catch (err) { log.warn('onAuthStateChange callback failed', err); }
    });
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

  // ── Public API ────────────────────────────────────────────────────────────
  window.SupabaseAdapter = {
    enabled:            ENABLED,
    DEFAULT_RULESET_ID: DEFAULT_RULESET_ID,
    loadTeamsFromDB,
    loadRulesets,
    saveAnalysis,
    loadRecentAnalyses,
    saveTeam,
    saveTeamProfile,
    saveTeamVersion,
    saveTeamRunSnapshot,
    saveReplayArtifact,
    saveReplayTeamMatch,
    saveReplaySimComparison,
    saveCoachingReport,
    saveReplayHistoryBundle,
    getAuthState,
    signIn,
    signOut,
    onAuthStateChange,
    loadAnalysesForPlayer,
    loadAnalysisLogs,
    loadPriorSnapshot
  };

  // M3 NOTE: Auto-merge of DB teams into TEAMS has moved to ui.js's
  // DOMContentLoaded handler so that rebuildTeamSelects() is awaited
  // (no flash of static teams). See ui.js — search for
  // "M3 — DB init: source-of-truth merge".

})();
