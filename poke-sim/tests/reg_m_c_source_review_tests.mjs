import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const review = JSON.parse(fs.readFileSync(new URL('source/reg-m-c-source-review.json', root), 'utf8'));
const ctx = vm.createContext({ console });
vm.runInContext(fs.readFileSync(new URL('rulesets.js', root), 'utf8'), ctx, { filename: 'rulesets.js' });

let count = 0;
function test(name, fn) { fn(); count++; console.log('PASS ' + name); }

test('official M-C schedule uses exact UTC boundaries', () => {
  const row = ctx.getChampionsRuleset('champions_reg_m_c_2026');
  assert.equal(row.startsAtUtc, '2026-09-09T02:00:00Z');
  assert.equal(row.endsAtUtc, '2026-12-02T01:59:00Z');
  assert.equal(review.official_notice.effective_from_utc, row.startsAtUtc);
  assert.equal(review.official_notice.effective_to_utc, row.endsAtUtc);
});

test('pre-start gap points to scheduled M-C without claiming coverage', () => {
  const gap = ctx.getChampionsRegulationCoverage('2026-09-08T12:00:00Z');
  assert.equal(gap.status, 'scheduled_source_review');
  assert.equal(gap.covered, false);
  assert.equal(gap.regulation_id, 'champions_reg_m_c_2026');
});

test('M-C is recognized but blocked at both exact active boundaries', () => {
  for (const when of ['2026-09-09T02:00:00Z', '2026-12-02T01:59:00Z']) {
    const active = ctx.getChampionsRegulationCoverage(when);
    assert.equal(active.status, 'source_review');
    assert.equal(active.covered, false);
    assert.equal(active.regulation_id, 'champions_reg_m_c_2026');
  }
  assert.equal(ctx.getChampionsRegulationCoverage('2026-12-02T01:59:00.001Z').status, 'successor_required');
});

test('named additions are candidates and the full roster remains unknown', () => {
  assert.deepEqual(review.named_additions.mega_forms, [
    'Salamence-Mega', 'Golisopod-Mega', 'Baxcalibur-Mega',
    'Absol-Mega-Z', 'Garchomp-Mega-Z', 'Lucario-Mega-Z'
  ]);
  assert.deepEqual(review.named_additions.ordinary_species_examples, ['Rillaboom']);
  assert.equal(review.named_additions.complete_new_species_list, null);
  assert.equal(review.competitive_use, false);
  assert.equal(review.learning_eligible, false);
});

test('Showdown observation cannot be mistaken for M-C format approval', () => {
  assert.equal(review.showdown_observation.format_status, 'm_c_format_not_present');
  assert.equal(review.showdown_observation.aliases_status, 'champions_vgc_alias_still_targets_m_b');
  assert.equal(ctx.getChampionsRuleset('champions_reg_m_c_2026').engineFormatId, null);
});

test('missing exact sprites remain explicit and use a labeled fallback policy', () => {
  assert.equal(review.sprite_observation.exact_assets['Salamence-Mega'], 'available_ani_and_gen5');
  for (const name of review.named_additions.mega_forms.slice(1)) {
    assert.equal(review.sprite_observation.exact_assets[name], 'missing_ani_and_gen5');
  }
  assert.match(review.sprite_observation.runtime_policy, /base-form fallback/);
});

console.log(`Reg M-C source review: ${count}/${count} passed`);
