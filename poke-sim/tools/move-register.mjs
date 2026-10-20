import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {canonical,sha256} from './regulation-watch-core.mjs';
const fields=['type','category','basePower','accuracy','pp','priority','target'];
// Historical mode retains the old consistency checks only; it never upgrades
// an old snapshot to the provenance-v2 contract or authenticates its sources.
export function validateMoveRegister(register, {historical=false}={}) {
 const errors=[],ids=new Set(),evidence=new Map((register.evidence||[]).map(r=>[r.evidence_id,r]));
 const strict=register.provenance_contract==='move-register-provenance-v2';
 if(!strict&&!historical)errors.push('historical provenance contract: explicit historical validation required');
 if(register.provenance_contract&&!strict)errors.push('unsupported provenance contract');
 if(strict&&evidence.size!==(register.evidence||[]).length)errors.push('duplicate evidence identity');
 if(register.identity){const {identity,generator_sha256,...data}=register;if(identity!==sha256(canonical({data,generator:generator_sha256})))errors.push('snapshot identity mismatch');}
 if(register.schema_version!=='champions-move-register-v1')errors.push('schema');
 const sourceNames=['data.js','generated/pokemon_showdown_legal_data.js','generated/champions_move_overrides.js','generated/champions_move_pools.js','move_support.js','battle_edge_case_matrix.json','source/reg-m-c-source-review.json','package-lock.json'];
 if(sourceNames.some(k=>!/^[a-f0-9]{64}$/.test(register.source_hashes?.[k]||'')))errors.push('missing source hashes');
 for(const id of ['baseline','overrides','pools','regulation','interactions']){const e=evidence.get(id);if(!e||e.sha256!==register.source_hashes?.[e.path])errors.push('missing or inconsistent evidence');}
 const species=new Set(evidence.get('baseline')?.species_ids||[]),expectedMoves=evidence.get('baseline')?.move_ids||[];
 if(!species.size||!expectedMoves.length)errors.push('missing reference inventory identity');
 const pool=evidence.get('pools');if(pool?.mod!=='champions'||pool?.reference?.version!==pool?.locked_reference?.version||pool?.reference?.integrity!==pool?.locked_reference?.integrity)errors.push('pool scope or pin mismatch');
 for(const row of register.moves||[]){
  if(!row.move_id||ids.has(row.move_id))errors.push('duplicate or absent move ID');ids.add(row.move_id);
  if(!row.name||fields.some(k=>row.baseline?.[k]===undefined||row.baseline?.[k]===null||row.effective_metadata?.[k]===undefined||row.effective_metadata?.[k]===null))errors.push('missing move metadata');
  if(row.regulation_id!==register.regulation_id||row.format!==register.format)errors.push('row scope mismatch');
  if(strict&&(row.source_sha256!==evidence.get('baseline')?.sha256||row.source_revision!==evidence.get('baseline')?.source_revision||row.source_url!==evidence.get('baseline')?.source_url))errors.push('move source provenance mismatch');
  if(row.regulation_eligibility!=='unknown'||row.complete_set_legality!=='not_evaluated'||row.client_verification!=='unknown'||row.implementation_coverage!=='unverified'||row.verification_status!=='needs_bounded_assertion_review'||row.assertion_ids?.length||row.last_verification!==null||row.confidence!=='reference_inventory_only')errors.push('unapproved claim');
  if(!row.evidence_ids?.length||row.evidence_ids.some(id=>!evidence.has(id))||!row.gaps?.length)errors.push('missing evidence/gaps');
 }
 if(ids.size!==register.catalog_count||ids.size!==expectedMoves.length||expectedMoves.some(id=>!ids.has(id)))errors.push('catalog denominator or omission');
 const pairs=new Set(),cases=new Set();
 for(const row of register.species_move_pairs||[]){
  if(!row.pair_id||pairs.has(row.pair_id)||row.pair_id!==row.species_id+':'+row.move_id)errors.push('pair identity');pairs.add(row.pair_id);
  if(!ids.has(row.move_id)||!species.has(row.species_id)||!evidence.has(row.evidence_id))errors.push('orphan pair');
  if(strict){
   const source=pool?.species_provenance?.[row.species_id];
   if(row.evidence_id!=='pools'||evidence.get(row.evidence_id)?.kind!=='inherited_reference_learnsets')errors.push('pair evidence kind mismatch');
   if(!source||row.source_sha256!==source.source_sha256||row.reference_membership!==source.status||
     canonical(row.inherited_from??null)!==canonical(source.inherited_from??null))errors.push('pair source lineage mismatch');
  }
  if(row.regulation_id!==register.regulation_id||row.format!==register.format)errors.push('pair scope mismatch');
  if(row.regulation_eligibility!=='unknown'||row.complete_set_legality!=='not_evaluated')errors.push('unapproved pair claim');
 }
 for(const row of register.interactions||[]){if(!row.case_id||cases.has(row.case_id))errors.push('case identity');cases.add(row.case_id);if((row.move_ids||[]).some(id=>!ids.has(id)))errors.push('orphan interaction');if(row.status!=='unverified'||row.verification_status!=='unverified_declaration'||row.executed_receipt!==null)errors.push('unenrolled executed receipt');}
 if(sha256(canonical([...pairs].sort()))!==pool?.pair_ids_sha256)errors.push('pair inventory omission');
 if(strict&&(!/^[a-f0-9]{64}$/.test(pool?.species_gaps_sha256||'')||sha256(canonical(register.species_gaps??null))!==pool.species_gaps_sha256))errors.push('species gap inventory mismatch');
 if(canonical([...cases].sort())!==canonical(evidence.get('interactions')?.case_ids||[]))errors.push('case inventory omission');
 if(register.counts?.catalog_moves!==ids.size||register.counts?.reference_pairs!==pairs.size||register.counts?.interaction_cases!==cases.size||register.counts?.regulation_approved_moves!==0||register.counts?.client_verified_moves!==0)errors.push('invalid summary counts');
 if(register.competitive_use!==false)errors.push('competitive promotion');
 return errors;
}
export function buildMoveRegister(root) {
 const ctx={console};ctx.globalThis=ctx;vm.createContext(ctx);
 const sources=['data.js','generated/pokemon_showdown_legal_data.js','generated/champions_move_overrides.js','generated/champions_move_pools.js','move_support.js','battle_edge_case_matrix.json','source/reg-m-c-source-review.json','package-lock.json'];
 const hashes=Object.fromEntries(sources.map(file=>[file,sha256(fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n'))]));
 for(const file of sources.filter(f=>f.endsWith('.js')))vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
 const baseline=ctx.ChampionsSim.pokemonDataAudit,overrides=ctx.ChampionsSim.championsMoveOverrides,pools=ctx.ChampionsSim.championsMovePools;
 if(!baseline?.moves||!pools?.species)throw Error('Missing canonical source; no fallback');
 const locked=JSON.parse(fs.readFileSync(path.join(root,'package-lock.json'))).packages?.['node_modules/pokemon-showdown'];
 if(pools.mod!=='champions'||pools.reference?.package!=='pokemon-showdown'||pools.reference?.version!==locked?.version||pools.reference?.integrity!==locked?.integrity)throw Error('Move pool mod/locked reference mismatch');
 const regulation=JSON.parse(fs.readFileSync(path.join(root,'source/reg-m-c-source-review.json'))),matrix=JSON.parse(fs.readFileSync(path.join(root,'battle_edge_case_matrix.json')));
 const evidence=[{evidence_id:'interactions',kind:'unverified_case_declarations',path:sources[5],sha256:hashes[sources[5]],case_ids:matrix.cases.map(r=>r.id).sort()},{evidence_id:'baseline',move_ids:Object.keys(baseline.moves).sort(),species_ids:Object.values(baseline.species).map(s=>s.id).sort(),kind:'stored_reference_catalog',path:sources[1],sha256:hashes[sources[1]],source_url:baseline.sourceRepository||baseline.source||null,source_revision:baseline.sourceCommitOrVersion||null,exact_upstream_commit:null,last_verification:null,scope:'Stored approved database export; revision label alone is not an executable current reference pin'},
 {evidence_id:'overrides',kind:'pinned_reference_metadata',path:sources[2],sha256:hashes[sources[2]],...overrides.meta,last_verification:null,scope:'Metadata only; not lifecycle, legal roster or client proof'},
 {evidence_id:'pools',pair_ids_sha256:sha256(canonical(Object.entries(pools.species).flatMap(([id,row])=>(row.moves||[]).map(move=>id+':'+move)).sort())),kind:'inherited_reference_learnsets',path:sources[3],sha256:hashes[sources[3]],reference:pools.reference,locked_reference:{version:locked.version,integrity:locked.integrity},source_hashes:pools.source_hashes,mod:pools.mod,schema_version:pools.schema_version,scope:'Reference membership only; not set combinations or regulation approval'},
 {evidence_id:'regulation',kind:'unapproved_regulation_package',path:sources[6],sha256:hashes[sources[6]],source_url:regulation.official_notice?.url,review_status:regulation.review_status,competitive_use:false}];
 const pairs=[],speciesGaps=[];
 for(const [species,row]of Object.entries(pools.species).sort()){
  if(row.status!=='known')speciesGaps.push({species_id:species,status:row.status,reason:'Reference pool unavailable; no alias/base fallback'});
  for(const move of row.moves||[])pairs.push({pair_id:species+':'+move,species_id:species,move_id:move,reference_membership:row.status,inherited_from:row.inherited_from,source_sha256:row.source_sha256,regulation_eligibility:'unknown',complete_set_legality:'not_evaluated',evidence_id:'pools',regulation_id:regulation.regulation_id,format:'doubles'});
 }
 const poolEvidence=evidence.find(e=>e.evidence_id==='pools');
 poolEvidence.species_provenance=Object.fromEntries(Object.entries(pools.species).sort().map(([id,row])=>[id,{status:row.status,inherited_from:row.inherited_from??null,source_sha256:row.source_sha256??null}]));
 poolEvidence.species_gaps_sha256=sha256(canonical(speciesGaps));
 const moves=Object.entries(baseline.moves).sort(([a],[b])=>a.localeCompare(b)).map(([id,m])=>{
  const support=ctx.ChampionsSim.moveSupport.getLocalMoveSupport(m.name),override=overrides.moves[id]||null;
  const metadata=Object.fromEntries(fields.map(k=>[k,m[k]])),effective={...metadata};if(override?.champions_pp!==undefined)effective.pp=override.champions_pp;
  return {move_id:id,name:m.name,regulation_id:regulation.regulation_id,format:'doubles',client_version:null,client_verification:'unknown',catalog_presence:true,
   source_url:baseline.sourceRepository||baseline.source||null,source_revision:baseline.sourceCommitOrVersion||null,source_sha256:hashes[sources[1]],baseline:metadata,effective_metadata:effective,metadata_override:override,behavioral_effects:{description:m.shortDesc||m.short_desc||'',flags:m.flags,boosts:m.boosts,secondary:m.secondary,secondaries:m.secondaries,recoil:m.recoil,sideCondition:m.sideCondition,pseudoWeather:m.pseudoWeather,weather:m.weather,terrain:m.terrain,heal:m.heal,self:m.self,status:m.status,volatileStatus:m.volatileStatus,drain:m.drain,selfSwitch:m.selfSwitch,multihit:m.multihit},
   reference_availability:m.isNonstandard||'reference_standard',regulation_eligibility:'unknown',complete_set_legality:'not_evaluated',learnset_restrictions:'See reference species-move pairs; combinations and current regulation remain unapproved',
   implementation_coverage:'unverified',legacy_implementation_coverage:support.supportLevel,legacy_verification_tag:!!support.verified,verification_status:'needs_bounded_assertion_review',test_ids:support.verification?.tests||[],assertion_ids:[],confidence:'reference_inventory_only',last_verification:null,
   conflicts:support.notes?[support.notes]:[],gaps:['No approved current-regulation move eligibility','No client-version evidence','Legacy test-file tags are not bounded assertion proof','Metadata does not prove effects/interactions'],evidence_ids:['baseline','overrides','regulation']};
 });
 const interactions=matrix.cases.map(row=>({...row,declared_status:row.status,status:'unverified',verification_status:'unverified_declaration',executed_receipt:null,case_id:row.id,move_ids:row.move_ids||[],linkage_status:row.move_ids?.length?'explicit':'needs_move_link_review',verification_scope:'Declared test boundaries only; no inferred client verification'}));
 const register={schema_version:'champions-move-register-v1',provenance_contract:'move-register-provenance-v2',competitive_use:false,catalog_count:moves.length,regulation_id:regulation.regulation_id,format:'doubles',source_hashes:hashes,regulation,counts:{catalog_moves:moves.length,regulation_approved_moves:0,client_verified_moves:0,reference_pairs:pairs.length,interaction_cases:interactions.length},moves,species_move_pairs:pairs,species_gaps:speciesGaps,interactions,evidence};
 const errors=validateMoveRegister(register);if(errors.length)throw Error(errors.join('; '));return JSON.parse(JSON.stringify(register,(_k,v)=>v===undefined?null:v));
}
export function registerDiff(previous,current){
 const before=new Map(previous.moves.map(r=>[r.move_id,r])),after=new Map(current.moves.map(r=>[r.move_id,r]));
 const sourceChanged=canonical(previous.source_hashes)!==canonical(current.source_hashes),changes=[];
 for(const id of new Set([...before.keys(),...after.keys()]))if(sourceChanged||canonical(before.get(id)??null)!==canonical(after.get(id)??null))changes.push({move_id:id,kind:!before.has(id)?'added':!after.has(id)?'missing_from_candidate':'changed_or_source_stale',old:before.get(id)||null,new:after.get(id)||null,impacted_tests:[...new Set([...(before.get(id)?.test_ids||[]),...(after.get(id)?.test_ids||[])])],claim_status:'stale_pending_review'});
 const rowsDiff=(oldRows,newRows,key)=>{const old=new Map(oldRows.map(r=>[r[key],r])),next=new Map(newRows.map(r=>[r[key],r]));return [...new Set([...old.keys(),...next.keys()])].filter(id=>sourceChanged||canonical(old.get(id)??null)!==canonical(next.get(id)??null)).map(id=>({id,old:old.get(id)||null,new:next.get(id)||null,claim_status:'stale_pending_review'}));};
 return {schema_version:'champions-move-register-diff-v1',competitive_use:false,source_changed:sourceChanged,changes,pair_changes:rowsDiff(previous.species_move_pairs,current.species_move_pairs,'pair_id'),interaction_changes:rowsDiff(previous.interactions,current.interactions,'case_id'),evidence_changed:canonical(previous.evidence)!==canonical(current.evidence),review_required:true};
}
const csvCell=value=>{let s=typeof value==='object'?JSON.stringify(value):String(value??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
export function csv(rows){const keys=[...new Set(rows.flatMap(Object.keys))];return [keys.map(csvCell).join(','),...rows.map(r=>keys.map(k=>csvCell(r[k])).join(','))].join('\r\n')+'\r\n';}
export function exportMoveRegister(root,{check=false,previous=null}={}){
 const data=buildMoveRegister(root),generator=sha256(fs.readFileSync(new URL(import.meta.url),'utf8').replace(/\r\n/g,'\n')),identity=sha256(canonical({data,generator}));
 const base=path.join(root,'reports/move-register'),dir=path.join(base,identity);
 const outputs={'register.json':JSON.stringify({...data,identity,generator_sha256:generator},null,2)+'\n','moves.csv':csv(data.moves.map(({baseline,effective_metadata,...r})=>({...r,...Object.fromEntries(fields.map(k=>['baseline_'+k,baseline[k]])),...Object.fromEntries(fields.map(k=>[k,effective_metadata[k]]))}))), 'species-move-pairs.csv':csv(data.species_move_pairs),'interactions.csv':csv(data.interactions),'evidence.json':JSON.stringify(data.evidence,null,2)+'\n'};
 if(previous)outputs['review-queue.json']=JSON.stringify(registerDiff(JSON.parse(fs.readFileSync(previous)),data),null,2)+'\n';
 for(const [name,content]of Object.entries(outputs)){const file=path.join(dir,name);if(fs.existsSync(file)){if(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n')!==content.replace(/\r\n/g,'\n'))throw Error('Immutable export differs: '+file);}else{if(check)throw Error('Missing generated export: '+file);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(file,content);}}
 const pointer=JSON.stringify({schema_version:data.schema_version,identity,path:identity+'/register.json',competitive_use:false,counts:data.counts},null,2)+'\n',file=path.join(base,'latest-candidate.json');
 if(check){if(!fs.existsSync(file)||fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n')!==pointer)throw Error('Stale candidate export');}else fs.writeFileSync(file,pointer);
 return {identity,directory:dir,counts:data.counts};
}
