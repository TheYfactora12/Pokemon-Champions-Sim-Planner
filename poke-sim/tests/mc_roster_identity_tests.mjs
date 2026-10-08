import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {test} from 'node:test';
import {mapMcRoster} from '../tools/mc-roster-identity.mjs';
const require=createRequire(import.meta.url);
const species=require('../generated/pokemon_showdown_legal_data.js').species;
const read=file=>JSON.parse(fs.readFileSync(new URL('../source/'+file,import.meta.url)));
const capture=read('reg-m-c-official-roster.json'),evidence=read('reg-m-c-form-identity-evidence.json');
test('all 262 exact identity candidates stay review-only without source mutation',()=>{
  const before=JSON.stringify(capture),rows=mapMcRoster(capture,species,evidence);
  assert.equal(rows.length,262);
  assert.ok(rows.every(r=>r.status==='baseline_identity_candidate'&&!r.competitive_use));
  assert.equal(rows.find(r=>r.official_id==='0925-001').runtime_species_key,'Maushold-Four');
  assert.equal(rows.find(r=>r.official_id==='0931-002').runtime_species_key,'Squawkabilly-Yellow');
  assert.equal(new Set(rows.map(r=>r.runtime_species_key)).size,262);
  assert.equal(JSON.stringify(capture),before);
});
test('changed capture, label, duplicate and missing identity evidence fail closed',()=>{
  assert.throws(()=>mapMcRoster(capture,species,{...evidence,source_sha256:'changed'}));
  assert.throws(()=>mapMcRoster(capture,species,{...evidence,competitive_use:true}));
  for(const field of ['schema_version','approval_status','source_url','asset_url','screenshot_sha256','dom_sha256','asset_sha256','review','observed_at']) {
    const stripped={...evidence};delete stripped[field];assert.throws(()=>mapMcRoster(capture,species,stripped));
  }
  assert.throws(()=>mapMcRoster(capture,species,{...evidence,rows:[{...evidence.rows[1],sprite_class:'sprite-poke-ui_PokeIcon_02_0931_00_0'}]}));
  assert.throws(()=>mapMcRoster(capture,species,{...evidence,rows:[...evidence.rows,evidence.rows[0]]}));
  for (const patch of [{official_label:'changed'},{official_id:'9999-000'},{runtime_species_key:'Squawkabilly'}]) {
    assert.throws(()=>mapMcRoster(capture,species,{...evidence,rows:[{...evidence.rows[0],...patch}]}));
  }
});
