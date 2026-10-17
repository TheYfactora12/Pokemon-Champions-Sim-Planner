import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compareProbe, loadLocalEngine } from '../tools/showdown-reference.mjs';
const local = loadLocalEngine();
const mon = (name, ability, moves, item = '') => ({ name, ability, moves, item,
  nature: 'Hardy', level: 50, evs: { hp: 32, atk: 0, def: 0, spa: 2, spd: 0, spe: 32 } });
const team = members => ({ name: 'Synthetic priority suppression oracle', format: 'champions', members });
for (const ability of ['Armor Tail', 'Dazzling', 'Queenly Majesty'])
for (const mode of ['ordinary', 'mold', 'holder-shield', 'target-shield', 'gas', 'gas-shield', 'turboblaze', 'teravolt'])
for (const direct of [false, true]) for (const swap of [false, true]) {
  test(`${ability}: ${mode}, direct=${direct}, swap=${swap}`, () => {
    const gas = mode.startsWith('gas');
    const bypass = mode === 'turboblaze' ? 'Turboblaze' : mode === 'teravolt' ? 'Teravolt' : 'Mold Breaker';
    const holderShield = ['holder-shield', 'gas-shield'].includes(mode);
    const targetShield = mode === 'target-shield';
    const expectedBlock = mode === 'ordinary' || holderShield || (direct && targetShield);
    const source = team([
      mon('Liepard', gas || mode === 'ordinary' ? 'Limber' : bypass, ['Fake Out']),
      mon('Blissey', gas ? 'Neutralizing Gas' : 'Natural Cure', ['Protect']),
      mon('Pikachu', 'Static', ['Protect']), mon('Gengar', 'Cursed Body', ['Protect'])
    ]);
    const target = team([
      mon('Charizard', direct ? ability : 'Blaze', ['Tackle'], targetShield || (direct && holderShield) ? 'Ability Shield' : ''),
      mon('Snorlax', direct ? 'Immunity' : ability, ['Protect'], !direct && holderShield ? 'Ability Shield' : ''),
      mon('Venusaur', 'Overgrow', ['Protect']), mon('Blastoise', 'Torrent', ['Protect'])
    ]);
    const a = [{ move: 'Fake Out', targetSide: 'foe', targetSlot: 0 }, { move: 'Protect' }];
    const b = [{ move: 'Tackle', targetSide: 'foe', targetSlot: 0 }, { move: 'Protect' }];
    const r = compareProbe({ id: `${ability}-${mode}-${direct}-${swap}`, synthetic: true,
      formatId: 'gen9championsdoublescustomgame', seed: [8, 3, 12, 7],
      player: swap ? target : source, opponent: swap ? source : target,
      turns: [{ player: swap ? b : a, opponent: swap ? a : b }], comparePP: true }, local);
    const side = swap ? 'player' : 'opponent', refSide = swap ? 'p1' : 'p2';
    const before = r.local.turnLog[0].pre.roster[side].find(m => m.teamSlot === 0);
    const after = r.local.turnLog[0].post.roster[side].find(m => m.teamSlot === 0);
    const rb = r.reference.initial[refSide].find(m => m.key === `${refSide}m1`);
    const ra = r.reference.frames[0].post[refSide].find(m => m.key === `${refSide}m1`);
    assert.equal(ra.hp < rb.hp, !expectedBlock, 'reference damage presence');
    assert.equal(after.hp_current < before.hp_current, !expectedBlock, 'local damage presence');
    assert.equal(ra.moves.find(m => m.id === 'tackle').pp, expectedBlock ? 19 : 20, 'reference flinch/PP');
    assert.equal(after.move_pp.Tackle.current, expectedBlock ? 19 : 20, 'local flinch/PP');
    assert.equal(r.reference.raw_protocol.some(line => line.includes(`|ability: ${ability}|`)), expectedBlock, 'reference blocker event');
    assert.equal(r.local.log.some(line => line.includes(`${ability} blocked Fake Out`)), expectedBlock, 'local blocker event');
    // The shared comparator counts blocked [still] announcements as resolved moves.
    // Prove that exact known discrepancy rather than hiding arbitrary mismatches.
    assert.equal(r.differences.length, expectedBlock ? 1 : 0, JSON.stringify(r.differences));
    if (expectedBlock) {
      const diff = r.differences[0];
      assert.equal(diff.kind, 'resolved_move_order');
      assert.deepEqual(diff.reference.filter(m => m !== 'Liepard used Fake Out!'), diff.local);
      assert.ok(r.reference.raw_protocol.some(line => line.startsWith('|move|') && line.includes('|Fake Out|') && line.endsWith('|[still]')));
    }
  });
}
