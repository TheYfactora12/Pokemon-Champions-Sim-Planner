import assert from 'node:assert/strict';
import {test} from 'node:test';
import {localContext,teams} from '../tools/probe-fly-repair.mjs';
import {lifecycleProbe} from '../tools/fly-lifecycle-probes.mjs';
const reference=process.env.CHAMPIONS_REFERENCE_SIM;
const keys=['actor_spa','charging','pp_spent','item_consumed','actor_hp_loss','target_losses'];
function check(input,expected,mutate){
 const row=lifecycleProbe(input,reference,mutate);
 assert.equal(row.reference.actor_spa,expected,'independent expected stage');
 for(const key of keys)assert.deepEqual(row.candidate[key],row.reference[key],key);
 for(const turn of row.candidate_turns){
  const events=turn.events||[],used=events.find(e=>e.text.includes(` used ${input.chargeMove}!`));
  if(used){
   assert.equal(used.move,input.chargeMove,'charge action anchor');
   assert.equal(used.side,input.side||'player','charge actor side');
   assert(used.actor_key,'stable charge actor');
   assert.equal(events.filter(e=>e.move===input.chargeMove).length,1,'one anchor per invocation');
  }
  for(const event of events)if(event.move===input.chargeMove)assert(event===used,'anchor must not bind stage or item prelude');
 }
 return row;
}
for(const chargeMove of ['Meteor Beam','Electro Shot'])for(const side of ['player','opponent'])for(const slot of [0,1]){
 for(const turns of [1,2,3,4])test(`CHARGE-SPA-normal-${chargeMove}-${side}-${slot}-t${turns}`,()=>check({chargeMove,side,slot,turns},Math.ceil(turns/2)));
 for(const [id,setup,expected]of [
  ['herb',{item:'Power Herb'},2],
  ['herb-consumed',{item:'Power Herb',consumed:true},1],
  ['klutz',{item:'Power Herb',ability:'Klutz'},1],
  ['klutz-gas',{item:'Power Herb',ability:'Klutz',gas:true},2],
  ['simple',{ability:'Simple'},2],
  ['contrary',{ability:'Contrary'},-1],
  ['simple-gas',{ability:'Simple',gas:true},1],
  ['contrary-gas',{ability:'Contrary',gas:true},1],
  ['shield',{ability:'Simple',gas:true,item:'Ability Shield'},2],
  ['cap',{initialSpa:6},6],
  ['lower-cap',{initialSpa:-6,ability:'Contrary'},-6],
  ['protected',{protectTurn:2},1],
  ['sleep',{interrupt:'sleep'},1],
  ['frozen',{interrupt:'frozen'},1],
  ['flinch',{interrupt:'flinch'},1],
  ['paralysis',{interrupt:'paralysis'},1],
  ['confusion',{interrupt:'confusion'},1],
 ])test(`CHARGE-SPA-${id}-${chargeMove}-${side}-${slot}`,()=>{
  const row=check({chargeMove,side,slot,turns:2,...setup},expected);
  if(setup.interrupt){
   const actor=(side==='player'?'p1':'p2')+(slot?'b':'a')+':';
   if(setup.interrupt==='confusion')assert(row.reference_log.some(line=>line.startsWith('|-damage|'+actor)&&line.endsWith('[from] confusion')),'reference actual self-hit');
   else assert(row.reference_log.some(line=>line.startsWith('|cant|'+actor)&&line.includes('|'+({sleep:'slp',frozen:'frz',paralysis:'par',flinch:'flinch'}[setup.interrupt]))),'reference actual denial');
   assert(row.candidate_turns[1].effect_events.some(e=>e.action_denial_reason===setup.interrupt&&e.skipped_action_move===chargeMove),'candidate actual denial');
   assert.equal(row.candidate.charging,false);
   assert.deepEqual(row.candidate.target_losses,[0,0]);
  }
 });
}
for(const side of ['player','opponent'])for(const slot of [0,1]){
 test(`CHARGE-SPA-rain-${side}-${slot}`,()=>check({chargeMove:'Electro Shot',foeAbility:'Drizzle',item:'Power Herb',turns:2,side,slot},2));
 test(`CHARGE-SPA-cloud-nine-${side}-${slot}`,()=>check({chargeMove:'Electro Shot',foeAbility:'Drizzle',ability:'Cloud Nine',turns:2,side,slot},1));
 test(`CHARGE-SPA-miss-${side}-${slot}`,()=>{const row=check({chargeMove:'Meteor Beam',miss:true,turns:2,side,slot},1);assert.deepEqual(row.reference.target_losses,[0,0]);assert(row.reference_log.some(line=>line.startsWith('|-miss|')));});
}

for(const chargeMove of ['Meteor Beam','Electro Shot'])for(const [id,before,after,turns]of [
 ['missing',"if (!_continuingCharge && (move === 'Electro Shot' || move === 'Meteor Beam')) {","if (false && (move === 'Electro Shot' || move === 'Meteor Beam')) {",1],
 ['double',"if (!_continuingCharge && (move === 'Electro Shot' || move === 'Meteor Beam')) {","if (move === 'Electro Shot' || move === 'Meteor Beam') {",2],
 ['delayed',"if (!_continuingCharge && (move === 'Electro Shot' || move === 'Meteor Beam')) {","if (_continuingCharge && (move === 'Electro Shot' || move === 'Meteor Beam')) {",1],
])test(`CHARGE-SPA-reversal-${id}-${chargeMove}`,()=>{
 const mutate=source=>{assert.equal(source.split(before).length,2);return source.replace(before,after);};
 assert.throws(()=>check({chargeMove,turns},1,mutate),/actor_spa/);
});

for(const chargeMove of ['Meteor Beam','Electro Shot'])test(`CHARGE-SPA-anchor-reversal-${chargeMove}`,()=>{
 const mutate=source=>source.replace('if (event && event.move === move && index >= 0) event.log_index = index - field._ctx.turnLogStart;','/* reversal: stale prelude anchor */');
 assert.throws(()=>check({chargeMove,turns:2},1,mutate),/charge action anchor|anchor must not bind/);
});

// Instrumentation ownership controls, not reference or legality certification.
for(const move of ['Meteor Beam','Electro Shot'])for(const item of ['', 'Power Herb'])test(`CHARGE-ANCHOR-mirror-${move}-${item}`,()=>{
 const c=localContext(),team=teams()[0];
 team.members[0]={...team.members[0],name:'Archaludon',ability:'Stamina',moves:[move],item};
 const actions=[];
 for(let turn=1;turn<=2;turn++)for(const side of ['player','opponent'])for(const slot of [0,1])actions.push({turn,side,slot,move:slot?'Protect':move,targetSlot:0});
 c.CRIT_STAGES.fill(0);c._sampleDamageRoll=()=>1;c._moveHits=()=>true;
 const result=c.simulateBattle(structuredClone(team),structuredClone(team),{format:'doubles',maxTurns:2,seed:[3,7,11,13],forcedActions:actions});
 assert.notEqual(result.result,'error');
 for(const turn of result.turnLog){
  const anchors=turn.events.filter(e=>e.move===move);
  assert.equal(anchors.length,2);assert.equal(new Set(anchors.map(e=>e.actor_key)).size,2);
  assert.deepEqual(Array.from(anchors,e=>e.side).sort(),['opponent','player']);
  for(const event of anchors)assert(event.text.startsWith(`Archaludon used ${move}!`));
 }
});
for(const move of ['Meteor Beam','Electro Shot'])test(`CHARGE-ANCHOR-child-${move}`,()=>{
 const c=localContext(),inputs=teams();inputs[0].members[0].ability='Comatose';inputs[0].members[0].moves=['Sleep Talk',move];
 const result=c.simulateBattle(...inputs,{format:'doubles',maxTurns:1,seed:[3,7,11,13],forcedActions:[{turn:1,side:'player',slot:0,move:'Sleep Talk',targetSlot:0}]});
 const events=result.turnLog[0].events,parent=events.filter(e=>e.move==='Sleep Talk'),child=events.filter(e=>e.move===move);
 assert.equal(parent.length,1);assert.equal(child.length,1);assert.equal(child[0].called_by,'Sleep Talk');
 assert.equal(parent[0].actor_key,child[0].actor_key);
 assert(child[0].text.startsWith(`Aerodactyl used ${move}!`));assert(parent[0].text.startsWith('Aerodactyl used Sleep Talk!'));
});
