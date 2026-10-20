import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {loadLocalEngine,mapTeam} from '../tools/showdown-reference.mjs';
const {Battle}=createRequire(import.meta.url)(process.env.CHAMPIONS_REFERENCE_SIM || 'pokemon-showdown');
const format='gen9championsdoublescustomgame',seed=[3,7,11,13];
const mon=(name,ability,moves,item='')=>({name,ability,moves,item,nature:'Hardy',level:50,evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0}});
// Full-six entry reproduction plus explicitly synthetic state/ability boundary probes.
for(const side of ['player','opponent'])for(const slot of [0,1])for(const variant of
 ['intimidate','no-drop','contrary','defiant','klutz','klutz-gas','consumed','multi','positive','cap','fainted','close-combat'])test(`White Herb ${side}/${slot}/${variant}`,()=>{
 const ability=variant==='contrary'?'Contrary':variant==='defiant'?'Defiant':variant.startsWith('klutz')?'Klutz':'Guts';
 const own={format:'champions',members:[mon('Pelipper','Drizzle',['Protect']),mon('Machamp',ability,['Protect','Close Combat'],'White Herb'),mon('Garchomp','Rough Skin',['Protect']),mon('Venusaur','Overgrow',['Protect']),mon('Raichu','Static',['Protect']),mon('Talonflame','Gale Wings',['Protect'])]};
 if(slot===0)[own.members[0],own.members[1]]=[own.members[1],own.members[0]];
 const entry=['intimidate','contrary','defiant','klutz','klutz-gas','consumed'].includes(variant);
 const foe={format:'champions',members:[mon('Snorlax','Immunity',['Amnesia']),mon(variant==='klutz-gas'?'Weezing':'Incineroar',variant==='klutz-gas'?'Neutralizing Gas':entry?'Intimidate':'Blaze',['Protect']),mon('Dragonite','Inner Focus',['Protect']),mon('Gholdengo','Good as Gold',['Protect']),mon('Blastoise','Torrent',['Protect']),mon('Charizard','Blaze',['Protect'])]};
 const inputs=side==='player'?[own,foe]:[foe,own],id=side==='player'?'p1':'p2';
 const b=new Battle({formatid:format,seed,strictChoices:true,p1:{team:mapTeam(inputs[0], 'p1',format).slice(0,4)},p2:{team:mapTeam(inputs[1],'p2',format).slice(0,4)}});
 const ref=b[id].pokemon[slot];
 const initial=variant==='multi'?{atk:-2,def:-1,spa:3,accuracy:-1,evasion:-2}:variant==='positive'?{atk:2}:variant==='cap'?{atk:-6}:variant==='klutz-gas'?{atk:-1}:{};
 const init=(m,reference)=>{for(const [stat,value]of Object.entries(initial))(reference?m.boosts:m.statBoosts)[!reference&&stat==='evasion'?'eva':!reference&&stat==='accuracy'?'acc':stat]=value;
  if(variant==='consumed'){if(reference)m.item='';else m.itemConsumed=true;}
  if(variant==='fainted'){m.hp=0;if(!reference)m.alive=false;}};
 init(ref,true);b.choose('p1','team 1234');b.choose('p2','team 1234');
 const local=loadLocalEngine().context,build=local.buildTeam;let actor;
 local.buildTeam=function(...args){const mons=build(...args);if(args[1]===side){actor=mons[slot];init(actor,false);}return mons;};
 const forcedActions=['player','opponent'].flatMap(s=>[0,1].map(k=>({side:s,slot:k,move:s===side?(k===slot&&variant==='close-combat'?'Close Combat':'Protect'):(k===0?'Amnesia':'Protect'),targetSlot:0})));
 for(const rid of ['p1','p2'])b.choose(rid,rid===id?[0,1].map(k=>k===slot&&variant==='close-combat'?'move 2 1':'move 1').join(', '):'move 1, move 1');
 const result=local.simulateBattle(...inputs,{format:'doubles',maxTurns:1,seed,forcedActions});
 assert.notEqual(result.result,'error',result.winCondition);
 const consumed=['intimidate','klutz-gas','multi','cap','close-combat','consumed'].includes(variant);
 assert.equal(ref.item==='',consumed,'reference consumption');
 assert.equal(actor.itemConsumed,consumed,JSON.stringify(result.log));
 for(const stat of ['atk','def','spa','spd','spe','acc','eva'])assert.equal(actor.statBoosts[stat],ref.boosts[stat==='acc'?'accuracy':stat==='eva'?'evasion':stat],stat);
 if(variant==='close-combat'){
  assert.equal(actor.statBoosts.def,0);assert.equal(actor.statBoosts.spd,0);
  const restore=result.log.findIndex(x=>x.includes('White Herb'));
  assert(restore>result.log.findIndex(x=>x.includes('Special Defense fell')));
 }
 assert.equal(result.log.filter(x=>x.includes('White Herb')).length,consumed&&variant!=='consumed'?1:0);
 b.destroy();
});

