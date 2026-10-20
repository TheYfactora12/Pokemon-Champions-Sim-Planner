import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {referenceIdentity} from './showdown-reference.mjs';
import {discoverTests} from './run-project-gate.mjs';
import {localAssessment} from './check-competitive-readiness.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),out=path.join(root,'artifacts/accuracy-standard');
fs.mkdirSync(out,{recursive:true});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const commit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
if(process.env.GITHUB_SHA && process.env.GITHUB_SHA!==commit)throw Error('CI checkout is not the declared SHA');
const lanes={
  'independent-shared-reference':['showdown_damage_oracle_tests.js','rough_skin_reference_tests.mjs','showdown_complete_game_tests.mjs'],
  'player-information-boundary':['default_policy_boundary_tests.js','utility_information_policy_tests.js'],
  'legality-version-roster':['mc_reference_registration_tests.js','mc_reference_intake_tests.mjs','move_verification_registry_tests.js'],
  'checker-sensitivity':['artifact_outcome_truth_tests.js','test_method_mutation_tests.mjs','visible_replay_comparison_tests.mjs','competitive_readiness_tests.mjs']
};
const files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean)
  .filter(name=>/\.(js|mjs|cjs|json|html|py)$/.test(name)&&!name.startsWith('artifacts/'));
const hashes=Object.fromEntries(files.map(name=>[name,sha(fs.readFileSync(path.join(root,name)))]));
const artifact=JSON.parse(fs.readFileSync(path.join(root,'generated/release_artifact.json')));
if(sha(fs.readFileSync(path.join(root,artifact.bundle_name)))!==artifact.bundle_sha256)throw Error('Bundle differs from release artifact');
const report={schema_version:1,commit,run_id:process.env.GITHUB_RUN_ID||null,run_attempt:process.env.GITHUB_RUN_ATTEMPT||null,
  generated_at:new Date().toISOString(),reference:referenceIdentity(),artifact,hashes,lanes:{},
  exclusions:discoverTests().filter(t=>t.lane==='skip'),
  units:'Suites are file executions, not independent accuracy cases. Side permutations and repeated assertions remain within their named scenario.',
  visible_browser:{status:'separate_job',reason:'Pinned Playwright/Chromium browser checks run in Candidate browser replay evidence; inspect its exact-head receipt and retained captures.'},
  client_parity:{status:'not_run',reason:'Current-client immutable reviewed evidence incomplete'},
  policy_quality:{status:'not_run',reason:'Information isolation is not competitive strength'}};
let failed=false;
for(const [lane,suites] of Object.entries(lanes)){
  report.lanes[lane]=[];
  for(const suite of suites){
    const run=spawnSync(process.execPath,[path.join(root,'tests',suite)],{cwd:root,encoding:'utf8',timeout:180000,maxBuffer:8*1024*1024});
    const log=`${suite}.log`;fs.writeFileSync(path.join(out,log),(run.stdout||'')+(run.stderr||''));
    const passed=run.status===0&&!run.error&&!run.signal;
    report.lanes[lane].push({suite,status:passed?'passed':'failed',exit:run.status,signal:run.signal,log});
    failed ||= !passed;console.log(`${passed?'PASS':'FAIL'} ${lane}: ${suite}`);
  }
}
report.competitive_release=localAssessment();
report.development_status=failed?'failed':'passed';
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log(`Development: ${report.development_status}; competitive release: ${report.competitive_release.status}; browser: ${report.visible_browser.status}`);
if(failed||report.competitive_release.status==='INVALID')process.exitCode=1;
