import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { lifecycleSource } from '../tools/validation-lifecycle.mjs';

test('aggregate identity binds owning tests, runners, fixtures, DB inputs and discovery additions/removals', () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'lifecycle-inventory-'));
  const root=path.join(dir,'poke-sim');fs.mkdirSync(root);
  const write=(file,text)=>{const target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,text);};
  try {
    for(const file of ['tests/charge_herb_suppression_tests.mjs','tools/run-project-gate.mjs','tests/fixtures/charge.json','db/migrations/proof.sql','package-lock.json','../.github/workflows/ci.yml']){
      const before=lifecycleSource(root);write(file,'original\n');const present=lifecycleSource(root);assert.notEqual(present,before,'Added input '+file);
      write(file,'weakened\n');assert.notEqual(lifecycleSource(root),present,'Changed input '+file);
      fs.unlinkSync(path.join(root,file));assert.equal(lifecycleSource(root),before,'Removed input '+file);
    }
    write('tests/owner.mjs','same\n');const lf=lifecycleSource(root);write('tests/owner.mjs','same\r\n');assert.equal(lifecycleSource(root),lf,'LF normalization');
    for(const file of ['docs/receipt.md','reports/validation/result.json','source/validation-lifecycle/run/facts.json','source/bounded-assertions/cycles/history/result.json'])write(file,'dated evidence');
    assert.equal(lifecycleSource(root),lf,'Receipt-only refresh is not a circular source change');
    write('tests/fixtures/binary.bin',Buffer.from([0x80]));const binary=lifecycleSource(root);
    write('tests/fixtures/binary.bin',Buffer.from([0x81]));assert.notEqual(lifecycleSource(root),binary,'Binary fixture bytes remain exact');
  }finally{assert.equal(path.dirname(dir),path.resolve(os.tmpdir()));assert(path.basename(dir).startsWith('lifecycle-inventory-'));fs.rmSync(dir,{recursive:true,force:true});}
});

test('committed inventory and working bytes agree; documentation-only commit preserves identity',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'lifecycle-git-')),root=path.join(dir,'poke-sim');fs.mkdirSync(path.join(root,'tests'),{recursive:true});
 const git=(...args)=>execFileSync('git',args,{cwd:dir,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
 try{
  git('init');git('config','user.name','Lifecycle fixture');git('config','user.email','fixture@example.invalid');git('config','core.autocrlf','false');
  fs.writeFileSync(path.join(root,'tests/owner.mjs'),'same\n');fs.writeFileSync(path.join(root,'tests/binary.bin'),Buffer.from([0x80]));git('add','.');git('commit','-m','fixture');
  const first=git('rev-parse','HEAD'),before=lifecycleSource(root,first);assert.equal(lifecycleSource(root),before);
  fs.writeFileSync(path.join(dir,'README.md'),'receipt only');git('add','.');git('commit','-m','docs');assert.equal(lifecycleSource(root,git('rev-parse','HEAD')),before);
  fs.writeFileSync(path.join(root,'tests/owner.mjs'),'changed\n');assert.notEqual(lifecycleSource(root),before);git('add','.');git('commit','-m','test change');assert.equal(lifecycleSource(root,git('rev-parse','HEAD')),lifecycleSource(root));
 }finally{assert.equal(path.dirname(dir),path.resolve(os.tmpdir()));assert(path.basename(dir).startsWith('lifecycle-git-'));fs.rmSync(dir,{recursive:true,force:true});}
});
