#!/usr/bin/env node
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SIDES = ['player', 'opponent'];

const STATUS_MOVES = new Set([
  'Will-O-Wisp', 'Thunder Wave', 'Taunt', 'Sleep Powder', 'Tailwind', 'Sunny Day',
  'Trick Room', 'Life Dew', 'Rage Powder', 'Roost', 'Parting Shot', 'Shed Tail',
  'Quick Guard', 'Endure', 'Wide Guard', 'Follow Me', 'Protect', 'Detect',
  "King's Shield", 'Spiky Shield', 'Baneful Bunker', 'Obstruct', 'Light Screen',
  'Reflect', 'Aurora Veil', 'Encore', 'Haze', 'Defog', 'Recover', 'Shore Up',
  'Rest', 'Sleep Talk', 'Substitute', 'Imprison', 'Ally Switch', 'Toxic',
  'Poison Powder'
]);

const PRIORITY = {
  'Helping Hand': 5,
  'Protect': 4,
  'Detect': 4,
  'Endure': 4,
  'Fake Out': 3,
  'Wide Guard': 3,
  'Quick Guard': 3,
  'Extreme Speed': 2,
  'Ally Switch': 2,
  'Follow Me': 2,
  'Rage Powder': 2,
  'Aqua Jet': 1,
  'Ice Shard': 1,
  'Shadow Sneak': 1,
  'Sucker Punch': 1,
  'Vacuum Wave': 1,
  'Quick Attack': 1,
  'Feint': 2,
  "King's Shield": 4,
  'Spiky Shield': 4,
  'Baneful Bunker': 4,
  'Obstruct': 4,
  'Trick Room': -7
};

function cleanText(text) {
  return String(text || '').replace(/\uFFFD/g, '').trim();
}

function finding(severity, code, message, ctx) {
  return Object.assign({ severity, code, message }, ctx || {});
}

function snapshotEntries(turn) {
  const out = [];
  if (turn && turn.pre) out.push(['pre', turn.pre]);
  if (turn && turn.post) out.push(['post', turn.post]);
  return out;
}

function rowName(row) {
  return String((row && (row.displayName || row.species || row.key)) || 'Unknown');
}

function movesSig(row) {
  return Array.isArray(row && row.moves) ? row.moves.join('|') : '';
}

function identityFor(side, row) {
  if (row && row.stableKey) return row.stableKey;
  if (row && row.teamSlot != null) return `${side}:slot:${row.teamSlot}:${rowName(row)}`;
  return `${side}:name:${rowName(row)}`;
}

function ensureIdentity(state, side, row) {
  const id = identityFor(side, row);
  if (!state.identities.has(id)) {
    state.identities.set(id, {
      id,
      side,
      name: rowName(row),
      items: new Set(),
      moves: new Set(),
      volatileKeys: new Set(),
      stableKeys: new Set(),
      itemConsumedSeen: false,
      snapshots: 0
    });
  }
  return state.identities.get(id);
}

function setEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

function getSideKeys(snapshot, side, kind) {
  const map = snapshot && snapshot[kind];
  const keys = map && Array.isArray(map[side]) ? map[side] : [];
  return keys.filter(Boolean).map(String);
}

function validateSnapshot(snapshot, turnNo, snapName, state, findings) {
  if (!snapshot || typeof snapshot !== 'object') {
    findings.push(finding('error', 'snapshot-missing', `Missing ${snapName} snapshot.`, { turn: turnNo, snapshot: snapName }));
    return;
  }

  if (!snapshot.roster || typeof snapshot.roster !== 'object') {
    findings.push(finding('error', 'roster-missing', `Missing roster object in ${snapName}.`, { turn: turnNo, snapshot: snapName }));
    return;
  }

  if (!snapshot.hp_pct_stable) state.missingStableMaps.add('hp_pct_stable');
  if (!Array.isArray(snapshot.speed_order_stable_keys)) state.missingStableMaps.add('speed_order_stable_keys');

  const liveKeys = new Set();
  for (const side of SIDES) {
    const rows = Array.isArray(snapshot.roster[side]) ? snapshot.roster[side] : [];
    if (!rows.length) {
      findings.push(finding('warning', 'side-roster-empty', `${side} roster is empty in ${snapName}.`, { turn: turnNo, snapshot: snapName, side }));
    }

    const activeKeys = new Set(getSideKeys(snapshot, side, 'active_keys'));
    const benchKeys = new Set(getSideKeys(snapshot, side, 'bench_keys'));
    const expectedActive = new Set();
    const expectedBench = new Set();
    const rowKeys = new Set();

    if (!snapshot.active_stable_keys || !Array.isArray(snapshot.active_stable_keys[side])) state.missingStableMaps.add('active_stable_keys');
    if (!snapshot.bench_stable_keys || !Array.isArray(snapshot.bench_stable_keys[side])) state.missingStableMaps.add('bench_stable_keys');

    for (const row of rows) {
      if (!row || typeof row !== 'object') continue;
      if (!row.stableKey) state.rowsMissingStableKey += 1;
      if (row.key) {
        if (rowKeys.has(row.key)) {
          findings.push(finding('error', 'duplicate-row-key', `Duplicate roster key ${row.key}.`, { turn: turnNo, snapshot: snapName, side }));
        }
        rowKeys.add(row.key);
      }

      const id = ensureIdentity(state, side, row);
      id.snapshots += 1;
      if (row.key) id.volatileKeys.add(String(row.key));
      if (row.stableKey) id.stableKeys.add(String(row.stableKey));
      if (row.item) id.items.add(String(row.item));
      id.moves.add(movesSig(row));
      if (row.itemConsumed) id.itemConsumedSeen = true;

      if (row.status === 'active' && row.key) expectedActive.add(String(row.key));
      if (row.status === 'bench' && row.key) expectedBench.add(String(row.key));
    }

    for (const key of activeKeys) liveKeys.add(key);
    for (const key of benchKeys) liveKeys.add(key);

    if (!setEqual(activeKeys, expectedActive)) {
      findings.push(finding('error', 'active-key-mismatch', `${side} active_keys do not match active roster rows.`, {
        turn: turnNo,
        snapshot: snapName,
        side,
        expected: Array.from(expectedActive),
        actual: Array.from(activeKeys)
      }));
    }
    if (!setEqual(benchKeys, expectedBench)) {
      findings.push(finding('error', 'bench-key-mismatch', `${side} bench_keys do not match bench roster rows.`, {
        turn: turnNo,
        snapshot: snapName,
        side,
        expected: Array.from(expectedBench),
        actual: Array.from(benchKeys)
      }));
    }
  }

  const hpPct = snapshot.hp_pct || {};
  for (const key of liveKeys) {
    if (!Object.prototype.hasOwnProperty.call(hpPct, key)) {
      findings.push(finding('error', 'hp-key-missing', `hp_pct is missing live key ${key}.`, { turn: turnNo, snapshot: snapName }));
    }
  }

  const speedKeys = Array.isArray(snapshot.speed_order_keys) ? snapshot.speed_order_keys.map(String) : [];
  for (const key of speedKeys) {
    if (!liveKeys.has(key)) {
      findings.push(finding('error', 'speed-key-not-live', `speed_order_keys contains non-active key ${key}.`, { turn: turnNo, snapshot: snapName }));
    }
  }
}

function actorOrderFromEvents(events) {
  const out = [];
  const seen = new Set();
  for (const event of events || []) {
    const text = cleanText(event && event.text);
    if (text && text.includes(String.fromCharCode(0x2192))) continue;
    if (!text || text.includes('->') || text.includes('→') || text.includes('â†’')) continue;
    const match = text.match(/^(.+?) used (.+?)!/);
    if (!match) continue;
    const key = `${match[1]}:${match[2]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ actor: match[1], move: match[2] });
  }
  return out;
}

function rosterByName(snapshot) {
  const out = new Map();
  for (const side of SIDES) {
    const rows = ((snapshot && snapshot.roster && snapshot.roster[side]) || []);
    for (const row of rows) out.set(rowName(row), row);
  }
  return out;
}

function movePriority(move, row) {
  let p = Object.prototype.hasOwnProperty.call(PRIORITY, move) ? PRIORITY[move] : 0;
  if (row && row.ability === 'Prankster' && STATUS_MOVES.has(move)) p += 1;
  return p;
}

function parsedCalculatedSpeed(row) {
  const stats = row && row.calculatedStats;
  if (stats && typeof stats === 'object') {
    const value = Number(stats.spe ?? stats.speed);
    return Number.isFinite(value) ? Math.floor(value) : null;
  }
  const parts = String(stats || '').split('/');
  if (parts.length >= 6) {
    const value = Number(parts[5]);
    return Number.isFinite(value) ? Math.floor(value) : null;
  }
  return null;
}

function snapshotEffectiveSpeed(row, snapshot) {
  const baseSpeed = parsedCalculatedSpeed(row);
  if (!row || baseSpeed == null) return null;

  const field = (snapshot && snapshot.field) || {};
  const weather = field.weather || null;
  let statSpeed = baseSpeed;
  if (row.ability === 'Sand Rush' && weather === 'sand') statSpeed *= 2;
  if (row.ability === 'Unburden' && row.itemConsumed) statSpeed *= 2;
  if (row.item === 'Choice Scarf') statSpeed *= 1.5;
  statSpeed = Math.floor(statSpeed);

  let effectiveSpeed = statSpeed;
  const speedControl = (snapshot && snapshot.speed_control && snapshot.speed_control[row.side]) || {};
  if ((speedControl.tailwind_turns || 0) > 0) effectiveSpeed *= 2;
  if (row.ability === 'Swift Swim' && weather === 'rain') effectiveSpeed *= 2;
  if (row.ability === 'Chlorophyll' && weather === 'sun') effectiveSpeed *= 2;
  if (row.ability === 'Slush Rush' && weather === 'snow') effectiveSpeed *= 2;
  return effectiveSpeed;
}

function isSameEffectiveSpeedTie(rowA, rowB, snapshot) {
  const speedA = snapshotEffectiveSpeed(rowA, snapshot);
  const speedB = snapshotEffectiveSpeed(rowB, snapshot);
  return speedA != null && speedB != null && speedA === speedB;
}

function validateObservedActionOrder(turn, findings) {
  const observed = actorOrderFromEvents(turn.events);
  if (observed.length < 2 || !turn.pre || !turn.actions) return;

  const actionRows = []
    .concat(Array.isArray(turn.actions.player) ? turn.actions.player : [])
    .concat(Array.isArray(turn.actions.opponent) ? turn.actions.opponent : [])
    .filter(a => a && a.actor && a.move);
  if (actionRows.length < 2) return;

  const roster = rosterByName(turn.pre);
  const speedOrder = Array.isArray(turn.pre.speed_order) ? turn.pre.speed_order.map(String) : [];
  const speedIndex = new Map(speedOrder.map((name, index) => [name, index]));

  const actionByKey = new Map(actionRows.map(a => [`${a.actor}|${a.move}`, a]));
  const actual = observed
    .map(o => {
      const key = `${o.actor}|${o.move}`;
      const action = actionByKey.get(key);
      return action ? { key, actor: o.actor, move: o.move, action } : null;
    })
    .filter(Boolean);

  if (actual.length < 2) return;

  const failOrder = (reason, expectedBefore, actualBefore) => {
    findings.push(finding('error', 'observed-action-order-mismatch', 'Observed event order does not match priority plus speed_order snapshot.', {
      turn: turn.turn,
      reason,
      expectedBefore,
      actualBefore,
      actual: actual.map(a => a.key)
    }));
  };

  for (let i = 0; i < actual.length; i += 1) {
    for (let j = i + 1; j < actual.length; j += 1) {
      const first = actual[i];
      const second = actual[j];
      const firstPriority = movePriority(first.move, roster.get(first.actor));
      const secondPriority = movePriority(second.move, roster.get(second.actor));

      if (firstPriority < secondPriority) {
        failOrder('priority', second.key, first.key);
        return;
      }

      if (firstPriority !== secondPriority) continue;
      if (!speedIndex.has(first.actor) || !speedIndex.has(second.actor)) continue;

      const firstSpeedIndex = speedIndex.get(first.actor);
      const secondSpeedIndex = speedIndex.get(second.actor);
      if (firstSpeedIndex <= secondSpeedIndex) continue;

      const firstRow = roster.get(first.actor);
      const secondRow = roster.get(second.actor);
      if (isSameEffectiveSpeedTie(firstRow, secondRow, turn.pre)) continue;

      failOrder('speed', second.key, first.key);
      return;
    }
  }
}

function finalizeIdentityChecks(state, findings) {
  for (const id of state.identities.values()) {
    const moves = Array.from(id.moves).filter(Boolean);
    if (moves.length > 1) {
      findings.push(finding('error', 'moves-drift', `${id.name} changed move list across snapshots.`, {
        side: id.side,
        identity: id.id,
        moves
      }));
    }

    const items = Array.from(id.items).filter(Boolean);
    if (items.length > 1) {
      findings.push(finding(id.itemConsumedSeen ? 'warning' : 'error', 'item-drift', `${id.name} changed item across snapshots.`, {
        side: id.side,
        identity: id.id,
        items
      }));
    }

    if (!id.stableKeys.size && id.volatileKeys.size > 1) {
      findings.push(finding('warning', 'legacy-volatile-movement', `${id.name} moved through multiple active/bench/fainted keys without a stableKey.`, {
        side: id.side,
        identity: id.id,
        volatileKeys: Array.from(id.volatileKeys)
      }));
    }
  }
}

export function validateTurnLogPayload(payload, options = {}) {
  const findings = [];
  const state = {
    identities: new Map(),
    rowsMissingStableKey: 0,
    missingStableMaps: new Set()
  };
  const turnLog = Array.isArray(payload && payload.turnLog) ? payload.turnLog : null;

  if (!turnLog) {
    findings.push(finding('error', 'turn-log-missing', 'Payload does not contain a turnLog array.'));
    return { findings, summary: { turns: 0, errors: 1, warnings: 0, stableFieldsPresent: false } };
  }

  for (const turn of turnLog) {
    const turnNo = turn && turn.turn != null ? turn.turn : null;
    for (const [snapName, snapshot] of snapshotEntries(turn)) {
      validateSnapshot(snapshot, turnNo, snapName, state, findings);
    }
    validateObservedActionOrder(turn || {}, findings);
  }

  finalizeIdentityChecks(state, findings);

  const stableFieldsPresent = state.rowsMissingStableKey === 0 && state.missingStableMaps.size === 0;
  if (options.requireStable && !stableFieldsPresent) {
    findings.push(finding('error', 'stable-fields-missing', 'Stable identity export fields are missing; refresh the app bundle and export a new log.', {
      rowsMissingStableKey: state.rowsMissingStableKey,
      missingMaps: Array.from(state.missingStableMaps)
    }));
  } else {
    if (state.rowsMissingStableKey > 0) {
      findings.push(finding('warning', 'stable-key-missing', `${state.rowsMissingStableKey} roster row(s) are missing stableKey.`, {
        rowsMissingStableKey: state.rowsMissingStableKey
      }));
    }
    for (const mapName of state.missingStableMaps) {
      findings.push(finding('warning', 'stable-map-missing', `${mapName} is missing from at least one snapshot.`, { mapName }));
    }
  }

  const errors = findings.filter(f => f.severity === 'error').length;
  const warnings = findings.filter(f => f.severity === 'warning').length;
  return {
    findings,
    summary: {
      turns: turnLog.length,
      errors,
      warnings,
      stableFieldsPresent,
      identities: state.identities.size
    }
  };
}

export function validateTurnLogFile(filePath, options = {}) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const payload = JSON.parse(raw);
  const result = validateTurnLogPayload(payload, options);
  result.file = filePath;
  result.seed = Array.isArray(payload.seed) ? payload.seed.join(' ') : String(payload.seed || '');
  result.result = payload.result || '';
  return result;
}

function formatFinding(item) {
  const where = [
    item.turn != null ? `turn ${item.turn}` : '',
    item.snapshot ? item.snapshot : '',
    item.side ? item.side : ''
  ].filter(Boolean).join(' ');
  return `  ${item.severity.toUpperCase()} ${item.code}${where ? ` (${where})` : ''}: ${item.message}`;
}

function usage() {
  return [
    'Usage: node tools/validate-turn-logs.mjs [--require-stable] [--json] <champions-turn-log.json...>',
    '',
    'Checks exported battle logs for roster identity, item drift, active/bench key mapping,',
    'HP key coverage, speed-order key coverage, and observed priority/speed event order.'
  ].join('\n');
}

function runCli(argv) {
  const args = argv.slice(2);
  const options = { requireStable: false };
  let jsonOut = false;
  const files = [];
  for (const arg of args) {
    if (arg === '--require-stable') options.requireStable = true;
    else if (arg === '--json') jsonOut = true;
    else if (arg === '-h' || arg === '--help') {
      console.log(usage());
      return 0;
    } else {
      files.push(arg);
    }
  }
  if (!files.length) {
    console.error(usage());
    return 2;
  }

  const results = [];
  let hasError = false;
  for (const file of files) {
    const resolved = path.resolve(file);
    try {
      const result = validateTurnLogFile(resolved, options);
      results.push(result);
      if (result.summary.errors > 0) hasError = true;
    } catch (err) {
      hasError = true;
      results.push({
        file: resolved,
        findings: [finding('error', 'read-failed', err && err.message ? err.message : String(err))],
        summary: { turns: 0, errors: 1, warnings: 0, stableFieldsPresent: false }
      });
    }
  }

  if (jsonOut) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    for (const result of results) {
      const label = path.basename(result.file);
      const status = result.summary.errors ? 'FAIL' : 'PASS';
      const stable = result.summary.stableFieldsPresent ? 'stable-ids=yes' : 'stable-ids=no';
      console.log(`${status} ${label} turns=${result.summary.turns} errors=${result.summary.errors} warnings=${result.summary.warnings} ${stable}`);
      for (const item of result.findings) console.log(formatFinding(item));
    }
  }
  return hasError ? 1 : 0;
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) process.exit(runCli(process.argv));
