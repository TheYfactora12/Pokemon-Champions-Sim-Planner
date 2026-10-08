'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const {test} = require('node:test');
const ctx = vm.createContext({console, Math, window:{}});
for (const file of ['data.js','engine.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),ctx);
vm.runInContext('this.Pokemon = Pokemon; this.Field = Field;',ctx);
function holder(item, ability='') {
  return new ctx.Pokemon({name:'Farigiraf',item,ability,nature:'Hardy',moves:['Psychic'],evs:{}});
}
test('every type booster respects Klutz, consumption and matching move type',()=>{
  for (const [item,type] of Object.entries(ctx.TYPE_BOOSTING_ITEMS)) {
    const p=holder(item);
    assert.equal(ctx._heldItemTypeBoostMod(p,type),4915,item);
    assert.equal(ctx._heldItemTypeBoostMod(p,'Unknown'),4096,item);
    p.ability='Klutz';
    assert.equal(ctx._heldItemTypeBoostMod(p,type),4096,item);
    p.ability=''; p.itemConsumed=true;
    assert.equal(ctx._heldItemTypeBoostMod(p,type),4096,item);
  }
});
for (const item of ['Sitrus Berry','Oran Berry']) test(item+' waits while Klutz is active, then heals once',()=>{
  const p=holder(item,'Klutz'); p.hp=Math.floor(p.maxHp/2);
  const before=p.hp;
  assert.equal(p.applyItem('damage'),undefined);
  assert.equal(p.hp,before); assert.equal(p.itemConsumed,false);
  p.ability=''; p.applyItem('damage');
  assert.equal(p.hp,Math.min(p.maxHp,before+(item==='Sitrus Berry'?Math.floor(p.maxHp/4):10)));
  assert.equal(p.itemConsumed,true);
  const healed=p.hp; p.applyItem('damage'); assert.equal(p.hp,healed);
});
test('Sitrus does not activate above half HP or after a KO',()=>{
  for (const hp of [0,101]) {
    const p=holder('Sitrus Berry'); p.maxHp=200;p.hp=hp;
    p.applyItem('damage');assert.equal(p.hp,hp);assert.equal(p.itemConsumed,false);
  }
});
test('Lum and Mental Herb effects remain suppressed under Klutz',()=>{
  const p=holder('Lum Berry','Klutz');p.status='par';p.applyItem('status');
  assert.equal(p.status,'par');assert.equal(p.itemConsumed,false);
  const q=holder('Mental Herb','Klutz');q.tauntedTurns=2;q.applyItem('taunt');
  assert.equal(q.tauntedTurns,2);assert.equal(q.itemConsumed,false);
});
test('Magnet and Miracle Seed reach actual damage only when active',()=>{
  for (const [item,move] of [['Magnet','Thunderbolt'],['Miracle Seed','Energy Ball']]) {
    const p=holder(item),target=holder(''),field=new ctx.Field();
    const damage=()=>p.calcDamage(move,target,field,null,()=>0);
    const boosted=damage();p.ability='Klutz';const suppressed=damage();
    p.ability='';p.item='';const withoutItem=damage();
    assert.equal(suppressed,withoutItem,item);
    assert.ok(boosted>withoutItem,item);
  }
});
