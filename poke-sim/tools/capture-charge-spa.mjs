import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {lifecycleProbe} from './fly-lifecycle-probes.mjs';
import {referenceIdentity,LOCAL_FILES} from './bounded-runtime-capture.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const [upstream,output]=process.argv.slice(2);assert(upstream&&output);
const started_at=new Date().toISOString(),cases=[];
for(const chargeMove of ['Meteor Beam','Electro Shot'])for(const side of ['player','opponent'])for(const slot of [0,1])for(const setup of [{turns:1},{turns:2},{turns:3},{turns:4},{turns:2,item:'Power Herb'},{turns:2,item:'Power Herb',ability:'Klutz',gas:true}]){
 const row=lifecycleProbe({chargeMove,side,slot,...setup},path.join(path.resolve(upstream),'dist/sim'));
 const expected_stage=setup.item?2:Math.ceil(setup.turns/2);
 assert.equal(row.reference.actor_spa,expected_stage);
 for(const key of ['actor_spa','charging','pp_spent','item_consumed','actor_hp_loss','target_losses'])assert.deepEqual(row.candidate[key],row.reference[key],key);
 cases.push({case_id:`CHARGE-SPA-${chargeMove.replaceAll(' ','-')}-${side}-${slot}-${setup.turns}-${setup.item?'herb':'ordinary'}-${setup.gas?'gas':'active'}`,expected_stage,status:'passed_declared_scope',...row});
}
const hash=bytes=>createHash('sha256').update(bytes.toString().replace(/\r\n/g,'\n')).digest('hex');
const receipt={schema_version:'charge-spa-reference-v1',started_at,executed_at:new Date().toISOString(),simulator_commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),reference:referenceIdentity(path.resolve(upstream)),scope:{format:'gen9championsdoublescustomgame',regulation_id:null,client_version:null,synthetic_teams:true,client_verified:false,boundaries:['first preparation','release without extra boost','repeat preparation','Herb consumed','Klutz suppressed by Gas','both sides and slots']},source_urls:['https://github.com/smogon/pokemon-showdown/blob/9b136a8c8cdb860a8ab96fa063f906604e352547/data/moves.ts#L4642','https://github.com/smogon/pokemon-showdown/blob/9b136a8c8cdb860a8ab96fa063f906604e352547/data/moves.ts#L11749'],loaded_source_hashes:Object.fromEntries([...LOCAL_FILES,'tools/fly-lifecycle-probes.mjs','tools/capture-charge-spa.mjs','tools/showdown-reference.mjs'].map(file=>[file,hash(fs.readFileSync(path.join(root,file)))])),cases};
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({cases:cases.length,passed:cases.length,executed_at:receipt.executed_at}));
