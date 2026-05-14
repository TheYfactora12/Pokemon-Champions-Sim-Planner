// Issue #149 / #141 - classifyPokemon() canonical seven-role classifier tests.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function makeStubEl() {
  return {
    addEventListener(){}, removeEventListener(){}, appendChild(){}, removeChild(){},
    setAttribute(){}, getAttribute(){ return null; },
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    style: {}, dataset: {}, innerHTML: '', textContent: '', value: '',
    options: [], children: [], selectedOptions: [],
    querySelector: () => makeStubEl(),
    querySelectorAll: () => [],
    click(){}, focus(){}, blur(){}
  };
}

const ctx = {
  console, require, module: {}, exports: {}, Math, Object, Array, Set, JSON,
  Promise, setTimeout, setInterval, clearInterval, clearTimeout, Date,
  String, Number, Boolean, RegExp, parseInt, parseFloat,
  window: { matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){} }) },
  matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){} }),
  document: {
    documentElement: makeStubEl(),
    body: makeStubEl(),
    getElementById: () => makeStubEl(),
    querySelector: () => makeStubEl(),
    querySelectorAll: () => [],
    createElement: () => makeStubEl(),
    addEventListener(){}
  },
  localStorage: { getItem(){ return null; }, setItem(){}, removeItem(){}, clear(){} },
  navigator: { userAgent: 'node' },
  location: { href: 'http://localhost/' },
  fetch: () => Promise.reject(new Error('no network in tests')),
  URL: { createObjectURL(){ return 'blob:stub'; }, revokeObjectURL(){} },
  Blob: function(parts){ this.parts = parts; },
  FileReader: function(){},
  alert(){}
};
ctx.self = ctx.window;
ctx.globalThis = ctx;
vm.createContext(ctx);

function load(file) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
}

load('data.js');
load('engine.js');
vm.runInContext([
  'this.classifyPokemon=classifyPokemon;',
  'this.CANONICAL_ROLES=CANONICAL_ROLES;'
].join(' '), ctx);

const { classifyPokemon, CANONICAL_ROLES } = ctx;

let pass = 0, fail = 0;
function T(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}
function eq(a, b, msg='') {
  if (a !== b) throw new Error(`${msg} expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}
function truthy(v, msg='') { if (!v) throw new Error(msg || 'expected truthy'); }

console.log('\n=== classifyPokemon seven-role tests ===\n');

T('1. exposes exactly seven public role ids', () => {
  eq(CANONICAL_ROLES.join('|'), 'Sweeper|Wall|Tank|Speed Control|Pivot|Support|Weather Control');
});

function hasRole(result, role) {
  truthy(result.roles.indexOf(role) >= 0, `${role} missing from ${JSON.stringify(result.roles)}`);
}

T('2. Incineroar is multi-role support/pivot/tank with no duplicates', () => {
  const r = classifyPokemon({ name:'Incineroar', ability:'Intimidate', item:'Sitrus Berry', moves:['Fake Out','Parting Shot','Knock Off','Flare Blitz'] });
  hasRole(r, 'Support');
  hasRole(r, 'Pivot');
  hasRole(r, 'Tank');
  truthy(r.roles.length >= 3, JSON.stringify(r.roles));
  eq(new Set(r.roles).size, r.roles.length, 'roles must be deduped');
});

T('3. setup attacker classifies as Sweeper and Speed Control', () => {
  const r = classifyPokemon({ name:'Dragonite-Mega', ability:'Aerilate', item:'Dragonitite', moves:['Dragon Dance','Extreme Speed','Dragon Claw','Protect'] });
  hasRole(r, 'Sweeper');
  hasRole(r, 'Speed Control');
});

T('4. Whimsicott Tailwind + Icy Wind classifies as Speed Control + Support', () => {
  const r = classifyPokemon({ name:'Whimsicott', ability:'Prankster', item:'Covert Cloak', moves:['Tailwind','Icy Wind','Moonblast','Encore'] });
  hasRole(r, 'Speed Control');
  hasRole(r, 'Support');
});

T('5. screens and Parting Shot classify as Support + Pivot', () => {
  const r = classifyPokemon({ name:'Grimmsnarl', ability:'Prankster', item:'Light Clay', moves:['Parting Shot','Spirit Break','Reflect','Light Screen'] });
  hasRole(r, 'Support');
  hasRole(r, 'Pivot');
});

T('6. bulky recovery mon classifies as Wall', () => {
  const r = classifyPokemon({ name:'Sableye', ability:'Prankster', item:'Leftovers', moves:['Encore','Will-O-Wisp','Foul Play','Recover'] });
  hasRole(r, 'Wall');
  hasRole(r, 'Support');
});

T('7. pure pivot classifies as Pivot', () => {
  const r = classifyPokemon({ name:'Rotom-Wash', ability:'Levitate', item:'Sitrus Berry', moves:['Volt Switch','Hydro Pump','Will-O-Wisp','Protect'] });
  hasRole(r, 'Pivot');
});

T('8. weather ability classifies as Weather Control', () => {
  const r = classifyPokemon({ name:'Charizard-Mega-Y', ability:'Drought', item:'Charizardite Y', moves:['Heat Wave','Solar Beam','Tailwind','Protect'] });
  hasRole(r, 'Weather Control');
  hasRole(r, 'Speed Control');
});

T('9. bulky Trick Room support classifies as Wall + Speed Control + Support', () => {
  const r = classifyPokemon({ name:'Cresselia', ability:'Levitate', item:'Mental Herb', moves:['Lunar Dance','Trick Room','Helping Hand','Psychic'] });
  hasRole(r, 'Wall');
  hasRole(r, 'Speed Control');
  hasRole(r, 'Support');
});

T('10. ordinary strong attacker falls back to Sweeper', () => {
  const r = classifyPokemon({ name:'Garchomp', ability:'Rough Skin', item:'Clear Amulet', moves:['Earthquake','Dragon Claw','Rock Slide','Protect'] });
  hasRole(r, 'Sweeper');
});

T('11. missing data returns a stable Support shape', () => {
  const r = classifyPokemon(null);
  hasRole(r, 'Support');
  truthy(r.stats && typeof r.stats.total === 'number', 'stats payload missing');
  truthy(Array.isArray(r.moves), 'moves payload missing');
});

console.log(`\nclassifyPokemon: ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
