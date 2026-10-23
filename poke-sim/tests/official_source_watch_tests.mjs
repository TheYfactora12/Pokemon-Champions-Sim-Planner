import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchOfficial, snapshot, observe } from '../tools/regulation-watch-core.mjs';
import { makeCandidate } from '../tools/regulation-watch-core.mjs';
import { prepareCandidate } from '../tools/stage-regulation-candidate.mjs';

const url = 'https://web-view.app.pokemonchampions.jp/battle/pages/events/rs178713870219xeaaio/en/pokemon.html';
const source = { url, kind: 'official_roster', required: true };
// Minimal structural fixture from the observed official page; no upstream script execution.
const page = rows => `<main><article><h1>Eligible Pokémon</h1><div id="pokemons"></div></article></main><script>const pokemons = ${JSON.stringify(rows)};const noPrefix = 'No. {0}';</script><script src="../../../resources/pokemon.js"></script>`;
const rows = [['0003-000', 1, 'Venusaur'], ['0026-001', 1, 'Raichu (Alolan Form)']];
const response = html => ({ bytes: Buffer.from(html), content_type: 'text/html', final_url: url });

test('blocked or unidentified roster fragments retain baseline and incomplete required health', async () => {
  const registry = { public_sources: [source] };
  const fetcher = html => async () => new Response(html, { headers: { 'content-type': 'text/html' } });
  const first = await observe(registry, null, { fetcher: fetcher(page(rows)) });
  for (const html of [
    page(rows).replace('</main>', '<p>Access denied. Verify you are human.</p></main>'),
    page(rows).replace(/<h1>.*?<\/h1>/, '<h1></h1>'),
    page(rows).replace(/<h1>.*?<\/h1>/, '<h1>Unknown page</h1>'),
    '<p>Checking your browser</p>' + page(rows),
  ]) {
    assert.throws(() => snapshot(source, response(html)), /challenge|identity/);
    const failed = await observe(registry, first.state, { fetcher: fetcher(html) });
    assert.equal(failed.report.incomplete, true);
    assert.deepEqual(failed.state.sources, first.state.sources);
    assert.equal(failed.candidates.length, 0);
  }
});
test('notice and Nintendo heading changes are observed without turning mentions into rules', () => {
  for (const [host, kind, heading] of [['champions-news.pokemon-home.com', 'official_regulation_notice', 'Regulation Set M-C Duration'], ['en-americas-support.nintendo.com', 'official_patch_notes', 'Latest update: Ver. 1.2.2 (Released October 6, 2026)']]) {
    const item = { url: `https://${host}/`, kind };
    const html = `<main><article><h1>${heading}</h1><p>This structural fixture preserves official heading placement. Source changes require review and do not approve mechanics.</p></article></main>`;
    const a = snapshot(item, { ...response(html), final_url: item.url });
    const b = snapshot(item, { ...response(html.replace(heading, heading + ' Updated')), final_url: item.url });
    assert.notEqual(a.semantic_sha256, b.semantic_sha256);
    assert.equal(a.mentions.effective_at, undefined);
  }
});
test('official grid changes are detected even when visible text is unchanged', () => {
  const first = snapshot(source, response(page(rows)));
  const next = snapshot(source, response(page(rows.slice(0, 1))));
  assert.equal(first.roster.length, 2);
  assert.notEqual(first.semantic_sha256, next.semantic_sha256);
  assert.equal(first.manual_roster_mapping_review, true);
  assert.equal(first.mentions.legal_species, undefined);
  assert.equal(snapshot(source, response(page([...rows].reverse()))).semantic_sha256, first.semantic_sha256);
});
test('missing, duplicate, unknown flag and executable roster payloads fail closed', () => {
  for (const html of [page([]), page([rows[0], rows[0]]), page([['0003-000', 2, 'Venusaur']]), page(rows).replace(JSON.stringify(rows), 'dangerous()'), page(rows).replace('id="pokemons"', 'id="changed"')]) assert.throws(() => snapshot(source, response(html)));
});
test('surrounding rules remain bound and cross-host roster redirects fail', () => {
  const first = snapshot(source, response(page(rows)));
  const changed = snapshot(source, response(page(rows).replace('Eligible Pokémon', 'Regulation M-D eligible Pokémon')));
  assert.notEqual(first.semantic_sha256, changed.semantic_sha256);
  assert.throws(() => snapshot(source, { ...response(page(rows)), final_url: 'https://www.pokemon.com/roster' }), /layout/);
  const candidate = makeCandidate(changed, first, 'a'.repeat(64));
  assert.equal(prepareCandidate(candidate, candidate.candidate_sha256).competitive_use, false);
});
test('registered official hosts fetch but unknown redirects and lookalikes never fetch', async () => {
  for (const host of ['champions-news.pokemon-home.com', 'web-view.app.pokemonchampions.jp', 'en-americas-support.nintendo.com']) {
    let calls = 0;
    await fetchOfficial(`https://${host}/`, async () => { calls++; return new Response('ok'); });
    assert.equal(calls, 1);
    calls = 0;
    await assert.rejects(fetchOfficial(`https://${host}.example.org/`, async () => { calls++; return new Response('ok'); }), /Unapproved/);
    assert.equal(calls, 0);
  }
  let calls = 0;
  await assert.rejects(fetchOfficial(url, async () => { calls++; return new Response(null, { status: 302, headers: { location: 'https://unknown.example/' } }); }), /Unapproved/);
  assert.equal(calls, 1);
});
test('roster fetch failure retains prior facts and recovery detects removal without promotion', async () => {
  const registry = { public_sources: [source] };
  const fetcher = async () => new Response(page(rows), { headers: { 'content-type': 'text/html' } });
  const first = await observe(registry, null, { fetcher });
  const failure = await observe(registry, first.state, { fetcher: async () => { throw new Error('offline'); } });
  assert.equal(failure.report.incomplete, true);
  assert.deepEqual(failure.state.sources, first.state.sources);
  const recovered = await observe(registry, failure.state, { fetcher: async () => new Response(page(rows.slice(1)), { headers: { 'content-type': 'text/html' } }) });
  assert.equal(recovered.candidates.length, 1);
  assert.equal(recovered.candidates[0].envelope.competitive_use, false);
  assert.equal(recovered.candidates[0].envelope.review_status, 'needs_review');
});
