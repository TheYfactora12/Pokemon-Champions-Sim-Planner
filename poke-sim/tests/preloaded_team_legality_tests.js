const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const dataSource = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
const legalitySource = fs.readFileSync(path.join(ROOT, 'legality.js'), 'utf8');
const engineSource = fs.readFileSync(path.join(ROOT, 'engine.js'), 'utf8');

const ctx = { console, require };
vm.createContext(ctx);
vm.runInContext(
  dataSource + '\n' + legalitySource + '\n' + engineSource + '\n' +
  'this.TEAMS=TEAMS; this.validateTeam=validateTeam; this.buildTeam=buildTeam;',
  ctx,
  { filename: 'preloaded_team_legality_bundle.js' }
);

const { TEAMS, validateTeam, buildTeam } = ctx;

let pass = 0;
let fail = 0;

function T(name, fn) {
  try {
    fn();
    console.log('  PASS', name);
    pass++;
  } catch (err) {
    console.log('  FAIL', name, '-', err.message);
    fail++;
  }
}

function truthy(v, msg) {
  if (!v) throw new Error(msg || 'expected truthy');
}

function notInc(text, needle, msg) {
  if (String(text).includes(needle)) throw new Error(msg || `did not expect ${needle}`);
}

console.log('\n=== preloaded team legality tests ===\n');

const championPreloaded = Object.entries(TEAMS).filter(([, team]) =>
  team && team.source === 'preloaded' && team.format === 'champions'
);

T('1. no preloaded Champions team is invalid solely because inferred spreads are SV-shaped', () => {
  const offenders = [];
  for (const [key, team] of championPreloaded) {
    const verdict = validateTeam(team, 'vgc');
    const spreadErrors = (verdict.errors || []).filter(err =>
      err.includes('SPs exceed 66') || err.includes('SP exceeds 32')
    );
    if (spreadErrors.length) offenders.push({ key, spreadErrors });
  }
  truthy(offenders.length === 0, JSON.stringify(offenders, null, 2));
});

T('2. inferred Champions teams with SV-shaped spreads stay stat-aware at runtime', () => {
  const team = TEAMS.perish_trap_gengar;
  const mons = buildTeam(team);
  const mismatched = mons.filter(mon => mon.formatMismatch);
  truthy(mismatched.length >= 1, 'expected at least one inferred SV-shaped spread');
  truthy(mismatched.every(mon => mon.statFormat === 'sv'), 'mismatched mons must fall back to SV');
  const verdict = validateTeam(team, 'vgc');
  (verdict.errors || []).forEach(err => {
    notInc(err, 'SPs exceed 66', 'runtime-aware inferred spread still hard-failed on total SP');
    notInc(err, 'SP exceeds 32', 'runtime-aware inferred spread still hard-failed on per-stat SP');
  });
  truthy((verdict.warnings || []).some(w => w.includes('runtime falls back to SV stat math')), 'expected stat-awareness warning');
});

T('3. true Champions item-pool violations still remain hard errors', () => {
  const verdict = validateTeam(TEAMS.fire_ice_fullroom, 'vgc');
  truthy((verdict.errors || []).some(err => err.includes('Assault Vest')), 'expected actual item-pool violation to remain');
});

T('4. preloaded Champions legality tags match the validator', () => {
  const offenders = [];
  for (const [key, team] of championPreloaded) {
    const verdict = validateTeam(team, 'vgc');
    const expected = verdict.valid ? team.legality_status !== 'illegal' : team.legality_status === 'illegal';
    if (!expected) {
      offenders.push({
        key,
        legality_status: team.legality_status,
        valid: verdict.valid,
        errors: verdict.errors
      });
    }
    if (!verdict.valid && !(team.legality_notes || '').trim()) {
      offenders.push({
        key,
        legality_status: team.legality_status,
        valid: verdict.valid,
        errors: ['invalid team missing legality_notes']
      });
    }
  }
  truthy(offenders.length === 0, JSON.stringify(offenders, null, 2));
});

console.log(`\npreloaded team legality: ${pass} pass, ${fail} fail\n`);
if (fail > 0) process.exit(1);
