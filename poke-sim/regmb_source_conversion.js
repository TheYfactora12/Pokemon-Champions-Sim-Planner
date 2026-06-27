// regmb_source_conversion.js
// Source conversion ledger for Pokemon Champions Regulation Set M-B.
// This file is source-review data, not runtime legality data.

var CHAMPIONS_REGMB_SOURCE_CONVERSION = {
  rulesetId: 'champions_reg_m_b_doubles_bo3_source_review',
  rulesetLabel: 'Champions Reg M-B Source Review (Jun 17 - Sep 2, 2026)',
  checkedAtUtc: '2026-06-27T23:20:00Z',
  implementationStatus: 'source_review_not_runtime_promoted',
  runtimePromotionAllowed: false,
  sourceFacts: [
    {
      claim: 'Regulation Set M-B runs from June 17 to September 2, 2026.',
      sourceTier: 1,
      sourceName: 'Victory Road Champion regulations',
      sourceUrl: 'https://victoryroad.pro/champions-regulations/',
      status: 'verified'
    },
    {
      claim: 'Regulation Set M-B is the in-game Ranked Battles format and is used for VGC events on the same dates, including the 2026 World Championships.',
      sourceTier: 1,
      sourceName: 'Victory Road Champion regulations',
      sourceUrl: 'https://victoryroad.pro/champions-regulations/',
      status: 'verified'
    },
    {
      claim: 'Mega Evolutions are allowed in Regulation Set M-B.',
      sourceTier: 1,
      sourceName: 'Victory Road Champion regulations',
      sourceUrl: 'https://victoryroad.pro/champions-regulations/',
      status: 'verified'
    },
    {
      claim: 'All Regulation Set M-A Mega Evolutions remain allowed and Regulation Set M-B adds 16 new Mega Evolutions.',
      sourceTier: 1,
      sourceName: 'Victory Road Champion regulations',
      sourceUrl: 'https://victoryroad.pro/champions-regulations/',
      status: 'verified'
    },
    {
      claim: 'Regulation Set M-B adds 22 Pokemon with respect to Regulation Set M-A.',
      sourceTier: 1,
      sourceName: 'Victory Road Champion regulations',
      sourceUrl: 'https://victoryroad.pro/wp-content/uploads/2026/06/NewPokemonRMB.png',
      status: 'verified_text_image'
    }
  ],
  sourceImages: [
    {
      kind: 'allowed_pokemon_sheet',
      url: 'https://victoryroad.pro/wp-content/uploads/2026/06/Reg-M-B-Pokemon1.jpg',
      status: 'needs_explicit_species_form_extraction',
      runtimePromotable: false,
      blocker: 'Image sheet must be converted into reviewed species/form rows before legality can use it.'
    },
    {
      kind: 'allowed_pokemon_sheet',
      url: 'https://victoryroad.pro/wp-content/uploads/2026/06/Reg-M-B-Pokemon2.jpg',
      status: 'needs_explicit_species_form_extraction',
      runtimePromotable: false,
      blocker: 'Image sheet must be converted into reviewed species/form rows before legality can use it.'
    },
    {
      kind: 'new_pokemon_additions',
      url: 'https://victoryroad.pro/wp-content/uploads/2026/06/NewPokemonRMB.png',
      status: 'text_rows_extracted_review_only',
      runtimePromotable: false,
      blocker: 'Addition names are extracted, but full Reg M-B runtime promotion still needs the complete allowlist rows, legality fixtures, and per-form implementation checks.'
    },
    {
      kind: 'new_mega_names',
      url: 'https://victoryroad.pro/wp-content/uploads/2026/06/NewMegasRMB.png',
      status: 'names_verified_only',
      runtimePromotable: false,
      blocker: 'Mega names are verified, but stone names, stats, abilities, typing, sprite handling, and fixtures are not fully promoted.'
    }
  ],
  requiredPromotionFields: [
    'baseSpecies',
    'megaForm',
    'megaStone',
    'megaBaseStats',
    'types',
    'ability',
    'spriteFallback',
    'itemSourceUrl',
    'statsSourceUrl',
    'abilitySourceUrl',
    'typeSourceUrl',
    'learnsetPolicy',
    'positiveFixture',
    'negativeFixture'
  ],
  newMegaRows: [
    { baseSpecies: 'Raichu', megaForm: 'Raichu-Mega-X', sourceName: 'Mega Raichu X' },
    { baseSpecies: 'Raichu', megaForm: 'Raichu-Mega-Y', sourceName: 'Mega Raichu Y' },
    { baseSpecies: 'Sceptile', megaForm: 'Sceptile-Mega', sourceName: 'Mega Sceptile' },
    { baseSpecies: 'Blaziken', megaForm: 'Blaziken-Mega', sourceName: 'Mega Blaziken' },
    { baseSpecies: 'Swampert', megaForm: 'Swampert-Mega', sourceName: 'Mega Swampert' },
    { baseSpecies: 'Mawile', megaForm: 'Mawile-Mega', sourceName: 'Mega Mawile' },
    { baseSpecies: 'Metagross', megaForm: 'Metagross-Mega', sourceName: 'Mega Metagross' },
    { baseSpecies: 'Staraptor', megaForm: 'Staraptor-Mega', sourceName: 'Mega Staraptor' },
    { baseSpecies: 'Scolipede', megaForm: 'Scolipede-Mega', sourceName: 'Mega Scolipede' },
    { baseSpecies: 'Scrafty', megaForm: 'Scrafty-Mega', sourceName: 'Mega Scrafty' },
    { baseSpecies: 'Eelektross', megaForm: 'Eelektross-Mega', sourceName: 'Mega Eelektross' },
    { baseSpecies: 'Pyroar', megaForm: 'Pyroar-Mega', sourceName: 'Mega Pyroar' },
    { baseSpecies: 'Malamar', megaForm: 'Malamar-Mega', sourceName: 'Mega Malamar' },
    { baseSpecies: 'Barbaracle', megaForm: 'Barbaracle-Mega', sourceName: 'Mega Barbaracle' },
    { baseSpecies: 'Dragalge', megaForm: 'Dragalge-Mega', sourceName: 'Mega Dragalge' },
    { baseSpecies: 'Falinks', megaForm: 'Falinks-Mega', sourceName: 'Mega Falinks' }
  ].map(function(row) {
    row.rulesetId = 'champions_reg_m_b_doubles_bo3_source_review';
    row.sourceUrl = 'https://victoryroad.pro/wp-content/uploads/2026/06/NewMegasRMB.png';
    row.reviewStatus = 'name_verified_fields_blocked';
    row.runtimePromotable = false;
    row.blockers = [
      'megaStone unconfirmed',
      'megaBaseStats unconfirmed',
      'types unconfirmed for Champions form',
      'ability unconfirmed for Champions form',
      'spriteFallback unconfirmed',
      'positive and negative fixtures missing'
    ];
    return row;
  }),
  additionRows: [
    'Vileplume',
    'Qwilfish',
    'Sceptile',
    'Blaziken',
    'Swampert',
    'Mawile',
    'Metagross',
    'Staraptor',
    'Musharna',
    'Scolipede',
    'Scrafty',
    'Eelektross',
    'Pyroar',
    'Malamar',
    'Barbaracle',
    'Dragalge',
    'Grimmsnarl',
    'Falinks',
    'Overqwil',
    'Houndstone',
    'Annihilape',
    'Gholdengo'
  ].map(function(species) {
    return {
      species: species,
      rulesetId: 'champions_reg_m_b_doubles_bo3_source_review',
      sourceUrl: 'https://victoryroad.pro/wp-content/uploads/2026/06/NewPokemonRMB.png',
      sourceName: 'Victory Road Reg M-B additions image',
      reviewStatus: 'addition_name_verified_review_only',
      runtimePromotable: false,
      learningEligible: false,
      poisoningGuard: 'review_only_do_not_train_or_rank',
      blockers: [
        'full Reg M-B allowlist row not yet converted',
        'accepted and rejected Reg M-B legality fixtures missing',
        'species/form implementation audit pending',
        'normal selector promotion blocked'
      ]
    };
  }),
  coverageSections: [
    {
      sectionId: 'regmb_review_raichu_starters',
      label: 'Reg M-B review: Raichu plus starter Megas',
      rulesetId: 'champions_reg_m_b_doubles_bo3_source_review',
      status: 'source_review_fixture',
      runtimePromotable: false,
      learningEligible: false,
      poisoningGuard: 'review_only_do_not_train_or_rank',
      selectorPolicy: 'hidden_from_legal_sim',
      tags: ['reg-m-b', 'source-review', 'new-mega', 'coverage-fixture'],
      coveredMegaForms: ['Raichu-Mega-X', 'Raichu-Mega-Y', 'Sceptile-Mega', 'Blaziken-Mega', 'Swampert-Mega']
    },
    {
      sectionId: 'regmb_review_steel_physical_pressure',
      label: 'Reg M-B review: Steel and physical pressure Megas',
      rulesetId: 'champions_reg_m_b_doubles_bo3_source_review',
      status: 'source_review_fixture',
      runtimePromotable: false,
      learningEligible: false,
      poisoningGuard: 'review_only_do_not_train_or_rank',
      selectorPolicy: 'hidden_from_legal_sim',
      tags: ['reg-m-b', 'source-review', 'new-mega', 'coverage-fixture'],
      coveredMegaForms: ['Mawile-Mega', 'Metagross-Mega', 'Staraptor-Mega', 'Scolipede-Mega']
    },
    {
      sectionId: 'regmb_review_unusual_matchup_coverage',
      label: 'Reg M-B review: unusual matchup Megas',
      rulesetId: 'champions_reg_m_b_doubles_bo3_source_review',
      status: 'source_review_fixture',
      runtimePromotable: false,
      learningEligible: false,
      poisoningGuard: 'review_only_do_not_train_or_rank',
      selectorPolicy: 'hidden_from_legal_sim',
      tags: ['reg-m-b', 'source-review', 'new-mega', 'coverage-fixture'],
      coveredMegaForms: ['Scrafty-Mega', 'Eelektross-Mega', 'Pyroar-Mega', 'Malamar-Mega']
    },
    {
      sectionId: 'regmb_review_poison_formation_pressure',
      label: 'Reg M-B review: poison and formation-pressure Megas',
      rulesetId: 'champions_reg_m_b_doubles_bo3_source_review',
      status: 'source_review_fixture',
      runtimePromotable: false,
      learningEligible: false,
      poisoningGuard: 'review_only_do_not_train_or_rank',
      selectorPolicy: 'hidden_from_legal_sim',
      tags: ['reg-m-b', 'source-review', 'new-mega', 'coverage-fixture'],
      coveredMegaForms: ['Barbaracle-Mega', 'Dragalge-Mega', 'Falinks-Mega']
    }
  ],
  promotionGates: [
    'Allowed Pokemon image sheets converted into explicit reviewed species/form rows.',
    '22 Reg M-B addition rows reviewed against NewPokemonRMB.png.',
    'Every new Mega row has stone, stats, typing, ability, sprite, and fixture evidence.',
    'Reg M-B accepted and rejected legality fixtures pass.',
    'Reg M-A historical fixtures remain stable.',
    'Bundle/cache/version guards are bumped.',
    'Browser QA artifact confirms the promoted build.'
  ]
};

if (typeof window !== 'undefined') {
  window.CHAMPIONS_REGMB_SOURCE_CONVERSION = CHAMPIONS_REGMB_SOURCE_CONVERSION;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CHAMPIONS_REGMB_SOURCE_CONVERSION: CHAMPIONS_REGMB_SOURCE_CONVERSION
  };
}
