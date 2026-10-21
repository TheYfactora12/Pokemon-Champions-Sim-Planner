// Explicit offline runtime profiles. Historical fixtures never certify current runtime.
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..');
const PROFILES=Object.freeze({
 historical:Object.freeze(['data.js','engine.js','generated/pokemon_showdown_legal_data.js']),
 current:Object.freeze(['data.js','own_state_policy.js','generated/pokemon_showdown_legal_data.js','generated/pokemon_showdown_species_weights.js','generated/champions_move_overrides.js','runtime_data.js','outcome_policy.js','engine.js','rulesets.js'])
});
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function snapshot(profile,root=ROOT){if(!PROFILES[profile])throw Error('Unknown golden runtime profile');return {schema_version:'golden-runtime-profile-v1',profile,files:PROFILES[profile].map(file=>({file,sha256:hash(fs.readFileSync(path.join(root,file)))}))};}
function loadProfile(profile,{root=ROOT,expected=snapshot(profile,root),read=file=>fs.readFileSync(path.join(root,file))}={}){
 assert(PROFILES[profile],'Unknown golden runtime profile');assert.equal(expected.schema_version,'golden-runtime-profile-v1');assert.equal(expected.profile,profile,'Runtime profile identity mismatch');
 assert.deepEqual(expected.files.map(row=>row.file),[...PROFILES[profile]],'Runtime profile omitted/reordered module');
 const sources=expected.files.map(row=>{const bytes=read(row.file);assert.equal(hash(bytes),row.sha256,`Runtime bytes mismatch: ${row.file}`);return [row.file,bytes.toString('utf8')];});
 // Verify all bytes before executing any module.
 const context=vm.createContext({console});for(const [file,source] of sources)vm.runInContext(source,context,{filename:file});
 vm.runInContext('this.TEAMS=TEAMS;this.simulateBattle=simulateBattle;',context);
 if(profile==='current')assert.equal(typeof context.ChampionsSim?.runtimeData?.getMoveRow,'function','Current runtime bridge absent');
 return {context,identity:expected,scope:profile==='current'?'current custom-practice runtime; no approved current golden expectations':'historical three-module trace compatibility only'};
}
function validateExpectationProfile(fixture,identity){
 if(identity.profile==='historical')return 'historical-only';
 assert.equal(fixture.runtime_profile,'current','Historical expectations cannot certify current runtime');
 assert.deepEqual(fixture.runtime_identity,identity,'Current expectations do not bind loaded runtime bytes');
 assert.equal(fixture.review_status,'approved-current-profile','Current expectations require separate review');
 return 'current-profile';
}
module.exports={PROFILES,snapshot,loadProfile,validateExpectationProfile};
