import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import {loadLocalEngine} from '../tools/showdown-reference.mjs';
import {validateTurnLogPayload} from '../tools/validate-turn-logs.mjs';
const fixtures=JSON.parse(fs.readFileSync(new URL('fixtures/item_speed_ci_cases.json',import.meta.url)));
for(const fixture of fixtures.cases)test(`CI item speed evidence ${fixture.run_id}`,()=>{
 const c=loadLocalEngine().context,result=c.simulateBattle(fixture.player,fixture.opponent,fixture.options);
 const badOrder=value=>validateTurnLogPayload({...value,format:'doubles'},{requireStable:true}).findings.filter(f=>f.code==='observed-action-order-mismatch');
 assert.deepEqual(badOrder(result),[]);
 const proofs=result.turnLog.flatMap(t=>t.effect_events.filter(e=>e.effect_kind==='item-speed-activation'));
 assert(proofs.length>0,'nonempty activation evidence');
 for(const edit of [
  e=>{e.actor_key='wrong:identity';},e=>{e.log_index=100000;},e=>{e.item_consumed=false;},e=>{e.source_actor_key='wrong:source';}
 ]){const mutant=structuredClone(result);for(const t of mutant.turnLog)for(const e of t.effect_events)if(e.effect_kind==='item-speed-activation')edit(e);assert(badOrder(mutant).length>0,'invalid proof cannot justify changed action order');}
 const removed=structuredClone(result);for(const t of removed.turnLog)t.effect_events=t.effect_events.filter(e=>e.effect_kind!=='item-speed-activation');assert(badOrder(removed).length>0);
 const invalid=structuredClone(result);let swapped=false;
 for(const t of invalid.turnLog){const proof=t.effect_events.find(e=>e.effect_kind==='item-speed-activation');if(!proof)continue;
  const index=t.events.findIndex(e=>e.actor_key===proof.actor_key&&e.move&&e.log_index>=proof.log_index);
  const next=t.events.findIndex((e,i)=>i>index&&e.actor_key&&e.move&&e.actor_key!==proof.actor_key);
  if(index>=0&&next>=0){[t.events[index],t.events[next]]=[t.events[next],t.events[index]];swapped=true;break;}
 }
 assert(swapped);assert(badOrder(invalid).length>0,'wrong order remains rejected despite a valid consumption event');
});

for(const swap of [false,true])test(`nested Sleep Talk records one item transition ${swap}`,()=>{
 const mon=(name,ability,moves,item='')=>({name,ability,moves,item,nature:'Hardy',level:50,evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0}});
 const own={format:'champions',members:[mon('Machamp','Guts',['Sleep Talk','Seismic Toss']),mon('Venusaur','Overgrow',['Protect']),mon('Raichu','Static',['Protect']),mon('Blastoise','Torrent',['Protect'])]};
 const foe={format:'champions',members:[mon('Snorlax','Unburden',['Amnesia'],'Sitrus Berry'),mon('Pikachu','Static',['Protect']),mon('Dragonite','Inner Focus',['Protect']),mon('Charizard','Blaze',['Protect'])]};
 const c=loadLocalEngine().context,build=c.buildTeam;
 c.buildTeam=function(...args){const mons=build(...args);for(const m of mons){if(m.name==='Machamp'){m.status='sleep';m.statusTurns=3;}if(m.name==='Snorlax')m.hp=Math.floor(m.maxHp/2)+20;}return mons;};
 const side=swap?'opponent':'player',result=c.simulateBattle(...(swap?[foe,own]:[own,foe]),{format:'doubles',maxTurns:1,seed:[3,7,11,13],forcedActions:['player','opponent'].flatMap(s=>[0,1].map(slot=>({turn:1,side:s,slot,move:slot?'Protect':s===side?'Sleep Talk':'Amnesia',targetSlot:0})))});
 const events=result.turnLog[0].effect_events.filter(e=>e.effect_kind==='item-speed-activation');
 assert.equal(events.length,1);assert.equal(events[0].actor,'Snorlax');assert.equal(events[0].move,'Seismic Toss');assert.equal(events[0].item,'Sitrus Berry');
 assert(result.turnLog[0].damage_events.some(e=>e.move==='Seismic Toss'&&e.applied_damage===50));
});
