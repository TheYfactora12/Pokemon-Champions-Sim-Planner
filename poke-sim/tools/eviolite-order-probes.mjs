// Synthetic pinned-reference damage probes; not legality or client certification.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {localContext} from './probe-fly-repair.mjs';
import {mapTeam} from './showdown-reference.mjs';
const require=createRequire(import.meta.url);
const mon=(name,ability,moves)=>({name,ability,moves,item:'',nature:'Hardy',level:50,evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0}});
export function validDamageVector(values){
 assert(Array.isArray(values)&&values.length===16&&Array.from(values).every(n=>Number.isSafeInteger(n)&&n>=0),'Invalid numerical damage oracle');
}
export function evioliteDamageProbe(input={},mutate){
 const defaults={move:'U-turn',weather:'snow',target:'Abomasnow',attacker:'Weezing',def:95,stage:0,side:'player',format:'doubles',suppressor:'Immunity',crit:false,item:'',types:null,gas:false,shield:'none',stat:'def'};
 assert(Object.keys(input).every(k=>Object.hasOwn(defaults,k)),'unsupported probe field');
 const x={...defaults,...input};
 assert(['def','spd'].includes(x.stat),'Unsupported defensive stat');
 assert.equal(x.format,'doubles','Snow probe supports doubles only');
 assert(Number.isInteger(x.def)&&x.def>=31&&x.def<=255,'Unsupported synthetic Defense domain: 31..255');
 assert(Number.isInteger(x.stage)&&x.stage>=-6&&x.stage<=6,'Unsupported Defense stage');
 assert(['player','opponent'].includes(x.side)&&['none','snow','sun','rain','sand'].includes(x.weather),'Unsupported side/weather');
 assert(typeof x.crit==='boolean'&&typeof x.gas==='boolean'&&['none','active','consumed'].includes(x.shield),'Unsupported effect controls');
 const own={format:'champions',members:[mon(x.attacker,'Pressure',[x.move]),mon('Snorlax',x.suppressor,['Splash']),mon('Pikachu','Static',['Splash']),mon('Raichu','Static',['Splash'])]};
 const foe={format:'champions',members:[mon(x.target,'Pressure',['Splash']),mon('Snorlax','Immunity',['Splash']),mon('Pikachu','Static',['Splash']),mon('Raichu','Static',['Splash'])]};
 foe.members[0].item=x.item;
 if(x.gas)own.members[0].ability='Neutralizing Gas';
 if(x.shield==='active')own.members[1].item='Ability Shield';
 const teams=x.side==='player'?[own,foe]:[foe,own],rid=x.side==='player'?'p1':'p2',oid=rid==='p1'?'p2':'p1';
 const formatid=x.format==='doubles'?'gen9championsdoublescustomgame':'gen9championscustomgame';
 const {Battle}=require(process.env.CHAMPIONS_REFERENCE_SIM||'pokemon-showdown');
 const b=new Battle({formatid,seed:[3,7,11,13],p1:{team:mapTeam(teams[0],'p1',formatid)},p2:{team:mapTeam(teams[1],'p2',formatid)}});
 b.choose('p1','team 1234');b.choose('p2','team 1234');
 const ra=b[rid].active[0],rt=b[oid].active[0];rt.storedStats[x.stat]=x.def;rt.boosts[x.stat]=x.stage;
 if(x.types)rt.setType(x.types);
 if(x.weather!=='none')b.field.setWeather({snow:'snowscape',sun:'sunnyday',rain:'raindance',sand:'sandstorm'}[x.weather],rt);
 const c=localContext(false,mutate);vm.runInContext('this.Pokemon=Pokemon;this.Field=Field;',c);
 const a=new c.Pokemon(own.members[0],'','champions'),t=new c.Pokemon(foe.members[0],'','champions'),f=new c.Field();
 a.side=x.side==='player'?f.playerSide:f.oppSide;t.side=x.side==='player'?f.oppSide:f.playerSide;
 a.side.activeMons=[a,new c.Pokemon(own.members[1],'','champions')];t.side.activeMons=[t];a.side.activeMons[1].side=a.side;
 if(x.shield==='consumed'){a.side.activeMons[1].item='Ability Shield';a.side.activeMons[1].itemConsumed=true;}
 f._format=x.format;f.weather=x.weather;f._ctx.forceNoCrit=!x.crit;f._ctx.forceCrit=x.crit;t[x.stat==='def'?'baseDef':'baseSpd']=x.def;t.statBoosts[x.stat]=x.stage;
 if(x.types)t.types=x.types;
 const reference=[],candidate=[];
 for(let k=0;k<16;k++){
  b.randomizer=n=>Math.floor(n*(85+k)/100);
  const move=b.dex.getActiveMove(x.move);move.willCrit=x.crit;
  reference.push(b.actions.getDamage(ra,rt,move));
  candidate.push(a.calcDamage(x.move,t,f,null,()=>(k+.5)/16));
 }
 const referenceStat=rt.getStat(x.stat),candidateStat=t.getStat(x.stat,f);
 const referenceLog=[...b.log];b.destroy();
 validDamageVector(reference);validDamageVector(candidate);
 return {input:x,teams,reference,candidate,reference_stat:referenceStat,candidate_stat:candidateStat,reference_log:referenceLog};
}
