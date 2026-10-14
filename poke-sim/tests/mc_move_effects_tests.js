// Synthetic M-C reference-context probes. Team admission is deliberately mocked;
// these are effect regressions, never legal-team or package-approval evidence.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const c = vm.createContext({console, Math, window:{}});
for(const file of ['data.js','generated/pokemon_showdown_legal_data.js','generated/champions_move_overrides.js',
  'runtime_data.js','mc_review.js','generated/mc_review_reference.js','engine.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),c);
}
vm.runInContext('this.Pokemon=Pokemon;this.Field=Field;',c);
c.checkMcReferenceExecution = () => ({allowed:true,source_gaps:['synthetic mechanics fixture']});
const mon=(name,moves,ability='No Guard')=>({name,moves,ability,item:'',nature:'Hardy',evs:{}});
const team=members=>({name:'Synthetic effect probe',format:'champions',members});
let count=0;
function check(name,fn){fn();count++;console.log('PASS '+name);}
function run(move,{swap=false,protects=0,turns=1,delay=false,redirect=false,sourceAbility='No Guard',targetAbility='No Guard',targetItem='',targetMove=null,targetName='Blissey',sourceName='Gholdengo',seed=[8,3,12,7]}={}) {
  const src=team([mon(sourceName,[move,'Splash']),mon('Pikachu',['Splash']),mon('Gengar',['Splash']),mon('Charizard',['Splash'])]);
  const dst=team([mon(targetName,[protects>0?'Protect':'Splash']),mon('Snorlax',[protects>1?'Protect':'Splash']),mon('Chansey',['Splash']),mon('Vaporeon',['Splash'])]);
  src.members[0].ability=sourceAbility;
  dst.members[0].ability=targetAbility;dst.members[0].item=targetItem;
  if(targetMove) dst.members[0].moves=[targetMove];
  if(redirect) dst.members[1].moves=['Follow Me'];
  const side=swap?'opponent':'player',other=swap?'player':'opponent';
  return c.simulateBattle(swap?dst:src,swap?src:dst,{rulesetId:'champions_mc_reference',format:'doubles',
    seed,maxTurns:turns,forcedActions:Array.from({length:turns},(_,i)=>[
      {turn:i+1,side,slot:0,move:delay&&i===0?'Splash':move,targetSlot:0},
      {turn:i+1,side,slot:1,move:'Splash'},
      {turn:i+1,side:other,slot:0,move:targetMove || (protects>0?'Protect':'Splash')},
      {turn:i+1,side:other,slot:1,move:redirect?'Follow Me':protects>1?'Protect':'Splash'}]).flat()});
}
for(const swap of [false,true]) {
  for(const protects of [0,1,2]) check(`Make It Rain drops once, swap=${swap}, protects=${protects}`,()=>{
    const r=run('Make It Rain',{swap,protects}),side=swap?'opponent':'player';
    const actor=r.turnLog[0].post.roster[side][0];
    assert.equal((r.turnLog[0].post.stat_boosts_stable[actor.stableKey] || {}).spa || 0,protects===2?0:-2);
  });
  check(`First Impression fails after the first active turn, swap=${swap}`,()=>{
    const r=run('First Impression',{swap,turns:2,delay:true});
    assert.equal(r.turnLog[1].damage_events.filter(e=>e.attacker==='Gholdengo').length,0);
    assert.ok(r.log.some(line=>line.includes('First Impression')&&line.includes('failed')));
  });
  check(`First Impression works on the first active turn, swap=${swap}`,()=>{
    assert.ok(run('First Impression',{swap}).turnLog[0].damage_events.some(e=>e.attacker==='Gholdengo'));
  });
}
for(const status of [null,'burn','paralysis','poison','toxic','sleep','freeze']) check('Infernal Parade power, status='+status,()=>{
  const source=new c.Pokemon(mon('Gholdengo',['Infernal Parade']),'','champions','champions_mc_reference');
  const target=new c.Pokemon(mon('Vaporeon',['Splash']),'','champions','champions_mc_reference');
  target.status=status;
  const field=new c.Field();field._ctx.captureDamageCalc=true;field._ctx.forceNoCrit=true;
  source.calcDamage('Infernal Parade',target,field,null,()=>.5);
  assert.equal(field._ctx.lastDamageCalc.base_power_modified,status?130:65);
});
for(const [move,stat] of [['Apple Acid','spd'],['Fire Lash','def'],['Grav Apple','def']]) {
  for(const ability of ['', 'Clear Body', 'Contrary', 'Shield Dust']) check(move+' target effect '+ability,()=>{
    const source=new c.Pokemon(mon('Gholdengo',[move]),'','champions','champions_mc_reference');
    const target=new c.Pokemon(mon('Vaporeon',['Splash'],ability),'','champions','champions_mc_reference');
    c._applyDamagingMoveSecondary(source,move,target,new c.Field(),[],()=>0);
    assert.equal(target.statBoosts[stat]||0,ability==='Contrary'?1:ability===''?-1:0);
  });
}
check('Growth boosts both attack stats in a real action',()=>{
  const r=run('Growth'),actor=r.turnLog[0].post.roster.player[0];
  assert.equal((r.turnLog[0].post.stat_boosts_stable[actor.stableKey]||{}).atk,1);
  assert.equal((r.turnLog[0].post.stat_boosts_stable[actor.stableKey]||{}).spa,1);
});
for(const swap of [false,true]) check('Snipe Shot bypasses Follow Me, swap='+swap,()=>{
  const r=run('Snipe Shot',{swap,redirect:true});
  assert.ok(r.turnLog[0].damage_events.some(e=>e.attacker==='Gholdengo'&&e.target==='Blissey'));
  assert.equal(r.turnLog[0].damage_events.filter(e=>e.attacker==='Gholdengo'&&e.target==='Snorlax').length,0);
});
for(const ability of ['Simple','Contrary']) check('Make It Rain handles '+ability,()=>{
  const r=run('Make It Rain',{sourceAbility:ability});
  const actor=r.turnLog[0].post.roster.player[0];
  assert.equal(r.turnLog[0].post.stat_boosts_stable[actor.stableKey].spa,ability==='Simple'?-4:2);
});

for(const ability of ['No Guard','Mold Breaker']) check('Infernal Parade doubles against unignorable Comatose, source='+ability,()=>{
  const source=new c.Pokemon(mon('Gholdengo',['Infernal Parade'],ability),'','champions','champions_mc_reference');
  const target=new c.Pokemon(mon('Vaporeon',['Splash'],'Comatose'),'','champions','champions_mc_reference');
  const field=new c.Field();field._ctx.captureDamageCalc=true;field._ctx.forceNoCrit=true;
  source.calcDamage('Infernal Parade',target,field,null,()=>.5);
  assert.equal(field._ctx.lastDamageCalc.base_power_modified,130);
});
for(const ability of ['Drought','Cloud Nine']) check('Growth weather boundary '+ability,()=>{
  const r=run('Growth',{sourceAbility:'Drought',targetAbility:ability});
  const actor=r.turnLog[0].post.roster.player[0],boosts=r.turnLog[0].post.stat_boosts_stable[actor.stableKey];
  assert.equal(boosts.atk,ability==='Cloud Nine'?1:2);assert.equal(boosts.spa,boosts.atk);
});
// A fixed seed search is deterministic and asserts actual action denial, then
// repeats the same seed with each blocker to isolate the guarded secondary.
let flinchSeed;
for(let n=1;n<=40;n++) {
  const seed=[n*15485863,32452843,49979687,67867967],r=run('Mountain Gale',{seed,targetName:'Vaporeon'});
  if(r.log.some(line=>line.includes('Vaporeon flinched'))) {flinchSeed=seed;break;}
}
check('Mountain Gale applies flinch and denies the target action',()=>{
  assert.ok(flinchSeed);
  const r=run('Mountain Gale',{seed:flinchSeed,targetName:'Vaporeon'});
  assert.ok(r.log.includes("Vaporeon flinched and couldn't move!"));
  assert.ok(!r.log.includes('Vaporeon used Splash!'));
});
for(const opts of [{targetAbility:'Inner Focus'},{targetAbility:'Shield Dust'},{targetItem:'Covert Cloak'},{sourceAbility:'Sheer Force'}]) check('Mountain Gale guarded secondary '+JSON.stringify(opts),()=>{
  const r=run('Mountain Gale',{seed:flinchSeed,targetName:'Vaporeon',...opts});
  assert.ok(!r.log.some(line=>line.includes('Vaporeon flinched')));
});
for(const move of ['Apple Acid','Fire Lash','Grav Apple']) for(const opts of [{targetItem:'Covert Cloak'},{sourceAbility:'Sheer Force'}]) check(move+' real action secondary boundary '+JSON.stringify(opts),()=>{
  const r=run(move,opts),recipient=r.turnLog[0].post.roster.opponent[0];
  const boosts=r.turnLog[0].post.stat_boosts_stable[recipient.stableKey]||{};
  assert.equal(boosts[move==='Apple Acid'?'spd':'def']||0,0);
});
check('First Impression becomes selectable again on fresh entry; sole disabled move yields Struggle',()=>{
  const source=fs.readFileSync(path.join(__dirname,'..','engine.js'),'utf8');
  const start=source.indexOf('  function selectMove('),end=source.indexOf('  // EXECUTE ACTION',start);
  vm.runInContext(source.slice(start,end)+'\nthis.choose=selectMove;',c);c.rng=()=>.5;
  const actor=new c.Pokemon(mon('Gholdengo',['First Impression']),'','champions','champions_mc_reference');
  const target=new c.Pokemon(mon('Blissey',['Splash']),'','champions','champions_mc_reference'),field=new c.Field();
  actor.side=field.playerSide;target.side=field.oppSide;
  actor.turnsSinceEntry=2;assert.equal(c.choose(actor,[actor],[target],field).move,'Struggle');
  actor.moves.push('Splash');actor.movePP.Splash={current:10,max:10};field.playerSide.imprisonedMoves=new Set(['Splash']);
  assert.equal(c.choose(actor,[actor],[target],field).move,'Struggle','disabled First Impression plus imprisoned alternative');
  actor.moves=['First Impression'];field.playerSide.imprisonedMoves=null;
  actor.turnsSinceEntry=1;assert.equal(c.choose(actor,[actor],[target],field).move,'First Impression');
});
console.log(`${count} M-C effect regression checks passed.`);

module.exports = {run, c};



