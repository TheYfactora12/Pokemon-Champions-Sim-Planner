// Strict pinned synthetic doubles lifecycle comparisons, not official game evidence.
const assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),inventory=require('./audit-mc-release-inventory.cjs').audit(root);
const {Battle}=require(path.join(root,'artifacts/showdown-mc-reference/dist/sim'));
const {c,cases,set,team,opts}=require('../tests/mc_mega_lifecycle_tests.js');
const refTeam=t=>t.members.map(x=>({...x,species:x.name}));let checks=0;
for(const spec of cases)for(const swap of [false,true])for(const delay of [false,true]){
 const t=team(set(spec.base,spec.stone,spec.before)),other=team(set('Snorlax','','Immunity'));
 const ref=new Battle({formatid:'gen9championsdoublescustomgame',strictChoices:true,seed:[8,3,12,7],p1:{name:'P1',team:refTeam(swap?other:t)},p2:{name:'P2',team:refTeam(swap?t:other)}});
 try{
  ref.makeChoices('team 1234','team 1234');const actor=(swap?ref.p2:ref.p1).pokemon[0];
  const local=c.simulateBattle(swap?other:t,swap?t:other,{...opts,_megaPolicyOverride:{side:swap?'opp':'player',policy:'at_turn',triggerTurn:delay?2:1}});
  for(let turn=1;turn<=2;turn++){
   const action='move Protect'+(turn===(delay?2:1)?' mega':'')+', move Protect',idle='move Protect, move Protect';ref.makeChoices(swap?idle:action,swap?action:idle);
   const row=local.turnLog[turn-1].post.roster[swap?'opponent':'player'][0];
   assert.equal(row.species,actor.species.name);assert.equal(row.ability,actor.getAbility().name);assert.deepEqual(Array.from(row.types),actor.getTypes());assert.equal(row.hp_current,actor.hp);
   assert.equal(row.baseStatsLabel,Object.values(actor.species.baseStats).join('/'));
   assert.equal(row.calculatedStats,[actor.maxhp,...['atk','def','spa','spd','spe'].map(k=>actor.storedStats[k])].join('/'));
  }checks++;
 }finally{ref.destroy();}
}
for(const swap of [false,true])for(const kind of ['aerilate-ghost','no-guard-source','no-guard-target','ordinary-miss']){
 const spec=cases[kind==='aerilate-ghost'?1:0],mega=kind!=='ordinary-miss';
 const a=set(spec.base,mega?spec.stone:'',spec.before,[kind==='aerilate-ghost'?'Tackle':kind==='no-guard-target'?'Splash':'Iron Tail']);
 const b=set(kind==='aerilate-ghost'?'Gengar':'Snorlax','',kind==='aerilate-ghost'?'Cursed Body':'Immunity',[kind==='no-guard-target'?'Iron Tail':'Splash']);
 const t=team(a),other=team(b);t.members[1].moves=['Splash'];other.members[1].moves=['Splash'];
 const ref=new Battle({formatid:'gen9championsdoublescustomgame',strictChoices:true,seed:[8,3,12,7],p1:{name:'P1',team:refTeam(swap?other:t)},p2:{name:'P2',team:refTeam(swap?t:other)}});
 try{ref.makeChoices('team 1234','team 1234');const actor=(swap?ref.p2:ref.p1).pokemon[0],target=(swap?ref.p1:ref.p2).pokemon[0];const before=(kind==='no-guard-target'?actor:target).hp;
  // All sub-100% accuracy rolls fail: No Guard bypass and conversion immunity remain decisive.
  ref.randomChance=(numerator,denominator)=>numerator>=denominator;
  const action='move '+a.moves[0]+(a.moves[0]==='Splash'?'':' 1')+(mega?' mega':'')+', move Splash';
  const reply='move '+b.moves[0]+(b.moves[0]==='Splash'?'':' 1')+', move Splash';ref.makeChoices(swap?reply:action,swap?action:reply);
  const hit=(kind==='no-guard-target'?actor:target).hp<before;assert.equal(hit,kind!=='ordinary-miss',JSON.stringify({swap,kind,log:ref.log}));
  const lp=new c.Pokemon(a,'','champions',opts.rulesetId),lt=new c.Pokemon(b,'','champions',opts.rulesetId);if(mega)lp.megaEvolve([]);
  const local=kind==='aerilate-ghost'?lp.calcDamage('Tackle',lt,new c.Field(),null,()=>.5)>0:kind==='no-guard-target'?c._moveHits(lt,lp,'Iron Tail',new c.Field(),()=>.99):c._moveHits(lp,lt,'Iron Tail',new c.Field(),()=>.99);
  assert.equal(local,hit);checks++;
 }finally{ref.destroy();}
}
console.log(JSON.stringify({pin:inventory.pin,compiled_fingerprint:inventory.compiled_fingerprint,checks,status:'passed',scope:'synthetic doubles Mega transitions, stat/type/ability identity and selected ability boundaries; not complete game parity'}));
