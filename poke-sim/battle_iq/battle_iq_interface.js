/**
 * Battle IQ JS interface skeleton.
 * Keep all modules pure where possible and backward-compatible.
 */

(function() {
  "use strict";

  const BATTLE_IQ_SCHEMA_VERSION = 'battle_iq_v1';

  const BASE_WEIGHTS = {
    lead_iq: 0.12,
    turn1_iq: 0.13,
    speed_control_iq: 0.13,
    resource_iq: 0.14,
    threat_recognition_iq: 0.14,
    win_condition_iq: 0.14,
    endgame_iq: 0.10,
    risk_discipline_iq: 0.10,
  };

  function ensureNumeric(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function safePercent(value, total) {
    if (!Number.isFinite(total) || total <= 0) {
      return 0;
    }
    return Math.max(0, Math.min(100, (value / total) * 100));
  }

  function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, ensureNumeric(value, min)));
  }

  function computeBand(standardScore) {
    if (standardScore >= 130) return 'Elite Battle IQ';
    if (standardScore >= 120) return 'Advanced';
    if (standardScore >= 110) return 'Strong';
    if (standardScore >= 90) return 'Average / Developing';
    if (standardScore >= 80) return 'Needs Focus';
    return 'Major Coaching Opportunity';
  }

  function provisionalScore(raw) {
    return 100 + ((ensureNumeric(raw, 70) - 70) / 15) * 15;
  }

  function evaluateContext(context = {}) {
    return {
      archetype_player: context.archetype_player || null,
      archetype_opponent: context.archetype_opponent || null,
      matchup_class: context.matchup_class || 'unknown',
      difficulty: ensureNumeric(context.difficulty, 0),
      norm_group_key: context.norm_group_key || null,
      norm_ready: !!context.norm_ready,
    };
  }

  function buildSubscoreBundle(name, { raw = 70, numerator = 0, denominator = 0, positives = [], negatives = [], confidence = 1, evidence = [] } = {}) {
    const rawClamped = clamp(ensureNumeric(raw, 70));
    return {
      name,
      raw_score_0_100: rawClamped,
      standard_score: provisionalScore(rawClamped),
      numerator,
      denominator,
      confidence: clamp(ensureNumeric(confidence, 1), 0, 1),
      positives,
      negatives,
      evidence,
    };
  }

  function buildComposite(subscores, weights = BASE_WEIGHTS) {
    const active = subscores.filter(Boolean);
    let totalWeight = 0;
    let weightedSum = 0;

    active.forEach((s) => {
      const w = ensureNumeric(weights[s.name], 0);
      if (w > 0) {
        weightedSum += ensureNumeric(s.raw_score_0_100, 70) * w;
        totalWeight += w;
      }
    });

    if (totalWeight <= 0) {
      return {
        composite_raw_0_100: 70,
        composite_standard_score: 100,
        provisional: true,
        rationale: 'insufficient active subscore coverage',
      };
    }

    const raw = weightedSum / totalWeight;
    const standardScore = provisionalScore(raw);
    return {
      composite_raw_0_100: clamp(raw),
      composite_standard_score: standardScore,
      provisional: false,
      rationale: 'weighted composite computed',
    };
  }

  function buildConfidence({ completeness = 0, team_visibility = 0, turns_seen = 0, sample_size = 1, context_certainty = 0 } = {}) {
    const c = clamp(ensureNumeric(completeness, 0));
    const v = clamp(ensureNumeric(team_visibility, 0));
    const t = clamp(ensureNumeric(turns_seen, 0));
    const s = clamp(Math.min(1, sample_size / 10));
    const cx = clamp(ensureNumeric(context_certainty, 0));

    const score = (c * 0.30) + (v * 0.20) + (t * 0.20) + (s * 0.20) + (cx * 0.10);
    const level = score >= 0.78 ? 'high' : score >= 0.55 ? 'medium' : 'low';

    return {
      confidence_level: level,
      confidence_score: clamp(score),
      provisional: level === 'low',
      reason_codes: level === 'low' ? ['low_evidence_density'] : [],
    };
  }

  function buildSummaryPayload(iq, subscores = [], options = {}) {
    const topRaised = subscores
      .slice()
      .sort((a, b) => b.raw_score_0_100 - a.raw_score_0_100)
      .slice(0, 2)
      .map((s) => s.name);

    const topLowered = subscores
      .slice()
      .sort((a, b) => a.raw_score_0_100 - b.raw_score_0_100)
      .slice(0, 2)
      .map((s) => s.name);

    return {
      top_raised_subscores: topRaised,
      top_lowered_subscores: topLowered,
      band: computeBand(iq.composite_standard_score || 100),
      coaching_drill: options.drill || 'Build safer lines in high-pressure early turns',
      coach_tone: 'evidence-first',
    };
  }

  function buildBattleIQReport(rawResult = {}, context = {}, options = {}) {
    const subscores = options.subscores || [];
    const composite = buildComposite(subscores, options.weights || BASE_WEIGHTS);
    const confidence = buildConfidence(options.confidence_input || {});
    const contextInfo = evaluateContext(context);

    const iq = {
      raw_score_0_100: composite.composite_raw_0_100,
      standard_score: composite.composite_standard_score,
      band: computeBand(composite.composite_standard_score),
      percentile: null,
      ci_95_lo: null,
      ci_95_hi: null,
      confidence,
      provisional: !!composite.provisional,
      source: options.source || 'simulation',
      created_at: options.created_at || new Date().toISOString(),
    };

    const summary = buildSummaryPayload(iq, subscores, options);

    return {
      schema_version: options.schema_version || BATTLE_IQ_SCHEMA_VERSION,
      engine_version: options.engine_version || 'local-v1',
      context: contextInfo,
      matchup_context: contextInfo,
      composite: iq,
      subscores,
      summary,
      top_factors: {
        raised: summary.top_raised_subscores,
        lowered: summary.top_lowered_subscores,
      },
      drill_recommendation: summary.coaching_drill,
    };
  }

  const BattleIQAPI = {
    BATTLE_IQ_SCHEMA_VERSION,
    BASE_WEIGHTS,
    clamp,
    safePercent,
    computeBand,
    provisionalScore,
    evaluateContext,
    buildSubscoreBundle,
    buildComposite,
    buildConfidence,
    buildSummaryPayload,
    buildBattleIQReport,
  };

  if (typeof window !== 'undefined') {
    window.BattleIQAPI = window.BattleIQAPI || {};
    window.BattleIQAPI.v1 = BattleIQAPI;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BattleIQAPI;
  }
})();
