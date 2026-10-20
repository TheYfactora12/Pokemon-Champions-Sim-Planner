import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildMoveRegister,validateMoveRegister,registerDiff,csv,exportMoveRegister} from '../tools/move-register.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),data=buildMoveRegister(root);
test('complete canonical inventory never promotes catalog, pair or legacy tag to legality/client proof',()=>{
 assert.equal(data.moves.length,954);assert.equal(new Set(data.moves.map(r=>r.move_id)).size,954);
 assert.equal(data.counts.regulation_approved_moves,0);assert.equal(data.counts.client_verified_moves,0);
 assert(data.species_move_pairs.length>60000);assert(data.moves.some(r=>r.legacy_verification_tag));
 assert(data.moves.every(r=>r.verification_status==='needs_bounded_assertion_review'&&r.assertion_ids.length===0));
 assert.deepEqual(validateMoveRegister(data),[]);
});
test('missing metadata, duplicate moves and edited sheet verification reject',()=>{
 for(const edit of [d=>d.moves.push(d.moves[0]),d=>delete d.moves[0].baseline.accuracy,d=>d.moves[0].regulation_eligibility='approved',d=>d.moves[0].client_verification='verified',d=>d.competitive_use=true,d=>d.species_move_pairs[0].regulation_eligibility='approved',d=>d.counts.client_verified_moves=954]){const d=structuredClone(data);edit(d);assert(validateMoveRegister(d).length);}
});
test('all-row change detection includes formerly matching rows and stages stale claims',()=>{
 const d=structuredClone(data);d.moves[0].baseline.pp++;const diff=registerDiff(data,d);assert.equal(diff.changes.length,1);assert.equal(diff.changes[0].claim_status,'stale_pending_review');assert.equal(diff.competitive_use,false);
 const pin=structuredClone(data);pin.source_hashes['generated/champions_move_pools.js']='changed';assert.equal(registerDiff(data,pin).changes.length,954);
 const pair=structuredClone(data);pair.species_move_pairs[0].move_id='invented';assert.equal(registerDiff(data,pair).pair_changes.length,1);
 const interaction=structuredClone(data);interaction.interactions[0].behavior='changed';assert.equal(registerDiff(data,interaction).interaction_changes.length,1);
 assert(data.evidence.find(e=>e.evidence_id==='pools').source_hashes.reference_sim_tree_sha256);
 const removed=structuredClone(data);removed.moves.pop();assert.equal(registerDiff(data,removed).changes[0].kind,'missing_from_candidate');
});
test('CSV preserves boolean accuracy and neutralizes spreadsheet formulas',()=>{
 const s=csv([{accuracy:true,name:'=CMD()',notes:'a,"b"\nc'}]);assert(s.includes('"true"'));assert(s.includes('"\'=CMD()"'));assert(s.includes('"a,""b""\nc"'));
});
test('committed candidate detects edits to metadata and provenance',()=>{
 const pointer=JSON.parse(fs.readFileSync(root+'reports/move-register/latest-candidate.json'));
 const snapshot=JSON.parse(fs.readFileSync(root+'reports/move-register/'+pointer.path));assert.deepEqual(validateMoveRegister(snapshot),[]);
 snapshot.moves[0].baseline.pp++;assert(validateMoveRegister(snapshot).includes('snapshot identity mismatch'));
});

test('generated candidate matches current source and generator bytes',()=>{assert.equal(exportMoveRegister(root,{check:true}).counts.catalog_moves,954);});

test('original independent register counterexamples reject before snapshot hashing',()=>{
 const mutations={
 displayed_verified:d=>{d.moves[0].implementation_coverage='verified';},
 displayed_covered:d=>{d.interactions[0].status='covered';},
 removed_pair:d=>{d.species_move_pairs.pop();d.counts.reference_pairs--;},
 removed_case:d=>{d.interactions.pop();d.counts.interaction_cases--;},
 orphan_move:d=>{d.species_move_pairs[0].move_id='notacatalogmove';d.species_move_pairs[0].pair_id=d.species_move_pairs[0].species_id+':notacatalogmove';},
 orphan_species:d=>{d.species_move_pairs[0].species_id='notarealspecies';d.species_move_pairs[0].pair_id='notarealspecies:'+d.species_move_pairs[0].move_id;},
 dangling_evidence:d=>{d.moves[0].evidence_ids=['nonexistent'];},
 forged_status:d=>{d.moves[0].verification_status='client_verified';d.moves[0].assertion_ids=['invented'];},
 wrong_scope:d=>{d.moves[0].regulation_id='expired';d.moves[0].format='singles';},
 null_metadata:d=>{d.moves[0].baseline.accuracy=null;},
 empty_hashes:d=>{d.source_hashes={};},
 orphan_interaction:d=>{d.interactions[0].move_ids=['notacatalogmove'];},
 empty_evidence:d=>{d.evidence=[];},
 unproved_receipt:d=>{d.moves[0].verification_status='confirmed_working';d.moves[0].assertion_ids=['damage-50'];},
 stale_receipt:d=>{d.moves[0].verification_status='confirmed_working';d.moves[0].last_verification={result:'passed',engine_commit:'obsolete',regulation_id:'expired',source_revision:'stale'};},
 removed_move:d=>{d.moves.pop();d.catalog_count--;d.counts.catalog_moves--;}
 };
 for(const [name,mutate]of Object.entries(mutations)){const d=structuredClone(data);mutate(d);assert(validateMoveRegister(d).length,name);}
});
test('wrong source mod or locked reference pin cannot build an export',()=>{
 const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'champions-register-source-'));
 try{for(const file of Object.keys(data.source_hashes)){const dest=path.join(temporary,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,file),dest);}
 const file=path.join(temporary,'generated/champions_move_pools.js'),original=fs.readFileSync(file,'utf8');
 for(const [from,to]of [['"mod":"champions"','"mod":"gen9"'],['"version":"0.11.11"','"version":"0.0.0"']]){assert(original.includes(from));fs.writeFileSync(file,original.replace(from,to));assert.throws(()=>buildMoveRegister(temporary),/mod\/locked reference mismatch/);}
 }finally{assert(path.resolve(temporary).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(temporary,{recursive:true});}
});
test('source-only changes invalidate all dependent pairs and declarations',()=>{
 const next=structuredClone(data);next.source_hashes['generated/champions_move_pools.js']='changed';const diff=registerDiff(data,next);
 assert.equal(diff.pair_changes.length,data.species_move_pairs.length);assert.equal(diff.interaction_changes.length,data.interactions.length);
 assert(data.species_move_pairs.every(r=>r.format==='doubles'&&r.regulation_id===data.regulation_id));
 assert(data.moves.every(r=>r.implementation_coverage==='unverified'));
 assert(data.interactions.every(r=>r.status==='unverified'&&r.executed_receipt===null));
});
test('CRLF generator bytes preserve the committed identity and formula prefixes stay inert',()=>{
 const original=fs.readFileSync,generator=fileURLToPath(new URL('../tools/move-register.mjs',import.meta.url));let changed=0;
 fs.readFileSync=function(file,...args){const value=original.call(this,file,...args);if(path.resolve(file instanceof URL?fileURLToPath(file):String(file))===generator){changed++;return String(value).replace(/\r?\n/g,'\r\n');}return value;};
 try{assert.equal(exportMoveRegister(root,{check:true}).counts.catalog_moves,954);assert.equal(changed,1);}finally{fs.readFileSync=original;}
 for(const value of ['\t=1+1','\r=1+1',' +1+1'])assert(csv([{value}]).includes('"\''+value));
});
