import assert from 'node:assert/strict';import fs from 'node:fs';import {createRequire} from 'node:module';
import {verifyEvioliteReference} from './eviolite-reference-pin.mjs';
assert(process.env.CHAMPIONS_REFERENCE_SIM,'Eligibility generation requires the pinned current upstream checkout');
const reference=verifyEvioliteReference();assert(reference.identity.startsWith('upstream '));
const {Dex}=createRequire(import.meta.url)(process.env.CHAMPIONS_REFERENCE_SIM);
const ids=Dex.forFormat('gen9championsdoublescustomgame').species.all().filter(s=>s.nfe).map(s=>s.id).sort();
assert(ids.includes('snover')&&ids.includes('basculinwhitestriped')&&!ids.includes('basculin')&&!ids.includes('abomasnow'));
const region=`// BEGIN GENERATED EVIOLITE ELIGIBILITY\n// Exact registered species nfe, Champions reference 9b136a8; rebuild with tools/build-eviolite-eligibility.mjs.\nconst EVIOLITE_ELIGIBLE_SPECIES = new Set('${ids.join(' ')}'.split(' '));\n// END GENERATED EVIOLITE ELIGIBILITY`;
const target=new URL('../engine.js',import.meta.url),raw=fs.readFileSync(target,'utf8'),pattern=/\/\/ BEGIN GENERATED EVIOLITE ELIGIBILITY[\s\S]*?\/\/ END GENERATED EVIOLITE ELIGIBILITY/g;
assert.equal([...raw.matchAll(pattern)].length,1,'unique generated region');
const metadata=JSON.stringify({schema:1,reference,format:'gen9championsdoublescustomgame',predicate:'species.nfe: exact registered species, not baseSpecies name or tier',ids},null,2)+'\n';
const file=new URL('../source/eviolite-eligibility.json',import.meta.url);
if(process.argv.includes('--write')){fs.writeFileSync(target,raw.replace(pattern,region));fs.writeFileSync(file,metadata);}else{assert.equal(raw.match(pattern)[0].replace(/\r\n/g,'\n'),region);assert.equal(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'),metadata);}
console.log(JSON.stringify({eligible_species:ids.length,reference,mode:process.argv.includes('--write')?'write':'check'}));
