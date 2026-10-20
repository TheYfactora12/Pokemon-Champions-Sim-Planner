import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const normalize = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const labelKey = value => normalize(value).toLowerCase();
const movePrefixes = lines => lines.map(line => normalize(line).match(/^(.+? used .+?!)/)?.[1]).filter(Boolean);

// Detail records repeat action prefixes but are not additional actions.
const detailRecord = text => /used .+?!.*(?:\[\d+ dmg\b|lost \d+ HP\b|It missed[.!]|But it failed!)/.test(normalize(text));
const damageRecord = text => {
  const s = normalize(text), prefix = s.match(/^(.+?) used (.+?)!/);
  if (!prefix) return [];
  return s.slice(prefix[0].length).split(';').flatMap(segment => {
    const hit = segment.trim().match(/^(?:\u2192|\u001a)?\s*(.+?) lost (\d+) HP\b/) ||
      segment.trim().match(/^(?:\u2192|\u001a)\s*(.+?)\s*\[(\d+) dmg\b/);
    return hit ? [[prefix[1], prefix[2], hit[1], Number(hit[2])]] : [];
  });
};
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])])) : value;
const digest = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');

export function compareVisibleReplay(log, visual, expectedCandidate = null) {
  const issues = [];
  let checks = 0;
  const check = (ok, code, location, expected, actual) => {
    checks++;
    if (!ok) issues.push({ code, location, expected, actual });
  };
  const equal = (actual, expected, code, location) => check(JSON.stringify(actual) === JSON.stringify(expected), code, location, expected, actual);
  const turns = Array.isArray(log?.turnLog) ? log.turnLog : [];
  check(turns.length > 0, 'missing_turn_log', 'log', 'nonempty turnLog', turns.length);
  check(visual?.schema_version === 'champions-visible-replay-v1', 'invalid_capture', 'visual', 'champions-visible-replay-v1', visual?.schema_version);
  const p = log?.provenance;
  check(!!p?.build_id && !!p?.player_team_digest && !!p?.opp_team_digest, 'missing_identity', 'log.provenance', 'execution identity', p || null);
  // Older captures retain the exact version in the banner rather than a dedicated field.
  const rendererBuild = visual?.renderer_build_id || (visual?.banner || '').match(/\b(v\d+\.\d+\.\d+-[a-z0-9-]+)\b/)?.[1];
  equal(rendererBuild, log?.exporter_build_id || p?.build_id, 'build_mismatch', 'renderer_build_id');
  check(!!p?.build_id && log?.build_id === p.build_id, 'execution_build_mismatch', 'log.build_id', p?.build_id, log?.build_id);
  if (expectedCandidate) {
    equal(rendererBuild, expectedCandidate.build_id, 'candidate_renderer_mismatch', 'renderer_build_id');
    equal(log?.build_id, expectedCandidate.build_id, 'candidate_execution_mismatch', 'log.build_id');
    check(/^[a-f0-9]{40}$/.test(expectedCandidate.commit || '') && /^[a-f0-9]{64}$/.test(expectedCandidate.bundle_sha256 || ''),
      'invalid_candidate_identity', 'expectedCandidate', 'independent commit and bundle digest', expectedCandidate);
    equal(visual?.candidate_bundle_sha256, expectedCandidate.bundle_sha256, 'candidate_bytes_mismatch', 'captured response bytes');
  }
  equal(visual?.title, `${String(log?.result || '').toUpperCase()} vs ${log?.opponent_team?.name || ''}`, 'replay_title_mismatch', 'title');
  equal(Number((visual?.meta || '').match(/^(\d+) turns/)?.[1]), turns.length, 'turn_count_mismatch', 'meta');
  equal((visual?.turns || []).map(t => t.label), turns.map(t => `T${t.turn}`), 'turn_sequence_mismatch', 'turns');
  equal((visual?.boards || []).map(b => labelKey(b.label)), turns.length ? ['turn 0', ...turns.map(t => `after t${t.turn}`)] : [], 'board_sequence_mismatch', 'boards');
  const snapshots = turns.length ? [{ label: 'Turn 0', snapshot: turns[0].initial || turns[0].pre }, ...turns.map(t => ({ label: `After T${t.turn}`, snapshot: t.post }))] : [];
  for (const { label, snapshot } of snapshots) {
    const board = visual?.boards?.find(b => labelKey(b.label) === labelKey(label));
    for (const side of ['player', 'opponent']) {
      const roster = snapshot?.roster?.[side] || [];
      const actual = board?.[side] || [];
      check(roster.length > 0, 'missing_roster', `${label}.${side}`, 'nonempty roster', roster.length);
      equal(actual.length, roster.length, 'roster_count_mismatch', `${label}.${side}`);
      const keys = log?.participants?.[side]?.map(m => m.stable_key) || [];
      for (const mon of roster) {
        const location = `${label}.${side}.${mon.stableKey || mon.displayName}`;
        check(keys.includes(mon.stableKey), 'unselected_participant', location, keys, mon.stableKey);
        const matches = actual.filter(row => row.name === mon.displayName);
        equal(matches.length, 1, 'ambiguous_or_missing_member', location);
        if (matches.length !== 1) continue;
        const row = matches[0];
        equal(labelKey(row.status), labelKey(mon.status), 'status_mismatch', location);
        check(normalize(row.hp).startsWith(`HP: ${mon.hpLabel}`), 'hp_mismatch', location, mon.hpLabel, row.hp);
        equal(Number.parseFloat(row.hp_bar), Number(mon.hp), 'hp_bar_mismatch', location);
        const meta = [mon.item, mon.ability].filter(Boolean).join(' \u00b7 ');
        const visibleMeta = row.metadata.filter(value => !/^(HP|Impact|Moves):/.test(value));
        equal(visibleMeta, meta ? [meta] : [], 'item_ability_mismatch', location);
        check(row.metadata.includes(`Moves: ${(mon.moves || []).slice(0, 4).join(' / ') || 'unknown'}`), 'moves_mismatch', location, mon.moves, row.metadata);
      }
    }
    const field = snapshot?.field || {};
    const expectedTags = [];
    for (const key of ['weather', 'terrain']) if (field[key]) expectedTags.push(`${field[key]}${field[key + '_turns'] ? ` ${field[key + '_turns']}T` : ''}`);
    if (field.trick_room > 0) expectedTags.push(`Trick Room ${field.trick_room}T`);
    for (const [side, prefix] of [['player', 'Your'], ['opponent', 'Their']]) {
      const speed = snapshot?.speed_control?.[side] || {};
      if (speed.tailwind_turns > 0) expectedTags.push(`${prefix} Tailwind ${speed.tailwind_turns}T`);
      for (const [key, name] of [['reflect', 'Reflect'], ['light', 'Light Screen'], ['aurora', 'Aurora Veil']]) {
        if (speed.screens?.[key] > 0) expectedTags.push(`${prefix} ${name} ${speed.screens[key]}T`);
      }
    }
    equal((board?.field || []).map(labelKey).sort(), expectedTags.map(labelKey).sort(), 'field_state_mismatch', label);
  }
  for (const turn of turns) {
    const lines = visual?.turns?.find(t => t.label === `T${turn.turn}`)?.lines || [];
    const events=turn.events || [];
    const actions = events.filter(e => movePrefixes([e.text || e.message || '']).length &&
      (['actor_key','move','log_index'].some(k=>e[k]!=null) || !detailRecord(e.text || e.message || '')));
    const hasAnchor = e => ['actor_key','move','log_index'].some(k => e[k] != null);
    const complete = e => typeof e.actor_key === 'string' && e.actor_key.length > 0 &&
      typeof e.move === 'string' && e.move.length > 0 && Number.isInteger(e.log_index) && e.log_index >= 0;
    if (actions.some(hasAnchor)) {
      check(actions.every(complete), 'incomplete_action_anchors', `T${turn.turn}`, 'all actions anchored', actions);
      const indices = actions.filter(complete).map(e => e.log_index);
      check(indices.every((n,i) => i === 0 || n > indices[i-1]), 'invalid_action_anchor_order', `T${turn.turn}`, 'unique increasing indices', indices);
      for (const e of actions.filter(complete)) check((e.text || e.message || '').includes(` used ${e.move}!`), 'action_anchor_move_mismatch', `T${turn.turn}`, e.move, e.text || e.message);
    }
    const expected = movePrefixes(actions.map(e => e.text || e.message || ''));
    const actual = movePrefixes(lines);
    check(Array.isArray(turn.events), 'missing_action_evidence', `T${turn.turn}`, 'events array', turn.events);
    equal(actual, expected, 'resolved_move_order_or_omission', `T${turn.turn}`);
    const expectedDamage = (turn.damage_events || []).map(e => [e.attacker,e.move,e.target,e.applied_damage ?? e.damage ?? 0]);
    const actualDamage = lines.flatMap(damageRecord);
    equal(actualDamage, expectedDamage, 'damage_display_mismatch', `T${turn.turn}`);
  }
  return { schema_version: 'champions-visual-comparison-v1', seed: log?.seed || null,
    build_id: p?.build_id || null, team_ids: [p?.player_team_id, p?.opp_team_id],
    status: issues.length ? 'mismatch' : 'matched_observable_fields', checks, turns: turns.length, issues,
    not_checked: ['Independent real-game mechanics parity', 'Hidden stable IDs and exact stats not printed in replay cards',
      'Hidden actor IDs/targets, effect tooltips and coach claims', 'Cross-action attribution of legacy damage without action IDs', 'Pixel layout outside inspected screenshots; lazy sprites outside viewport', 'Production DB persistence', ...(!expectedCandidate ? ['Current candidate artifact identity not supplied; historical display consistency only'] : [])] };
}

export function ingestDirectory(directory, expectedCandidate = null) {
  const names = fs.readdirSync(directory);
  const files = names.filter(name => name.endsWith('.visual.json')).sort();
  if (!files.length) throw new Error('No paired visible replay captures');
  const inventory = JSON.parse(fs.readFileSync(path.join(directory, 'capture-inventory.json')));
  const cases = inventory.cases;
  if (inventory.schema_version !== 'champions-visual-inventory-v1' || !Array.isArray(cases) || !cases.length ||
      !Number.isInteger(inventory.expected_game_count) || inventory.expected_game_count < 0 ||
      cases.some(c => !/^[a-zA-Z0-9,._-]+$/.test(c.id) || !['simulation', 'continuity'].includes(c.kind) || !c.seed) ||
      new Set(cases.map(c => c.id)).size !== cases.length ||
      cases.filter(c => c.kind === 'simulation').length !== inventory.expected_game_count) throw new Error('Invalid expected-game inventory');
  const ids = cases.map(c => c.id).sort();
  const visualIds = files.map(f => f.replace(/\.visual\.json$/, '')).sort();
  const logIds = names.filter(f => f.endsWith('.log.json')).map(f => f.replace(/\.log\.json$/, '')).sort();
  if (JSON.stringify(ids) !== JSON.stringify(visualIds) || JSON.stringify(ids) !== JSON.stringify(logIds)) {
    throw new Error('Unpaired, unexpected or missing evidence: inventory, logs and visible captures must match exactly');
  }
  const reports = files.map(file => {
    const logName = file.replace(/\.visual\.json$/, '.log.json');
    const logBytes = fs.readFileSync(path.join(directory, logName));
    const visualBytes = fs.readFileSync(path.join(directory, file));
    const log = JSON.parse(logBytes);
    const captureCase = cases.find(c => c.id === file.replace(/\.visual\.json$/, ''));
    if (JSON.stringify(captureCase.seed) !== JSON.stringify(log.seed)) throw new Error('Seed differs from capture inventory: ' + file);
    const report = compareVisibleReplay(log, JSON.parse(visualBytes), expectedCandidate);
    const provenance = Object.fromEntries(['build_id','engine_version','ruleset_version','regulation_id',
      'player_team_digest','opp_team_digest','format','policy','policy_version'].map(k=>[k,log.provenance?.[k]]));
    const scenario = {seed:log.seed, provenance, participants:log.participants,
      team_snapshots:log.team_snapshots, policy:log.policy_provenance, format:log.format,
      bring:log.bring, leads:log.leads, forced_actions:log.forcedActions};
    return {scenario_sha256:digest(scenario),
      observation_sha256:digest({scenario,turnLog:log.turnLog,result:log.result,terminal:log.terminal}), ...report, case_kind: captureCase.kind, log_file: logName, visual_file: file,
      log_sha256: createHash('sha256').update(logBytes).digest('hex'), visual_sha256: createHash('sha256').update(visualBytes).digest('hex') };
  });
  const issue_counts = {};
  for (const report of reports) for (const issue of report.issues) issue_counts[issue.code] = (issue_counts[issue.code] || 0) + 1;
  return { schema_version: 'champions-visual-ingestion-v1', generated_at: new Date().toISOString(),
    evidence_scope: 'local downloaded JSON versus visible DOM; not trusted promotion',
    expected_game_count: inventory.expected_game_count, pairs: reports.length,
    declared_simulation_captures: inventory.expected_game_count,
    unique_scenarios: new Set(reports.map(r=>r.scenario_sha256)).size,
    unique_observations: new Set(reports.map(r=>r.observation_sha256)).size,
    unique_capture_pairs: new Set(reports.map(r=>r.log_sha256+':'+r.visual_sha256)).size,
    repeated_captures: reports.length-new Set(reports.map(r=>r.observation_sha256)).size,
    verified_execution_count: null,
    count_limitations: ['Inventory IDs declare captures, not independently verified executions.',
      'Scenario counts use retained metadata only; missing fields cannot establish distinct scenarios.',
      'Repeated captures and permutations do not establish independent mechanics or accuracy percentages.'],
    mismatch_pairs: reports.filter(r => r.issues.length).length,
    turns: reports.reduce((n, r) => n + r.turns, 0), issue_counts, reports };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const directory = path.resolve(process.argv[2]);
    const report = ingestDirectory(directory);
    fs.writeFileSync(path.join(directory, 'comparison-report.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ pairs: report.pairs, turns: report.turns, mismatch_pairs: report.mismatch_pairs, issue_counts: report.issue_counts }, null, 2));
    process.exitCode = report.mismatch_pairs ? 1 : 0;
  } catch (error) { console.error(error.message); process.exitCode = 2; }
}
