// This diagnostic is separate from historical rules and competitive approval.
function reviewMcTeam(team, reference) {
  var id = function(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, ''); };
  if (!reference || reference.regulation !== 'champions_reg_m_c_2026') return null;
  if (!team || team.format === 'sv' || !Array.isArray(team.members)) return null;
  var items = new Set();
  return team.members.map(function(member) {
    var key = id(member.species || member.name);
    if (key === 'floetteeternalflowermega') key = 'floettemega';
    if (key === 'floetteeternalflower') key = 'floetteeternal';
    var species = Object.prototype.hasOwnProperty.call(reference.species, key) ? reference.species[key] : null;
    var issues = [];
    if (!species) issues.push('Species identity unresolved');
    else if (!species.available) issues.push('Species unavailable in M-C reference');
    else {
      (member.moves || []).forEach(function(move) {
        if (species.moves.indexOf(id(move)) < 0) issues.push(move + ': outside reference move pool');
      });
      if (member.ability && species.abilities.indexOf(id(member.ability)) < 0) issues.push('Ability outside reference pool');
    }
    var item = id(member.item);
    if (item && reference.items.indexOf(item) < 0) issues.push('Item outside M-C reference pool');
    if (item && items.has(item)) issues.push('Duplicate held item');
    if (item) items.add(item);
    if (member.ivs && Object.keys(member.ivs).some(function(stat) { return member.ivs[stat] !== 31; })) issues.push('Reference requires all IVs to be 31');
    return {name: member.name || member.species || 'Unknown Pokemon',
      speciesStatus: !species ? 'Identity unverified' : species.available ? 'Species in M-C reference' : 'Species unavailable in M-C reference',
      issues:issues};
  });
}
function csRenderMcReview(team) {
  var rows = reviewMcTeam(team, typeof MC_REVIEW_REFERENCE === 'undefined' ? null : MC_REVIEW_REFERENCE);
  if (!rows) return '';
  var failed = rows.some(function(row) { return row.issues.length; });
  return '<div class="team-legality-note"><strong>M-C: ' + (failed ? 'SET REVIEW REQUIRED' : 'LEGALITY UNVERIFIED') +
    '</strong><small>Pinned Showdown reference, September 9. Not official approval; combinations and battle implementation are not certified.</small><ul>' +
    rows.map(function(row) { return '<li><strong>' + _escapeHtml(row.name) + '</strong>: ' + _escapeHtml(row.speciesStatus) +
      (row.issues.length ? '. ' + _escapeHtml(row.issues.join('; ')) : '. No issues in these limited checks; full legality unverified') + '</li>'; }).join('') + '</ul></div>';
}
