import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const ui = fs.readFileSync(new URL('../ui.js', import.meta.url), 'utf8');
const ctx = vm.createContext({
  _escapeHtml: value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),
  csFormatSourceStamp: value => value || 'Unknown',
  csGetBuildId: () => 'current-build',
  getChampionsRegulationCoverage: () => ({regulation_id:'mc',message:'Approval pending'}),
  getChampionsRuleset: () => ({selectorLabel:'M-C review',sourceCheckedAtUtc:'old-date'}),
  CHAMPIONS_SOURCE_REGISTRY: {tiers:[{sources:[
    {name:'capture',url:'in-game capture'}, {name:'official',url:'https://example.com/'},
    {name:'bundle',url:'generated/data.js'}, {name:'unsafe',url:'javascript:alert(1)'}
  ]}]}
});
function load(start,end) { vm.runInContext(ui.slice(ui.indexOf(start),ui.indexOf(end,ui.indexOf(start))),ctx); }
load('function csRenderSourceSyncRows(', 'function csRenderSourceSyncCards(');
load('function csRenderSourceRegistry(', 'function csRenderSourceSyncTables(');
const rows = ctx.csRenderSourceSyncRows({buildId:'historical-build',sourcesPageReviewedAt:'historical-date',reviewTracks:{regulationLabel:'M-B review'}},null);
for (const text of ['Historical regulation review snapshot','Historical Sources page snapshot','historical-build','historical-date','Current regulation lane','M-C review','Approval pending','Current browser release','current-build']) assert(rows.includes(text),text);
const links = ctx.csRenderSourceRegistry();
assert(!links.includes('href="in-game capture"'));
assert(!links.includes('href="javascript:'));
assert(links.includes('href="https://example.com/"'));
assert(links.includes('href="generated/data.js"'));
ctx.getChampionsRegulationCoverage = undefined;
assert(ctx.csRenderSourceSyncRows(null,null).includes('No current lane verified'));
assert(ctx.csRenderSourceSyncRows(null,null).includes('Unknown historical build'));
console.log('Source display context: historical/current separation, safe evidence labels and unavailable coverage passed');
