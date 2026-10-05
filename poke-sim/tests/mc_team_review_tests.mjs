import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
const ctx = vm.createContext({_escapeHtml:s=>String(s).replaceAll('<','&lt;')});
for (const file of ['data.js','generated/mc_review_reference.js','mc_review.js']) vm.runInContext(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'),ctx);
const run = team => ctx.reviewMcTeam(team,ctx.MC_REVIEW_REFERENCE);
test('all bundled catalog entries receive per-member review, not just source-tagged teams',()=>{
  const teams=vm.runInContext('TEAMS',ctx);
  assert.equal(Object.keys(teams).length,34);
  for(const team of Object.values(teams)) assert.equal(run(team).length,team.members.length);
  assert.ok(run(teams.player).some(r=>r.issues.some(i=>i.includes('U-turn'))));
  assert.ok(run(teams.indeedee_hatterene_tr).some(r=>r.name==='Amoonguss' && r.issues.length));
});
test('imports, edits and unknown identities cannot inherit old verdicts',()=>{
  const team={members:[{name:'Incineroar',moves:['Knock Off']}]};
  assert.ok(run(team)[0].issues.length);
  team.members[0].moves=['Fake Out'];
  assert.equal(run(team)[0].issues.length,0);
  team.members[0].name='Unknown';
  assert.equal(run(team)[0].speciesStatus,'Identity unverified');
});
test('Mega labels allow starting-form abilities without inventing ability legality',()=>{
  assert.equal(run({members:[{name:'Altaria-Mega',ability:'Cloud Nine',moves:['Protect']} ]})[0].issues.length,0);
  assert.ok(run({members:[{name:'Altaria-Mega',ability:'Wonder Guard',moves:['Protect']} ]})[0].issues.length);
});
test('reference passes stay unverified; display escapes names and does not mutate teams',()=>{
  const team={members:[{name:'<unknown>',moves:[]}]}, before=JSON.stringify(team);
  assert.match(ctx.csRenderMcReview(team),/&lt;unknown>/);
  assert.equal(JSON.stringify(team),before);
  assert.match(ctx.csRenderMcReview({members:[{name:'Incineroar',moves:['Fake Out']}]}),/LEGALITY UNVERIFIED/);
  assert.equal(run({format:'sv',members:[]}),null);
});
