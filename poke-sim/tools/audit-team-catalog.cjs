// Read-only reference audit; generated reports do not approve or mutate teams.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const {createHash} = require('node:crypto');
const root = path.resolve(__dirname,'..');
const upstream = path.join(root,'artifacts/showdown-mc-reference');
const pin='efe4948570d5e8189751792136d26e71710c6c66';
assert.equal(execFileSync('git',['-C',upstream,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),pin);
assert.equal(execFileSync('git',['-C',upstream,'status','--porcelain','--untracked-files=no'],{encoding:'utf8'}).trim(),'');
const {Dex,TeamValidator}=require(path.join(upstream,'dist/sim'));
const dex=Dex.mod('champions'),format='gen9championsvgc2026regmc';
const ctx=vm.createContext({});
const files=['data.js','generated/tournament_catalog.js','generated/mc_review_reference.js','mc_review.js'];
const hashes={};
for(const f of files){const bytes=fs.readFileSync(path.join(root,f));hashes[f]=createHash('sha256').update(bytes).digest('hex');vm.runInContext(bytes.toString(),ctx);}
const teams=vm.runInContext('TEAMS',ctx), stats=vm.runInContext('BASE_STATS',ctx);
const normalizeName=n=>n==='Floette (Eternal Flower)-Mega'?'Floette-Mega':n==='Floette (Eternal Flower)'?'Floette-Eternal':n;
const audit=(key,team,scope)=>{
 const before=JSON.stringify(team);
 const members=team.members||[];
 const rows=members.map(m=>{
  const name=m.species||m.name, species=normalizeName(name), ref=dex.species.get(species);
  const points=m.evs||m.stat_points;
  const missing=[];
  if(!points)missing.push('stat spread');
  if(!(m.nature||m.stat_alignment))missing.push('nature');
  if(!ref.exists)missing.push('canonical species identity');
  if(!Array.isArray(m.moves)||!m.moves.length)missing.push('moves');
  if(!m.ability)missing.push('ability');
  const set={species,ability:m.ability,item:m.item||'',nature:m.nature||m.stat_alignment,
    moves:m.moves||[],level:m.level||50,...(points?{evs:points}:{}),...(m.ivs?{ivs:m.ivs}:{})};
  const statDifferences=[];
  if(stats[name]&&ref.exists)for(const stat of ['hp','atk','def','spa','spd','spe'])if(stats[name][stat]!==ref.baseStats[stat])statDifferences.push({stat,stored:stats[name][stat],reference:ref.baseStats[stat]});
  return {name,set,missing,reference_species_available:ref.exists&&!ref.isNonstandard,
    set_errors:missing.length?null:new TeamValidator(format).validateSet(structuredClone(set))||[],
    stored_base_stat_differences:statDifferences};
 });
 const incomplete=rows.some(r=>r.missing.length);
 const errors=incomplete?null:new TeamValidator(format).validateTeam(rows.map(r=>structuredClone(r.set)))||[];
 const diagnostic=scope==='bundled'?ctx.reviewMcTeam(team,ctx.MC_REVIEW_REFERENCE):null;
 assert.equal(JSON.stringify(team),before,'Audit mutated team');
 return {key,name:team.name||team.player||key,scope,label:team.legality_status||null,
  status:incomplete?'incomplete':errors.length?'reference_rejected':'reference_accepted_not_approved',
  errors,members:rows,diagnostic_issue_count:diagnostic?diagnostic.reduce((n,r)=>n+r.issues.length,0):null};
};
const results=Object.entries(teams).map(([k,t])=>audit(k,t,'bundled'));
for(const t of ctx.CS_TOURNAMENT_CATALOG.teams)results.push(audit(t.id,t,'tournament_review'));
if(process.argv[2]) {
 const bytes=fs.readFileSync(path.resolve(process.argv[2]));
 hashes['optional_db_snapshot']=createHash('sha256').update(bytes).digest('hex');
 for(const t of JSON.parse(bytes)) results.push(audit(t.team_id,t,'database_'+t.source));
}
const summary={};for(const r of results){const k=r.scope+':'+r.status;summary[k]=(summary[k]||0)+1;}
const report={schema_version:1,reference_pin:pin,format,input_hashes:hashes,competitive_approval:false,
 scope:'Checked-in bundled and tournament-review catalogs, plus optional read-only database snapshot when present in input hashes. No browser-private teams, live battles, runtime-stat parity, sprite audit or current-upstream certification. Missing IV columns in DB are not proof of intentional max-IV settings.',
 results,summary};
const out=path.join(root,'reports/team-catalog-audit-2026-10-04');
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'audit.json'),JSON.stringify(report,null,2)+'\n');
const escape=s=>String(s).replaceAll('|','/').replaceAll('\n',' ');
const md=['# Full Checked-In Team Catalog Audit','',report.scope,'',`Reference: ${pin}; ${format}. Acceptance is not official approval.`,'',
 '| Team | Scope | Result | Findings |','| --- | --- | --- | --- |',...results.map(r=>`| ${escape(r.name)} | ${r.scope} | ${r.status} | ${escape((r.errors||r.members.flatMap(m=>m.missing.map(x=>m.name+': missing '+x))).join('; ')||'No reference rejection')} |`),
 '', '## Stored Base Stats', 'These compare data.js only, not effective runtime stats.',
 ...results.filter(r=>r.members.some(m=>m.stored_base_stat_differences.length)).map(r=>'- '+r.key+': '+r.members.filter(m=>m.stored_base_stat_differences.length).map(m=>m.name+' '+JSON.stringify(m.stored_base_stat_differences)).join('; ')),
 '', '## Counts', '```json',JSON.stringify(summary,null,2),'```',''];
fs.writeFileSync(path.join(out,'audit.md'),md.join('\n'));
console.log(JSON.stringify(summary,null,2));
