import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
export {mapTeam} from '../tools/showdown-reference.mjs';
export const itemContract=JSON.parse(fs.readFileSync(new URL('fixtures/reserved_items_contract.json',import.meta.url)));
export function runtimeDigest(root){
 const files=[];
 function visit(dir){for(const row of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,row.name);if(row.isDirectory())visit(full);else if(row.name.endsWith('.js'))files.push(full);}}
 visit(path.join(root,'dist'));
 const rows=files.map(file=>[path.relative(root,file).replaceAll('\\','/'),createHash('sha256').update(fs.readFileSync(file)).digest('hex')]).sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0);
 return createHash('sha256').update(rows.map(([file,hash])=>file+'\0'+hash+'\n').join('')).digest('hex');
}
if(process.env.CHAMPIONS_REFERENCE_SIM){
 const root=process.env.CHAMPIONS_REFERENCE_SIM;
 assert.equal(execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),itemContract.upstream_commit,'upstream revision drift');
 for(const [file,expected] of Object.entries(itemContract.upstream_files))
  assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),expected,'upstream source/runtime drift: '+file);
}
const sharedRoot=path.dirname(createRequire(import.meta.url).resolve('pokemon-showdown/package.json'));
assert.equal(runtimeDigest(process.env.CHAMPIONS_REFERENCE_SIM||sharedRoot),
 itemContract.runtime_digests[process.env.CHAMPIONS_REFERENCE_SIM?'upstream':'shared'],'complete reference runtime drift');
export function loadLocalEngine(){
 const context=vm.createContext({console});
 for(const file of ['data.js','generated/pokemon_showdown_legal_data.js','generated/pokemon_showdown_species_weights.js',
  'generated/champions_move_overrides.js','generated/champions_move_pools.js','runtime_data.js','move_legality.js',
  'generated/mc_review_reference.js','mc_review.js','legality.js','rulesets.js','outcome_policy.js','engine.js']){
  const path=file==='engine.js'&&process.env.ITEM_ENGINE_SOURCE?process.env.ITEM_ENGINE_SOURCE:new URL('../'+file,import.meta.url);
  vm.runInContext(fs.readFileSync(path,'utf8'),context,{filename:file});
 }
 return {context};
}
