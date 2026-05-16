// Issue #192 - Battle Sensei critical turn + learning report.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
require(path.join(ROOT, 'replay_learning.js'));
const replayCoach = require(path.join(ROOT, 'replay_coach.js'));
const sample = fs.readFileSync(path.join(ROOT, 'tests/fixtures/showdown_replay_sample.txt'), 'utf8');

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
  eq(sim.status, 'needs_sim_data', 'needs sim status');
  eq(sim.evidenceLabel, 'Needs more data', 'needs evidence');
  inc(sim.decisionChange, 'Run this matchup in Sim Mode or upload more logs', 'decision-changing next step');

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
  truthy(matched.evidenceLabel !== 'Needs more data', 'matched evidence improves');
});

T('9. trend dashboard stays cautious for a single review', () => {
  const analysis = replayCoach.analyzeShowdownReplay(sample, { selectedSide: 'p1' });
  const trend = analysis.review.learningReport.trendDashboard;
  eq(trend.confidence, 'needs more data', 'trend confidence');
  inc(trend.recommendedNextPracticeBlock, 'top practice drill', 'trend practice guidance');
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

console.log(`\nBattle Sensei learning: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
