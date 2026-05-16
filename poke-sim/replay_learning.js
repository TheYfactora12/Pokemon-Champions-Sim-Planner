// Battle Sensei learning layer.
// Consumes parsed Showdown logs + rule tags and turns them into practice-focused coaching.
(function(root) {
  var ChampionsSim = root.ChampionsSim = root.ChampionsSim || {};
  ChampionsSim.replayLearning = ChampionsSim.replayLearning || {};

  function escText(v) { return String(v == null ? '' : v).trim(); }

  function gradeFromScore(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  var BATTLE_IQ_WEIGHTS = {
    lead_iq: 0.12,
    turn_1_iq: 0.13,
    speed_control_iq: 0.13,
    resource_iq: 0.14,
    threat_recognition_iq: 0.14,
    win_condition_iq: 0.14,
    endgame_iq: 0.10,
    risk_discipline_iq: 0.10
  };

  var BATTLE_IQ_LABELS = {
    lead_iq: 'Lead IQ',
    turn_1_iq: 'Turn 1 IQ',
    speed_control_iq: 'Speed Control IQ',
    resource_iq: 'Resource IQ',
    threat_recognition_iq: 'Threat Recognition IQ',
    win_condition_iq: 'Win Condition IQ',
    endgame_iq: 'Endgame IQ',
    risk_discipline_iq: 'Risk Discipline IQ'
  };

  function clampScore(n) {
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function standardFromRaw(raw) {
    return Math.max(55, Math.min(145, Math.round(100 + (raw - 70))));
  }

  function battleIqBand(score) {
    if (score >= 130) return 'Elite Battle IQ';
    if (score >= 120) return 'Advanced';
    if (score >= 110) return 'Strong';
    if (score >= 90) return 'Average / Developing';
    if (score >= 80) return 'Needs Focus';
    return 'Major Coaching Opportunity';
  }

  function erfApprox(x) {
    var sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    var a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    var t = 1 / (1 + p * x);
    var y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  }

  function percentileFromStandard(score) {
    var z = (score - 100) / 15;
    return Math.max(1, Math.min(99, Math.round(100 * 0.5 * (1 + erfApprox(z / Math.SQRT2)))));
  }

  function issueWeight(issue) {
    if (!issue) return 0;
    if (issue.severity === 'high') return 18;
    if (issue.severity === 'medium') return 10;
    if (issue.severity === 'low') return 4;
    return 6;
  }

  function confidenceFor(parsed, issues) {
    parsed = parsed || {};
    if (!parsed.ok || !parsed.turns || parsed.turns.length < 2) return 'low';
    if ((parsed.warnings || []).length || (issues || []).some(function(i) { return i.confidence === 'low'; })) return 'medium';
    return 'high';
  }

  function evidenceTier(confidence, evidenceCount) {
    if (confidence === 'high' && evidenceCount >= 2) return 'observed';
    if ((confidence === 'high' || confidence === 'medium') && evidenceCount >= 1) return 'strong_inference';
    if (confidence === 'medium') return 'weak_inference';
    return 'needs_more_data';
  }

  function evidenceLabel(tier) {
    var labels = {
      observed: 'Observed',
      strong_inference: 'Strong inference',
      weak_inference: 'Weak inference',
      needs_more_data: 'Needs more data'
    };
    return labels[tier] || 'Needs more data';
  }

  function buildEvidenceStandard(parsed, review) {
    var issues = (review && review.coachingTags) || [];
    var confidence = confidenceFor(parsed, issues);
    var evidenceCount = 0;
    if (parsed && parsed.leads && parsed.leads.p1 && parsed.leads.p1.length && parsed.leads.p2 && parsed.leads.p2.length) evidenceCount++;
    if (parsed && parsed.teamPreview && ((parsed.teamPreview.p1 || []).length || (parsed.teamPreview.p2 || []).length)) evidenceCount++;
    if (parsed && parsed.turns && parsed.turns.length >= 2) evidenceCount++;
    if (issues.some(function(i) { return i && i.evidence; })) evidenceCount++;
    var tier = evidenceTier(confidence, evidenceCount);
    return {
      priority: 'Observable battle evidence first; supported inference second; speculation last or not at all.',
      tier: tier,
      label: evidenceLabel(tier),
      confidence: confidence,
      rule: 'If evidence is weak, lower confidence, avoid hard claims, and recommend additional battles.',
      opponentIntentRule: 'Never invent opponent intent. Infer likely strategic intent only from common archetype behavior, board state, move sequencing, and revealed information.',
      evidenceCount: evidenceCount,
      missingData: (parsed && parsed.warnings || []).slice()
    };
  }

  function confidenceIntervalFor(confidence) {
    if (confidence === 'high') return 5;
    if (confidence === 'medium') return 8;
    return 12;
  }

  function battleIqConfidenceFor(parsed, issues, sampleSize) {
    var base = confidenceFor(parsed, issues);
    if (base === 'low') return 'low';
    if ((sampleSize || 1) < 5) return 'medium';
    return base;
  }

  function categoryForIssue(issue) {
    var id = issue && issue.id || '';
    var map = {
      bad_lead: 'Lead Selection',
      questionable_bring: 'Lead Selection',
      win_condition_exposed: 'Win Condition Misread',
      speed_control_without_pressure: 'Speed Control Error',
      field_control_failure: 'Speed Control Error',
      protect_misuse: 'Resource Misuse',
      switch_tempo_loss: 'Switching Error',
      targeting_error: 'Targeting Error',
      endgame_misplay: 'Endgame Conversion Error',
      rng_material: 'Risk Management Error'
    };
    return map[id] || (issue && issue.category) || 'Matchup Knowledge Gap';
  }

  function riskForIssue(issue) {
    if (!issue) return 'medium';
    if (issue.severity === 'high') return 'high';
    if (issue.severity === 'low') return 'low';
    return 'medium';
  }

  function decisionScore(issue) {
    var base = 8;
    if (!issue) return base;
    if (issue.severity === 'high') base = 4;
    else if (issue.severity === 'medium') base = 6;
    else if (issue.severity === 'low') base = 7;
    if (issue.id === 'rng_material') base = 7;
    if (issue.confidence === 'low') base += 1;
    return Math.max(1, Math.min(10, base));
  }

  function outcomeQuality(parsed, issue) {
    if (issue && issue.id === 'rng_material') return 'bad outcome / variance check';
    if (parsed && parsed.result === 'win' && issue && issue.severity !== 'high') return 'good outcome';
    if (parsed && parsed.result === 'loss') return 'bad outcome';
    return 'mixed outcome';
  }

  function buildDecisionQuality(parsed, review) {
    var issues = (review && review.coachingTags) || [];
    return issues.slice(0, 8).map(function(issue) {
      var score = decisionScore(issue);
      var outcome = outcomeQuality(parsed, issue);
      var quadrant = score >= 7
        ? (String(outcome).indexOf('bad') >= 0 ? 'good decision / bad outcome' : 'good decision / good outcome')
        : (String(outcome).indexOf('good') >= 0 ? 'bad decision / good outcome' : 'bad decision / bad outcome');
      return {
        turn: issue.turn || null,
        category: categoryForIssue(issue),
        issueId: issue.id,
        decisionQualityScore: score,
        outcomeQuality: outcome,
        matrixQuadrant: quadrant,
        riskLevel: riskForIssue(issue),
        whatHappened: issue.whatHappened || issue.message || '',
        alternativeLine: issue.doInstead || issue.recommendation || '',
        whyAlternativeMayBeBetter: issue.whyMattered || 'It protects decision quality even when the immediate outcome is uncertain.',
        confidence: issue.confidence || 'medium'
      };
    });
  }

  function turnIssueScore(issue) {
    var score = issueWeight(issue);
    if (issue && issue.id === 'bad_lead') score += 4;
    if (issue && issue.id === 'win_condition_exposed') score += 8;
    if (issue && issue.id === 'endgame_misplay') score += 6;
    return score;
  }

  function buildCriticalTurns(parsed, review) {
    parsed = parsed || {};
    review = review || {};
    var issues = (review.coachingTags || []).filter(function(i) { return i && i.turn != null; });
    var timeline = review.turnTimeline || [];
    var confidence = confidenceFor(parsed, issues);
    if (!issues.length) {
      return {
        confidence: confidence,
        firstMistake: null,
        fatalMistake: null,
        biggestSwing: null,
        turns: [],
        note: confidence === 'low' ? 'Needs more data before naming a critical turn.' : 'No clear critical mistake was detected.'
      };
    }

    var ranked = issues.slice().sort(function(a, b) {
      var ds = turnIssueScore(b) - turnIssueScore(a);
      if (ds !== 0) return ds;
      return (a.turn || 0) - (b.turn || 0);
    });
    var firstMistake = issues.find(function(i) { return i.severity !== 'low'; }) || issues[0];
    var fatalMistake = ranked[0] || firstMistake;
    var swingRow = timeline.slice().sort(function(a, b) {
      var am = ((a.metrics || {}).yourFaints || 0) * 3 + ((a.metrics || {}).opponentMoves || 0) - ((a.metrics || {}).opponentFaints || 0) * 2;
      var bm = ((b.metrics || {}).yourFaints || 0) * 3 + ((b.metrics || {}).opponentMoves || 0) - ((b.metrics || {}).opponentFaints || 0) * 2;
      return bm - am;
    })[0] || null;
    var swingIssue = swingRow ? issues.find(function(i) { return i.turn === swingRow.turn; }) : null;
    var biggestSwing = swingIssue || fatalMistake;

    function card(kind, issue) {
      if (!issue) return null;
      return {
        kind: kind,
        turn: issue.turn,
        category: categoryForIssue(issue),
        issueId: issue.id,
        whatHappened: issue.whatHappened || issue.message || '',
        whyItMattered: issue.whyMattered || '',
        betterAlternative: issue.doInstead || issue.recommendation || '',
        confidence: confidence === 'low' ? 'low' : (issue.confidence || confidence),
        timelineAnchor: 'turn-' + issue.turn
      };
    }

    return {
      confidence: confidence,
      firstMistake: card('First mistake', firstMistake),
      fatalMistake: card('Fatal mistake', fatalMistake),
      biggestSwing: card('Biggest swing', biggestSwing),
      turns: [card('First mistake', firstMistake), card('Fatal mistake', fatalMistake), card('Biggest swing', biggestSwing)].filter(Boolean),
      note: firstMistake && fatalMistake && firstMistake.turn !== fatalMistake.turn
        ? 'First mistake and fatal mistake differ; the game likely became harder before it became unrecoverable.'
        : 'First mistake and fatal mistake may be the same turn from this log.'
    };
  }

  function buildScorecard(parsed, review) {
    var issues = (review && review.coachingTags) || [];
    function scoreFor(ids, base) {
      return Math.max(45, base - issues.filter(function(i) { return ids.indexOf(i.id) >= 0; }).reduce(function(sum, i) { return sum + issueWeight(i); }, 0));
    }
    var cards = [
      { label: 'Lead Selection', score: scoreFor(['bad_lead', 'questionable_bring'], 88) },
      { label: 'Turn 1 Plan', score: scoreFor(['bad_lead', 'targeting_error', 'field_control_failure'], 86) },
      { label: 'Speed Control', score: scoreFor(['speed_control_without_pressure', 'field_control_failure'], 86) },
      { label: 'Resource Management', score: scoreFor(['protect_misuse', 'switch_tempo_loss', 'rng_material'], 84) },
      { label: 'Endgame Conversion', score: scoreFor(['endgame_misplay', 'win_condition_exposed'], 86) }
    ];
    var overall = Math.round(cards.reduce(function(sum, c) { return sum + c.score; }, 0) / Math.max(1, cards.length));
    cards.forEach(function(c) { c.grade = gradeFromScore(c.score); });
    return {
      overallDecisionQuality: overall,
      overallGrade: gradeFromScore(overall),
      confidence: confidenceFor(parsed, issues),
      cards: cards
    };
  }

  function meaningfulEndgame(parsed, review) {
    parsed = parsed || {};
    var issues = review && review.coachingTags || [];
    return (parsed.totalTurns || 0) >= 4 || issues.some(function(i) { return i.id === 'endgame_misplay'; });
  }

  function buildBattleIqScore(parsed, review, opts) {
    parsed = parsed || {};
    review = review || {};
    opts = opts || {};
    var issues = review.coachingTags || [];
    var confidence = battleIqConfidenceFor(parsed, issues, opts.sampleSize || 1);
    var scores = {};
    var positive = {};
    var negative = {};
    Object.keys(BATTLE_IQ_WEIGHTS).forEach(function(k) {
      scores[k] = 70;
      positive[k] = [];
      negative[k] = [];
    });

    function add(key, points, text) {
      if (!scores.hasOwnProperty(key)) return;
      scores[key] += points;
      if (points >= 0) positive[key].push({ points: points, text: text });
      else negative[key].push({ points: points, text: text });
    }

    var summary = review.summary || {};
    if ((summary.yourLead || []).length && (summary.opponentLead || []).length) add('lead_iq', 8, 'Opening leads were visible enough to evaluate the plan.');
    if (summary.selectedFourConfidence && summary.selectedFourConfidence.level === 'high') add('lead_iq', 5, 'Selected four were inferred with high confidence.');
    if (parsed.result === 'win') add('risk_discipline_iq', 3, 'Result slightly supports execution, but win/loss is not the primary scoring driver.');

    issues.forEach(function(issue) {
      var id = issue.id;
      if (id === 'bad_lead') {
        add('lead_iq', -15, 'Lead gave the opponent too much opening access.');
        add('turn_1_iq', -10, 'Turn 1 plan depended on an interrupt that did not hold.');
        add('threat_recognition_iq', -4, 'Opponent setup threat was not fully answered from preview.');
      } else if (id === 'questionable_bring') {
        add('lead_iq', -5, 'Bring-four evidence was incomplete, so lead quality is less reliable.');
      } else if (id === 'speed_control_without_pressure') {
        add('speed_control_iq', -12, 'Speed control was used without immediate pressure or conversion.');
        add('turn_1_iq', -6, 'Early speed control did not create a clear follow-up.');
      } else if (id === 'field_control_failure') {
        add('speed_control_iq', -15, 'Opponent field or speed control advanced without a meaningful trade.');
        add('threat_recognition_iq', -12, 'The must-answer field threat was not denied or punished.');
        add('turn_1_iq', -8, 'The opening sequence let the opponent establish their plan.');
      } else if (id === 'protect_misuse') {
        add('resource_iq', -8, 'Protect did not clearly preserve the right resource or deny progress.');
        add('risk_discipline_iq', -4, 'The defensive line gave the opponent room to improve position.');
      } else if (id === 'switch_tempo_loss') {
        add('resource_iq', -6, 'Switching did not clearly convert into a stronger resource state.');
        add('risk_discipline_iq', -5, 'The position reset lacked enough fallback pressure.');
      } else if (id === 'targeting_error') {
        add('threat_recognition_iq', -10, 'Targeting spent pressure into a low-value or blocked line.');
        add('turn_1_iq', -8, 'The first action did not answer the immediate threat cleanly.');
        add('risk_discipline_iq', -4, 'The line was fragile if the target interaction failed.');
      } else if (id === 'win_condition_exposed') {
        add('win_condition_iq', -15, 'A key piece for the win path was exposed before its value was converted.');
        add('resource_iq', -10, 'A limited resource was lost without enough compensation.');
      } else if (id === 'endgame_misplay') {
        add('endgame_iq', -15, 'The final exchange did not preserve the closing piece.');
        add('win_condition_iq', -6, 'The late-game win path was not fully protected.');
      } else if (id === 'rng_material') {
        add('risk_discipline_iq', -3, 'Variance appeared, so the prior turn should be checked for safer alternatives.');
      } else if (id === 'lost_exchange') {
        add('resource_iq', -8, 'Material was lost without an immediate trade.');
        add('win_condition_iq', -6, 'The exchange may have weakened the remaining win path.');
      }
    });

    if (!issues.some(function(i) { return i.id === 'speed_control_without_pressure' || i.id === 'field_control_failure'; })) {
      add('speed_control_iq', 6, 'No major speed-control error was detected from this log.');
    }
    if (!issues.some(function(i) { return i.id === 'win_condition_exposed' || i.id === 'endgame_misplay'; })) {
      add('win_condition_iq', 5, 'No clear win-condition abandonment was detected.');
    }
    if (!issues.some(function(i) { return i.id === 'protect_misuse' || i.id === 'switch_tempo_loss'; })) {
      add('resource_iq', 4, 'No major resource misuse was detected from parsed events.');
    }

    Object.keys(scores).forEach(function(k) { scores[k] = clampScore(scores[k]); });
    var weights = Object.assign({}, BATTLE_IQ_WEIGHTS);
    if (!meaningfulEndgame(parsed, review)) {
      var redistributed = weights.endgame_iq / 4;
      weights.endgame_iq = 0;
      weights.turn_1_iq += redistributed;
      weights.resource_iq += redistributed;
      weights.threat_recognition_iq += redistributed;
      weights.win_condition_iq += redistributed;
    }
    var rawComposite = 0;
    Object.keys(weights).forEach(function(k) { rawComposite += scores[k] * weights[k]; });
    rawComposite = clampScore(rawComposite);
    var standard = standardFromRaw(rawComposite);
    var margin = confidenceIntervalFor(confidence);
    var subScores = Object.keys(BATTLE_IQ_LABELS).map(function(k) {
      return {
        id: k,
        label: BATTLE_IQ_LABELS[k],
        rawScore: scores[k],
        standardScore: standardFromRaw(scores[k]),
        confidence: confidence,
        weight: Math.round((weights[k] || 0) * 100),
        positiveEvidence: positive[k].slice(0, 3),
        negativeEvidence: negative[k].slice(0, 3)
      };
    });
    var raisedBy = [];
    var loweredBy = [];
    subScores.forEach(function(s) {
      s.positiveEvidence.forEach(function(e) { raisedBy.push({ area: s.label, points: e.points, text: e.text }); });
      s.negativeEvidence.forEach(function(e) { loweredBy.push({ area: s.label, points: e.points, text: e.text }); });
    });
    raisedBy.sort(function(a, b) { return b.points - a.points; });
    loweredBy.sort(function(a, b) { return a.points - b.points; });
    var weakest = subScores.slice().sort(function(a, b) { return a.rawScore - b.rawScore; })[0];
    var drillIssue = issues.find(function(issue) {
      return categoryForIssue(issue).toLowerCase().indexOf((weakest.label || '').split(' ')[0].toLowerCase()) >= 0;
    }) || issues.slice().sort(function(a, b) { return issueWeight(b) - issueWeight(a); })[0] || null;
    return {
      definition: 'A standardized estimate of game-specific competitive battle intelligence based on observable battle decisions, matchup context, and player execution patterns. This is not a measure of general human intelligence.',
      status: 'Provisional Battle IQ',
      rawComposite: rawComposite,
      standardScore: standard,
      percentile: percentileFromStandard(standard),
      confidence: confidence,
      confidenceInterval: [standard - margin, standard + margin],
      band: battleIqBand(standard),
      subScores: subScores,
      raisedBy: raisedBy.slice(0, 2),
      loweredBy: loweredBy.slice(0, 2),
      recommendedDrill: drillForIssue(drillIssue),
      outcomeBiasProtection: 'Win/loss is only a small modifier. The score prioritizes line quality, resource trade, threat recognition, and win-condition alignment.',
      reliabilityNote: confidence === 'medium' ? 'A single clean battle can support useful coaching, but profile-level Battle IQ needs repeated logs across matchups.' : (confidence === 'low' ? 'This log is too incomplete for strong Battle IQ claims.' : 'Multiple comparable battles support a more reliable Battle IQ estimate.')
    };
  }

  function inferOpponentPlan(parsed, side) {
    parsed = parsed || {};
    var opp = side === 'p1' ? 'p2' : 'p1';
    var oppMoves = [];
    var fieldSignals = [];
    (parsed.turns || []).forEach(function(t) {
      (t.moves || []).forEach(function(m) { if (m.side === opp) oppMoves.push(m.move); });
      (t.field || []).forEach(function(f) {
        if (!f.side || f.side === opp || /trick room|tailwind|weather|terrain/i.test(f.value || f.text || '')) {
          fieldSignals.push(f.value || f.text || f.type || 'field effect');
        }
      });
    });
    var joined = oppMoves.join(' | ');
    var signals = [];
    if (/Trick Room/i.test(joined)) signals.push('establish Trick Room and reverse speed order');
    if (/Tailwind|Icy Wind|Electroweb|Thunder Wave/i.test(joined)) signals.push('control move order');
    if (/Follow Me|Rage Powder/i.test(joined)) signals.push('use redirection to protect setup');
    if (/Helping Hand/i.test(joined)) signals.push('amplify one-slot damage pressure');
    var confidence = confidenceFor(parsed, []);
    var tier = evidenceTier(confidence, signals.length + fieldSignals.length);
    if (!signals.length) {
      return {
        leadGoal: 'Needs more data',
        pressurePattern: 'Not enough observed move sequencing to infer a reliable opponent plan.',
        setupPattern: 'Needs more data',
        baitPattern: 'Needs more data',
        endgamePlan: 'Needs more data',
        recognizeNextTime: 'Upload a fuller log or more battles, then identify the must-answer slot before turn 1.',
        confidence: 'low',
        evidenceTier: 'needs_more_data',
        evidenceLabel: evidenceLabel('needs_more_data'),
        evidence: fieldSignals.slice(0, 4)
      };
    }
    return {
      leadGoal: signals[0],
      pressurePattern: signals.join('; '),
      setupPattern: /Trick Room/i.test(joined) ? 'setup protected by support or redirection' : 'not enough setup evidence from this log',
      baitPattern: /Fake Out|Protect|Follow Me|Rage Powder/i.test(joined) ? 'possible support bait around turn-one protection or redirection' : 'not enough bait evidence',
      endgamePlan: tier === 'observed' || tier === 'strong_inference' ? 'likely preserve the attacker or field state that benefits from the observed opening plan' : 'Needs more data',
      recognizeNextTime: 'Identify the must-answer slot before turn 1, then ask whether your lead still works if Fake Out or Protect fails.',
      confidence: confidence === 'high' ? 'medium' : confidence,
      evidenceTier: tier,
      evidenceLabel: evidenceLabel(tier),
      evidence: signals.concat(fieldSignals).slice(0, 4)
    };
  }

  function normalizeNames(list) {
    return (list || []).map(function(v) { return escText(v).toLowerCase(); }).filter(Boolean);
  }

  function overlapScore(a, b) {
    var aa = normalizeNames(a);
    var bb = normalizeNames(b);
    if (!aa.length || !bb.length) return null;
    var hits = aa.filter(function(x) { return bb.indexOf(x) >= 0; }).length;
    return hits / Math.max(aa.length, bb.length);
  }

  function buildSimComparison(parsed, review, opts) {
    opts = opts || {};
    var plan = opts.simPlan || opts.simRecommendation || opts.simComparison || null;
    var summary = (review && review.summary) || {};
    var actualLead = summary.yourLead || [];
    var actualFour = summary.yourFour || [];
    var noData = {
      status: 'needs_sim_data',
      evidenceTier: 'needs_more_data',
      evidenceLabel: evidenceLabel('needs_more_data'),
      confidence: 'low',
      note: 'No matched simulation recommendation was provided for this replay yet.',
      decisionChange: 'Run or attach the matchup simulation, then compare best sim lead/four/path against the actual replay choices.',
      actualLead: actualLead,
      actualFour: actualFour
    };
    if (!plan) return noData;
    var bestLead = plan.bestLead || plan.recommendedLead || plan.bestSimLead || [];
    var bestFour = plan.bestFour || plan.recommendedFour || plan.bestSimFour || [];
    var expectedWinPath = plan.expectedWinPath || plan.winPath || plan.safestLine || '';
    var leadOverlap = overlapScore(actualLead, bestLead);
    var fourOverlap = overlapScore(actualFour, bestFour);
    var confidence = confidenceFor(parsed, (review && review.coachingTags) || []);
    var evidenceCount = 1 + (leadOverlap != null ? 1 : 0) + (fourOverlap != null ? 1 : 0) + (expectedWinPath ? 1 : 0);
    var tier = evidenceTier(confidence, evidenceCount);
    var firstDeviation = 'Needs more data';
    if (leadOverlap != null && leadOverlap < 1) firstDeviation = 'Actual lead differed from the sim-recommended lead.';
    else if (fourOverlap != null && fourOverlap < 1) firstDeviation = 'Actual selected four differed from the sim-recommended four.';
    else if (expectedWinPath) firstDeviation = 'Lead/four matched; compare turn sequencing against expected win path.';
    return {
      status: 'matched',
      evidenceTier: tier,
      evidenceLabel: evidenceLabel(tier),
      confidence: confidence === 'high' ? 'medium' : confidence,
      actualLead: actualLead,
      bestSimLead: bestLead,
      actualFour: actualFour,
      bestSimFour: bestFour,
      leadMatch: leadOverlap == null ? 'unknown' : Math.round(leadOverlap * 100),
      fourMatch: fourOverlap == null ? 'unknown' : Math.round(fourOverlap * 100),
      expectedWinPath: expectedWinPath || 'Needs sim win-path data',
      actualPath: summary.mainIssue || 'Needs turn review',
      firstDeviation: firstDeviation,
      teamVsPilotDiagnosis: firstDeviation.indexOf('Lead/four matched') === 0 ? 'Pilot or sequencing issue is more likely than team selection, but this remains provisional.' : 'Lead/bring selection may have diverged from the simulated plan; verify with more battles before changing the team.',
      decisionChange: 'Use this comparison to decide whether to test a different lead/four first or practice the same sim plan with cleaner sequencing.'
    };
  }

  function buildWinPath(parsed, review, critical) {
    var side = parsed && parsed.selectedSide || 'p1';
    var summary = (review && review.summary) || {};
    var first = critical && critical.firstMistake;
    var fatal = critical && critical.fatalMistake;
    var leadNames = (summary.yourLead || []).join(' + ') || 'your lead pair';
    return {
      beforeGame: 'Use your selected four to create speed or positioning control, then preserve the Pokemon that converts the endgame.',
      afterLeads: 'With ' + leadNames + ', your first test is whether the lead pressures the opponent plan even if the first interrupt fails.',
      afterKeyTurn: fatal ? 'After turn ' + fatal.turn + ', the win path likely shifted toward recovery: preserve the remaining cleaner and stop further field control.' : 'No key-turn shift was proven from the log.',
      followedOrAbandoned: first && fatal && first.turn !== fatal.turn ? 'The early plan was stressed before the fatal turn. This suggests an execution path problem, not only a last-turn mistake.' : 'The log does not prove a separate abandoned win path.',
      primaryWinCondition: 'Preserve the piece that converts speed control or endgame damage.',
      opponentWinCondition: inferOpponentPlan(parsed, side).leadGoal
    };
  }

  function drillForIssue(issue) {
    var id = issue && issue.id;
    var table = {
      bad_lead: ['Lead Selection Drill', 'Pick leads into five opposing previews before simming; write what each lead denies and what it loses to.', 'A lead is successful when it has a backup plan if Fake Out, Protect, or redirection changes turn 1.'],
      speed_control_without_pressure: ['Speed Control Conversion Drill', 'Play five games where every Tailwind/Trick Room/Icy Wind turn must create damage, a forced Protect, or preservation of the win condition.', 'Convert speed control into pressure within the first two active turns in four of five games.'],
      protect_misuse: ['Protect Timing Drill', 'Review three turns before clicking Protect and name the resource it preserves.', 'Protect is successful when it stalls a field turn, saves the real win condition, or punishes a double target.'],
      switch_tempo_loss: ['Pivot / Reset Drill', 'Practice switching only when it absorbs damage, resets Intimidate/Fake Out, or improves next-turn pressure.', 'Four of five switches should either deny damage or create a stronger next board.'],
      win_condition_exposed: ['Win Condition Identification Drill', 'Before turn 1 and after every KO, name your current closer and the support piece it needs.', 'The closer survives into the endgame in four of five practice games.'],
      endgame_misplay: ['Endgame Conversion Drill', 'Start from late-game board states and choose the target that keeps your closer alive.', 'Convert favorable 2v2 or 2v1 endgames in four of five drills.'],
      targeting_error: ['Threat Recognition Drill', 'Before choosing a target, label the must-answer opposing slot and the bait slot.', 'Avoid spending Fake Out or double targets into a low-value or protected slot in four of five openings.'],
      field_control_failure: ['Trick Room / Field Denial Drill', 'Practice turns where the opponent threatens Trick Room, weather, terrain, or redirection.', 'Either deny the field state or take a meaningful trade on turn 1 in four of five drills.'],
      rng_material: ['Risk Exposure Review', 'Mark the turn before the RNG event and ask whether a lower-risk line existed.', 'Reduce reliance on one roll when a stable line preserves the same win path.']
    };
    var row = table[id] || ['Decision Review Drill', 'Replay the key turn and write one lower-risk alternative.', 'Name what changed and why the alternative improves future decision quality.'];
    return {
      skill: row[0],
      whyItMatters: issue && issue.whyMattered || 'Repeated decision patterns matter more than one result.',
      drillSetup: row[1],
      whatToRepeat: 'Run the same matchup until the decision process is automatic, then test it against a similar archetype.',
      successCriteria: row[2],
      promptBeforeEachTurn: 'What is my win condition, what is the must-answer threat, and what resource am I spending?'
    };
  }

  function buildPracticePlan(review) {
    var issues = ((review && review.coachingTags) || []).slice().sort(function(a, b) { return issueWeight(b) - issueWeight(a); });
    var drills = [];
    var seen = {};
    issues.forEach(function(issue) {
      if (drills.length >= 3 || seen[issue.id]) return;
      seen[issue.id] = true;
      drills.push(drillForIssue(issue));
    });
    if (!drills.length) drills.push(drillForIssue(null));
    return {
      immediateFocus: drills[0].skill,
      drills: drills,
      learningLoop: {
        observe: 'Review the key board state and identify what actually changed.',
        orient: 'Name the opponent plan, your win condition, and the hidden-information risk.',
        decide: 'Pick the lower-risk line that preserves the win path.',
        act: 'Run the drill repeatedly, then compare the next log against this pattern.'
      }
    };
  }

  function buildTrendDashboard(reports) {
    reports = Array.isArray(reports) ? reports : [];
    if (reports.length < 2) {
      return {
        confidence: 'needs more data',
        mostCommonLossReason: 'Upload multiple logs to detect repeated patterns.',
        repeatedMistakePattern: 'No trend yet from a single review.',
        recommendedNextPracticeBlock: 'Start with the top practice drill from this replay.'
      };
    }
    var counts = {};
    reports.forEach(function(r) {
      (((r.review || {}).coachingTags) || []).forEach(function(issue) {
        counts[issue.id] = (counts[issue.id] || 0) + 1;
      });
    });
    var top = Object.keys(counts).sort(function(a, b) { return counts[b] - counts[a]; })[0];
    return {
      confidence: reports.length >= 10 ? 'medium' : 'low',
      mostCommonLossReason: top || 'No repeated loss reason yet.',
      repeatedMistakePattern: top ? top + ' appeared ' + counts[top] + ' times.' : 'No repeated mistake pattern yet.',
      recommendedNextPracticeBlock: top ? drillForIssue({ id: top }).skill : 'Decision Review Drill'
    };
  }

  function buildPremiumTeasers(report) {
    report = report || {};
    var topDrill = report.practicePlan && report.practicePlan.drills && report.practicePlan.drills[0];
    var critical = report.criticalTurns && report.criticalTurns.fatalMistake;
    var weakest = report.battleIq && report.battleIq.subScores && report.battleIq.subScores.slice().sort(function(a, b) { return a.rawScore - b.rawScore; })[0];
    return {
      title: 'Battle IQ Memory',
      freeValue: 'This review is local and temporary: you get the battle summary, key turns, scorecard, and practice drill without saving a profile.',
      premiumValue: 'A saved profile can remember teams, logs, decisions, recurring patterns, matchup comfort, drills, and improvement over time.',
      lockedInsights: [
        {
          id: 'recurring_mistake_fingerprint',
          label: 'Recurring mistake fingerprint',
          preview: critical ? 'Track how often ' + critical.category + ' appears across your saved games.' : 'Track which mistake categories repeat across your saved games.'
        },
        {
          id: 'personal_practical_win_rate',
          label: 'Personal practical win rate',
          preview: 'Compare simulated win rate against your real replay results and execution difficulty.'
        },
        {
          id: 'adaptive_training_plan',
          label: 'Adaptive training plan',
          preview: topDrill ? 'Turn drills like ' + topDrill.skill + ' into a weekly practice block with progress tracking.' : 'Turn report findings into weekly drills with progress tracking.'
        },
        {
          id: 'matchup_memory',
          label: 'Matchup memory',
          preview: 'Remember which leads, bring-fours, and win paths worked for you into each archetype.'
        },
        {
          id: 'full_battle_iq_subscores',
          label: 'Full Battle IQ sub-score trends',
          preview: weakest ? 'Track whether ' + weakest.label + ' is improving across teams and matchups.' : 'Track all eight Battle IQ sub-scores over time.'
        }
      ],
      backendLearningPolicy: {
        freeAnonymous: 'Free reviews should only contribute opt-in anonymized signals such as archetype, rule id, confidence, lead outcome, and coaching usefulness rating.',
        premiumPrivate: 'Premium profiles can save full normalized reports, teams, logs, drills, and longitudinal player patterns for personalized coaching.',
        rawLogDefault: 'Raw logs should not be silently stored. Save raw logs only when the user explicitly chooses profile history or export.'
      }
    };
  }

  function buildLearningReport(parsed, review, opts) {
    opts = opts || {};
    var issues = (review && review.coachingTags) || [];
    var critical = buildCriticalTurns(parsed, review);
    var report = {
      productMode: 'Battle Sensei',
      philosophy: 'Decision quality over outcome. Every statistic should change a decision.',
      confidence: confidenceFor(parsed, issues),
      evidenceStandard: buildEvidenceStandard(parsed, review),
      battleSummary: {
        matchup: ((review && review.summary && review.summary.yourPlayer) || 'You') + ' vs ' + ((review && review.summary && review.summary.opponentPlayer) || 'Opponent'),
        apparentPlayerPlan: 'Create a stable opening, preserve the win condition, and convert speed or positioning into pressure.',
        apparentOpponentPlan: inferOpponentPlan(parsed, (parsed && parsed.selectedSide) || opts.selectedSide || 'p1').pressurePattern,
        result: parsed && parsed.result || 'unknown',
        majorTurningPoint: critical.biggestSwing ? 'Turn ' + critical.biggestSwing.turn : 'Needs more data'
      },
      criticalTurns: critical,
      decisionQuality: buildDecisionQuality(parsed, review),
      scorecard: buildScorecard(parsed, review),
      battleIq: buildBattleIqScore(parsed, review, opts),
      winPath: buildWinPath(parsed, review, critical),
      opponentPlan: inferOpponentPlan(parsed, (parsed && parsed.selectedSide) || opts.selectedSide || 'p1'),
      simComparison: buildSimComparison(parsed, review, opts),
      practicePlan: buildPracticePlan(review),
      trendDashboard: buildTrendDashboard(opts.priorReports || [])
    };
    report.premiumTeasers = buildPremiumTeasers(report);
    return report;
  }

  ChampionsSim.replayLearning.buildLearningReport = buildLearningReport;
  ChampionsSim.replayLearning.buildCriticalTurns = buildCriticalTurns;
  ChampionsSim.replayLearning.buildDecisionQuality = buildDecisionQuality;
  ChampionsSim.replayLearning.buildPracticePlan = buildPracticePlan;
  ChampionsSim.replayLearning.buildTrendDashboard = buildTrendDashboard;
  ChampionsSim.replayLearning.buildPremiumTeasers = buildPremiumTeasers;
  ChampionsSim.replayLearning.buildBattleIqScore = buildBattleIqScore;
  ChampionsSim.replayLearning.buildEvidenceStandard = buildEvidenceStandard;
  ChampionsSim.replayLearning.buildSimComparison = buildSimComparison;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChampionsSim.replayLearning;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
