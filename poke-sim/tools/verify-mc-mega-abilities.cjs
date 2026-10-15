const assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),inventory=require('./audit-mc-release-inventory.cjs').audit(root);
const {Battle}=require(path.join(root,'artifacts/showdown-mc-reference/dist/sim'));
const {c,set,team,opts}=require('../tests/mc_mega_lifecycle_tests.js');
const probes=[
 ...['Knock Off','Rock Slide','Slash'].map(move=>({ability:'Tough Claws',move})),
 ...['Psycho Cut','Night Slash','Tackle'].map(move=>({ability:'Sharpness',move})),
 ...['Fire Fang','Flamethrower','Tackle'].map(move=>({ability:'Fire Mane',move})),
 ...['Tackle','Flamethrower'].map(move=>({ability:'Pressure',targetAbility:'Aura Guard',move})),
 {ability:'Mold Breaker',targetAbility:'Aura Guard',move:'Tackle'},
 {ability:'Long Reach',targetAbility:'Aura Guard',move:'Tackle'},
 {ability:'Pressure',targetAbility:'Aura Guard',move:'Tackle',item:'Protective Pads'},
 ...['self','ally','foe','both','break'].map(aura=>({ability:aura==='self'?'Fairy Aura':'Pressure',move:'Moonblast',aura}))
];
let checks=0;
for(const swap of [false,true])for(const spec of probes) {
 const source=set('Mew',spec.item||'',spec.ability,[spec.move]),target=set('Snorlax','',spec.targetAbility||'Immunity');
 const ta=team(source),tb=team(target);
 if(['ally','both','break'].includes(spec.aura))ta.members[1].ability='Fairy Aura';
 if(['foe','both'].includes(spec.aura))tb.members[1].ability='Fairy Aura';
 if(spec.aura==='break')tb.members[1].ability='Aura Break';
 const rt=t=>t.members.map(x=>({...x,species:x.name}));
 const battle=new Battle({formatid:'gen9championsdoublescustomgame',strictChoices:true,seed:[8,3,12,7],p1:{name:'P1',team:rt(swap?tb:ta)},p2:{name:'P2',team:rt(swap?ta:tb)}});
 try {
  battle.makeChoices('team 1234','team 1234');
  const src=(swap?battle.p2:battle.p1).active[0],dst=(swap?battle.p1:battle.p2).active[0];
  battle.randomChance=()=>false; battle.randomizer=x=>x;
  const move=battle.dex.getActiveMove(spec.move);move.crit=false;
  battle.setActiveMove(move,src,dst);
  battle.runEvent('ModifyMove',src,dst,move,move);
  battle.runEvent('TryPrimaryHit',dst,src,move);
  const expected=battle.actions.getDamage(src,dst,move,true);
  const lp=new c.Pokemon(source,'','champions',opts.rulesetId),lt=new c.Pokemon(target,'','champions',opts.rulesetId),field=new c.Field();
  lp.side=field.playerSide;lt.side=field.oppSide;
  field.playerSide.activeMons=[lp,new c.Pokemon(ta.members[1],'','champions',opts.rulesetId)];
  field.oppSide.activeMons=[lt,new c.Pokemon(tb.members[1],'','champions',opts.rulesetId)];
  const actual=lp.calcDamage(spec.move,lt,field,null,()=>.999999);
  assert.equal(actual,expected,JSON.stringify({swap,spec,actual,expected}));checks++;
 } finally {battle.destroy();}
}
const {battle:localBattle}=require('../tests/mc_remaining_effects_tests.js');
const interactions=[
 {move:'Knock Off',target:{ability:'Trace',item:'Ability Shield'},turns:2},
 {move:'Splash',source:{ability:'Trace'},target:{ability:'Intimidate'},targetAllyAbility:'Multitype'},
 {move:'Splash',source:{ability:'Speed Boost'},turns:3},
 ...['Ember','Tackle','Will-O-Wisp'].map(move=>({move,target:{ability:'Thermal Exchange'}})),
 {move:'Will-O-Wisp',source:{ability:'Mold Breaker'},target:{ability:'Thermal Exchange'}},
 ...['Thunderbolt','Thunder Wave'].flatMap(move=>[
  {move,target:{ability:'Lightning Rod'}},
  {move,targetAllyAbility:'Lightning Rod'},
  {move,source:{ability:'Mold Breaker'},target:{ability:'Lightning Rod'}}]),
 {move:'Tackle',source:{ability:'Eelevate'},target:{hp:1}},
 {move:'Splash',source:{ability:'Trace'},target:{ability:'Immunity'},targetAllyAbility:'Multitype'},
 {move:'Splash',source:{ability:'Trace'},target:{ability:'Multitype'},targetAllyAbility:'Immunity'},
 ...[[125,''],[126,''],[75,''],[125,'Sitrus Berry'],[50,'']].map(([hp,item])=>({move:'Seismic Toss',target:{name:'Golisopod',ability:'Emergency Exit',hp,item}}))
];
for(const swap of [false,true])for(const spec of interactions) {
 const source={...set('Mew','','No Guard',[spec.move,'Splash']),...spec.source},target={...set('Snorlax','','No Guard',['Splash']),...spec.target};
 const rt=(actor,ally='No Guard')=>[actor,set('Blissey','',ally,['Splash']),set('Vaporeon','','',['Splash']),set('Charizard','','',['Splash'])].map(x=>({...x,species:x.name}));
 const battle=new Battle({formatid:'gen9championsdoublescustomgame',strictChoices:true,seed:[8,3,12,7],p1:{name:'P1',team:rt(swap?target:source,swap?(spec.targetAllyAbility||'No Guard'):'No Guard')},p2:{name:'P2',team:rt(swap?source:target,swap?'No Guard':(spec.targetAllyAbility||'No Guard'))}});
 try {
  battle.makeChoices('team 1234','team 1234');const src=swap?battle.p2:battle.p1,dst=swap?battle.p1:battle.p2;
  if(spec.target?.hp!=null)dst.pokemon[0].hp=spec.target.hp;
  const local=localBattle(spec.move,{...spec,swap});
  for(let turn=0;turn<(spec.turns||1);turn++) {
   const move=turn?'Splash':spec.move,action='move '+move+(move==='Splash'?'':' 1')+', move Splash',idle='move Splash, move Splash';
   battle.makeChoices(swap?idle:action,swap?action:idle);
   while(battle.requestState==='switch')for(const side of battle.sides)if(side.activeRequest?.forceSwitch?.some(Boolean))battle.choose(side.id,'switch 3');
   const post=local.turnLog[turn].post;
   for(const [side,ref] of [[swap?'opponent':'player',src],[swap?'player':'opponent',dst]])for(let i=0;i<2;i++) {
    const row=post.roster[side][i];
    // Original roster identities survive replacement in the local evidence.
    const original=i===0?(ref===src?source.name:target.name):'Blissey',actor=ref.pokemon.find(p=>p.baseSpecies.name===original);
    assert.equal(row.ability,actor.getAbility().name,JSON.stringify({swap,spec,side,i}));
    assert.equal(post.status_stable[row.stableKey]||'',({brn:'burn',par:'paralysis',psn:'poison',tox:'toxic',slp:'sleep',frz:'frozen'})[actor.status]||'',JSON.stringify({swap,spec,side,i}));
    if(spec.target?.ability==='Emergency Exit' && ref===dst && i===0) {
      assert.equal(row.zone==='active',actor.isActive && actor.hp>0,JSON.stringify({swap,spec,row}));
      assert.equal(row.hp_current,actor.hp);
    }
    if(spec.target?.item==='Ability Shield' && ref===dst && i===0) {
      assert.equal(actor.item,'');assert.equal(actor.abilityState.seek,false);
      assert(local.log.some(x=>x.includes('lost its Ability Shield because of Knock Off')));
    }
    const boosts=post.stat_boosts_stable[row.stableKey]||{};
    for(const stat of ['atk','def','spa','spd','spe'])assert.equal(boosts[stat]||0,actor.boosts[stat],JSON.stringify({swap,spec,side,i,stat}));
   }
  }
  checks++;
 } finally {battle.destroy();}
}
console.log(JSON.stringify({pin:inventory.pin,compiled_fingerprint:inventory.compiled_fingerprint,checks,status:'passed',scope:'synthetic doubles damage modifiers and selected ability stage, immunity, redirect, Trace and KO interactions; not complete game parity'}));
