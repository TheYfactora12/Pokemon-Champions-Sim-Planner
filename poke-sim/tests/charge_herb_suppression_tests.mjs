import assert from 'node:assert/strict';import {test} from 'node:test';import {localContext} from '../tools/probe-fly-repair.mjs';import {lifecycleProbe} from '../tools/fly-lifecycle-probes.mjs';
const moves=['Solar Beam','Solar Blade','Meteor Beam','Electro Shot','Phantom Force'];
const setups=[{}, {item:'Power Herb'}, {item:'Power Herb',ability:'Klutz'}, {item:'Power Herb',ability:'Klutz',gas:true}];
for(const chargeMove of moves)for(const side of ['player','opponent'])for(const slot of [0,1])for(const [i,setup]of setups.entries())test(`CHARGE-HERB-${chargeMove}-${side}-${slot}-${i}`,()=>{
 const row=lifecycleProbe({chargeMove,side,slot,turns:2,...setup},process.env.CHAMPIONS_REFERENCE_SIM);
 for(const key of ['charging','pp_spent','actor_hp_loss','target_losses','item_consumed'])assert.deepEqual(row.candidate[key],row.reference[key],key);
 const stageGap=['Meteor Beam','Electro Shot'].includes(chargeMove)&&setup.item==='Power Herb'&&(!setup.ability||setup.gas);
 if(stageGap){assert.equal(row.reference.actor_spa,2);assert.equal(row.candidate.actor_spa,1,'retained pre-existing repeat-charge boost gap');}else assert.equal(row.candidate.actor_spa,row.reference.actor_spa);
 if(setup.gas){assert.equal(row.reference.item_consumed,true);assert.equal(row.reference.pp_spent,2);}
});

for(const chargeMove of moves)test('CHARGE-HERB-raw-Klutz-reversal-'+chargeMove,()=>{
 const mutate=source=>{const before="return _contactEffects(field).item(mon) === 'Power Herb';";assert.equal(source.split(before).length,2);return source.replace(before,"return mon.item === 'Power Herb' && !mon.itemConsumed && mon.ability !== 'Klutz';");};
 const row=lifecycleProbe({chargeMove,turns:2,item:'Power Herb',ability:'Klutz',gas:true},process.env.CHAMPIONS_REFERENCE_SIM,mutate);
 assert.equal(row.reference.item_consumed,true);assert.equal(row.candidate.item_consumed,false);
});

for(const move of ['Fly',...moves])test('CHARGE-HERB-suppression-restoration-'+move,()=>{
 const c=localContext(true),mon={alive:true,ability:'Klutz',item:'Power Herb',itemConsumed:false},gas={alive:true,ability:'Neutralizing Gas'};
 const field={playerSide:{activeMons:[mon,gas]},oppSide:{activeMons:[]}};
 assert.equal(c._moveSkipsChargeTurn(mon,move,field),true);
 gas.alive=false;assert.equal(c._moveSkipsChargeTurn(mon,move,field),false);
 gas.alive=true;mon.itemConsumed=true;assert.equal(c._moveSkipsChargeTurn(mon,move,field),false);
});
