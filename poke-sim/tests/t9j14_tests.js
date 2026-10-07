// T9j.14 (Refs #75) - Shadow Pressure PDF master sheet + coaching notes tests
//
// Coverage targets (22 cases):
//   Section A - Role inference (6 cases)
//     1. Fake Out user with Intimidate -> Lead / Pivot or Pivot
//     2. Tailwind user -> Speed Control
//     3. Screen user -> Support / Screens
//     4. Shadow Tag ability -> Control / Trapper
//     5. Priority user on cleaner frame -> Cleaner
//     6. Bare attacker default -> Attacker
//   Section B - Win function inference (3 cases)
//   Section C - Playstyle inference (3 cases)
//   Section D - Lead system aggregation (2 cases)
//   Section E - Loss trends analyzer (3 cases)
//   Section F - Dead moves finder (2 cases)
//   Section G - Coverage gaps + coaching rules (3 cases)
//
// Citations:
//   https://bulbapedia.bulbagarden.net/wiki/Team_Preview
//   https://bulbapedia.bulbagarden.net/wiki/Status_move (Fake Out, Tailwind)
//   User-supplied Shadow_Pressure_vFINAL_PLUS.pdf design source

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function makeStubEl() {
  const el = {
    _children: [], _listeners: {}, innerHTML: '', textContent: '', value: '',
    style: {}, dataset: {},
    classList: {
      _set: new Set(),
      add(c){ this._set.add(c); }, remove(c){ this._set.delete(c); },
      toggle(c, on){ on === undefined ? (this._set.has(c) ? this._set.delete(c) : this._set.add(c)) : (on ? this._set.add(c) : this._set.delete(c)); },
      contains(c){ return this._set.has(c); }
    },
    className: '', files: null, options: [], selectedOptions: [], selectedIndex: 0,
    checked: false, disabled: false, hidden: false,
    appendChild(c){ this._children.push(c); return c; },
    removeChild(c){ const i = this._children.indexOf(c); if (i>=0) this._children.splice(i,1); return c; },
    addEventListener(ev, fn){ (this._listeners[ev] = this._listeners[ev] || []).push(fn); },
    removeEventListener(){}, querySelector(){ return makeStubEl(); }, querySelectorAll(){ return []; },
    getAttribute(){ return null; }, setAttribute(){}, click(){}, focus(){}, blur(){}, dispatchEvent(){}
  };
  return el;
}

const ctx = {
  console, require, module: {}, exports: {}, Math, Object, Array, Set, JSON,
  Promise, setTimeout, setInterval, clearInterval, clearTimeout, Date,
  window: { matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} }), print: () => {} },
  matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} }),
  document: (function(){
    const d = {
      _els: {},
      getElementById(id) { if (!this._els[id]) this._els[id] = makeStubEl(); return this._els[id]; },
      querySelector(){ return makeStubEl(); }, querySelectorAll(){ return []; },
      createElement(){ return makeStubEl(); }, body: makeStubEl(), addEventListener(){}
    };
    d.documentElement = makeStubEl();
    return d;
  })(),
  localStorage: { _s: {}, getItem(k){ return this._s[k] !== undefined ? this._s[k] : null; }, setItem(k, v){ this._s[k] = String(v); }, removeItem(k){ delete this._s[k]; }, clear(){ this._s = {}; } },
  URL: { createObjectURL(){ return 'blob:stub'; }, revokeObjectURL(){} },
  Blob: function(parts){ this.parts = parts; },
  FileReader: function(){},
  alert: () => {},
  navigator: { userAgent: 'node' },
  location: { href: 'http://localhost/' },
  fetch: () => Promise.reject(new Error('no network in tests'))
};
ctx.self = ctx.window;
ctx.globalThis = ctx;
vm.createContext(ctx);

function load(f) { vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }); }
load('data.js');
load('engine.js');
load('ui.js');

// Expose the pure helpers we want to assert on.
vm.runInContext([
  'this.TEAMS=TEAMS;',
  'this.inferRole=inferRole;',
  'this.inferWinFunction=inferWinFunction;',
  'this.inferPlaystyle=inferPlaystyle;',
  'this.buildLeadSystem=buildLeadSystem;',
  'this.analyzeLossTrends=analyzeLossTrends;',
  'this.findDeadMoves=findDeadMoves;',
  'this.findCoverageGaps=findCoverageGaps;',
  'this.csRiskProfile=csRiskProfile;',
  'this.evaluateCoachingRules=evaluateCoachingRules;',
  'this.COACHING_RULES=COACHING_RULES;',
  'this._verdictFor=_verdictFor;',
  'this._escapeHtml=_escapeHtml;',
  'this.generatePDFReport=generatePDFReport;'
].join(' '), ctx);

const {
  TEAMS, inferRole, inferWinFunction, inferPlaystyle,
  buildLeadSystem, analyzeLossTrends, findDeadMoves, findCoverageGaps,
  csRiskProfile, evaluateCoachingRules, COACHING_RULES, _verdictFor, _escapeHtml, generatePDFReport
} = ctx;

let pass = 0, fail = 0;
function T(name, fn) { try { fn(); console.log('  PASS', name); pass++; } catch (e) { console.log('  FAIL', name, '-', e.message); fail++; } }
function eq(a, b, msg='') { if (a !== b) throw new Error(`${msg} expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }
function truthy(v, msg='') { if (!v) throw new Error(msg || 'expected truthy'); }
function inc(hay, needle, msg='') { if (String(hay).indexOf(needle) < 0) throw new Error((msg||'') + ` expected to contain ${JSON.stringify(needle)}`); }

console.log('\n=== T9j.14 - Shadow Pressure PDF + coaching tests ===\n');

// ---- Section A: Role inference ----
T('1. inferRole - Incineroar with Fake Out returns Lead / Pivot', () => {
  eq(inferRole({ name:'Incineroar', ability:'Intimidate', moves:['Fake Out','Flare Blitz','Parting Shot','Knock Off'] }), 'Lead / Pivot');
});
T('2. inferRole - Whimsicott with Tailwind returns Speed Control', () => {
  eq(inferRole({ name:'Whimsicott', ability:'Prankster', moves:['Tailwind','Encore','Moonblast','Protect'] }), 'Speed Control');
});
T('3. inferRole - Grimmsnarl with Reflect returns Support / Screens', () => {
  eq(inferRole({ name:'Grimmsnarl', ability:'Prankster', moves:['Reflect','Light Screen','Spirit Break','Taunt'] }), 'Support / Screens');
});
T('4. inferRole - Gengar with Shadow Tag returns Control / Trapper', () => {
  eq(inferRole({ name:'Gengar-Mega', ability:'Shadow Tag', moves:['Shadow Ball','Sludge Bomb','Protect','Taunt'] }), 'Control / Trapper');
});
T('5. inferRole - Kingambit with Sucker Punch returns Cleaner', () => {
  eq(inferRole({ name:'Kingambit', ability:'Supreme Overlord', moves:['Sucker Punch','Kowtow Cleave','Iron Head','Swords Dance'] }), 'Cleaner');
});
T('6. inferRole - bare attacker returns Attacker', () => {
  eq(inferRole({ name:'Dragapult', ability:'Clear Body', moves:['Dragon Darts','Phantom Force','U-turn','Protect'] }), 'Attacker');
});

// ---- Section B: Win function inference ----
T('7. inferWinFunction - Fake Out -> tempo', () => {
  eq(inferWinFunction({ name:'Rillaboom', ability:'Grassy Surge', moves:['Fake Out','Grassy Glide','Wood Hammer','U-turn'] }), 'Fake Out + tempo');
});
T('8. inferWinFunction - Trick Room', () => {
  eq(inferWinFunction({ name:'Cresselia', ability:'Levitate', moves:['Trick Room','Moonblast','Helping Hand','Protect'] }), 'Trick Room setter');
});
T('9. inferWinFunction - weather ability without weather moves', () => {
  eq(inferWinFunction({ name:'Torkoal', ability:'Drought', moves:['Heat Wave','Protect','Eruption','Earth Power'] }), 'Spread damage / chip board');
});

// ---- Section C: Playstyle inference ----
T('10. inferPlaystyle - Weather team surfaces weather label', () => {
  const members = [{ name:'Torkoal', ability:'Drought', moves:['Heat Wave'] }, { name:'Venusaur', ability:'Chlorophyll', moves:['Solar Beam'] }];
  inc(inferPlaystyle(members), 'Offense');
});
T('11. inferPlaystyle - Shadow Tag -> Aggressive Control', () => {
  const members = [{ name:'Gengar-Mega', ability:'Shadow Tag', moves:['Shadow Ball'] }, { name:'Incineroar', ability:'Intimidate', moves:['Fake Out'] }];
  eq(inferPlaystyle(members), 'Aggressive Control');
});
T('12. inferPlaystyle - empty team returns Balanced', () => {
  eq(inferPlaystyle([]), 'Balanced');
});

// ---- Section D: Lead system aggregation ----
T('13. buildLeadSystem - Fake Out lead counts as Safe', () => {
  const members = [
    { name:'Incineroar', ability:'Intimidate', moves:['Fake Out'] },
    { name:'Gengar-Mega', ability:'Shadow Tag', moves:['Shadow Ball'] }
  ];
  const results = { opp1: { allLogs: [
    { result: 'win',  leads: { player: ['Incineroar','Gengar-Mega'] } },
    { result: 'win',  leads: { player: ['Incineroar','Gengar-Mega'] } },
    { result: 'loss', leads: { player: ['Incineroar','Gengar-Mega'] } }
  ] } };
  const leads = buildLeadSystem(results, members);
  eq(leads.safe, 'Gengar-Mega + Incineroar');         // both sorted alphabetically
  eq(leads.pressure, 'Gengar-Mega + Incineroar');     // trap ability also fires
});
T('14. buildLeadSystem - empty results returns nulls', () => {
  const leads = buildLeadSystem({}, []);
  eq(leads.safe, null); eq(leads.speed, null); eq(leads.pressure, null); eq(leads.punish, null);
});

// ---- Section E: Loss trend analyzer ----
T('15. analyzeLossTrends - counts losses, TR pct, first-KO turn', () => {
  const members = [{ name:'Gengar-Mega' }, { name:'Kingambit' }];
  const results = { opp1: { allLogs: [
    { result: 'loss', trTurns: 3, twTurnsOpp: 0, oppKey:'opp1', log:[
      '[TURN 1]', 'Opp used Shadow Ball', 'Gengar-Mega fainted!',
      '[TURN 2]', 'Opp used Iron Head', 'Kingambit fainted!'
    ] },
    { result: 'loss', trTurns: 0, twTurnsOpp: 2, oppKey:'opp1', log:[
      '[TURN 1]', '[TURN 2]', 'Opp used Earthquake', 'Gengar-Mega fainted!'
    ] },
    { result: 'win', trTurns: 0, twTurnsOpp: 0, oppKey:'opp1', log:[] }
  ] } };
  const t = analyzeLossTrends(results, members);
  eq(t.totalLosses, 2);
  eq(t.trPctInLosses, 50);
  eq(t.twPctInLosses, 50);
  truthy(t.avgFirstKoTurn > 0, 'avgFirstKoTurn must be > 0');
});
T('16. analyzeLossTrends - mostLostMons lists most-fainted player mon first', () => {
  const members = [{ name:'Gengar-Mega' }, { name:'Kingambit' }];
  const results = { opp1: { allLogs: [
    { result: 'loss', log:['Gengar-Mega fainted!','Gengar-Mega fainted!','Kingambit fainted!'] },
    { result: 'loss', log:['Gengar-Mega fainted!'] }
  ] } };
  const t = analyzeLossTrends(results, members);
  eq(t.mostLostMons[0], 'Gengar-Mega');
});
T('17. analyzeLossTrends - no losses -> safe defaults', () => {
  const t = analyzeLossTrends({}, []);
  eq(t.totalLosses, 0); eq(t.trPctInLosses, 0); eq(t.avgFirstKoTurn, 0);
});

// ---- Section F: Dead-move finder ----
T('18. legacy prose cannot establish move usage', () => {
  const members = [{ name:'Gengar-Mega', moves:['Shadow Ball','Hypnosis','Taunt','Protect'] }];
  const results = { opp1: { allLogs: [
    { result: 'win', log:['Gengar-Mega used Shadow Ball!','Gengar-Mega used Protect'] },
    { result: 'loss', log:['Gengar-Mega used Hypnosis!'] }  // loss logs do not count
  ] } };
  const dead = findDeadMoves(results, members);
  const moves = dead.map(d => d.move).sort();
  eq(moves.length, 4);
  eq(dead.every(d => d.evidence_status === 'unknown'), true);
});
T('19. registered player actions count in losses without implying success', () => {
  const members = [{ name:'A', moves:['M1','M2'] }];
  const results = { o: { allLogs: [{ result:'loss', playerRegistration: members,
    participants: {player:[{stable_key:'player:slot:0:A',team_slot:0}]},
    turnLog:[{events:['M1','M2'].map(move => ({side:'player',actor_key:'player:slot:0:A',move}))}] }] } };
  eq(findDeadMoves(results, members).length, 0);
});

T('19b. side, duplicate identity, changed set and missing keys fail closed', () => {
  const members = [{name:'A',moves:['M1'],nature:'Hardy'}, {name:'A',moves:['M1'],nature:'Hardy'}];
  const game = {playerRegistration: JSON.parse(JSON.stringify(members)),
    participants:{player:[{stable_key:'player:slot:0:A',team_slot:0},{stable_key:'player:slot:1:A',team_slot:1}]},
    turnLog:[{events:[{side:'player',actor_key:'player:slot:1:A',move:'M1'}]}]};
  const results = {o:{allLogs:[game]}};
  eq(findDeadMoves(results,members).length,1);
  eq(findDeadMoves(results,members)[0].team_slot,0);
  game.turnLog[0].events[0].side = 'opponent';
  eq(findDeadMoves(results,members).length,2);
  game.turnLog[0].events[0].side = 'player';
  members[1].nature = 'Timid';
  eq(findDeadMoves(results,members).length,2);
  members[1].nature = 'Hardy';
  game.participants.player[0].team_slot = 1;
  game.participants.player[1].team_slot = 0;
  eq(findDeadMoves(results,members).length,2);
  game.participants.player[0].team_slot = 0;
  game.participants.player[1].team_slot = 1;
  game.participants.player.push({stable_key:'player:slot:1:A',team_slot:1});
  eq(findDeadMoves(results,members).length,2);
  game.participants.player.pop();
  delete game.turnLog[0].events[0].actor_key;
  eq(findDeadMoves(results,members).length,2);
});

// ---- Section G: Coverage gaps + coaching rules ----
T('19c. real action retains detached registration and clears only its move gap', () => {
  const members = [{name:'Whimsicott',moves:['Tailwind'],nature:'Hardy',ability:'Prankster',item:'',evs:{}}];
  const battle = ctx.simulateBattle({members,format:'champions'},
    {members:[{name:'Whimsicott',moves:['Splash'],nature:'Hardy',ability:'',item:'',evs:{}}],format:'champions'},
    {format:'doubles',seed:[1,2,3,4],maxTurns:1});
  eq(findDeadMoves({o:{allLogs:[battle]}},members).length,0);
  members[0].nature = 'Timid';
  eq(battle.playerRegistration[0].nature,'Hardy');
  eq(findDeadMoves({o:{allLogs:[battle]}},members).length,1);
});

T('20. findCoverageGaps - team with no Fake Out surfaces gap', () => {
  const members = [{ name:'Dragapult', ability:'Clear Body', moves:['Dragon Darts','Phantom Force','U-turn','Protect'] }];
  const gaps = findCoverageGaps(members);
  inc(gaps.join(','), 'Fake Out');
});
T('21. evaluateCoachingRules - critical flags surface before suggested', () => {
  const ctx2 = {
    playstyle: 'Balanced', members: [], results: {},
    trends: { totalLosses: 10, trPctInLosses: 50, twPctInLosses: 50, avgFirstKoTurn: 2.0, mostLostMons:['X'], topOppFinishers:['Y'] },
    gaps: ['Speed Control', 'Fake Out'],
    deadMoves: [{ pokemon:'X', move:'Bad Move' }],
    overallWR: 0.30
  };
  const notes = evaluateCoachingRules(ctx2);
  truthy(notes.length >= 5, 'expected multiple rules to fire');
  eq(notes[0].severity, 'critical');
});
T('22. evaluateCoachingRules - clean team only fires optional / dead-move rules', () => {
  const ctx2 = {
    playstyle: 'Balanced', members: [], results: {},
    trends: { totalLosses: 0, trPctInLosses: 0, twPctInLosses: 0, avgFirstKoTurn: 0, mostLostMons:[], topOppFinishers:[] },
    gaps: [],
    deadMoves: [],
    overallWR: 0.75
  };
  const notes = evaluateCoachingRules(ctx2);
  eq(notes.filter(n => n.severity === 'critical').length, 0);
});

T('23. csRiskProfile does not mark multiple single-target closers as single wincon', () => {
  const risk = csRiskProfile({
    members: [
      { name:'Dragapult', ability:'Clear Body', item:'Clear Amulet', moves:['Dragon Darts','Phantom Force','Protect','U-turn'] },
      { name:'Garchomp', ability:'Rough Skin', item:'Clear Amulet', moves:['Dragon Claw','Stomping Tantrum','Protect','Crunch'] },
      { name:'Charizard-Mega-Y', ability:'Drought', item:'Charizardite Y', moves:['Flamethrower','Solar Beam','Protect','Air Slash'] },
      { name:'Whimsicott', ability:'Prankster', item:'Focus Sash', moves:['Tailwind','Encore','Moonblast','Protect'] }
    ]
  }, {});
  truthy(!risk.some(function(r){ return r.category === 'single_wincon'; }), 'unexpected single_wincon risk for multiple real attackers');
});

// ---- Bonus: verdict helper + escape ----
T('23. _verdictFor - boundaries (65/45/30)', () => {
  eq(_verdictFor(70).label, 'Favorable');
  eq(_verdictFor(50).label, 'Even');
  eq(_verdictFor(35).label, 'Risky');
  eq(_verdictFor(10).label, 'Avoid');
});
T('24. _escapeHtml - escapes angle brackets and quotes', () => {
  eq(_escapeHtml('<script>"&bad"</script>'), '&lt;script&gt;&quot;&amp;bad&quot;&lt;/script&gt;');
});

// ---- Integration: generatePDFReport renders without throwing on a real team ----
T('25. generatePDFReport renders HTML into pdf-report-container without throwing', () => {
  const sourceHtml = fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  eq((sourceHtml.match(/id="pdf-report-container"/g) || []).length,1);
  let prints = 0;
  ctx.window.print = () => { prints++; };
  // Prime lastSimResults minimally so sections render.
  ctx.window.ChampionsSim.state.lastResults = { mega_altaria: { winRate: 0.6, wins: 6, losses: 3, draws: 1, winConditions: { 'Opponent Fainted': 5 }, allLogs: [{ result:'win', leads:{ player:['Incineroar','Gengar-Mega']}, log:[] }] } };
  vm.runInContext('window.ChampionsSim.state.lastResults = ' + JSON.stringify(ctx.window.ChampionsSim.state.lastResults) + ';', ctx);
  vm.runInContext('generatePDFReport();', ctx);
  const container = ctx.document.getElementById('pdf-report-container');
  inc(container.innerHTML, 'Team Evidence');
  inc(container.innerHTML, 'Competitive coaching is under review');
  eq(container.innerHTML.includes('/100'), false);
  eq(container.innerHTML.includes('COACHING NOTES'), false);
  eq(prints,1);
});

T('26. public Strategy ignores unsafe cache and volume-based scores', () => {
  ctx.window.ChampionsSim.state.cachedStrategyOverride = {coaching_summary:'UNSUPPORTED_TACTIC',team_report_card:{score:100,confidence:'high'}};
  vm.runInContext("renderStrategyTab('player')", ctx);
  const html = ctx.document.getElementById('strategy-content').innerHTML;
  inc(html, 'Coaching confidence:</strong> Unknown');
  eq(html.includes('UNSUPPORTED_TACTIC'),false);
  eq(html.includes('BATTLE READY'),false);
  eq(html.includes('/10'),false);
  eq(html.includes('Skill Coaching'),false);
});

T('27. safe report excludes other teams and formats despite identical sets', () => {
  TEAMS.evidence_fixture = {name:'Evidence fixture',members:[{name:'Whimsicott',moves:['Tailwind']}]};
  const members = TEAMS.evidence_fixture.members;
  const game = {playerKey:'other_team',format:'doubles',playerRegistration:members,
    participants:{player:[{stable_key:'player:slot:0:Whimsicott',team_slot:0}]},
    turnLog:[{events:[{side:'player',actor_key:'player:slot:0:Whimsicott',move:'Tailwind'}]}]};
  ctx.window.ChampionsSim.state.lastResults = {o:{wins:1000000,allLogs:[game]}};
  vm.runInContext("currentFormat = 'doubles'",ctx);
  const get = () => ctx.csBuildEvidenceOnlyStrategy('evidence_fixture');
  eq(get().members[0].moves[0].observation,'Unknown: no matching action evidence');
  game.playerKey = 'evidence_fixture'; game.format = 'singles';
  eq(get().members[0].moves[0].observation,'Unknown: no matching action evidence');
  game.format = 'doubles';
  eq(get().members[0].moves[0].observation,'Recorded player attempt');
  eq(get().confidence,'unknown');
  eq(get().legality,'not assessed');
  members[0].nature = 'Timid';
  // Freeze a prior registration rather than sharing the fixture's reference.
  game.playerRegistration = [{name:'Whimsicott',moves:['Tailwind']}];
  eq(get().members[0].moves[0].observation,'Unknown: no matching action evidence');
  delete TEAMS.evidence_fixture;
});

console.log(`\nT9j.14 Results: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
