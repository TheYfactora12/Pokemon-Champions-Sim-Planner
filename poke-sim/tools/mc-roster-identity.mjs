import {mapOfficialRoster} from './regulation-roster-mapping.mjs';

export function mapMcRoster(capture, species, evidence) {
  const digest=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
  if (!evidence || evidence.schema_version !== 'champions-form-identity-evidence-v1' ||
      evidence.approval_status !== 'review_only_identity_not_regulation_approval' ||
      evidence.source_url !== capture.source_url || !evidence.asset_url || !evidence.screenshot || !evidence.review ||
      !Number.isFinite(Date.parse(evidence.observed_at)) ||
      !['source_sha256','asset_sha256','screenshot_sha256','dom_sha256'].every(key=>digest(evidence[key])) ||
      capture.regulation_id !== 'champions_reg_m_c_2026' || evidence.regulation_id !== capture.regulation_id ||
      evidence.source_sha256 !== capture.source_sha256 || evidence.competitive_use !== false ||
      !Array.isArray(evidence.rows)) throw new Error('M-C identity evidence mismatch');
  const reviewed = new Map();
  for (const row of evidence.rows) {
    const parts=/^(\d{4})-(\d{3})$/.exec(row.official_id);
    if (!parts || row.sprite_class !== 'sprite-poke-ui_PokeIcon_02_'+parts[1]+'_'+String(Number(parts[2])).padStart(2,'0')+'_0' ||
        !row.observed_features || !row.background_position) throw new Error('Invalid sprite evidence binding');
    if (reviewed.has(row.official_id)) throw new Error('Duplicate evidence identity');
    reviewed.set(row.official_id,row);
  }
  const rows = mapOfficialRoster(capture,species);
  for (const row of rows) {
    const proof = reviewed.get(row.official_id);
    if (!proof) continue;
    const candidate = species[proof.runtime_species_key];
    if (row.status !== 'needs_identity_review' || !row.eligible_in_capture || proof.official_label !== row.official_label ||
        !candidate || candidate.num !== Number(row.official_id.slice(0,4)) || candidate.battleOnly ||
        rows.some(r=>r.runtime_species_key === proof.runtime_species_key)) throw new Error('Invalid M-C form binding');
    row.runtime_species_key = proof.runtime_species_key;
    row.status = 'baseline_identity_candidate';
    row.mapping_basis = 'reviewed_exact_official_sprite_and_label';
    delete row.reason;
    row.baseline_metadata = {id:candidate.id,base_species:candidate.baseSpecies,forme:candidate.forme || '',is_nonstandard:candidate.isNonstandard || ''};
    row.baseline_metadata_scope = 'Identity review only, not regulation legality';
    reviewed.delete(row.official_id);
  }
  if (reviewed.size) throw new Error('Evidence identity absent from capture');
  return rows;
}
