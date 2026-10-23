import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual as equal} from 'node:util';
export const HOSTED_KINDS=['hosted-preview-e2e','production-smoke','rollback-verification'];
export const ORACLES = Object.freeze({'official-client-version':'official-publication','regulation-rules':'official-publication','accepted-complete-team':'champions-client','rejected-complete-team':'champions-client','client-mechanics':'champions-client','complete-client-battles':'champions-client','competitive-policy-quality':'held-out-player-evaluation','live-service':'service-probe','paired-browser-replays':'candidate-bound-browser',...Object.fromEntries(HOSTED_KINDS.map(k=>[k,'remote-hosted-browser']))});
export const FIELDS = Object.freeze({'official-client-version':['client_version'],'regulation-rules':['regulation_id','format','effective_from_utc','effective_to_utc'],'accepted-complete-team':['registration_accepted'],'rejected-complete-team':['registration_accepted','rejection_code'],'client-mechanics':[],'complete-client-battles':['terminal','winner'],'competitive-policy-quality':['acceptance_met'],'live-service':['allow','deny'],'paired-browser-replays':['replay_match','loaded_assets_match'],...Object.fromEntries(HOSTED_KINDS.map(k=>[k,['replay_match','loaded_assets_match','fresh_profile','cache_upgrade','offline_reload']]))});
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
const proofIdentity=value=>Object.fromEntries(Object.entries(value||{}).filter(([key])=>!['checked_commit','github_sha','run_id','run_attempt'].includes(key)));
const hash=x=>createHash('sha256').update(x).digest('hex');
export function installedInventory(directory) {
  const files={};
  function visit(dir,relative='') { for(const name of fs.readdirSync(dir).sort()) {
    const full=path.join(dir,name),rel=relative?`${relative}/${name}`:name,stat=fs.lstatSync(full);
    if(stat.isSymbolicLink()) throw Error('Reference inventory cannot contain symlinks');
    if(stat.isDirectory()) visit(full,rel);
    else if(stat.isFile() && /\.(?:js|cjs|mjs|json)$/.test(name)) files[rel]=hash(fs.readFileSync(full));
  }}
  visit(directory);if(!Object.keys(files).length)throw Error('Empty installed reference inventory');return files;
}
// These are parsed comparison receipts, not authenticity proofs for source media.
// Exact source spans are verified against retained UTF-8 publication bytes; unsupported
// image/video-only extraction has no executable path and remains blocked.
export function parseEvidence(bytes,entry,{target,identity,load}) {
  const fail=message=>{throw Error(`${entry.id}: ${message}`);};
  if(!bytes?.length)fail('Empty evidence');
  let body;try{body=JSON.parse(bytes);}catch{fail('Malformed evidence JSON');}
  if(!body||body.schema_version!=='competitive-comparison-v1'||body.kind!==entry.kind||body.oracle!==ORACLES[entry.kind]||entry.oracle!==body.oracle)fail('Unsupported evidence schema/kind/oracle');
  if(!equal(body.target,target)||!equal(proofIdentity(body.identity),proofIdentity(identity)))fail('Evidence context/identity mismatch');
  if(!Array.isArray(body.observations)||!body.observations.length)fail('Missing observations');
  if(!Array.isArray(body.inputs)||!body.inputs.length)fail('Missing immutable inputs');
  const inputs=new Map();
  for(const ref of body.inputs){
    if(!nonempty(ref.id)||inputs.has(ref.id))fail('Duplicate/missing input identity');
    const raw=load(ref,`${entry.id} input`);if(!raw?.length)fail('Empty/unavailable input');
    let input;try{input=JSON.parse(raw);}catch{fail('Unsupported input encoding');}
    if(input?.schema_version!=='competitive-observations-v1'||input.kind!==entry.kind||!equal(input.target,target)||!equal(proofIdentity(input.identity),proofIdentity(identity))||!nonempty(input.case_id)||input.status!=='complete'||!input.expected||!input.observed)fail('Unsupported/incomplete input schema');
    for(const field of HOSTED_KINDS.includes(entry.kind)?['hosted_capture','loaded_assets']:entry.kind==='competitive-policy-quality'?['protocol_id','held_out']:entry.kind==='live-service'?['environment']:entry.kind==='paired-browser-replays'?['loaded_assets']:[]){
      if(!Object.hasOwn(input,field)||!equal(input[field],body[field]))fail('Input semantic metadata differs from receipt');
    }
    if(!nonempty(entry.capture_id)||!nonempty(entry.source_url))fail('Missing capture provenance');
    for(const key of ['capture_id','captured_at_utc','source_url','client_version','regulation_id','format','server_context']){
      if(!Object.hasOwn(input,key)||input[key]!==entry[key])fail('Input capture metadata differs from envelope');
    }
    inputs.set(ref.id,input);
  }
  const source=(ref,role,row,contract)=>{
    const escape=value=>value.replace(/~/g,'~0').replace(/\//g,'~1');
    if(!ref||!inputs.has(ref.input_id)||ref.pointer!==`/${role}/${escape(row.field)}`)fail('Source pointer must identify exact comparison field');
    const input=inputs.get(ref.input_id);
    if(input.case_id!==row.case_id||!equal(input.field_contracts?.[row.field],contract))fail('Source case/type/unit differs from comparison');
    if(!Object.hasOwn(input[role],row.field))fail('Unresolved source field');
    return input[role][row.field];
  };
  const booleans=new Set(['registration_accepted','terminal','acceptance_met','allow','deny','replay_match','loaded_assets_match','fresh_profile','cache_upgrade','offline_reload']);
  const ids=new Set(),fields=new Set(),cases=new Map();let mismatches=0;
  for(const row of body.observations){
    if(!row||!nonempty(row.id)||ids.has(row.id)||!nonempty(row.case_id)||!nonempty(row.field)||row.comparator!=='exact'||!Object.hasOwn(row,'expected')||!Object.hasOwn(row,'observed')||row.expected===null||row.observed===null)fail('Invalid/duplicate comparison');
    const declared=identity.benchmark_requirements?.[row.case_id]?.field_contracts?.[row.field];
    const builtin=FIELDS[entry.kind]?.includes(row.field)?{type:booleans.has(row.field)?'boolean':'string',unit:booleans.has(row.field)?'boolean':'text'}:null;
    const contract=builtin||declared;
    if(!contract||!['number','boolean','string'].includes(contract.type)||!nonempty(contract.unit)||row.unit!==contract.unit)fail('Undeclared field type/unit');
    if(Object.keys(contract).some(k=>!['type','unit','min','max'].includes(k))||['min','max'].some(k=>contract[k]!==undefined&&(contract.type!=='number'||!Number.isFinite(contract[k])))||contract.min!==undefined&&contract.max!==undefined&&contract.min>contract.max)fail('Unsupported field contract');
    const valid=value=>typeof value===contract.type&&(contract.type!=='number'||Number.isFinite(value))&&(contract.type!=='string'||nonempty(value))&&(contract.min===undefined||value>=contract.min)&&(contract.max===undefined||value<=contract.max);
    if(!valid(row.expected)||!valid(row.observed)||(row.field==='exact_hp'&&(contract.type!=='number'||contract.unit!=='hp'||row.expected<0||row.observed<0)))fail('Invalid typed comparison values');
    const expected=source(row.expected_source,'expected',row,contract),observed=source(row.observed_source,'observed',row,contract);
    if(!equal(expected,row.expected)||!equal(observed,row.observed))fail('Receipt contradicts parsed source values');
    ids.add(row.id);fields.add(row.field);
    if(!equal(row.expected,row.observed))mismatches++;
    if(!cases.has(row.case_id))cases.set(row.case_id,new Set());if(cases.get(row.case_id).has(row.field))fail('Duplicate case field');cases.get(row.case_id).add(row.field);
  }
  if(!Object.hasOwn(FIELDS,entry.kind)||[...cases.values()].some(caseFields=>FIELDS[entry.kind].some(f=>!caseFields.has(f))))fail('Required kind assertions missing');
  if(body.status!==(mismatches?'failed':'passed')||body.mismatches!==mismatches||entry.status!==body.status||entry.mismatches!==mismatches||mismatches)fail('Contradictory or failed comparisons');
  for(const caseId of cases.keys()){
  const observed=field=>body.observations.find(r=>r.case_id===caseId&&r.field===field)?.observed;
  if(entry.kind==='accepted-complete-team'&&observed('registration_accepted')!==true)fail('Expected accepted registration');
  if(entry.kind==='rejected-complete-team'&&(observed('registration_accepted')!==false||!nonempty(observed('rejection_code'))))fail('Expected named rejection');
  if(entry.kind==='complete-client-battles'&&(observed('terminal')!==true||!['player','opponent','draw'].includes(observed('winner'))))fail('Incomplete battle');
  if(entry.kind==='competitive-policy-quality'&&(observed('acceptance_met')!==true||!nonempty(body.protocol_id)||body.held_out!==true))fail('Missing held-out evaluation protocol');
  if(entry.kind==='live-service'&&(observed('allow')!==true||observed('deny')!==false||!nonempty(body.environment)))fail('Missing allow/deny proof');
  if(entry.kind==='paired-browser-replays'&&(observed('replay_match')!==true||observed('loaded_assets_match')!==true||!equal(body.loaded_assets,identity.external_assets)))fail('Missing loaded candidate proof');
  if(HOSTED_KINDS.includes(entry.kind)){
    const capture=body.hosted_capture,origins=identity.hosted_origins;
    let url;try{url=new URL(entry.source_url);}catch{fail('Invalid hosted URL');}
    if(url.protocol!=='https:'||url.username||url.password||url.hostname==='localhost'||!url.hostname.includes('.')||/^[\d.]+$/.test(url.hostname)||url.hostname.includes(':')||/\.(localhost|local)$/.test(url.hostname))fail('Hosted proof requires a remote HTTPS origin');
    if(!origins?.preview||!origins.production||origins.preview===origins.production)fail('Missing distinct approved preview origin');
    const rollback=entry.kind==='rollback-verification',expected=rollback?identity.rollback_target:{commit:identity.checked_commit,bundle_sha256:identity.bundle_sha256,external_assets:identity.external_assets};
    if(!expected||!/^([a-f0-9]{40})$/.test(expected.commit||'')||!/^[a-f0-9]{64}$/.test(expected.bundle_sha256||'')||!expected.external_assets)fail('Missing exact hosted target');
    if(url.origin!==(entry.kind==='hosted-preview-e2e'?origins.preview:origins.production)||capture?.url!==entry.source_url||capture?.environment!==entry.kind||capture?.source_commit!==expected.commit||capture?.bundle_sha256!==expected.bundle_sha256||!equal(body.loaded_assets,expected.external_assets)||!nonempty(capture?.deployment_run_url)||!nonempty(capture?.publication_approval_id))fail('Hosted deployment/identity context mismatch');
    if(FIELDS[entry.kind].some(field=>observed(field)!==true))fail('Hosted journey did not pass');
  }
  }
  if(body.oracle==='official-publication'){
    const raw=load(entry.source_capture,`${entry.id} official capture`);if(!raw?.length)fail('Empty official source');
    const text=raw.toString('utf8');
    for(const field of FIELDS[entry.kind]){
      const span=body.source_spans?.[field];
      if(!span||!Number.isInteger(span.start)||!Number.isInteger(span.end)||span.start<0||span.end<=span.start||text.slice(span.start,span.end)!==String(target[field])||body.observations.some(r=>r.field===field&&r.observed!==target[field])||entry.extracted?.[field]!==target[field])fail('Official extraction differs from captured bytes');
    }
  }
  return {cases};
}
