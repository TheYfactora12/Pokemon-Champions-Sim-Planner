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
  inc(ui, 'Review tab restored');
  inc(ui, 'Stable Pokemon identity in sim exports');
  inc(ui, 'Move priority aligned with Showdown data');
  inc(ui, 'Showdown primary move metadata for imported teams');
  inc(ui, 'Alfredo merge candidate prepared');
  inc(ui, 'Simulation-first direction documented');
  inc(ui, 'Public release milestone map documented');
  inc(ui, 'CI-style local sweep passed');
  inc(ui, 'v48 Showdown-primary service-worker cache');
  inc(ui, 'User sample logs show no hard item/order drift');
});

T('3. Overview names current Supabase and Showdown DB alignment state', () => {
  inc(ui, 'Supabase app wiring is live for existing app tables');
  inc(ui, 'Showdown mirror tables are not live in Supabase yet');
  inc(ui, 'generated Showdown rows as the primary local metadata layer');
  inc(ui, 'Merge candidate PR is not open yet');
  inc(ui, 'Coaching expansion is paused behind sim truth');
  inc(ui, 'Public release gates are not fully enforced yet');
  inc(ui, 'showdown_sync_runs');
  inc(ui, 'showdown_entities');
  inc(ui, 'champions_overrides');
});

T('4. Overview includes next milestones and source docs', () => {
  inc(ui, 'Open the Alfredo merge candidate PR');
  inc(ui, 'Create public release issues');
  inc(ui, 'Apply sync/audit DB migrations');
  inc(ui, 'Expand simulation truth gates');
  inc(ui, 'Add entity and override tables');
  inc(ui, 'Generate app assets from approved DB views');
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
  inc(ui, 'SHOWDOWN_SYNC_ARCHITECTURE.md');
});

T('5. Overview styles are responsive and scan-friendly', () => {
  inc(css, '.overview-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--sp3)}');
  inc(css, '.overview-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(300px,.8fr);gap:var(--sp4);align-items:start}');
  inc(css, '.overview-status.done');
  inc(css, '.overview-status.gap');
  inc(css, '@media(max-width:900px){.overview-grid{grid-template-columns:1fr}.overview-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}');
});

T('6. Overview renders through a reusable function for future growth', () => {
  inc(ui, 'function renderOverviewTab()');
  inc(ui, 'ChampionsSim.overview');
  inc(ui, 'renderOverviewTab();');
  inc(ui, '.tab-btn[data-tab="overview"]');
});

console.log(`\nproject overview tab: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
