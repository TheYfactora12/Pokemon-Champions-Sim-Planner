import assert from 'node:assert/strict';
import {test} from 'node:test';
import {generateKeyPairSync,sign} from 'node:crypto';
import {FIELDS,ORACLES,HOSTED_KINDS} from '../tools/competitive-evidence-schema.mjs';
import {assess,REQUIRED,sha256} from '../tools/check-competitive-readiness.mjs';

// Ephemeral synthetic keys/bytes exercise the validator, never production approval.
function fixture() {
  const {publicKey,privateKey}=generateKeyPairSync('ed25519');
  const files=new Map(), target={format:'doubles',client_version:'test-1',regulation_id:'synthetic',
    effective_from_utc:'2026-10-01T00:00:00Z',effective_to_utc:'2026-11-01T00:00:00Z',server_context:'synthetic-server-epoch'};
  const identity={build_id:'test-build',engine_sha256:'e'.repeat(64),bundle_sha256:'b'.repeat(64),
    reference_sha256:'a'.repeat(64),benchmark_sha256:'c'.repeat(64),benchmark_cases:['case-a'],benchmark_requirements:{'case-a':{asserted_fields:['exact_hp'],evidence_kinds:['client-mechanics'],field_contracts:{exact_hp:{type:'number',unit:'hp',min:0}}}},unproved_cases:[]};
  Object.assign(identity,{external_assets:{'mc_review.js':'d'.repeat(64)},installed_reference:{'dist/sim/battle.js':'f'.repeat(64)},checker_schema:{checker:'1'.repeat(64)}});
  Object.assign(identity,{checked_commit:'a'.repeat(40),hosted_origins:{preview:'https://preview.example',production:'https://production.example'},rollback_target:{commit:'c'.repeat(40),bundle_sha256:'b'.repeat(64),external_assets:identity.external_assets}});
  const pkg={schema_version:1,target,identity,benchmark_cases:['case-a'],unsupported:[],evidence:REQUIRED.map((kind,i)=>{
    const bytes=Buffer.from(`synthetic observation ${kind}`), name=`evidence/${i}.json`;files.set(name,bytes);
    return {id:kind,kind,path:name,sha256:sha256(bytes),status:'passed',mismatches:0,oracle:'champions-client',
      captured_at_utc:'2026-10-20T00:00:00Z',...target};
  })};
  pkg.case_results=[{id:'case-a',status:'passed',mismatches:0,asserted_fields:['exact_hp'],evidence_ids:['client-mechanics']}];
  for(const e of pkg.evidence.filter(e=>['official-client-version','regulation-rules'].includes(e.kind))){
    e.oracle='official-publication';e.source_url=e.kind==='official-client-version'?'https://www.nintendo.com/synthetic':'https://champions-news.pokemon-home.com/synthetic';e.extracted={...target};e.source_capture={path:e.path,sha256:e.sha256};
  }
  for(const e of pkg.evidence){
    e.oracle=ORACLES[e.kind];e.capture_id=`capture-${e.id}`;e.source_url ||= `https://evidence.example/synthetic/${e.id}`;
    let hosted_capture;
    if(HOSTED_KINDS.includes(e.kind)){
      e.source_url=(e.kind==='hosted-preview-e2e'?identity.hosted_origins.preview:identity.hosted_origins.production)+'/candidate.html';
      hosted_capture={environment:e.kind,url:e.source_url,source_commit:e.kind==='rollback-verification'?identity.rollback_target.commit:identity.checked_commit,bundle_sha256:identity.bundle_sha256,deployment_run_url:'https://github.com/synthetic/actions/runs/1',publication_approval_id:'synthetic-human-approval'};
    }

    const values={registration_accepted:e.kind==='accepted-complete-team',rejection_code:'item-clause',terminal:true,winner:'player',acceptance_met:true,allow:true,deny:false,replay_match:true,loaded_assets_match:true,fresh_profile:true,cache_upgrade:true,offline_reload:true,exact_hp:42,...target};
    const fields=e.kind==='client-mechanics'?['exact_hp']:FIELDS[e.kind];
    const input=Buffer.from(JSON.stringify({schema_version:'competitive-observations-v1',kind:e.kind,target,identity,capture_id:e.capture_id,captured_at_utc:e.captured_at_utc,source_url:e.source_url,client_version:e.client_version,regulation_id:e.regulation_id,format:e.format,server_context:e.server_context,case_id:'case-a',field_contracts:Object.fromEntries(fields.map(field=>[field,field==='exact_hp'?{type:'number',unit:'hp',min:0}:{type:typeof values[field],unit:typeof values[field]==='boolean'?'boolean':'text'}])),hosted_capture,protocol_id:'synthetic-held-out-v1',held_out:true,environment:'synthetic-service',loaded_assets:identity.external_assets,status:'complete',expected:values,observed:values}));files.set(`input/${e.id}`,input);
    const body={schema_version:'competitive-comparison-v1',kind:e.kind,oracle:e.oracle,target,identity,status:'passed',mismatches:0,
      observations:fields.map((field,i)=>({id:`${e.id}-${i}`,case_id:'case-a',field,comparator:'exact',unit:field==='exact_hp'?'hp':typeof values[field]==='boolean'?'boolean':'text',expected:values[field],observed:values[field],expected_source:{input_id:'observations',pointer:`/expected/${field}`},observed_source:{input_id:'observations',pointer:`/observed/${field}`} })),
      inputs:[{id:'observations',path:`input/${e.id}`,sha256:sha256(input)}],hosted_capture,protocol_id:'synthetic-held-out-v1',held_out:true,environment:'synthetic-service',loaded_assets:identity.external_assets};
    if(e.oracle==='official-publication'){
      let text='';body.source_spans={};for(const field of fields){const value=String(target[field]);body.source_spans[field]={start:text.length,end:text.length+value.length};text+=value+'\n';}
      const raw=Buffer.from(text),name=`source/${e.id}`;files.set(name,raw);e.source_capture={path:name,sha256:sha256(raw)};
    }
    const bytes=Buffer.from(JSON.stringify(body));files.set(e.path,bytes);e.sha256=sha256(bytes);
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
  'empty all evidence':f=>{const bytes=Buffer.from('');f.files.set('empty',bytes);for(const e of f.pkg.evidence){e.path='empty';e.sha256=sha256(bytes);if(e.source_capture)e.source_capture={path:'empty',sha256:sha256(bytes)};}f.seal();},
  'contradictory body':f=>{const e=f.pkg.evidence.find(e=>e.kind==='client-mechanics');const body=JSON.parse(f.files.get(e.path));body.observations[0].observed=1;const bytes=Buffer.from(JSON.stringify(body));f.files.set(e.path,bytes);e.sha256=sha256(bytes);f.seal();},
  'unsupported policy service browser oracles':f=>{for(const e of f.pkg.evidence)if(['competitive-policy-quality','live-service','paired-browser-replays'].includes(e.kind))e.oracle='self-generated-unverified';f.seal();},
  'duplicate benchmark inventory':f=>{f.pkg.benchmark_cases.push('case-a');f.seal();},
  'changed external identity':f=>{f.options.identity={...f.options.identity,external_assets:{'mc_review.js':'0'.repeat(64)}};},
  'changed installed reference':f=>{f.options.identity={...f.options.identity,installed_reference:{'dist/sim/battle.js':'0'.repeat(64)}};},
  'changed checker schema':f=>{f.options.identity={...f.options.identity,checker_schema:{checker:'0'.repeat(64)}};},
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
const bodyMutations={
  'empty observations':b=>{b.observations=[];},
  'missing observed':b=>{delete b.observations[0].observed;},
  'null observed':b=>{b.observations[0].observed=null;},
  'duplicate assertions':b=>{b.observations.push(b.observations[0]);},
  'wrong body context':b=>{b.target={...b.target,client_version:'old'};},
  'body asserts different field':b=>{b.observations[0].field='display_label';},
  'body failed against passed package':b=>{b.status='failed';b.mismatches=1;},
  'missing immutable inputs':b=>{b.inputs=[];}
};
for(const [name,mutate] of Object.entries(bodyMutations))test(`parsed body rejects ${name}`,()=>{
  const f=fixture(),e=f.pkg.evidence.find(e=>e.kind==='client-mechanics');const body=JSON.parse(f.files.get(e.path));mutate(body);
  const bytes=Buffer.from(JSON.stringify(body));f.files.set(e.path,bytes);e.sha256=sha256(bytes);f.seal();assert.notEqual(assess(f.manifest,f.options).status,'READY');
});
test('official source bytes must reproduce extracted values even after resigning',()=>{
  const f=fixture(),e=f.pkg.evidence[0],raw=Buffer.from('unrelated official publication');f.files.set(e.source_capture.path,raw);e.source_capture.sha256=sha256(raw);f.seal();assert.notEqual(assess(f.manifest,f.options).status,'READY');
});

for(const kind of HOSTED_KINDS)test(`remote gate cannot be omitted: ${kind}`,()=>{const f=fixture();f.pkg.evidence=f.pkg.evidence.filter(e=>e.kind!==kind);f.seal();assert.notEqual(assess(f.manifest,f.options).status,'READY');});
for(const [id,mutate] of [
 ['localhost',c=>{c.url='http://127.0.0.1:8000/candidate.html';}],
 ['https-loopback',c=>{c.url='https://localhost/candidate.html';}],
 ['wrong-commit',c=>{c.source_commit='0'.repeat(40);}],
 ['wrong-bundle',c=>{c.bundle_sha256='0'.repeat(64);}],
 ['missing-approval',c=>{delete c.publication_approval_id;}],
 ['missing-deployment',c=>{delete c.deployment_run_url;}],
 ['wrong-stage',c=>{c.environment='production-smoke';}],
])test(`hosted capture rejects ${id} even after input rehash and signature`,()=>{
 const f=fixture();rewriteEvidence(f,'hosted-preview-e2e',(b,e)=>{
  mutate(b.hosted_capture);e.source_url=b.hosted_capture.url;
  const ref=b.inputs[0],input=JSON.parse(f.files.get(ref.path));input.hosted_capture=b.hosted_capture;input.source_url=e.source_url;
  const bytes=Buffer.from(JSON.stringify(input));f.files.set(ref.path,bytes);ref.sha256=sha256(bytes);
 });assert.notEqual(assess(f.manifest,f.options).status,'READY');
});
test('same-origin preview configuration cannot pass',()=>{const f=fixture();f.options.identity.hosted_origins.preview=f.options.identity.hosted_origins.production;f.seal();assert.notEqual(assess(f.manifest,f.options).status,'READY');});
test('absent approved preview origin cannot pass',()=>{const f=fixture();f.options.identity.hosted_origins.preview=null;f.seal();assert.notEqual(assess(f.manifest,f.options).status,'READY');});
test('rollback requires a separately bound previous artifact',()=>{const f=fixture();delete f.options.identity.rollback_target;f.seal();assert.notEqual(assess(f.manifest,f.options).status,'READY');});
function rewriteEvidence(f,kind,mutate){const e=f.pkg.evidence.find(e=>e.kind===kind),b=JSON.parse(f.files.get(e.path));mutate(b,e);const bytes=Buffer.from(JSON.stringify(b));f.files.set(e.path,bytes);e.sha256=sha256(bytes);f.seal();}
for(const value of ['banana',{},-1])test(`typed HP rejects ${JSON.stringify(value)}`,()=>{const f=fixture();rewriteEvidence(f,'client-mechanics',b=>{b.observations[0].expected=value;b.observations[0].observed=value;});assert.notEqual(assess(f.manifest,f.options).status,'READY');});
test('unrelated kind cannot supply missing case assertion',()=>{const f=fixture();rewriteEvidence(f,'client-mechanics',b=>{b.observations[0].case_id='unrelated-case';});rewriteEvidence(f,'official-client-version',b=>{b.observations.push({id:'borrowed-hp',case_id:'case-a',field:'exact_hp',comparator:'exact',unit:'hp',expected:42,observed:42,expected_source:{input_id:'observations',pointer:'/expected/exact_hp'},observed_source:{input_id:'observations',pointer:'/observed/exact_hp'}});});f.pkg.case_results[0].evidence_ids=['client-mechanics','official-client-version'];f.seal();assert.notEqual(assess(f.manifest,f.options).status,'READY');});
for(const mode of ['unsupported','contradictory','failed'])test(`parsed input rejects ${mode}`,()=>{const f=fixture();rewriteEvidence(f,'client-mechanics',b=>{const ref=b.inputs[0];let input=JSON.parse(f.files.get(ref.path));if(mode==='unsupported')input={status:'failed',expected_hp:42,observed_hp:0};if(mode==='contradictory')input.observed.exact_hp=0;if(mode==='failed')input.status='failed';const bytes=Buffer.from(JSON.stringify(input));f.files.set(ref.path,bytes);ref.sha256=sha256(bytes);});assert.notEqual(assess(f.manifest,f.options).status,'READY');});
test('missing field type contract rejects',()=>{const f=fixture();delete f.options.identity.benchmark_requirements['case-a'].field_contracts;f.seal();assert.notEqual(assess(f.manifest,f.options).status,'READY');});
test('wrong unit rejects',()=>{const f=fixture();rewriteEvidence(f,'client-mechanics',b=>{b.observations[0].unit='percent';});assert.notEqual(assess(f.manifest,f.options).status,'READY');});
test('pointer cannot read expected values as observed',()=>{const f=fixture();rewriteEvidence(f,'client-mechanics',b=>{b.observations[0].observed_source.pointer='/expected/exact_hp';});assert.notEqual(assess(f.manifest,f.options).status,'READY');});
function rewriteInput(f,kind,mutate,mutateBody=()=>{}){rewriteEvidence(f,kind,b=>{const ref=b.inputs[0],input=JSON.parse(f.files.get(ref.path));mutate(input);mutateBody(b);const bytes=Buffer.from(JSON.stringify(input));f.files.set(ref.path,bytes);ref.sha256=sha256(bytes);});}
for(const [name,kind,mutate] of [
  ['stale input identity','client-mechanics',i=>{i.identity={build_id:'old',engine_sha256:'0'.repeat(64)};}],
  ['wrong input case','client-mechanics',i=>{i.case_id='unrelated-case';}],
  ['wrong input units','client-mechanics',i=>{i.field_contracts.exact_hp.unit='percent';}],
  ['missing input field contract','client-mechanics',i=>{delete i.field_contracts.exact_hp;}],
  ['false held-out input','competitive-policy-quality',i=>{i.held_out=false;}],
  ['wrong input protocol','competitive-policy-quality',i=>{i.protocol_id='unreviewed';}],
  ['wrong service environment','live-service',i=>{i.environment='another-service';}],
  ['wrong loaded asset source','paired-browser-replays',i=>{i.loaded_assets={};}]
])test(name,()=>{const f=fixture();rewriteInput(f,kind,mutate);assert.notEqual(assess(f.manifest,f.options).status,'READY');});
test('unrelated counter cannot stand in for observed HP',()=>{const f=fixture();rewriteInput(f,'client-mechanics',i=>{i.observed.exact_hp=0;i.observed.unrelated_counter=42;},b=>{b.observations[0].observed_source.pointer='/observed/unrelated_counter';});assert.notEqual(assess(f.manifest,f.options).status,'READY');});

test('external field contract overrides signed stale package minimum',()=>{const f=fixture();f.options.identity=structuredClone(f.options.identity);f.options.identity.benchmark_requirements['case-a'].field_contracts.exact_hp.min=100;assert.notEqual(assess(f.manifest,f.options).status,'READY');});
for(const [field,value]of [['captured_at_utc','2020-01-01T00:00:00Z'],['source_url','https://unrelated.example/'],['capture_id','other-capture'],['server_context','other-server']])test(`retained capture ${field} must agree`,()=>{const f=fixture();rewriteInput(f,'client-mechanics',i=>{i[field]=value;});assert.notEqual(assess(f.manifest,f.options).status,'READY');});

for(const constraint of [{max:10},{unknown_constraint:true},{min:'0'},{min:100,max:10}])test('reject invalid or violated contract '+JSON.stringify(constraint),()=>{
 const f=fixture();Object.assign(f.options.identity.benchmark_requirements['case-a'].field_contracts.exact_hp,constraint);
 for(const e of f.pkg.evidence)rewriteInput(f,e.id,i=>{i.identity=f.options.identity;if(e.kind==='client-mechanics')Object.assign(i.field_contracts.exact_hp,constraint);},b=>{b.identity=f.options.identity;});
 f.seal();assert.notEqual(assess(f.manifest,f.options).status,'READY');
});


test('predeployment eligibility does not claim postdeployment completion',()=>{
 const f=fixture();f.pkg.evidence=f.pkg.evidence.filter(e=>!['production-smoke','rollback-verification'].includes(e.kind));f.seal();
 assert.equal(assess(f.manifest,{...f.options,phase:'predeployment'}).status,'PREDEPLOY_ELIGIBLE');
 assert.equal(assess(f.manifest,f.options).status,'NO-GO');
 f.pkg.evidence=f.pkg.evidence.filter(e=>e.kind!=='hosted-preview-e2e');f.seal();
 assert.equal(assess(f.manifest,{...f.options,phase:'predeployment'}).status,'NO-GO');
});
test('unknown readiness phases cannot waive gates',()=>{const f=fixture();assert.throws(()=>assess(f.manifest,{...f.options,phase:'skip'}),/Unknown readiness phase/);});
