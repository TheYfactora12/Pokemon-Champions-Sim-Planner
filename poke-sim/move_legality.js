// Species/form-specific learnset legality helper.
// Uses generated Pokemon Showdown audit data when available.

(function(root) {
  var ChampionsSim = root.ChampionsSim = root.ChampionsSim || {};
  ChampionsSim.moveLegality = ChampionsSim.moveLegality || {};

  var data = ChampionsSim.pokemonDataAudit;
  if (!data && typeof require === 'function') {
    try { data = require('./generated/pokemon_showdown_legal_data.js'); } catch (_e) { data = null; }
  }

  function clean(value) {
    return String(value == null ? '' : value).trim();
  }

  function toId(value) {
    return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  function buildSpeciesIndex() {
    var index = Object.create(null);
    if (!data || !data.species) return index;
    Object.keys(data.species).forEach(function(key) {
      var row = data.species[key] || {};
      index[toId(key)] = key;
      index[toId(row.displayName || key)] = key;
      index[toId(row.speciesKey || key)] = key;
      if (row.forme) index[toId((row.baseSpecies || key) + '-' + row.forme)] = key;
    });
    Object.keys(data.species).forEach(function(key) {
      if (/-Hisui$/i.test(key)) {
        var base = key.replace(/-Hisui$/i, '');
        index[toId('Hisuian ' + base)] = key;
        index[toId(base + ' Hisui')] = key;
      }
    });
    if (data.species['Floette-Eternal']) {
      index[toId('Floette (Eternal Flower)')] = 'Floette-Eternal';
      index[toId('Eternal Flower Floette')] = 'Floette-Eternal';
    }
    return index;
  }

  function buildMoveIndex() {
    var index = Object.create(null);
    if (!data || !data.moves) return index;
    Object.keys(data.moves).forEach(function(id) {
      var row = data.moves[id] || {};
      index[toId(id)] = id;
      index[toId(row.move_name || id)] = id;
    });
    return index;
  }

  var speciesIndex = buildSpeciesIndex();
  var moveIndex = buildMoveIndex();

  function canonicalSpeciesKey(speciesKey) {
    var raw = clean(speciesKey);
    if (!raw) return '';
    var id = toId(raw);
    if (speciesIndex[id]) return speciesIndex[id];
    var hisui = raw.match(/^Hisuian\s+(.+)$/i);
    if (hisui) {
      var converted = clean(hisui[1]) + '-Hisui';
      if (speciesIndex[toId(converted)]) return speciesIndex[toId(converted)];
    }
    var suffix = raw.match(/^(.+)\s+Hisui$/i);
    if (suffix) {
      var convertedSuffix = clean(suffix[1]) + '-Hisui';
      if (speciesIndex[toId(convertedSuffix)]) return speciesIndex[toId(convertedSuffix)];
    }
    return '';
  }

  function canonicalMoveId(moveName) {
    var id = toId(moveName);
    return moveIndex[id] || id;
  }

  function learnsetSpeciesKey(speciesKey) {
    var canonical = canonicalSpeciesKey(speciesKey);
    if (!canonical || !data || !data.species) return '';
    var row = data.species[canonical];
    if (!row) return '';
    if (row.moves && Object.keys(row.moves).length) return canonical;
    if (/-Mega(?:-[XY])?$/i.test(canonical) && row.baseSpecies) {
      var base = canonicalSpeciesKey(row.baseSpecies);
      if (base && data.species[base] && data.species[base].moves) return base;
    }
    return canonical;
  }

  function moveDisplayName(moveId, fallback) {
    var row = data && data.moves ? data.moves[moveId] : null;
    return row && row.move_name ? row.move_name : clean(fallback || moveId);
  }

  function unchecked(speciesKey, moveName, reason, notes) {
    return {
      legal: false,
      speciesKey: clean(speciesKey),
      canonicalSpeciesKey: '',
      moveName: clean(moveName),
      canonicalMoveName: clean(moveName),
      source: data && data.source ? data.source : 'unavailable',
      sourceVersion: data && data.sourceCommitOrVersion ? data.sourceCommitOrVersion : 'unavailable',
      reason: reason,
      notes: notes || 'unchecked'
    };
  }

  function isMoveLegalForSpecies(speciesKey, moveName, opts) {
    opts = opts || {};
    if (!data || !data.species || !data.moves) {
      return unchecked(speciesKey, moveName, 'source_unavailable', 'Generated Pokemon Showdown legality data is not loaded.');
    }
    var species = canonicalSpeciesKey(speciesKey);
    if (!species) return unchecked(speciesKey, moveName, 'unknown_species', 'Species/form was not found in generated source data.');
    var moveId = canonicalMoveId(moveName);
    if (!moveId || !data.moves[moveId]) {
      return {
        legal: false,
        speciesKey: clean(speciesKey),
        canonicalSpeciesKey: species,
        moveName: clean(moveName),
        canonicalMoveName: clean(moveName),
        source: data.source,
        sourceVersion: data.sourceCommitOrVersion,
        reason: 'unknown_move',
        notes: 'Move was not found in Pokemon Showdown moves data.'
      };
    }
    var learnKey = learnsetSpeciesKey(species);
    var row = learnKey ? data.species[learnKey] : null;
    var codes = row && row.moves ? row.moves[moveId] : '';
    var legal = !!codes;
    var inherited = (row && row.inheritedFrom) || (learnKey && learnKey !== species ? learnKey : '');
    return {
      legal: legal,
      speciesKey: clean(speciesKey),
      canonicalSpeciesKey: species,
      moveName: clean(moveName),
      canonicalMoveName: moveDisplayName(moveId, moveName),
      source: data.source,
      sourceVersion: data.sourceCommitOrVersion,
      reason: legal ? 'learnset_match' : 'not_in_species_form_learnset',
      notes: legal
        ? (inherited ? 'Legal via ' + inherited + ' learnset.' : 'Legal for exact species/form learnset.')
        : 'Move exists globally but is not present in this species/form learnset.',
      learnMethodCodes: codes,
      inheritedFrom: inherited
    };
  }

  function validateMovesForSet(member, opts) {
    member = member || {};
    return (member.moves || []).filter(Boolean).map(function(move) {
      return isMoveLegalForSpecies(member.name || member.species || '', move, opts || {});
    });
  }

  ChampionsSim.moveLegality.isMoveLegalForSpecies = isMoveLegalForSpecies;
  ChampionsSim.moveLegality.validateMovesForSet = validateMovesForSet;
  ChampionsSim.moveLegality.canonicalSpeciesKey = canonicalSpeciesKey;
  ChampionsSim.moveLegality.canonicalMoveId = canonicalMoveId;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChampionsSim.moveLegality;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
