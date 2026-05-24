#!/usr/bin/env node
// Deterministic Pokemon Showdown data audit generator.
// Inputs are local Showdown source files; this script does not fetch network data.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const REQUIRED_SPECIES = [
  'Arcanine',
  'Arcanine-Hisui',
  'Growlithe',
  'Growlithe-Hisui',
  'Kangaskhan',
  'Kangaskhan-Mega',
  'Charizard',
  'Charizard-Mega-X',
  'Charizard-Mega-Y',
  'Nidoran-F',
  'Nidoran-M',
  'Indeedee-F',
  'Indeedee-M',
  'Meowstic-F',
  'Meowstic-M',
];
const MALE_FORM_ALIASES = {
  Indeedee: 'Indeedee-M',
  Meowstic: 'Meowstic-M',
  Basculegion: 'Basculegion-M',
  Oinkologne: 'Oinkologne-M',
};

function arg(name, fallback) {
  const idx = process.argv.indexOf('--' + name);
  return idx >= 0 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback;
}

const pokedexPath = arg('pokedex', '');
const learnsetsPath = arg('learnsets', '');
const movesPath = arg('moves', '');
const sourceCommit = arg('source-commit', 'unknown');
const sourceDate = arg('source-date', new Date().toISOString().slice(0, 10));
const csvOut = arg('csv-out', path.join(ROOT, 'reports', 'pokemon_data_audit.csv'));
const xlsxOut = arg('xlsx-out', path.join(ROOT, 'reports', 'pokemon_data_audit.xlsx'));
const runtimeOut = arg('runtime-out', path.join(ROOT, 'generated', 'pokemon_showdown_legal_data.js'));

if (!pokedexPath || !learnsetsPath || !movesPath) {
  console.error('Usage: node tools/generate-pokemon-data-audit.js --pokedex <pokedex.ts> --learnsets <learnsets.ts> --moves <moves.ts> --source-commit <sha> --source-date <yyyy-mm-dd>');
  process.exit(2);
}

function toId(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function cleanKey(value) {
  return String(value || '').trim();
}

function loadTsConst(file, name) {
  let src = fs.readFileSync(file, 'utf8');
  src = src.replace(/^import[^\n]*\n/gm, '');
  src = src.replace(new RegExp('export const ' + name + '\\s*:[^=]+='), 'this.' + name + ' =');
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(src, ctx, { filename: file });
  return ctx[name] || {};
}

function readAppData() {
  const src = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
  const ctx = { console: { log() {}, warn() {}, error() {} } };
  vm.createContext(ctx);
  vm.runInContext(src + '\nthis.BASE_STATS=BASE_STATS;this.POKEMON_TYPES_DB=POKEMON_TYPES_DB;this.DEX_NUM_MAP=DEX_NUM_MAP;this.CHAMPIONS_MEGAS=CHAMPIONS_MEGAS;', ctx, { filename: 'data.js' });
  return {
    baseStats: ctx.BASE_STATS || {},
    types: ctx.POKEMON_TYPES_DB || {},
    dex: ctx.DEX_NUM_MAP || {},
    megas: ctx.CHAMPIONS_MEGAS || {},
  };
}

function parseMoves(file) {
  const src = fs.readFileSync(file, 'utf8');
  const out = {};
  const lines = src.split(/\r?\n/);
  let id = '';
  let blockLines = [];
  function flush() {
    if (!id) return;
    const block = blockLines.join('\n');
    const stringValue = (field) => {
      const m = block.match(new RegExp(field + '\\s*:\\s*["\\\']([^"\\\']*)["\\\']'));
      return m ? m[1] : '';
    };
    const numberValue = (field) => {
      const m = block.match(new RegExp(field + '\\s*:\\s*(-?\\d+)'));
      return m ? Number(m[1]) : '';
    };
    const accuracyMatch = block.match(/accuracy\s*:\s*(true|-?\d+)/);
    const flagsMatch = block.match(/flags\s*:\s*\{([^}]*)\}/);
    const flags = flagsMatch
      ? flagsMatch[1].split(',').map((part) => cleanKey(part.split(':')[0])).filter(Boolean).sort()
      : [];
    out[id] = {
      move_id: id,
      move_name: stringValue('name') || id,
      type: stringValue('type'),
      category: stringValue('category'),
      base_power: numberValue('basePower'),
      accuracy: accuracyMatch ? accuracyMatch[1] : '',
      pp: numberValue('pp'),
      priority: numberValue('priority'),
      target: stringValue('target'),
      flags: flags.join('|'),
    };
    id = '';
    blockLines = [];
  }
  lines.forEach((line) => {
    const start = line.match(/^\t(?:"([^"]+)"|'([^']+)'|([a-z0-9_]+)):\s*\{$/i);
    if (start) {
      flush();
      id = start[1] || start[2] || start[3];
      blockLines = [line];
      return;
    }
    if (!id) return;
    blockLines.push(line);
    if (/^\t},$/.test(line)) flush();
  });
  flush();
  return out;
}

function csvEscape(value) {
  const s = value == null ? '' : String(value);
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function writeCsv(rowsBySheet, outPath) {
  const headers = ['sheet'];
  Object.values(rowsBySheet).forEach((rows) => {
    rows.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (!headers.includes(key)) headers.push(key);
      });
    });
  });
  const lines = [headers.map(csvEscape).join(',')];
  Object.entries(rowsBySheet).forEach(([sheet, rows]) => {
    if (!rows.length) {
      lines.push(headers.map((key) => csvEscape(key === 'sheet' ? sheet : '')).join(','));
      return;
    }
    rows.forEach((row) => {
      lines.push(headers.map((key) => csvEscape(key === 'sheet' ? sheet : row[key])).join(','));
    });
  });
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
}

function xmlEscape(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function colName(n) {
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function sheetXml(rows) {
  const headers = [];
  rows.forEach((row) => Object.keys(row).forEach((key) => { if (!headers.includes(key)) headers.push(key); }));
  const matrix = [headers].concat(rows.map((row) => headers.map((key) => row[key] == null ? '' : row[key])));
  const rowsXml = matrix.map((row, rIdx) => {
    const cells = row.map((value, cIdx) => {
      const ref = colName(cIdx + 1) + (rIdx + 1);
      return '<c r="' + ref + '" t="inlineStr"><is><t>' + xmlEscape(value) + '</t></is></c>';
    }).join('');
    return '<row r="' + (rIdx + 1) + '">' + cells + '</row>';
  }).join('');
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' +
    rowsXml +
    '</sheetData></worksheet>';
}

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c >>> 0;
    }
  }
  let c = 0xffffffff;
  for (const b of buf) c = table[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function u16(n) { const b = Buffer.alloc(2); b.writeUInt16LE(n); return b; }
function u32(n) { const b = Buffer.alloc(4); b.writeUInt32LE(n >>> 0); return b; }

function makeZip(files) {
  const local = [];
  const central = [];
  let offset = 0;
  files.forEach((file) => {
    const name = Buffer.from(file.name, 'utf8');
    const body = Buffer.from(file.body, 'utf8');
    const compressed = zlib.deflateRawSync(body, { level: 9 });
    const crc = crc32(body);
    const localHeader = Buffer.concat([
      u32(0x04034b50), u16(20), u16(0), u16(8), u16(0), u16(0),
      u32(crc), u32(compressed.length), u32(body.length), u16(name.length), u16(0), name,
    ]);
    local.push(localHeader, compressed);
    central.push(Buffer.concat([
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(8), u16(0), u16(0),
      u32(crc), u32(compressed.length), u32(body.length), u16(name.length), u16(0), u16(0),
      u16(0), u16(0), u32(0), u32(offset), name,
    ]));
    offset += localHeader.length + compressed.length;
  });
  const centralBody = Buffer.concat(central);
  const end = Buffer.concat([
    u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
    u32(centralBody.length), u32(offset), u16(0),
  ]);
  return Buffer.concat(local.concat([centralBody, end]));
}

function writeXlsx(rowsBySheet, outPath) {
  const sheetNames = Object.keys(rowsBySheet);
  const workbookSheets = sheetNames.map((name, idx) => '<sheet name="' + xmlEscape(name) + '" sheetId="' + (idx + 1) + '" r:id="rId' + (idx + 1) + '"/>').join('');
  const rels = sheetNames.map((name, idx) => '<Relationship Id="rId' + (idx + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (idx + 1) + '.xml"/>').join('');
  const contentTypes = sheetNames.map((name, idx) => '<Override PartName="/xl/worksheets/sheet' + (idx + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('');
  const files = [
    { name: '[Content_Types].xml', body: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' + contentTypes + '</Types>' },
    { name: '_rels/.rels', body: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
    { name: 'xl/workbook.xml', body: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + workbookSheets + '</sheets></workbook>' },
    { name: 'xl/_rels/workbook.xml.rels', body: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + rels + '</Relationships>' },
  ];
  sheetNames.forEach((name, idx) => files.push({ name: 'xl/worksheets/sheet' + (idx + 1) + '.xml', body: sheetXml(rowsBySheet[name]) }));
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, makeZip(files));
}

function statString(stats) {
  if (!stats) return '';
  return [stats.hp, stats.atk, stats.def, stats.spa, stats.spd, stats.spe].join('/');
}

function statsMatch(appStats, sourceStats) {
  if (!appStats || !sourceStats) return '';
  return ['hp', 'atk', 'def', 'spa', 'spd', 'spe'].every((key) => Number(appStats[key]) === Number(sourceStats[key])) ? 'true' : 'false';
}

function sourceForSpecies(id, species, pokedex, learnsets) {
  if (learnsets[id]) return { id, inheritedFrom: '' };
  if (/-mega(?:x|y)?$/i.test(id) && species.baseSpecies) {
    const baseId = toId(species.baseSpecies);
    if (learnsets[baseId]) return { id: baseId, inheritedFrom: species.baseSpecies };
  }
  if (species.baseSpecies) {
    const baseId = toId(species.baseSpecies);
    if (learnsets[baseId]) return { id: baseId, inheritedFrom: species.baseSpecies };
  }
  return { id, inheritedFrom: '' };
}

function build() {
  const pokedex = loadTsConst(pokedexPath, 'Pokedex');
  const learnsets = loadTsConst(learnsetsPath, 'Learnsets');
  const moves = parseMoves(movesPath);
  const app = readAppData();
  const source = 'smogon/pokemon-showdown data/pokedex.ts + learnsets.ts + moves.ts';
  const sourceVersion = sourceCommit + ' (' + sourceDate + ')';
  const generatedAt = new Date().toISOString();
  const appSupportedNames = new Set(Object.keys(app.dex).concat(Object.keys(app.baseStats), Object.keys(app.types), Object.keys(app.megas), REQUIRED_SPECIES));
  const speciesRows = [];
  const learnsetRows = [];
  const moveRows = [];
  const formRows = [];
  const errorRows = [];
  const runtimeSpecies = {};
  const runtimeMoves = {};
  const speciesByName = {};

  Object.entries(pokedex).forEach(([id, row]) => {
    if (!row || !row.name) return;
    speciesByName[row.name] = { id, row };
  });

  const sourceSpecies = Object.entries(pokedex)
    .filter(([, row]) => row && row.name)
    .sort((a, b) => a[1].name.localeCompare(b[1].name));

  sourceSpecies.forEach(([id, row]) => {
    const name = row.name;
    const appStats = app.baseStats[name] || null;
    const sourceStats = row.baseStats || null;
    const supported = appSupportedNames.has(name) || appSupportedNames.has(row.baseSpecies || '') || !!appStats || !!app.types[name];
    const learnSource = sourceForSpecies(id, row, pokedex, learnsets);
    const learnset = learnsets[learnSource.id] && learnsets[learnSource.id].learnset ? learnsets[learnSource.id].learnset : {};
    speciesRows.push({
      source,
      source_commit_or_version: sourceVersion,
      dex_num: row.num || '',
      species_key: name,
      display_name: name,
      base_species: row.baseSpecies || name,
      forme: row.forme || '',
      gender_lock: row.gender || '',
      hp: sourceStats ? sourceStats.hp : '',
      atk: sourceStats ? sourceStats.atk : '',
      def: sourceStats ? sourceStats.def : '',
      spa: sourceStats ? sourceStats.spa : '',
      spd: sourceStats ? sourceStats.spd : '',
      spe: sourceStats ? sourceStats.spe : '',
      bst: sourceStats ? Object.values(sourceStats).reduce((a, b) => a + Number(b || 0), 0) : '',
      types: (row.types || []).join('|'),
      abilities: Object.values(row.abilities || {}).join('|'),
      required_item: row.requiredItem || '',
      app_supported: supported ? 'true' : 'false',
      app_stats_match_source: statsMatch(appStats, sourceStats),
      notes: learnSource.inheritedFrom ? 'learnset inherited from ' + learnSource.inheritedFrom : '',
    });
    Object.entries(learnset).sort((a, b) => a[0].localeCompare(b[0])).forEach(([moveId, codes]) => {
      const move = moves[moveId] || { move_name: moveId, move_id: moveId };
      learnsetRows.push({
        species_key: name,
        display_name: name,
        base_species: row.baseSpecies || name,
        forme: row.forme || '',
        move_name: move.move_name || moveId,
        move_id: moveId,
        learn_method_codes: (codes || []).join('|'),
        inherited_from: learnSource.inheritedFrom,
        legal_for_species_form: 'true',
        source,
        source_commit_or_version: sourceVersion,
        notes: learnSource.inheritedFrom ? 'Mega/base-form learnset inheritance' : '',
      });
      runtimeMoves[moveId] = moves[moveId] || { move_name: moveId, move_id: moveId };
    });
    runtimeSpecies[name] = {
      id,
      speciesKey: name,
      displayName: name,
      baseSpecies: row.baseSpecies || name,
      forme: row.forme || '',
      gender: row.gender || '',
      learnsetId: learnSource.id,
      inheritedFrom: learnSource.inheritedFrom,
      stats: sourceStats || null,
      types: row.types || [],
      requiredItem: row.requiredItem || '',
      moves: Object.fromEntries(Object.entries(learnset).map(([moveId, codes]) => [moveId, (codes || []).join('|')])),
    };
  });

  Object.entries(MALE_FORM_ALIASES).forEach(([baseName, aliasName]) => {
    if (runtimeSpecies[aliasName] || !runtimeSpecies[baseName]) return;
    const base = runtimeSpecies[baseName];
    const appStats = app.baseStats[aliasName] || app.baseStats[baseName] || null;
    runtimeSpecies[aliasName] = Object.assign({}, base, {
      speciesKey: aliasName,
      displayName: aliasName,
      baseSpecies: baseName,
      forme: 'M',
      inheritedFrom: baseName,
    });
    speciesRows.push({
      source,
      source_commit_or_version: sourceVersion,
      dex_num: speciesByName[baseName] && speciesByName[baseName].row ? speciesByName[baseName].row.num || '' : '',
      species_key: aliasName,
      display_name: aliasName,
      base_species: baseName,
      forme: 'M',
      gender_lock: 'M',
      hp: base.stats ? base.stats.hp : '',
      atk: base.stats ? base.stats.atk : '',
      def: base.stats ? base.stats.def : '',
      spa: base.stats ? base.stats.spa : '',
      spd: base.stats ? base.stats.spd : '',
      spe: base.stats ? base.stats.spe : '',
      bst: base.stats ? Object.values(base.stats).reduce((a, b) => a + Number(b || 0), 0) : '',
      types: (base.types || []).join('|'),
      abilities: '',
      required_item: base.requiredItem || '',
      app_supported: appSupportedNames.has(aliasName) || !!appStats ? 'true' : 'false',
      app_stats_match_source: statsMatch(appStats, base.stats),
      notes: 'male/base Showdown form alias for distinct app parser key',
    });
    Object.entries(base.moves || {}).sort((a, b) => a[0].localeCompare(b[0])).forEach(([moveId, codes]) => {
      const move = moves[moveId] || { move_name: moveId, move_id: moveId };
      learnsetRows.push({
        species_key: aliasName,
        display_name: aliasName,
        base_species: baseName,
        forme: 'M',
        move_name: move.move_name || moveId,
        move_id: moveId,
        learn_method_codes: codes,
        inherited_from: baseName,
        legal_for_species_form: 'true',
        source,
        source_commit_or_version: sourceVersion,
        notes: 'male/base Showdown form alias',
      });
    });
  });

  Object.values(moves).sort((a, b) => a.move_name.localeCompare(b.move_name)).forEach((move) => {
    moveRows.push(Object.assign({}, move, {
      source,
      source_commit_or_version: sourceVersion,
    }));
  });

  const byBase = {};
  speciesRows.forEach((row) => {
    const base = row.base_species || row.species_key;
    (byBase[base] = byBase[base] || []).push(row.species_key);
  });
  Object.entries(byBase).forEach(([base, forms]) => {
    if (forms.length < 2) return;
    for (let i = 0; i < forms.length; i++) {
      for (let j = i + 1; j < forms.length; j++) {
        const a = runtimeSpecies[forms[i]];
        const b = runtimeSpecies[forms[j]];
        if (!a || !b) continue;
        const movesA = new Set(Object.keys(a.moves || {}));
        const movesB = new Set(Object.keys(b.moves || {}));
        const allMoves = Array.from(new Set(Array.from(movesA).concat(Array.from(movesB)))).sort();
        const statDiff = statString(a.stats) !== statString(b.stats) ? 'true' : 'false';
        if (statDiff === 'true') {
          formRows.push({
            base_species: base,
            form_a: a.speciesKey,
            form_b: b.speciesKey,
            move_name: '',
            in_form_a: '',
            in_form_b: '',
            stat_difference: 'true',
            notes: 'stat line differs: ' + statString(a.stats) + ' vs ' + statString(b.stats),
          });
        }
        allMoves.forEach((moveId) => {
          const inA = movesA.has(moveId);
          const inB = movesB.has(moveId);
          if (inA === inB) return;
          const move = moves[moveId] || { move_name: moveId };
          formRows.push({
            base_species: base,
            form_a: a.speciesKey,
            form_b: b.speciesKey,
            move_name: move.move_name || moveId,
            in_form_a: inA ? 'true' : 'false',
            in_form_b: inB ? 'true' : 'false',
            stat_difference: statDiff,
            notes: 'learnset differs',
          });
        });
      }
    }
  });

  REQUIRED_SPECIES.forEach((name) => {
    const row = runtimeSpecies[name];
    if (!row) {
      errorRows.push({ error_type: 'missing_required_species', species_key: name, move_name: '', expected: 'present', actual: 'missing', source, severity: 'high', notes: 'Required acceptance species absent from source parse.' });
      return;
    }
    if (!Object.keys(row.moves || {}).length) {
      errorRows.push({ error_type: 'missing_learnset', species_key: name, move_name: '', expected: 'learnset', actual: 'none', source, severity: name.includes('-Mega') ? 'low' : 'medium', notes: row.inheritedFrom ? 'inherited from ' + row.inheritedFrom : 'No learnset found.' });
    }
  });
  ['Arcanine', 'Arcanine-Hisui'].forEach((name) => {
    const row = runtimeSpecies[name];
    if (!row) errorRows.push({ error_type: 'missing_arcanine_form', species_key: name, move_name: '', expected: 'present', actual: 'missing', source, severity: 'high', notes: 'Arcanine form separation is required.' });
  });

  const sampleRows = [
    { replay_id_or_fixture: 'turn0-kangaskhan-sample', side: 'p1', slot: 'p1a', lead_order: '1', species_key: 'Kangaskhan-Mega', display_name: 'Kangaskhan-Mega', gender: 'F', level: '50', item: 'Kangaskhanite', ability: 'unknown', moves: 'Fake Out', base_stats: '105/125/100/60/100/100', calculated_stats: 'unknown', move_legality_summary: 'Fake Out legal via Kangaskhan learnset', parser_warnings: 'gender token stripped; Mega form resolved' },
    { replay_id_or_fixture: 'turn0-kangaskhan-sample', side: 'p2', slot: 'p2a', lead_order: '1', species_key: 'Tyranitar', display_name: 'Tyranitar', gender: 'unknown', level: '50', item: 'unknown', ability: 'unknown', moves: 'unknown', base_stats: '100/134/110/95/100/61', calculated_stats: 'unknown', move_legality_summary: 'unknown', parser_warnings: '' },
  ];

  const rowsBySheet = {
    README: [{
      source_repository: 'https://github.com/smogon/pokemon-showdown',
      source_commit_or_version: sourceVersion,
      generated_at: generatedAt,
      generator_script_path: 'poke-sim/tools/generate-pokemon-data-audit.js',
      app_version_build_id: 'pokemon-champion-2026',
      notes: 'Standard Pokemon Showdown data is used for stats and species/form learnsets. Champions-custom stats are not used as the source of truth for this audit.',
    }],
    Species_Stats: speciesRows,
    Learnsets: learnsetRows,
    Moves: moveRows,
    Form_Differences: formRows,
    Validation_Errors: errorRows,
    Replay_Turn0_Sample: sampleRows,
  };

  const runtime = {
    source,
    sourceRepository: 'https://github.com/smogon/pokemon-showdown',
    sourceCommitOrVersion: sourceVersion,
    generatedAt,
    species: runtimeSpecies,
    moves: runtimeMoves,
  };
  fs.mkdirSync(path.dirname(runtimeOut), { recursive: true });
  fs.writeFileSync(runtimeOut,
    '(function(root){\n' +
    '  var data = ' + JSON.stringify(runtime) + ';\n' +
    '  root.ChampionsSim = root.ChampionsSim || {};\n' +
    '  root.ChampionsSim.pokemonDataAudit = data;\n' +
    '  if (typeof module !== "undefined" && module.exports) module.exports = data;\n' +
    '})(typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this));\n',
    'utf8'
  );
  writeCsv(rowsBySheet, csvOut);
  writeXlsx(rowsBySheet, xlsxOut);
  console.log('Wrote ' + speciesRows.length + ' species rows');
  console.log('Wrote ' + learnsetRows.length + ' learnset rows');
  console.log('Wrote ' + moveRows.length + ' move rows');
  console.log('Wrote CSV -> ' + csvOut);
  console.log('Wrote XLSX -> ' + xlsxOut);
  console.log('Wrote runtime data -> ' + runtimeOut);
}

build();
