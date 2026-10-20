import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import {loadLocalEngine,mapTeam,referenceIdentity} from '../tools/showdown-reference.mjs';
const require=createRequire(import.meta.url),{Battle}=require('pokemon-showdown'),reference=referenceIdentity();
const artifacts=new URL('../artifacts/switch-out-hooks/',import.meta.url);mkdirSync(artifacts,{recursive:true});
const format='gen9championsdoublescustomgame',seed=[3,7,11,13];
const m=(name,ability,moves,item='')=>({name,ability,moves,item,level:50,nature:'Hardy',evs:{hp:32,atk:0,def:0,spa:0,spd:0,spe:0}});
for(const swap of [false,true])for(const ability of ['Natural Cure','Regenerator'])for(const variant of ['normal','gas','gas-shield','gas-shield-consumed'])for(const status of ['burn','poison','toxic',''])test(`${ability} ${variant} ${status} swap${swap}`,()=>{
 const own={format:'champions',members:[m('Blissey',ability,['U-turn'],variant.startsWith('gas-shield')?'Ability Shield':''),m('Magikarp','Swift Swim',['Splash']),m('Pikachu','Static',['Splash']),m('Raichu','Static',['Splash'])]};
 const foe={format:'champions',members:[m('Snorlax','Immunity',['Splash']),m('Weezing',variant.startsWith('gas')?'Neutralizing Gas':'Levitate',['Splash']),m('Venusaur','Overgrow',['Splash']),m('Blastoise','Torrent',['Splash'])]};
 const teams=swap?[foe,own]:[own,foe],side=swap?'opponent':'player',rid=swap?'p2':'p1',other=swap?'p1':'p2';
 const b=new Battle({formatid:format,seed,strictChoices:true,p1:{team:mapTeam(teams[0],'p1',format)},p2:{team:mapTeam(teams[1],'p2',format)}});
 const loaded=loadLocalEngine(),ctx=loaded.context;let actor;
 const build=ctx.buildTeam;ctx.buildTeam=(...a)=>{const ms=build(...a);if(a[1]===side){actor=ms[0];actor.status=status||null;if(variant==='gas-shield-consumed')actor.itemConsumed=true;actor.toxicCounter=status==='toxic'?3:0;actor.hp=Math.floor(actor.maxHp/2);}return ms;};
 try{
  for(const id of ['p1','p2'])b.choose(id,'team 1234');const ra=b[rid].active[0];if(status)ra.setStatus({burn:'brn',poison:'psn',toxic:'tox'}[status]);if(variant==='gas-shield-consumed')ra.setItem('');ra.hp=Math.floor(ra.maxhp/2);
  b.choose(rid,'move 1 1, move 1');b.choose(other,'move 1, move 1');
  assert(b[rid].activeRequest?.forceSwitch?.[0],'successful pivot requests replacement');
  b.choose(rid,b[rid].activeRequest.forceSwitch.map(x=>x?'switch 3':'pass').join(', '));
  const forced=['player','opponent'].flatMap(s=>[0,1].map(slot=>({turn:1,side:s,slot,move:s===side&&slot===0?'U-turn':'Splash',targetSlot:0})));
  const r=ctx.simulateBattle(...teams,{format:'doubles',maxTurns:1,seed,forcedActions:forced});
  writeFileSync(new URL(`${ability.replace(' ','-')}-${variant}-${status}-${swap}.json`,artifacts),JSON.stringify({reference,hashes:loaded.hashes,teams,seed,local:r,reference_log:b.log},null,2));
  assert.notEqual(r.result,'error');assert(r.log.some(x=>x==='Blissey pivoted out!'));
  assert.equal(actor.hp,ra.hp,'switch-out healing');
  assert.equal(actor.status||'',({brn:'burn',psn:'poison',tox:'toxic'}[ra.status]||''),'switch-out status');
  if(ability==='Natural Cure'&&!ra.status){assert.equal(actor.toxicCounter,0);assert.equal(actor.sleepTurns,0);assert.equal(actor.frozenTurns,0);}
 }finally{b.destroy();}
});
