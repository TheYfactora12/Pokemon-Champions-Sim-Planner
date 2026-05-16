// Issues #188/#189 - Battle Sensei UI shell depends on a local Showdown parser.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
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
function includes(list, value, msg) {
  if (!Array.isArray(list) || !list.includes(value)) throw new Error((msg || 'missing value') + ': ' + value);
}

console.log('\n=== Battle Sensei parser tests ===\n');

T('1. parses players, format, winner, result, and turn count', () => {
  const parsed = replayCoach.parseShowdownLog(sample, { selectedSide: 'p1' });
  eq(parsed.players.p1, 'Alice', 'p1 name');
  eq(parsed.players.p2, 'Bob', 'p2 name');
  eq(parsed.format, 'doubles', 'format keeps first format signal');
  eq(parsed.winner, 'Bob', 'winner');
  eq(parsed.result, 'loss', 'selected side result');
  eq(parsed.totalTurns, 4, 'turn count');
  truthy(parsed.ok, 'parser should mark sample ok');
});

T('2. extracts team preview, selected Pokemon, and opening leads', () => {
  const parsed = replayCoach.parseShowdownLog(sample, { selectedSide: 'p1' });
  eq(parsed.teamPreview.p1.length, 6, 'p1 preview count');
  eq(parsed.teamPreview.p2.length, 6, 'p2 preview count');
  eq(parsed.leads.p1.join(','), 'Incineroar,Whimsicott', 'p1 leads');
  eq(parsed.leads.p2.join(','), 'Indeedee-F,Hatterene', 'p2 leads');
  includes(parsed.selectedPokemon.p1, 'Garchomp', 'selected p1 Garchomp');
  includes(parsed.selectedPokemon.p2, 'Hatterene', 'selected p2 Hatterene');
});

T('3. extracts moves, switches, faints, damage, field effects, and RNG markers', () => {
  const parsed = replayCoach.parseShowdownLog(sample, { selectedSide: 'p1' });
  const turn1 = parsed.turns.find((t) => t.number === 1);
  const turn3 = parsed.turns.find((t) => t.number === 3);
  truthy(turn1.moves.some((m) => m.move === 'Tailwind'), 'Tailwind move');
  truthy(turn1.field.some((f) => f.value === 'p1: Alice' || f.value === 'move: Trick Room'), 'field effect');
  truthy(turn3.faints.some((f) => f.pokemon === 'Arcanine'), 'Arcanine faint');
  truthy(turn3.damage.some((d) => d.pokemon === 'Arcanine' && d.hp === 0), 'damage hp');
  truthy(turn3.rng.some((r) => r.type === 'crit'), 'crit marker');
});

T('4. builds a coaching review with tags and critical turn', () => {
  const analysis = replayCoach.analyzeShowdownReplay(sample, { selectedSide: 'p1' });
  const tags = analysis.review.coachingTags.map((t) => t.tag);
  eq(analysis.review.summary.yourLead.join(','), 'Incineroar,Whimsicott', 'summary lead');
  eq(analysis.review.summary.result, 'loss', 'summary result');
  truthy(analysis.review.summary.criticalTurn >= 1, 'critical turn');
  includes(tags, 'Fake Out Failed', 'Fake Out coaching tag');
  includes(tags, 'Speed Control Without Pressure', 'speed control tag');
  includes(tags, 'Lost Exchange', 'lost exchange tag');
  includes(tags, 'RNG Materiality Check', 'rng tag');
});

T('5. fails soft on empty or incomplete logs', () => {
  const empty = replayCoach.parseShowdownLog('', { selectedSide: 'p1' });
  eq(empty.ok, false, 'empty ok flag');
  truthy(empty.warnings.length > 0, 'empty warnings');
  const partial = replayCoach.analyzeShowdownReplay('|player|p1|Alice\n|win|Alice', { selectedSide: 'p1' });
  eq(partial.review.summary.result, 'win', 'partial winner result');
  eq(partial.review.summary.confidence, 'medium', 'partial confidence');
});

console.log(`\nBattle Sensei parser: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
