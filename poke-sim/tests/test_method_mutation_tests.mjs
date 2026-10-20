import assert from 'node:assert/strict';
import {test} from 'node:test';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadAccuracyRuntime,checkState,seedFor} from '../tools/run-accuracy-validation.mjs';
import {referenceProbes} from './fixtures/showdown_reference_probes.mjs';
import {compareProbe,loadLocalEngine} from '../tools/showdown-reference.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),out=new URL('../artifacts/test-method-controls/',import.meta.url);
fs.mkdirSync(out,{recursive:true});
for(const [mutant,suite,pattern] of [
  ['fakeout_extra_attack','t9j17_tests.js'],
  ...['fakeout_choice_bypass','fakeout_encore_usable'].map(m=>[m,'default_policy_boundary_tests.js']),
  ...[['struggle_imprison','boundary false/imprison$'],['struggle_shield','boundary false/spiky-shield$'],
    ['struggle_disguise','cross-move lifecycle false'],['struggle_target','actual target player/0'],
    ['struggle_suppression','boundary false/gas-technician$']]
    .map(([m,p])=>[m,'struggle_boundary_reference_tests.mjs',p]),
  ...['encore_queue','encore_herb','encore_duration','encore_priority'].map(m=>[m,'encore_reference_tests.mjs','Encore false/0/(before|herb|after|changed-priority)$']),
  ...['roll_fifteen','roll_continuous'].map(m=>[m,'discrete_damage_reference_tests.mjs']),
  ['encore_unburden','encore_reference_tests.mjs','herb-unburden'],
  ['rest_leaf_guard','rest_reference_tests.mjs','Rest Leaf Guard player/0/(sun|sun-gas-shield)$'],
  ['rest_admission','rest_reference_tests.mjs','Rest terrain and ally admission player/0/(electric|ally)$'],
  ...['struggle_fixed','struggle_floor','struggle_normal'].map(m=>[m,'struggle_reference_tests.mjs','Struggle false/0/0/(normal|ghost)']),
  ['half_damage','showdown_damage_oracle_tests.js'],
  ['tantrum_150_percent','amnesia_reference_tests.mjs'],
  ['hidden_read','default_policy_boundary_tests.js'],
  ['switch_noop','scripted_switch_reference_tests.mjs']
]) test(`independent ${suite} kills ${mutant} with healthy control`,()=>{
  const childEnv={...process.env};delete childEnv.NODE_TEST_CONTEXT;
  const suiteArgs=pattern?[`--test-name-pattern=${pattern}`,`tests/${suite}`]:[`tests/${suite}`];
  const baseline=spawnSync(process.execPath,suiteArgs,{cwd:root,encoding:'utf8',timeout:120000,env:childEnv});
  fs.writeFileSync(new URL(`${mutant}-baseline.log`,out),(baseline.stdout||'')+(baseline.stderr||''));
  assert.equal(baseline.status,0,baseline.stderr);
  const bad=spawnSync(process.execPath,['--require','./tools/test-engine-mutant.cjs',...suiteArgs],{
    cwd:root,encoding:'utf8',timeout:120000,env:{...childEnv,CHAMPIONS_TEST_MUTANT:mutant}});
  fs.writeFileSync(new URL(`${mutant}-mutant.log`,out),(bad.stdout||'')+(bad.stderr||''));
  assert.equal(bad.signal,null);assert.notEqual(bad.status,null);assert.notEqual(bad.status,0);
  assert.notEqual(bad.status,97);assert.match(bad.stderr, new RegExp('MUTATION_APPLIED:'+mutant));
  if(mutant.startsWith('fakeout_')){
    const transcript=(bad.stdout||'')+(bad.stderr||'');
    assert.doesNotMatch(transcript,/Mutation anchor missing or ambiguous|SyntaxError/);
    if(mutant==='fakeout_extra_attack'){
      assert.match(transcript,/FAIL B3\. Injected late Fake Out/);
      assert.match(transcript,/Struggle.*38 dmg/);
      assert.match(transcript,/Struggle recoil! \[42 dmg\]/);
    }else{
      assert.match(transcript,/AssertionError/);
      assert.match(transcript,mutant==='fakeout_choice_bypass'?/\+ 'Tackle'/:/\+ 'Fake Out'/);
      assert.match(transcript,/- 'Struggle'/);
    }
  }
  if(mutant==='struggle_fixed'){
    const transcript=(bad.stdout||'')+(bad.stderr||'');
    assert.match(transcript,/actual: 38/);assert.match(transcript,/expected: 29/);
    assert.match(transcript,/fail 2/);
  }
  if(mutant==='tantrum_150_percent'){
    const transcript=(bad.stdout||'')+(bad.stderr||'');
    assert.match(transcript,/actual: 57/);assert.match(transcript,/expected: 76/);
    assert.match(transcript,/fail 2/);assert.match(transcript,/pass 28/);
  }
});
test('16 actual doubles results reject flipped one-sided-elimination winners',()=>{
  const {context}=loadAccuracyRuntime(),ids=Object.keys(context.TEAMS).sort().slice(0,4),receipts=[];
  for(const p of ids)for(const o of ids){
    const a=context.TEAMS[p],b=context.TEAMS[o],result=context.simulateBattle(a,b,{
      format:'doubles',rulesetId:'champions_custom_practice',maxTurns:60,seed:seedFor(`${p}|${o}`),
      playerBring:a.members.slice(0,4).map(m=>m.name),opponentBring:b.members.slice(0,4).map(m=>m.name)});
    checkState(result,'doubles',4);
    const bad=structuredClone(result);bad.result=result.result==='win'?'loss':'win';
    assert.throws(()=>checkState(bad,'doubles',4),/winner disagrees/);
    receipts.push({p,o,result:result.result,mutant:bad.result,killed:true});
  }
  fs.writeFileSync(new URL('winner-controls.json',out),JSON.stringify(receipts,null,2));
});
test('exact fixed-damage oracle rejects one-HP corruption; randomized probes disclose exclusions',()=>{
  for(const id of ['tailwind-midturn-speed','earthquake-flying-ally','seismic-toss-fixed-damage']){
    const fixture=referenceProbes().find(f=>f.id===id),local=loadLocalEngine();
    const baseline=compareProbe(fixture,local);assert.equal(baseline.status,'agreement_in_declared_scope');
    const real=local.context.simulateBattle;let changed=0;
    local.context.simulateBattle=(...args)=>{const r=real(...args);for(const t of r.turnLog)for(const m of t.post.roster.opponent)
      if(m.hp_current>1&&m.hp_current<m.hp_max){m.hp_current--;changed++;}return r;};
    const bad=compareProbe(fixture,local);assert(changed>0);
    if(fixture.compareExactHP){assert.equal(bad.status,'mismatch');assert(bad.differences.some(d=>d.kind==='post_hp'));}
    else {assert(bad.not_compared.includes('exact_hp'));assert.equal(bad.accuracy_claim_eligible,false);}
    fs.writeFileSync(new URL(`${id}-hp-control.json`,out),JSON.stringify({baseline,bad},null,2));
  }
});
