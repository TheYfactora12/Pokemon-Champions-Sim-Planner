// Synthetic doubles mechanics probes; no regulation or client approval.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {localContext} from './probe-fly-repair.mjs';
import {mapTeam} from './showdown-reference.mjs';
const require=createRequire(import.meta.url);
export const format='gen9championsdoublescustomgame',seed=[3,7,11,13];
export const weatherAbilities={'Drizzle':['Pelipper','rain'],'Drought':['Torkoal','sun'],'Sand Stream':['Tyranitar','sand'],'Snow Warning':['Abomasnow','snow']};
const weatherMap={raindance:'rain',sunnyday:'sun',sandstorm:'sand',snowscape:'snow','':'none'};
const mon=(name,ability,moves=['Splash'],item='')=>({name,ability,moves,item,level:50,nature:'Hardy',evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0}});
export function weatherProbe(input={},referencePath=process.env.CHAMPIONS_REFERENCE_SIM,mutate){
 const x={side:'player',ability:'Drizzle',shield:'none',mode:'entry',gas:true,secondGas:false,competing:false,pivotTarget:'partner',...input};
 assert(Object.keys(input).every(k=>['side','ability','shield','mode','gas','secondGas','competing','pivotTarget'].includes(k)),'unsupported weather probe input');
 assert(['partner','setter'].includes(x.pivotTarget));
 assert(['player','opponent'].includes(x.side)&&weatherAbilities[x.ability]);
 assert(['none','active','consumed'].includes(x.shield)&&['entry','pivot','faint','reentry','last-gas','gas-replace','residual'].includes(x.mode));
 assert([x.gas,x.secondGas,x.competing].every(v=>typeof v==='boolean'));
 const own={format:'champions',members:[mon('Archaludon','Stamina',['Electro Shot','Splash']),mon('Weezing',x.gas?'Neutralizing Gas':'Levitate',['U-turn','Splash']),mon('Magikarp','Swift Swim'),mon('Raichu','Static')]};
 assert(x.mode!=='last-gas'||x.secondGas,'last Gas probe requires two Gas users');
 if(x.mode==='gas-replace')own.members[2].ability='Neutralizing Gas';
 const competing=x.ability==='Drizzle'?'Drought':'Drizzle';
 const foe={format:'champions',members:[mon(weatherAbilities[x.ability][0],x.ability,['Splash','Psychic'],x.shield==='active'?'Ability Shield':''),mon(x.secondGas?'Weezing':x.competing?weatherAbilities[competing][0]:'Snorlax',x.secondGas?'Neutralizing Gas':x.competing?competing:'Immunity',x.secondGas?['U-turn','Splash']:['Splash']),mon('Pikachu','Static'),mon('Venusaur','Overgrow')]};
 // Consumed Shield enters absent on the reference and retained-but-consumed locally.
 const inputs=x.side==='player'?[own,foe]:[foe,own],rid=x.side==='player'?'p1':'p2',oid=rid==='p1'?'p2':'p1';
 const {Battle}=require(referencePath||'pokemon-showdown');
 const b=new Battle({formatid:format,seed,strictChoices:true,p1:{team:mapTeam(inputs[0],'p1',format)},p2:{team:mapTeam(inputs[1],'p2',format)}});
 assert.equal(b.dex.currentMod,'champions');assert.equal(b.gameType,'doubles');
 b.choose('p1','team 1234');b.choose('p2','team 1234');
 const ra=b[rid].active[0],rg=b[rid].active[1],rw=b[oid].active[0];
 if(x.mode==='faint'){rg.hp=1;rw.storedStats.spe=999;}
 if(x.mode==='residual'){rg.hp=1;rg.setStatus('brn');}
 b.randomizer=n=>n;b.randomChance=(n,d)=>n/d>.5;
 const turns=['reentry','last-gas'].includes(x.mode)?3:['pivot','gas-replace'].includes(x.mode)?2:1,referenceTurns=[],commands=[];
 const snapshot=()=>({weather:weatherMap[b.field.weather],weather_turns:b.field.weatherState.duration||0,stage:ra.boosts.spa,charging:!!ra.volatiles.twoturnmove,pp:ra.moveSlots[0].maxpp-ra.moveSlots[0].pp,gas_active:b[rid].active.includes(rg)&&rg.hp>0,weather_hp:rw.hp});
 const referenceInitial=snapshot();
 for(let turn=1;turn<=turns;turn++){
  const pivot=['pivot','reentry','last-gas','gas-replace'].includes(x.mode)&&turn===1;
  const back=x.mode==='reentry'&&turn===3;
  const fire=turn===turns;
  const ownChoice=(fire?'move 1 1':'move 2')+', '+(back?'switch '+(b[rid].pokemon.indexOf(rg)+1):pivot?'move 1 '+(x.pivotTarget==='setter'?1:2):rg===b[rid].active[1]?'move 2':'move 1');
  const otherGas=b[oid].active[1].ability==='neutralizinggas';
  for(const id of ['p1','p2']){const choice=id===rid?ownChoice:(x.mode==='faint'?'move 2 2':'move 1')+', '+(x.mode==='last-gas'&&turn===2?'move 1 1':otherGas?'move 2':'move 1');commands.push({turn,side:id,choice});b.choose(id,choice);}
  if(turn<turns&&b[rid].activeRequest?.forceSwitch?.some(Boolean)){
   const replacement=b[rid].pokemon.findIndex(p=>p.species.name==='Magikarp')+1;
   const choice=b[rid].activeRequest.forceSwitch.map(v=>v?'switch '+replacement:'pass').join(', ');
   commands.push({turn,side:rid,choice});b.choose(rid,choice);
  }
  if(turn<turns&&b[oid].activeRequest?.forceSwitch?.some(Boolean)){
   const replacement=b[oid].pokemon.findIndex(p=>p.species.name==='Pikachu')+1;
   const choice=b[oid].activeRequest.forceSwitch.map(v=>v?'switch '+replacement:'pass').join(', ');
   commands.push({turn,side:oid,choice});b.choose(oid,choice);
  }
  referenceTurns.push(snapshot());
 }
 const referenceLog=[...b.log];b.destroy();
 const c=localContext(false,mutate),build=c.buildTeam;let actor,gas,weather,localMons;
 c.buildTeam=(...args)=>{const ms=build(...args);if(args[1]===x.side){localMons=ms;actor=ms[0];gas=ms[1];if(['faint','residual'].includes(x.mode))gas.hp=1;if(x.mode==='residual')gas.status='burn';}else{weather=ms[0];if(x.shield==='consumed'){weather.item='Ability Shield';weather.itemConsumed=true;}if(x.mode==='faint')weather.baseSpe=999;}return ms;};
 c.CRIT_STAGES.fill(0);c._sampleDamageRoll=()=>1;c._moveHits=()=>true;c.makePRNG=()=>()=>.99;
 const actions=[];
 for(let turn=1;turn<=turns;turn++)for(const side of ['player','opponent'])for(const slot of [0,1]){
  if(x.mode==='reentry'&&turn===3&&side===x.side&&slot===1)continue;
  actions.push({turn,side,slot,move:side===x.side?(slot===0?(turn===turns?'Electro Shot':'Splash'):(turn===1&&['pivot','reentry','last-gas','gas-replace'].includes(x.mode)?'U-turn':'Splash')):(slot===0&&x.mode==='faint'?'Psychic':slot===1&&x.mode==='last-gas'&&turn===2?'U-turn':'Splash'),targetSlot:side===x.side&&slot===1&&turn===1?(x.pivotTarget==='setter'?0:1):side!==x.side&&x.mode==='faint'?1:0});
 }
 // Re-entry is a development-only single scripted switch. No production allowlist is widened.
 const scripted=x.mode==='reentry'?[{turn:3,side:x.side,actorId:`${x.side}:2`,replacementId:`${x.side}:1`}]:null;
 if(scripted)c.ScriptedSwitchDiagnostic={checkOptions(opts){assert.deepEqual(opts.scriptedSwitches,scripted);},prepare(opts,turn,active,bench){if(turn!==3)return null;const a=active[x.side].find(m=>m.name==='Magikarp'),r=bench[x.side].find(m=>m===gas);assert(a&&r);return{actor:a,replacement:r,side:x.side,slot:active[x.side].indexOf(a)};},checkActions(){}};
 const result=c.simulateBattle(...inputs,{format:'doubles',maxTurns:turns,seed,forcedActions:actions,...(scripted?{scriptedSwitches:scripted}:{})});
 assert.notEqual(result.result,'error',result.winCondition);
 const field=actor.side===null?null:result.turnLog.at(-1).post.field;
 const candidate={weather:field.weather||'none',weather_turns:field.weather_turns,stage:actor.statBoosts.spa,charging:actor.chargingMove==='Electro Shot',pp:actor.movePP['Electro Shot'].max-actor.movePP['Electro Shot'].current,gas_active:gas.alive&&gas.side.activeMons.includes(gas),weather_hp:weather.hp};
 return {input:x,teams:inputs,commands,actions,reference_initial:referenceInitial,reference_turns:referenceTurns,reference:referenceTurns.at(-1),candidate,reference_log:referenceLog,candidate_log:result.log,candidate_turns:result.turnLog};
}

// Independent review counterexample: two actual spread KOs share one last-Gas transition.
export function simultaneousWeatherProbe(side='player',referencePath=process.env.CHAMPIONS_REFERENCE_SIM,mutate){
 assert(['player','opponent'].includes(side));
 const own={format:'champions',members:[mon('Tyranitar','Sand Stream',['Earthquake']),mon('Weezing','Neutralizing Gas'),mon('Pikachu','Static'),mon('Raichu','Static')]};
 const foe={format:'champions',members:[mon('Pelipper','Drizzle'),mon('Weezing','Neutralizing Gas'),mon('Pikachu','Static'),mon('Raichu','Static')]};
 const inputs=side==='player'?[own,foe]:[foe,own],rid=side==='player'?'p1':'p2';
 const {Battle}=require(referencePath||'pokemon-showdown');
 const b=new Battle({formatid:format,seed,strictChoices:true,p1:{team:mapTeam(inputs[0],'p1',format)},p2:{team:mapTeam(inputs[1],'p2',format)}});
 b.choose('p1','team 1234');b.choose('p2','team 1234');b.p1.active[1].hp=1;b.p2.active[1].hp=1;
 b.randomizer=n=>n;b.randomChance=(n,d)=>n/d>.5;
 b.choose('p1','move 1, move 1');b.choose('p2','move 1, move 1');
 const referenceLog=[...b.log],reference=referenceLog.filter(l=>l.startsWith('|-weather|')&&!l.includes('[upkeep]')).map(l=>weatherMap[l.split('|')[2].toLowerCase()]);
 assert(referenceLog.includes('|faint|p1b: p1m2')&&referenceLog.includes('|faint|p2b: p2m2'),'two real Gas KOs');b.destroy();
 const c=localContext(false,mutate),build=c.buildTeam;c.buildTeam=(...args)=>{const ms=build(...args);ms[1].hp=1;return ms;};
 c.CRIT_STAGES.fill(0);c._sampleDamageRoll=()=>1;c._moveHits=()=>true;c.makePRNG=()=>()=>.99;
 const actions=['player','opponent'].flatMap(s=>[0,1].map(slot=>({turn:1,side:s,slot,move:s===side&&slot===0?'Earthquake':'Splash',targetSlot:0})));
 const r=c.simulateBattle(...inputs,{format:'doubles',maxTurns:1,seed,forcedActions:actions});assert.notEqual(r.result,'error');
 const candidate=Array.from(r.log).filter(l=>l.includes(' summoned ')).map(l=>l.includes('Drizzle')?'rain':'sand');
 return {side,teams:inputs,actions,reference,candidate,reference_log:referenceLog,candidate_log:r.log};
}
