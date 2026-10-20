// Capture adapter only: consumes explicit serialized inputs and never enrolls itself.
import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import assert from 'node:assert/strict';
import {createRequire} from 'node:module';import {execFileSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {mapTeam} from './showdown-reference.mjs';
import {canonical} from './regulation-watch-core.mjs';import {compiledIdentity} from './prepare-mc-reference-candidate.mjs';
import {digest,assessBoundedAssertion} from './bounded-assertions.mjs';
import {CURRENT_DEPENDENCY_FILES,currentDependencies} from './current-bounded-core.mjs';
import {caseCatalog,CURRENT_REFERENCE_PIN,CURRENT_REFERENCE_FINGERPRINT} from '../tests/fixtures/bounded_runtime_cases.mjs';
export {caseCatalog};
export const LOCAL_FILES=['data.js','generated/pokemon_showdown_legal_data.js','generated/pokemon_showdown_species_weights.js','generated/champions_move_overrides.js','generated/champions_move_pools.js','runtime_data.js','move_legality.js','generated/mc_review_reference.js','mc_review.js','legality.js','rulesets.js','outcome_policy.js','engine.js'];
export function referenceIdentity(upstream){
 const sourcePaths=['sim','data','config'].flatMap(dir=>fs.readdirSync(path.join(upstream,dir),{recursive:true,withFileTypes:true}).filter(row=>row.isFile()).map(row=>path.relative(upstream,path.join(row.parentPath||row.path,row.name)).replaceAll('\\','/'))).concat(['package-lock.json','tools/build-utils.js']).sort();
 const sourceHashes=Object.fromEntries(sourcePaths.map(file=>[file,digest(fs.readFileSync(path.join(upstream,file),'utf8').replace(/\r\n/g,'\n'))]));
 const sourceFingerprint=digest(JSON.stringify(sourceHashes));assert.equal(sourceFingerprint,'6ee47d5009706b808a9d079aab9b1a2fa0493edb98b4dd7feee189679d3951a8','audited raw source fingerprint');
 const compiled=compiledIdentity(upstream),fingerprint=digest(canonical(compiled));assert.equal(fingerprint,CURRENT_REFERENCE_FINGERPRINT);
 return {source_attribution_commit:CURRENT_REFERENCE_PIN,compiled_fingerprint:fingerprint,compiled,source_fingerprint:sourceFingerprint,source_hashes:sourceHashes};
}
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
function validateInput(input){
 // Observers below intentionally address fixed slots. Reject unsupported mapping
 // before either runtime loads, rather than letting shared assumptions agree.
 const supported=caseCatalog().find(row=>row.kind===input?.kind);
 assert(supported,'Unsupported bounded input: kind');
 const allowed=['schema_version','assertion_id','case_id','contract_sha256','kind','teams','actions','seed','initial_state','rng_controls','scope','expected'];
 assert(Object.keys(input).every(key=>allowed.includes(key)),'Unsupported bounded input: extra field');
 const versionPrefix=supported.case_id+'.current-runtime.v';
 assert(typeof input.assertion_id==='string'&&input.assertion_id.startsWith(versionPrefix)&&/^[1-9][0-9]*$/.test(input.assertion_id.slice(versionPrefix.length)),'Unsupported bounded input: assertion_id');
 for(const key of ['case_id','scope','teams','actions','seed','rng_controls'])
  assert.deepEqual(input[key],supported[key],'Unsupported bounded input: '+key);
 const initial=structuredClone(supported.initial_state);
 // This existing sensitivity control is executed by both initializers, not
 // reconstructed: allow only the declared White Herb SpA stage value to vary.
 if(input.kind==='whiteherb'){
  const spa=input.initial_state?.player_slot0_stages?.spa;
  assert(Number.isInteger(spa)&&spa>=-6&&spa<=6,'Unsupported bounded input: initial_state spa');
  initial.player_slot0_stages.spa=spa;
 }
 assert.deepEqual(input.initial_state,initial,'Unsupported bounded input: initial_state');
 if(input.schema_version!==undefined)assert.equal(input.schema_version,'bounded-inputs-v1','Unsupported bounded input: schema_version');
}

function initialize(input,actor,reference){
 const st=input.initial_state;
 if(st.player_slot0_hp_missing)actor.hp-=st.player_slot0_hp_missing;
 for(const [move,pp]of Object.entries(st.player_slot0_pp||{}))if(reference)actor.moveSlots.find(m=>m.id===norm(move)).pp=pp;else actor.movePP[move].current=pp;
 for(const [stat,value]of Object.entries(st.player_slot0_stages||{}))(reference?actor.boosts:actor.statBoosts)[stat]=value;
}
function observations(input,actor,target,active,move,reference){
 const hp=reference?'maxhp':'maxHp',stage=reference?actor.boosts:actor.statBoosts;
 const spent=name=>reference?actor.moveSlots.find(m=>m.id===norm(name)).maxpp-actor.moveSlots.find(m=>m.id===norm(name)).pp:actor.movePP[name].max-actor.movePP[name].current;
 switch(input.kind){
 case 'struggle':return {target_hp_loss:target[hp]-target.hp,user_hp_loss:actor[hp]-actor.hp,amnesia_pp_spent:(input.initial_state.player_slot0_pp.Amnesia-(reference?actor.moveSlots[0].pp:actor.movePP.Amnesia.current))};
 case 'rest':return {hp_restored:actor.hp-(actor[hp]-input.initial_state.player_slot0_hp_missing),asleep:reference?actor.status==='slp':actor.status==='sleep',rest_pp_spent:spent('Rest')};
 case 'encore':{const pp=name=>reference?target.moveSlots.find(m=>m.id===norm(name)).maxpp-target.moveSlots.find(m=>m.id===norm(name)).pp:target.movePP[name].max-target.movePP[name].current;return {executed_move:move,willowisp_pp_spent:pp('Will-O-Wisp'),flamethrower_pp_spent:pp('Flamethrower'),lock_move:reference?target.volatiles.encore?.move||'none':norm(target.encoredMove||'none')};}
 case 'redcard':return {target_hp_loss:target[hp]-target.hp,item_consumed:reference?target.item==='':!!target.itemConsumed,attacker_active:active.includes(actor),replacement:reference?active[0].species.name:active[0].name};
 case 'whiteherb':return {attack_stage:stage.atk,defense_stage:stage.def,special_attack_stage:stage.spa,item_consumed:reference?actor.item==='':!!actor.itemConsumed};
 }
 throw Error('Unknown capture kind');
}
export function executeLocal(root,input){
 validateInput(input);
 const c=vm.createContext({console});for(const file of LOCAL_FILES)vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file});
 vm.runInContext('this.Pokemon=Pokemon;this.Field=Field;',c);
 if(input.kind==='discrete'){
  const a=new c.Pokemon(input.teams[0].members[0],'','champions'),t=new c.Pokemon(input.teams[1].members[0],'','champions'),f=new c.Field();f._format='doubles';f._ctx.forceNoCrit=true;a.side=f.playerSide;t.side=f.oppSide;
  return {observations:Object.fromEntries(input.rng_controls.local_draws.map((draw,k)=>['damage_bucket_'+k,a.calcDamage(input.actions[k].move,t,f,null,()=>draw)])),raw:{calculation:'Pokemon.calcDamage',draws:input.rng_controls.local_draws}};
 }
 c._moveHits=()=>true;c._sampleDamageRoll=()=>1;c.CRIT_STAGES.fill(0);
 if(input.initial_state.struggle_target_slot!==undefined)c._chooseStruggleTarget=enemies=>enemies[input.initial_state.struggle_target_slot];
 const build=c.buildTeam;let actor,target;c.buildTeam=function(...args){const mons=build(...args);if(args[1]==='player'){actor=mons[0];initialize(input,actor,false);}else target=mons[0];return mons;};
 const result=c.simulateBattle(...input.teams,{format:'doubles',seed:input.seed,maxTurns:Math.max(...input.actions.map(a=>a.turn)),forcedActions:input.actions.filter(a=>a.move!=='Struggle')});assert.notEqual(result.result,'error',result.winCondition);
 const move=input.kind==='encore'?result.turnLog[1].events.find(e=>e.actor==='Arcanine'&&e.move)?.move:null;
 return {observations:observations(input,actor,target,actor.side.activeMons,move,false),raw:{log:result.log,turnLog:result.turnLog}};
}
export function executeReference(upstream,input){
 validateInput(input);
 const {Battle}=createRequire(import.meta.url)(path.join(upstream,'dist/sim'));
 const b=new Battle({formatid:input.scope.format,seed:input.seed,strictChoices:true,p1:{team:mapTeam(input.teams[0],'p1',input.scope.format)},p2:{team:mapTeam(input.teams[1],'p2',input.scope.format)}});
 try{
  assert.equal(b.dex.currentMod,'champions');assert.equal(b.format.mod,'champions');assert.equal(b.gameType,'doubles');
  initialize(input,b.p1.pokemon[0],true);
  for(const side of ['p1','p2'])b.choose(side,'team '+b[side].pokemon.map((_,i)=>i+1).join(''));
  const actor=b.p1.active[0],target=b.p2.active[0];
  if(input.kind==='discrete'){
   b.randomChance=()=>false;
   const values=input.rng_controls.reference_random16.map((draw,k)=>{b.random=n=>{assert.equal(n,16);return draw;};const move=b.dex.getActiveMove(input.actions[k].move);move.willCrit=false;return ['damage_bucket_'+k,b.actions.getDamage(actor,target,move)];});
   return {observations:Object.fromEntries(values),raw:{log:b.log,calculation:'BattleActions.getDamage',draws:input.rng_controls.reference_random16,mod:b.dex.currentMod,format_mod:b.format.mod}};
  }
  b.randomizer=n=>n;b.randomChance=(n,d)=>n>=d||n/d>.5;
  if(input.initial_state.struggle_target_slot!==undefined){const old=b.getRandomTarget.bind(b);b.getRandomTarget=(pokemon,move)=>(typeof move==='string'?move:move.id)==='struggle'?b.p2.active[input.initial_state.struggle_target_slot]:old(pokemon,move);}
  b.makeRequest('move');
  for(let turn=1;turn<=Math.max(...input.actions.map(a=>a.turn));turn++)for(const side of ['player','opponent']){
   const id=side==='player'?'p1':'p2';const commands=input.actions.filter(a=>a.turn===turn&&a.side===side).sort((a,b)=>a.slot-b.slot).map(a=>{
    if(a.move==='Struggle')return 'move struggle';
    const move=b.dex.moves.get(a.move),slot=b[id].active[a.slot].moveSlots.findIndex(m=>m.id===move.id)+1;
    return 'move '+slot+(['normal','adjacentFoe','any'].includes(move.target)?' '+(a.targetSlot+1):'');
   });b.choose(id,commands.join(', '));
  }
  assert(!b.log.some(l=>l.startsWith('|error|')),JSON.stringify(b.log));
  const last=b.log.slice(b.log.lastIndexOf('|turn|2'));const move=last.find(l=>l.startsWith('|move|p2a:'))?.split('|')[3];
  return {observations:observations(input,actor,target,b.p1.active,move,true),raw:{log:b.log,mod:b.dex.currentMod,format_mod:b.format.mod}};
 }finally{b.destroy();}
}
export function captureCurrent(root,upstream,{prefix='reports/bounded-current',catalog=caseCatalog()}={}){
 const runtimeSourceCommit='fd3d00a9c8f1c7e6d0eb95019bea5a93ecb35bc9';
 const runtimeGitHashes=Object.fromEntries(LOCAL_FILES.map(file=>{
  const current=fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n');
  const retained=execFileSync('git',['show',runtimeSourceCommit+':poke-sim/'+file],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024}).replace(/\r\n/g,'\n');
  assert.equal(digest(current),digest(retained),'runtime differs from capture baseline: '+file);return [file,digest(retained)];
 }));
 const identity=referenceIdentity(upstream),dependencies=currentDependencies(root,identity.compiled_fingerprint),executed_at=new Date().toISOString();
 const sourceHashes=Object.fromEntries([...new Set(Object.values(CURRENT_DEPENDENCY_FILES).flat())].map(f=>[f,digest(fs.readFileSync(path.join(root,f)))]));
 const files=new Map(),put=(name,value)=>{const bytes=Buffer.from(JSON.stringify(value,null,2)+'\n');files.set(name,bytes);return {path:name,sha256:digest(bytes)};};
 const entries=[];
 for(const spec of catalog){
  const dir=prefix+'/'+spec.case_id,common={assertion_id:spec.assertion_id,case_id:spec.case_id,scope:spec.scope};
  const fields=Object.entries(spec.expected).map(([field,expected])=>({field,type:typeof expected,unit:field.includes('hp')||field.startsWith('damage_')?'HP':field.includes('pp')?'PP':field.includes('stage')?'stage':'value',expected}));
  const contract=put(dir+'/contract.json',{schema_version:'bounded-contract-v1',...common,fields});
  const input={schema_version:'bounded-inputs-v1',...common,contract_sha256:contract.sha256,kind:spec.kind,teams:spec.teams,actions:spec.actions,seed:spec.seed,initial_state:spec.initial_state,rng_controls:spec.rng_controls};
  const inputs=put(dir+'/inputs.json',input),executions={local_result:executeLocal(root,structuredClone(input)),reference_result:executeReference(upstream,structuredClone(input))},results={};
  for(const [role,result]of Object.entries(executions))results[role]=put(dir+'/'+role+'.json',{schema_version:'bounded-result-v1',...common,role,status:'complete',inputs_sha256:inputs.sha256,contract_sha256:contract.sha256,dependencies,executed_at,observations:Object.fromEntries(fields.map(f=>[f.field,{pointer:'/observations/'+f.field+'/value',unit:f.unit,value:result.observations[f.field]}]))});
  const raw=put(dir+'/raw.json',executions),receiptValue={schema_version:'champions-bounded-assertion-v1',...common,executed_at,dependencies,contract,inputs,...results};
  const assessment=assessBoundedAssertion(receiptValue,{read:name=>files.get(name),current:{scope:spec.scope,contract_sha256:contract.sha256,inputs_sha256:inputs.sha256,dependencies}});
  assert.equal(assessment.status,'passed_declared_scope',JSON.stringify({case_id:spec.case_id,assessment,executions}));
  const receipt=put(dir+'/receipt.json',receiptValue);
  entries.push({...common,executed_at,enrollment_kind:'current-capture-v1',receipt,contract,inputs,...results,raw,dependency_files:CURRENT_DEPENDENCY_FILES,reference_fingerprint:identity.compiled_fingerprint,metadata:{runtime_source_commit:runtimeSourceCommit},move_ids:[...new Set(input.actions.map(a=>norm(a.move)))].sort(),item_ids:[...new Set(input.teams.flatMap(t=>t.members.map(m=>norm(m.item))).filter(Boolean))].sort()});
 }
 assert.deepEqual(currentDependencies(root,identity.compiled_fingerprint),dependencies,'Dependencies changed during capture');
 const provenance=put(prefix+'/provenance.json',{executed_at,dependencies,runtime_source_commit:runtimeSourceCommit,runtime_git_blob_lf_sha256:runtimeGitHashes,source_hashes:sourceHashes,reference:identity});
 return {entries,files,provenance};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [root,upstream,out]=process.argv.slice(2);assert(root&&upstream&&out,'usage: node tools/bounded-runtime-capture.mjs ROOT UPSTREAM OUTPUT_DIRECTORY');
 const capture=captureCurrent(path.resolve(root),path.resolve(upstream));for(const [name,bytes]of capture.files){const file=path.join(out,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);}fs.writeFileSync(path.join(out,'capture-index.json'),JSON.stringify({entries:capture.entries,provenance:capture.provenance},null,2)+'\n');console.log('Captured '+capture.entries.length+' bounded cases');
}
