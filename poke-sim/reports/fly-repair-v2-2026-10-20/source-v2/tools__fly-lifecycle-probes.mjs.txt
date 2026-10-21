import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {localContext,teams} from './probe-fly-repair.mjs';
import {mapTeam} from './showdown-reference.mjs';
const require=createRequire(import.meta.url);
const format='gen9championsdoublescustomgame',seed=[3,7,11,13];
const allowed=new Set(['side','slot','move','item','ability','foeAbility','gas','consumed','species','roll','turns','interrupt','actorMove','foeMove2','redirectTurn','protectTurn','targetSlot','foeFirst','helpingHand','poisonFoe','actorMove2','chargeMove']);
export function lifecycleProbe(config={},referencePath,mutate){
 assert(Object.keys(config).every(k=>allowed.has(k)),'Unsupported Fly probe option');
 const x={side:'player',slot:0,move:'Tackle',item:'',ability:'Rock Head',foeAbility:'Torrent',gas:false,consumed:false,species:'Aerodactyl',roll:100,turns:1,interrupt:null,actorMove:'Fly',foeMove2:null,redirectTurn:0,protectTurn:0,targetSlot:0,foeFirst:false,helpingHand:false,poisonFoe:false,actorMove2:null,chargeMove:'Fly',...config};
 if(!Object.hasOwn(config,'actorMove'))x.actorMove=x.chargeMove;
 assert(['Fly','Solar Beam','Solar Blade','Meteor Beam','Electro Shot','Phantom Force'].includes(x.chargeMove),'Unsupported charge move');
 assert([1,2,3].includes(x.turns)&& (x.turns<3 || x.interrupt==='confusion' || (x.foeFirst&&['Smack Down','Thousand Arrows','Gravity'].includes(x.foeMove2))),'Unsupported continuation configuration');
 assert(x.chargeMove==='Fly'||x.turns<=2,'Unsupported charge continuation');
 assert(['player','opponent'].includes(x.side)&&[0,1].includes(x.slot)&&[0,1].includes(x.targetSlot));
 assert(Number.isInteger(x.roll)&&x.roll>=85&&x.roll<=100);
 const own=teams(x.move,x.item,x.ability);
 const spec=own[0].members[0];spec.name=x.species;spec.moves=[x.chargeMove,'Protect','Tackle'];
 if(x.slot)[own[0].members[0],own[0].members[1]]=[own[0].members[1],own[0].members[0]];
 const foe=own[1].members[0];foe.ability=x.foeAbility;
 if(x.poisonFoe)foe.name='Venusaur';
 foe.moves=[...new Set([x.move,'Protect',x.foeMove2||x.move,...(x.interrupt==='imprison'?['Imprison','Fly']:[])])];
 own[1].members[1].moves=['Protect','Follow Me'];
 if(x.gas){own[0].members[1-x.slot].name='Weezing';own[0].members[1-x.slot].ability='Neutralizing Gas';}
 if(x.helpingHand)own[0].members[1-x.slot].moves=['Helping Hand'];
 const inputs=x.side==='player'?own:[own[1],own[0]],rid=x.side==='player'?'p1':'p2',oid=rid==='p1'?'p2':'p1';
 const {Battle}=require(referencePath||'pokemon-showdown');
 const b=new Battle({formatid:format,seed,strictChoices:true,p1:{team:mapTeam(inputs[0],'p1',format)},p2:{team:mapTeam(inputs[1],'p2',format)}});
 assert.equal(b.dex.currentMod,'champions');assert.equal(b.gameType,'doubles');
 b.choose('p1','team 1234');b.choose('p2','team 1234');
 const ra=b[rid].active[x.slot],rt=b[oid].active[0];
 if(x.consumed)ra.setItem('');
 b.randomizer=n=>Math.floor(n*x.roll/100);
 b.randomChance=(n,d)=>x.interrupt==='paralysis'&&n===1&&d===8||x.interrupt==='confusion'&&n===33&&d===100||n/d>.5;
 const snapshots=[],commands=[];
 function refSnapshot(){return {actor_types:ra.getTypes(),actor_atk:ra.boosts.atk,actor_spa:ra.boosts.spa,charging:!!ra.volatiles.twoturnmove,pp_spent:ra.moveSlots[0].maxpp-ra.moveSlots[0].pp,tackle_pp_spent:ra.moveSlots[2].maxpp-ra.moveSlots[2].pp,actor_hp_loss:ra.maxhp-ra.hp,target_losses:b[oid].active.map(m=>m.maxhp-m.hp),item_consumed:!!x.item&&!ra.item,active:b[rid].active.includes(ra),status:ra.status,helped:!!ra.volatiles.helpinghand};}
 for(let turn=1;turn<=x.turns;turn++){
  if(turn===2){
   if(['sleep','frozen','paralysis'].includes(x.interrupt)){ra.setStatus({sleep:'slp',frozen:'frz',paralysis:'par'}[x.interrupt]);if(x.interrupt==='sleep'||x.interrupt==='frozen')ra.statusState.time=3;}
   if(x.interrupt==='flinch')ra.addVolatile('flinch');
   if(x.interrupt==='confusion')ra.addVolatile('confusion');
   if(x.interrupt==='imprison')rt.addVolatile('imprison');
   if(x.foeFirst)rt.storedStats.spe=999;
  }
  for(const id of ['p1','p2']){
   const cmd=[0,1].map(slot=>{
    if(id===rid){if(slot!==x.slot)return x.helpingHand?`move 1 -${x.slot+1}`:'move 1';
     if(turn>1&&ra.volatiles.twoturnmove)return 'move 1';
     const name=turn>2?'Tackle':turn===2&&x.actorMove2?x.actorMove2:x.actorMove;
     return `move ${spec.moves.indexOf(name)+1}`+(name==='Protect'?'':` ${x.targetSlot+1}`);
    }
    if(slot===1)return x.redirectTurn===turn?'move 2':'move 1';
    const name=x.protectTurn===turn?'Protect':turn===2&&x.foeMove2?x.foeMove2:x.move;
    const target=b.dex.moves.get(name).target;
    return `move ${foe.moves.indexOf(name)+1}`+(['normal','any','adjacentFoe'].includes(target)?` ${x.slot+1}`:'');
   }).join(', ');commands.push({turn,side:id,choice:cmd});b.choose(id,cmd);
  }
  snapshots.push(refSnapshot());
 }
 const referenceLog=[...b.log];b.destroy();
 const c=localContext(true,mutate),build=c.buildTeam;let a,t,ownMons,foeMons,injected=false;
 c.buildTeam=function(...args){const mons=build(...args);if(args[1]===x.side){ownMons=mons;a=mons[x.slot];if(x.consumed)a.itemConsumed=true;
   const speed=a.getEffSpeed;a.getEffSpeed=function(field){if(this.turnsSinceEntry===2&&!injected){injected=true;
    if(['sleep','frozen','paralysis'].includes(x.interrupt)){this.status=x.interrupt;this.statusTurns=3;this.sleepTurns=0;this.frozenTurns=0;}
    if(x.interrupt==='flinch')this._flinched=true;
    if(x.interrupt==='confusion')this.confusionTurns=3;
    if(x.interrupt==='imprison'){this.side.imprisonedMoves=new Set(['Fly']);this.side.imprisonedBy=t.name;}
   }return speed.call(this,field);};
  }else{foeMons=mons;t=mons[0];const speed=t.getEffSpeed;t.getEffSpeed=function(field){return x.foeFirst&&this.turnsSinceEntry>=2?999:speed.call(this,field);};}
  if(x.foeMove2==='Gravity'||x.move==='Strength Sap')for(const m of mons)m.referenceMode='champions_mc_reference';return mons;};
 c.CRIT_STAGES.fill(0);c._sampleDamageRoll=()=>x.roll/100;c._moveHits=()=>true;
 c.makePRNG=()=>()=>x.interrupt&&x.interrupt!=='frozen'?.05:.99;
 const actions=[];
 for(let turn=1;turn<=x.turns;turn++)for(const side of ['player','opponent'])for(const slot of [0,1]){
  const isOwn=side===x.side,isActor=isOwn&&slot===x.slot;
  // Leave the continuation to the real stored-slot selection, not a forced target.
  if(isActor&&turn===2&&!x.actorMove2&&x.chargeMove==='Fly')continue;
  const move=isActor?(turn>2?'Tackle':turn===2&&x.actorMove2?x.actorMove2:x.actorMove):isOwn?(x.helpingHand?'Helping Hand':'Protect'):slot===1?(x.redirectTurn===turn?'Follow Me':'Protect'):x.protectTurn===turn?'Protect':turn===2&&x.foeMove2?x.foeMove2:x.move;
  actions.push({turn,side,slot,move,targetSlot:isActor?x.targetSlot:x.slot,...(isOwn&&x.helpingHand&&!isActor?{targetSide:'ally'}:{})});
 }
 const result=c.simulateBattle(...inputs,{format:'doubles',maxTurns:x.turns,seed,forcedActions:actions});
 assert.notEqual(result.result,'error',result.winCondition);
 const candidate={actor_types:[...a.types],actor_atk:a.statBoosts.atk||0,actor_spa:a.statBoosts.spa||0,charging:a.chargingMove===x.chargeMove,pp_spent:a.movePP[x.chargeMove].max-a.movePP[x.chargeMove].current,tackle_pp_spent:a.movePP.Tackle.max-a.movePP.Tackle.current,actor_hp_loss:a.maxHp-a.hp,target_losses:foeMons.slice(0,2).map(m=>m.maxHp-m.hp),item_consumed:!!a.itemConsumed,active:a.side.activeMons.includes(a),status:({sleep:'slp',frozen:'frz',paralysis:'par',toxic:'tox',poison:'psn',burn:'brn'})[a.status]||a.status||'',helped:!!a.helpingHand};
 const interruptions={reference_self_hits:[...new Set(referenceLog.filter(line=>line.startsWith('|-damage|')&&line.endsWith('[from] confusion')))],candidate_events:result.turnLog.flatMap(turn=>turn.effect_events||[]).filter(event=>event.effect_kind==='confusion-self-hit')};
 return {interruptions,input:x,teams:inputs,commands,actions,reference:snapshots.at(-1),candidate,reference_turns:snapshots,reference_log:referenceLog,candidate_log:result.log,candidate_turns:result.turnLog};
}

export const variants=[
 {id:'no-guard-user',foeAbility:'No Guard'}, {id:'no-guard-flyer',ability:'No Guard'},
 {id:'no-guard-gas',ability:'No Guard',gas:true},
 {id:'no-guard-shield',ability:'No Guard',item:'Ability Shield',gas:true},
 {id:'no-guard-shield-consumed',ability:'No Guard',item:'Ability Shield',gas:true,consumed:true},
 {id:'herb',item:'Power Herb'}, {id:'herb-klutz',item:'Power Herb',ability:'Klutz'},
 {id:'herb-klutz-gas',item:'Power Herb',ability:'Klutz',gas:true},
 {id:'herb-consumed',item:'Power Herb',consumed:true},
 {id:'herb-protect',item:'Power Herb',ability:'No Guard',protectTurn:1},
 ...['Soak','Strength Sap','Dragon Darts'].flatMap(move=>[{id:move+'-no-guard',move,foeAbility:'No Guard'},{id:move+'-ordinary',move}]),
 {id:'toxic',move:'Toxic'}, {id:'poison-toxic',move:'Toxic',poisonFoe:true},
 {id:'helping-hand',move:'Protect',helpingHand:true,turns:2},
 ...['sleep','frozen','paralysis','flinch','confusion','imprison'].map(interrupt=>({id:'abort-'+interrupt,interrupt,move:'Protect',turns:2})),
 ...['Smack Down','Thousand Arrows','Gravity'].map(foeMove2=>({id:'ground-before-'+foeMove2,move:'Protect',foeMove2,foeFirst:true,turns:3})),
 ...['Smack Down','Thousand Arrows'].map(move=>({id:'ground-after-'+move,move,actorMove2:'Tackle',turns:2})),
 {id:'drampa-ground',species:'Drampa',ability:'Berserk',move:'Protect',foeMove2:'Smack Down',foeFirst:true,turns:3},
 {id:'redirect-charge',redirectTurn:1,move:'Protect',turns:2},
 {id:'redirect-release',redirectTurn:2,move:'Protect',turns:2},
 {id:'stored-slot-one',targetSlot:1,move:'Protect',turns:2}
];

export function assertConfusionInterrupted(row){
 assert.equal(row.input.interrupt,'confusion');
 const expected=row.input.turns-1;
 const ref=[...new Set(row.reference_log.filter(line=>line.startsWith('|-damage|')&&line.endsWith('[from] confusion')))];
 assert.equal(ref.length,expected,'reference must actually self-hit from confusion');
 assert(!row.reference_log.some(line=>line.startsWith('|move|')&&line.includes('|Fly|')&&line.includes('[from] lockedmove')),'reference must not release Fly');
 assert.equal(row.candidate.actor_hp_loss,27*expected,'candidate self-hit HP');
 assert.equal(row.reference.actor_hp_loss,27*expected,'reference self-hit HP');
 assert.equal(row.candidate.charging,false,'confusion must cancel stored Fly');
 assert.deepEqual(row.candidate.target_losses,[0,0]);
 if(row.interruptions){assert.equal(row.interruptions.candidate_events.length,expected);assert.equal(row.interruptions.candidate_events[0].skipped_action_move,'Fly');for(const event of row.interruptions.candidate_events){assert.equal(event.action_denial_reason,'confusion');assert.equal(event.skipped_move,true);assert.equal(event.damage_applied,27);}}
}
