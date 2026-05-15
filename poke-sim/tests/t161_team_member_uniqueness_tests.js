// Issue #161 - catalog teams must not repeat the same member name.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

const ctx = {
  console,
  require,
  module: {},
  exports: {},
  Math,
  Object,
  Array,
  Set,
  JSON,
  String,
  Number,
  Boolean,
  RegExp,
  Date,
  parseInt,
  parseFloat
};
vm.createContext(ctx);

function load(file) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
}

load('data.js');
vm.runInContext('this.TEAMS = TEAMS;', ctx);

let pass = 0, fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}
function eq(a, b, msg) {
  if (a !== b) throw new Error((msg || 'expected equality') + ': got ' + a + ', expected ' + b);
}

console.log('\n=== team member uniqueness tests ===\n');

T('1. every catalog team has six unique member names', () => {
  for (const [key, team] of Object.entries(ctx.TEAMS)) {
    if (!team || !Array.isArray(team.members)) continue;
    const names = team.members.map(m => m && m.name).filter(Boolean);
    const uniq = new Set(names);
    eq(names.length, 6, `${key} member count`);
    eq(uniq.size, names.length, `${key} duplicate member names`);
  }
});

T('2. cofagrigus_tr specifically stays species-clause clean', () => {
  const names = ctx.TEAMS.cofagrigus_tr.members.map(m => m.name);
  eq(new Set(names).size, 6, 'cofagrigus_tr should be all unique');
});

console.log(`\nteam member uniqueness: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
