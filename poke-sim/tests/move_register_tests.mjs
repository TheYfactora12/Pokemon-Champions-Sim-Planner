import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
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
