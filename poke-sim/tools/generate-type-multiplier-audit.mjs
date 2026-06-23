#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import {createRequire} from 'module';
import {fileURLToPath} from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportPath = path.join(ROOT, 'reports', 'type_multiplier_audit.md');
const require = createRequire(import.meta.url);

function loadVm(file, ctx) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  vm.runInContext(src, ctx, {filename: file});
}

const ctx = {
  console,
  module: {exports: {}},
  exports: {},
  require,
  globalThis: {},
  ChampionsSim: {}
};
ctx.globalThis = ctx;
vm.createContext(ctx);

loadVm('data.js', ctx);
loadVm('generated/pokemon_showdown_legal_data.js', ctx);
loadVm('move_support.js', ctx);

const teams = vm.runInContext('TEAMS', ctx);
const localTypes = vm.runInContext('POKEMON_TYPES_DB', ctx);
const showdownData = ctx.ChampionsSim.pokemonDataAudit || require(path.join(ROOT, 'generated', 'pokemon_showdown_legal_data.js'));
const moveSupport = ctx.ChampionsSim.moveSupport;

const TYPE_CHART = {
  Normal:   {Rock: 0.5, Ghost: 0, Steel: 0.5},
  Fire:     {Fire: 0.5, Water: 0.5, Rock: 0.5, Dragon: 0.5, Grass: 2, Ice: 2, Bug: 2, Steel: 2},
  Water:    {Water: 0.5, Grass: 0.5, Dragon: 0.5, Fire: 2, Ground: 2, Rock: 2},
  Electric: {Electric: 0.5, Grass: 0.5, Dragon: 0.5, Ground: 0, Flying: 2, Water: 2},
  Grass:    {Fire: 0.5, Grass: 0.5, Poison: 0.5, Flying: 0.5, Bug: 0.5, Dragon: 0.5, Steel: 0.5, Water: 2, Ground: 2, Rock: 2},
  Ice:      {Water: 0.5, Ice: 0.5, Fire: 0.5, Steel: 0.5, Grass: 2, Ground: 2, Flying: 2, Dragon: 2},
  Fighting: {Normal: 2, Ice: 2, Rock: 2, Dark: 2, Steel: 2, Poison: 0.5, Bug: 0.5, Psychic: 0.5, Flying: 0.5, Ghost: 0, Fairy: 0.5},
  Poison:   {Grass: 2, Fairy: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0},
  Ground:   {Electric: 2, Fire: 2, Poison: 2, Rock: 2, Steel: 2, Grass: 0.5, Bug: 0.5, Flying: 0},
  Flying:   {Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5, Electric: 0.5},
  Psychic:  {Fighting: 2, Poison: 2, Psychic: 0.5, Steel: 0.5, Dark: 0},
  Bug:      {Grass: 2, Psychic: 2, Dark: 2, Fire: 0.5, Fighting: 0.5, Flying: 0.5, Ghost: 0.5, Steel: 0.5, Fairy: 0.5},
  Rock:     {Fire: 2, Ice: 2, Flying: 2, Bug: 2, Fighting: 0.5, Ground: 0.5, Steel: 0.5},
  Ghost:    {Ghost: 2, Psychic: 2, Normal: 0, Dark: 0.5},
  Dragon:   {Dragon: 2, Steel: 0.5, Fairy: 0},
  Dark:     {Ghost: 2, Psychic: 2, Fighting: 0.5, Dark: 0.5, Fairy: 0.5},
  Steel:    {Ice: 2, Rock: 2, Fairy: 2, Fire: 0.5, Water: 0.5, Electric: 0.5, Steel: 0.5},
  Fairy:    {Fighting: 2, Dragon: 2, Dark: 2, Fire: 0.5, Poison: 0.5, Steel: 0.5}
};

const TYPE_ORDER = ['0', '0.25', '0.5', '1', '2', '4'];
const NORMAL_CONVERSION = {
  Aerilate: 'Flying',
  Dragonize: 'Dragon',
  Pixilate: 'Fairy',
  Refrigerate: 'Ice'
};

function clean(value) {
  return String(value == null ? '' : value).trim();
}

function toId(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function md(value) {
  return clean(value).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function fmtMult(value) {
  return String(Number(value.toFixed ? value.toFixed(2) : value)).replace(/\.00$/, '') + 'x';
}

function speciesRow(name) {
  const species = showdownData && showdownData.species ? showdownData.species : {};
  if (species[name]) return species[name];
  const id = toId(name);
  for (const row of Object.values(species)) {
    if (toId(row.speciesKey || row.displayName || row.id) === id) return row;
  }
  return null;
}

function resolveTypes(name) {
  const row = speciesRow(name);
  if (row && Array.isArray(row.types) && row.types.length) return row.types.slice();
  if (localTypes && Array.isArray(localTypes[name]) && localTypes[name].length) return localTypes[name].slice();
  return [];
}

function resolveMoveSupport(move) {
  return moveSupport.getLocalMoveSupport(move);
}

function moveTypeVariants(member, move, support) {
  const effective = support && support.effective ? support.effective : {};
  const category = clean(effective.category).toLowerCase();
  const bp = Number(effective.basePower || 0);
  let baseType = clean(effective.type);
  if (!baseType) return [];
  if (category === 'status' || bp <= 0) {
    return [{type: baseType, condition: 'status/no direct damage', damaging: false}];
  }
  const abilityType = NORMAL_CONVERSION[member.ability] && baseType === 'Normal'
    ? NORMAL_CONVERSION[member.ability]
    : null;
  const defaultType = abilityType || baseType;
  const defaultCondition = abilityType
    ? member.ability + ' converts Normal damage to ' + abilityType
    : 'standard';
  const variants = [{type: defaultType, condition: defaultCondition, damaging: true}];

  if (move === 'Weather Ball') {
    return [
      {type: defaultType, condition: defaultCondition + '; no weather', damaging: true},
      {type: 'Fire', condition: 'Weather Ball in sun', damaging: true},
      {type: 'Water', condition: 'Weather Ball in rain', damaging: true},
      {type: 'Rock', condition: 'Weather Ball in sand', damaging: true},
      {type: 'Ice', condition: 'Weather Ball in snow', damaging: true}
    ];
  }

  if (move === 'Terrain Pulse') {
    const types = resolveTypes(member.name);
    const grounded = types.indexOf('Flying') < 0 && member.ability !== 'Levitate';
    if (!grounded) {
      return [{type: defaultType, condition: defaultCondition + '; ungrounded user keeps default Terrain Pulse type', damaging: true}];
    }
    return [
      {type: defaultType, condition: defaultCondition + '; no terrain', damaging: true},
      {type: 'Electric', condition: 'Terrain Pulse in electric terrain', damaging: true},
      {type: 'Grass', condition: 'Terrain Pulse in grassy terrain', damaging: true},
      {type: 'Fairy', condition: 'Terrain Pulse in misty terrain', damaging: true},
      {type: 'Psychic', condition: 'Terrain Pulse in psychic terrain', damaging: true}
    ];
  }

  if (move === 'Tera Blast') {
    const teraType = clean(member.tera || member.teraType || member.tera_type);
    const teraVariants = [{
      type: defaultType,
      condition: defaultCondition + '; before Tera/no active Tera',
      damaging: true
    }];
    if (teraType && TYPE_CHART[teraType]) {
      teraVariants.push({
        type: teraType,
        condition: 'active Tera Blast uses declared ' + teraType + ' Tera type',
        damaging: true
      });
    } else if (teraType) {
      teraVariants[0].condition += '; declared ' + teraType + ' Tera type needs a type-chart rule before audit expansion';
    } else {
      teraVariants[0].condition += '; no declared Tera type in shipped row';
    }
    return teraVariants;
  }

  return variants;
}

function typeEffectiveness(move, moveType, targetTypes, attackerAbility) {
  const chart = TYPE_CHART[moveType] || {};
  let total = 1;
  for (const targetType of targetTypes) {
    let eff = Object.prototype.hasOwnProperty.call(chart, targetType) ? chart[targetType] : 1;
    if (move === 'Freeze-Dry' && targetType === 'Water') eff = 2;
    if (eff === 0 && targetType === 'Ghost' &&
        (attackerAbility === 'Scrappy' || attackerAbility === "Mind's Eye") &&
        (moveType === 'Normal' || moveType === 'Fighting')) {
      eff = 1;
    }
    total *= eff;
  }
  return total;
}

function buildTargetRoster() {
  const targets = new Map();
  for (const [teamKey, team] of Object.entries(teams || {})) {
    for (const member of team.members || []) {
      const types = resolveTypes(member.name);
      const tera = member.tera || member.teraType || member.tera_type || '';
      const key = [member.name, types.join('/'), member.ability || '', tera].join('|');
      if (!targets.has(key)) {
        targets.set(key, {
          name: member.name,
          types,
          tera,
          ability: member.ability || '',
          teams: new Set()
        });
      }
      targets.get(key).teams.add(teamKey);
    }
  }
  return [...targets.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function buildAttackRows() {
  const rows = new Map();
  for (const [teamKey, team] of Object.entries(teams || {})) {
    for (const member of team.members || []) {
      for (const move of member.moves || []) {
        const tera = member.tera || member.teraType || member.tera_type || '';
        const key = [member.name, member.ability || '', tera, move].join('|');
        if (!rows.has(key)) {
          rows.set(key, {
            pokemon: member.name,
            ability: member.ability || '',
            item: member.item || '',
            tera,
            move,
            teams: new Set()
          });
        }
        rows.get(key).teams.add(teamKey);
      }
    }
  }
  return [...rows.values()].sort((a, b) => (a.move + a.pokemon).localeCompare(b.move + b.pokemon));
}

function bucketSummary(row, variant, targets, useTera) {
  if (!variant.damaging) return 'status/no direct damage';
  const buckets = new Map(TYPE_ORDER.map((key) => [key, []]));
  for (const target of targets) {
    if (useTera && !target.tera) continue;
    const targetTypes = useTera ? [target.tera] : target.types;
    if (!targetTypes.length) continue;
    const mult = typeEffectiveness(row.move, variant.type, targetTypes, row.ability);
    const key = String(mult);
    if (!buckets.has(key)) buckets.set(key, []);
    const label = target.name + ' [' + targetTypes.join('/') + ']';
    buckets.get(key).push(label);
  }
  const parts = [];
  for (const key of TYPE_ORDER) {
    const list = buckets.get(key) || [];
    if (!list.length) continue;
    const shown = [...new Set(list)].slice(0, 8).join(', ');
    const more = list.length > 8 ? ' +' + (list.length - 8) + ' more' : '';
    parts.push(fmtMult(Number(key)) + ' (' + list.length + '): ' + shown + more);
  }
  return parts.length ? parts.join('; ') : 'no typed targets';
}

function variantSummary(row, variants, targets, useTera) {
  return variants.map((variant) => {
    const label = variant.type + ' - ' + variant.condition;
    return label + ' => ' + bucketSummary(row, variant, targets, useTera);
  }).join(' || ');
}

function notableRows(rows, targets) {
  const out = [];
  for (const row of rows) {
    const support = resolveMoveSupport(row.move);
    const variants = moveTypeVariants(row, row.move, support);
    const damaging = variants.some((variant) => variant.damaging);
    if (!damaging) continue;
    const max = Math.max(...variants.flatMap((variant) => targets.map((target) => {
      if (!target.types.length) return 1;
      return typeEffectiveness(row.move, variant.type, target.types, row.ability);
    })));
    const hasImmune = variants.some((variant) => targets.some((target) => {
      if (!target.types.length) return false;
      return typeEffectiveness(row.move, variant.type, target.types, row.ability) === 0;
    }));
    if (max >= 4 || hasImmune || row.move === 'Tera Blast') {
      out.push({row, max, hasImmune});
    }
  }
  return out.slice(0, 40);
}

const targets = buildTargetRoster();
const attackRows = buildAttackRows();
const source = showdownData.source || 'unavailable';
const sourceVersion = showdownData.sourceCommitOrVersion || 'unavailable';

const lines = [];
lines.push('# Type Multiplier Audit');
lines.push('');
lines.push('- Generated at: ' + new Date().toISOString());
lines.push('- Source: ' + source);
lines.push('- Source version: ' + sourceVersion);
lines.push('- Shipped move-user rows audited: ' + attackRows.length);
lines.push('- Unique target profiles audited: ' + targets.length);
lines.push('');
lines.push('This report answers: for each shipped team move, what move type is used for type-effectiveness, which roster typings it hits for 4x/2x/1x/0.5x/0.25x/0x, and how declared defensive Tera types would change that bucket.');
lines.push('');
lines.push('Important scope: this is a type-effectiveness audit, not the full final damage formula. The engine also applies STAB/Tera STAB, spread 0.75x, weather, terrain, screens, critical hits, burn/frostbite, ability modifiers, item modifiers, and Protect-family modifiers in the battle damage path. Those final-damage cases stay covered by the Showdown damage oracle and move-registry tests.');
lines.push('');
lines.push('## Fixed Type-Chart Examples');
lines.push('');
lines.push('| Example | Multiplier | Why |');
lines.push('| --- | ---: | --- |');
lines.push('| Electric move into Pelipper [Water/Flying] | 4x | Electric is 2x into Water and 2x into Flying. |');
lines.push('| Ice move into Garchomp [Dragon/Ground] | 4x | Ice is 2x into Dragon and 2x into Ground. |');
lines.push('| Ground move into Flying typing | 0x | Ground has no effect into Flying unless a separate mechanic changes immunity. |');
lines.push('| Fairy move into Dragon/Dark typing | 4x | Fairy is 2x into Dragon and 2x into Dark. |');
lines.push('| Fire move into Water/Dragon typing | 0.25x | Fire is 0.5x into Water and 0.5x into Dragon. |');
lines.push('');
lines.push('## Dynamic Move Type Rules');
lines.push('');
lines.push('| Rule | Runtime condition | Type cases | Guardrail note |');
lines.push('| --- | --- | --- | --- |');
lines.push('| Weather Ball | Field weather changes the move type. | Normal with no weather; Fire in sun; Water in rain; Rock in sand; Ice in snow. | Report rows expand shipped Weather Ball users into each weather case. |');
lines.push('| Terrain Pulse | Grounded user plus active terrain changes the move type. | Normal with no terrain; Terrain Pulse in electric terrain = Electric; grassy = Grass; misty = Fairy; psychic = Psychic. | This rule is documented even when no current shipped team uses Terrain Pulse, so future roster changes do not hide the mechanic. |');
lines.push('| Normal-type conversion abilities | Aerilate, Dragonize, Pixilate, or Refrigerate on a Normal damaging move changes the move type before type-effectiveness. | Aerilate converts Normal damage to Flying; Dragonize converts Normal damage to Dragon; Pixilate converts Normal damage to Fairy; Refrigerate converts Normal damage to Ice. | Rows include the converted type and still leave final BP modifiers to the damage engine tests. |');
lines.push('| Tera Blast | Active Tera changes the move type; no active Tera keeps Normal. | Before Tera/no active Tera = Normal; active Tera Blast uses the declared Tera type for that team member. | Category is chosen in the damage engine from the higher boosted Attack vs Special Attack stat and is covered by the Showdown damage oracle. |');
lines.push('');
lines.push('## High-Risk Watchlist');
lines.push('');
lines.push('| Pokemon | Move | Type cases | Why it matters |');
lines.push('| --- | --- | --- | --- |');
for (const item of notableRows(attackRows, targets)) {
  const row = item.row;
  const support = resolveMoveSupport(row.move);
  const variants = moveTypeVariants(row, row.move, support);
  const typeCases = variants.map((variant) => variant.type + ' (' + variant.condition + ')').join('; ');
  const why = [
    item.max >= 4 ? 'has 4x roster targets' : '',
    item.hasImmune ? 'has 0x roster targets' : '',
    row.move === 'Tera Blast' ? 'active Tera type expansion covered by engine/oracle tests' : ''
  ].filter(Boolean).join('; ');
  lines.push('| ' + md(row.pokemon) + ' | ' + md(row.move) + ' | ' + md(typeCases) + ' | ' + md(why) + ' |');
}
lines.push('');
lines.push('## Per-Move Type Buckets');
lines.push('');
lines.push('| Teams | Pokemon | Ability | Move | Move metadata | Base defender type buckets | Declared Tera defender buckets |');
lines.push('| --- | --- | --- | --- | --- | --- | --- |');
for (const row of attackRows) {
  const support = resolveMoveSupport(row.move);
  const effective = support && support.effective ? support.effective : {};
  const variants = moveTypeVariants(row, row.move, support);
  const metadata = [
    'type=' + (effective.type || ''),
    'category=' + (effective.category || ''),
    'bp=' + (effective.basePower ?? ''),
    'target=' + (effective.target || ''),
    'tera=' + (row.tera || ''),
    'source=' + (effective.source || '')
  ].join('; ');
  lines.push('| ' +
    md([...row.teams].sort().join(', ')) + ' | ' +
    md(row.pokemon) + ' | ' +
    md(row.ability || '-') + ' | ' +
    md(row.move) + ' | ' +
    md(metadata) + ' | ' +
    md(variantSummary(row, variants, targets, false)) + ' | ' +
    md(variantSummary(row, variants, targets, true)) + ' |');
}
lines.push('');
lines.push('## Regeneration');
lines.push('');
lines.push('Run `node tools/generate-type-multiplier-audit.mjs` from `poke-sim/` after changing shipped teams, generated Showdown data, move typing, Tera typing, or the type chart.');
lines.push('');

fs.mkdirSync(path.dirname(reportPath), {recursive: true});
fs.writeFileSync(reportPath, lines.join('\n') + '\n', 'utf8');
console.log(`Wrote ${reportPath}`);
