const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const c=vm.createContext({console,Math,window:{}}),root=path.join(__dirname,'..');
for(const f of ['data.js','generated/pokemon_showdown_legal_data.js','runtime_data.js','move_legality.js','generated/mc_review_reference.js','mc_review.js','legality.js','rulesets.js','engine.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);
c.ChampionsSim.pokemonDataAudit=require('../generated/pokemon_showdown_legal_data.js');vm.runInContext('this.Pokemon=Pokemon;this.Field=Field;',c);
const set=(name,item='',ability='Pressure',moves=['Protect'])=>({name,item,ability,moves,nature:'Hardy',level:50,evs:{}});
const cases=[{base:'Raichu',mega:'Raichu-Mega-Y',stone:'Raichunite Y',before:'Static',after:'No Guard',stats:{hp:60,atk:100,def:55,spa:160,spd:80,spe:130},types:['Electric'],weight:26},{base:'Salamence',mega:'Salamence-Mega',stone:'Salamencite',before:'Intimidate',after:'Aerilate',stats:{hp:95,atk:145,def:130,spa:120,spd:90,spe:120},types:['Dragon','Flying'],weight:112.6}];
const team=actor=>({name:'Synthetic lifecycle fixture',format:'champions',members:[actor,set('Farigiraf','','Armor Tail'),set('Vaporeon','','Water Absorb'),set('Charizard','','Blaze')]});
const opts={rulesetId:'champions_mc_reference',format:'doubles',bo:1,seed:[8,3,12,7],maxTurns:2};
let checks=0;function test(name,fn){fn();checks++;console.log('PASS '+name);}
for(const spec of cases){
 for(const name of [spec.base,spec.mega,spec.mega.toLowerCase().replaceAll('-','')])test(name+' registration/transition isolation',()=>{
  const input=set(name,spec.stone,name===spec.base?spec.before:spec.after),snapshot=JSON.stringify(input),p=new c.Pokemon(input,'','champions',opts.rulesetId);
  assert.equal(c.checkMcReferenceExecution(team(input),opts).allowed,true,JSON.stringify(c.checkMcReferenceExecution(team(input),opts).errors));assert.equal(p.name,spec.base);assert.equal(p.ability,spec.before);p.hp-=17;const hp=p.hp;
  assert.equal(p.megaEvolve([]),true);assert.equal(p.hp,hp);assert.equal(p.name,spec.mega);assert.equal(p.ability,spec.after);assert.equal(p.weightkg,spec.weight);
  for(const key of Object.keys(spec.stats))assert.equal(p._base[key],spec.stats[key]);assert.deepEqual(Array.from(p.types),spec.types);assert.equal(p.megaEvolve([]),false);assert.equal(JSON.stringify(input),snapshot);
  assert.equal(c.CHAMPIONS_MEGAS[spec.mega],undefined);assert.equal(new c.Pokemon(input,'','champions').megaForm,null);
 });
 test(spec.mega+' wrong stone rejected',()=>assert.equal(c.checkMcReferenceExecution(team(set(spec.mega,'Magnet',spec.after)),opts).allowed,false));
 for(const swap of [false,true])test(spec.mega+' delayed actual doubles '+swap,()=>{
  const t=team(set(spec.base,spec.stone,spec.before)),other=team(set('Snorlax','','Immunity')),side=swap?'opponent':'player',snapshot=JSON.stringify(t);
  const r=c.simulateBattle(swap?other:t,swap?t:other,{...opts,_megaPolicyOverride:{side:swap?'opp':'player',policy:'at_turn',triggerTurn:2}});
  assert.notEqual(r.result,'error',r.winCondition);assert.equal(r.turnLog[0].post.roster[side][0].ability,spec.before);assert.equal(r.turnLog[1].post.roster[side][0].ability,spec.after);
  assert.equal(r.log.filter(x=>x.includes('Mega Evolved')).length,1);assert.equal(JSON.stringify(t),snapshot);
 });
}
test('one Mega per side and stable registration with both candidates',()=>{
 const t=team(set('Raichu','Raichunite Y','Static'));t.members[1]=set('Salamence','Salamencite','Intimidate');const r=c.simulateBattle(t,t,opts);assert.notEqual(r.result,'error');assert.equal(r.log.filter(x=>x.includes('Mega Evolved')).length,2);
 for(const side of ['player','opponent'])assert.equal(r.turnLog[1].post.roster[side].filter(x=>x.species&&x.species.includes('Mega')).length,1);
});
test('Aerilate converts Normal against Ghost after evolution',()=>{
 const p=new c.Pokemon(set('Salamence','Salamencite','Intimidate'),'','champions',opts.rulesetId),ghost=new c.Pokemon(set('Gengar','','Cursed Body'),'','champions'),f=new c.Field();
 assert.equal(p.calcDamage('Tackle',ghost,f,null,()=>.5),0);p.megaEvolve([]);assert.ok(p.calcDamage('Tackle',ghost,f,null,()=>.5)>0);
 const mod=c.ABILITIES.Aerilate.onModifyMove({attacker:p,move:'Tackle'});assert.equal(mod.typeOverride,'Flying');assert.equal(mod.bpMult,1.2);
});
test('No Guard applies as attacker and target only after evolution',()=>{
 const p=new c.Pokemon(set('Raichu','Raichunite Y','Static'),'','champions',opts.rulesetId),q=new c.Pokemon(set('Snorlax','','Immunity'),'','champions'),f=new c.Field();
 assert.equal(c._moveHits(p,q,'Iron Tail',f,()=>.99),false);assert.equal(c._moveHits(q,p,'Iron Tail',f,()=>.99),false);p.megaEvolve([]);
 assert.equal(c._moveHits(p,q,'Iron Tail',f,()=>.99),true);assert.equal(c._moveHits(q,p,'Iron Tail',f,()=>.99),true);
});
console.log(checks+' scoped Mega lifecycle checks passed');module.exports={c,cases,set,team,opts};
