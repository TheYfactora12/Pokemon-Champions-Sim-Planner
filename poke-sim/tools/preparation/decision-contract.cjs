'use strict';
// Preparation only: not loaded by the browser or connected to engine selection.
// Inputs must come from a reviewed public-event adapter, never a guessed game rule.
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
function text(value) { return typeof value === 'string' && value.trim() ? value : null; }
function integer(value) { return Number.isInteger(value) ? value : null; }
function strings(value) { return Array.isArray(value) ? value.filter(v => typeof v === 'string').slice() : []; }
function decisionObservation(input) {
  if (!input || !['player','opponent'].includes(input.viewer) || !Number.isInteger(input.turn) || input.turn < 1 ||
      !Number.isInteger(input.observedThrough) || input.observedThrough < 0) throw new Error('Explicit observer and event cutoff required');
  const identities=new Set();
  for(const mon of [...(input.own || []),...(input.opponents || [])]) {
    if(!mon || !text(mon.id) || identities.has(mon.id)) throw new Error('Invalid or duplicate observation identity');
    identities.add(mon.id);
  }
  const opponents=(input.opponents || []).map(mon => {
    const out={id:text(mon.id),species:text(mon.visibleSpecies),activeSlot:integer(mon.activeSlot),
      hpPercent:typeof mon.hpPercent === 'number' && mon.hpPercent>=0 && mon.hpPercent<=100 ? mon.hpPercent : null,
      status:text(mon.visibleStatus),moves:[],item:null,ability:null,evidence:[]};
    const seen=new Map();
    const ordered=(input.reveals || []).slice().sort((a,b)=>(a && a.sequence || 0)-(b && b.sequence || 0));
    for(const fact of ordered) {
      if (!fact || fact.viewer!==input.viewer || fact.subject!==out.id || !out.id ||
          !Number.isInteger(fact.turn) || fact.turn<1 || fact.turn>input.turn ||
          !Number.isInteger(fact.sequence) || fact.sequence<0 || fact.sequence>input.observedThrough ||
          !text(fact.evidenceId) || !(text(fact.value) || (['item','ability'].includes(fact.kind) && fact.value===null))) continue;
      const key=fact.kind+':'+fact.sequence;
      if(seen.has(key) && seen.get(key)!==JSON.stringify([fact.turn,fact.value])) throw new Error('Conflicting reveal facts');
      seen.set(key,JSON.stringify([fact.turn,fact.value]));
      if(fact.kind==='move') { if(!out.moves.includes(fact.value)) out.moves.push(fact.value); }
      else if(fact.kind==='item' || fact.kind==='ability') out[fact.kind]=fact.value;
      else continue;
      out.evidence.push(fact.evidenceId);
    }
    return out;
  });
  const own=(input.own || []).map(mon=>({id:text(mon.id),activeSlot:integer(mon.activeSlot),
    hp:integer(mon.hp),maxHp:integer(mon.maxHp),moves:strings(mon.moves),item:text(mon.item),ability:text(mon.ability)}));
  return freeze({schema:'decision-observation-preparation-v1',viewer:input.viewer,turn:input.turn,
    observedThrough:input.observedThrough,own,opponents,
    field:{weather:text(input.field && input.field.visibleWeather),terrain:text(input.field && input.field.visibleTerrain)},
    game_visibility_verified:false});
}
// This validates a proposed diagnostic contract, not Champions switch legality.
function validateSwitchIntent(input) {
  const errors=[];
  if(!input || !Number.isInteger(input.turn) || input.turn<1) return freeze({allowed:false,errors:['invalid_turn'],execution_supported:false});
  if(!['player','opponent'].includes(input.side)) errors.push('invalid_side');
  const roster=Array.isArray(input.roster)?input.roster:[];
  if(!text(input.actorId) || !text(input.replacementId)) errors.push('missing_identity');
  const ids=new Set(),slots=new Set();
  for(const mon of roster) {
    if(!mon || !text(mon.id) || ids.has(mon.id)) {errors.push('invalid_roster_identity');continue;}
    ids.add(mon.id);
    if([0,1].includes(mon.activeSlot)) {
      const slot=mon.side+':'+mon.activeSlot;
      if(slots.has(slot)) errors.push('duplicate_active_slot');
      slots.add(slot);
    }
  }
  const matches=id=>roster.filter(m=>m && text(id) && m.id===id);
  const actors=matches(input.actorId),targets=matches(input.replacementId);
  if(actors.length!==1 || actors[0].side!==input.side || ![0,1].includes(actors[0].activeSlot) || actors[0].alive!==true || actors[0].brought!==true) errors.push('invalid_actor');
  if(targets.length!==1 || targets[0].side!==input.side || targets[0].activeSlot!==null || targets[0].alive!==true || targets[0].brought!==true) errors.push('invalid_replacement');
  if(input.actorId===input.replacementId) errors.push('same_member');
  if(input.otherSwitches!==0) errors.push('single_switch_scope_only');
  if(input.megaPlanned!==false) errors.push('mega_order_unverified');
  const availability=input.availability;
  if(!availability || availability.allowed!==true || !text(availability.evidenceId)) errors.push('switch_availability_unverified_or_denied');
  return freeze({allowed:errors.length===0,errors,execution_supported:false});
}
module.exports={decisionObservation,validateSwitchIntent};
