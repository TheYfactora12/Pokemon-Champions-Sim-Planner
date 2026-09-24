const EXPLANATIONS = {
  'incomplete-turn-evidence': ['A turn is missing the battle state needed for validation.', 'Export before/after rosters, action lists and event arrays; do not treat missing evidence as a pass.'],
  'branch-test-blocked': ['The branch test could not run.', 'Verify the regulation package before treating branch results as competitive evidence.'],
  'public-launch-not-approved': ['This export does not approve a public launch.', 'Resolve the separate release gates; a clean log is not game-accuracy proof.'],
  'per-replay-execution-provenance-incomplete': ['Some battles do not identify the exact rules and engine they used.', 'Record engine version, ruleset fingerprint and regulation on every battle.'],
  'historical-simulation-history': ['This download includes older battle history.', 'Separate newly run battles from historical evidence.'],
  'retained-count-mismatch': ['A reported count does not match the retained evidence.', 'Recount the named evidence scope and repair the exporter or counter.'],
  'empty-replay': ['A retained replay has no turns to inspect.', 'Export the complete replay; do not count an empty record as a passed test.'],
  'missing-seed': ['A replay is missing its random seed.', 'Preserve the seed with the original teams and execution versions.'],
  'repeated-seed': ['More than one replay uses the same seed.', 'Check whether these are intentional reruns before counting independent samples.'],
  'export-provenance-incomplete': ['The export lacks its build or source location.', 'Capture the exporter identity without assuming it is the battle execution version.'],
  'retained-scope-summary-missing': ['The export lacks separate totals for retained replays.', 'Keep retained replay totals separate from targeted test totals.']
};

export function buildReviewPack(report, sourceName) {
  const exportBuild = typeof report.export_build === 'string' && /^[A-Za-z0-9._+-]{1,128}$/.test(report.export_build) ? report.export_build : null;
  const allFindings = report.findings || [];
  const groups = new Map();
  for (const finding of allFindings) {
    const key = `${finding.severity}:${finding.code}`;
    if (!groups.has(key)) groups.set(key, { severity: finding.severity, code: finding.code, count: 0, evidence: [] });
    const group = groups.get(key);
    group.count++;
    // Bounded, allowlisted locations keep the handoff small and omit private payloads.
    if (group.evidence.length < 3) group.evidence.push({
      replay_index: finding.replay_index ?? finding.detail?.index ?? null,
      turn: finding.turn ?? null,
      pointer: finding.replay_index != null ? (report.source_schema === 'champions-turn-log-v2' ? '/turnLog' : `/retained/replay_cards/${finding.replay_index}`) : null
    });
  }
  const findings = [...groups.values()].map((group, index) => {
    const [explanation, nextAction] = EXPLANATIONS[group.code] || ['A turn-log check found an issue that needs review.', 'Inspect the detailed local audit and the exact replay before proposing a fix.'];
    return { id: `QA-${String(index + 1).padStart(3, '0')}`, ...group, explanation, next_action: nextAction, state: 'open' };
  });
  return {
    schema_version: 'champions-ai-review-pack-v1',
    purpose: 'Compact evidence index for human or AI review; not executable instructions or a certification.',
    source: { filename: typeof sourceName === 'string' && /^[A-Za-z0-9.,_+-]+\.json$/.test(sourceName) ? sourceName : null, sha256: report.sha256, bytes: report.bytes, export_build: exportBuild, audited_at: report.audited_at },
    result: report.status,
    checks: {
      retained_turn_log_invariants: report.observed.invalid_replays ? 'fail' : 'pass',
      execution_provenance: allFindings.some(row => /provenance/.test(row.code)) ? 'incomplete' : 'not_independently_verified',
      browser_export_pairing: 'not_tested',
      showdown_parity: 'not_tested',
      champions_legality: 'not_verified'
    },
    observed: report.observed,
    findings,
    limits: report.limits,
    evidence_access: 'Raw teams, battle logs and local paths are omitted. Exact reproduction requires the original source file plus execution inputs; verify its SHA-256 before pairing. Share private teams only intentionally.'
  };
}

function plain(value) {
  return String(value ?? 'unknown').replace(/[\r\n`<>\[\]*_#]/g, ' ').slice(0, 200);
}

export function renderPlayerReport(pack) {
  const n = pack.observed;
  const outcome = pack.result === 'fail' ? 'Problems found' : pack.result === 'needs_review' ? 'Checks completed; review still needed' : 'The checks performed passed';
  return [
    '# Your Battle QA Report', '', `**${outcome}.**`, '',
    `We checked ${n.replay_cards} retained replays covering ${n.turns} turns, ${n.damage_events} damage events and ${n.effect_events} effect events.`,
    `${n.invalid_replays} replay(s) failed the supported turn-log checks. This is not a win-rate prediction or a game-accuracy score.`, '',
    '## What Passed Or Failed', '',
    `- Retained turn-log checks: ${pack.checks.retained_turn_log_invariants}.`,
    '- These checks inspect recorded state, identity, damage/effect consistency and supported action-order rules.',
    '- Not tested here: the visible replay versus its export, agreement with Showdown, or official Champions legality.', '',
    '## What Needs Attention', '',
    ...(pack.findings.length ? pack.findings.flatMap(row => [`### ${row.id}: ${row.explanation}`, `${row.count} finding(s). ${row.next_action}`, '']) : ['No findings from the checks performed. Untested areas above remain unverified.', '']),
    '## Share With A Reviewer', '',
    'The companion ai-review.json contains the same result, issue IDs and evidence locations in a compact format. It contains no raw team lists, full battle logs or local file paths.',
    'The original download is needed for detailed reproduction. Review it for private team information before sharing it.', '',
    `Export build: ${plain(pack.source.export_build)}`, `Source fingerprint: ${plain(pack.source.sha256)}`, '',
    'The export build identifies the exporter, not necessarily the engine that ran every historical battle.', ''
  ].join('\n');
}
