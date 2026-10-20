'use strict';
// Development injection only. Never loaded by HTML, bundles, service workers or aggregates.
const abilities=new Set(['','Illuminate','Battle Armor','Shell Armor','Own Tempo','Inner Focus','Limber','Immunity','Keen Eye','Regenerator','Intimidate']);
const items=new Set(['','Leftovers','Sitrus Berry']);
const moves=new Set(['Splash','Protect','Tackle','Swift','Seismic Toss','Helping Hand','Life Dew','Earthquake','Bulldoze','Thunder Wave','Trick Room']);
function reject(reason){throw new Error('Scripted switch diagnostic rejected: '+reason);}
function checkOptions(opts){
 if(opts.format!=='doubles'||!Array.isArray(opts.scriptedSwitches)||!opts.scriptedSwitches.length)reject('explicit doubles script required');
 const turns=new Set();
 for(const r of opts.scriptedSwitches){
  if(!r||!Number.isInteger(r.turn)||r.turn<1||r.turn>(opts.maxTurns||30)||!['player','opponent'].includes(r.side)||
   typeof r.actorId!=='string'||!r.actorId||typeof r.replacementId!=='string'||!r.replacementId||r.actorId===r.replacementId)reject('invalid directive');
  if(turns.has(r.turn))reject('one switch globally per turn');turns.add(r.turn);
 }
}
function prepare(opts,turn,active,bench,field){
 const r=opts.scriptedSwitches.find(r=>r.turn===turn);if(!r)return null;
 for(const obj of [field,field.playerSide,field.oppSide])if(obj&&Object.entries(obj).some(([k,v])=>/spikes|stealth.?rock|sticky.?web|hazard/i.test(k)&&v))reject('hazard context outside scope');
 if(field.gravityTurns||field.terrainTurns||field.weather!=='none')reject('field lifecycle outside scope');
 const roster=[...active.player,...active.opponent,...bench.player,...bench.opponent];
 if(new Set(roster.map(m=>m.stableKey)).size!==roster.length)reject('duplicate identity');
 for(const m of roster){
  if(m.megaForm||m.isMega||m.referenceMode||m.transformed||m.stanceChangeForms)reject('Mega/transformation context unproved');
  if(!abilities.has(m.ability)||!items.has(m.item||''))reject('ability/item lifecycle outside allowlist');
  if(m.chargingMove||m.concealedByMove||m.rechargeTurns||m.trappedByMove||m._mcTrap||m._mcSyrup||m.substituteHp||m.leechSeededBy||m.perishSongTurns||m.groundedByMove||m._mcTraceOriginal)reject('trap/volatile lifecycle outside scope');
 }
 const actor=active[r.side].find(m=>m.stableKey===r.actorId),replacement=bench[r.side].find(m=>m.stableKey===r.replacementId);
 if(replacement&&['sleep','frozen'].includes(replacement.status))reject('incoming sleep/freeze counter lifecycle unproved');
 if(!actor||!actor.alive||!replacement||!replacement.alive)reject('actor/replacement not active/living brought bench');
 const slot=active[r.side].indexOf(actor);
 if((opts.forcedActions||[]).some(a=>(a.turn==null||Number(a.turn)===turn)&&(!a.side||[r.side,r.side==='opponent'?'opp':'player'].includes(a.side))&&
   (a.slot==null||Number(a.slot)===slot)&&(!a.pokemon||a.pokemon===actor.name)))reject('conflicting forced move and switch');
 return Object.freeze({actor,replacement,side:r.side,slot});
}
function checkActions(actions){
 for(const a of actions)if(a.kind!=='switch'&&!moves.has(a.move))reject('move lifecycle outside diagnostic allowlist: '+a.move);
}
module.exports={checkOptions,prepare,checkActions};
