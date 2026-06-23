// Project Overview tab should track shipped work, validation, gaps, and milestones.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
const ui = fs.readFileSync(path.join(ROOT, 'ui.js'), 'utf8');

let pass = 0;
let fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}
function inc(hay, needle, msg='') {
  if (String(hay).indexOf(needle) < 0) throw new Error((msg || 'missing') + ': ' + needle);
}

console.log('\n=== project overview tab tests ===\n');

T('1. Overview is a top-level tab and mobile picker option', () => {
  inc(html, 'data-tab="overview">Overview');
  inc(html, '<option value="overview">Overview</option>');
  inc(html, '<section class="tab-panel" id="tab-overview">');
  inc(html, 'id="overview-content"');
});

T('2. Overview tracks accomplished work and validation proof', () => {
  inc(ui, 'CS_OVERVIEW_DATA');
  inc(ui, 'Sim Truth Gate');
  inc(ui, 'Knock Off');
  inc(ui, 'Verified');
  inc(ui, 'Review tab restored');
  inc(ui, 'Live team-load simulation failure fixed');
  inc(ui, 'Lethal Sitrus and Oran timing fixed');
  inc(ui, 'Champion item and SP gate added');
  inc(ui, 'Stable Pokemon identity in sim exports');
  inc(ui, 'Move priority aligned with Showdown data');
  inc(ui, 'Showdown primary move metadata for imported teams');
  inc(ui, 'Target category bridge and stale-target retargeting guarded');
  inc(ui, 'Runtime naming cheat sheet added');
  inc(ui, 'Large-run QA artifact export added');
  inc(ui, 'Type multiplier audit added');
  inc(ui, 'Typed held-item damage boosts fixed');
  inc(ui, 'Stat and effective-speed evidence added to exports');
  inc(ui, 'Knock Off item behavior guarded');
  inc(ui, 'Champions SP/SV stat format');
  inc(ui, 'damage_events');
  inc(ui, 'Showdown sync and DB writer staged');
  inc(ui, 'Curated ability inventory modeled');
  inc(ui, 'Simulation-first direction documented');
  inc(ui, 'Public release milestone map documented');
  inc(ui, 'Live exported logs prove the sim now runs');
  inc(ui, 'Latest v2.1.33 logs pass strict structure and expose stacked mechanics evidence');
  inc(ui, 'The only no-valid-target line is terminal after the player side is empty');
  inc(ui, 'Item timing regression reproduced and covered');
  inc(ui, 'Fresh logs exposed a targeting boundary bug');
  inc(ui, 'Ability coverage guard is green');
  inc(ui, 'v2.1.34 Live Log Proof carries v2.1.33 Log Target Guard');
  inc(ui, 'Damage stack oracle is green');
  inc(ui, 'Tera Blast parity is green');
  inc(ui, 'Knock Off source-truth behavior is documented');
  inc(ui, 'Turn-order stack evidence is green');
  inc(ui, 'GitHub issue sweep completed');
  inc(ui, 'Y fork and Alfredo main are synced');
});

T('3. Overview names current Supabase and Showdown DB alignment state', () => {
  inc(ui, 'Supabase app wiring is live for existing app tables');
  inc(ui, 'overview-showdown-db-inspect');
  inc(ui, 'loadShowdownDbSnapshot');
  inc(ui, 'approvedCounts');
  inc(ui, 'sourceFiles');
  inc(ui, 'showdown_entities DB rows are not the battle runtime source yet');
  inc(ui, 'Live logs exposed stale DB item drift');
  inc(ui, 'Pokemon data audit has unresolved reviewer risk');
  inc(ui, 'Mechanics parity is broader than the current ability slice');
  inc(ui, 'Source refresh needed must be visible before trust claims');
  inc(ui, 'Full raw thousand-battle retention is still not automatic');
  inc(ui, 'Team editor is guarded but not a fluid full builder yet');
  inc(ui, 'Alfredo #241');
  inc(ui, 'Life Orb');
  inc(ui, 'showdown_sync_runs');
  inc(ui, 'showdown_entities');
  inc(ui, 'champions_overrides');
});

T('4. Overview includes next milestones and source docs', () => {
  inc(ui, 'Verify v2.1.34 source URL and QA artifact');
  inc(ui, 'Mirror or update JD issue alignment in the Y fork');
  inc(ui, 'Apply Champion item cleanup to live Supabase rows');
  inc(ui, 'Wire approved Showdown DB data into generated runtime assets');
  inc(ui, 'Group mechanics parity work by battle system');
  inc(ui, 'Rebuild editor into full Champion team builder');
  inc(ui, 'Keep Alfredo and Y fork synced through protected PRs');
  inc(ui, 'Surface source drift as update needed in Overview');
  inc(ui, 'Recent Fix + Issue Snapshot');
  inc(ui, 'recent-fixes-and-open-issues-2026-06-21.md');
  inc(ui, 'Move Support Audit');
  inc(ui, 'move_support_audit.md');
  inc(ui, 'Type Multiplier Audit');
  inc(ui, 'type_multiplier_audit.md');
  inc(ui, 'Simulation First');
  inc(ui, 'SIMULATION_FIRST_REALIGNMENT_2026-06-06.md');
  inc(ui, 'Public Release Plan');
  inc(ui, 'PUBLIC_RELEASE_MILESTONE_PLAN_2026-06-06.md');
  inc(ui, 'Showdown DB Stress Test');
  inc(ui, 'SHOWDOWN_DB_WIRING_STRESS_TEST_2026-06-06.md');
  inc(ui, 'Jdoutt38 Investigation');
  inc(ui, 'JDOUTT38_INVESTIGATION_2026-06-06.md');
  inc(ui, 'Closure Confidence');
  inc(ui, 'CLOSURE_CONFIDENCE_2026-06-06.md');
  inc(ui, 'Repo Parity Report');
  inc(ui, 'REPO_PARITY_REPORT_2026-06-06.md');
  inc(ui, 'Closeout Note');
  inc(ui, 'CLOSEOUT_2026-06-06.md');
  inc(ui, 'Showdown DB Plan');
  inc(ui, 'SHOWDOWN_DB_SOURCE_OF_TRUTH_PLAN.md');
  inc(ui, 'Runtime Naming Cheat Sheet');
  inc(ui, 'SHOWDOWN_RUNTIME_NAMING_CHEATSHEET.md');
  inc(ui, 'SHOWDOWN_SYNC_ARCHITECTURE.md');
});

T('5. Overview styles are responsive and scan-friendly', () => {
  inc(css, '.overview-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--sp3)}');
  inc(css, '.overview-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(300px,.8fr);gap:var(--sp4);align-items:start}');
  inc(css, '.overview-db-inspector');
  inc(css, '.overview-db-counts');
  inc(css, '.overview-db-table');
  inc(css, '.overview-status.done');
  inc(css, '.overview-status.gap');
  inc(css, '@media(max-width:900px){.overview-grid{grid-template-columns:1fr}.overview-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.overview-db-summary,.overview-db-counts{grid-template-columns:repeat(2,minmax(0,1fr))}}');
});

T('6. Overview renders through a reusable function for future growth', () => {
  inc(ui, 'function renderOverviewTab()');
  inc(ui, 'ChampionsSim.overview');
  inc(ui, 'renderOverviewTab();');
  inc(ui, '.tab-btn[data-tab="overview"]');
});

console.log(`\nproject overview tab: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
