import assert from 'node:assert/strict';
import {test} from 'node:test';
import {generateKeyPairSync,sign} from 'node:crypto';
import {assess,REQUIRED,sha256} from '../tools/check-competitive-readiness.mjs';

// Ephemeral synthetic keys/bytes exercise the validator, never production approval.
function fixture() {
  const {publicKey,privateKey}=generateKeyPairSync('ed25519');
  const files=new Map(), target={format:'doubles',client_version:'test-1',regulation_id:'synthetic',
    effective_from_utc:'2026-10-01T00:00:00Z',effective_to_utc:'2026-11-01T00:00:00Z',server_context:'synthetic-server-epoch'};
  const identity={build_id:'test-build',engine_sha256:'e'.repeat(64),bundle_sha256:'b'.repeat(64),
    reference_sha256:'a'.repeat(64),benchmark_sha256:'c'.repeat(64),benchmark_cases:['case-a'],benchmark_requirements:{'case-a':{asserted_fields:['exact_hp'],evidence_kinds:['client-mechanics']}},unproved_cases:[]};
  const pkg={schema_version:1,target,identity,benchmark_cases:['case-a'],unsupported:[],evidence:REQUIRED.map((kind,i)=>{
    const bytes=Buffer.from(`synthetic observation ${kind}`), name=`evidence/${i}.json`;files.set(name,bytes);
    return {id:kind,kind,path:name,sha256:sha256(bytes),status:'passed',mismatches:0,oracle:'champions-client',
      captured_at_utc:'2026-10-20T00:00:00Z',...target};
  })};
  pkg.case_results=[{id:'case-a',status:'passed',mismatches:0,asserted_fields:['exact_hp'],evidence_ids:['client-mechanics']}];
  for(const e of pkg.evidence.filter(e=>['official-client-version','regulation-rules'].includes(e.kind))){
    e.oracle='official-publication';e.source_url=e.kind==='official-client-version'?'https://www.nintendo.com/synthetic':'https://champions-news.pokemon-home.com/synthetic';e.extracted={...target};e.source_capture={path:e.path,sha256:e.sha256};
  }
  const manifest={schema_version:1,target};
  const seal=()=>{const bytes=Buffer.from(JSON.stringify(pkg));files.set('package.json',bytes);
    manifest.package={path:'package.json',sha256:sha256(bytes)};
    manifest.approval={key_id:'synthetic-key',signature:sign(null,bytes,privateKey).toString('base64')};};
  seal();
  const options={read:name=>{if(!files.has(name))throw Error('absent');return files.get(name);},
    now:Date.parse('2026-10-20T12:00:00Z'),identity,
    keys:[{id:'synthetic-key',role:'human-release-reviewer',public_key:publicKey}]};
  return {manifest,pkg,files,options,seal};
}
test('synthetic reviewed complete package can pass the pure contract',()=>{
  const f=fixture();assert.equal(assess(f.manifest,f.options).status,'READY');
});
const mutations={
  'blank assertion':f=>{f.pkg.case_results[0].asserted_fields=[''];f.seal();},
  'unrelated case evidence':f=>{f.pkg.case_results[0].evidence_ids=['official-client-version'];f.seal();},
  'undeclared case requirements':f=>{delete f.options.identity.benchmark_requirements;},
  'non-HTTPS official URL':f=>{f.pkg.evidence[0].source_url='ftp://www.nintendo.com/synthetic';f.seal();},
  'wrong extracted regulation end':f=>{f.pkg.evidence[1].extracted.effective_to_utc='2020-01-01';f.seal();},
  'wrong extracted regulation start':f=>{f.pkg.evidence[1].extracted.effective_from_utc='2020-01-01';f.seal();},
  'wrong extracted regulation format':f=>{f.pkg.evidence[1].extracted.format='singles';f.seal();},
  'missing package':f=>f.manifest.package=null,
  'missing review':f=>f.manifest.approval=null,
  'unenrolled reviewer':f=>f.options.keys=[],
  'approval flag cannot authorize':f=>{f.manifest.approval={approved:true};},
  'wrong signature':f=>f.manifest.approval.signature=Buffer.alloc(64).toString('base64'),
  'changed captured bytes':f=>f.files.set('evidence/0.json',Buffer.from('changed')),
  'absent bytes with declared hash':f=>f.files.delete('evidence/0.json'),
  'changed package after review':f=>{f.pkg.unsupported=['defect'];const bytes=Buffer.from(JSON.stringify(f.pkg));f.files.set('package.json',bytes);f.manifest.package.sha256=sha256(bytes);},
  'expired target':f=>f.options.now=Date.parse('2027-01-01'),
  'future target':f=>f.options.now=Date.parse('2026-09-01'),
  'stale runtime':f=>f.options.identity={...f.options.identity,build_id:'new-build'},
  'wrong schema':f=>f.manifest.schema_version=2,
  'path traversal':f=>f.manifest.package.path='../private.json',
  'missing complete team rejection':f=>{f.pkg.evidence=f.pkg.evidence.filter(e=>e.kind!=='rejected-complete-team');f.seal();},
  'reference substituted for client':f=>{f.pkg.evidence.find(e=>e.kind==='client-mechanics').oracle='showdown';f.seal();},
  'skipped comparison':f=>{f.pkg.evidence[0].status='skipped';f.seal();},
  'mismatched comparison':f=>{f.pkg.evidence[0].mismatches=1;f.seal();},
  'wrong capture client':f=>{f.pkg.evidence[0].client_version='old';f.seal();},
  'wrong capture regulation':f=>{f.pkg.evidence[0].regulation_id='old';f.seal();},
  'wrong capture format':f=>{f.pkg.evidence[0].format='singles';f.seal();},
  'unknown maintenance context':f=>{f.pkg.evidence[0].server_context='unknown';f.seal();},
  'stale capture':f=>{f.pkg.evidence[0].captured_at_utc='2020-01-01T00:00:00Z';f.seal();},
  'duplicate evidence':f=>{f.pkg.evidence.push(f.pkg.evidence[0]);f.seal();},
  'open benchmark cannot be signed away':f=>{f.options.identity={...f.options.identity,unproved_cases:['case-a']};},
  'absent per-case comparisons':f=>{f.pkg.case_results=[];f.seal();},
  'invented per-case evidence':f=>{f.pkg.case_results[0].evidence_ids=['absent'];f.seal();},
  'own repository is not official source':f=>{f.pkg.evidence[0].source_url='https://github.com/TheYfactora12/Pokemon-Champions-Sim-Planner';f.seal();},
  'wrong extracted version':f=>{f.pkg.evidence[0].extracted.client_version='old';f.seal();},
  'missing official raw capture':f=>{delete f.pkg.evidence[0].source_capture;f.seal();},
  'missing benchmark':f=>{f.pkg.benchmark_cases=[];f.seal();},
  'unsupported mechanic':f=>{f.pkg.unsupported=['public switching'];f.seal();}
};
for(const [name,mutate] of Object.entries(mutations)) test(`reject ${name}`,()=>{
  const f=fixture();mutate(f);assert.notEqual(assess(f.manifest,f.options).status,'READY');
});
test('negative suite kills a deliberately always-ready checker',()=>{
  const verifyChecker=checker=>{const f=fixture();f.manifest.package=null;
    assert.notEqual(checker(f.manifest,f.options).status,'READY');};
  verifyChecker(assess);
  assert.throws(()=>verifyChecker(()=>({status:'READY'})),assert.AssertionError);
});
