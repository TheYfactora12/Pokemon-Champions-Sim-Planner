const assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),inventory=require('./audit-mc-release-inventory.cjs').audit(root);
const {Battle}=require(path.join(root,'artifacts/showdown-mc-reference/dist/sim'));
const {battle:localBattle}=require('../tests/mc_remaining_effects_tests.js');
const set=(species,moves,ability='No Guard',item='')=>({species,moves,ability,item,nature:'Hardy',level:50,evs:{}});
const cases=[
 ...['No Guard','Cloud Nine'].map(ally=>({move:'Beak Blast',source:{name:'Toucannon',ability:'Drought'},target:{name:'Garchomp',ability:'Leaf Guard'},targetMove:'Dragon Claw',targetAllyAbility:ally})),
 ...['','Clear Body','Contrary','Simple','Good as Gold','Magic Bounce','Sap Sipper','Liquid Ooze'].map(ability=>({move:'Strength Sap',source:{hp:1},target:{ability:ability||'No Guard'}})),
 {move:'Strength Sap',source:{hp:1,item:'Big Root'}},{move:'Strength Sap',source:{hp:1,ability:'Klutz',item:'Big Root'}},
 {move:'Syrup Bomb',turns:4},{move:'Syrup Bomb',turns:4,sourceLater:'Syrup Bomb',target:{ability:'Magic Guard'}},
 ...['Shield Dust','Contrary','Simple','Clear Body'].map(ability=>({move:'Syrup Bomb',turns:3,target:{ability}})),
 {move:'Snap Trap',turns:4,target:{name:'Registeel'}},{move:'Snap Trap',turns:5,source:{item:'Grip Claw'},target:{name:'Registeel'}},
 {move:'Snap Trap',turns:3,source:{item:'Binding Band'},target:{name:'Registeel'}},
 ...['Shield Dust','Magic Guard'].map(ability=>({move:'Snap Trap',turns:3,target:{ability,name:'Registeel'}})),
 ...['Syrup Bomb','Snap Trap'].flatMap(move=>[{move,turns:2,sourceLater:'Teleport',lifecycle:true},{move,source:{hp:1},targetMove:'Tackle',lifecycle:true},{move,targetMove:'Teleport',lifecycle:true}]),
 {move:'Beak Blast',source:{name:'Toucannon',status:'sleep',statusTurns:3},target:{name:'Garchomp'},targetMove:'Dragon Claw'},
 ...['Comatose','Purifying Salt','Thermal Exchange','Water Bubble'].map(ability=>({move:'Beak Blast',source:{name:'Toucannon'},target:{name:'Garchomp',ability},targetMove:'Dragon Claw'})),
 {move:'Gravity',turns:6,sourceLater:'Harden',targetMove:'Harden',idle:'Harden'},
 {move:'Beak Blast',source:{name:'Toucannon'},target:{name:'Garchomp'},targetMove:'Dragon Claw'},
 {move:'Beak Blast',source:{name:'Toucannon'},target:{name:'Garchomp',ability:'Long Reach'},targetMove:'Dragon Claw'},
 {move:'Beak Blast',source:{name:'Toucannon'},target:{name:'Garchomp',item:'Protective Pads'},targetMove:'Dragon Claw'},
 {move:'Beak Blast',source:{name:'Toucannon'},target:{name:'Garchomp'},targetMove:'Earth Power'}
];
let checks=0;
for(const swap of [false,true]) for(const spec of cases) {
 const source=Object.assign(set('Mew',[spec.move,spec.sourceLater||'Splash']),spec.source||{}),target=Object.assign(set('Snorlax',[spec.targetMove||'Splash']),spec.target||{});
 if(source.name)source.species=source.name;if(target.name)target.species=target.name;
 const team=(actor,ally='No Guard')=>[actor,set('Blissey',[spec.idle||'Splash'],ally),set('Vaporeon',['Splash']),set('Charizard',['Splash'])];
 const ref=new Battle({formatid:'gen9championsdoublescustomgame',strictChoices:true,seed:[8,3,12,7],p1:{name:'P1',team:team(swap?target:source,swap?(spec.targetAllyAbility||'No Guard'):'No Guard')},p2:{name:'P2',team:team(swap?source:target,swap?'No Guard':(spec.targetAllyAbility||'No Guard'))}});
 try {
  ref.makeChoices('team 1234','team 1234');const src=swap?ref.p2:ref.p1,dst=swap?ref.p1:ref.p2;
  const refActor=src.pokemon[0],refTarget=dst.pokemon[0];
  if(spec.source?.hp!=null)refActor.hp=spec.source.hp;
  if(spec.source?.status==='sleep'){refActor.status='slp';refActor.statusState={id:'slp',target:refActor,time:3,startTime:3};}
  const local=localBattle(spec.move,{...spec,swap}),side=swap?'opponent':'player',other=swap?'player':'opponent';
  let priorHP=refTarget.hp;
  for(let turn=0;turn<(spec.turns||1);turn++) {
   const move=turn?(spec.sourceLater||'Splash'):spec.move;
   const a=`move ${move}${['Splash','Gravity','Harden','Teleport'].includes(move)?'':' 1'}, move ${spec.idle||'Splash'}`,b=`move ${spec.targetMove||'Splash'}${spec.targetMove&&!['Protect','Harden','Teleport'].includes(spec.targetMove)?' 1':''}, move ${spec.idle||'Splash'}`;
   ref.makeChoices(swap?b:a,swap?a:b);
   while(ref.requestState==='switch') {
    for(const sideRef of ref.sides) if(sideRef.activeRequest?.forceSwitch?.some(Boolean)) ref.choose(sideRef.id,'switch 3');
   }
   const post=local.turnLog[turn].post,actor=post.roster[side][0],recipient=post.roster[other][0];
   const boosts=post.stat_boosts_stable[recipient.stableKey]||{};
   if(spec.lifecycle) {
    const expected=spec.move==='Syrup Bomb'?refTarget.volatiles.syrupbomb:refTarget.volatiles.partiallytrapped;
    assert.equal((spec.move==='Syrup Bomb'?recipient.mc_syrup_turns:recipient.mc_trap_turns)>0,!!expected,'volatile lifecycle');
   } else if(spec.move==='Strength Sap') {
    assert.equal(actor.hp_current,refActor.hp,'healer HP');assert.equal(boosts.atk||0,refTarget.boosts.atk,'target Attack');
    assert.equal((post.stat_boosts_stable[actor.stableKey]||{}).atk||0,refActor.boosts.atk,'reflected Attack');
   } else if(spec.move==='Syrup Bomb') assert.equal(boosts.spe||0,refTarget.boosts.spe,'residual Speed');
   else if(spec.move==='Snap Trap' && turn>0) {
    const before=local.turnLog[turn-1].post.roster[other][0].hp_current;
    assert.equal(before-recipient.hp_current,priorHP-refTarget.hp,'trap residual HP');
   } else if(spec.move==='Gravity') assert.equal(post.field.gravity_turns,ref.field.pseudoWeather.gravity?.duration||0,'field duration');
   else if(spec.move==='Beak Blast') assert.equal(local.log.some(x=>x.includes('burned by Beak Blast')),refTarget.status==='brn','contact burn');
   priorHP=refTarget.hp;
  }
  checks++;
 } catch(e) {throw new Error(JSON.stringify({swap,spec})+': '+e.message,{cause:e});}
 finally {ref.destroy();}
}
console.log(JSON.stringify({pin:inventory.pin,compiled_fingerprint:inventory.compiled_fingerprint,checks,status:'passed',scope:'synthetic doubles field, healing, stage, residual and contact effects; not official legal teams or random damage parity'}));
