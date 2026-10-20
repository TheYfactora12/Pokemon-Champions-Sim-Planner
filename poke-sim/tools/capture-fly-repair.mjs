import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
import {lifecycleProbe,variants,assertConfusionInterrupted} from './fly-lifecycle-probes.mjs';import {assess} from './probe-fly-repair.mjs';import {referenceIdentity,LOCAL_FILES} from './bounded-runtime-capture.mjs';
const [upstream,out]=process.argv.slice(2);assert(upstream&&out,'Usage: capture-fly-repair UPSTREAM OUT');
const root=new URL('../',import.meta.url),reference=referenceIdentity(path.resolve(upstream)),sim=path.resolve(upstream,'dist/sim');
const sha=b=>createHash('sha256').update(b).digest('hex');
const keys=['actor_types','actor_atk','actor_spa','charging','pp_spent','tackle_pp_spent','target_losses','item_consumed','active'];
const detach=row=>JSON.parse(JSON.stringify(row));
const cases=[];
for(const side of ['player','opponent'])for(const slot of [0,1])for(const {id,...config}of variants){
 const row=lifecycleProbe({...config,side,slot},sim);delete row.candidate_turns;
 if(config.interrupt==='confusion')assertConfusionInterrupted(row);
 const compared=[...keys,...(!config.interrupt||config.interrupt==='confusion'?['actor_hp_loss','status']:[])];
 for(const key of compared)assert.deepEqual(row.candidate[key],row.reference[key],id+':'+key);
 cases.push(detach({case_id:`FLY-LIFE-${id}-${side}-${slot}`,compared_fields:compared,status:'reference_agreement',...row}));
}
for(const side of ['player','opponent'])for(const slot of [0,1]){const row=lifecycleProbe({side,slot,turns:3,move:'Protect',interrupt:'confusion'},sim);assertConfusionInterrupted(row);delete row.candidate_turns;cases.push(detach({case_id:`FLY-CONFUSION-three-turn-${side}-${slot}`,compared_fields:[...keys,'actor_hp_loss','status'],status:'reference_agreement',...row}));}
for(const move of ['Gust','Twister'])for(let roll=85;roll<=100;roll++){
 const air=lifecycleProbe({move,roll},sim),ground=lifecycleProbe({move,roll,actorMove:'Tackle'},sim);
 for(const row of [air,ground]){delete row.candidate_turns;assert.equal(row.candidate.actor_hp_loss,row.reference.actor_hp_loss);}
 assert.equal(air.reference.actor_hp_loss,2*ground.reference.actor_hp_loss);
 cases.push(detach({case_id:`FLY-DAMAGE-${move}-${roll}`,status:'reference_agreement',compared_fields:['actor_hp_loss'],air,ground}));
}
const gaps=[];for(const side of ['player','opponent'])for(const slot of [0,1]){const row=lifecycleProbe({side,slot,item:'Eject Button',move:'Gust'},sim);delete row.candidate_turns;assert.notEqual(row.candidate.item_consumed,row.reference.item_consumed);gaps.push(detach({case_id:`FLY-GAP-eject-button-${side}-${slot}`,status:'unsupported_dependency',...row}));}
const basic=assess(sim);assert(basic.every(row=>row.agrees));
const charge=[];
for(const chargeMove of ['Solar Beam','Solar Blade','Meteor Beam','Electro Shot','Phantom Force'])for(const side of ['player','opponent'])for(const slot of [0,1])for(const [i,setup]of [{},{item:'Power Herb'},{item:'Power Herb',ability:'Klutz'},{item:'Power Herb',ability:'Klutz',gas:true}].entries()){
 const row=lifecycleProbe({chargeMove,side,slot,turns:2,...setup},sim);delete row.candidate_turns;const compared=['charging','pp_spent','actor_hp_loss','target_losses','item_consumed'];
 for(const key of compared)assert.deepEqual(row.candidate[key],row.reference[key]);
 const stageGap=row.candidate.actor_spa!==row.reference.actor_spa;
 charge.push(detach({case_id:`CHARGE-HERB-${chargeMove}-${side}-${slot}-${i}`,compared_fields:compared,status:'reference_agreement_in_compared_fields',unresolved:stageGap?['repeat-charge-SpA-boost']:[],...row}));
}
const files=[...LOCAL_FILES,'tools/fly-lifecycle-probes.mjs','tools/probe-fly-repair.mjs','tools/capture-fly-repair.mjs','tools/showdown-reference.mjs','tools/bounded-runtime-capture.mjs','tests/fly_lifecycle_tests.mjs','tests/fly_mutation_tests.mjs','tests/fly_repair_tests.mjs','tests/charge_herb_suppression_tests.mjs'];
const receipt={schema_version:2,supersedes_scope_correction: "v1 confusion had no reference self-hit; original receipt retained",executed_at:new Date().toISOString(),scope:{format:'gen9championsdoublescustomgame',synthetic:true,production_admission:false,client_verified:false,official_regulation_verified:false},rng_controls:{damage:'fixed semantic roll85-100',critical:false,accuracy:'forced successful; separate direct accuracy suite',local_random:.99,interrupt_random:'sleep/paralysis/confusion .05; freeze .99',reference_randomChance:'true above50%; paralysis1/8; confusion33/100 only for designated probes'},reference,source_hashes:Object.fromEntries(files.map(f=>[f,sha(fs.readFileSync(new URL(f,root),'utf8').replace(/\r\n/g,'\n'))])),basic,cases,gaps,charge};
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({basic:basic.length,lifecycle_and_damage:cases.length,known_gaps:gaps.length,charge_cases:charge.length,charge_stage_gaps:charge.filter(row=>row.unresolved.length).length,executed_at:receipt.executed_at}));
