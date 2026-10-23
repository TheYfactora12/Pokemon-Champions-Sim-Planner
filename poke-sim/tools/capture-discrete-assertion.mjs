// Explicit local capture only. Independent originals are copied byte-for-byte.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {mapTeam} from './showdown-reference.mjs';
import {compiledIdentity,PIN} from './prepare-mc-reference-candidate.mjs';
import {canonical} from './regulation-watch-core.mjs';
import {digest,assessBoundedAssertion} from './bounded-assertions.mjs';
import {fileDependency,INDEX,DEPENDENCY_FILES,CORROBORATING_ROLES,readCorroboratingEvidence} from './bounded-register.mjs';

export function captureDiscrete(root,upstream,audit){
  assert.equal(execFileSync('git',['rev-parse','HEAD'],{cwd:upstream,encoding:'utf8'}).trim(),PIN);
  const fingerprint=digest(canonical(compiledIdentity(upstream)));
  const independent=JSON.parse(fs.readFileSync(path.join(audit,'focused-retest-evidence/candidate-check.json')));
  assert.equal(fingerprint,independent.compiled_fingerprint,'Reference must match independent compiled fingerprint');
  const auditReceipt=JSON.parse(fs.readFileSync(path.join(audit,'focused-receipt.json')));
  assert.equal(auditReceipt.head,'146ba91093ad9c0c3c3b7e675850e2e0f5f57475');
  const originals=Object.entries(CORROBORATING_ROLES).map(([role,spec])=>{
    const name=spec.audit_path||spec.name,bytes=fs.readFileSync(path.join(audit,name));
    return {role,path:name,sha256:digest(bytes),bytes};
  });
  readCorroboratingEvidence(originals,ref=>ref.bytes);
  const auditedRoot=path.join(audit,'retest-146ba91/poke-sim');
  const buckets=JSON.parse(fs.readFileSync(path.join(audit,'focused-retest-evidence/buckets.json')));
  assert.equal(buckets.cases,4096);assert.equal(Object.keys(buckets.counts).length,16);
  assert(Object.values(buckets.counts).every(n=>n===256));
  const report=fs.readFileSync(path.join(audit,'FOCUSED_RETEST_146BA91.md'),'utf8');
  assert(report.includes('[30,30,30,31,31,31,31,33,33,33,33,34,34,34,34,36]'));
  const scope={oracle_kind:'shared_reference',format:'gen9championsdoublescustomgame',regulation_id:null,client_version:null,
    boundaries:['Snorlax Tackle into Venusaur','level50 Hardy zero EVs','no crit','16 discrete RNG bucket midpoints','doubles custom format']};
  const identity={assertion_id:'DAMAGE-ROLL-DISCRETE-016.tackle-vector.v1',case_id:'DAMAGE-ROLL-DISCRETE-016',scope};
  const mon=(name,ability,moves)=>({name,ability,moves,item:'',nature:'Hardy',level:50,evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0}});
  const own={format:'champions',members:[mon('Snorlax','Immunity',['Tackle']),mon('Venusaur','Overgrow',['Protect']),mon('Blastoise','Torrent',['Protect']),mon('Dragonite','Inner Focus',['Protect']),mon('Garchomp','Sand Veil',['Protect']),mon('Raichu','Static',['Protect'])]};
  const foe=structuredClone(own);foe.members[0]=mon('Venusaur','Overgrow',['Protect']);
  const expected=[30,30,30,31,31,31,31,33,33,33,33,34,34,34,34,36];
  const dependency_files=DEPENDENCY_FILES;
  for(const file of [...dependency_files.engine,...dependency_files.data,...dependency_files.test]){
    assert.equal(digest(fs.readFileSync(path.join(auditedRoot,file))),auditReceipt.source_hashes['poke-sim/'+file],'Audited source byte mismatch: '+file);
  }
  const dependencies={...Object.fromEntries(Object.entries(dependency_files).map(([k,v])=>[k,fileDependency(['engine','data','test'].includes(k)?auditedRoot:root,v)])),reference:fingerprint};
  const files=new Map(),put=(name,value)=>{const bytes=Buffer.isBuffer(value)?value:Buffer.from(JSON.stringify(value,null,2)+'\n');files.set(name,bytes);return {path:name,sha256:digest(bytes)};};
  const contract=put('contract.json',{schema_version:'bounded-contract-v1',...identity,fields:expected.map((value,k)=>({field:`bucket_${k}_damage`,type:'number',unit:'hp',min:0,max:500,expected:value}))});
  const inputs=put('inputs.json',{schema_version:'bounded-inputs-v1',...identity,contract_sha256:contract.sha256,
    teams:[own,foe],actions:[{actor:'p1:slot0',move:'Tackle',target:'p2:slot0',method:'direct getDamage/calcDamage'}],
    seed:[3,7,11,13],initial_state:{selection:'team1234',weather:null,critical:false},
    rng_controls:{local_midpoints:expected.map((_,k)=>(k+.5)/16),reference_random_index:expected.map((_,k)=>15-k),critical:false}});
  const {Battle}=createRequire(import.meta.url)(path.join(upstream,'dist/sim'));
  const teams=[own,foe].map((t,i)=>mapTeam(t,'p'+(i+1),scope.format));
  const b=new Battle({formatid:scope.format,seed:[3,7,11,13],p1:{team:teams[0]},p2:{team:teams[1]}});
  assert.equal(b.dex.currentMod,'champions');b.choose('p1','team 1234');b.choose('p2','team 1234');b.randomChance=()=>false;
  const c=vm.createContext({console});
  for(const file of ['data.js','generated/pokemon_showdown_legal_data.js','generated/pokemon_showdown_species_weights.js','generated/champions_move_overrides.js','runtime_data.js','outcome_policy.js','engine.js'])vm.runInContext(fs.readFileSync(path.join(auditedRoot,file),'utf8'),c,{filename:file});
  vm.runInContext('this.Pokemon=Pokemon;this.Field=Field;',c);
  const a=new c.Pokemon(own.members[0],'','champions'),t=new c.Pokemon(foe.members[0],'','champions'),field=new c.Field();
  field._format='doubles';field._ctx.forceNoCrit=true;a.side=field.playerSide;t.side=field.oppSide;
  const local=[],reference=[];
  try{for(let k=0;k<16;k++){b.random=n=>{assert.equal(n,16);return 15-k;};const move=b.dex.getActiveMove('tackle');move.willCrit=false;
    reference.push(b.actions.getDamage(b.p1.active[0],b.p2.active[0],move));local.push(a.calcDamage('Tackle',t,field,null,()=>(k+.5)/16));}}finally{b.destroy();}
  const executed_at=new Date().toISOString();
  const receipt={schema_version:'champions-bounded-assertion-v1',...identity,dependencies,contract,inputs,executed_at};
  for(const [role,values]of [['local_result',local],['reference_result',reference]])receipt[role]=put(role+'.json',{schema_version:'bounded-result-v1',...identity,role,status:'complete',dependencies,executed_at,
    inputs_sha256:inputs.sha256,contract_sha256:contract.sha256,observations:Object.fromEntries(values.map((value,k)=>[`bucket_${k}_damage`,{pointer:`/observations/bucket_${k}_damage/value`,unit:'hp',value}]))});
  assert.equal(assessBoundedAssertion(receipt,{current:{scope,dependencies,contract_sha256:contract.sha256,inputs_sha256:inputs.sha256},read:name=>files.get(name)}).status,'passed_declared_scope');
  const independent_receipts=originals.map(({role,path:name,bytes})=>({...put('independent/'+path.basename(name),bytes),role}));
  const independent_sources=Object.fromEntries(['engine','data','test'].flatMap(role=>dependency_files[role]).map(file=>[file,put('independent/source/'+file,fs.readFileSync(path.join(auditedRoot,file)))]));
  const captureId=digest(canonical({dependencies,contract,inputs,independent_receipts,independent_sources,executed_at}));
  const base=`source/bounded-assertions/${captureId}/`;
  const prefix=ref=>({...ref,path:base+ref.path});
  for(const key of ['contract','inputs','local_result','reference_result'])receipt[key]=prefix(receipt[key]);
  put('receipt.json',receipt);
  const write=(name,bytes)=>{const file=path.join(root,name);fs.mkdirSync(path.dirname(file),{recursive:true});if(fs.existsSync(file))assert.deepEqual(fs.readFileSync(file),bytes,'Immutable receipt differs');else fs.writeFileSync(file,bytes);};
  for(const[name,bytes]of files)write(base+name,bytes);
  const entry={...identity,move_ids:['tackle'],executed_at,simulator_commit:auditReceipt.head,
    independent_target_commit:auditReceipt.head,reference_pin:PIN,reference_fingerprint:fingerprint,dependency_files,
    contract:receipt.contract,inputs:receipt.inputs,receipt:{path:base+'receipt.json',sha256:digest(files.get('receipt.json'))},independent_receipts:independent_receipts.map(prefix),
    independent_sources:Object.fromEntries(Object.entries(independent_sources).map(([file,ref])=>[file,prefix(ref)]))};
  const indexPath=path.join(root,INDEX),old=fs.existsSync(indexPath)?JSON.parse(fs.readFileSync(indexPath)): {schema_version:'bounded-assertion-index-v1',assertions:[]};
  const same=old.assertions.find(e=>e.receipt.sha256===entry.receipt.sha256);
  if(!same){old.assertions=old.assertions.filter(e=>e.assertion_id!==entry.assertion_id).concat(entry);fs.writeFileSync(indexPath,JSON.stringify(old,null,2)+'\n');}
  return entry;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const root=fileURLToPath(new URL('../',import.meta.url));
 if(process.argv.length!==4)throw Error('Usage: capture-discrete-assertion.mjs UPSTREAM AUDIT_DIRECTORY');
 console.log(JSON.stringify(captureDiscrete(root,path.resolve(process.argv[2]),path.resolve(process.argv[3])),null,2));
}
