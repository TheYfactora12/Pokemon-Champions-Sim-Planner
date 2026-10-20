import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { compareVisibleReplay, ingestDirectory } from '../tools/compare-visible-replay.mjs';

function fixture() {
  const mon = side => ({ displayName: 'Mirror', stableKey: `${side}:slot:0:Mirror`, status: 'active',
    hp: 100, hpLabel: '100%', item: side === 'player' ? 'Sitrus Berry' : 'Leftovers', ability: 'Pressure', moves: ['Protect'] });
  const snapshot = { roster: { player: [mon('player')], opponent: [mon('opponent')] }, field: {}, speed_control: {} };
  const log = { seed: [1, 2, 3, 4], build_id: 'build-1', exporter_build_id: 'build-1', result: 'win', opponent_team: { name: 'Opponent' },
    provenance: { build_id: 'build-1', player_team_digest: 'a'.repeat(64), opp_team_digest: 'b'.repeat(64) },
    participants: { player: [{ stable_key: mon('player').stableKey }], opponent: [{ stable_key: mon('opponent').stableKey }] },
    turnLog: [{ turn: 1, pre: structuredClone(snapshot), post: structuredClone(snapshot), events: [{ text: 'Mirror used Protect!' }], damage_events: [] }] };
  const visibleMon = m => ({ name: m.displayName, status: 'ACTIVE', hp: 'HP: 100%', hp_bar: '100%',
    metadata: [`${m.item} \u00b7 ${m.ability}`, 'Moves: Protect'] });
  const board = label => ({ label, player: [visibleMon(mon('player'))], opponent: [visibleMon(mon('opponent'))], field: [] });
  const visual = { schema_version: 'champions-visible-replay-v1', renderer_build_id: 'build-1', banner: 'Preview build-1', title: 'WIN vs Opponent', meta: '1 turns',
    turns: [{ label: 'T1', lines: ['Mirror used Protect!'] }], boards: [board('TURN 0'), board('AFTER T1')] };
  return { log, visual };
}
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('PASS ' + name); }
function rejects(mutator, code) {
  const pair = fixture(); mutator(pair);
  assert.ok(compareVisibleReplay(pair.log, pair.visual).issues.some(i => i.code === code), code);
}
test('matching mirror species stay side-specific despite CSS capitalization', () => {
  const { log, visual } = fixture();
  assert.equal(compareVisibleReplay(log, visual).status, 'matched_observable_fields');
});
test('empty evidence never passes', () => assert.equal(compareVisibleReplay({}, {}).status, 'mismatch'));
test('initial board uses the captured entry state rather than post-Mega pre-action state', () => {
  const {log, visual} = fixture();
  log.turnLog[0].initial = structuredClone(log.turnLog[0].pre);
  log.turnLog[0].pre.roster.player[0].ability = 'Changed after entry';
  assert.equal(compareVisibleReplay(log,visual).status,'matched_observable_fields');
  log.turnLog[0].initial.roster.player[0].ability = 'Incorrect initial';
  assert.ok(compareVisibleReplay(log,visual).issues.some(i => i.code === 'item_ability_mismatch'));
});
test('wrong build and title are rejected', () => {
  rejects(p => p.visual.renderer_build_id = 'build-10', 'build_mismatch');
  rejects(p => p.visual.title = 'WIN vs New selected team', 'replay_title_mismatch');
});
test('missing and duplicate turns are rejected', () => {
  rejects(p => p.visual.turns = [], 'turn_sequence_mismatch');
  rejects(p => p.visual.boards.push(p.visual.boards[1]), 'board_sequence_mismatch');
});
test('side swapping cannot hide item ownership mismatch', () => {
  rejects(p => [p.visual.boards[1].player, p.visual.boards[1].opponent] = [p.visual.boards[1].opponent, p.visual.boards[1].player], 'item_ability_mismatch');
});
test('HP text, HP bar, faint state and move discrepancies are detected', () => {
  rejects(p => p.visual.boards[1].player[0].hp = 'HP: 1%', 'hp_mismatch');
  rejects(p => p.visual.boards[1].player[0].hp_bar = '0%', 'hp_bar_mismatch');
  rejects(p => p.visual.boards[1].player[0].status = 'fainted', 'status_mismatch');
  rejects(p => p.visual.boards[1].player[0].metadata[1] = 'Moves: Tackle', 'moves_mismatch');
});
test('replacement outside selected participants fails', () => rejects(p => p.log.turnLog[0].post.roster.player[0].stableKey = 'player:slot:5:Other', 'unselected_participant'));
test('Tailwind duration must be visible from the exported tailwind_turns field', () => rejects(p => p.log.turnLog[0].post.speed_control.player = { tailwind_turns: 3 }, 'field_state_mismatch'));
test('omitted status move and reversed resolved order fail', () => {
  rejects(p => p.log.turnLog[0].events.unshift({ text: 'Partner used Tailwind!' }), 'resolved_move_order_or_omission');
  rejects(p => { p.log.turnLog[0].events.push({ text: 'Partner used Tailwind!' }); p.visual.turns[0].lines.unshift('Partner used Tailwind!'); }, 'resolved_move_order_or_omission');
});
test('wrong damage is detected independently of the UI formatter', () => rejects(p => {
  p.log.turnLog[0].damage_events.push({ attacker: 'Mirror', target: 'Partner', move: 'Tackle', applied_damage: 25 });
  p.visual.turns[0].lines.push('Mirror used Tackle! Partner lost 24 HP');
}, 'damage_display_mismatch'));
test('legitimate consumed-item state can agree without rewriting registered ownership', () => {
  const { log, visual } = fixture();
  log.turnLog[0].post.roster.player[0].item = null;
  visual.boards[1].player[0].metadata[0] = 'Pressure';
  assert.equal(compareVisibleReplay(log, visual).status, 'matched_observable_fields');
});
test('historical execution under a new exporter is not misidentified as a current run', () => {
  const { log, visual } = fixture();
  log.exporter_build_id = visual.renderer_build_id = 'build-2';
  assert.equal(compareVisibleReplay(log, visual).status, 'matched_observable_fields');
  rejects(p => p.log.build_id = 'wrong-execution', 'execution_build_mismatch');
});
test('missing action evidence and empty expected metadata fail closed', () => {
  rejects(p => p.log.turnLog[0].events = [], 'resolved_move_order_or_omission');
  rejects(p => delete p.log.turnLog[0].events, 'missing_action_evidence');
  rejects(p => { p.log.turnLog[0].post.roster.player[0].item = null; p.log.turnLog[0].post.roster.player[0].ability = null; }, 'item_ability_mismatch');
});
test('ingestion requires exact inventory, symmetric pairs and matching seeds', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'visible-replay-test-'));
  try {
    const { log, visual } = fixture();
    const write = (name, value) => fs.writeFileSync(path.join(directory, name), JSON.stringify(value));
    const inventory = { schema_version: 'champions-visual-inventory-v1', expected_game_count: 1, cases: [{ id: 'game', kind: 'simulation', seed: log.seed }] };
    write('game.log.json', log); write('game.visual.json', visual);
    assert.throws(() => ingestDirectory(directory));
    write('capture-inventory.json', inventory);
    assert.equal(ingestDirectory(directory).mismatch_pairs, 0);
    write('orphan.log.json', log);
    assert.throws(() => ingestDirectory(directory), /Unpaired/);
    fs.unlinkSync(path.join(directory, 'orphan.log.json'));
    inventory.cases[0].seed = [9, 9, 9, 9]; write('capture-inventory.json', inventory);
    assert.throws(() => ingestDirectory(directory), /Seed differs/);
    inventory.expected_game_count = 2; write('capture-inventory.json', inventory);
    assert.throws(() => ingestDirectory(directory), /Invalid expected-game/);
  } finally {
    assert.equal(path.dirname(path.resolve(directory)), path.resolve(os.tmpdir()));
    fs.rmSync(directory, { recursive: true });
  }
});

test('omitting an identical repeated action fails without collapsing multiplicity',()=>rejects(p=>p.log.turnLog[0].events.push({text:'Mirror used Protect!'}),'resolved_move_order_or_omission'));
test('externally bound candidate rejects coordinated stale labels and bytes',()=>{
 const p=fixture(), expected={build_id:'build-1',commit:'a'.repeat(40),bundle_sha256:'b'.repeat(64)};
 p.visual.candidate_bundle_sha256=expected.bundle_sha256;
 assert.equal(compareVisibleReplay(p.log,p.visual,expected).issues.length,0);
 p.log.build_id=p.log.exporter_build_id=p.log.provenance.build_id=p.visual.renderer_build_id='stale';
 assert(compareVisibleReplay(p.log,p.visual,expected).issues.some(i=>i.code==='candidate_execution_mismatch'));
 p.visual.candidate_bundle_sha256='c'.repeat(64);
 assert(compareVisibleReplay(p.log,p.visual,expected).issues.some(i=>i.code==='candidate_bytes_mismatch'));
});

test('stable action anchors distinguish missed-move detail from a second action',()=>{
 const p=fixture();p.log.turnLog[0].events=[{text:'Mirror used Hurricane!',actor_key:'player:slot:0:Mirror',move:'Hurricane',log_index:0},{text:'Mirror used Hurricane! It missed!'}];
 p.visual.turns[0].lines=['Mirror used Hurricane! → Opponent It missed. Accuracy 70%.'];
 assert.equal(compareVisibleReplay(p.log,p.visual).issues.length,0);
 p.log.turnLog[0].events.push({text:'Mirror used Hurricane!',actor_key:'opponent:slot:0:Mirror',move:'Hurricane',log_index:2});
 assert(compareVisibleReplay(p.log,p.visual).issues.some(i=>i.code==='resolved_move_order_or_omission'));
});

test('mixed and partial anchors never discard unanchored actions',()=>{
 rejects(p=>{Object.assign(p.log.turnLog[0].events[0],{actor_key:'player:slot:0:Mirror',move:'Protect',log_index:0});p.log.turnLog[0].events.push({text:'Mirror used Protect!'});},'incomplete_action_anchors');
 rejects(p=>{p.log.turnLog[0].events[0].actor_key='player:slot:0:Mirror';},'incomplete_action_anchors');
 rejects(p=>{const e={text:'Mirror used Protect!',actor_key:'player:slot:0:Mirror',move:'Protect',log_index:0};p.log.turnLog[0].events=[e,{...e}];p.visual.turns[0].lines.push(e.text);},'invalid_action_anchor_order');
});
function damageFixture(amounts=[25,25]) {
 const p=fixture();p.log.turnLog[0].events=amounts.map((n,i)=>({text:'Mirror used Tackle!',actor_key:'player:slot:0:Mirror',move:'Tackle',log_index:i*2}));
 p.log.turnLog[0].damage_events=amounts.map(n=>({attacker:'Mirror',move:'Tackle',target:'Partner',applied_damage:n}));
 p.visual.turns[0].lines=amounts.map(n=>`Mirror used Tackle! Partner lost ${n} HP`);return p;
}
test('damage details match ordered multiplicity one to one',()=>{
 const p=damageFixture();assert.equal(compareVisibleReplay(p.log,p.visual).issues.length,0);
 p.visual.turns[0].lines.pop();assert(compareVisibleReplay(p.log,p.visual).issues.some(i=>i.code==='damage_display_mismatch'));
 const q=damageFixture([25,30]);q.visual.turns[0].lines.reverse();assert(compareVisibleReplay(q.log,q.visual).issues.some(i=>i.code==='damage_display_mismatch'));
 const r=damageFixture([25]);r.visual.turns[0].lines.push(r.visual.turns[0].lines[0]);assert(compareVisibleReplay(r.log,r.visual).issues.some(i=>i.code==='damage_display_mismatch'));
});
test('raw damage records do not create extra actions or lose damage evidence',()=>{
 const p=damageFixture([25]);p.log.turnLog[0].events.push({text:'Mirror used Tackle! → Partner [25 dmg, 75/100 HP]'});
 assert.equal(compareVisibleReplay(p.log,p.visual).issues.length,0);
 p.visual.turns[0].lines=['Mirror used Tackle! → Partner [25 dmg, 75/100 HP]'];
 assert.equal(compareVisibleReplay(p.log,p.visual).issues.length,0);
});
test('duplicate inventory captures do not establish independent games',()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'visible-counts-'));
 try {
  const p=fixture(),write=(name,v)=>fs.writeFileSync(path.join(directory,name),JSON.stringify(v));
  write('capture-inventory.json',{schema_version:'champions-visual-inventory-v1',expected_game_count:2,cases:['a','b'].map(id=>({id,kind:'simulation',seed:p.log.seed}))});
  for(const id of ['a','b']){write(id+'.log.json',p.log);write(id+'.visual.json',p.visual);}
  const r=ingestDirectory(directory);assert.equal(r.pairs,2);assert.equal(r.unique_observations,1);assert.equal(r.unique_scenarios,1);assert.equal(r.unique_capture_pairs,1);assert.equal(r.repeated_captures,1);assert.equal(r.verified_execution_count,null);
  p.log.exported_at='later';write('b.log.json',p.log);const repeated=ingestDirectory(directory);assert.equal(repeated.unique_observations,1);assert.equal(repeated.unique_capture_pairs,2);
 } finally {assert.equal(path.dirname(path.resolve(directory)),path.resolve(os.tmpdir()));fs.rmSync(directory,{recursive:true});}
});

test('anchored failed action remains an action',()=>{
 const p=fixture();Object.assign(p.log.turnLog[0].events[0],{text:'Mirror used Protect! But it failed!',actor_key:'player:slot:0:Mirror',move:'Protect',log_index:0});
 p.visual.turns[0].lines=['Mirror used Protect! But it failed!'];assert.equal(compareVisibleReplay(p.log,p.visual).issues.length,0);
});
test('spread and repeated-hit details consume every semicolon segment',()=>{
 for(const targets of [['Partner','Other'],['Partner','Partner']]) {
 const p=damageFixture([25]);p.log.turnLog[0].damage_events=targets.map(target=>({attacker:'Mirror',move:'Tackle',target,applied_damage:25}));
 p.visual.turns[0].lines=['Mirror used Tackle! '+targets.map(t=>t+' lost 25 HP (75/100) [spread]').join('; ')];
 assert.equal(compareVisibleReplay(p.log,p.visual).issues.length,0);
 p.visual.turns[0].lines[0]+='; Extra lost 25 HP';assert(compareVisibleReplay(p.log,p.visual).issues.some(i=>i.code==='damage_display_mismatch'));
 p.visual.turns[0].lines=['Mirror used Tackle! '+targets[0]+' lost 25 HP'];assert(compareVisibleReplay(p.log,p.visual).issues.some(i=>i.code==='damage_display_mismatch'));
 }
});
const retained=path.resolve('poke-sim/artifacts/browser-replay-JPtsTO');
if(fs.existsSync(retained))test('retained browser evidence preserves actual duplicate damage findings',()=>{
 const r=ingestDirectory(retained);assert(r.reports.find(p=>p.log_file==='practice-rapid.log.json').issues.some(i=>i.code==='damage_display_mismatch'&&i.location==='T10'));
 assert.equal(r.reports.find(p=>p.log_file==='mc-baseline.log.json').issues.some(i=>i.location==='T2'),false,'legitimate spread rows agree');
});
console.log(`Visible replay comparison: ${passed}/${passed} passed`);
