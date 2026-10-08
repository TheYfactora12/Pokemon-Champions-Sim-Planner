const assert=require('node:assert/strict');
const {test}=require('node:test');
const {compareRows}=require('../tools/audit-mc-release-inventory.cjs');
test('inventory separates presence, field differences and missing data',()=>{
  const rows=compareRows([{id:'a',name:'A',pp:5},{id:'b',name:'B',pp:10},{id:'c',name:'C',pp:20}],{a:{id:'a',pp:5},b:{id:'b',pp:15}},['pp']);
  assert.deepEqual(rows.map(r=>r.status),['mirror_fields_match','mirror_field_difference','missing_mirror_row']);
  assert.deepEqual(rows[1].differences,['pp']);
});
test('inventory refuses vacuous coverage and ambiguous identities',()=>{
  assert.throws(()=>compareRows([],{},['pp']));
  assert.throws(()=>compareRows([{id:'a'}],{},[]));
  assert.throws(()=>compareRows([{id:'a'}],{a:{id:'a'},b:{id:'a'}},['pp']));
  assert.throws(()=>compareRows([{id:'a'},{id:'a'}],{},['pp']));
  assert.equal(compareRows([{id:'a'}],{a:{id:'a'}},['pp'])[0].status,'mirror_field_difference');
});
test('object property order is not data drift',()=>{
  assert.equal(compareRows([{id:'a',stats:{hp:60,atk:90}}],{a:{id:'a',stats:{atk:90,hp:60}}},['stats'])[0].status,'mirror_fields_match');
});
