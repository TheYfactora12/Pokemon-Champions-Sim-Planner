// Issues #188/#189 - Battle Sensei UI shell depends on a local Showdown parser.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const replayCoach = require(path.join(ROOT, 'replay_coach.js'));
const sample = fs.readFileSync(path.join(ROOT, 'tests/fixtures/showdown_replay_sample.txt'), 'utf8');

let pass = 0;
let fail = 0;
const tests = [];
function T(name, fn) {
  tests.push([name, fn]);
}
async function runTests() {
  for (const [name, fn] of tests) {
    try {
      await fn();
      console.log('  PASS', name);
      pass++;
    } catch (e) {
      console.log('  FAIL', name, '-', e.message);
      fail++;
    }
  }
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
  const ids = analysis.review.coachingTags.map((t) => t.id);
  eq(analysis.review.summary.yourLead.join(','), 'Incineroar,Whimsicott', 'summary lead');
  eq(analysis.review.summary.result, 'loss', 'summary result');
  eq(analysis.review.summary.selectedFourConfidence.level, 'high', 'bring confidence');
  truthy(analysis.review.summary.criticalTurn >= 1, 'critical turn');
  includes(tags, 'Targeting Error', 'targeting coaching tag');
  includes(tags, 'Speed Control Without Pressure', 'speed control tag');
  includes(tags, 'Win Condition Exposed', 'win condition tag');
  includes(tags, 'RNG Materiality Check', 'rng tag');
  ['bad_lead', 'speed_control_without_pressure', 'targeting_error', 'field_control_failure', 'protect_misuse', 'switch_tempo_loss', 'win_condition_exposed', 'rng_material', 'endgame_misplay'].forEach((id) => {
    includes(ids, id, 'coaching rule id');
  });
  truthy(ids.length >= 5, 'detects at least five rule ids');
  analysis.review.coachingTags.forEach((tag) => {
    truthy(tag.whatHappened, 'tag what happened');
    truthy(tag.whyMattered, 'tag why mattered');
    truthy(tag.doInstead, 'tag do instead');
    truthy(tag.confidence, 'tag confidence');
  });
});

T('5. builds readable turn timeline and hidden raw-log preview data', () => {
  const analysis = replayCoach.analyzeShowdownReplay(sample, { selectedSide: 'p1' });
  const timeline = analysis.review.turnTimeline;
  eq(timeline.length, 4, 'timeline length');
  truthy(timeline[0].stateShift.includes('Speed control') || timeline[0].tags.includes('Speed Control Without Pressure'), 'turn 1 speed read');
  truthy(timeline.some((t) => t.severity === 'high'), 'timeline has high severity turn');
  truthy(timeline.every((t) => Array.isArray(t.events)), 'timeline events arrays');
  truthy(analysis.review.rawLogPreview.lineCount >= 50, 'raw log line count');
  truthy(analysis.review.rawLogPreview.lines.length > 0, 'raw preview lines');
});

T('6. fails soft on empty or incomplete logs', () => {
  const empty = replayCoach.parseShowdownLog('', { selectedSide: 'p1' });
  eq(empty.ok, false, 'empty ok flag');
  truthy(empty.warnings.length > 0, 'empty warnings');
  const partial = replayCoach.analyzeShowdownReplay('|player|p1|Alice\n|win|Alice', { selectedSide: 'p1' });
  eq(partial.review.summary.result, 'win', 'partial winner result');
  eq(partial.review.summary.confidence, 'medium', 'partial confidence');
});

T('7. marks partial bring-four evidence without overclaiming', () => {
  const partialBring = [
    '|player|p1|Alice',
    '|player|p2|Bob',
    '|gametype|doubles',
    '|poke|p1|Incineroar, L50, M|',
    '|poke|p1|Whimsicott, L50, F|',
    '|poke|p1|Garchomp, L50, M|',
    '|poke|p1|Arcanine, L50, M|',
    '|poke|p1|Rillaboom, L50, M|',
    '|poke|p1|Milotic, L50, F|',
    '|poke|p2|Indeedee-F, L50, F|',
    '|poke|p2|Hatterene, L50, F|',
    '|poke|p2|Ursaluna, L50, M|',
    '|poke|p2|Torkoal, L50, M|',
    '|poke|p2|Amoonguss, L50, M|',
    '|poke|p2|Kingambit, L50, M|',
    '|teampreview',
    '|start',
    '|switch|p1a: Incineroar|Incineroar, L50, M|100/100',
    '|switch|p2a: Hatterene|Hatterene, L50, F|100/100',
    '|turn|1',
    '|move|p1a: Incineroar|Protect|p1a: Incineroar',
    '|win|Bob'
  ].join('\n');
  const analysis = replayCoach.analyzeShowdownReplay(partialBring, { selectedSide: 'p1' });
  const ids = analysis.review.coachingTags.map((t) => t.id);
  includes(ids, 'questionable_bring', 'questionable bring rule id');
  eq(analysis.review.summary.selectedFourConfidence.level, 'medium', 'partial bring confidence');
});

T('8. normalizes copied replay page text down to raw log lines', () => {
  const pastedPage = [
    'Pokemon Showdown replay',
    'Battle log',
    '|player|p1|Alice',
    '|player|p2|Bob',
    '|turn|1',
    '|move|p1a: Incineroar|Fake Out|p2a: Indeedee-F',
    'Download replay'
  ].join('\n');
  const normalized = replayCoach.normalizeReplayLogInput(pastedPage);
  eq(normalized.split('\n').length, 4, 'normalized replay line count');
  truthy(normalized.indexOf('Pokemon Showdown replay') < 0, 'page chrome removed');
  truthy(normalized.indexOf('|move|p1a: Incineroar|Fake Out|p2a: Indeedee-F') >= 0, 'move line preserved');
});

T('9. converts replay URLs to .log endpoints and fetches them through the helper', async () => {
  const logUrl = replayCoach.replayUrlToLogUrl('https://replay.pokemonshowdown.com/gen9vgc2026-123456');
  eq(logUrl, 'https://replay.pokemonshowdown.com/gen9vgc2026-123456.log', 'log endpoint');
  let fetched = '';
  const text = await replayCoach.fetchReplayLog('https://replay.pokemonshowdown.com/gen9vgc2026-123456', async (url) => {
    fetched = url;
    return {
      ok: true,
      async text() {
        return 'Battle log\n|player|p1|Alice\n|turn|1';
      }
    };
  });
  eq(fetched, logUrl, 'helper fetch target');
  eq(text, '|player|p1|Alice\n|turn|1', 'fetched log normalized');
});

runTests().then(() => {
  console.log(`\nBattle Sensei parser: ${pass} pass, ${fail} fail\n`);
  process.exit(fail ? 1 : 0);
});
