// Baseline chart only: synthetic type combinations, not legality/client proof.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {LOCAL_FILES} from './bounded-runtime-capture.mjs';
const require=createRequire(import.meta.url),root=fileURLToPath(new URL('../',import.meta.url));
export const TYPES=['Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison','Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy'];
const observer='if (typeEff === 0) return 0;';
export function typeMatrix({mutateEngine=s=>s,mutateData=s=>s}={}){
 const {Dex}=require(process.env.CHAMPIONS_REFERENCE_SIM||'pokemon-showdown'),dex=Dex.mod('champions');
 assert.equal(dex.currentMod,'champions');
 assert.deepEqual(dex.types.all().filter(t=>TYPES.includes(t.name)).map(t=>t.name).sort(),[...TYPES].sort());
 const c=vm.createContext({console});
 for(const file of LOCAL_FILES){let source=fs.readFileSync(path.join(root,file),'utf8');
  if(file==='data.js')source=mutateData(source);
  if(file==='engine.js'){
   source=mutateEngine(source);assert.equal(source.split(observer).length,2,'Unique effectiveness observer required');
   source=source.replace(observer,'field._ctx.observedTypeEff = typeEff; '+observer);
  }
  vm.runInContext(source,c,{filename:file});
 }
 vm.runInContext('this.Pokemon=Pokemon;this.Field=Field;',c);
 const member={name:'Snorlax',ability:'Pressure',item:'',moves:['Tackle'],nature:'Hardy',level:50,evs:{}};
 const a=new c.Pokemon(member,'','champions'),t=new c.Pokemon(member,'','champions'),f=new c.Field();
 a.types=[];a.baseAtk=100;t.baseDef=100;f._format='doubles';f._ctx.forceNoCrit=true;
 a.side=f.playerSide;t.side=f.oppSide;a.side.activeMons=[a];t.side.activeMons=[t];
 let attackType='Normal';const resolve=c._resolveMoveModifiers;
 c._resolveMoveModifiers=(...args)=>({...resolve(...args),type:attackType});
 const targets=TYPES.map(t=>[t]);for(const first of TYPES)for(const second of TYPES)if(first!==second)targets.push([first,second]);
 const cases=[];
 for(attackType of TYPES)for(const types of targets){
  t.types=[...types];delete f._ctx.observedTypeEff;
  const damage=a.calcDamage('Tackle',t,f,null,()=>.999);
  const reference=dex.getImmunity(attackType,types)?2**dex.getEffectiveness(attackType,types):0;
  const candidate=f._ctx.observedTypeEff,shared=c.getEffectiveness(attackType,types);
  assert([0,.25,.5,1,2,4].includes(reference),'Invalid reference multiplier');
  assert(Number.isFinite(candidate)&&Number.isFinite(shared),'Missing runtime observation');
  // Level50, BP40, Attack100, Defense100, max roll, no STAB/items/abilities/weather.
  const expectedDamage=reference===0?0:Math.max(1,Math.floor(19*reference));
  cases.push({case_id:'TYPE-MATRIX-'+attackType.toUpperCase()+'-'+types.join('-').toUpperCase(),attack_type:attackType,defender_types:types,reference,candidate,shared,expected_damage:expectedDamage,damage});
 }
 assert.equal(cases.length,5832);assert.equal(new Set(cases.map(r=>r.case_id)).size,5832);
 return cases;
}
export const mismatches=rows=>rows.filter(r=>r.reference!==r.candidate||r.reference!==r.shared||r.expected_damage!==r.damage);
