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
    'Dragon Claw': {
      supportLevel: 'verified',
      summary: 'Standard physical Dragon damage matches the Showdown damage oracle, including STAB and burn/crit stat-stage interactions.',
      tests: ['tests/showdown_damage_oracle_tests.js', 'tests/t9j8_tests.js'],
      sources: ['Pokemon Showdown damage calculation via @smogon/calc']
    },
    'Earthquake': {
      supportLevel: 'verified',
      summary: 'Ground damage and Ground immunities match the Showdown damage oracle, including Earth Eater and Levitate interactions.',
      tests: ['tests/showdown_damage_oracle_tests.js', 'tests/ability_damage_parity_tests.js'],
      sources: ['Pokemon Showdown damage calculation via @smogon/calc']
    },
    'Moonblast': {
      supportLevel: 'verified',
      summary: 'Standard special Fairy damage matches the Showdown damage oracle, including sand special-defense and Fairy Aura modifier cases.',
      tests: ['tests/showdown_damage_oracle_tests.js'],
      sources: ['Pokemon Showdown damage calculation via @smogon/calc']
    },
    'Thunderbolt': {
      supportLevel: 'verified',
      summary: 'Standard special Electric damage matches the Showdown damage oracle, including Electric Terrain and Tera STAB cases.',
      tests: ['tests/showdown_damage_oracle_tests.js', 'tests/runtime_data_bridge_tests.js'],
      sources: ['Pokemon Showdown damage calculation via @smogon/calc']
    },
    'Shadow Ball': {
      supportLevel: 'verified',
      summary: 'Special Ghost damage through the damage pipeline matches the Showdown oracle, including Infiltrator screen bypass.',
      tests: ['tests/showdown_damage_oracle_tests.js'],
      sources: ['Pokemon Showdown damage calculation via @smogon/calc']
    },
    'Sludge Bomb': {
      supportLevel: 'verified',
      summary: 'Special Poison damage with Sheer Force matches the Showdown damage oracle.',
      tests: ['tests/showdown_damage_oracle_tests.js'],
      sources: ['Pokemon Showdown damage calculation via @smogon/calc']
    },
    'High Horsepower': {
      supportLevel: 'verified',
      summary: 'Ground damage with Mold Breaker bypassing Levitate matches the Showdown damage oracle.',
      tests: ['tests/showdown_damage_oracle_tests.js'],
      sources: ['Pokemon Showdown damage calculation via @smogon/calc']
    },
    'Hyper Voice': {
      supportLevel: 'verified',
      summary: 'Uses Showdown all-adjacent-foes target data so doubles spread targeting hits both adjacent foes.',
      tests: ['tests/move_verification_registry_tests.js', 'tests/runtime_data_bridge_tests.js'],
      sources: ['Pokemon Showdown data/moves.ts target field']
    },
    'Last Respects': {
      supportLevel: 'verified',
      summary: 'Scales base power from the attacker side fainted count only.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Last Respects move page']
    },
    'Icy Wind': {
      supportLevel: 'verified',
      summary: 'Deals spread damage and lowers Speed on all hit foes through the secondary-effect path.',
      tests: ['tests/t155_speed_control_secondary_tests.js'],
      sources: ['Bulbapedia: Icy Wind move page']
    },
    'Low Kick': {
      supportLevel: 'verified',
      summary: 'Uses target Showdown species weight to select the official weight-based base-power tier.',
      tests: ['tests/showdown_damage_oracle_tests.js'],
      sources: ['Pokemon Showdown data/moves.ts lowkick', 'Pokemon Showdown data/pokedex.ts weightkg']
    },
    'Tera Blast': {
      supportLevel: 'verified',
      summary: 'Inactive Tera Blast stays Normal/special; active Tera Blast uses active Tera type, chooses category from boosted attacking stats, and bypasses Normal-conversion abilities.',
      tests: ['tests/showdown_damage_oracle_tests.js'],
      sources: ['Pokemon Showdown damage calculation via @smogon/calc']
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
    },
    'U-turn': {
      supportLevel: 'verified',
      summary: 'Deals damage through the shared targeting flow and then immediately switches the user out when a replacement is available.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: U-turn move page']
    },
    'Flip Turn': {
      supportLevel: 'verified',
      summary: 'Deals damage and then pivots the user out into a replacement when the hit succeeds.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Flip Turn move page']
    },
    'Volt Switch': {
      supportLevel: 'verified',
      summary: 'Deals damage and then pivots the user out on a successful hit instead of remaining active.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Volt Switch move page']
    },
    'Parting Shot': {
      supportLevel: 'verified',
      summary: 'Lowers the target Attack and Special Attack and then switches the user out when a replacement exists.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Parting Shot move page']
    },
    'Shed Tail': {
      supportLevel: 'verified',
      summary: 'Consumes the user HP, switches out immediately, and leaves the Substitute with the incoming replacement.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Shed Tail move page']
    },
    'Teleport': {
      supportLevel: 'verified',
      summary: 'Acts as a trainer-battle self-switch move and brings in a replacement from the bench.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Teleport move page']
    },
    'Baton Pass': {
      supportLevel: 'verified',
      summary: 'Switches the user out and transfers the modeled passable battle state, including stat stages and Substitute, to the replacement.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Baton Pass move page']
    },
    'Wish': {
      supportLevel: 'verified',
      summary: 'Schedules an end-of-next-turn heal for the Pokemon occupying the user slot, using half of the original user max HP.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Wish move page']
    },
    'Swords Dance': {
      supportLevel: 'verified',
      summary: 'Raises the user Attack by two stages.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Swords Dance move page']
    },
    'Dragon Dance': {
      supportLevel: 'verified',
      summary: 'Raises the user Attack and Speed by one stage each.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Dragon Dance move page']
    },
    'Calm Mind': {
      supportLevel: 'verified',
      summary: 'Raises the user Special Attack and Special Defense by one stage each.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Calm Mind move page']
    },
    'Coil': {
      supportLevel: 'verified',
      summary: 'Raises the user Attack, Defense, and accuracy by one stage each.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Coil move page']
    },
    'Fake Tears': {
      supportLevel: 'verified',
      summary: 'Harshly lowers the target Special Defense by two stages.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Fake Tears move page']
    },
    'Coaching': {
      supportLevel: 'verified',
      summary: 'Boosts all allied active Pokemon except the user, raising their Attack and Defense by one stage each, and fails without an ally.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Coaching move page']
    },
    'Clangorous Soul': {
      supportLevel: 'verified',
      summary: 'Costs one-third max HP and raises the user Attack, Defense, Special Attack, Special Defense, and Speed by one stage each.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Clangorous Soul move page']
    },
    'Hypnosis': {
      supportLevel: 'verified',
      summary: 'Inflicts sleep on a valid target using the engine status pipeline.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Hypnosis move page']
    },
    'Spore': {
      supportLevel: 'verified',
      summary: 'Inflicts sleep on a valid target using the engine status pipeline.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Spore move page']
    },
    'Leech Seed': {
      supportLevel: 'verified',
      summary: 'Seeds a target and drains HP at end of turn until the target switches or faints.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Leech Seed move page']
    },
    'Perish Song': {
      supportLevel: 'verified',
      summary: 'Sets a three-turn perish counter on active battlers and faints them at zero.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Perish Song move page']
    },
    'Trick': {
      supportLevel: 'verified',
      summary: 'Swaps held items between the user and the target when at least one item exists.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Trick move page']
    },
    'Heal Pulse': {
      supportLevel: 'verified',
      summary: 'Restores half of the target max HP and fails if the target is already at full HP.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Heal Pulse move page']
    },
    'Helping Hand': {
      supportLevel: 'verified',
      summary: 'Boosts an ally\'s damage for the rest of the turn.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Helping Hand move page']
    },
    'Heal Bell': {
      supportLevel: 'verified',
      summary: 'Cures major status conditions for the user side, including active allies and bench allies.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Heal Bell move page']
    },
    'Aromatherapy': {
      supportLevel: 'verified',
      summary: 'Cures major status conditions for the user side, including active allies and bench allies.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Aromatherapy move page']
    },
    'Jungle Healing': {
      supportLevel: 'verified',
      summary: 'Heals active allies by one quarter of max HP and cures major status conditions on the user side.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Jungle Healing move page']
    },
    'Snarl': {
      supportLevel: 'verified',
      summary: 'Deals damage and then lowers the target Special Attack by one stage on a successful hit.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Snarl move page']
    },
    'Toxic': {
      supportLevel: 'verified',
      summary: 'Badly poisons a valid target and initializes the toxic counter.',
      tests: ['tests/status_tests.js', 'tests/t9j17_tests.js'],
      sources: ['Bulbapedia: Toxic move page']
    },
    'Endure': {
      supportLevel: 'verified',
      summary: 'Lets the user survive the turn at 1 HP if damage would otherwise KO it.',
      tests: ['tests/t157_protect_family_tests.js'],
      sources: ['Bulbapedia: Endure move page']
    },
    'Defog': {
      supportLevel: 'verified',
      summary: 'Drops the target evasiveness and clears terrain plus screen effects on the target side.',
      tests: ['tests/t156_move_lock_tests.js'],
      sources: ['Bulbapedia: Defog move page']
    },
    'Muddy Water': {
      supportLevel: 'verified',
      summary: 'Deals spread damage and can lower the target accuracy.',
      tests: ['tests/t155_speed_control_secondary_tests.js'],
      sources: ['Bulbapedia: Muddy Water move page']
    },
    'Eruption': {
      supportLevel: 'verified',
      summary: 'Scales damage with the user current HP.',
      tests: ['tests/damage_pipeline_tests.js'],
      sources: ['Bulbapedia: Eruption move page']
    },
    'Shore Up': {
      supportLevel: 'verified',
      summary: 'Heals the user, with extra healing in sand.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Shore Up move page']
    },
    'Struggle': {
      supportLevel: 'verified',
      summary: 'Deals fixed damage and recoil when no legal move or forced fallback remains.',
      tests: ['tests/t156_move_lock_tests.js', 'tests/t9j17_tests.js'],
      sources: ['Bulbapedia: Struggle move page']
    },
    'Weather Ball': {
      supportLevel: 'verified',
      summary: 'Changes type from active weather and doubles base power outside clear weather.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Weather Ball move page']
    },
    'Electro Shot': {
      supportLevel: 'verified',
      summary: 'Raises the user Special Attack before damage and skips its charge turn in rain.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Electro Shot move page']
    },
    'Solar Beam': {
      supportLevel: 'verified',
      summary: 'Charges outside sun, fires immediately in sun, and has reduced power in rain, sand, or snow.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Solar Beam move page']
    },
    'Phantom Force': {
      supportLevel: 'verified',
      summary: 'Uses a semi-invulnerable charge turn, then hits on release and bypasses Protect.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Phantom Force move page']
    },
    'Rain Dance': {
      supportLevel: 'verified',
      summary: 'Sets rain for the field through the status-move path.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Rain Dance move page']
    },
    'Sunny Day': {
      supportLevel: 'verified',
      summary: 'Sets harsh sunlight for the field through the status-move path.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Sunny Day move page']
    },
    'Flare Blitz': {
      supportLevel: 'verified',
      summary: 'Deals contact damage and applies recoil after a successful hit.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Flare Blitz move page']
    },
    'Wave Crash': {
      supportLevel: 'verified',
      summary: 'Deals contact damage and applies recoil after a successful hit.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Wave Crash move page']
    },
    'Head Smash': {
      supportLevel: 'verified',
      summary: 'Deals damage and applies half-damage recoil after a successful hit.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Head Smash move page']
    },
    'Aqua Jet': {
      supportLevel: 'verified',
      summary: 'Uses positive priority so a slower user can act before a faster standard-priority target.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Aqua Jet move page']
    },
    'Extreme Speed': {
      supportLevel: 'verified',
      summary: 'Uses higher positive priority than standard priority and lower-priority attacks.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Extreme Speed move page']
    },
    'Vacuum Wave': {
      supportLevel: 'verified',
      summary: 'Uses positive priority through the special attacking path.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Vacuum Wave move page']
    },
    'Shadow Sneak': {
      supportLevel: 'verified',
      summary: 'Uses positive priority through the physical attacking path.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Shadow Sneak move page']
    },
    'Draco Meteor': {
      supportLevel: 'verified',
      summary: 'Deals damage and harshly lowers the user Special Attack after a successful hit.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Draco Meteor move page']
    },
    'Overheat': {
      supportLevel: 'verified',
      summary: 'Deals damage and harshly lowers the user Special Attack after a successful hit.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Overheat move page']
    },
    'Close Combat': {
      supportLevel: 'verified',
      summary: 'Deals damage and lowers the user Defense and Special Defense after a successful hit.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Close Combat move page']
    },
    'Headlong Rush': {
      supportLevel: 'verified',
      summary: 'Deals damage and lowers the user Defense and Special Defense after a successful hit.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Headlong Rush move page']
    },
    'Clanging Scales': {
      supportLevel: 'verified',
      summary: 'Deals spread damage and lowers the user Defense after a successful hit.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Clanging Scales move page']
    },
    'Lunge': {
      supportLevel: 'verified',
      summary: 'Deals damage and then lowers the target Attack by one stage on a successful hit.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Lunge move page']
    },
    'Noble Roar': {
      supportLevel: 'verified',
      summary: 'Lowers the target Attack and Special Attack by one stage each.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Noble Roar move page']
    },
    'Super Fang': {
      supportLevel: 'verified',
      summary: 'Halves the target current HP on a successful hit.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Super Fang move page']
    },
    'Pollen Puff': {
      supportLevel: 'verified',
      summary: 'Heals a damaged ally for half of its max HP or damages an opposing target normally.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Pollen Puff move page']
    },
    'Psychic Noise': {
      supportLevel: 'verified',
      summary: 'Deals damage and blocks the target from restoring HP for two turns.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Psychic Noise move page']
    },
    'Matcha Gotcha': {
      supportLevel: 'verified',
      summary: 'Deals damage, heals the user for half the damage dealt, and can burn the target.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Matcha Gotcha move page']
    },
    'Dire Claw': {
      supportLevel: 'verified',
      summary: 'Deals damage and can inflict poison, paralysis, or sleep on the target.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Dire Claw move page']
    },
    'Air Slash': {
      supportLevel: 'verified',
      summary: 'Deals damage and can flinch the target.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Air Slash move page']
    },
    'Dark Pulse': {
      supportLevel: 'verified',
      summary: 'Deals damage and can flinch the target.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Dark Pulse move page']
    },
    'Iron Head': {
      supportLevel: 'verified',
      summary: 'Deals damage and can flinch the target.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Iron Head move page']
    },
    'Knock Off': {
      supportLevel: 'verified',
      summary: 'Gets the held-item damage boost only against removable items, removes removable items after damage, leaves legal no-item targets alone, preserves corresponding Mega Stones, and respects Sticky Hold removal blocking.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Knock Off move page', 'Pokemon Showdown data/moves.ts knockoff']
    },
    'Rock Slide': {
      supportLevel: 'verified',
      summary: 'Deals spread damage and can flinch the target.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Rock Slide move page']
    },
    'Will-O-Wisp': {
      supportLevel: 'verified',
      summary: 'Inflicts burn on a valid target using the status pipeline.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Will-O-Wisp move page']
    },
    'Thunder Wave': {
      supportLevel: 'verified',
      summary: 'Inflicts paralysis on a valid target using the status pipeline.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Thunder Wave move page']
    },
    'Sleep Powder': {
      supportLevel: 'verified',
      summary: 'Inflicts sleep on a valid target using the status pipeline.',
      tests: ['tests/move_verification_registry_tests.js'],
      sources: ['Bulbapedia: Sleep Powder move page']
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
    var localType = typeof MOVE_TYPES !== 'undefined' && registryEntry(move, MOVE_TYPES) ? MOVE_TYPES[move] : '';
    var localCategory = typeof MOVE_CATEGORY !== 'undefined' && registryEntry(move, MOVE_CATEGORY) ? MOVE_CATEGORY[move] : '';
    var localBasePower = typeof MOVE_BP !== 'undefined' && registryEntry(move, MOVE_BP, true) ? MOVE_BP[move] : '';
    var localTarget = typeof MOVE_TARGETS !== 'undefined' && registryEntry(move, MOVE_TARGETS) ? MOVE_TARGETS[move] : '';
    var showdownBasePower = row && Object.prototype.hasOwnProperty.call(row, 'base_power') ? row.base_power : (row && row.basePower);
    var hasShowdownBasePower = !!(row && (Object.prototype.hasOwnProperty.call(row, 'base_power') || Object.prototype.hasOwnProperty.call(row, 'basePower')));
    var hasType = !!(row && row.type) || !!localType;
    var hasCategory = !!(row && row.category) || !!localCategory;
    var hasBasePower = hasShowdownBasePower || localBasePower !== '';
    var hasTarget = !!(row && row.target) || !!localTarget;
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
      notes = 'Runtime move metadata is incomplete: missing ' + missing.join(', ') + '.';
    } else if (verified) {
      notes = verification.summary || 'Move has explicit regression coverage in the local simulator test suite.';
    } else {
      notes = 'Move has Showdown/base runtime metadata, but no dedicated edge-case regression tag yet.';
    }
    return {
      moveName: move,
      canonicalMoveName: row && (row.move_name || row.name) ? (row.move_name || row.name) : move,
      moveId: toId(move),
      source: auditData && auditData.source ? auditData.source : 'unavailable',
      sourceVersion: auditData && auditData.sourceCommitOrVersion ? auditData.sourceCommitOrVersion : 'unavailable',
      showdown: row ? {
        type: row.type || '',
        category: row.category || '',
        basePower: showdownBasePower,
        target: row.target || '',
        flags: row.flags || ''
      } : null,
      local: {
        type: localType,
        category: localCategory,
        basePower: localBasePower,
        target: localTarget
      },
      effective: {
        type: row && row.type ? row.type : localType,
        category: row && row.category ? String(row.category).toLowerCase() : localCategory,
        basePower: hasShowdownBasePower ? showdownBasePower : localBasePower,
        target: row && row.target ? row.target : localTarget,
        source: row ? 'showdown' : (localType || localCategory || localBasePower !== '' || localTarget ? 'local' : 'missing')
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
