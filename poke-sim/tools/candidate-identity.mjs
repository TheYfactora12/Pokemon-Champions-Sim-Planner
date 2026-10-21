import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
export function candidateIdentity(root) {
  const artifact=JSON.parse(fs.readFileSync(path.join(root,'generated/release_artifact.json')));
  const bundle=fs.readFileSync(path.join(root,artifact.bundle_name));
  assert.equal(hash(bundle),artifact.bundle_sha256,'Rebuild candidate before browser audit');
  const external=Object.fromEntries(Object.entries(artifact.external_assets).map(([name,row])=>{
    const actual=hash(fs.readFileSync(path.join(root,name)));assert.equal(actual,row.sha256,`Stale external asset ${name}`);return [name,actual];
  }));
  return {build_id:artifact.build_id,bundle_sha256:hash(bundle),external_assets:external,
    commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),
    working_tree:execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim()?'uncommitted':'clean'};
}
export async function verifyServedCandidate(url,expected) {
  const bundle=await fetch(url,{cache:'no-store'});assert(bundle.ok,'Candidate response unavailable');
  assert.equal(hash(Buffer.from(await bundle.arrayBuffer())),expected.bundle_sha256,'Served bundle differs from independent disk artifact');
  for(const [name,digest] of Object.entries(expected.external_assets)){
    const response=await fetch(new URL(name,url),{cache:'no-store'});assert(response.ok,`Asset unavailable: ${name}`);
    assert.equal(hash(Buffer.from(await response.arrayBuffer())),digest,`Served external asset differs: ${name}`);
  }
  return expected.bundle_sha256;
}
