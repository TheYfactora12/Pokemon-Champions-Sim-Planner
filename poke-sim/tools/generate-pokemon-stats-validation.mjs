#!/usr/bin/env node
// Generates an app-vs-Pokemon-Showdown stats validation CSV.
// Input is a checked-out/downloaded smogon/pokemon-showdown data/pokedex.ts.

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const POKE_SIM_ROOT = path.resolve(__dirname, '..');

function arg(name, fallback = '') {
  const idx = process.argv.indexOf(name);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

const pokedexPath = arg('--pokedex');
const sourceCommit = arg('--source-commit', 'unknown');
const sourceDate = arg('--source-date', new Date().toISOString().slice(0, 10));
const outputPath = arg('--out', path.join(POKE_SIM_ROOT, 'reports', 'pokemon_stats_validation.csv'));

if (!pokedexPath) {
  console.error('Usage: node tools/generate-pokemon-stats-validation.mjs --pokedex /path/to/pokedex.ts --source-commit <sha> [--out reports/pokemon_stats_validation.csv]');
  process.exit(2);
}

function toID(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function csv(value) {
  const raw = String(value == null ? '' : value);
  return /[",\n]/.test(raw) ? '"' + raw.replace(/"/g, '""') + '"' : raw;
}

function parseArrayLiteral(block, field) {
  const re = new RegExp(field + ':\\s*\\[([^\\]]*)\\]');
  const m = block.match(re);
  if (!m) return [];
  return m[1].split(',').map((part) => part.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
}

function parseStringField(block, field) {
  const re = new RegExp(`${field}:\\s*["']([^"']+)["']`);
  const m = block.match(re);
  return m ? m[1] : '';
}

function parseNumberField(block, field) {
  const re = new RegExp(field + ':\\s*(-?\\d+)');
  const m = block.match(re);
  return m ? parseInt(m[1], 10) : '';
}

function parseStats(block) {
  const m = block.match(/baseStats:\s*{\s*hp:\s*(\d+),\s*atk:\s*(\d+),\s*def:\s*(\d+),\s*spa:\s*(\d+),\s*spd:\s*(\d+),\s*spe:\s*(\d+)\s*}/);
  if (!m) return null;
  return {
    hp: parseInt(m[1], 10),
    atk: parseInt(m[2], 10),
    def: parseInt(m[3], 10),
    spa: parseInt(m[4], 10),
    spd: parseInt(m[5], 10),
    spe: parseInt(m[6], 10)
  };
}

function parseAbilities(block) {
  const m = block.match(/abilities:\s*{([^}]*)}/);
  const out = { 0: '', 1: '', H: '' };
  if (!m) return out;
  m[1].split(',').forEach((piece) => {
    const kv = piece.match(/\s*([01H]):\s*["']([^"']+)["']/);
    if (kv) out[kv[1]] = kv[2];
  });
  return out;
}

function findEntryBlocks(source) {
  const entries = {};
  const re = /\n\s*([a-z0-9]+):\s*{/g;
  let match;
  while ((match = re.exec(source))) {
    const key = match[1];
    let i = match.index + match[0].lastIndexOf('{');
    let depth = 0;
    let end = i;
    for (; end < source.length; end++) {
      const c = source[end];
      if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) {
          end++;
          break;
        }
      }
    }
    entries[key] = source.slice(i, end);
    re.lastIndex = end;
  }
  return entries;
}

function parsePokedex(source) {
  const rawEntries = findEntryBlocks(source);
  const byId = {};
  Object.keys(rawEntries).forEach((key) => {
    const block = rawEntries[key];
    const stats = parseStats(block);
    const abilities = parseAbilities(block);
    const row = {
      id: key,
      dexNum: parseNumberField(block, 'num'),
      name: parseStringField(block, 'name'),
      baseSpecies: parseStringField(block, 'baseSpecies'),
      forme: parseStringField(block, 'forme'),
      genderLock: parseStringField(block, 'gender') || parseStringField(block, 'baseForme'),
      types: parseArrayLiteral(block, 'types'),
      stats,
      abilities,
      requiredItem: parseStringField(block, 'requiredItem')
    };
    if (row.name) byId[toID(row.name)] = row;
    byId[key] = row;
  });
  return byId;
}

function loadAppData() {
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(
    fs.readFileSync(path.join(POKE_SIM_ROOT, 'data.js'), 'utf8') +
      '\nthis.BASE_STATS = BASE_STATS; this.POKEMON_TYPES_DB = POKEMON_TYPES_DB; this.DEX_NUM_MAP = DEX_NUM_MAP; this.CHAMPIONS_MEGAS = CHAMPIONS_MEGAS;',
    ctx
  );
  return ctx;
}

function appToShowdownId(species) {
  const id = toID(species);
  const aliases = {
    indeedeem: 'indeedee',
    meowsticm: 'meowstic',
    basculegionm: 'basculegion',
    oinkolognem: 'oinkologne'
  };
  return aliases[id] || id;
}

function statsMatch(appStats, sourceStats) {
  if (!appStats || !sourceStats) return '';
  return ['hp', 'atk', 'def', 'spa', 'spd', 'spe'].every((k) => Number(appStats[k]) === Number(sourceStats[k])) ? 'true' : 'false';
}

function parserRoundtripOk(replayCoach, species) {
  if (!replayCoach || typeof replayCoach.normalizeReplayPokemonDetails !== 'function') return '';
  const parsed = replayCoach.normalizeReplayPokemonDetails(species + ', L50, F');
  return parsed.species === species ? 'true' : 'false';
}

const showdown = parsePokedex(fs.readFileSync(pokedexPath, 'utf8'));
const app = loadAppData();
const replayCoach = await import(pathToFileUrl(path.join(POKE_SIM_ROOT, 'replay_coach.js')));

function pathToFileUrl(p) {
  return 'file://' + path.resolve(p).replace(/\\/g, '/');
}

const supported = new Set([
  ...Object.keys(app.POKEMON_TYPES_DB || {}),
  ...Object.keys(app.BASE_STATS || {}),
  ...Object.keys(app.DEX_NUM_MAP || {}),
  ...Object.keys(app.CHAMPIONS_MEGAS || {})
]);

[
  'Kangaskhan',
  'Kangaskhan-Mega',
  'Nidoran-F',
  'Nidoran-M',
  'Indeedee-F',
  'Indeedee-M',
  'Meowstic-F',
  'Meowstic-M',
  'Charizard-Mega-X',
  'Charizard-Mega-Y'
].forEach((name) => supported.add(name));

const columns = [
  'source',
  'source_commit_or_version',
  'dex_num',
  'species_key',
  'display_name',
  'base_species',
  'forme',
  'gender_lock',
  'hp',
  'atk',
  'def',
  'spa',
  'spd',
  'spe',
  'bst',
  'types',
  'ability_0',
  'ability_1',
  'hidden_ability',
  'required_item',
  'app_stats_match_source',
  'parser_roundtrip_ok',
  'notes'
];

const rows = Array.from(supported).sort((a, b) => a.localeCompare(b)).map((species) => {
  const source = showdown[appToShowdownId(species)];
  const appStats = app.BASE_STATS && app.BASE_STATS[species] ? app.BASE_STATS[species] : null;
  const stats = source && source.stats ? source.stats : null;
  const types = source && source.types && source.types.length ? source.types : ((app.POKEMON_TYPES_DB && app.POKEMON_TYPES_DB[species]) || (appStats && appStats.types) || []);
  const bst = stats ? stats.hp + stats.atk + stats.def + stats.spa + stats.spd + stats.spe : '';
  const notes = [];
  if (!source) notes.push('no_showdown_match_for_app_key');
  if (!appStats) notes.push('no_app_base_stats_entry');
  return {
    source: 'smogon/pokemon-showdown data/pokedex.ts',
    source_commit_or_version: sourceCommit + ' (' + sourceDate + ')',
    dex_num: source ? source.dexNum : (app.DEX_NUM_MAP && app.DEX_NUM_MAP[species]) || '',
    species_key: species,
    display_name: source ? source.name : species,
    base_species: source ? (source.baseSpecies || source.name) : '',
    forme: source ? source.forme : '',
    gender_lock: source ? source.genderLock : '',
    hp: stats ? stats.hp : '',
    atk: stats ? stats.atk : '',
    def: stats ? stats.def : '',
    spa: stats ? stats.spa : '',
    spd: stats ? stats.spd : '',
    spe: stats ? stats.spe : '',
    bst,
    types: types.join('|'),
    ability_0: source ? source.abilities[0] : '',
    ability_1: source ? source.abilities[1] : '',
    hidden_ability: source ? source.abilities.H : '',
    required_item: source ? source.requiredItem : '',
    app_stats_match_source: statsMatch(appStats, stats),
    parser_roundtrip_ok: parserRoundtripOk(replayCoach.default || replayCoach, species),
    notes: notes.join('; ')
  };
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(
  outputPath,
  columns.join(',') + '\n' + rows.map((row) => columns.map((col) => csv(row[col])).join(',')).join('\n') + '\n',
  'utf8'
);
console.log('Wrote ' + rows.length + ' rows -> ' + outputPath);
