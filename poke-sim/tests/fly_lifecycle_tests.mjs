import assert from 'node:assert/strict';
import {test} from 'node:test';
import {lifecycleProbe,variants,assertConfusionInterrupted} from '../tools/fly-lifecycle-probes.mjs';

for(const side of ['player','opponent'])for(const slot of [0,1])for(const {id,...config}of variants)test(`FLY-LIFE-${id}-${side}-${slot}`,()=>{
 const row=lifecycleProbe({...config,side,slot},process.env.CHAMPIONS_REFERENCE_SIM);
 const keys=['actor_types','actor_atk','actor_spa','charging','pp_spent','tackle_pp_spent','target_losses','item_consumed','active'];
 if(!config.interrupt)keys.push('actor_hp_loss','status');
 for(const key of keys)assert.deepEqual(row.candidate[key],row.reference[key],key+' '+JSON.stringify(row.input));
 if(['helping-hand','redirect-charge','stored-slot-one'].includes(id))assert(row.reference.target_losses.some(n=>n>0),'target assertion must observe damage');
 if(id==='helping-hand')assert.equal(row.candidate.target_losses[0],94,'independent boosted release damage');
 if(config.interrupt==='confusion')assertConfusionInterrupted(row);
 if(config.interrupt)assert.equal(row.candidate.charging,false,'interrupted Fly must not remain concealed');
});
for(const move of ['Gust','Twister'])for(let roll=85;roll<=100;roll++)test(`FLY-DAMAGE-${move}-${roll}`,()=>{
 const air=lifecycleProbe({move,roll},process.env.CHAMPIONS_REFERENCE_SIM);
 const ground=lifecycleProbe({move,roll,actorMove:'Tackle'},process.env.CHAMPIONS_REFERENCE_SIM);
 assert.equal(air.candidate.actor_hp_loss,air.reference.actor_hp_loss);
 assert.equal(ground.candidate.actor_hp_loss,ground.reference.actor_hp_loss);
 assert.equal(air.reference.actor_hp_loss,2*ground.reference.actor_hp_loss,'final modifier, including spread/resistance rounding');
});

// This is a retained gap assertion, not a successful forced-switch parity case.
for(const side of ['player','opponent'])for(const slot of [0,1])test(`FLY-GAP-eject-button-${side}-${slot}`,()=>{
 const row=lifecycleProbe({side,slot,item:'Eject Button',move:'Gust'},process.env.CHAMPIONS_REFERENCE_SIM);
 assert.equal(row.reference.item_consumed,true);assert.equal(row.candidate.item_consumed,false);
 assert(row.candidate_log.some(line=>line.includes('Eject Button')&&line.includes('not in verified implemented')));
});
