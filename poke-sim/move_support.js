(function(root) {
  var ChampionsSim = root.ChampionsSim = root.ChampionsSim || {};
  ChampionsSim.moveSupport = ChampionsSim.moveSupport || {};

  var auditData = ChampionsSim.pokemonDataAudit;
  if (!auditData && typeof require === 'function') {
    try { auditData = require('./generated/pokemon_showdown_legal_data.js'); } catch (_e) { auditData = null; }
  }

  var LEGACY_VERIFIED_MOVES = new Set([
    'Fake Out', 'Protect', 'Tailwind', 'Trick Room', 'Taunt', 'Encore',
    'Sucker Punch', 'Feint', 'Quick Guard', 'Wide Guard', 'Haze', 'Recover',
    'Rest', 'Sleep Talk', 'Substitute', 'Imprison', 'Ally Switch', 'Roost',
    "King's Shield", 'Spiky Shield', 'Baneful Bunker', 'Obstruct',
    'Dragon Darts', 'Aurora Veil', 'Life Dew', 'Follow Me', 'Rage Powder',
    'Make It Rain', 'Blood Moon', 'U-turn', 'Flip Turn', 'Expanding Force'
  ]);

  var VERIFIED_MOVE_REGISTRY = {
    'Freeze-Dry': {
      supportLevel: 'verified',
      summary: 'Water-type targets take super-effective Freeze-Dry damage.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Freeze-Dry move page']
    },
    'Giga Drain': {
      supportLevel: 'verified',
      summary: 'Draining damage heals the user for half the damage dealt.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Giga Drain move page']
    },
    'Rock Tomb': {
      supportLevel: 'verified',
      summary: 'Damage lands and then lowers the target Speed by one stage.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Rock Tomb move page']
    },
    'Light Screen': {
      supportLevel: 'verified',
      summary: 'Reduces incoming special damage for the side while active.',
      tests: ['tests/move_verification_registry_tests.js', 'tests/t9j8_tests.js'],
      sources: ['Bulbapedia: Light Screen move page']
    },
    'Reflect': {
      supportLevel: 'verified',
      summary: 'Reduces incoming physical damage for the side while active.',
      tests: ['tests/move_verification_registry_tests.js', 'tests/t9j8_tests.js'],
      sources: ['Bulbapedia: Reflect move page']
    }
  };

  function clean(value) {
    return String(value == null ? '' : value).trim();
  }

  function toId(value) {
    return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  function moveRow(moveName) {
    if (!auditData || !auditData.moves) return null;
    return auditData.moves[toId(moveName)] || null;
  }

  function registryEntry(name, obj, allowZero) {
    if (!obj) return false;
    if (allowZero) return Object.prototype.hasOwnProperty.call(obj, name);
    return !!obj[name];
  }

  function getVerificationEntry(move) {
    if (VERIFIED_MOVE_REGISTRY[move]) return VERIFIED_MOVE_REGISTRY[move];
    if (LEGACY_VERIFIED_MOVES.has(move)) {
      return {
        supportLevel: 'verified',
        summary: 'Move has dedicated local regression coverage in the simulator test suite.',
        tests: ['See existing focused sim regression tests'],
        sources: ['Local simulator regression suite']
      };
    }
    return null;
  }

  function getLocalMoveSupport(moveName) {
    var move = clean(moveName);
    var row = moveRow(move);
    var hasType = typeof MOVE_TYPES !== 'undefined' && registryEntry(move, MOVE_TYPES);
    var hasCategory = typeof MOVE_CATEGORY !== 'undefined' && registryEntry(move, MOVE_CATEGORY);
    var hasBasePower = typeof MOVE_BP !== 'undefined' && registryEntry(move, MOVE_BP, true);
    var hasTarget = typeof MOVE_TARGETS !== 'undefined' && registryEntry(move, MOVE_TARGETS);
    var missing = [];
    if (!hasType) missing.push('type');
    if (!hasCategory) missing.push('category');
    if (!hasBasePower) missing.push('basePower');
    if (!hasTarget) missing.push('target');
    var registryComplete = missing.length === 0;
    var verification = getVerificationEntry(move);
    var verified = !!verification;
    var supportLevel = registryComplete ? (verified ? (verification.supportLevel || 'verified') : 'baseline') : 'incomplete';
    var notes = '';
    if (!registryComplete) {
      notes = 'Local sim metadata is incomplete: missing ' + missing.join(', ') + '.';
    } else if (verified) {
      notes = verification.summary || 'Move has explicit regression coverage in the local simulator test suite.';
    } else {
      notes = 'Move has core local metadata, but no dedicated edge-case regression tag yet.';
    }
    return {
      moveName: move,
      canonicalMoveName: row && row.move_name ? row.move_name : move,
      moveId: toId(move),
      source: auditData && auditData.source ? auditData.source : 'unavailable',
      sourceVersion: auditData && auditData.sourceCommitOrVersion ? auditData.sourceCommitOrVersion : 'unavailable',
      showdown: row ? {
        type: row.type || '',
        category: row.category || '',
        basePower: row.base_power,
        target: row.target || '',
        flags: row.flags || ''
      } : null,
      local: {
        type: hasType ? MOVE_TYPES[move] : '',
        category: hasCategory ? MOVE_CATEGORY[move] : '',
        basePower: hasBasePower ? MOVE_BP[move] : '',
        target: hasTarget ? MOVE_TARGETS[move] : ''
      },
      registryComplete: registryComplete,
      verified: verified,
      verification: verification ? {
        supportLevel: verification.supportLevel || 'verified',
        summary: verification.summary || '',
        tests: (verification.tests || []).slice(),
        sources: (verification.sources || []).slice()
      } : null,
      supportLevel: supportLevel,
      missing: missing,
      notes: notes
    };
  }

  function summarizeMoveSupport(moves) {
    return (moves || []).filter(Boolean).map(getLocalMoveSupport);
  }

  ChampionsSim.moveSupport.getLocalMoveSupport = getLocalMoveSupport;
  ChampionsSim.moveSupport.summarizeMoveSupport = summarizeMoveSupport;
  ChampionsSim.moveSupport.VERIFIED_MOVES = LEGACY_VERIFIED_MOVES;
  ChampionsSim.moveSupport.VERIFIED_MOVE_REGISTRY = VERIFIED_MOVE_REGISTRY;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChampionsSim.moveSupport;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
