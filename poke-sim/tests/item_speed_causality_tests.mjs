import assert from 'node:assert/strict';import {loadLocalEngine} from '../tools/showdown-reference.mjs';import {validateTurnLogPayload} from '../tools/validate-turn-logs.mjs';
const mon=(name,ability,moves,item='')=>({name,ability,moves,item,level:50,nature:'Hardy',evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0}});
const own={format:'champions',members:[mon('Drifblim','Unburden',['Amnesia'],'White Herb'),mon('Blastoise','Torrent',['Protect'])]},foe={format:'champions',members:[mon('Whimsicott','Prankster',['Moonblast']),mon('Garchomp','Sand Veil',['Swords Dance'])]};
const findings=r=>validateTurnLogPayload({...r,format:'doubles'},{requireStable:true}).findings;
const rows=[];
for(const swap of [false,true]){
const side=swap?'opponent':'player';let found;
for(let n=1;n<=40;n++){const c=loadLocalEngine().context;c.CRIT_STAGES.fill(0);const seed=[n*1777,n*3217,n*4591,n*7919],r=c.simulateBattle(...(swap?[foe,own]:[own,foe]),{format:'doubles',maxTurns:1,seed,forcedActions:['player','opponent'].flatMap(s=>[0,1].map(slot=>({turn:1,side:s,slot,move:s===side?(slot?'Protect':'Amnesia'):(slot?'Swords Dance':'Moonblast'),targetSlot:0})))});
const proof=r.turnLog[0].effect_events.find(e=>e.effect_kind==='item-speed-activation');if(!proof)continue;
const baseline=findings(r),bad=structuredClone(r),t=bad.turnLog[0],p=t.effect_events.find(e=>e.effect_kind==='item-speed-activation'),protect=t.events.find(e=>e.move==='Protect'&&e.log_index<p.log_index);
if(!protect)throw Error('Required noncausal earlier action missing');
const before=structuredClone(p);p.source_actor_key=protect.actor_key;p.move='Protect';
const removed=structuredClone(r);removed.turnLog[0].effect_events=removed.turnLog[0].effect_events.filter(e=>e.effect_kind!=='item-speed-activation');
const illegal=structuredClone(bad),it=illegal.turnLog[0],actorIndex=it.events.findIndex(e=>e.actor_key===p.actor_key&&e.move==='Amnesia'),sourceIndex=it.events.findIndex(e=>e.actor_key===before.source_actor_key&&e.move===before.move);
if(actorIndex<0||sourceIndex<0)throw Error('Order mutation anchor missing');
const actorLog=it.events[actorIndex].log_index,sourceLog=it.events[sourceIndex].log_index;
[it.events[actorIndex],it.events[sourceIndex]]=[it.events[sourceIndex],it.events[actorIndex]];
it.events[sourceIndex].log_index=sourceLog;it.events[actorIndex].log_index=actorLog;
it.effect_events.find(e=>e.effect_kind==='item-speed-activation').log_index=sourceLog;
found={swap,seed,baseline,mutant_findings:findings(bad),removed_findings:findings(removed),illegal_order_findings:findings(illegal),illegal_order_result:illegal,original_proof:before,mutant_proof:p,baseline_result:r};break;
}
if(!found)throw Error('No activation reached');rows.push(found);
}

for(const r of rows){assert.equal(r.baseline.length,0);assert(r.mutant_findings.some(f=>f.code==='observed-action-order-mismatch'));assert(r.illegal_order_findings.some(f=>f.code==='observed-action-order-mismatch'));assert(r.removed_findings.some(f=>f.code==='observed-action-order-mismatch'));}
console.log('Independent item proof causality: 2 orientations and 6 negative controls passed');
