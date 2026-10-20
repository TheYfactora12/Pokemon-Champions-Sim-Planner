// Opt-in diagnostic control. No opponent estimates, tactical strength or
// Champions visibility claim. The conservative production default is a separate policy.
var OwnStatePolicy = (function() {
  'use strict';
  const id = 'own-state-diagnostic-v1';
  const text = value => typeof value === 'string' ? value : null;
  function prepare(mon, targetSlots, category) {
    if (!Array.isArray(mon.moves) || !mon.moves.every(name=>typeof name==='string') ||
        !targetSlots.every(slot=>slot===0||slot===1)) throw Error('Invalid own-state input');
    const moves = Object.freeze(mon.moves.map(name => {
      const pp=mon.movePP[name].current;
      return Object.freeze({name,pp:Number.isFinite(pp)?pp:0,status:category(name)==='status'});
    }));
    return Object.freeze({
      moves, targetSlots: Object.freeze(targetSlots.slice()),
      charge: text(mon.chargingMove), chargeSide: mon.chargingTargetSide === 'ally' ? 'ally' : 'enemy',
      chargeSlot: Number.isInteger(mon.chargingTargetSlot) ? mon.chargingTargetSlot : null,
      choice: mon.item === 'Choice Scarf' && mon.ability !== 'Klutz' && !mon.itemConsumed ? text(mon.choiceLock) : null,
      encore: mon.encoredTurns > 0 ? text(mon.encoredMove) : null,
      asleep: mon.status === 'sleep', taunted: mon.tauntedTurns > 0,
      lateEntry: mon.turnsSinceEntry > 1, fakeDone: !!mon._fakeDone,
      mc: mon.referenceMode === 'champions_mc_reference'
    });
  }
  function choose(input) {
    if (!input || !Object.isFrozen(input) || !Object.isFrozen(input.moves) ||
        !Object.isFrozen(input.targetSlots)) throw Error('Detached frozen decision input required');
    const usable = name => input.moves.some(row => row.name === name && row.pp > 0);
    let move;
    if (input.charge) move = input.charge;
    else if (input.choice && usable(input.choice)) move = input.choice;
    else if (input.encore) move = usable(input.encore) ? input.encore : 'Struggle';
    else if (input.asleep && usable('Sleep Talk')) move = 'Sleep Talk';
    else move = (input.moves.find(row => row.pp > 0 && !(input.taunted && row.status) &&
      !(row.name === 'Fake Out' && (input.lateEntry || input.fakeDone)) &&
      !(row.name === 'First Impression' && input.mc && input.lateEntry)) || {}).name || 'Struggle';
    return Object.freeze({
      move,
      targetSide: input.charge && input.chargeSide === 'ally' ? 'ally' : 'enemy',
      targetSlot: input.charge && Number.isInteger(input.chargeSlot) ? input.chargeSlot : (input.targetSlots[0] ?? null)
    });
  }
  function provenance(forced) {
    return {id, information_model:'own_registered_state_and_active_target_slots',
      forced_actions:!!forced, competitive_strength_verified:false,
      limitations:['Diagnostic first-candidate control with limited legality checks; execution may reject. No opponent estimates or reveal ledger.',
        'Not a human-play policy or verified Champions visibility model.']};
  }
  // Trusted engine adapter: read only target occupancy from opposing actors.
  // Prepare both sides before any decision; resolve targets later in the engine.
  function turn(player, opponent, category) {
    const inputs=[];
    for(const [own,other] of [[player,opponent],[opponent,player]]) {
      const slots=other.flatMap((mon,slot)=>mon.alive?[slot]:[]);
      for(const mon of own.filter(mon=>mon.alive)) inputs.push([mon,OwnStatePolicy.prepare(mon,slots,category)]);
    }
    return new Map(inputs.map(([mon,input])=>[mon,OwnStatePolicy.choose(input)]));
  }
  return Object.freeze({id,prepare,choose,provenance,turn});
})();
if (typeof module !== 'undefined' && module.exports) module.exports = OwnStatePolicy;
