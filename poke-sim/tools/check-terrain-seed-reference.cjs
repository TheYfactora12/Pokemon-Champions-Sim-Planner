// Optional isolated oracle: requires the captured M-C checkout, never downloads it.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {execFileSync} = require('node:child_process');
const up = path.resolve(__dirname, '../artifacts/showdown-mc-reference');
const git = (...args) => execFileSync('git', ['-C', up, ...args], {encoding:'utf8'}).trim();
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
assert.equal(git('rev-parse', 'HEAD'), 'efe4948570d5e8189751792136d26e71710c6c66');
assert.equal(git('status', '--porcelain', '--untracked-files=no'), '');
const files = fs.readdirSync(path.join(up, 'dist'), {recursive:true}).filter(f => f.endsWith('.js')).sort();
const hashes = Object.fromEntries(files.map(f => [f.replaceAll('\\','/'), sha(fs.readFileSync(path.join(up,'dist',f)))]));
hashes['config/config-example.js'] = sha(fs.readFileSync(path.join(up,'dist/config/config-example.js'),'utf8').replace(/\r\n/g,'\n'));
assert.equal(sha(JSON.stringify(hashes)), '2ac4f2a3fd74a17a1509ebb5e1b191c55a7bf9292dfe76c2a0da468a411c59ad');
const {Battle} = require(path.join(up, 'dist/sim'));
const seeds = [['Electric Seed','electricterrain','def'],['Grassy Seed','grassyterrain','def'],['Misty Seed','mistyterrain','spd'],['Psychic Seed','psychicterrain','spd']];
const set = (species, ability, item = '') => ({species,ability,item,moves:['Protect'],level:50});
let count = 0;
for (const [item,terrain,stat] of seeds)
for (const trigger of ['Start','TerrainChange'])
for (const boundary of ['Flying','Levitate','cap6','Klutz','Embargo','MagicRoom']) {
  const b = new Battle({formatid:'gen9championsdoublescustomgame',seed:[1,2,3,4]});
  try {
    b.setPlayer('p1',{team:[set(boundary==='Flying'?'Charizard':'Cresselia',boundary==='Klutz'?'Klutz':boundary==='Levitate'?'Levitate':'Pressure',item),set('Pikachu','Static')]});
    b.setPlayer('p2',{team:[set('Blissey','Natural Cure'),set('Chansey','Natural Cure')]});
    if (b.requestState==='teampreview') b.makeChoices('team 12','team 12');
    const p = b.p1.active[0];
    if (boundary==='cap6') p.boosts[stat]=6;
    if (boundary==='Embargo') p.addVolatile('embargo',p);
    if (boundary==='MagicRoom') b.field.addPseudoWeather('magicroom',p);
    if (trigger==='Start') { b.field.terrain=terrain; b.singleEvent('Start',p.getItem(),p.itemState,p); }
    else b.field.setTerrain(terrain,p);
    const blocked = ['Klutz','Embargo','MagicRoom'].includes(boundary);
    const label = `${item}/${trigger}/${boundary}`;
    assert.equal(p.boosts[stat],boundary==='cap6'?6:blocked?0:1,label);
    assert.equal(p.item!=='',blocked,label);
    count++;
  } finally { b.destroy(); }
}
assert.equal(count,48);
console.log(`PASS ${count} synthetic reference probes; not app parity or eligibility approval.`);
