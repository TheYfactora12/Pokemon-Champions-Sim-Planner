// Synthetic mechanics fixtures; admission is mocked, not legal-team evidence.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const c=vm.createContext({console,Math,window:{}});
for(const f of ['data.js','generated/pokemon_showdown_legal_data.js','generated/champions_move_overrides.js','runtime_data.js','mc_review.js','generated/mc_review_reference.js','engine.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),c);
vm.runInContext('this.Pokemon=Pokemon;this.Field=Field;',c);
c.checkMcReferenceExecution=()=>({allowed:true,source_gaps:['synthetic effect fixture']});
const set=(name,moves=['Splash'],ability='',item='')=>({name,moves,ability,item,nature:'Hardy',evs:{}});
const mon=(name,moves,ability,item)=>new c.Pokemon(set(name,moves,ability,item),'','champions','champions_mc_reference');
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name);}
function sap({ability='',sourceAbility='',item='',boost=0,protect=false,sub=false,full=false}={}) {
 const source=mon('Blissey',['Strength Sap'],sourceAbility,item),target=mon('Snorlax',['Splash'],ability),field=new c.Field(),log=[];
 source.side=field.playerSide;target.side=field.oppSide;field.playerSide.activeMons=[source];field.oppSide.activeMons=[target];
 source.hp=full?source.maxHp:1;target.statBoosts.atk=boost;target.protected=protect;target.substituteHp=sub?100:0;
 const before=source.hp,expected=c._boostedAttackSideStat(target,'atk');
 const result=c._applyMcStrengthSap(source,target,field,log,()=>.5,false,()=>true);
 return {source,target,field,log,before,expected,result};
}
test('Strength Sap heals from pre-drop Attack and drops Attack',()=>{const r=sap({boost:2});assert.equal(r.source.hp-r.before,r.expected);assert.equal(r.target.statBoosts.atk,1);});
for(const ability of ['Huge Power','Pure Power']) test('Strength Sap ignores Attack damage modifier '+ability,()=>{const r=sap({ability});assert.equal(r.source.hp-r.before,r.expected);});
for(const ability of ['Clear Body','Contrary','Simple']) test('Strength Sap stage boundary '+ability,()=>{const r=sap({ability});assert.equal(r.source.hp-r.before,r.expected);assert.equal(r.target.statBoosts.atk,ability==='Clear Body'?0:ability==='Contrary'?1:-2);});
test('Strength Sap fails at minus six even with Contrary',()=>{const r=sap({boost:-6,ability:'Contrary'});assert.equal(r.source.hp,1);assert.equal(r.result,false);});
for(const options of [{protect:true},{sub:true},{ability:'Good as Gold'}]) test('Strength Sap blocked '+JSON.stringify(options),()=>{const r=sap(options);assert.equal(r.source.hp,1);assert.equal(r.target.statBoosts.atk,0);});
test('Strength Sap heals at full HP only through successful drop',()=>{const r=sap({full:true});assert.equal(r.source.hp,r.before);assert.equal(r.target.statBoosts.atk,-1);assert.equal(r.result,true);});
test('Strength Sap Big Root uses pinned fixed point rounding',()=>{const r=sap({item:'Big Root'});assert.equal(r.source.hp-r.before,c._pokeRound(r.expected*5324/4096));});
test('Strength Sap Klutz suppresses Big Root',()=>{const r=sap({item:'Big Root',sourceAbility:'Klutz'});assert.equal(r.source.hp-r.before,r.expected);});
test('Strength Sap Liquid Ooze can KO the healer',()=>{const r=sap({ability:'Liquid Ooze'});assert.equal(r.source.hp,0);assert.equal(r.source.alive,false);assert.equal(r.target.statBoosts.atk,-1);});
test('Strength Sap Magic Guard blocks Liquid Ooze damage',()=>{const r=sap({ability:'Liquid Ooze',sourceAbility:'Magic Guard'});assert.equal(r.source.hp,1);});
test('Strength Sap Magic Bounce swaps healer and weakened target',()=>{const r=sap({ability:'Magic Bounce'});assert.equal(r.source.statBoosts.atk,-1);assert.equal(r.target.statBoosts.atk,0);assert.equal(r.source.hp,1);});
test('Strength Sap Sap Sipper grants Attack instead of healing',()=>{const r=sap({ability:'Sap Sipper'});assert.equal(r.target.statBoosts.atk,1);assert.equal(r.source.hp,1);});

function timed(move, {item='',ability='',targetAbility='',targetName='Snorlax',roll=0}={}) {
 const source=mon('Mew',[move],ability,item),target=mon(targetName,['Splash'],targetAbility),field=new c.Field(),log=[];
 source.side=field.playerSide;target.side=field.oppSide;field.playerSide.activeMons=[source];field.oppSide.activeMons=[target];
 c._applyMcTimedMove(source,target,move,field,log,()=>roll);
 return {source,target,field,log,tick:()=>c._tickMcTimedMoves(field,log)};
}
test('Syrup Bomb drops on three residuals and expires before the fourth',()=>{const r=timed('Syrup Bomb');for(let i=1;i<=4;i++){r.tick();assert.equal(r.target.statBoosts.spe,-Math.min(i,3));}assert.equal(r.target._mcSyrup,null);});
for(const ability of ['Contrary','Simple','Clear Body']) test('Syrup Bomb residual '+ability,()=>{const r=timed('Syrup Bomb',{targetAbility:ability});r.tick();assert.equal(r.target.statBoosts.spe,ability==='Contrary'?1:ability==='Simple'?-2:0);});
for(const move of ['Syrup Bomb','Snap Trap']) {
 test(move+' repeated application does not refresh or change source',()=>{const r=timed(move);r.tick();const state=r.target[move==='Syrup Bomb'?'_mcSyrup':'_mcTrap'],remaining=state.turns;c._applyMcTimedMove(r.target,r.target,move,r.field,r.log,()=>1);assert.equal(state.turns,remaining);assert.equal(state.source,r.source);});
 test(move+' source departure clears state even if a same-name replacement enters',()=>{const r=timed(move);r.field.playerSide.activeMons=[mon('Mew')];r.tick();assert.equal(r.target[move==='Syrup Bomb'?'_mcSyrup':'_mcTrap'],null);});
 test(move+' successful switch cleanup prevents re-entry revival',()=>{const r=timed(move);c._clearMcVolatilesForMon(r.source,r.field);r.tick();assert.equal(r.target[move==='Syrup Bomb'?'_mcSyrup':'_mcTrap'],null);});
}
for(const [item,roll,ticks] of [['',0,4],['',.99,5],['Grip Claw',0,7]]) test('Snap Trap duration '+item+roll,()=>{const r=timed('Snap Trap',{item,roll});const start=r.target.hp,damage=Math.floor(r.target.maxHp/8);for(let i=0;i<ticks+1;i++)r.tick();assert.equal(start-r.target.hp,damage*ticks);assert.equal(r.target._mcTrap,null);});
test('Snap Trap Binding Band captures one sixth damage',()=>{const r=timed('Snap Trap',{item:'Binding Band'});r.source.item='';const before=r.target.hp;r.tick();assert.equal(before-r.target.hp,Math.floor(r.target.maxHp/6));});
test('Snap Trap Magic Guard prevents residual damage',()=>{const r=timed('Snap Trap',{targetAbility:'Magic Guard'});const before=r.target.hp;r.tick();assert.equal(r.target.hp,before);});
test('Snap Trap Ghost can escape but still receives residual damage',()=>{const r=timed('Snap Trap',{targetName:'Gengar'});assert.equal(c._isMcPartiallyTrapped(r.target),false);const before=r.target.hp;r.tick();assert.ok(r.target.hp<before);});
test('Snap Trap Shed Shell permits escape only when active',()=>{const r=timed('Snap Trap');assert.equal(c._isMcPartiallyTrapped(r.target),true);r.target.item='Shed Shell';assert.equal(c._isMcPartiallyTrapped(r.target),false);r.target.ability='Klutz';assert.equal(c._isMcPartiallyTrapped(r.target),true);});
test('Gravity expires after five ticks and cannot refresh while active',()=>{const field=new c.Field(),source=mon('Mew',['Gravity']);assert.equal(c._startMcGravity(source,field,[]),true);field.tick([]);assert.equal(c._startMcGravity(source,field,[]),false);assert.equal(field.gravityTurns,4);for(let i=0;i<4;i++)field.tick([]);assert.equal(field.gravityTurns,0);});
for(const [name,ability,item] of [['Charizard','',''],['Gengar','Levitate',''],['Mew','','Air Balloon']]) test('Gravity grounds '+name+ability+item,()=>{const field=new c.Field(),target=mon(name,['Splash'],ability,item);assert.equal(c._isGrounded(target,field),false);field.gravityTurns=5;assert.equal(c._isGrounded(target,field),true);});
test('Grav Apple chains the Gravity power modifier',()=>{const source=mon('Mew',['Grav Apple']),target=mon('Snorlax'),field=new c.Field({gravityTurns:5});field._ctx.captureDamageCalc=true;source.calcDamage('Grav Apple',target,field,null,()=>.5);assert.equal(field._ctx.lastDamageCalc.base_power_modified,135);});
test('Gravity makes a 60 percent move reach the rounded 100 percent threshold',()=>{const source=mon('Mew',['Hypnosis']),target=mon('Snorlax'),field=new c.Field();assert.equal(c._moveHits(source,target,'Hypnosis',field,()=>.99),false);field.gravityTurns=5;assert.equal(c._moveHits(source,target,'Hypnosis',field,()=>.99),true);});
test('Gravity prohibits flagged moves and cancels airborne charge',()=>{const source=mon('Mew',['Gravity']),target=mon('Charizard',['Fly']),field=new c.Field();field.oppSide.activeMons=[target];target.chargingMove='Fly';target.concealedByMove='Fly';c._startMcGravity(source,field,[]);assert.equal(c._mcMoveUnavailable(target,'Fly',field),true);assert.equal(target.chargingMove,null);assert.equal(target.concealedByMove,null);assert.equal(target._gravityInterrupted,true);});
function battle(move,{source={},target={},turns=1,swap=false,sourceLater='Splash',targetMove='Splash',idle='Splash',targetAllyAbility='No Guard'}={}) {
 const a={...set('Mew',[move,sourceLater],'No Guard'),...source},b={...set('Snorlax',[targetMove],'No Guard'),...target};
 const team=(actor,allyAbility='No Guard')=>({name:'synthetic',format:'champions',members:[actor,set('Blissey',[idle],allyAbility),set('Vaporeon'),set('Charizard')]});
 const side=swap?'opponent':'player',other=swap?'player':'opponent';
 return c.simulateBattle(team(swap?b:a,swap?targetAllyAbility:'No Guard'),team(swap?a:b,swap?'No Guard':targetAllyAbility),{rulesetId:'champions_mc_reference',format:'doubles',seed:[8,3,12,7],maxTurns:turns,forcedActions:Array.from({length:turns},(_,i)=>[
 {turn:i+1,side,slot:0,move:i?sourceLater:move,targetSlot:0},{turn:i+1,side,slot:1,move:idle},
 {turn:i+1,side:other,slot:0,move:targetMove,targetSlot:0},{turn:i+1,side:other,slot:1,move:idle}]).flat()});
}
for(const swap of [false,true]) test('Strength Sap real doubles action heals and lowers target '+swap,()=>{const r=battle('Strength Sap',{source:{hp:1},swap}),side=swap?'opponent':'player',other=swap?'player':'opponent',post=r.turnLog[0].post;assert.ok(post.roster[side][0].hp_current>1);assert.equal(post.stat_boosts_stable[post.roster[other][0].stableKey].atk,-1);});
for(const move of ['Syrup Bomb','Snap Trap']) for(const blocker of ['Shield Dust','Covert Cloak','Sheer Force']) test(move+' real action secondary classification '+blocker,()=>{const r=battle(move,{source:{ability:blocker==='Sheer Force'?blocker:'No Guard'},target:{ability:blocker==='Shield Dust'?blocker:'No Guard',item:blocker==='Covert Cloak'?blocker:''}});const row=r.turnLog[0].post.roster.opponent[0];assert.equal(move==='Syrup Bomb'?row.mc_syrup_turns>0:row.mc_trap_turns>0,move==='Snap Trap');});
for(const swap of [false,true]) test('Beak Blast prepares before contact attack and burns attacker '+swap,()=>{const r=battle('Beak Blast',{source:{name:'Toucannon'},target:{name:'Garchomp'},targetMove:'Dragon Claw',swap});assert.ok(r.log.includes('Garchomp was burned by Beak Blast!'));});
for(const [ability,item] of [['Long Reach',''],['','Protective Pads']]) test('Beak Blast contact bypass '+ability+item,()=>{const r=battle('Beak Blast',{source:{name:'Toucannon'},target:{name:'Garchomp',ability,item},targetMove:'Dragon Claw'});assert.ok(!r.log.some(x=>x.includes('burned by Beak Blast')));});
test('Beak Blast does not burn a non-contact attacker',()=>{const r=battle('Beak Blast',{source:{name:'Toucannon'},target:{name:'Garchomp'},targetMove:'Earth Power'});assert.ok(!r.log.some(x=>x.includes('burned by Beak Blast')));});
for(const ability of ['Comatose','Purifying Salt','Thermal Exchange','Water Bubble','Water Veil']) test('Beak Blast burn immunity '+ability,()=>{const r=battle('Beak Blast',{source:{name:'Toucannon'},target:{name:'Garchomp',ability},targetMove:'Dragon Claw'});assert.ok(!r.log.some(x=>x.includes('burned by Beak Blast')));});
test('Strength Sap no-heal no-drop records failure rather than success',()=>{const r=sap({full:true,ability:'Clear Body'});assert.equal(r.result,false);assert.equal(r.source.lastMoveFailed,true);assert.ok(!r.log.some(x=>x.includes('restored HP')));});
for(const move of ['Syrup Bomb','Snap Trap']) {
 test(move+' actual source pivot clears the target volatile',()=>{const r=battle(move,{turns:2,sourceLater:'Teleport'});const target=r.turnLog[1].post.roster.opponent[0];assert.equal(target.mc_syrup_turns,0);assert.equal(target.mc_trap_turns,0);assert.ok(r.log.some(x=>x.includes('was sent out')));});
 test(move+' actual target pivot clears its own volatile',()=>{const r=battle(move,{targetMove:'Teleport'});const target=r.turnLog[0].post.roster.opponent[0];assert.equal(target.mc_syrup_turns,0);assert.equal(target.mc_trap_turns,0);assert.equal(target.zone,'bench');});
 test(move+' source faint before residual clears the effect',()=>{const r=battle(move,{source:{hp:1},targetMove:'Tackle'});const target=r.turnLog[0].post.roster.opponent[0];assert.equal(target.mc_syrup_turns,0);assert.equal(target.mc_trap_turns,0);assert.equal((r.turnLog[0].post.stat_boosts_stable[target.stableKey]||{}).spe||0,0);});
}
test('Beak Blast preparation survives sleep denial until turn expiry',()=>{const r=battle('Beak Blast',{source:{name:'Toucannon',status:'sleep',statusTurns:3},target:{name:'Garchomp'},targetMove:'Dragon Claw'});assert.ok(r.log.some(x=>x.includes('burned by Beak Blast')));assert.ok(!r.turnLog[0].damage_events.some(x=>x.attacker==='Toucannon'));});
test('Beak Blast does not burn contact after it has fired',()=>{const r=battle('Beak Blast',{source:{name:'Toucannon'},target:{name:'Registeel'},targetMove:'Dragon Tail'});assert.ok(r.turnLog[0].damage_events.some(x=>x.attacker==='Registeel'));assert.ok(!r.log.some(x=>x.includes('burned by Beak Blast')));});
test('Beak Blast Substitute shields preparation from contact',()=>{const r=battle('Beak Blast',{source:{name:'Toucannon',substituteHp:100},target:{name:'Garchomp'},targetMove:'Dragon Claw'});assert.ok(!r.log.some(x=>x.includes('burned by Beak Blast')));});
test('Gravity makes Ground damage connect against Flying and Levitate',()=>{const source=mon('Mew',['Earth Power']),field=new c.Field({gravityTurns:5});for(const target of [mon('Charizard'),mon('Gengar',['Splash'],'Levitate'),mon('Mew',['Splash'],'','Air Balloon')]){assert.ok(source.calcDamage('Earth Power',target,field,null,()=>.5)>0);field.gravityTurns=0;assert.equal(source.calcDamage('Earth Power',target,field,null,()=>.5),0);field.gravityTurns=5;}});
test('Gravity grounding exposes Flying targets to Misty Terrain status prevention',()=>{const field=new c.Field({terrain:'misty',gravityTurns:5}),target=mon('Charizard');assert.equal(c.canInflictStatus(target,'poison',field,mon('Mew')),false);field.gravityTurns=0;assert.equal(c.canInflictStatus(target,'poison',field,mon('Mew')),true);});
test('Strength Sap Heal Block denies action without consuming PP',()=>{const r=battle('Strength Sap',{source:{hp:1,healBlockedTurns:2}}),row=r.turnLog[0].post.roster.player[0];assert.equal(row.hp_current,1);assert.equal(row.move_pp['Strength Sap'].current,8);assert.ok(r.log.some(x=>x.includes('Heal Block')));});
for(const ally of ['No Guard','Cloud Nine']) test('Beak Blast Leaf Guard effective sun '+ally,()=>{const r=battle('Beak Blast',{source:{name:'Toucannon',ability:'Drought'},target:{name:'Garchomp',ability:'Leaf Guard'},targetMove:'Dragon Claw',targetAllyAbility:ally});assert.equal(r.log.some(x=>x.includes('burned by Beak Blast')),ally==='Cloud Nine');});
console.log(`${count} remaining-effect checks passed.`);
module.exports={c,set,mon,sap,battle,timed};
