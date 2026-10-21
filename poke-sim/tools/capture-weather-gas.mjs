import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
import {weatherProbe,weatherAbilities,simultaneousWeatherProbe} from './weather-gas-probes.mjs';
import {LOCAL_FILES,referenceIdentity} from './bounded-runtime-capture.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),[upstream,output,baseline]=process.argv.slice(2);assert(upstream&&output);
const hash=b=>createHash('sha256').update(b.toString().replaceAll('\r\n','\n')).digest('hex');
const commit=baseline||execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();assert(/^[a-f0-9]{40}$/.test(commit));
const old=baseline?execFileSync('git',['show',baseline+':poke-sim/engine.js'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024}):null;
const mutate=old?()=>old:undefined,started_at=new Date().toISOString(),configs=[];
for(const side of ['player','opponent'])for(const ability of Object.keys(weatherAbilities)){
 for(const shield of ['none','active','consumed'])for(const mode of ['entry','pivot','faint','reentry'])configs.push({side,ability,shield,mode});
 configs.push({side,ability,gas:false},{side,ability,mode:'pivot',secondGas:true},{side,ability,mode:'residual'});
}
for(const side of ['player','opponent'])configs.push({side,competing:true,gas:false},{side,competing:true,mode:'pivot'},{side,mode:'last-gas',secondGas:true},{side,mode:'gas-replace'},{side,ability:'Drought',competing:true,shield:'active',mode:'pivot'});
const sim=path.join(path.resolve(upstream),'dist/sim'),cases=configs.map((config,i)=>{
 const r=weatherProbe(config,sim,mutate),differences=[];
 if((r.candidate_turns[0].pre.field.weather||'none')!==r.reference_initial.weather)differences.push('initial weather');
 for(const key of Object.keys(r.reference))if(r.reference[key]!==r.candidate[key])differences.push(key);
 return {case_id:'WEATHER-GAS-'+String(i+1).padStart(3,'0'),status:differences.length?'failed':'passed_declared_scope',differences,...r};
});
const simultaneous=['player','opponent'].map(side=>simultaneousWeatherProbe(side,sim,mutate));
const receipt={schema_version:'weather-gas-reference-v1',started_at,executed_at:new Date().toISOString(),simulator_commit:commit,engine_sha256:hash(old||fs.readFileSync(path.join(root,'engine.js'))),reference:referenceIdentity(path.resolve(upstream)),scope:{format:'gen9championsdoublescustomgame',synthetic_teams:true,client_verified:false,regulation_id:null,client_version:null,baseline_engine_only:!!baseline},loaded_source_hashes:Object.fromEntries([...LOCAL_FILES,'tools/weather-gas-probes.mjs','tools/showdown-reference.mjs','tools/capture-weather-gas.mjs'].map(file=>[file,hash(file==='engine.js'&&old?old:fs.readFileSync(path.join(root,file)))])),cases,simultaneous};
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({cases:cases.length,passed:cases.filter(r=>!r.differences.length).length,failed:cases.filter(r=>r.differences.length).length,simultaneous:simultaneous.map(r=>JSON.stringify(r.reference)===JSON.stringify(r.candidate)),executed_at:receipt.executed_at}));
if(!baseline){assert(cases.every(r=>!r.differences.length));for(const r of simultaneous)assert.deepEqual(r.candidate,r.reference);}
