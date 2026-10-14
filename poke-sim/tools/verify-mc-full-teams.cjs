// Full registered-team decisions; no promotion, no network, no battle-strength claim.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),Module=require('node:module'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),inventory=require('./audit-mc-release-inventory.cjs').audit(root);
const draftFile=path.join(__dirname,'test-mc-draft-teams.cjs'),m=new Module(draftFile);m.filename=draftFile;m.paths=module.paths;
m._compile(fs.readFileSync(draftFile,'utf8').split('const output =')[0]+'\nmodule.exports={drafts};',draftFile);
const {TeamValidator}=require(path.join(root,'artifacts/showdown-mc-reference/dist/sim'));
const c=vm.createContext({console,Math,window:{}});
for(const file of ['data.js','generated/pokemon_showdown_legal_data.js','runtime_data.js','move_legality.js','generated/mc_review_reference.js','mc_review.js','legality.js','rulesets.js','engine.js']) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c);
c.ChampionsSim.pokemonDataAudit=require('../generated/pokemon_showdown_legal_data.js');
const appTeam=members=>({name:'reference full-team fixture',format:'champions',members:members.map(x=>({...x,name:x.species}))});
const rows=[];
for(const bo of [1,3]) for(const draft of m.exports.drafts) {
 const format=bo===1?'gen9championsvgc2026regmc':'gen9championsvgc2026regmcbo3';
 const base=structuredClone(draft.team);base[0].item='';
 const variants=[['base-six',base],['original-mega',structuredClone(draft.team)],
 ['size-four',base.slice(0,4)],['size-five',base.slice(0,5)],['size-seven',base.concat(base[0])],
 ...[['duplicate-item',t=>t[1].item=t[2].item],['duplicate-species',t=>t[1]=structuredClone(t[0])],
 ['excess-SP',t=>t[0].evs.atk=33],['bad-move',t=>t[0].moves=['Fissure','Spore','Splash','Teleport']],
 ['bad-ability',t=>t[0].ability='Wonder Guard']].map(([name,mutate])=>{const t=structuredClone(base);mutate(t);return [name,t];})];
 for(const [name,sets] of variants) {
  const referenceErrors=new TeamValidator(format).validateTeam(structuredClone(sets))||[];
  const app=c.checkMcReferenceExecution(appTeam(sets),{format:'doubles',bo,requireFullTeam:true});
  const unsupported=app.errors.length>0 && app.errors.every(e=>e.includes('Mega lifecycle not implemented'));
  if(name==='original-mega') {assert.equal(referenceErrors.length,0);assert.ok(app.allowed||unsupported);}
  else {assert.equal(app.allowed,referenceErrors.length===0,`${draft.id}/${bo}/${name}: ${app.errors} versus ${referenceErrors}`);}
  rows.push({draft:draft.id,bo,case:name,reference_accepted:referenceErrors.length===0,app_accepted:app.allowed,
    classification:unsupported?'legal_reference_unsupported_app_mechanics':'compared',reference_errors:referenceErrors,app_errors:Array.from(app.errors)});
 }
 const team=appTeam(base);
 for(const bring of [base.slice(0,4).map(x=>x.species),[base[0].species,base[0].species,base[1].species,base[2].species],['missing',...base.slice(0,3).map(x=>x.species)]]) {
  const app=c.checkMcReferenceExecution(team,{format:'doubles',bo,requireFullTeam:true,bring});
  assert.equal(app.allowed,new Set(bring).size===4&&!bring.includes('missing'));
 }
 const practice=c.checkMcReferenceExecution(appTeam(base.slice(0,4)),{format:'doubles',bo});
 assert.equal(practice.registration_scope,'reduced_roster_practice');assert.ok(practice.source_gaps.some(s=>s.includes('six registered')));
}
const report={pin:inventory.pin,compiled_fingerprint:inventory.compiled_fingerprint,competitive_use:false,
 scope:'reference validator versus app full-team gate; reduced-roster practice explicitly distinct; not official game acceptance',rows};
console.log(JSON.stringify(report,null,2));
