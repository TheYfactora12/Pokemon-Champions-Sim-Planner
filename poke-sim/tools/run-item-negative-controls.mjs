import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync,execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const engine=fs.readFileSync(path.join(root,'engine.js'),'utf8');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'champions-item-controls-'));
const controls=[
 ['original-base',execFileSync('git',['show','2769879d005f10102754d6fa539e5925bfe9a836:poke-sim/engine.js'],{cwd:root,encoding:'utf8'}),'Full-six admitted','item_lifecycle_reference_tests.mjs'],
 ['white-no-consumption',engine.replace("!negative.length || !_consumeHeldItem(mon)","!negative.length"),'player/0/intimidate','white_herb_reference_tests.mjs'],
 ['white-clears-positive',engine.replace("filter(stat => mon.statBoosts[stat] < 0)","filter(stat => mon.statBoosts[stat] !== 0)"),'player/0/multi','white_herb_reference_tests.mjs'],
 ['white-only-attack',engine.replace("filter(stat => mon.statBoosts[stat] < 0)","filter(stat => stat === 'atk' && mon.statBoosts[stat] < 0)"),'player/0/close-combat','white_herb_reference_tests.mjs'],
 ['red-no-activation',engine.replace("function prepareRedCard(attacker, move) {","function prepareRedCard(attacker, move) { return false;"),'player/0/normal','red_card_reference_tests.mjs'],
 ['red-no-bench-gate',engine.replace(" || !bench.some(mon => mon.alive && mon.hp > 0)",""),'player/0/no-bench','red_card_reference_tests.mjs'],
 ['red-heuristic-reserve',engine.replace("eligible[Math.floor(rng()*eligible.length)]","eligible[0]"),'samples both','item_lifecycle_reference_tests.mjs'],
 ['red-post-hit-speed',engine.replace("speed: state.speeds.get(mon)","speed: mon.getEffSpeed(field)"),'pre-action speed','item_lifecycle_reference_tests.mjs'],
 ['herb-after-pivot',engine.replace("if (moveSwitchQueue) {","if (false && moveSwitchQueue) {"),'Parting Shot Herb','item_lifecycle_reference_tests.mjs'],
];
let failed=false;const results=[];
for(const [name,source,pattern,test]of controls){
 if(source===engine)throw new Error('Mutation not applied: '+name);
 const file=path.join(dir,name+'.js');fs.writeFileSync(file,source);
 const run=spawnSync(process.execPath,['--test','--test-reporter=tap','--test-name-pattern='+pattern,path.join(root,'tests',test)],
  {encoding:'utf8',env:{...process.env,ITEM_ENGINE_SOURCE:file}});
 const assertions=/# fail [1-9]/.test(run.stdout)&&/AssertionError/.test(run.stdout);
 const killed=run.status!==0&&assertions;failed||=!killed;
 results.push({name,killed,exit:run.status,assertion_failure:assertions,stdout:run.stdout,stderr:run.stderr});
}
console.log(JSON.stringify({controls:results.length,killed:results.filter(r=>r.killed).length,results},null,2));
fs.rmSync(dir,{recursive:true});
if(failed)process.exitCode=1;
