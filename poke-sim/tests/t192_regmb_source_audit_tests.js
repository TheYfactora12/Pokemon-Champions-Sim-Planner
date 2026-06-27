'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const registry = fs.readFileSync(path.join(ROOT, 'docs', 'DATA_SOURCE_REGISTRY.md'), 'utf8');
const legalityDoc = fs.readFileSync(path.join(ROOT, 'docs', 'CHAMPIONS_LEGALITY.md'), 'utf8');
const syncDoc = fs.readFileSync(path.join(ROOT, 'docs', 'SHOWDOWN_SYNC_ARCHITECTURE.md'), 'utf8');
const ui = fs.readFileSync(path.join(ROOT, 'ui.js'), 'utf8');
const engine = fs.readFileSync(path.join(ROOT, 'engine.js'), 'utf8');
const legality = require(path.join(ROOT, 'legality.js'));

let pass = 0;
let fail = 0;

function T(name, fn) {
  try {
    fn();
    console.log('  PASS', name);
    pass++;
  } catch (err) {
    console.log('  FAIL', name, '-', err.message);
    fail++;
  }
}

function truthy(value, msg) {
  if (!value) throw new Error(msg || 'expected truthy');
}

function inc(text, needle, msg) {
  truthy(String(text).includes(needle), msg || ('missing ' + needle));
}

function notInc(text, needle, msg) {
  truthy(!String(text).includes(needle), msg || ('unexpected ' + needle));
}

const REGMB_NEW_MEGAS = [
  'Raichu-Mega-X',
  'Raichu-Mega-Y',
  'Sceptile-Mega',
  'Blaziken-Mega',
  'Swampert-Mega',
  'Mawile-Mega',
  'Metagross-Mega',
  'Staraptor-Mega',
  'Scolipede-Mega',
  'Scrafty-Mega',
  'Eelektross-Mega',
  'Pyroar-Mega',
  'Malamar-Mega',
  'Barbaracle-Mega',
  'Dragalge-Mega',
  'Falinks-Mega'
];

console.log('\n=== Reg M-B source audit tests ===\n');

T('1. Reg M-B source facts are documented with source URLs', () => {
  inc(registry, 'Regulation Set M-B from June 17 to September 2, 2026');
  inc(registry, '2026 World Championships');
  inc(registry, 'https://victoryroad.pro/wp-content/uploads/2026/06/Reg-M-B-Pokemon1.jpg');
  inc(registry, 'https://victoryroad.pro/wp-content/uploads/2026/06/Reg-M-B-Pokemon2.jpg');
  inc(registry, 'https://victoryroad.pro/wp-content/uploads/2026/06/NewMegasRMB.png');
});

T('2. source-reviewed Reg M-B new Mega list is complete', () => {
  truthy(Array.isArray(legality.CHAMPIONS_REGMB_REVIEW_NEW_MEGAS), 'missing audit list export');
  truthy(legality.CHAMPIONS_REGMB_REVIEW_NEW_MEGAS.length === 16, 'expected 16 Reg M-B new Megas');
  REGMB_NEW_MEGAS.forEach((name) => {
    truthy(legality.CHAMPIONS_REGMB_REVIEW_NEW_MEGAS.includes(name), 'missing ' + name);
  });
});

T('3. Reg M-B audit is not silently promoted to runtime legality', () => {
  inc(engine, "var CHAMPIONS_FORMAT_ID = 'champions-vgc-2026-regma'");
  inc(engine, 'champions_reg_m_b_doubles_bo3_source_review');
  inc(engine, 'Champions Reg M-A Historical Lane');
  inc(registry, 'not yet promoted as the implemented simulator legality lane');
  inc(legalityDoc, 'does not prove full Reg M-B legality');
  inc(syncDoc, 'source conversion, not just fetching');
});

T('4. Overview tells contributors the Reg M-B blocker clearly', () => {
  inc(ui, 'Reg M-B source audit recorded');
  inc(ui, '16 source-reviewed new Mega names');
  inc(ui, 'Runtime promotion remains blocked');
  inc(ui, 'source-backed data conversion');
});

T('5. unreviewed Reg M-B stones are not added by assumption', () => {
  [
    'Raichunite X',
    'Raichunite Y',
    'Sceptilite',
    'Blazikenite',
    'Swampertite',
    'Mawilite',
    'Metagrossite',
    'Staraptorite',
    'Scolipedite',
    'Scraftite',
    'Eelektrossite',
    'Pyroarite',
    'Malamarite',
    'Barbaraclite',
    'Dragalgite',
    'Falinksite'
  ].forEach((stone) => {
    truthy(!legality.CHAMPIONS_LEGAL_ITEMS.has(stone), 'unreviewed Reg M-B stone enabled: ' + stone);
  });
});

if (fail) {
  console.error('\nReg M-B source audit: ' + pass + ' pass, ' + fail + ' fail');
  process.exit(1);
}
console.log('\nReg M-B source audit: ' + pass + ' pass, 0 fail');
