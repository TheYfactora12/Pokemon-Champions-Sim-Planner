// This diagnostic is separate from historical rules and competitive approval.
function mcReferenceReady() {
  return typeof MC_REVIEW_REFERENCE !== 'undefined' && !!MC_REVIEW_REFERENCE &&
    MC_REVIEW_REFERENCE.pin === 'efe4948570d5e8189751792136d26e71710c6c66' &&
    MC_REVIEW_REFERENCE.regulation === 'champions_reg_m_c_2026' &&
    MC_REVIEW_REFERENCE.species && Array.isArray(MC_REVIEW_REFERENCE.items);
}

function getMcReferenceMega(name) {
  if (!mcReferenceReady() || name !== 'Raichu-Mega-X') return null;
  // Quarantined reference implementation; never adds a row to approved runtime data.
  return {baseSpecies:'Raichu', megaName:'Raichu-Mega-X', megaStone:'Raichunite X', types:['Electric'],
    megaBaseStats:{hp:60,atk:135,def:95,spa:90,spd:95,spe:110},
    ability:'Electric Surge', baseAbility:'Static', weightkg:38};
}

function checkMcReferenceExecution(team, options) {
  var opts = options || {}, errors = [];
  var id = function(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]/g,''); };
  var result = {allowed:false,competitive_eligible:false,status:'not_verified',
    regulation_id:'champions_mc_reference',ruleset_version:'champions-mc-reference-v1',
    errors:errors,source_gaps:['Reference simulation only; official M-C approval and full mechanics parity are incomplete.'],
    mechanics_status:'experimental',scope:'pinned_reference_not_official_certification'};
  if (!mcReferenceReady() || typeof validateTeam !== 'function') { errors.push('Pinned reference validation unavailable.'); return result; }
  if (!team || team.format !== 'champions' || !Array.isArray(team.members) ||
      team.members.length < 4 || team.members.length > 6 || team.members.some(function(m) {
        return !m || typeof m.name !== 'string' || typeof m.ability !== 'string' || typeof m.nature !== 'string' ||
          (m.item != null && typeof m.item !== 'string') || !Array.isArray(m.moves) ||
          m.moves.some(function(v) { return typeof v !== 'string'; });
      })) { errors.push('Reference doubles requires four to six well-formed Champions sets.'); return result; }
  if (opts.format !== 'doubles' || [1,3].indexOf(opts.bo == null ? 1 : opts.bo) < 0) errors.push('Reference mode supports doubles Bo1 or Bo3.');
  if (team.import_context && team.import_context.draft_only &&
      team.import_context.regulation_id !== 'champions_reg_m_c_2026') errors.push('Unsupported saved draft context.');
  var base = validateTeam(team,'champions',{mcDraftOnly:true});
  errors.push.apply(errors,base.errors || []);
  var rows = reviewMcTeam(team,MC_REVIEW_REFERENCE), seen = new Set();
  team.members.forEach(function(m,i) {
    errors.push.apply(errors,rows[i].issues.map(function(e) { return m.name+': '+e; }));
    if (m.species && id(m.species) !== id(m.name)) errors.push(m.name+': conflicting species identity.');
    if (!m.ability || !m.nature || (m.level != null && m.level !== 50)) errors.push(m.name+': ability, nature and level 50 required.');
    if (['Hardy','Lonely','Brave','Adamant','Naughty','Bold','Docile','Relaxed','Impish','Lax','Timid','Hasty','Serious','Jolly','Naive','Modest','Mild','Quiet','Bashful','Rash','Calm','Gentle','Sassy','Careful','Quirky'].indexOf(m.nature) < 0) errors.push(m.name+': unknown nature.');
    if (m.moves.some(function(v) { return !v.trim(); }) || new Set(m.moves.map(id)).size !== m.moves.length) errors.push(m.name+': distinct moves required.');
    if (m.import_format_signals && Array.isArray(m.import_format_signals.spreadErrors)) errors.push.apply(errors,m.import_format_signals.spreadErrors);
    if (m.tera || m.teraType || m.tera_type) errors.push(m.name+': Terastallization is unsupported.');
    var api = typeof ChampionsSim !== 'undefined' && ChampionsSim.moveLegality;
    var data = typeof ChampionsSim !== 'undefined' && ChampionsSim.pokemonDataAudit;
    var species = data && api && data.species[api.canonicalSpeciesKey(m.name)];
    if (!species || !Number.isInteger(species.num)) errors.push(m.name+': species identity missing.');
    else if (seen.has(species.num)) errors.push(m.name+': duplicate National Dex species.');
    else seen.add(species.num);
    var mega = (typeof CHAMPIONS_MEGAS !== 'undefined' && CHAMPIONS_MEGAS[m.name]) || getMcReferenceMega(m.name);
    if (m.name.indexOf('-Mega') >= 0 && !mega) errors.push(m.name+': Mega lifecycle not implemented.');
    if (mega && m.item !== mega.megaStone) errors.push(m.name+': matching Mega Stone required.');
  });
  if (opts.bring && (!Array.isArray(opts.bring) || opts.bring.length !== 4 || new Set(opts.bring).size !== 4 ||
      opts.bring.some(function(n) { return team.members.filter(function(m) { return m.name === n; }).length !== 1; }))) errors.push('Select four distinct registered Pokemon.');
  result.errors = Array.from(new Set(errors));
  result.allowed = !result.errors.length;
  if (result.allowed) result.status = 'experimental';
  return result;
}

function getMcReferenceChoices(kind, speciesName, data, showUnavailable) {
  var ref = typeof MC_REVIEW_REFERENCE === 'undefined' ? null : MC_REVIEW_REFERENCE;
  if (!ref || ref.regulation !== 'champions_reg_m_c_2026' ||
      ref.pin !== 'efe4948570d5e8189751792136d26e71710c6c66' || !ref.species || !Array.isArray(ref.items)) return [];
  var id = function(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, ''); };
  var key = id(speciesName);
  if (key === 'floetteeternalflowermega') key = 'floettemega';
  if (key === 'floetteeternalflower') key = 'floetteeternal';
  var species = Object.prototype.hasOwnProperty.call(ref.species,key) ? ref.species[key] : null;
  var source = kind === 'species' ? ref.species : kind === 'item' ? data.items : kind === 'move' ? data.moves : kind === 'ability' ? data.abilities : null;
  if (!source) return [];
  return Object.keys(source).map(function(k) {
    var name = source[k].name || k;
    var eligible = kind === 'species' ? source[k].available === true : kind === 'item' ? ref.items.indexOf(id(name)) >= 0 :
      !!(species && species.available && Array.isArray(species[kind === 'move' ? 'moves' : 'abilities']) &&
        species[kind === 'move' ? 'moves' : 'abilities'].indexOf(id(name)) >= 0);
    return {name:name,status:eligible ? 'reference_only' : 'unavailable',
      regulation_id:ref.regulation,ruleset_version:'champions-reg-mc-source-review-v1',
      source_version:ref.pin,source:'pinned_showdown_mc_reference',competitive_eligible:false};
  }).filter(function(row) { return showUnavailable || row.status === 'reference_only'; })
    .sort(function(a,b) { return a.name.localeCompare(b.name); });
}

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
