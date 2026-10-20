import {createHash} from 'node:crypto';
import {isDeepStrictEqual as equal} from 'node:util';
import path from 'node:path';

export const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const text = x => typeof x === 'string' && x.trim().length > 0;
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const hash = x => /^[a-f0-9]{64}$/.test(x || '');
const dependencies = ['engine','data','runner','test','reference','checker'];
const escape = x => x.replaceAll('~','~0').replaceAll('/','~1');

// Validates consistency with caller-supplied current identities, not authorship,
// execution authenticity, legal-team eligibility or Champions client parity.
export function assessBoundedAssertion(receipt, {read, current}) {
  const errors=[], stale=[], mismatches=[];
  const require = (ok, message) => { if(!ok) throw Error(message); };
  const load = (ref, label) => {
    require(text(ref?.path) && !path.isAbsolute(ref.path) && !/^[A-Za-z]:/.test(ref.path) &&
      !ref.path.split(/[\\/]/).includes('..') && hash(ref.sha256), `${label}: invalid content reference`);
    const bytes=read(ref.path);
    require(digest(bytes)===ref.sha256, `${label}: content hash mismatch`);
    const value=JSON.parse(bytes);
    require(object(value), `${label}: structured object required`);
    return value;
  };
  try {
    require(receipt?.schema_version==='champions-bounded-assertion-v1','receipt schema');
    require(text(receipt.assertion_id)&&text(receipt.case_id),'assertion/case identity');
    require(object(current)&&hash(current.contract_sha256)&&hash(current.inputs_sha256),'current contract/input identity required');
    require(object(current.dependencies)&&dependencies.every(k=>hash(current.dependencies[k])),'current dependencies required');
    require(object(receipt.dependencies)&&dependencies.every(k=>hash(receipt.dependencies[k])),'receipt dependencies required');
    require(object(current.scope)&&current.scope.oracle_kind==='shared_reference'&&
      current.scope.format==='gen9championsdoublescustomgame'&&current.scope.regulation_id===null&&
      current.scope.client_version===null&&Array.isArray(current.scope.boundaries)&&
      current.scope.boundaries.length>0&&current.scope.boundaries.every(text),'unsupported current scope');
    require(equal(receipt.scope,current.scope),'scope mismatch or promotion');
    if(!equal(receipt.dependencies,current.dependencies))stale.push('dependencies changed');
    if(receipt.contract?.sha256!==current.contract_sha256)stale.push('contract changed');
    if(receipt.inputs?.sha256!==current.inputs_sha256)stale.push('inputs changed');
    const contract=load(receipt.contract,'contract'), inputs=load(receipt.inputs,'inputs');
    require(contract.schema_version==='bounded-contract-v1'&&contract.assertion_id===receipt.assertion_id&&
      contract.case_id===receipt.case_id&&equal(contract.scope,receipt.scope),'contract identity/scope');
    require(inputs.schema_version==='bounded-inputs-v1'&&inputs.assertion_id===receipt.assertion_id&&
      inputs.case_id===receipt.case_id&&equal(inputs.scope,receipt.scope)&&
      inputs.contract_sha256===receipt.contract.sha256,'input identity/scope');
    require(Array.isArray(inputs.teams)&&inputs.teams.length===2&&inputs.teams.every(t=>object(t)&&Object.keys(t).length>0)&&
      Array.isArray(inputs.actions)&&inputs.actions.length>0&&inputs.actions.every(a=>object(a)&&Object.keys(a).length>0)&&
      Array.isArray(inputs.seed)&&inputs.seed.length>0&&inputs.seed.every(Number.isInteger)&&
      object(inputs.initial_state)&&object(inputs.rng_controls)&&Object.keys(inputs.rng_controls).length>0,'incomplete structured inputs');
    require(Array.isArray(contract.fields)&&contract.fields.length>0,'empty contract');
    const names=new Set();
    for(const field of contract.fields){
      require(object(field)&&Object.keys(field).every(k=>['field','type','unit','min','max','expected'].includes(k))&&
        text(field.field)&&!names.has(field.field)&&['number','string','boolean'].includes(field.type)&&text(field.unit),'invalid field contract');
      names.add(field.field);
      require(['min','max'].every(k=>field[k]===undefined||(field.type==='number'&&Number.isFinite(field[k])))&&
        !(field.min!==undefined&&field.max!==undefined&&field.min>field.max),'invalid field bounds');
    }
    const valid=(v,f)=>typeof v===f.type&&(f.type!=='number'||Number.isFinite(v))&&
      (f.type!=='string'||text(v))&&(f.min===undefined||v>=f.min)&&(f.max===undefined||v<=f.max);
    for(const role of ['local_result','reference_result']){
      const result=load(receipt[role],role);
      require(Object.keys(result).every(k=>['schema_version','role','status','assertion_id','case_id','inputs_sha256','contract_sha256','scope','dependencies','observations'].includes(k)),'unsupported result metadata');
      require(result.schema_version==='bounded-result-v1'&&result.role===role&&result.status==='complete'&&
        result.assertion_id===receipt.assertion_id&&result.case_id===receipt.case_id&&
        result.inputs_sha256===receipt.inputs.sha256&&result.contract_sha256===receipt.contract.sha256&&
        equal(result.scope,receipt.scope)&&equal(result.dependencies,receipt.dependencies),'result identity/context');
      require(object(result.observations)&&equal(Object.keys(result.observations).sort(),[...names].sort()),'missing/extra observations');
      for(const field of contract.fields){
        const row=result.observations[field.field];
        require(object(row)&&Object.keys(row).every(k=>['pointer','unit','value'].includes(k))&&row.pointer===`/observations/${escape(field.field)}/value`&&row.unit===field.unit,'wrong observation pointer/unit');
        require(valid(field.expected,field)&&valid(row.value,field),'invalid observation type/bounds');
        if(!equal(row.value,field.expected))mismatches.push(`${role}:${field.field}`);
      }
    }
    const derived=mismatches.length?'failed':'passed_declared_scope';
    if(receipt.status!==undefined)require(receipt.status===derived,'contradictory envelope status');
  } catch(error) { errors.push(error.message); }
  return {status:errors.length?'invalid':stale.length?'stale':mismatches.length?'failed':'passed_declared_scope',
    errors,stale,mismatches,competitive_use:false,authenticity:'not_established',
    claim:'Structured shared-reference comparison only; no receipt enrollment or whole-move verification.'};
}
