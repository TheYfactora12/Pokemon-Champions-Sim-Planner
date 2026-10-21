import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import vm from 'node:vm';
import {loadLocalEngine, mapTeam, referenceIdentity} from '../tools/showdown-reference.mjs';
const require = createRequire(import.meta.url);
const {Battle} = require('pokemon-showdown');
const local = loadLocalEngine().context;
const format = 'gen9championsdoublescustomgame';
const seed = [3, 7, 11, 13];
referenceIdentity(); // Reject an unreviewed installed reference.
const mon = (name, ability, moves, item = '') => ({name, ability, moves, item, nature:'Hardy', level:50, evs:{hp:32,atk:0,def:0,spa:0,spd:0,spe:0}});
const team = members => ({format:'champions', members});

function probe(move, {swap=false, slot=0, variant='tag'} = {}) {
  const absorb=variant.startsWith('absorb');
  const actor = mon(move==='U-turn'?'Scizor':move==='Flip Turn'?'Floatzel':'Electrode', move==='U-turn'?'Swarm':move==='Flip Turn'?'Swift Swim':'Soundproof', [move], 'Magnet');
  if(variant.includes('break')) actor.ability='Mold Breaker';
  if(variant.includes('turboblaze')) actor.ability='Turboblaze';
  if(variant.includes('teravolt')) actor.ability='Teravolt';
  actor.evs.spe=32;
  const own = team([actor,mon('Blissey','Natural Cure',['Protect']),mon('Pikachu','Static',['Splash']),mon('Raichu','Static',['Splash'])]);
  if(variant==='entry') own.members[2].ability='Intimidate';
  if(slot) [own.members[0],own.members[1]]=[own.members[1],own.members[0]];
  const target = mon(variant==='immune'&&move==='Volt Switch'?'Garchomp':'Gothitelle',
    variant==='contact-ko'?'Rough Skin':absorb||variant==='immune'&&move==='Flip Turn'?'Water Absorb':variant==='ordinary'?'Frisk':'Shadow Tag',
    [variant==='protected'||variant==='absorb-protect'?'Protect':'Tackle'], variant.includes('shield')?'Ability Shield':'');
  const foe = team([target,mon('Snorlax','Immunity',['Protect']),mon('Venusaur','Overgrow',['Splash']),mon('Blastoise','Torrent',['Splash'])]);
  if(variant.includes('gas')) foe.members[1]=mon('Weezing','Neutralizing Gas',['Protect']);
  if(variant==='no-bench') own.members.length=2;
  const input = [swap?foe:own,swap?own:foe], before=JSON.stringify(input);
  const side=swap?'opponent':'player', refSide=swap?'p2':'p1';
  const battle = new Battle({formatid:format,seed,strictChoices:true,p1:{name:'A',team:mapTeam(input[0],'p1',format)},p2:{name:'B',team:mapTeam(input[1],'p2',format)}});
  const configure = (source, victim) => {
    if(['move-trap','spirit-trap'].includes(variant)) source.addVolatile('trapped',victim,battle.dex.moves.get(variant==='spirit-trap'?'spiritshackle':'meanlook'),'trapper');
    if(variant==='burn-status') source.setStatus('brn');
    if(absorb) victim.hp=Math.floor(victim.maxhp/2);
    if(variant.includes('consumed')) victim.setItem('');
    if(variant==='absorb-healblock') victim.addVolatile('healblock');
    if(variant==='contact-ko') source.hp=1;
    if(variant==='miss') source.boosts ? source.boosts.accuracy=-6 : source.statBoosts.acc=-6;
    if(variant==='substitute'||variant==='absorb-substitute') {
      if(victim.volatiles) victim.volatiles.substitute={id:'substitute',hp:10,target:victim};
      else victim.substituteHp=10;
    }
  };
  try {
    for(const id of ['p1','p2']) battle.choose(id,'team '+battle[id].pokemon.slice(0,4).map((_,i)=>i+1).join(''));
    const refActor=battle[refSide].active[slot],refTarget=battle[swap?'p1':'p2'].active[0];
    configure(refActor,refTarget);
    // Force the failed-accuracy boundary independently in each engine.
    // Equal seeds are not an assertion of cross-engine RNG alignment.
    if(variant==='miss') battle.randomChance=(n,d)=>n>=d;
    const commands = ['move 1','move 1']; commands[slot]='move 1 1';
    battle.choose(refSide,commands.join(', '));
    battle.choose(swap?'p1':'p2',variant==='protected'||variant==='absorb-protect'?'move 1, move 1':`move 1 ${slot+1}, move 1`);
    const sourceFainted=refActor.fainted||refActor.hp===0;
    const refPivot=!!(battle[refSide].activeRequest?.forceSwitch?.[slot]&&!sourceFainted);
    if(battle.requestState==='switch') {
      for(const id of ['p1','p2']) {
        const request=battle[id].activeRequest;
        if(request?.forceSwitch?.some(Boolean)) battle.choose(id,request.forceSwitch.map(yes=>yes?'switch 3':'pass').join(', '));
      }
    }
    const originalBuild=local.buildTeam, originalHit=local._moveHits;
    let localSource, localTarget;
    if(variant==='miss') local._moveHits=(a,...args)=>a.name===actor.name?false:originalHit(a,...args);
    local.buildTeam=function(...args) {
      const mons=originalBuild(...args);
      if(args[1]===side) {
        localSource=mons[slot];
        if(variant==='contact-ko') mons[slot].hp=1;
        if(variant==='miss') mons[slot].statBoosts.acc=-6;
        if(variant==='burn-status') mons[slot].status='burn';
      }
      else {
        localTarget=mons[0];
        if(variant==='substitute'||variant==='absorb-substitute') mons[0].substituteHp=10;
        if(absorb) mons[0].hp=Math.floor(mons[0].maxHp/2);
        if(variant.includes('consumed')) mons[0].itemConsumed=true;
        if(variant==='absorb-healblock') mons[0].healBlockedTurns=2;
      }
      if(localSource&&localTarget&&['move-trap','spirit-trap'].includes(variant)) {
        localSource.trappedByMove=variant==='spirit-trap'?'Spirit Shackle':'Mean Look';localSource.trappedByMon=localTarget;
      }
      return mons;
    };
    let result;
    try {
      result=local.simulateBattle(...input,{format:'doubles',seed,maxTurns:1,
        forcedActions:['player','opponent'].flatMap(s=>[0,1].map(i=>({
          turn:1,side:s,slot:i,move:s===side?(i===slot?move:'Protect'):(i===0?target.moves[0]:'Protect'),
          targetSide:'enemy',targetSlot:s===side?0:slot
        })))});
    } finally {local.buildTeam=originalBuild;local._moveHits=originalHit;}
    assert.notEqual(result.result,'error',result.winCondition);
    const row=result.turnLog[0], source=row.post.roster[side].find(m=>m.species===actor.name);
    const pivot=result.log.some(line=>line===`${actor.name} pivoted out!`);
    assert.equal(pivot,refPivot,JSON.stringify({move,swap,slot,variant,local:result.log,reference:battle.log}));
    assert.equal(JSON.stringify(input),before);
    assert.equal(source.stableKey,row.pre.roster[side].find(m=>m.species===actor.name).stableKey);
    assert.equal(source.item,actor.item);
    assert.equal(source.move_pp[move].current,source.move_pp[move].max-1);
    if(absorb&&!refPivot) {
      const victim=row.post.roster[swap?'player':'opponent'][0];
      assert.equal(victim.hp_current,refTarget.hp,'absorption healing/Protect/Heal Block reference');
    }
    if(pivot) {
      assert.equal(source.zone,'bench');
      const beforeSource=row.pre.roster[side].find(m=>m.species===actor.name);
      assert.equal(source.hp_current,beforeSource.hp_current,'pivot preserves outgoing HP');
      assert.equal(localSource.status,variant==='burn-status'?'burn':null,'pivot preserves outgoing ailment');
      assert.equal(refActor.status,variant==='burn-status'?'brn':'');
      assert.equal(result.log.filter(x=>x==='Pikachu was sent out!').length,1);
      assert(!row.damage_events.some(e=>e.attacker==='Pikachu'),'incoming receives no queued move');
      assert(!result.log.some(x=>x==='Pikachu used Splash!'));
      if(variant!=='protected') assert(row.damage_events.some(e=>e.attacker===target.name&&e.target==='Pikachu'),'later attack follows vacated slot');
      if(variant==='entry') {
        const targetRow=row.post.roster[swap?'player':'opponent'][0];
        assert.equal(row.post.stat_boosts_stable[targetRow.stableKey].atk,-1,'incoming entry effect once');
        assert.equal(refTarget.boosts.atk,-1);
      }
    }
    if(variant==='contact-ko'&&move!=='Volt Switch') {assert.equal(pivot,false);assert.equal(source.hp_current,0);assert.equal(sourceFainted,true);}
    if(variant==='tag'||variant==='ordinary'||variant==='substitute') assert.equal(refPivot,true);
    if(variant==='no-bench'||variant==='protected'||variant==='immune'||variant==='miss') assert.equal(refPivot,false);
    return {result,reference:battle.log};
  } finally {battle.destroy();}
}
for(const move of ['U-turn','Flip Turn','Volt Switch']) {
  for(const swap of [false,true]) for(const slot of [0,1]) for(const variant of ['tag','ordinary'])
    test(`${move} swap=${swap} slot=${slot} ${variant}`,()=>probe(move,{swap,slot,variant}));
  for(const swap of [false,true]) for(const variant of ['protected','no-bench','substitute','contact-ko','miss','move-trap','spirit-trap','burn-status','entry'])
    test(`${move} swap=${swap} ${variant}`,()=>probe(move,{swap,variant}));
  if(move!=='U-turn') for(const swap of [false,true])
    test(`${move} immune swap=${swap}`,()=>probe(move,{swap,variant:'immune'}));
}
for(const variant of ['absorb-half','absorb-protect','absorb-substitute','absorb-healblock','absorb-gas','absorb-gas-shield','absorb-break','absorb-break-shield','absorb-break-consumed-shield','absorb-gas-consumed-shield','absorb-turboblaze','absorb-teravolt'])
  for(const swap of [false,true]) test(`Water Absorb ${variant} swap=${swap}`,()=>probe('Flip Turn',{swap,variant}));

test('unclassified switch causes retain voluntary trap gates without mutation',()=>{
  const source=fs.readFileSync(new URL('../engine.js',import.meta.url),'utf8');
  const start=source.indexOf('  function _switchOutActiveMon('),end=source.indexOf('\n  for (const m of playerActive)',start);
  const actor={alive:true},bench={alive:true},active=[actor],reserves=[bench];
  const c=vm.createContext({playerActive:active,playerBench:reserves,oppActive:[],oppBench:[],
    _isTrappedByShadowTag:()=>true,_isTrappedByMove:()=>true,
    _chooseBenchReplacement:()=>{throw Error('Blocked switch inspected replacement');}});
  vm.runInContext(source.slice(start,end)+'\nthis.attempt=_switchOutActiveMon;',c);
  for(const cause of [undefined,'voluntary','unknown']) assert.equal(c.attempt(actor,'player',{},[],{cause}),false);
  c._isTrappedByShadowTag=()=>false;
  for(const cause of [undefined,'voluntary','unknown']) assert.equal(c.attempt(actor,'player',{},[],{cause}),false);
  assert.deepEqual(active,[actor]);assert.deepEqual(reserves,[bench]);
});
