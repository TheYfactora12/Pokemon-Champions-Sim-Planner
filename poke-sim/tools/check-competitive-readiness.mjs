import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash, verify} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {isDeepStrictEqual as equal} from 'node:util';
import {createRequire} from 'node:module';
import {parseEvidence,installedInventory} from './competitive-evidence-schema.mjs';

export const REQUIRED = Object.freeze([
  'official-client-version', 'regulation-rules', 'accepted-complete-team',
  'rejected-complete-team', 'client-mechanics', 'complete-client-battles',
  'competitive-policy-quality', 'live-service', 'paired-browser-replays'
]);
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const root = fileURLToPath(new URL('../', import.meta.url));

// JSON declarations are never approval. Verify exact package bytes and a signature
// from a separately reviewed human key. No production keys are enrolled yet.
export function assess(manifest, {read, now, identity, keys = []}) {
  const blockers = [], errors = [];
  const block = message => blockers.push(message);
  const fault = message => errors.push(message);
  if (manifest?.schema_version !== 1) fault('Unsupported readiness schema');
  const target = manifest?.target;
  if (!target || target.format !== 'doubles' || !target.client_version || !target.regulation_id) fault('Missing explicit doubles/client/regulation target');
  if (target) {
    const start = Date.parse(target.effective_from_utc), end = Date.parse(target.effective_to_utc);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) fault('Invalid effective interval');
    else if (now < start || now > end) block('Target regulation outside effective interval');
    if (!target.server_context || target.server_context.startsWith('needs_')) block('Current server/maintenance context unverified');
  }
  const load = (ref, label) => {
    if (!ref?.path || !/^[a-f0-9]{64}$/.test(ref.sha256 || '')) { block(`${label}: missing immutable bytes`); return null; }
    if (path.isAbsolute(ref.path) || ref.path.split(/[\\/]/).includes('..')) { fault(`${label}: unsafe evidence path`); return null; }
    try {
      const bytes = read(ref.path);
      if (sha256(bytes) !== ref.sha256) { fault(`${label}: byte digest mismatch`); return null; }
      return bytes;
    } catch { block(`${label}: evidence unavailable`); return null; }
  };
  if (!Array.isArray(identity.unproved_cases) || identity.unproved_cases.length) block('Declared benchmark still contains partial/open cases');
  const bytes = load(manifest?.package, 'Regulation evidence package');
  let pkg;
  if (bytes) {
    try { pkg = JSON.parse(bytes); } catch { fault('Invalid package JSON'); }
  }
  if (pkg) {
    if (pkg.schema_version !== 1) fault('Unsupported package schema');
    if (JSON.stringify(pkg.target) !== JSON.stringify(target)) block('Package client/regulation/server context mismatch');
    for (const field of ['build_id', 'engine_sha256', 'bundle_sha256', 'reference_sha256', 'benchmark_sha256']) {
      if (!identity[field] || pkg.identity?.[field] !== identity[field]) block(`Stale package identity: ${field}`);
    }
    if (!Array.isArray(pkg.evidence)) fault('Evidence inventory absent');
    const entries = Array.isArray(pkg.evidence) ? pkg.evidence : [], ids = new Set(), parsed = new Map();
    for(const field of ['external_assets','installed_reference','checker_schema']) if(!identity[field] || !equal(pkg.identity?.[field],identity[field])) block(`Stale complete identity: ${field}`);
    for (const entry of entries) {
      if (!entry.id || ids.has(entry.id)) fault('Duplicate or absent evidence ID');
      ids.add(entry.id);
      const evidenceBytes=load(entry, entry.id || 'unnamed evidence');
      try { parsed.set(entry.id,parseEvidence(evidenceBytes,entry,{target,identity:pkg.identity,load})); } catch(error) { fault(error.message); }
      if (entry.status !== 'passed' || entry.mismatches !== 0) block(`${entry.id}: comparison not passed`);
      if (!Number.isFinite(Date.parse(entry.captured_at_utc)) ||
          Date.parse(entry.captured_at_utc) > now ||
          Date.parse(entry.captured_at_utc) < Date.parse(target.effective_from_utc)) block(`${entry.id}: stale/invalid capture time`);
      if (entry.client_version !== target.client_version || entry.regulation_id !== target.regulation_id ||
          entry.format !== target.format || entry.server_context !== target.server_context) block(`${entry.id}: wrong capture context`);
      if (['official-client-version','regulation-rules'].includes(entry.kind)) {
        let hostname='',protocol='';try{const url=new URL(entry.source_url);hostname=url.hostname;protocol=url.protocol;}catch{}
        const official=entry.kind==='official-client-version' ? ['www.nintendo.com'] : ['champions-news.pokemon-home.com','champions.pokemon.com','www.pokemon.com'];
        if(entry.oracle!=='official-publication' || protocol!=='https:' || !official.includes(hostname)) block(`${entry.id}: official provenance absent`);
        if(entry.extracted?.client_version!==target.client_version || entry.extracted?.regulation_id!==target.regulation_id) block(`${entry.id}: extracted source context mismatch`);
        if(entry.kind==='regulation-rules' && ['format','effective_from_utc','effective_to_utc'].some(field=>entry.extracted?.[field]!==target[field])) block(`${entry.id}: extracted regulation interval/format mismatch`);
        load(entry.source_capture,`${entry.id} official capture`);
      }
      if (entry.kind?.startsWith('client-') || ['complete-client-battles','accepted-complete-team','rejected-complete-team'].includes(entry.kind)) {
        if (entry.oracle !== 'champions-client') block(`${entry.id}: reference cannot substitute for client truth`);
      }
    }
    const caseResults=pkg.case_results;
    const strings=value=>Array.isArray(value) && value.length>0 && value.every(v=>typeof v==='string' && v.trim().length>0);
    const requirements=identity.benchmark_requirements || {};
    if(!Array.isArray(caseResults) || !identity.benchmark_cases?.every(id=>{
      const required=requirements[id];
      if(!strings(required?.asserted_fields) || !strings(required?.evidence_kinds)) return false;
      return caseResults.some(row=>row.id===id && row.status==='passed' && row.mismatches===0 &&
        strings(row.asserted_fields) && required.asserted_fields.every(field=>row.asserted_fields.includes(field) && row.evidence_ids?.some(eid=>parsed.get(eid)?.cases.get(id)?.has(field))) &&
        strings(row.evidence_ids) && row.evidence_ids.every(eid=>entries.some(e=>e.id===eid && e.status==='passed')) &&
        required.evidence_kinds.every(kind=>required.asserted_fields.every(field=>entries.some(e=>row.evidence_ids.includes(e.id) && e.kind===kind && e.status==='passed' && parsed.get(e.id)?.cases.get(id)?.has(field)))));
    })) block('Per-case assertions and evidence bindings incomplete');
    if(Array.isArray(caseResults) && new Set(caseResults.map(r=>r.id)).size!==caseResults.length) fault('Duplicate benchmark results');
    for (const kind of REQUIRED) if (!entries.some(e => e.kind === kind)) block(`Missing mandatory evidence: ${kind}`);
    if (!Array.isArray(pkg.unsupported) || pkg.unsupported.length) block('Included unsupported mechanics unresolved');
    if (!Array.isArray(pkg.benchmark_cases) || new Set(pkg.benchmark_cases).size!==pkg.benchmark_cases.length || pkg.benchmark_cases.length!==identity.benchmark_cases?.length || !identity.benchmark_cases?.length ||
        identity.benchmark_cases.some(id => !pkg.benchmark_cases.includes(id))) block('Mandatory benchmark case evidence missing');
    const approval = manifest.approval;
    const key = keys.find(k => k.id === approval?.key_id && k.role === 'human-release-reviewer');
    if (!key || !approval?.signature) block('Authenticated human review absent');
    else {
      try {
        if (!verify(null, bytes, key.public_key, Buffer.from(approval.signature, 'base64'))) fault('Approval signature/digest mismatch');
      } catch { fault('Invalid approval signature/key'); }
    }
  } else block('Complete reviewed package unavailable');
  return {schema_version:1, status: errors.length ? 'INVALID' : blockers.length ? 'NO-GO' : 'READY',
    target, identity, errors, blockers, claim:'Readiness for the declared competitive scope only; check totals are not accuracy percentages.'};
}

export function localAssessment(base = root) {
  const read = name => {
    const resolved = fs.realpathSync(path.resolve(base, name));
    if (!resolved.startsWith(fs.realpathSync(base) + path.sep)) throw Error('Evidence outside repository root');
    return fs.readFileSync(resolved);
  };
  const json = name => JSON.parse(read(name));
  const artifact = json('generated/release_artifact.json');
  const matrix = json('battle_edge_case_matrix.json');
  const require=createRequire(path.join(base,'package.json'));
  const referenceRoot=path.dirname(require.resolve('pokemon-showdown/package.json'));
  const external_assets=Object.fromEntries(Object.entries(artifact.external_assets).map(([name,row])=>{const actual=sha256(read(name));if(actual!==row.sha256)throw Error(`External asset differs: ${name}`);return [name,actual];}));
  const identity = {
    external_assets,installed_reference:installedInventory(referenceRoot),
    checker_schema:Object.fromEntries(['tools/check-competitive-readiness.mjs','tools/competitive-evidence-schema.mjs'].map(name=>[name,sha256(read(name))])),
    build_id:artifact.build_id, engine_sha256:sha256(read('engine.js')),
    bundle_sha256:sha256(read(artifact.bundle_name)),
    reference_sha256:sha256(read('package-lock.json')),
    benchmark_sha256:sha256(read('battle_edge_case_matrix.json')),
    benchmark_cases:matrix.cases.map(c=>c.id),
    benchmark_requirements:Object.fromEntries(matrix.cases.map(c=>[c.id,c.release_requirements || null])), unproved_cases:matrix.cases.filter(c=>c.status!=='covered').map(c=>c.id),
    checked_commit:execFileSync('git',['rev-parse','HEAD'],{cwd:base,encoding:'utf8'}).trim(),
    github_sha:process.env.GITHUB_SHA || null,
    run_id:process.env.GITHUB_RUN_ID || null, run_attempt:process.env.GITHUB_RUN_ATTEMPT || null
  };
  const result = assess(json('source/competitive-release-evidence.json'), {
    read, now:Date.now(), identity, keys:json('source/competitive-review-keys.json').keys
  });
  if (artifact.bundle_sha256 !== identity.bundle_sha256) result.errors.push('Release artifact differs from actual bundle');
  if (identity.github_sha && identity.github_sha !== identity.checked_commit) result.errors.push('Checked commit differs from CI commit');
  if (result.errors.length) result.status='INVALID';
  result.benchmark_status = Object.fromEntries(['covered','partial','open'].map(status=>[status,matrix.cases.filter(c=>c.status===status).length]));
  result.evidence_layers = {
    client_truth:'Requires reviewed current client package',
    shared_reference:'Pinned Showdown probes only; not client parity',
    invariants:'Internal consistency and repeatability only',
    replay:'Rendered/exported agreement only',
    policy_quality:'Requires independent player/task evaluation; legal choices alone insufficient'
  };
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = localAssessment();
  const output = process.argv.indexOf('--report');
  if (output >= 0) fs.writeFileSync(process.argv[output+1], JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
  if (result.status === 'INVALID' || (process.argv.includes('--strict') && result.status !== 'READY')) process.exitCode=1;
}
