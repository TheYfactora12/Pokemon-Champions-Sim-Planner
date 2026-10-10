import assert from 'node:assert/strict';
import {test} from 'node:test';
import {runReferenceProbe} from '../tools/showdown-reference.mjs';
const mon=(name,ability,moves)=>({name,ability,moves,item:'',nature:'Hardy',level:50,evs:{hp:32,atk:0,def:0,spa:2,spd:0,spe:32}});
const team=members=>({format:'champions',members});
for(const ability of ['Rock Head','Intimidate']) for(const move of ['Flare Blitz','Head Smash','Double-Edge','Struggle']) test(`${ability} ${move} pinned Champions oracle`,()=>{
  const player=team([mon('Arcanine-Hisui',ability,[move]),mon('Blissey','Natural Cure',['Protect']),mon('Gengar','Cursed Body',['Protect']),mon('Pikachu','Static',['Protect'])]);
  const opponent=team([mon('Snorlax','Immunity',['Splash']),mon('Charizard','Blaze',['Splash']),mon('Venusaur','Overgrow',['Protect']),mon('Blastoise','Torrent',['Protect'])]);
  const ref=runReferenceProbe({id:'rock-head-'+move,formatId:'gen9championsdoublescustomgame',synthetic:true,seed:[8,3,12,7],player,opponent,turns:[{player:[{move,targetSide:'foe',targetSlot:0},{move:'Protect'}],opponent:[{move:'Splash'},{move:'Splash'}]}]});
  assert.equal(ref.status,'probe_complete');
  const p=ref.frames[0].post.p1.find(p=>p.species==='Arcanine-Hisui');
  assert.ok(p);
  assert.equal(p.hp<p.maxhp,ability!=='Rock Head'||move==='Struggle');
});
