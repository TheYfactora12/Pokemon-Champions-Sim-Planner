// Synthetic mechanics fixtures, not legality evidence. Expected damage is independently
// compared with the pinned Battle engine by verify-mc-mega-abilities.cjs.
const assert=require('node:assert/strict');
const {c,battle,mon}=require('./mc_remaining_effects_tests.js');
let checks=0;const test=(name,fn)=>{fn();checks++;console.log('PASS '+name);};
for(const swap of [false,true]) {
 test('Speed Boost active turns '+swap,()=>{
  const r=battle('Splash',{source:{ability:'Speed Boost'},turns:3,swap}),side=swap?'opponent':'player';
  r.turnLog.forEach((t,i)=>assert.equal(t.post.stat_boosts_stable[t.post.roster[side][0].stableKey].spe,i+1));
 });
 for(const move of ['Ember','Tackle','Will-O-Wisp']) test('Thermal Exchange '+move+' '+swap,()=>{
  const r=battle(move,{target:{ability:'Thermal Exchange'},swap}),side=swap?'player':'opponent',post=r.turnLog[0].post,row=post.roster[side][0];
  assert.equal((post.stat_boosts_stable[row.stableKey]||{}).atk||0,move==='Ember'?1:0);
  assert(!r.log.some(x=>x.includes('was burned')));
 });
 for(const move of ['Thunderbolt','Thunder Wave']) test('Lightning Rod immunity '+move+' '+swap,()=>{
  const r=battle(move,{target:{ability:'Lightning Rod'},swap}),side=swap?'player':'opponent',post=r.turnLog[0].post,row=post.roster[side][0];
  assert.equal(post.stat_boosts_stable[row.stableKey].spa,1);
  assert.equal(row.hp_current,row.hp_max);assert(!r.log.some(x=>x.includes('paralysed')));
 });
 test('Lightning Rod ally redirection '+swap,()=>{
  const r=battle('Thunderbolt',{targetAllyAbility:'Lightning Rod',swap}),side=swap?'player':'opponent',post=r.turnLog[0].post;
  assert.equal(post.roster[side][0].hp_current,post.roster[side][0].hp_max);
  assert.equal(post.stat_boosts_stable[post.roster[side][1].stableKey].spa,1);
 });
}
test('Eelevate ignores stages and ties choose Attack',()=>{
 const p=mon('Mew',['Splash'],'Eelevate');p.statBoosts.spe=6;p._mcMoveKOs=2;c.mcFinishMove(p,[]);
 assert.equal(p.statBoosts.atk,2);assert.equal(p.statBoosts.spe,6);assert.equal(p._mcMoveKOs,0);
});
test('Eelevate Ground immunity respects Gravity and Mold Breaker',()=>{
 const p=mon('Mew',['Earth Power']),t=mon('Eelektross',['Splash'],'Eelevate'),f=new c.Field();
 assert.equal(c._isGrounded(t,f),false);assert.equal(p.calcDamage('Earth Power',t,f,null,()=>.5),0);
 f.gravityTurns=1;assert.equal(c._isGrounded(t,f),true);assert(p.calcDamage('Earth Power',t,f,null,()=>.5)>0);
 f.gravityTurns=0;p.ability='Mold Breaker';assert(p.calcDamage('Earth Power',t,f,null,()=>.5)>0);
});
test('Trace excludes forbidden abilities and samples both eligible foes',()=>{
 const p=mon('Meowstic-F',['Splash'],'Trace'),a=mon('Mew',['Splash'],'Multitype'),b=mon('Snorlax',['Splash'],'Immunity');
 assert.equal(c.mcTraceTarget(p,[a,b],()=>0),b);a.ability='Levitate';
 assert.equal(c.mcTraceTarget(p,[a,b],()=>0),a);assert.equal(c.mcTraceTarget(p,[a,b],()=>.99),b);
 a.ability='Trace';b.ability='Multitype';assert.equal(c.mcTraceTarget(p,[a,b],()=>0),null);
 b.ability='Immunity';assert.equal(c.mcTraceTarget(p,[a,b],()=>0),b);
});
test('Thermal Exchange is reference-only and Mold Breaker can initially burn',()=>{
 const p=mon('Snorlax',['Splash'],'Thermal Exchange'),a=mon('Mew',['Splash'],'Mold Breaker'),f=new c.Field();
 assert.equal(c.canInflictStatus(p,'burn',f),false);assert.equal(c.canInflictStatus(p,'burn',f,a),true);
 p.referenceMode=null;assert.equal(c.canInflictStatus(p,'burn',f),true);
});
for(const swap of [false,true])for(const [hp,item,exit] of [[125,'',true],[126,'',false],[75,'',false],[125,'Sitrus Berry',false],[50,'',false]]) {
 test('Emergency Exit threshold/berry '+JSON.stringify({swap,hp,item}),()=>{
  const r=battle('Seismic Toss',{target:{name:'Golisopod',ability:'Emergency Exit',hp,item},targetMove:'Tackle',swap}),side=swap?'player':'opponent';
  assert.equal(r.log.some(x=>x.includes('Emergency Exit activated')),exit,JSON.stringify(r.log));
  if(exit) { assert.equal(r.turnLog[0].post.roster[side][0].zone,'bench');assert(!r.log.some(x=>x==='Golisopod used Tackle!')); }
 });
}
test('Mega evolution clears previously copied Trace bookkeeping',()=>{
 const p=mon('Gardevoir-Mega',['Protect'],'Trace','Gardevoirite');
 p._mcTraceOriginal='Trace';p._mcTraceBlocked=true;p.ability='Immunity';
 assert.equal(p.megaEvolve([]),true);assert.equal(p.ability,'Pixilate');assert.equal(p._mcTraceOriginal,null);assert.equal(p._mcTraceBlocked,false);
});
for(const swap of [false,true])test('Traced base Mega keeps Pixilate after actual pivot and re-entry '+swap,()=>{
 const member=(name,ability,item='')=>({name,ability,item,nature:'Hardy',evs:{},moves:['Teleport','Protect']});
 const a={format:'champions',members:[member('Gardevoir-Mega','Trace','Gardevoirite'),member('Blissey','Healer'),member('Magikarp','Swift Swim'),member('Feebas','Swift Swim')]};
 a.members[0].roles=['Speed Control'];
 a.members[0].moves.push('Tailwind');
 const b={format:'champions',members:[member('Snorlax','Immunity'),member('Blissey','Multitype'),member('Vaporeon','Water Absorb'),member('Charizard','Blaze')]};
 const side=swap?'opponent':'player',other=swap?'player':'opponent';
 const r=c.simulateBattle(swap?b:a,swap?a:b,{rulesetId:'champions_mc_reference',format:'doubles',seed:[8,3,12,7],maxTurns:3,forcedActions:[1,2,3].flatMap(turn=>[
  {turn,side,slot:0,move:turn<3?'Teleport':'Protect'},{turn,side,slot:1,move:'Protect'},
  {turn,side:other,slot:0,move:'Protect'},{turn,side:other,slot:1,move:'Protect'}])});
 assert.notEqual(r.result,'error',r.winCondition);
 assert(r.log.some(x=>x.includes('traced')));assert.equal(r.turnLog[0].post.roster[side][0].zone,'bench');
 const final=r.turnLog[2].post.roster[side][0];assert.equal(final.zone,'active',JSON.stringify(r.log));assert.equal(final.species,'Gardevoir-Mega');assert.equal(final.ability,'Pixilate');
});
for(const swap of [false,true])test('Trace applies copied entry ability exactly once '+swap,()=>{
 const r=battle('Splash',{source:{ability:'Trace'},target:{ability:'Intimidate'},targetAllyAbility:'Multitype',swap});
 const post=r.turnLog[0].post,side=swap?'player':'opponent';
 for(const row of post.roster[side].slice(0,2)) assert.equal(post.stat_boosts_stable[row.stableKey].atk,-1,JSON.stringify(r.log));
});
for(const swap of [false,true])test('entry Ability Shield blocks Trace until a new entry despite Knock Off '+swap,()=>{
 const r=battle('Knock Off',{target:{ability:'Trace',item:'Ability Shield'},turns:2,swap});
 assert(r.log.some(x=>x.includes('lost its Ability Shield because of Knock Off')));
 for(const turn of r.turnLog) assert.equal(turn.post.roster[swap?'player':'opponent'][0].ability,'Trace');
 assert(!r.log.some(x=>x.includes('traced')));
});
console.log(checks+' expanded Mega ability checks passed');
