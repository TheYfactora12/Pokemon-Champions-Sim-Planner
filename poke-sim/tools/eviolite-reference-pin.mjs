import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const hash=b=>createHash('sha256').update(b).digest('hex');
// Two explicitly distinct pinned runtimes; never silently accept arbitrary oracle drift.
export function verifyEvioliteReference(){
 const pin=JSON.parse(fs.readFileSync(new URL('../tests/fixtures/eviolite_reference_v1.json',import.meta.url)));
 let root,expected,count,identity;
 if(process.env.CHAMPIONS_REFERENCE_SIM){
  const configured=path.resolve(process.env.CHAMPIONS_REFERENCE_SIM);
  root=fs.existsSync(path.join(configured,'data/items.ts'))?configured:path.resolve(configured,'../..');
  assert.equal(execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),pin.commit);
  for(const [file,value] of Object.entries(pin.files))assert.equal(hash(fs.readFileSync(path.join(root,file))),value,`reference source drift: ${file}`);
  expected=pin.dist_js_sha256;count=pin.dist_js_count;identity=`upstream ${pin.commit}`;
 }else{
  root=path.dirname(createRequire(import.meta.url).resolve('pokemon-showdown/package.json'));
  assert.equal(JSON.parse(fs.readFileSync(path.join(root,'package.json'))).version,pin.shared.version);
  expected=pin.shared.dist_js_sha256;count=pin.shared.dist_js_count;identity=`historical npm ${pin.shared.version}`;
 }
 const files=fs.readdirSync(path.join(root,'dist'),{recursive:true,withFileTypes:true}).filter(x=>x.isFile()&&x.name.endsWith('.js')).map(x=>path.relative(root,path.join(x.parentPath||x.path,x.name)).replaceAll('\\','/')).sort();
 assert.equal(files.length,count);
 assert.equal(hash(files.map(f=>`${f}\0${hash(fs.readFileSync(path.join(root,f)))}\n`).join('')),expected,'compiled reference drift');
 return {identity,compiled_sha256:expected};
}
