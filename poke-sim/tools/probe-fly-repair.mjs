// Guard-bypassed development repair probe. The production runtime continues to reject Fly.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {LOCAL_FILES,referenceIdentity} from './bounded-runtime-capture.mjs';
import {mapTeam} from './showdown-reference.mjs';
const require=createRequire(import.meta.url);
const root=fileURLToPath(new URL('../',import.meta.url));
const hash=s=>createHash('sha256').update(String(s).replace(/\r\n/g,'\n')).digest('hex');
export const moves=['Tackle','Gust','Twister','Sky Uppercut','Thunder','Hurricane','Smack Down','Thousand Arrows'];
export const candidatePatches=[
 ["if (_moveId(move) === 'fly') errors.push((member.name || 'Pokemon') + ': Fly simulation is not supported; this team cannot be simulated yet.');",'/* diagnostic only: team admission bypass */'],
 ["if (Array.isArray(opts.forcedActions) && opts.forcedActions.some(row => row && _moveId(row.move) === 'fly')) unsupported.push('Forced Fly simulation is not supported.');",'/* diagnostic only: forced admission bypass */'],

];
export function localContext(candidate=false,mutate=null){
 const c=vm.createContext({console});
 for(const file of LOCAL_FILES){let source=fs.readFileSync(path.join(root,file),'utf8');
  if(file==='engine.js'&&candidate)for(const [before,after]of candidatePatches){assert.equal(source.split(before).length,2,'unique diagnostic patch');source=source.replace(before,after);}
  if(file==='engine.js'&&mutate)source=mutate(source);
  vm.runInContext(source,c,{filename:file});
 }
 return c;
}
const mon=(name,ability,moves,item='')=>({name,ability,moves,item,level:50,nature:'Hardy',evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0}});
export function teams(move='Tackle',item='',ability='Rock Head'){
 return [{format:'champions',members:[mon('Aerodactyl',ability,['Fly','Protect'],item),mon('Venusaur','Overgrow',['Protect']),mon('Pikachu','Static',['Protect']),mon('Raichu','Static',['Protect'])]},
 {format:'champions',members:[mon('Blastoise','Torrent',[move,'Protect']),mon('Snorlax','Immunity',['Protect']),mon('Dragonite','Inner Focus',['Protect']),mon('Charizard','Blaze',['Protect'])]}];
}
export function probe({move='Tackle',item='',ability='Rock Head',turns=1,protectRelease=false,side='player'},referencePath){
 const own=teams(move,item,ability),inputs=side==='player'?own:[own[1],own[0]],rid=side==='player'?'p1':'p2';
 const {Battle}=require(referencePath||'pokemon-showdown');
 const b=new Battle({formatid:'gen9championsdoublescustomgame',seed:[3,7,11,13],strictChoices:true,p1:{team:mapTeam(inputs[0],'p1','gen9championsdoublescustomgame')},p2:{team:mapTeam(inputs[1],'p2','gen9championsdoublescustomgame')}});
 assert.equal(b.dex.currentMod,'champions');assert.equal(b.gameType,'doubles');
 b.choose('p1','team 1234');b.choose('p2','team 1234');
 b.randomizer=n=>n;b.randomChance=(n,d)=>n/d>.5;
 const actor=b[rid].active[0],target=b[rid==='p1'?'p2':'p1'].active[0];
 for(let turn=1;turn<=turns;turn++)for(const id of ['p1','p2'])b.choose(id,id===rid?(turn>1?'move 1, move 1':'move 1 1, move 1'):protectRelease&&turn===2?'move 2, move 1':['Twister','Thousand Arrows'].includes(move)?'move 1, move 1':'move 1 1, move 1');
 const reference={actor_hp_loss:actor.maxhp-actor.hp,target_hp_loss:target.maxhp-target.hp,charging:!!actor.volatiles.fly,pp_spent:actor.moveSlots[0].maxpp-actor.moveSlots[0].pp,item_consumed:!!item&&!actor.item};
 const referenceLog=[...b.log];b.destroy();
 const c=localContext(true),build=c.buildTeam;let a,t;
 c.buildTeam=function(...args){const mons=build(...args);if(args[1]===side)a=mons[0];else t=mons[0];return mons;};
 c.CRIT_STAGES.fill(0);c._sampleDamageRoll=()=>1;c._moveHits=()=>true;
 const actions=Array.from({length:turns},(_,i)=>i+1).flatMap(turn=>['player','opponent'].flatMap(s=>[0,1].map(slot=>({turn,side:s,slot,move:slot===1?'Protect':s===side?'Fly':protectRelease&&turn===2?'Protect':move,targetSlot:0}))));
 const result=c.simulateBattle(...inputs,{format:'doubles',maxTurns:turns,seed:[3,7,11,13],forcedActions:actions});
 assert.notEqual(result.result,'error',result.winCondition);
 const candidate={actor_hp_loss:a.maxHp-a.hp,target_hp_loss:t.maxHp-t.hp,charging:a.chargingMove==='Fly',pp_spent:a.movePP.Fly.max-a.movePP.Fly.current,item_consumed:!!a.itemConsumed};
 return {input:{move,item,ability,turns,protectRelease,side},teams:inputs,actions,reference,candidate,reference_log:referenceLog,candidate_log:result.log,agrees:JSON.stringify(reference)===JSON.stringify(candidate)};
}
export function assess(referencePath){
 return ['player','opponent'].flatMap(side=>[
  ...moves.map(move=>({move,side})),
  {side,turns:2},{side,turns:2,protectRelease:true},{side,item:'Power Herb'},
  {side,item:'Power Herb',ability:'Klutz'}
 ]).map((input,i)=>({case_id:`FLY-REPAIR-${String(i+1).padStart(3,'0')}`,...probe(input,referencePath)}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const upstream=process.argv[2]&&path.resolve(process.argv[2]),out=process.argv[3];assert(upstream&&out,'usage: node tools/probe-fly-repair.mjs UPSTREAM OUT');
 const identity=referenceIdentity(upstream),cases=assess(path.join(upstream,'dist/sim'));
 const receipt={schema_version:1,seed:[3,7,11,13],source_url:'https://github.com/smogon/pokemon-showdown/blob/9b136a8c8cdb860a8ab96fa063f906604e352547/data/moves.ts#L5897',executed_at:new Date().toISOString(),scope:{format:'gen9championsdoublescustomgame',synthetic_teams:true,client_verified:false,regulation_verified:false,production_fly_admitted:false},reference:identity,base_commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),loaded_source_hashes:Object.fromEntries([...LOCAL_FILES,'tools/showdown-reference.mjs','tools/bounded-runtime-capture.mjs','tools/probe-fly-repair.mjs'].map(file=>[file,hash(fs.readFileSync(path.join(root,file)))])),engine_sha256:hash(fs.readFileSync(path.join(root,'engine.js'))),probe_sha256:hash(fs.readFileSync(fileURLToPath(import.meta.url))),candidate_patches:candidatePatches,rng_controls:'maximum damage, no critical hits, accuracy forced successful; reference randomChance true only above 50%',cases};
 fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify({cases:cases.length,candidate_agreements:cases.filter(c=>c.agrees).length,candidate_disagreements:cases.filter(c=>!c.agrees).map(c=>c.case_id),production_fly_admitted:false}));
}
