// Offline candidate generation only. Never writes installed data, runtime or approval.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {capture} from './audit-mc-reference.mjs';
import {validateMoveRegister} from './move-register.mjs';
import {canonical} from './regulation-watch-core.mjs';
export const PIN='9b136a8c8cdb860a8ab96fa063f906604e352547';
export const FORMAT='gen9championsvgc2026regmc';
export const EXPECTED=Object.freeze({species:392,moves:537,items:166,pairs:23756});
const hash=x=>createHash('sha256').update(x).digest('hex');
const cmp=(a,b)=>a<b?-1:a>b?1:0;
export function compiledIdentity(upstream){const files=fs.readdirSync(path.join(upstream,'dist'),{recursive:true}).filter(f=>f.endsWith('.js')).sort(cmp);return Object.fromEntries(files.map(f=>[f.replaceAll('\\','/'),hash(fs.readFileSync(path.join(upstream,'dist',f)))]));}
export function verifyReference({pin,mod,formatMod,fingerprint,expectedFingerprint}){
 if(pin!==PIN)throw Error('Wrong exact candidate pin');
 if(mod!=='champions'||formatMod!=='champions')throw Error('Wrong M-C reference mod');
 if(!/^[a-f0-9]{64}$/.test(expectedFingerprint||'')||fingerprint!==expectedFingerprint)throw Error('Compiled fingerprint differs from independent expected capture');
}
export function differences(expected,actual){if(new Set(expected).size!==expected.length||new Set(actual).size!==actual.length)throw Error('Duplicate inventory identity');const a=new Set(expected),b=new Set(actual);return {missing:expected.filter(x=>!b.has(x)).sort(cmp),extra:actual.filter(x=>!a.has(x)).sort(cmp)};}
export function csv(rows){const fields=[...new Set(rows.flatMap(row=>Object.keys(row)))].sort(cmp);const cell=v=>{let s=typeof v==='object'?JSON.stringify(v):String(v??'');if(/^[\s]*[=+@-]|^[\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};return fields.map(cell).join(',')+'\n'+rows.map(row=>fields.map(f=>cell(row[f])).join(',')).join('\n')+'\n';}
export function verifyPrevious(old){
 if(old.schema_version!=='champions-move-register-v1'||!Array.isArray(old.species_move_pairs)||!old.identity)throw Error('Explicit previous register required');
 const {identity,generator_sha256,...data}=old;
 if(identity!==hash(canonical({data,generator:generator_sha256})))throw Error('Previous register content identity mismatch');
 const legacy308=identity==='d2dab94398d97af9886f9cb266dc702612ba2ddd69b1314d543ff0699a9390d6';
 const historical=legacy308||identity==='d2bede6c1bb34a1bb6b2bdc18f8796b49a8dfd5af71505724af31397850b43ab';
 const errors=validateMoveRegister(old,historical?{historical:true}:{});
 // The exact 308 snapshot predates even the later historical consistency schema.
 // Its content digest and comparison joins below are checked, not provenance-v2.
 if(errors.length&&!legacy308)throw Error('Previous register validation: '+errors.join('; '));
 const moves=new Set(old.moves.map(m=>m.move_id)),species=new Set(old.evidence.find(e=>e.evidence_id==='baseline')?.species_ids||[]),ids=new Set();
 for(const pair of old.species_move_pairs){if(ids.has(pair.pair_id)||pair.pair_id!==pair.species_id+':'+pair.move_id||!moves.has(pair.move_id)||(!legacy308&&!species.has(pair.species_id))||!/^[-a-z0-9]+$/.test(pair.species_id))throw Error('Previous register pair join/identity invalid');ids.add(pair.pair_id);}
 if(moves.size!==old.catalog_count||moves.size!==old.moves.length)throw Error('Previous move counts invalid');
 return legacy308?'historical-308-canonical-identity-and-move-joins-species-inventory-absent':historical?'historical-consistency-only-not-provenance-v2':'current-provenance-v2-validator';
}
function controls(dex,TeamValidator){
 const team=['Venusaur','Charizard','Blastoise','Snorlax','Garchomp','Raichu'].map(name=>{const s=dex.species.get(name);return {name,species:s.name,ability:s.abilities['0'],moves:[[...dex.species.getMovePool(s.id)].sort(cmp)[0]],nature:'Hardy',level:50,evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0},item:''};});
 const variants={healthy:structuredClone(team),sirfetchd_meteor_assault:structuredClone(team),choice_band:structuredClone(team),wrong_species_move:structuredClone(team),duplicate_species:structuredClone(team),five_moves:structuredClone(team)};
 variants.sirfetchd_meteor_assault[0]={...team[0],name:"Sirfetch'd",species:"Sirfetch'd",ability:'Scrappy',moves:['Meteor Assault']};
 variants.choice_band[0].item='Choice Band';variants.wrong_species_move[0].moves=['Hydro Pump'];variants.duplicate_species[1]=structuredClone(team[0]);variants.five_moves[0].moves=[...dex.species.getMovePool('venusaur')].sort(cmp).slice(0,5);
 return Object.entries(variants).map(([id,input])=>{const errors=new TeamValidator(FORMAT).validateTeam(structuredClone(input))||[];const expected=['healthy','sirfetchd_meteor_assault'].includes(id);if((errors.length===0)!==expected)throw Error(`Unexpected full-team control: ${id}: ${errors}`);return {id,format:FORMAT,input,expected_accepted:expected,accepted:!errors.length,errors,scope:'reference-only complete-team admission; no client proof'};});
}
export function buildCandidate({upstream,registerPath,expectedFingerprint}){
 upstream=path.resolve(upstream);const git=args=>execFileSync('git',['-C',upstream,...args],{encoding:'utf8'}).trim();
 const pin=git(['rev-parse','HEAD']);if(pin!==PIN)throw Error('Wrong exact candidate pin');if(git(['status','--porcelain','--untracked-files=no']))throw Error('Modified reference source');
 const compiled=compiledIdentity(upstream),fingerprint=hash(JSON.stringify(compiled));
 // Validate bytes BEFORE loading executable reference modules.
 verifyReference({pin,mod:'champions',formatMod:'champions',fingerprint,expectedFingerprint});
 const require=createRequire(pathToFileURL(path.join(upstream,'package.json'))),{Dex,TeamValidator}=require('./dist/sim/index.js'),dex=Dex.mod('champions');
 if(!Dex.formats.get(FORMAT).exists||Dex.formats.get('gen9championsvgc2026regmb').mod!=='championsregmb')throw Error('Missing explicit/historical format routing');
 verifyReference({pin,mod:dex.currentMod,formatMod:Dex.formats.get(FORMAT).mod,fingerprint,expectedFingerprint});
 const registerBytes=fs.readFileSync(registerPath),old=JSON.parse(registerBytes);
 const previous_validation=verifyPrevious(old);
 const context={regulation_id:'champions_reg_m_c_2026',format:'doubles',reference_pin:pin,competitive_use:false,official_eligibility:'unresolved',client_verification:'unknown',implementation_status:'unknown',review_status:'unreviewed_candidate',evidence_ids:['pinned-reference-intake'],assertion_ids:[],test_ids:[]};
 const available=dex.species.all().filter(s=>s.exists&&!s.isNonstandard);
 const species=available.map(s=>({...context,id:s.id,name:s.name,base_species:s.baseSpecies,is_mega:!!s.isMega,battle_only:!!s.battleOnly,registration_status:'requires_complete_team_validation',required_item:s.requiredItem||null,types:s.types,stats:s.baseStats,ability_ids:Object.values(s.abilities).map(a=>dex.toID(a))})).sort((a,b)=>cmp(a.id,b.id));
 const pairs=available.flatMap(s=>[...dex.species.getMovePool(s.id)].map(move=>({...context,id:s.id+':'+move,species_id:s.id,move_id:move}))).sort((a,b)=>cmp(a.id,b.id));
 const moves=[...new Set(pairs.map(p=>p.move_id))].sort(cmp).map(id=>{const m=dex.moves.get(id);return {...context,id,name:m.name,type:m.type,category:m.category,base_power:m.basePower,accuracy:m.accuracy,pp:m.pp,priority:m.priority,target:m.target};});
 const items=dex.items.all().filter(i=>i.exists&&!i.isNonstandard).map(i=>({...context,id:i.id,name:i.name,mega_stone:i.megaStone||null,mega_evolves:i.megaEvolves||null})).sort((a,b)=>cmp(a.id,b.id));
 const abilities=[...new Set(species.flatMap(s=>s.ability_ids))].sort(cmp).map(id=>({...context,id,name:dex.abilities.get(id).name,species_ids:species.filter(s=>s.ability_ids.includes(id)).map(s=>s.id)}));
 const tables={species,moves,items,abilities,pairs};for(const [key,count] of Object.entries(EXPECTED))if(tables[key].length!==count)throw Error(`Independent count mismatch: ${key}`);
 const oldPairs=old.species_move_pairs.map(p=>p.pair_id),pairDiff=differences(pairs.map(p=>p.id),oldPairs),speciesIds=new Set(species.map(s=>s.id));
 const active={missing:pairDiff.missing,extra:pairDiff.extra.filter(id=>speciesIds.has(id.split(':')[0]))};
 if(old.source_hashes?.['generated/champions_move_pools.js']==='21099bad04135f23de2d8b23203628c98004faf4a7d1da179ba808ccef2087f9'&&(active.missing.length!==636||active.extra.length!==205))throw Error('Independent historical pool delta mismatch');
 for(const id of ['politoed:pound','archaludon:mirrorcoat','archaludon:metalburst'])if(pairs.some(p=>p.id===id))throw Error('Official removal unexpectedly present in reference');
 const intake=capture(upstream,PIN);if(intake.compiled_fingerprint!==fingerprint)throw Error('Reference changed during capture');
 const generator_sources=Object.fromEntries(['prepare-mc-reference-candidate.mjs','audit-mc-reference.mjs','mc-roster-identity.mjs','regulation-roster-mapping.mjs','move-register.mjs','regulation-watch-core.mjs'].map(name=>[name,hash(fs.readFileSync(new URL(name,import.meta.url),'utf8').replace(/\r\n/g,'\n'))]));
 const report={generator_sources,dependency_lock_sha256:hash(fs.readFileSync(new URL('../package-lock.json',import.meta.url),'utf8').replace(/\r\n/g,'\n')),schema_version:'champions-mc-reference-candidate-v1',...context,scope:'Immutable offline reference candidate; no runtime activation, official completeness, mechanics certification or approval',reference:{pin,format:FORMAT,compiled_fingerprint:fingerprint,compiled_hashes:compiled,source_fingerprint:intake.source_fingerprint},previous_register:{validation:previous_validation,identity:old.identity,sha256:hash(registerBytes)},counts:Object.fromEntries(Object.entries(tables).map(([key,rows])=>[key,rows.length])),independent_expected_counts:EXPECTED,differences:{all_pairs:pairDiff,available_species_pairs:active,moves:differences(moves.map(m=>m.id),old.moves.map(m=>m.move_id))},official_conflicts:['politoed:pound','archaludon:mirrorcoat','archaludon:metalburst'].map(id=>({id,previous_export:oldPairs.includes(id),candidate:pairs.some(p=>p.id===id),resolution:'Retained official patch evidence supports removal; not a complete official inventory'})),controls:controls(dex,TeamValidator),intake,tables};
 report.candidate_sha256=hash(JSON.stringify(report));return report;
}
export function writeCandidate(report,output){
 output=path.resolve(output);if(fs.existsSync(output))throw Error('Candidate destination already exists; never overwrite');
 fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'candidate.json'),JSON.stringify(report,null,2)+'\n');
 for(const [name,rows] of Object.entries(report.tables)){fs.writeFileSync(path.join(output,name+'.json'),JSON.stringify(rows,null,2)+'\n');fs.writeFileSync(path.join(output,name+'.csv'),csv(rows));}
 fs.writeFileSync(path.join(output,'review.json'),JSON.stringify({candidate_sha256:report.candidate_sha256,approval:null,official_completeness:'unresolved',runtime_promoted:false,required_review:['bidirectional pair delta','registered versus battle-only forms','official removals and source conflicts','historical M-B routing','transitive dependent invalidation','current-client package and exact digest approval']},null,2)+'\n');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){const [upstream,registerPath,expectedFingerprint,output]=process.argv.slice(2);if(!output||process.argv.length!==6)throw Error('Usage: node prepare-mc-reference-candidate.mjs <upstream> <previous-register.json> <independent-compiled-sha256> <new-output-dir>');const report=buildCandidate({upstream,registerPath,expectedFingerprint});writeCandidate(report,output);console.log(JSON.stringify({candidate:report.candidate_sha256,counts:report.counts,missing:report.differences.available_species_pairs.missing.length,extra:report.differences.available_species_pairs.extra.length}));}
