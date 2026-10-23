import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');
async function activate(mutate=s=>s){
 const events={},deleted=[],keys=['champions-sim-current','champions-sprites-v1','champions-sim-v2-old','champions-sprites-v0','consulting-app-v4','ai-lab-cache','other-app','champions-similar-app','champions-help-v1'];let claimed=false,pending;
 const self={CHAMPIONS_RELEASE_MANIFEST:{service_worker_cache:keys[0]},addEventListener:(name,handler)=>{events[name]=handler;},clients:{claim:()=>{claimed=true;}}};
 vm.runInNewContext(mutate(source),{self,importScripts(){},URL,caches:{keys:async()=>keys,delete:async key=>{deleted.push(key);}}});
 events.activate({waitUntil:p=>{pending=p;}});await pending;
 return {deleted,claimed};
}
test('activation retains current app, sprite and unrelated origin caches',async()=>{
 const r=await activate();assert.deepEqual(r.deleted,['champions-sim-v2-old','champions-sprites-v0']);assert(r.claimed);
});
test('old broad deletion is caught by coexistence control',async()=>{
 const r=await activate(s=>s.replace('/^(champions-sim-|champions-sprites-)/.test(k) && ',''));
 assert(r.deleted.includes('consulting-app-v4'));assert.notDeepEqual(r.deleted,['champions-sim-v2-old','champions-sprites-v0']);
});
