const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ctx = vm.createContext({console, Math, window:{}});
const root = path.resolve(__dirname,'..');
for (const file of ['data.js','engine.js']) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const mon = (item, ability = '', side = 'player') => ({name:'Seed holder',item,ability,alive:true,hp:100,maxHp:100,itemConsumed:false,side,
  statBoosts:{atk:0,def:0,spa:0,spd:0,spe:0,acc:0,eva:0}});
const field = (a,b) => ({terrain:'none',terrainTurns:0,playerSide:{activeMons:a},oppSide:{activeMons:b},_ctx:{turnEffectEvents:[]}});
let passed=0, failed=0;
function test(name,fn) { try { fn(); passed++; console.log('PASS '+name); } catch(e) { failed++; console.error('FAIL '+name+': '+e.message); } }
for (const [ability,item,terrain,stat] of [
  ['Electric Surge','Electric Seed','electric','def'],['Grassy Surge','Grassy Seed','grassy','def'],
  ['Misty Surge','Misty Seed','misty','spd'],['Psychic Surge','Psychic Seed','psychic','spd']
]) test(ability+' dispatches to both active sides, not bench or fainted',()=>{
  const a=mon(item),b=mon(item,'','opponent'),dead=mon(item); dead.alive=false;
  const bench=mon(item), setter=mon('',ability), f=field([a,setter],[b,dead]); f.playerSide.bench=[bench];
  assert.equal(ctx.applyTerrainAbility(setter,f,[]),true);
  assert.equal(f.terrain,terrain);
  for(const p of [a,b]) { assert.equal(p.statBoosts[stat],1); assert.equal(p.itemConsumed,true); }
  assert.equal(dead.itemConsumed,false); assert.equal(bench.itemConsumed,false);
  ctx.applyTerrainAbility(setter,f,[]); assert.equal(a.statBoosts[stat],1);
});
test('Seed Sower dispatches to an already-active opposing holder',()=>{
  const p=mon('Grassy Seed','','opponent'),sower=mon('','Seed Sower'),f=field([sower],[p]);
  ctx.applySeedSowerOnHit(sower,f,[]);
  assert.equal(p.statBoosts.def,1); assert.equal(p.itemConsumed,true);
});
test('capped Defense still consumes without falsely claiming a raise',()=>{
  const p=mon('Electric Seed'),f=field([p],[]),log=[]; f.terrain='electric';p.statBoosts.def=6;
  assert.equal(ctx.tryTerrainSeed(p,f,log),true);
  assert.equal(p.statBoosts.def,6);assert.equal(p.itemConsumed,true);
  assert.ok(!log.some(s=>/raised|rose/i.test(s)));
  assert.ok(log.some(s=>/consumed/i.test(s)));
});
test('Klutz retains the seed',()=>{
  const p=mon('Electric Seed','Klutz'),f=field([p],[]);f.terrain='electric';
  assert.equal(ctx.tryTerrainSeed(p,f,[]),false);assert.equal(p.itemConsumed,false);assert.equal(p.statBoosts.def,0);
});
test('zero HP before faint finalization retains seed while survivor activates',()=>{
  const victim=mon('Grassy Seed','Seed Sower'),survivor=mon('Grassy Seed'),f=field([victim],[survivor]);
  victim.hp=0;
  ctx.applySeedSowerOnHit(victim,f,[]);
  assert.equal(f.terrain,'grassy');assert.equal(victim.itemConsumed,false);
  assert.equal(victim.statBoosts.def,0);assert.equal(survivor.itemConsumed,true);
});
for(const [ability,delta] of [['Simple',2],['Contrary',-1]]) test(ability+' uses the shared stage rules',()=>{
  const p=mon('Electric Seed',ability),f=field([p],[]);f.terrain='electric';
  ctx.tryTerrainSeed(p,f,[]);assert.equal(p.statBoosts.def,delta);assert.equal(p.itemConsumed,true);
});
test('later holder entry activates against existing terrain',()=>{
  const p=mon('Electric Seed'),f=field([p],[]);f.terrain='electric';
  ctx.tryTerrainSeed(p,f,[]);assert.equal(p.statBoosts.def,1);
});
test('actual doubles entry covers holder before/after setter and opposite sides',()=>{
  const member=(name,ability,item='')=>({name,ability,item,nature:'Hardy',moves:['Splash'],evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0}});
  const team=members=>({name:'synthetic-entry',format:'sv',members});
  for(let seed=1;seed<=5;seed++) for(const opposite of [false,true]) for(const reverse of [false,true]) {
    const holder=member('Sneasler','Unburden','Electric Seed'),setter=member('Pikachu','Electric Surge');
    const filler=()=>member('Blissey','Natural Cure');
    let a=opposite?[holder,filler()]:[holder,setter],b=opposite?[setter,filler()]:[filler(),filler()];
    if(reverse) { a=a.slice().reverse(); b=b.slice().reverse(); }
    const result=ctx.simulateBattle(team(a),team(b),{format:'doubles',seed:[seed,2,3,4],maxTurns:1});
    assert.equal(result.log.filter(s=>s.includes('Sneasler consumed its Electric Seed')).length,1);
  }
});
test('actual lethal hit sets Seed Sower terrain without consuming victim seed',()=>{
  // Synthetic species/ability pairing deliberately isolates lethal-hit timing.
  const member=(name,ability,item='',moves=['Splash'])=>({name,ability,item,moves,nature:'Modest',evs:{spa:252}});
  const team=members=>({name:'synthetic-lethal',format:'sv',members});
  const result=ctx.simulateBattle(
    team([member('Charizard','Blaze','',['Flamethrower']),member('Cresselia','Levitate','Grassy Seed')]),
    team([member('Scizor','Seed Sower','Grassy Seed'),member('Garchomp','Sand Veil')]),
    {format:'doubles',seed:[1,2,3,4],maxTurns:1,forcedActions:[{side:'player',slot:0,move:'Flamethrower',targetPokemon:'Scizor'}]});
  const post=result.turnLog[0].post;
  const victim=post.roster.opponent.find(p=>p.displayName==='Scizor');
  const survivor=post.roster.player.find(p=>p.displayName==='Cresselia');
  const defense=p=>(post.stat_boosts_stable[p.stableKey]||{}).def||0;
  assert.equal(victim.hp_current,0);assert.equal(victim.status,'fainted');
  assert.equal(post.field.terrain,'grassy');
  assert.equal(survivor.itemConsumed,true);assert.equal(defense(survivor),1);
  assert.equal(victim.itemConsumed,false);assert.equal(defense(victim),0);
  assert.ok(!result.log.some(s=>s.includes('Scizor consumed its Grassy Seed')));
});
console.log(`${passed} passed, ${failed} failed; synthetic entry/dispatch scope, not complete battle parity`);
process.exitCode=failed?1:0;
