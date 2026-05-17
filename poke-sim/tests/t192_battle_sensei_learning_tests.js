// Issue #192 - Battle Sensei critical turn + learning report.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const replayLearning = require(path.join(ROOT, 'replay_learning.js'));
const replayCoach = require(path.join(ROOT, 'replay_coach.js'));
const sample = fs.readFileSync(path.join(ROOT, 'tests/fixtures/showdown_replay_sample.txt'), 'utf8');
const singlesSample = fs.readFileSync(path.join(ROOT, 'tests/fixtures/showdown_replay_singles_sample.txt'), 'utf8');
const nationalDexFixture = fs.readFileSync(path.join(ROOT, 'tests/fixtures/replays/gen9nationaldex-2504810481.log'), 'utf8');
const championBo3Fixture = fs.readFileSync(path.join(ROOT, 'tests/fixtures/replays/gen9championsvgc2026regmabo3-2606726147.log'), 'utf8');

let pass = 0;
let fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}
function eq(actual, expected, msg) {
  if (actual !== expected) throw new Error((msg || 'expected equality') + ': got ' + actual + ', expected ' + expected);
}
function truthy(value, msg) {
  if (!value) throw new Error(msg || 'expected truthy');
}
function inc(hay, needle, msg='') {
  if (String(hay).indexOf(needle) < 0) throw new Error((msg || 'missing') + ': ' + needle);
}

console.log('\n=== Battle Sensei learning tests ===\n');

T('1. learning report is attached to replay reviews', () => {
  const analysis = replayCoach.analyzeShowdownReplay(sample, { selectedSide: 'p1' });
  const learning = analysis.review.learningReport;
  truthy(learning, 'missing learning report');
  eq(learning.productMode, 'Battle Sensei', 'product mode');
  inc(learning.philosophy, 'Decision quality', 'philosophy');
  truthy(learning.battleSummary.majorTurningPoint, 'major turning point');
});

T('2. critical engine separates first mistake from fatal mistake on fixture', () => {
  const analysis = replayCoach.analyzeShowdownReplay(sample, { selectedSide: 'p1' });
  const critical = analysis.review.learningReport.criticalTurns;
  truthy(critical.firstMistake, 'first mistake');
  truthy(critical.fatalMistake, 'fatal mistake');
  eq(critical.firstMistake.turn, 1, 'first mistake turn');
  eq(critical.fatalMistake.turn, 3, 'fatal mistake turn');
  inc(critical.note, 'differ', 'critical note');
  truthy(critical.turns.every((t) => t.whatHappened && t.whyItMattered && t.betterAlternative && t.confidence), 'critical cards complete');
});

T('3. decision quality matrix separates decision and outcome', () => {
  const analysis = replayCoach.analyzeShowdownReplay(sample, { selectedSide: 'p1' });
  const rows = analysis.review.learningReport.decisionQuality;
  truthy(rows.length >= 5, 'decision rows');
  truthy(rows.some((r) => r.matrixQuadrant === 'bad decision / bad outcome'), 'bad/bad quadrant');
  truthy(rows.every((r) => r.decisionQualityScore >= 1 && r.decisionQualityScore <= 10), 'score range');
  truthy(rows.every((r) => r.alternativeLine && r.whyAlternativeMayBeBetter), 'alternatives');
});

T('4. scorecard and practice plan are generated from coaching tags', () => {
  const analysis = replayCoach.analyzeShowdownReplay(sample, { selectedSide: 'p1' });
  const learning = analysis.review.learningReport;
  truthy(learning.scorecard.cards.length >= 5, 'scorecard categories');
  truthy(learning.scorecard.overallDecisionQuality > 0, 'overall score');
  truthy(learning.practicePlan.drills.length >= 1, 'practice drills');
  truthy(learning.practicePlan.drills[0].skill, 'practice skill');
  truthy(learning.practicePlan.learningLoop.observe, 'OODA observe');
  truthy(learning.practicePlan.learningLoop.decide, 'OODA decide');
});

T('5. Battle IQ scoring is provisional, explainable, and scoped to game intelligence', () => {
  const analysis = replayCoach.analyzeShowdownReplay(sample, { selectedSide: 'p1' });
  const iq = analysis.review.learningReport.battleIq;
  truthy(iq, 'battle iq missing');
  eq(iq.status, 'Provisional Battle IQ', 'provisional status');
  inc(iq.definition, 'game-specific competitive battle intelligence', 'game intelligence boundary');
  inc(iq.definition, 'not a measure of general human intelligence', 'general intelligence boundary');
  eq(iq.confidence, 'medium', 'single-battle score confidence should not overclaim');
  inc(iq.reliabilityNote, 'single clean battle', 'single-battle reliability note');
  truthy(iq.rawComposite >= 0 && iq.rawComposite <= 100, 'raw composite range');
  truthy(iq.standardScore >= 55 && iq.standardScore <= 145, 'standard range');
  truthy(iq.confidenceInterval.length === 2, 'confidence interval');
  truthy(iq.subScores.length === 8, 'eight sub-scores');
  ['Lead IQ','Turn 1 IQ','Speed Control IQ','Resource IQ','Threat Recognition IQ','Win Condition IQ','Endgame IQ','Risk Discipline IQ'].forEach((label) => {
    truthy(iq.subScores.some((s) => s.label === label), 'missing sub-score ' + label);
  });
  truthy(iq.loweredBy.length >= 1, 'lowered by evidence');
  truthy(iq.recommendedDrill && iq.recommendedDrill.skill, 'recommended drill');
});

T('6. low-confidence incomplete logs do not overclaim', () => {
  const lowLog = [
    '|player|p1|Alice',
    '|player|p2|Bob',
    '|turn|1',
    '|move|p1a: Incineroar|Fake Out|p2a: Hatterene',
    '|-fail|p1a: Incineroar|move: Fake Out'
  ].join('\n');
  const analysis = replayCoach.analyzeShowdownReplay(lowLog, { selectedSide: 'p1' });
  const learning = analysis.review.learningReport;
  eq(learning.confidence, 'low', 'overall confidence');
  eq(learning.criticalTurns.confidence, 'low', 'critical confidence');
  eq(learning.battleIq.confidence, 'low', 'battle iq confidence');
  eq(learning.battleIq.status, 'Provisional Battle IQ', 'battle iq provisional');
  truthy(/Needs more data|same turn/i.test(learning.criticalTurns.note), 'low confidence note');
  eq(learning.evidenceStandard.label, 'Needs more data', 'evidence standard lowers confidence');
  inc(learning.opponentPlan.pressurePattern, 'Not enough observed', 'opponent plan avoids invented intent');
});

T('7. evidence standard and opponent plan expose support level', () => {
  const analysis = replayCoach.analyzeShowdownReplay(sample, { selectedSide: 'p1' });
  const learning = analysis.review.learningReport;
  truthy(learning.evidenceStandard, 'evidence standard');
  inc(learning.evidenceStandard.priority, 'Observable battle evidence first', 'evidence priority');
  inc(learning.evidenceStandard.opponentIntentRule, 'Never invent opponent intent', 'opponent intent boundary');
  truthy(['Observed', 'Strong inference', 'Weak inference', 'Needs more data'].includes(learning.opponentPlan.evidenceLabel), 'opponent evidence label');
  truthy(Array.isArray(learning.opponentPlan.evidence), 'opponent evidence rows');
});

T('8. sim comparison stays low confidence until matched sim data exists', () => {
  const analysis = replayCoach.analyzeShowdownReplay(sample, { selectedSide: 'p1' });
  const sim = analysis.review.learningReport.simComparison;
  const packet = analysis.review.learningReport.simFeedback;
  eq(sim.status, 'needs_sim_data', 'needs sim status');
  eq(sim.comparisonStatus, 'parser_confidence_too_low', 'contract status for missing sim data');
  eq(sim.calibrationAction, 'none', 'no sim data should not calibrate');
  eq(sim.evidenceLabel, 'Needs more data', 'needs evidence');
  truthy(sim.battleFacts && sim.battleFacts.replay && sim.battleFacts.replay.source === 'showdown', 'showdown facts should exist without sim data');
  eq(sim.factComparison, null, 'no sim data has no fact comparison');
  inc(sim.decisionChange, 'Run this matchup in Sim Mode or upload more logs', 'decision-changing next step');
  eq(packet.shouldUpdateLeadModel, false, 'no sim match means no lead model update');
  eq(packet.shouldUpdateBringFourModel, false, 'no sim match means no bring model update');
  eq(packet.confidence, 'low', 'unmatched feedback stays low confidence');

  const matched = replayCoach.analyzeShowdownReplay(sample, {
    selectedSide: 'p1',
    simPlan: {
      bestLead: analysis.review.summary.yourLead,
      bestFour: analysis.review.summary.yourFour,
      expectedWinPath: 'Set speed control, preserve cleaner, and convert pressure.'
    }
  }).review.learningReport.simComparison;
  eq(matched.status, 'matched', 'matched status');
  eq(matched.leadMatch, 100, 'lead match score');
  truthy(['simulator_confirmed', 'simulator_partially_confirmed', 'player_execution_loss', 'team_construction_loss', 'variance_heavy_result'].includes(matched.comparisonStatus), 'contract comparison status');
  truthy(['none', 'create_fixture', 'review_sim_model'].includes(matched.calibrationAction), 'contract calibration action');
  eq(matched.predictedWinPath, 'Set speed control, preserve cleaner, and convert pressure.', 'predicted win path');
  truthy(matched.battleFacts && matched.battleFacts.sim && matched.battleFacts.replay, 'matched comparison includes both normalized fact models');
  truthy(matched.factComparison && matched.factComparison.schema === 'battle_fact_comparison_v1', 'matched comparison includes Battle Mirror fact comparison');
  eq(matched.factComparison.leadMatch, 100, 'Battle Mirror lead overlap');
  truthy(['simulator_confirmed', 'simulator_partially_confirmed', 'player_execution_loss', 'team_construction_loss', 'variance_heavy_result', 'simulator_contradicted'].includes(matched.factComparison.classification), 'Battle Mirror classification');
  truthy(matched.factComparison.coachingNote, 'Battle Mirror coaching note');
  truthy(matched.evidenceLabel !== 'Needs more data', 'matched evidence improves');
});

T('8b. sim feedback packet emits calibration signals without auto-updating models', () => {
  const base = replayCoach.analyzeShowdownReplay(sample, { selectedSide: 'p1' });
  const mismatch = replayCoach.analyzeShowdownReplay(sample, {
    selectedSide: 'p1',
    simPlan: {
      bestLead: ['Wrong Lead A', 'Wrong Lead B'],
      bestFour: base.review.summary.yourFour,
      expectedWinPath: 'Set speed control, preserve cleaner, and convert pressure.',
      matchConfidence: 'medium'
    }
  }).review.learningReport.simFeedback;
  truthy(mismatch, 'sim feedback missing');
  eq(mismatch.shouldUpdateLeadModel, true, 'lead mismatch can update lead model signal');
  eq(mismatch.shouldUpdateBringFourModel, false, 'matched four should not update bring model signal');
  eq(mismatch.shouldUpdateArchetypeModel, false, 'single medium-confidence replay should not update archetype model');
  eq(mismatch.shouldCreateScenario, true, 'replay should create scenario');
  truthy(mismatch.scenarioType && mismatch.scenarioType !== 'none', 'scenario type');
  truthy(['none', 'minor', 'moderate'].includes(mismatch.rngContamination), 'rng contamination label');
  inc(mismatch.evidence.note, 'Do not automatically rewrite sim models', 'auto-update guardrail');
});

T('8c. replay team mismatch blocks sim comparison even if a plan is provided', () => {
  const blocked = replayCoach.analyzeShowdownReplay(sample, {
    selectedSide: 'p1',
    replayTeamMatch: {
      status: 'different_team',
      allowsSimComparison: false,
      confidence: 'medium',
      summary: 'Replay does not look like the current simulated team.',
      recommendedNextStep: 'Run a sim with this team first.'
    },
    simPlan: {
      bestLead: ['Incineroar', 'Whimsicott'],
      bestFour: ['Incineroar', 'Whimsicott', 'Garchomp', 'Rotom-Wash'],
      expectedWinPath: 'Set speed control, preserve cleaner, and convert pressure.'
    }
  }).review.learningReport.simComparison;
  eq(blocked.status, 'team_match_blocked', 'team mismatch should block matched comparison');
  eq(blocked.comparisonStatus, 'team_mismatch', 'mismatch status');
  eq(blocked.calibrationAction, 'none', 'mismatch should not calibrate');
  truthy(blocked.replayTeamMatch && blocked.replayTeamMatch.status === 'different_team', 'team match contract should be attached');
  inc(blocked.decisionChange, 'Run a sim with this team first', 'next-step guidance');
});

T('9. trend dashboard stays cautious for a single review', () => {
  const analysis = replayCoach.analyzeShowdownReplay(sample, { selectedSide: 'p1' });
  const trend = analysis.review.learningReport.trendDashboard;
  eq(trend.confidence, 'needs more data', 'trend confidence');
  inc(trend.recommendedNextPracticeBlock, 'top practice drill', 'trend practice guidance');
});

T('9b. trend dashboard only counts verified Champion replay reports', () => {
  const generic = {
    parsed: { rulesetProfile: { compatibilityClass: 'generic_gen9' } },
    review: { coachingTags: [{ id: 'bad_lead', tag: 'Bad Lead', turn: 1, evidence: 'generic fixture' }] }
  };
  const champA = {
    parsed: { rulesetProfile: { compatibilityClass: 'champion_exact' } },
    review: { coachingTags: [{ id: 'bad_lead', tag: 'Bad Lead', turn: 1, evidence: 'champion fixture A' }] }
  };
  const champB = {
    parsed: { rulesetProfile: { compatibilityClass: 'champion_exact' } },
    review: { coachingTags: [{ id: 'bad_lead', tag: 'Bad Lead', turn: 2, evidence: 'champion fixture B' }] }
  };
  const one = replayLearning.buildTrendDashboard([generic, champA]);
  eq(one.confidence, 'needs more data', 'one verified Champion replay is not enough');
  eq(one.verifiedReplayCount, 1, 'generic replay does not count');
  const two = replayLearning.buildTrendDashboard([generic, champA, champB]);
  eq(two.verifiedReplayCount, 2, 'two verified Champion replays count');
  truthy(two.replayTrends.some((t) => t.pattern === 'bad_lead' && t.frequency === 2), 'repeated Champion trend emitted');
});

T('10. premium memory preview separates anonymous learning from private profiles', () => {
  const analysis = replayCoach.analyzeShowdownReplay(sample, { selectedSide: 'p1' });
  const premium = analysis.review.learningReport.premiumTeasers;
  truthy(premium, 'premium teaser');
  inc(premium.title, 'Battle IQ Memory', 'teaser title');
  inc(premium.freeValue, 'local and temporary', 'free value');
  inc(premium.premiumValue, 'saved profile', 'premium value');
  truthy(premium.lockedInsights.length >= 4, 'locked insight count');
  truthy(premium.lockedInsights.some((x) => x.id === 'full_battle_iq_subscores'), 'battle iq trend teaser');
  inc(premium.backendLearningPolicy.freeAnonymous, 'opt-in anonymized signals', 'anonymous learning policy');
  inc(premium.backendLearningPolicy.rawLogDefault, 'Raw logs should not be silently stored', 'raw log boundary');
});

T('11. singles learning copy uses selected three and not doubles-only wording', () => {
  const analysis = replayCoach.analyzeShowdownReplay(singlesSample, { selectedSide: 'p1', expectedFormat: 'singles' });
  const learning = analysis.review.learningReport;
  eq(analysis.review.summary.selectionCountExpected, 3, 'singles selection count');
  inc(learning.winPath.beforeGame, 'selected three', 'singles win-path copy');
  truthy(!/selected four/i.test(learning.winPath.beforeGame), 'no doubles-only selected four copy');
  truthy(!/bring-four/i.test(JSON.stringify(learning)), 'no bring-four wording in learning report');
});

T('12. singles sim comparison messaging adapts selection language', () => {
  const base = replayCoach.analyzeShowdownReplay(singlesSample, { selectedSide: 'p1', expectedFormat: 'singles' });
  const mismatch = replayCoach.analyzeShowdownReplay(singlesSample, {
    selectedSide: 'p1',
    expectedFormat: 'singles',
    simPlan: {
      bestLead: ['Wrong Lead'],
      bestFour: ['Wrong A', 'Wrong B', 'Wrong C'],
      expectedWinPath: 'Preserve the cleaner and avoid boosting the wrong target.',
      matchConfidence: 'medium'
    }
  }).review.learningReport.simComparison;
  inc(mismatch.decisionChange, 'selected three', 'singles comparison wording');
  truthy(!/lead\/four/i.test(mismatch.firstDeviation), 'no lead/four wording');
  truthy(!/selected four/i.test(mismatch.firstDeviation), 'no selected four wording');
  truthy(base.review.learningReport.battleIq.standardScore >= 55, 'singles battle iq still scores');
});

T('13. generic Gen 9 logs are format-limited and no longer high confidence by default', () => {
  const analysis = replayCoach.analyzeShowdownReplay(nationalDexFixture, { selectedSide: 'p1', expectedFormat: 'singles' });
  const summary = analysis.review.summary;
  const learning = analysis.review.learningReport;
  eq(summary.rulesetProfile, 'generic_gen9', 'ruleset profile');
  eq(summary.coachingMode, 'format-limited', 'coaching mode');
  eq(summary.selectedFourConfidence.level, 'medium', 'generic selection confidence should be capped');
  eq(summary.confidence, 'medium', 'summary confidence should be capped');
  eq(learning.confidence, 'medium', 'learning confidence should be capped');
  eq(learning.battleIq.confidence, 'medium', 'battle iq confidence should be capped');
  truthy(summary.formatTag && summary.formatTag !== 'unknown', 'format tag available');
});

T('14. Champion-looking logs enter champion-exact mode when the replay artifact is verified', () => {
  const analysis = replayCoach.analyzeShowdownReplay(championBo3Fixture, { selectedSide: 'p1' });
  const summary = analysis.review.summary;
  const learning = analysis.review.learningReport;
  eq(summary.rulesetProfile, 'champion_exact', 'champion ruleset profile');
  eq(summary.coachingMode, 'champion-ready', 'champion coaching mode');
  truthy(summary.formatTag.toLowerCase().indexOf('champion') >= 0, 'champion format tag');
  eq(summary.confidence, 'medium', 'champion confidence stays evidence-bound even when the log is Champion');
  eq(learning.confidence, 'medium', 'learning confidence stays evidence-bound on a single replay');
  truthy(summary.selectedFourConfidence.level === 'high' || summary.selectedFourConfidence.level === 'medium', 'champion selection confidence present');
});

console.log(`\nBattle Sensei learning: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
