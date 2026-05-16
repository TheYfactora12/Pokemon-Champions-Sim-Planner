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

T('5. low-confidence incomplete logs do not overclaim', () => {
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
  truthy(/Needs more data|same turn/i.test(learning.criticalTurns.note), 'low confidence note');
});

T('6. trend dashboard stays cautious for a single review', () => {
  const analysis = replayCoach.analyzeShowdownReplay(sample, { selectedSide: 'p1' });
  const trend = analysis.review.learningReport.trendDashboard;
  eq(trend.confidence, 'needs more data', 'trend confidence');
  inc(trend.recommendedNextPracticeBlock, 'top practice drill', 'trend practice guidance');
});

T('7. premium memory preview separates anonymous learning from private profiles', () => {
  const analysis = replayCoach.analyzeShowdownReplay(sample, { selectedSide: 'p1' });
  const premium = analysis.review.learningReport.premiumTeasers;
  truthy(premium, 'premium teaser');
  inc(premium.title, 'Battle IQ Memory', 'teaser title');
  inc(premium.freeValue, 'local and temporary', 'free value');
  inc(premium.premiumValue, 'saved profile', 'premium value');
  truthy(premium.lockedInsights.length >= 4, 'locked insight count');
  inc(premium.backendLearningPolicy.freeAnonymous, 'opt-in anonymized signals', 'anonymous learning policy');
  inc(premium.backendLearningPolicy.rawLogDefault, 'Raw logs should not be silently stored', 'raw log boundary');
});

console.log(`\nBattle Sensei learning: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
