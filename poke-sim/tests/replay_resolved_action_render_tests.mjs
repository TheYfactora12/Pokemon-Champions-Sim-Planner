import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {compareVisibleReplay} from '../tools/compare-visible-replay.mjs';
const source=fs.readFileSync(new URL('../ui.js',import.meta.url),'utf8');
const start=source.indexOf('function csRenderReplayPlayByPlay('),end=source.indexOf('function _csResolveSnapshotKey',start);
const c=vm.createContext({_escapeHtml:x=>String(x),csReplayEffectTagLabel:x=>x});
vm.runInContext(source.slice(start,end),c);
const lines=turn=>Array.from(c.csRenderReplayPlayByPlay(turn).matchAll(/<b>(.*?)<\/b>/g),m=>m[1]);
const action=(key,i)=>({text:'Mirror used Tackle!',actor:'Mirror',actor_key:key,move:'Tackle',log_index:i});
const damage=(key,n)=>({attacker:'Mirror',attacker_key:key,move:'Tackle',target:'Other',applied_damage:n});
const raw=n=>({text:`Mirror used Tackle! → Other [${n} dmg, 50/100 HP]`});
const t={actions:{player:[{actor:'Mirror',move:'Tackle'}],opponent:[{actor:'Mirror',move:'Tackle'}]},events:[action('p',0),raw(25)],damage_events:[damage('p',25)]};
assert.equal(lines(t).length,1,'unexecuted planned mirror action is not rendered');
t.events.push(action('o',2),raw(30));t.damage_events.push(damage('o',30));assert.equal(lines(t).length,2);assert.match(lines(t)[1],/lost 30 HP/);
t.events=[action('p',0),raw(25),raw(25)];t.damage_events=[damage('p',25),damage('p',25)];assert.equal((lines(t)[0].match(/lost 25 HP/g)||[]).length,2);
t.events=[{...action('p',0),text:'Mirror used Tackle! But it failed!'}];t.damage_events=[];assert.match(lines(t)[0],/failed/);
let pairs=0;
for(const id of ['JPtsTO','Vr96JJ','9CJCFA']) {
 const dir=path.resolve('poke-sim/artifacts/browser-replay-'+id);if(!fs.existsSync(dir))continue;
 for(const file of fs.readdirSync(dir).filter(f=>f.endsWith('.log.json'))) {
  const log=JSON.parse(fs.readFileSync(path.join(dir,file))),visual=JSON.parse(fs.readFileSync(path.join(dir,file.replace('.log.json','.visual.json'))));
  for(const turn of log.turnLog) visual.turns.find(v=>v.label===`T${turn.turn}`).lines=lines(turn);
  const result=compareVisibleReplay(log,visual);assert.equal(result.issues.length,0,JSON.stringify({id,file,issues:result.issues}));pairs++;
 }
}
console.log(`Resolved action renderer: 4 controls and ${pairs} retained replay rerenders passed (not fresh browser captures)`);
