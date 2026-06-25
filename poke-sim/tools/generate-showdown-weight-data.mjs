#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function arg(name, fallback) {
  const idx = process.argv.indexOf('--' + name);
  return idx >= 0 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback;
}

const pokedexPath = arg('pokedex', '');
const sourceCommit = arg('source-commit', 'unknown');
const outPath = arg('out', path.join(ROOT, 'generated', 'pokemon_showdown_species_weights.js'));

if (!pokedexPath) {
  console.error('Usage: node tools/generate-showdown-weight-data.mjs --pokedex /path/to/pokedex.ts --source-commit <sha> [--out generated/pokemon_showdown_species_weights.js]');
  process.exit(1);
}

function toId(value) {
  return String(value == null ? '' : value).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function extractTopLevelEntries(src) {
  const start = src.indexOf('export const Pokedex');
  if (start < 0) throw new Error('Could not find Pokedex export');
  const open = src.indexOf('{', start);
  if (open < 0) throw new Error('Could not find Pokedex opening brace');
  const entries = {};
  let i = open + 1;
  while (i < src.length) {
    while (i < src.length && /[\s,]/.test(src[i])) i += 1;
    if (src[i] === '}') break;
    const keyMatch = src.slice(i).match(/^([A-Za-z0-9_]+)\s*:/);
    if (!keyMatch) {
      i += 1;
      continue;
    }
    const key = keyMatch[1];
    i += keyMatch[0].length;
    while (i < src.length && /\s/.test(src[i])) i += 1;
    if (src[i] !== '{') throw new Error('Expected object for ' + key);
    const objStart = i;
    let depth = 0;
    let inString = false;
    let quote = '';
    for (; i < src.length; i += 1) {
      const ch = src[i];
      const prev = src[i - 1];
      if (inString) {
        if (ch === quote && prev !== '\\') {
          inString = false;
          quote = '';
        }
        continue;
      }
      if (ch === '\'' || ch === '"' || ch === '`') {
        inString = true;
        quote = ch;
        continue;
      }
      if (ch === '{') depth += 1;
      if (ch === '}') {
        depth -= 1;
        if (depth === 0) {
          entries[key] = src.slice(objStart, i + 1);
          i += 1;
          break;
        }
      }
    }
  }
  return entries;
}

function field(block, name) {
  const re = new RegExp(name + "\\s*:\\s*(['\\\"])(.*?)\\1");
  const match = block.match(re);
  return match ? match[2] : '';
}

function numericField(block, name) {
  const re = new RegExp(name + '\\s*:\\s*([0-9]+(?:\\.[0-9]+)?)');
  const match = block.match(re);
  return match ? Number(match[1]) : null;
}

const raw = fs.readFileSync(pokedexPath, 'utf8');
const entries = extractTopLevelEntries(raw);
const rowMap = {};

for (const [id, block] of Object.entries(entries)) {
  rowMap[id] = {
    id,
    name: field(block, 'name') || id,
    baseSpecies: field(block, 'baseSpecies'),
    changesFrom: field(block, 'changesFrom'),
    battleOnly: field(block, 'battleOnly'),
    weightkg: numericField(block, 'weightkg')
  };
}

function resolveWeight(id, seen = new Set()) {
  const key = toId(id);
  const row = rowMap[key];
  if (!row || seen.has(key)) return null;
  seen.add(key);
  if (Number.isFinite(row.weightkg) && row.weightkg > 0) return row.weightkg;
  return resolveWeight(row.changesFrom, seen) ||
    resolveWeight(row.baseSpecies, seen) ||
    resolveWeight(row.battleOnly, seen);
}

const weights = {};
for (const id of Object.keys(rowMap).sort()) {
  const weight = resolveWeight(id);
  if (Number.isFinite(weight) && weight > 0) weights[id] = weight;
}

const lines = [];
lines.push('(function(root){');
lines.push('  var data = ' + JSON.stringify({
  source: 'smogon/pokemon-showdown data/pokedex.ts',
  sourceRepository: 'https://github.com/smogon/pokemon-showdown',
  sourceCommitOrVersion: sourceCommit,
  generatedAt: new Date().toISOString(),
  species: weights
}) + ';');
lines.push('  root.ChampionsSim = root.ChampionsSim || {};');
lines.push('  root.ChampionsSim.pokemonShowdownWeights = data;');
lines.push('  if (typeof module !== "undefined" && module.exports) module.exports = data;');
lines.push('})(typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this));');

fs.mkdirSync(path.dirname(outPath), {recursive: true});
fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
console.log('Wrote ' + outPath + ' with ' + Object.keys(weights).length + ' species weights');
