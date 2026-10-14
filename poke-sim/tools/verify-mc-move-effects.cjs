// Explicit local oracle gate; requires the retained, hash-verified M-C pin.
const assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const inventory=require('./audit-mc-release-inventory.cjs').audit(root);
const {Battle}=require(path.join(root,'artifacts/showdown-mc-reference/dist/sim'));
const {run}=require('../tests/mc_move_effects_tests.js');
const mon=(species,moves)=>({species,moves,ability:'No Guard',item:'',nature:'Hardy',level:50,evs:{}});
let checked=0;
for(const swap of [false,true]) for(const spec of [
  {move:'Make It Rain',protects:0},{move:'Make It Rain',protects:1},{move:'Make It Rain',protects:2},
  {move:'First Impression',delay:false},{move:'First Impression',delay:true},
  {move:'Apple Acid',targetStage:'spd'},{move:'Fire Lash',targetStage:'def'},
  {move:'Grav Apple',targetStage:'def'},{move:'Growth',selfStage:'atk'},
  {move:'Snipe Shot',redirect:true}
]) {
  const source=[mon('Gholdengo',[spec.move,'Splash']),mon('Pikachu',['Splash']),mon('Gengar',['Splash']),mon('Charizard',['Splash'])];
  const target=[mon('Blissey',[spec.protects>0?'Protect':'Splash']),mon('Snorlax',[spec.protects>1?'Protect':'Splash']),mon('Chansey',['Splash']),mon('Vaporeon',['Splash'])];
  if(spec.redirect) target[1].moves=['Follow Me'];
  const battle=new Battle({formatid:'gen9championsdoublescustomgame',seed:[8,3,12,7],strictChoices:true,
    p1:{name:'Player',team:swap?target:source},p2:{name:'Opponent',team:swap?source:target}});
  try {
    battle.makeChoices('team 1234','team 1234');
    const sourceSide=swap?battle.p2:battle.p1,targetSide=swap?battle.p1:battle.p2;
    const before=targetSide.pokemon[0].hp;
    const turns=spec.delay?2:1;
    for(let turn=0;turn<turns;turn++) {
      const move=spec.delay&&turn===0?'Splash':spec.move;
      const command=`move ${move}${['Make It Rain','Splash','Growth'].includes(move)?'':' 1'}, move Splash`;
      const reply=`move ${spec.protects>0?'Protect':'Splash'}, move ${spec.redirect?'Follow Me':spec.protects>1?'Protect':'Splash'}`;
      if(spec.delay && turn===1) {
        assert.throws(()=>battle.makeChoices(swap?reply:command,swap?command:reply),/First Impression is disabled/);
        break; // Reference rejects late selection; local forced-action check is separate.
      }
      battle.makeChoices(swap?reply:command,swap?command:reply);
    }
    const local=run(spec.move,{...spec,swap,turns});
    const side=swap?'opponent':'player',other=swap?'player':'opponent';
    const post=local.turnLog.at(-1).post,actor=post.roster[side][0];
    assert.equal(actor.hp_max,sourceSide.pokemon[0].maxhp,'matching actor stats');
    if(spec.move==='Make It Rain') {
      assert.equal((post.stat_boosts_stable[actor.stableKey]||{}).spa||0,sourceSide.pokemon[0].boosts.spa);
    } else if(spec.targetStage) {
      const recipient=post.roster[other][0];
      assert.equal((post.stat_boosts_stable[recipient.stableKey]||{})[spec.targetStage]||0,targetSide.pokemon[0].boosts[spec.targetStage]);
    } else if(spec.selfStage) {
      assert.equal((post.stat_boosts_stable[actor.stableKey]||{})[spec.selfStage]||0,sourceSide.pokemon[0].boosts[spec.selfStage]);
    } else {
      const hit=local.turnLog.at(-1).damage_events.some(e=>e.attacker==='Gholdengo');
      assert.equal(hit,targetSide.pokemon[0].hp<before);
    }
    checked++;
  } finally {battle.destroy();}
}
console.log(JSON.stringify({pin:inventory.pin,compiled_fingerprint:inventory.compiled_fingerprint,
  checks:checked,status:'passed',scope:'synthetic doubles stat-drop, first-turn success and late-selection rejection; local forced late failure is separate, not Encore parity or legal-team validation'}));
