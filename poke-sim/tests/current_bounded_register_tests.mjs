import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readBoundedRegister,INDEX} from '../tools/bounded-register.mjs';
import {CURRENT_DEPENDENCY_FILES,CURRENT_REFERENCE,CURRENT_ANCHORS,currentDependencies} from '../tools/current-bounded-core.mjs';
import {digest} from '../tools/bounded-assertions.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const index=JSON.parse(fs.readFileSync(path.join(root,INDEX)));
const current=index.assertions.filter(entry=>entry.enrollment_kind==='current-capture-v1');
const bytes=value=>Buffer.from(JSON.stringify(value));
function modified(changes,fn){
 const original=fs.readFileSync;
 fs.readFileSync=function(file,...args){
  const key=path.relative(root,file instanceof URL?fileURLToPath(file):String(file)).replaceAll('\\','/');
  if(changes.has(key)){const value=changes.get(key);return typeof args[0]==='string'?value.toString(args[0]):value;}
  return original.call(this,file,...args);
 };
 try{return fn();}finally{fs.readFileSync=original;}
}
const rows=()=>readBoundedRegister(root).filter(row=>current.some(entry=>entry.assertion_id===row.assertion_id));
test('six current exact assertions pass without promoting historical or client scope',()=>{
 assert.equal(current.length,6);const all=readBoundedRegister(root);assert.equal(all.length,7);
 for(const row of rows()){assert.equal(row.status,'passed_declared_scope');assert.equal(row.client_verification,'unknown');assert.equal(row.competitive_use,false);assert.equal(row.implementation_coverage,'bounded_assertion_only');assert(row.executed_at);}
 assert.equal(all.find(row=>row.assertion_id==='DAMAGE-ROLL-DISCRETE-016.tackle-vector.v1').status,'stale');
});
for(const [role,files]of Object.entries(CURRENT_DEPENDENCY_FILES))for(const file of files)test(`real ${role} change invalidates: ${file}`,()=>{
 const original=fs.readFileSync(path.join(root,file));
 const changed=file===CURRENT_REFERENCE?bytes({...JSON.parse(original),pin:'0'.repeat(40)}):Buffer.concat([original,Buffer.from('\n/* bounded dependency change */\n')]);
 modified(new Map([[file,changed]]),()=>assert(rows().every(row=>row.status==='stale')));
});
test('documentation-only Git commit changes HEAD but not dependency identity',()=>{
 const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'bounded-docs-'));
 try{
  for(const file of new Set(Object.values(CURRENT_DEPENDENCY_FILES).flat())){const target=path.join(fixture,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,file),target);}
  const git=args=>execFileSync('git',args,{cwd:fixture,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  git(['init','-q']);git(['-c','user.name=BoundedFixture','-c','user.email=fixture@example.invalid','commit','--allow-empty','-qm','initial']);
  const before=git(['rev-parse','HEAD']),target=JSON.parse(fs.readFileSync(path.join(root,CURRENT_REFERENCE))),identity=currentDependencies(fixture,target.compiled_fingerprint);
  fs.mkdirSync(path.join(fixture,'docs'));fs.writeFileSync(path.join(fixture,'docs/status.md'),'Documentation only.\n');git(['add','docs/status.md']);git(['-c','user.name=BoundedFixture','-c','user.email=fixture@example.invalid','commit','-qm','documentation']);
  assert.notEqual(git(['rev-parse','HEAD']),before);assert.deepEqual(currentDependencies(fixture,target.compiled_fingerprint),identity);
 }finally{const resolved=path.resolve(fixture),parent=path.resolve(os.tmpdir());assert.equal(path.dirname(resolved),parent);assert(path.basename(resolved).startsWith('bounded-docs-'));fs.rmSync(resolved,{recursive:true,force:true});}
});
function changedIndex(fn){const copy=structuredClone(index);fn(copy.assertions.find(row=>row.enrollment_kind==='current-capture-v1'));return new Map([[INDEX,bytes(copy)]]);}
for(const [name,mutate,pattern]of [
 ['wrong item label',entry=>entry.item_ids=['choiceband'],/item\/input/],
 ['wrong move label',entry=>entry.move_ids=['fissure'],/move\/action/],
 ['missing review',entry=>entry.independent_review={path:'not-reviewed.json',sha256:'0'.repeat(64)},/Unreviewed/],
 ['future capture time',entry=>entry.executed_at='2099-01-01T00:00:00.000Z',/timestamp/],
 ['missing dependency',entry=>entry.dependency_files.engine=[],/inventory/],
 ['scope promotion',entry=>entry.scope.client_version='1.2.2',/scope/]
])test(name,()=>modified(changedIndex(mutate),()=>assert.throws(()=>rows(),pattern)));
test('changing a pinned review without changing its anchor rejects',()=>{
 const entry=current[0],raw=fs.readFileSync(path.join(root,entry.independent_review.path));const altered=JSON.parse(raw);altered.assertions[0].status='failed';
 modified(new Map([[entry.independent_review.path,bytes(altered)]]),()=>assert.throws(()=>rows(),/hash mismatch/));
});
for(const [name,mutate,pattern]of [
 ['missing per-case review',review=>review.assertions=[],/Missing independent case/],
 ['duplicate review case',review=>review.assertions.push(review.assertions[0]),/Duplicate current review/],
 ['wrong independently observed value',review=>review.assertions[0].local_observations={invented:1},/outcome mismatch/],
 ['opaque execution attachments',review=>review.evidence.forEach(ref=>ref.role='unknown'),/execution evidence/]
])test(name,()=>{
 const entry=current[0],review=JSON.parse(fs.readFileSync(path.join(root,entry.independent_review.path)));mutate(review);const content=bytes(review),sha256=digest(content);
 const anchors=JSON.parse(fs.readFileSync(path.join(root,CURRENT_ANCHORS)));anchors.reviews.find(row=>row.path===entry.independent_review.path).sha256=sha256;
 const copy=structuredClone(index);for(const row of copy.assertions.filter(row=>row.enrollment_kind==='current-capture-v1'))row.independent_review.sha256=sha256;
 modified(new Map([[entry.independent_review.path,content],[CURRENT_ANCHORS,bytes(anchors)],[INDEX,bytes(copy)]]),()=>assert.throws(()=>rows(),pattern));
});
