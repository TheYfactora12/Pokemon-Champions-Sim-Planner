// Diagnostic only: a completed run is not a passing mechanics gate.
import { compareProbe, loadLocalEngine, referenceIdentity } from './showdown-reference.mjs';
const local = loadLocalEngine();
const mon = (name, ability, moves, item = '') => ({ name, ability, moves, item,
  nature: 'Hardy', level: 50, evs: { hp: 32, atk: 0, def: 0, spa: 2, spd: 0, spe: 32 } });
const team = members => ({ name: 'Synthetic priority suppression probe', format: 'champions', members });
const rows = [];
for (const ability of ['Armor Tail', 'Dazzling', 'Queenly Majesty']) {
  for (const mode of ['ordinary', 'mold', 'holder-shield', 'target-shield', 'gas']) {
    const player = team([
      mon('Liepard', ['ordinary', 'gas'].includes(mode) ? 'Limber' : 'Mold Breaker', ['Fake Out']),
      mon('Blissey', mode === 'gas' ? 'Neutralizing Gas' : 'Natural Cure', ['Protect']),
      mon('Pikachu', 'Static', ['Protect']), mon('Gengar', 'Cursed Body', ['Protect'])
    ]);
    const opponent = team([
      mon('Charizard', 'Blaze', ['Tackle'], mode === 'target-shield' ? 'Ability Shield' : ''),
      mon('Snorlax', ability, ['Protect'], mode === 'holder-shield' ? 'Ability Shield' : ''),
      mon('Venusaur', 'Overgrow', ['Protect']), mon('Blastoise', 'Torrent', ['Protect'])
    ]);
    const result = compareProbe({ id: `${ability}-${mode}`, formatId: 'gen9championsdoublescustomgame',
      synthetic: true, seed: [8, 3, 12, 7], player, opponent,
      turns: [{ player: [{ move: 'Fake Out', targetSide: 'foe', targetSlot: 0 }, { move: 'Protect' }],
        opponent: [{ move: 'Tackle', targetSide: 'foe', targetSlot: 0 }, { move: 'Protect' }] }],
      comparePP: true, compareExactHP: false }, local);
    if (!result.local || !result.reference?.frames?.length) throw Error(`Probe unavailable: ${result.id}`);
    const localTarget = result.local.turnLog[0].post.roster.opponent.find(m => m.teamSlot === 0);
    const refTarget = result.reference.frames[0].post.p2.find(m => m.key === 'p2m1');
    rows.push({ id: result.id, status: result.status, differences: result.differences,
      local_target_hp: localTarget.hp_current, reference_target_hp: refTarget.hp,
      local_tackle_pp: localTarget.move_pp.Tackle.current,
      reference_tackle_pp: refTarget.moves.find(m => m.id === 'tackle').pp,
      local_events: result.local.log.filter(line => /blocked|Fake Out|Tackle|flinch/.test(line)),
      reference_events: result.reference.raw_protocol.filter(line => /cant|damage|Fake Out|Tackle/.test(line)) });
  }
}
console.log(JSON.stringify({ diagnostic_only: true, local_hashes: local.hashes, reference: referenceIdentity(), rows,
  limits: ['Synthetic forced actions, not team legality or selection-policy proof',
    'Independent random HP values are not exact-equality assertions',
    'Move order normalizes only matching priority-ability rejections; raw protocol remains available',
    'No side swaps, direct blocker targets or suppression-removal coverage yet'] }, null, 2));
