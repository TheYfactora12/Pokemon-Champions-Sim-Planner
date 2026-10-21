import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const hash=b=>createHash('sha256').update(b).digest('hex');
// Deliberately fail closed: an npm package or different compiled build is not this oracle.
export function verifyEvioliteReference(){
 const pin=JSON.parse(fs.readFileSync(new URL('../tests/fixtures/eviolite_reference_v1.json',import.meta.url)));
 assert(process.env.CHAMPIONS_REFERENCE_SIM,'Set CHAMPIONS_REFERENCE_SIM to the pinned checkout dist/sim');
 const configured=path.resolve(process.env.CHAMPIONS_REFERENCE_SIM);
 const root=fs.existsSync(path.join(configured,'data/items.ts'))?configured:path.resolve(configured,'../..');
 assert.equal(execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),pin.commit);
 for(const [file,expected] of Object.entries(pin.files))assert.equal(hash(fs.readFileSync(path.join(root,file))),expected,`reference source drift: ${file}`);
 const files=fs.readdirSync(path.join(root,'dist'),{recursive:true,withFileTypes:true}).filter(x=>x.isFile()&&x.name.endsWith('.js')).map(x=>path.relative(root,path.join(x.parentPath||x.path,x.name)).replaceAll('\\','/')).sort();
 assert.equal(files.length,pin.dist_js_count);
 assert.equal(hash(files.map(f=>`${f}\0${hash(fs.readFileSync(path.join(root,f)))}\n`).join('')),pin.dist_js_sha256,'compiled reference drift');
 return pin;
}
