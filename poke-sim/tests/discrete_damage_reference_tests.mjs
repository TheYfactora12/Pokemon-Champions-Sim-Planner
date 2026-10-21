import assert from 'node:assert/strict';
import {test} from 'node:test';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {loadLocalEngine,mapTeam} from '../tools/showdown-reference.mjs';
const {Battle}=createRequire(import.meta.url)(process.env.CHAMPIONS_REFERENCE_SIM||'pokemon-showdown');
const current=!!process.env.CHAMPIONS_REFERENCE_SIM;
const mon=(name,ability,moves)=>({name,ability,moves,item:'',nature:'Hardy',level:50,evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0}});
const own={format:'champions',members:[mon('Snorlax','Immunity',['Tackle']),mon('Venusaur','Overgrow',['Protect']),mon('Blastoise','Torrent',['Protect']),mon('Dragonite','Inner Focus',['Protect']),mon('Garchomp','Sand Veil',['Protect']),mon('Raichu','Static',['Protect'])]};
const foe=structuredClone(own);foe.members[0]=mon('Venusaur','Overgrow',['Protect']);
const expected=[30,30,30,31,31,31,31,33,33,33,33,34,34,34,34,36];
// DAMAGE-ROLL-DISCRETE-016: independently executed9b136a8 Champions custom/M-C vectors.
// Historical npm generic format is explicitly distinct. Synthetic teams are not legality proof.
test('Champions damage has sixteen independent discrete percentage buckets',()=>{
 const c=loadLocalEngine().context,roll=r=>c.ChampionsSim.runtimeData.sampleDamageRoll({statFormat:'champions'},()=>r);
 for(let k=0;k<16;k++){assert.equal(roll((k+.5)/16),(85+k)/100);assert.equal(roll(k/16),(85+k)/100);}
 assert.equal(roll(0),.85);assert.equal(roll(1-Number.EPSILON),1);assert.equal(roll(1),1,'synthetic upper endpoint clamps; PRNG draws remain below one');
});
for(const formatid of current?['gen9championsdoublescustomgame','gen9championsvgc2026regmc']:['gen9doublescustomgame'])test(`discrete damage executed reference ${formatid}`,()=>{
 const teams=[own,foe].map((t,i)=>mapTeam(t,'p'+(i+1),'gen9championsdoublescustomgame'));
 const b=new Battle({formatid,seed:[3,7,11,13],p1:{team:teams[0]},p2:{team:teams[1]}});assert.equal(b.dex.currentMod,current?'champions':'base');b.choose('p1','team 1234');b.choose('p2','team 1234');b.randomChance=()=>false;
 const c=loadLocalEngine().context;vm.runInContext('this.Pokemon=Pokemon;this.Field=Field;',c);
 const a=new c.Pokemon(own.members[0],'','champions'),t=new c.Pokemon(foe.members[0],'','champions'),field=new c.Field();field._format='doubles';field._ctx.forceNoCrit=true;a.side=field.playerSide;t.side=field.oppSide;
 for(let k=0;k<16;k++){b.random=n=>{assert.equal(n,16);return 15-k;};assert.equal(b.randomizer(100),85+k);
 const move=b.dex.getActiveMove('tackle');move.willCrit=false;assert.equal(b.actions.getDamage(b.p1.active[0],b.p2.active[0],move),expected[k]);
 assert.equal(a.calcDamage('Tackle',t,field,null,()=>(k+.5)/16),expected[k]);}
 b.destroy();
});
