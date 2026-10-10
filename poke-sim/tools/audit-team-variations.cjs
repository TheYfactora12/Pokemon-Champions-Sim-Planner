// Diagnostic coverage, not official legality or game-parity certification.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const c = vm.createContext({console});
const files = ['data.js','generated/tournament_catalog.js','generated/pokemon_showdown_legal_data.js','runtime_data.js','move_legality.js','generated/mc_review_reference.js','mc_review.js','legality.js','rulesets.js','engine.js'];
const hashes = {};
for (const file of files) {
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  hashes[file] = crypto.createHash('sha256').update(src).digest('hex');
  vm.runInContext(src, c);
}
c.ChampionsSim.pokemonDataAudit = require('../generated/pokemon_showdown_legal_data.js');
const teams = vm.runInContext('TEAMS', c);
const replayPath = process.argv[2];
if (replayPath) {
  const bytes = fs.readFileSync(path.resolve(replayPath));
  const replay = JSON.parse(bytes);
  if (!replay.player_team || !Array.isArray(replay.player_team.members)) throw new Error('Expected replay with registered player_team members');
  if (teams[replay.player_team_id]) throw new Error('Replay team ID collides with bundled team');
  teams[replay.player_team_id || 'replay_player'] = replay.player_team;
  hashes.replay_input = crypto.createHash('sha256').update(bytes).digest('hex');
}
const checks = Object.entries(teams).map(([id, team]) => ({id, ...c.checkMcReferenceExecution(team,{format:'doubles'})}));
const accepted = checks.filter(r => r.allowed).map(r => r.id);
if (!accepted.length) throw new Error('No reference-accepted teams loaded');
const before = JSON.stringify(teams);
const report = {created_at:new Date().toISOString(), hashes, scope:'M-C reference diagnostics, not approved competitive evidence', checks, battles:0, repeats:0, failures:[], findings:{}, coverage:{}, outcomes:{}};
function permutations(names, picked = []) {
  if (picked.length === 4) return [picked];
  return names.flatMap((name,i) => permutations(names.filter((_,j)=>i!==j), [...picked,name]));
}
function record(kind, detail) {
  const entry = report.findings[kind] ||= {count:0, samples:[]};
  entry.count++;
  if (entry.samples.length < 8) entry.samples.push(detail);
}
function run(p,o,picks,other,index,repeat) {
  const digest = crypto.createHash('sha256').update(JSON.stringify([p,o,picks,other,index])).digest();
  const seed = [0,4,8,12].map(i=>digest.readUInt32LE(i));
  const opts = {format:'doubles', rulesetId:'champions_mc_reference', seed, playerBring:picks, opponentBring:other};
  const detail = {p,o,picks,other,seed};
  try {
    const b = c.simulateBattle(teams[p],teams[o],opts);
    report.battles++;
    report.outcomes[b.result] = (report.outcomes[b.result]||0)+1;
    if (b.result === 'error' || !Number.isFinite(b.turns) || b.turns < 1) throw new Error('Invalid battle result');
    for (const [side,id,bring] of [['player',p,picks],['opponent',o,other]]) {
      const rows = b.participants[side];
      if (rows.length !== 4 || new Set(rows.map(r=>r.stable_key)).size !== 4) throw new Error('Participant identity/count failure');
      if (bring && rows.some((r,i)=>teams[id].members[r.team_slot].name!==bring[i])) throw new Error('Bring order mismatch');
      if (rows.some(r=>r.item !== (teams[id].members[r.team_slot].item||''))) throw new Error('Registered item changed');
    }
    for (const turn of b.turnLog || []) {
      for (const e of turn.damage_events || []) {
        if (![e.target_hp_before,e.target_hp_after,e.applied_damage].every(Number.isFinite) || e.target_hp_after < 0 || e.target_hp_before-e.target_hp_after!==e.applied_damage) throw new Error('Damage HP accounting failure');
      }
      for (const e of turn.effect_events || []) {
        if (e.effect_kind !== 'recoil') continue;
        const hit = (turn.damage_events||[]).find(d=>d.attacker_key===e.actor_key && d.move===e.move);
        if (hit && hit.attacker_ability==='Rock Head' && e.move!=='Struggle') record('rock_head_recoil_candidate',{...detail,turn:turn.turn,move:e.move,hp_delta:e.hp_delta});
      }
    }
    if (repeat) {
      report.repeats++;
      if (JSON.stringify(b)!==JSON.stringify(c.simulateBattle(teams[p],teams[o],opts))) throw new Error('Seed repeatability failure');
    }
  } catch(e) { report.failures.push({...detail,error:e.message}); }
}
for (let i=0;i<accepted.length;i++) {
  const p = accepted[i];
  const variants = permutations(teams[p].members.map(m=>m.name));
  report.coverage[p] = {ordered_bring_variants:variants.length, pairings:accepted.length, seeds_per_pair:10};
  variants.forEach((bring,n)=>{
    const o = accepted[(i+n)%accepted.length];
    const opponent = teams[o].members.map(m=>m.name);
    const shift = n%opponent.length;
    const other = opponent.slice(shift).concat(opponent.slice(0,shift)).slice(0,4);
    run(p,o,bring,other,n,n%60===0);
  });
  for (const o of accepted) for(let n=0;n<10;n++) run(p,o,undefined,undefined,n,n===0);
  console.log(p, report.battles, 'battles;',report.failures.length,'invariant failures');
}
if (JSON.stringify(teams)!==before) report.failures.push({error:'Input teams mutated'});
const out = path.join(root,'reports/artifacts/team-variations-'+Date.now()+'.json');
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(report,null,2));
console.log(JSON.stringify({out,accepted:accepted.length,excluded:checks.length-accepted.length,battles:report.battles,repeats:report.repeats,failures:report.failures.length,findings:report.findings},null,2));
process.exitCode = report.failures.length ? 1 : 0;
