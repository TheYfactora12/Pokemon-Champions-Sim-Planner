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

  function inferOpponentPlan(parsed, side) {
    parsed = parsed || {};
    var opp = side === 'p1' ? 'p2' : 'p1';
    var oppMoves = [];
    (parsed.turns || []).forEach(function(t) {
      (t.moves || []).forEach(function(m) { if (m.side === opp) oppMoves.push(m.move); });
    });
    var joined = oppMoves.join(' | ');
    var signals = [];
    if (/Trick Room/i.test(joined)) signals.push('establish Trick Room and reverse speed order');
    if (/Tailwind|Icy Wind|Electroweb|Thunder Wave/i.test(joined)) signals.push('control move order');
    if (/Follow Me|Rage Powder/i.test(joined)) signals.push('use redirection to protect setup');
    if (/Helping Hand/i.test(joined)) signals.push('amplify one-slot damage pressure');
    if (!signals.length) signals.push('trade damage and reveal endgame pieces');
    return {
      leadGoal: signals[0],
      pressurePattern: signals.join('; '),
      setupPattern: /Trick Room/i.test(joined) ? 'setup protected by support or redirection' : 'not enough setup evidence from this log',
      baitPattern: /Fake Out|Protect|Follow Me|Rage Powder/i.test(joined) ? 'possible support bait around turn-one protection or redirection' : 'not enough bait evidence',
      endgamePlan: 'preserve the attacker or field state that benefits from the opening plan',
      recognizeNextTime: 'Identify the must-answer slot before turn 1, then ask whether your lead still works if Fake Out or Protect fails.'
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
      winPath: buildWinPath(parsed, review, critical),
      opponentPlan: inferOpponentPlan(parsed, (parsed && parsed.selectedSide) || opts.selectedSide || 'p1'),
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

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChampionsSim.replayLearning;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
