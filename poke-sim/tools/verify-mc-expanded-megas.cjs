// Independent pinned Battle engine, both sides and immediate/delayed Mega timing.
const assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),inventory=require('./audit-mc-release-inventory.cjs').audit(root);
const {Battle,Dex}=require(path.join(root,'artifacts/showdown-mc-reference/dist/sim'));
const dex=Dex.mod('champions');
const {c,set,team,opts,catalog}=require('../tests/mc_expanded_mega_tests.js');
const refTeam=t=>t.members.map(x=>({...x,species:x.name}));let checks=0;
for(const spec of catalog.candidates) {
 const source=dex.species.get(spec.name),base=dex.species.get(source.changesFrom||source.battleOnly||source.baseSpecies);
 const descriptor=c.getMcReferenceMega(spec.name);
 assert.equal(descriptor.baseSpecies,base.name);
 assert.deepEqual(JSON.parse(JSON.stringify(descriptor.megaBaseStats)),source.baseStats);
 if(!descriptor.execution_enabled)continue;
 for(const swap of [false,true])for(const delay of [false,true]) {
  const t=team(set(base.name,source.requiredItem,base.abilities['0'])),other=team(set('Snorlax','','Immunity'));
  const ref=new Battle({formatid:'gen9championsdoublescustomgame',strictChoices:true,seed:[8,3,12,7],p1:{name:'P1',team:refTeam(swap?other:t)},p2:{name:'P2',team:refTeam(swap?t:other)}});
  try {
   ref.makeChoices('team 1234','team 1234');const actor=(swap?ref.p2:ref.p1).pokemon[0];
   const local=c.simulateBattle(swap?other:t,swap?t:other,{...opts,_megaPolicyOverride:{side:swap?'opp':'player',policy:'at_turn',triggerTurn:delay?2:1}});
   assert.notEqual(local.result,'error',local.winCondition);
   for(let turn=1;turn<=2;turn++) {
    const action='move Protect'+(turn===(delay?2:1)?' mega':'')+', move Protect',idle='move Protect, move Protect';
    ref.makeChoices(swap?idle:action,swap?action:idle);
    const row=local.turnLog[turn-1].post.roster[swap?'opponent':'player'][0],label=JSON.stringify({name:source.name,swap,delay,turn});
    assert.equal(row.species,actor.species.name,label);assert.equal(row.ability,actor.getAbility().name,label);
    assert.deepEqual(Array.from(row.types),actor.getTypes(),label);assert.equal(row.hp_current,actor.hp,label);
    assert.equal(row.baseStatsLabel,Object.values(actor.species.baseStats).join('/'),label);
    assert.equal(row.calculatedStats,[actor.maxhp,...['atk','def','spa','spd','spe'].map(k=>actor.storedStats[k])].join('/'),label);
   }
   checks++;
  } finally {ref.destroy();}
 }
}
console.log(JSON.stringify({pin:inventory.pin,compiled_fingerprint:inventory.compiled_fingerprint,checks,status:'passed',scope:'exact registered form and two-turn Protect doubles Mega lifecycle; ability interactions require separate probes'}));
