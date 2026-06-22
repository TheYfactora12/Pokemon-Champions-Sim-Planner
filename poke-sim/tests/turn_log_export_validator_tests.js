'use strict';

const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..');

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

function eq(a, b, msg) {
  if (a !== b) throw new Error((msg || 'not equal') + ' expected=' + b + ' got=' + a);
}

function clone(v) {
  return JSON.parse(JSON.stringify(v));
}

function baseRow(side, zone, index, name, item, ability, stableSlot) {
  return {
    key: side + ':' + zone + ':' + index + ':' + name,
    stableKey: side + ':slot:' + stableSlot + ':' + name,
    teamSlot: stableSlot,
    zone,
    zoneIndex: index,
    side,
    status: zone,
    displayName: name,
    species: name,
    hp: 100,
    hpLabel: '100%',
    level: 50,
    item,
    itemConsumed: false,
    ability,
    moves: name === 'Whimsicott' ? ['Tailwind', 'Moonblast'] : ['Fake Out', 'Scald'],
    baseStatsLabel: '1/1/1/1/1/1',
    calculatedStats: '100/1/1/1/1/1'
  };
}

function stableFixture() {
  const incin = baseRow('player', 'active', 0, 'Incineroar', 'Sitrus Berry', 'Intimidate', 0);
  const whimBench = baseRow('player', 'bench', 0, 'Whimsicott', 'Focus Sash', 'Prankster', 1);
  const milotic = baseRow('opponent', 'active', 0, 'Milotic', 'Life Orb', 'Competitive', 0);
  const incinFainted = Object.assign({}, incin, {
    key: 'player:fainted:0:Incineroar',
    zone: 'fainted',
    status: 'fainted',
    hp: 0,
    hpLabel: '0%'
  });
  const whimActive = Object.assign({}, whimBench, {
    key: 'player:active:0:Whimsicott',
    zone: 'active',
    status: 'active',
    zoneIndex: 0
  });

  return {
    result: 'win',
    seed: [1, 2, 3, 4],
    turnLog: [{
      turn: 1,
      pre: {
        active: { player: ['Incineroar'], opponent: ['Milotic'] },
        bench: { player: ['Whimsicott'], opponent: [] },
        active_keys: { player: [incin.key], opponent: [milotic.key] },
        bench_keys: { player: [whimBench.key], opponent: [] },
        active_stable_keys: { player: [incin.stableKey], opponent: [milotic.stableKey] },
        bench_stable_keys: { player: [whimBench.stableKey], opponent: [] },
        hp_pct: { [incin.key]: 1, [whimBench.key]: 1, [milotic.key]: 1 },
        hp_pct_stable: { [incin.stableKey]: 1, [whimBench.stableKey]: 1, [milotic.stableKey]: 1 },
        roster: { player: [incin, whimBench], opponent: [milotic] },
        status: {},
        field: { trick_room: 0 },
        speed_control: { player: {}, opponent: {} },
        speed_order: ['Milotic', 'Incineroar'],
        speed_order_keys: [milotic.key, incin.key],
        speed_order_stable_keys: [milotic.stableKey, incin.stableKey]
      },
      actions: {
        player: [{ actor: 'Incineroar', kind: 'move', move: 'Fake Out', target: 'Milotic' }],
        opponent: [{ actor: 'Milotic', kind: 'move', move: 'Scald', target: 'Incineroar' }]
      },
      events: [
        { type: 'log', text: 'Incineroar used Fake Out!' },
        { type: 'log', text: 'Milotic flinched and could not move!' }
      ],
      post: {
        active: { player: ['Whimsicott'], opponent: ['Milotic'] },
        bench: { player: [], opponent: [] },
        active_keys: { player: [whimActive.key], opponent: [milotic.key] },
        bench_keys: { player: [], opponent: [] },
        active_stable_keys: { player: [whimActive.stableKey], opponent: [milotic.stableKey] },
        bench_stable_keys: { player: [], opponent: [] },
        hp_pct: { [whimActive.key]: 1, [milotic.key]: 1 },
        hp_pct_stable: { [incinFainted.stableKey]: 0, [whimActive.stableKey]: 1, [milotic.stableKey]: 1 },
        roster: { player: [incinFainted, whimActive], opponent: [milotic] },
        status: {},
        field: { trick_room: 0 },
        speed_control: { player: {}, opponent: {} },
        speed_order: ['Whimsicott', 'Milotic'],
        speed_order_keys: [whimActive.key, milotic.key],
        speed_order_stable_keys: [whimActive.stableKey, milotic.stableKey]
      }
    }]
  };
}

function stripStableFields(payload) {
  const legacy = clone(payload);
  for (const turn of legacy.turnLog) {
    for (const snapName of ['pre', 'post']) {
      const snap = turn[snapName];
      delete snap.active_stable_keys;
      delete snap.bench_stable_keys;
      delete snap.hp_pct_stable;
      delete snap.speed_order_stable_keys;
      for (const side of ['player', 'opponent']) {
        for (const row of snap.roster[side]) {
          delete row.stableKey;
          delete row.teamSlot;
          delete row.itemConsumed;
        }
      }
    }
  }
  return legacy;
}

(async function main() {
  const modUrl = pathToFileURL(path.join(ROOT, 'tools', 'validate-turn-logs.mjs')).href;
  const { validateTurnLogPayload } = await import(modUrl);

  console.log('\n=== turn log export validator tests ===\n');

  T('1. stable identity export passes strict validation across replacement', () => {
    const res = validateTurnLogPayload(stableFixture(), { requireStable: true });
    eq(res.summary.errors, 0, JSON.stringify(res.findings));
    truthy(res.summary.stableFieldsPresent, 'stable fields should be present');
  });

  T('2. legacy volatile-key exports warn without hard-failing', () => {
    const res = validateTurnLogPayload(stripStableFields(stableFixture()));
    eq(res.summary.errors, 0, JSON.stringify(res.findings));
    truthy(res.findings.some(f => f.code === 'legacy-volatile-movement'), 'missing volatile movement warning');
    truthy(res.findings.some(f => f.code === 'stable-key-missing'), 'missing stable-key warning');
  });

  T('3. strict mode rejects legacy exports missing stable identity fields', () => {
    const res = validateTurnLogPayload(stripStableFields(stableFixture()), { requireStable: true });
    truthy(res.findings.some(f => f.code === 'stable-fields-missing'), 'missing strict stable field error');
    truthy(res.summary.errors > 0, 'strict mode should hard-fail');
  });

  T('4. item drift on a stable Pokemon is a hard error', () => {
    const payload = stableFixture();
    payload.turnLog[0].post.roster.player[1].item = 'Rocky Helmet';
    const res = validateTurnLogPayload(payload, { requireStable: true });
    truthy(res.findings.some(f => f.code === 'item-drift' && f.severity === 'error'), 'missing item drift error');
  });

  T('5. observed action order respects priority before speed', () => {
    const payload = stableFixture();
    payload.turnLog[0].events = [
      { type: 'log', text: 'Milotic used Scald!' },
      { type: 'log', text: 'Incineroar used Fake Out!' }
    ];
    const res = validateTurnLogPayload(payload, { requireStable: true });
    truthy(res.findings.some(f => f.code === 'observed-action-order-mismatch'), 'missing action order mismatch');
  });

  T('6. observed action order allows exact same-Speed ties', () => {
    const payload = stableFixture();
    const turn = payload.turnLog[0];
    turn.actions.player[0].move = 'Knock Off';
    turn.events = [
      { type: 'log', text: 'Incineroar used Knock Off!' },
      { type: 'log', text: 'Milotic used Scald!' }
    ];
    const res = validateTurnLogPayload(payload, { requireStable: true });
    eq(res.summary.errors, 0, JSON.stringify(res.findings));
  });

  T('7. observed action order rejects non-tied same-priority reversals', () => {
    const payload = stableFixture();
    const turn = payload.turnLog[0];
    turn.pre.roster.player[0].calculatedStats = '100/1/1/1/1/60';
    turn.pre.roster.opponent[0].calculatedStats = '100/1/1/1/1/90';
    turn.actions.player[0].move = 'Knock Off';
    turn.events = [
      { type: 'log', text: 'Incineroar used Knock Off!' },
      { type: 'log', text: 'Milotic used Scald!' }
    ];
    const res = validateTurnLogPayload(payload, { requireStable: true });
    truthy(res.findings.some(f => f.code === 'observed-action-order-mismatch' && f.reason === 'speed'), 'missing speed order mismatch');
  });

  console.log('\nturn log export validator:', pass + ' pass, ' + fail + ' fail\n');
  process.exit(fail ? 1 : 0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
