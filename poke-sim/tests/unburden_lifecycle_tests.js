const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ctx=vm.createContext({console,Math,window:{}}),root=path.resolve(__dirname,'..');
for(const f of ['data.js','engine.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
vm.runInContext('this.Pokemon=Pokemon;this.Field=Field;',ctx);
const member=(name,ability,item='',moves=['Splash'])=>({name,ability,item,moves,nature:'Hardy',evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0}});
const team=members=>({name:'synthetic-lifecycle',format:'sv',members});
let pass=0,fail=0;
function test(name,fn){try{fn();console.log('PASS '+name);pass++;}catch(e){console.error('FAIL '+name+': '+e.message);fail++;}}
test('consumption history alone is not an active Unburden boost',()=>{
 const p=new ctx.Pokemon(member('Sneasler','Unburden','Electric Seed'),'','sv'),f=new ctx.Field();
 const base=p.getStat('spe',f);p.itemConsumed=true;
 assert.equal(p.getStat('spe',f),base);
});
test('seed consumption activates Unburden while terrain expiry does not cancel it',()=>{
 const p=new ctx.Pokemon(member('Sneasler','Unburden','Electric Seed'),'','sv'),f=new ctx.Field();
 const base=p.getStat('spe',f);f.terrain='electric';ctx.tryTerrainSeed(p,f,[]);
 assert.equal(p.getStat('spe',f),2*base);f.terrain='none';assert.equal(p.getStat('spe',f),2*base);
});
test('actual pivot out and back clears Speed boost, not consumption history',()=>{
 const r=ctx.simulateBattle(team([member('Sneasler','Unburden','Electric Seed',['Teleport']),member('Blissey','Natural Cure','',['Teleport'])]),
  team([member('Pikachu','Electric Surge')]),{format:'singles',seed:[31,2,3,4],maxTurns:3});
 const post=r.turnLog[1].post;
 const p=post.roster.player.find(p=>p.displayName==='Sneasler');
 assert.equal(p.itemConsumed,true);assert.equal(p.zone,'active');
 const speed=post.speed_order_details.find(p=>p.pokemon==='Sneasler');
 assert.equal(speed.effective_speed,speed.base_speed);
});
test('Knock Off activates on actual loss; receiving an item suppresses boost',()=>{
 const p=new ctx.Pokemon(member('Sneasler','Unburden','Magnet'),'','sv'),f=new ctx.Field(),base=p.getStat('spe',f);
 ctx._applyKnockOffItemRemoval(p,[]);assert.equal(p.getStat('spe',f),2*base);
 p.item='Sitrus Berry';p.itemConsumed=false;assert.equal(p.getStat('spe',f),base);
});
test('actual Trick activates on losing an item, then clears upon regaining one',()=>{
 const r=ctx.simulateBattle(team([member('Sneasler','Unburden','Magnet')]),team([member('Gengar','Cursed Body','',['Trick'])]),
  {format:'singles',seed:[31,2,3,4],maxTurns:2,forcedActions:[1,2].map(turn=>({turn,side:'opponent',slot:0,move:'Trick'}))});
 const speeds=r.turnLog.map(t=>t.post.speed_order_details.find(p=>p.pokemon==='Sneasler'));
 assert.equal(speeds[0].effective_speed,2*speeds[0].base_speed);
 assert.equal(speeds[1].effective_speed,speeds[1].base_speed);
});
console.log(`${pass} passed, ${fail} failed`);process.exitCode=fail?1:0;
