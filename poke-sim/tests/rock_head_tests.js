const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const c = vm.createContext({console, Math, window:{}});
for (const f of ['data.js','generated/pokemon_showdown_legal_data.js','runtime_data.js','engine.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),c);
const team = (name, ability, moves) => ({format:'sv',members:[{name,ability,moves,item:'',nature:'Hardy',evs:{}}]});
for (const move of ['Flare Blitz','Head Smash','Double-Edge','Struggle']) {
  for (const ability of ['Rock Head','Intimidate']) test(move+' with '+ability,()=>{
    const b=c.simulateBattle(team('Arcanine-Hisui',ability,[move]),team('Blissey','Natural Cure',['Splash']),{format:'singles',seed:[8,3,12,7],maxTurns:1});
    assert.ok(b.turnLog[0].damage_events.some(e=>e.move===move),'attack must connect');
    const recoil=b.turnLog[0].effect_events.filter(e=>e.effect_kind==='recoil');
    assert.equal(recoil.length>0,ability!=='Rock Head'||move==='Struggle');
  });
}
test('matchup matrix headings describe rendered values',()=>{
  const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
  assert.ok(html.includes('<th>Opponent</th><th>Win%</th><th>W</th><th>L</th><th>Avg Turns</th><th>Avg TR Turns</th><th>Assessment</th>'));
});
test('Rock Head retains contact damage from Rough Skin',()=>{
  const b=c.simulateBattle(team('Arcanine-Hisui','Rock Head',['Flare Blitz']),team('Garchomp','Rough Skin',['Splash']),{format:'singles',seed:[8,3,12,7],maxTurns:1});
  const t=b.turnLog[0], p=t.pre.roster.player[0], after=t.post.roster.player[0];
  assert.equal(p.hp_current-after.hp_current,Math.max(1,Math.floor(p.hp_max/8)));
  assert.equal(t.effect_events.filter(e=>e.effect_kind==='recoil').length,0);
});
test('Rock Head overkill preserves attacker HP',()=>{
  const defender=team('Blissey','Natural Cure',['Splash']);
  defender.members[0].currentHp=1;
  const b=c.simulateBattle(team('Arcanine-Hisui','Rock Head',['Head Smash']),defender,{format:'singles',seed:[8,3,12,7],maxTurns:1});
  const t=b.turnLog[0];
  assert.equal(t.damage_events[0].applied_damage,1);
  assert.equal(t.post.roster.player[0].hp_current,t.pre.roster.player[0].hp_current);
  assert.equal(t.effect_events.filter(e=>e.effect_kind==='recoil').length,0);
});
for (const side of ['player','opponent']) for (const move of ['Flare Blitz','Head Smash']) for (const ability of ['Rock Head','Intimidate']) test(`doubles ${side} ${move} ${ability} exact HP`,()=>{
  const a=team('Arcanine-Hisui',ability,[move]);
  a.members.push({...a.members[0],name:'Blissey',ability:'Natural Cure',moves:['Splash']});
  const d=team('Snorlax','Immunity',['Splash']);
  d.members.push({...d.members[0],name:'Charizard',ability:'Blaze'});
  const b=c.simulateBattle(side==='player'?a:d,side==='player'?d:a,{format:'doubles',seed:[8,3,12,7],maxTurns:1,
    forcedActions:[{turn:1,side,slot:0,move,targetSide:'enemy',targetSlot:0}]});
  const t=b.turnLog[0], hit=t.damage_events.find(e=>e.attacker==='Arcanine-Hisui');
  assert.ok(hit && hit.applied_damage>0);
  const effects=t.effect_events.filter(e=>e.effect_kind==='recoil' && e.actor_key===hit.attacker_key);
  const before=t.pre.roster[side].find(e=>e.stableKey===hit.attacker_key);
  const after=t.post.roster[side].find(e=>e.stableKey===hit.attacker_key);
  const expected=ability==='Rock Head'?0:Math.floor(hit.applied_damage*(move==='Head Smash'?0.5:0.33)+0.5);
  assert.equal(before.hp_current-after.hp_current,expected);
  assert.equal(effects.length,ability==='Rock Head'?0:1);
  if(effects.length) assert.equal(effects[0].hp_delta,-expected);
});
