import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const root=fileURLToPath(new URL('../',import.meta.url)),out=path.join(root,'artifacts/browser-ci');
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify({status:'running',started_at:new Date().toISOString()})+'\n');
const require=createRequire(import.meta.url),pkg=require('playwright/package.json');
const revisions=JSON.parse(fs.readFileSync(path.join(path.dirname(require.resolve('playwright-core/package.json')),'browsers.json')));
const server=http.createServer((req,res)=>{
 try{
  assert(['GET','HEAD'].includes(req.method));
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+name);
  assert(file.startsWith(root));
  const real=fs.realpathSync(file);assert(real.startsWith(fs.realpathSync(root)+path.sep));
  const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};
  res.setHeader('Content-Type',types[path.extname(real)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');
  if(req.method==='HEAD')res.end();else fs.createReadStream(real).pipe(res);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${server.address().port}/pokemon-champion-2026.html?ci=1`;
let stdout='',stderr='',code;
try{
 const child=spawn(process.execPath,[path.join(root,'tools/audit-browser-replay.mjs'),url],{cwd:root,env:process.env});
 child.stdout.on('data',data=>{stdout+=data;process.stdout.write(data);});
 child.stderr.on('data',data=>{stderr+=data;process.stderr.write(data);});
 code=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',resolve);});
 fs.writeFileSync(path.join(out,'browser.log'),stdout+stderr);
 assert.equal(code,0,'Browser audit failed');
 const receipt=stdout.trim().split(/\r?\n/).map(line=>{try{return JSON.parse(line);}catch{return null;}}).find(row=>row?.directory);
 assert(receipt?.games>0 && receipt.pairs>0 && receipt.turns>0 && receipt.mismatch_pairs===0,'Empty/failed browser evidence');
 for(const file of ['candidate-identity.json','capture-inventory.json','comparison-report.json','diagnostics.json'])assert(fs.statSync(path.join(receipt.directory,file)).size>0,`Missing ${file}`);
 fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify({schema_version:1,status:'passed',playwright_version:pkg.version,browsers:revisions.browsers,...receipt},null,2)+'\n');
}catch(error){fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify({status:'failed',error:String(error),finished_at:new Date().toISOString()})+'\n');throw error;}finally{server.close();}
