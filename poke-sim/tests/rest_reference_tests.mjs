import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {loadLocalEngine,mapTeam} from '../tools/showdown-reference.mjs';
const require=createRequire(import.meta.url);
const {Battle}=require(process.env.CHAMPIONS_REFERENCE_SIM || 'pokemon-showdown');
// Expected timing comes from pinned current upstream9b136a8 Rest time=3 and
// conditions.slp before-move decrement. Synthetic abilities are not legal-team proof.
const mon=(name,ability,moves,item='')=>({name,ability,moves,item,nature:'Hardy',level:50,evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0}});
const vectors=[['normal','Immunity',4],['burn','Immunity',4],['fullhp','Immunity',null],['earlybird','Early Bird',3],['earlybird-gas','Early Bird',4],['earlybird-gas-shield','Early Bird',3],['earlybird-gas-shield-consumed','Early Bird',4]];
function setup(side,slot,variant,ability,called=false,admission=null){
 const actor=mon(admission?.species||'Snorlax',ability,['Rest',called?'Sleep Talk':admission?.followup?'Stomping Tantrum':'Amnesia'],variant.includes('shield')?'Ability Shield':'');
 const own={format:'champions',members:[mon('Venusaur','Overgrow',['Protect']),mon('Pikachu','Static',['Protect']),mon('Raichu','Static',['Protect']),mon('Blastoise','Torrent',['Protect'])]};own.members[slot]=actor;
 const foe={format:'champions',members:[mon(called?'Machamp':'Garchomp',called?'Guts':'Sand Veil',[called?'Seismic Toss':'Protect']),mon('Weezing',variant.includes('gas')?'Neutralizing Gas':'Levitate',['Protect']),mon('Dragonite','Inner Focus',['Protect']),mon('Charizard','Blaze',['Protect'])]};
 if(admission){actor.item=admission.item||'';own.members[1-slot]=mon('Tsareena',admission.ally||'Queenly Majesty',['Protect'],admission.allyItem||'');if(admission.terrain)foe.members[0]=mon(admission.terrain==='electric'?'Pincurchin':'Weezing-Galar',admission.terrain==='electric'?'Electric Surge':'Misty Surge',['Protect'],'Ability Shield');if(admission.sun)foe.members[0]=mon('Torkoal','Drought',['Protect'],'Ability Shield');if(admission.followup)foe.members[0]=mon('Venusaur','Overgrow',['Swords Dance']);}
 const inputs=side==='player'?[own,foe]:[foe,own],rid=side==='player'?'p1':'p2',format='gen9championsdoublescustomgame',seed=[3,7,11,13];
 const teams=inputs.map((t,i)=>mapTeam(t,'p'+(i+1),format));const b=new Battle({formatid:format,seed,strictChoices:true,p1:{team:teams[0]},p2:{team:teams[1]}});b.choose('p1','team 1234');b.choose('p2','team 1234');const ref=b[rid].active[slot];if(admission?.gravity)b.field.addPseudoWeather('gravity',ref);if(variant!=='fullhp')ref.hp-=20;if(variant==='burn')ref.setStatus('brn');if(variant.endsWith('consumed'))ref.setItem('');
 const local=loadLocalEngine().context,build=local.buildTeam;let actorLocal,previousFailure;
 if(admission?.gravity){const effects=local._contactEffects;local._contactEffects=field=>{field.gravityTurns=3;return effects(field);};}
 if(admission?.followup){local.CRIT_STAGES.fill(0);local._sampleDamageRoll=()=>1;local._moveHits=()=>true;b.randomizer=n=>n;b.randomChance=(n,d)=>n>=d;}
 local.buildTeam=function(...args){const mons=build(...args);if(args[1]===side){actorLocal=mons[slot];if(admission?.followup){const calc=actorLocal.calcDamage;actorLocal.calcDamage=function(move,...rest){if(move==='Stomping Tantrum')previousFailure=this._previousMoveFailedForDamage;return calc.call(this,move,...rest);};}if(variant!=='fullhp')actorLocal.hp-=20;if(variant==='burn')actorLocal.status='burn';if(variant.endsWith('consumed'))actorLocal.itemConsumed=true;}return mons;};
 return {b,ref,run(turns){for(let turn=1;turn<=turns;turn++)for(const id of ['p1','p2'])b.choose(id,id===rid?[0,1].map(s=>'move '+(s===slot&&turn>1?(admission?.followup?'2 1':2):1)).join(', '):called?'move 1 '+(slot+1)+', move 1':'move 1, move 1');
 const result=local.simulateBattle(...inputs,{format:'doubles',maxTurns:turns,seed,forcedActions:Array.from({length:turns},(_,i)=>i+1).flatMap(turn=>['player','opponent'].flatMap(s=>[0,1].map(k=>({turn,side:s,slot:k,move:s===side&&k===slot?(turn===1?'Rest':called?'Sleep Talk':admission?.followup?'Stomping Tantrum':'Amnesia'):s!==side&&k===0&&called?'Seismic Toss':s!==side&&admission?.followup&&k===0?'Swords Dance':'Protect',targetSlot:admission?.followup?0:slot}))))});assert.notEqual(result.result,'error',result.winCondition);return {result,actor:actorLocal,previousFailure};}};
}
for(const side of ['player','opponent'])for(const slot of [0,1])for(const [variant,ability,wake]of vectors)test(`Rest ${variant} ${side}/${slot}`,()=>{
 const f=setup(side,slot,variant,ability),{result,actor}=f.run(4);const expectedBoost=wake===null?6:(5-wake)*2;assert.equal(f.ref.boosts.spd,expectedBoost,'upstream independently expected timing');assert.equal(actor.statBoosts.spd,expectedBoost,'local wake timing');
 const wakeTurn=result.turnLog.find(t=>t.effect_events.some(e=>e.effect_kind==='sleep-wake'&&e.actor==='Snorlax'))?.turn;
 if(wake)assert.equal(wakeTurn,wake);else assert(!result.log.some(l=>l.includes('went to sleep with Rest')));
 assert.equal(actor.movePP.Rest.current,actor.movePP.Rest.max-1);assert.equal(actor.hp,actor.maxHp);assert.equal(actor.status,null);
 const action=result.turnLog[0].events.find(e=>e.move==='Rest');assert.equal(action.actor_key,action.target_key,'Rest action targets itself');f.b.destroy();
});
for(const side of ['player','opponent'])for(const slot of [0,1])test(`Sleep Talk cannot reset Rest ${side}/${slot}`,()=>{
 const f=setup(side,slot,'normal','Immunity',true),{result,actor}=f.run(3);assert.equal(f.ref.maxhp-f.ref.hp,100,'two post-Rest fixed hits, called Rest fails');assert.equal(actor.maxHp-actor.hp,100);assert.equal(actor.status,'sleep');assert.equal(actor.statusTurns,1);assert.equal(actor.movePP.Rest.current,actor.movePP.Rest.max-1,'called move does not spend Rest PP');assert.equal(result.log.filter(l=>l.includes('went to sleep with Rest')).length,1);assert.equal(actor.lastMoveFailed,true);assert(result.turnLog[2].effect_events.some(e=>e.effect_kind==='move-failure'&&e.failed_move==='Rest'));f.b.destroy();
});

for (const side of ['player','opponent']) for (const [variant, ability, blocked] of [
  ['normal','Insomnia',true], ['normal','Vital Spirit',true], ['normal','Comatose',true],
  ['gas','Insomnia',false], ['gas-shield','Vital Spirit',true], ['gas','Comatose',true]
]) test(`Rest admission ${side}/${variant}/${ability}`, () => {
  const f=setup(side,0,variant,ability), {actor,result}=f.run(1);
  assert.equal(f.ref.status,blocked?'':'slp','independent upstream admission');
  assert.equal(actor.status,blocked?null:'sleep');
  assert.equal(actor.maxHp-actor.hp,blocked?20:0);
  assert.equal(actor.lastMoveFailed,blocked);
  if(blocked) assert(result.turnLog[0].effect_events.some(e=>e.effect_kind==='move-failure' && e.actor==='Snorlax'));
  f.b.destroy();
});

for(const side of ['player','opponent'])for(const slot of [0,1])for(const v of [
 {id:'electric',terrain:'electric',blocked:true}, {id:'misty',terrain:'misty',blocked:true},
 {id:'balloon',terrain:'electric',item:'Air Balloon',blocked:false},
 {id:'balloon-consumed',terrain:'electric',item:'Air Balloon',blocked:true},
 {id:'balloon-gravity',terrain:'electric',item:'Air Balloon',gravity:true,blocked:true},
 {id:'levitate-gravity',terrain:'electric',ability:'Levitate',gravity:true,blocked:true},
 {id:'ironball-flying',terrain:'electric',species:'Charizard',item:'Iron Ball',blocked:true},
 {id:'ironball-flying-klutz',terrain:'electric',species:'Charizard',ability:'Klutz',item:'Iron Ball',blocked:false},
 {id:'ironball-flying-consumed',terrain:'electric',species:'Charizard',item:'Iron Ball',blocked:false},
 {id:'levitate',terrain:'electric',ability:'Levitate',blocked:false},
 {id:'levitate-gas',terrain:'electric',ability:'Levitate',blocked:true},
 {id:'levitate-gas-shield',terrain:'electric',ability:'Levitate',item:'Ability Shield',blocked:false},
 {id:'balloon-klutz',terrain:'electric',ability:'Klutz',item:'Air Balloon',blocked:true},
 {id:'balloon-klutz-gas',terrain:'electric',ability:'Klutz',item:'Air Balloon',blocked:false},
 {id:'ally',ally:'Sweet Veil',blocked:true}, {id:'ally-gas',ally:'Sweet Veil',blocked:false},
 {id:'ally-gas-shield',ally:'Sweet Veil',allyItem:'Ability Shield',blocked:true}
])test(`Rest terrain and ally admission ${side}/${slot}/${v.id}`,()=>{
 const f=setup(side,slot,v.id,v.ability||'Immunity',false,v),{actor,result}=f.run(1);
 assert.equal(f.ref.status,v.blocked?'':'slp','independent reference status');
 assert.equal(f.ref.maxhp-f.ref.hp,v.blocked?20:0,'independent no-heal boundary');
 assert.equal(actor.status,v.blocked?null:'sleep');assert.equal(actor.maxHp-actor.hp,v.blocked?20:0);
 assert.equal(actor.lastMoveFailed,v.blocked);assert.equal(actor.movePP.Rest.current,actor.movePP.Rest.max-1);
 assert.equal(result.turnLog[0].effect_events.some(e=>e.effect_kind==='move-failure'&&e.failed_move==='Rest'),v.blocked);
 f.b.destroy();
});

for(const side of ['player','opponent'])test(`Rejected Rest preserves next-action failure ${side}`,()=>{
 const f=setup(side,0,'ally','Immunity',false,{ally:'Sweet Veil',followup:true});
 const enemy=f.b[side==='player'?'p2':'p1'].active[0],hp=enemy.hp;
 const {result,previousFailure}=f.run(2),referenceDamage=hp-enemy.hp;
 assert(referenceDamage>0,'reference executes follow-on hit');assert.equal(previousFailure,true);
 const events=result.turnLog[1].damage_events.filter(e=>e.move==='Stomping Tantrum');
 assert.equal(events.length,1);assert.equal(events[0].applied_damage,referenceDamage,'independent maximum-roll executed damage');
 f.b.destroy();
});

// REST-LEAF-GUARD-001: current reference pin 9b136a8; independent 8bfccd3 retest.
// Native Leafeon ability; synthetic teams do not certify regulation eligibility.
for(const side of ['player','opponent'])for(const slot of [0,1])for(const v of [
 {id:'sun',sun:true,blocked:true}, {id:'clear',blocked:false},
 {id:'sun-gas',sun:true,blocked:false},
 {id:'sun-gas-shield',sun:true,item:'Ability Shield',blocked:true},
 {id:'sun-gas-shield-consumed',sun:true,item:'Ability Shield',blocked:false}
])test(`Rest Leaf Guard ${side}/${slot}/${v.id}`,()=>{
 const f=setup(side,slot,v.id,'Leaf Guard',false,{...v,species:'Leafeon'}),{actor,result}=f.run(1);
 assert.equal(f.ref.status,v.blocked?'':'slp','independent status');
 assert.equal(f.ref.maxhp-f.ref.hp,v.blocked?20:0,'independent no healing');
 assert.equal(actor.status,v.blocked?null:'sleep');assert.equal(actor.maxHp-actor.hp,v.blocked?20:0);
 assert.equal(actor.lastMoveFailed,v.blocked);assert.equal(actor.movePP.Rest.current,actor.movePP.Rest.max-1);
 assert.equal(result.turnLog[0].effect_events.some(e=>e.effect_kind==='move-failure'&&e.failed_move==='Rest'),v.blocked);
 f.b.destroy();
});
