const mon=(name,ability,moves,item='')=>({name,ability,moves,item,nature:'Hardy',level:50,evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0}});
const team=members=>({format:'champions',members});
const protect=()=>mon('Blastoise','Torrent',['Protect']);
const scope=boundaries=>({oracle_kind:'shared_reference',format:'gen9championsdoublescustomgame',regulation_id:null,client_version:null,boundaries});
const base=(case_id,kind,teams,expected,boundaries)=>({case_id,assertion_id:case_id+'.current-runtime.v1',kind,teams,expected,scope:scope(boundaries),seed:[3,7,11,13],initial_state:{},rng_controls:{damage:'maximum',critical_hits:false,accuracy:'forced_hit',same_seed_alignment:false},actions:[]});
const cases=[
 base('RESOURCE-STRUGGLE-CAPTURE','struggle',[team([mon('Snorlax','Immunity',['Amnesia']),protect()]),team([mon('Venusaur','Overgrow',['Swords Dance']),protect()])],{target_hp_loss:29,user_hp_loss:59,amnesia_pp_spent:0},['player slot0, no PP, target isolated to opposing slot0','ordinary physical damage and rounded maxHP recoil; no random-target claim']),
 base('REST-ELECTRIC-CAPTURE','rest',[team([mon('Snorlax','Immunity',['Rest']),protect()]),team([mon('Pincurchin','Electric Surge',['Protect']),protect()])],{hp_restored:0,asleep:false,rest_pp_spent:1},['grounded player slot0, missing20HP, ElectricTerrain admission rejection']),
 base('ENCORE-QUEUE-CAPTURE','encore',[team([mon('Whimsicott','Prankster',['Protect','Encore']),mon('Blastoise','Torrent',['Iron Defense'])]),team([mon('Arcanine','Flash Fire',['Will-O-Wisp','Flamethrower']),mon('Venusaur','Overgrow',['Amnesia'])])],{executed_move:'Will-O-Wisp',willowisp_pp_spent:2,flamethrower_pp_spent:0,lock_move:'willowisp'},['two turns, Prankster Encore before queued Flamethrower','replacement executes Will-O-Wisp and spends replacement PP']),
 base('RED-CARD-CAPTURE','redcard',[team([mon('Machamp','Guts',['Seismic Toss']),protect(),mon('Garchomp','Rough Skin',['Protect'])]),team([mon('Snorlax','Immunity',['Amnesia'],'Red Card'),protect()])],{target_hp_loss:50,item_consumed:true,attacker_active:false,replacement:'Garchomp'},['single fixed damage hit, surviving holder, exactly one legal reserve','consumption and forced replacement; no random-reserve claim']),
 base('WHITE-HERB-CAPTURE','whiteherb',[team([mon('Machamp','Guts',['Protect'],'White Herb'),protect()]),team([mon('Snorlax','Immunity',['Amnesia']),protect()])],{attack_stage:0,defense_stage:0,special_attack_stage:3,item_consumed:true},['synthetic initial atk-2 def-1 spa+3 stages','negative stages reset and positive stage retained']),
 base('DAMAGE-ROLL-CAPTURE','discrete',[team([mon('Snorlax','Immunity',['Tackle']),protect()]),team([mon('Venusaur','Overgrow',['Protect']),protect()])],Object.fromEntries([30,30,30,31,31,31,31,33,33,33,33,34,34,34,34,36].map((n,i)=>['damage_bucket_'+i,n])),['level50 Hardy zeroEV Snorlax Tackle into Venusaur','16 explicitly controlled damage draws, no critical hits; calculation API in doubles field'])
];
for(const c of cases){
 const turns=c.kind==='encore'?2:1;
 c.actions=Array.from({length:turns},(_,i)=>i+1).flatMap(turn=>['player','opponent'].flatMap(side=>[0,1].map(slot=>({turn,side,slot,move:c.kind==='struggle'&&side==='player'&&slot===0?'Struggle':c.kind==='encore'&&slot===0?(side==='player'?(turn===1?'Protect':'Encore'):(turn===1?'Will-O-Wisp':'Flamethrower')):c.teams[side==='player'?0:1].members[slot].moves[0],targetSlot:c.kind==='encore'&&side==='opponent'&&slot===0&&turn===1?1:0}))));
 if(c.kind==='struggle')c.initial_state={player_slot0_pp:{Amnesia:0},struggle_target_slot:0};
 if(c.kind==='rest')c.initial_state={player_slot0_hp_missing:20};
 if(c.kind==='whiteherb')c.initial_state={player_slot0_stages:{atk:-2,def:-1,spa:3}};
 if(c.kind==='discrete')c.actions=Array.from({length:16},(_,bucket)=>({turn:1,side:'player',slot:0,move:'Tackle',targetSlot:0,method:'calculate_damage',bucket}));
 if(c.kind==='discrete')c.rng_controls={critical_hits:false,local_draws:Array.from({length:16},(_,i)=>(i+.5)/16),reference_random16:Array.from({length:16},(_,i)=>15-i),same_seed_alignment:false};
}
// New copies prevent capture/reviewer setup from mutating the catalog.
export const caseCatalog=()=>structuredClone(cases);
export const CURRENT_REFERENCE_PIN='9b136a8c8cdb860a8ab96fa063f906604e352547';
export const CURRENT_REFERENCE_FINGERPRINT='de66162a28b270bdf17ea17a804a7ec65c6d2f286815ae17eaa3336273405f61';
