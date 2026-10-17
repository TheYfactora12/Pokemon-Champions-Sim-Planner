import assert from 'node:assert/strict';
import { moveOrder } from '../tools/showdown-reference.mjs';
const teams = { p1: { members: [{ name: 'Liepard' }] }, p2: { members: [{ name: 'Charizard' }, { name: 'Snorlax' }] } };
const blocked = '|move|p1a: p1m1|Fake Out||[still]';
const rejection = ability => `|cant|p2b: p2m2|ability: ${ability}|Fake Out|[of] p1a: p1m1`;
for (const ability of ['Armor Tail', 'Dazzling', 'Queenly Majesty']) {
  assert.deepEqual(moveOrder([blocked, rejection(ability)], teams), []);
}
const retained = [
  [blocked],
  [blocked, rejection('Armor Tail').replace('p1a: p1m1', 'p2a: p2m1')],
  [blocked, rejection('Armor Tail').replace('|Fake Out|', '|Quick Attack|')],
  [blocked, rejection('Unknown Ability')],
  [blocked, '|turn|2', rejection('Armor Tail')],
  [blocked, '|move|p2a: p2m1|Tackle|p1a: p1m1', rejection('Armor Tail')],
  ['|move|p1a: p1m1|Fake Out|p2a: p2m1', rejection('Armor Tail')],
  ['|move|p1a: p1m1|Tackle|p2a: p2m1', '|-activate|p2a: p2m1|move: Protect'],
  ['|move|p1a: p1m1|Zap Cannon|p2a: p2m1|[miss]', '|-miss|p1a: p1m1|p2a: p2m1'],
  ['|move|p1a: p1m1|Recover|p1a: p1m1|[still]', '|-fail|p1a: p1m1|heal'],
  ['|move|p1a: p1m1|Spectral Thief|p2a: p2m1|[still]', '|-clearboost|p2a: p2m1'],
];
for (const lines of retained) {
  const expected = lines.filter(line => line.startsWith('|move|')).map(line => {
    const parts = line.split('|');
    return `${parts[2].startsWith('p1') ? 'Liepard' : 'Charizard'} used ${parts[3]}!`;
  });
  assert.deepEqual(moveOrder(lines, teams), expected, JSON.stringify(lines));
}
console.log('14 reference move-announcement boundary checks passed');
