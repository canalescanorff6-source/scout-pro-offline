'use strict';
/**
 * V170B: verifies documentary evidence did not silently promote candidates.
 * Passing this test is NOT video/frame validation.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const load = (f) => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const supplement = load('web/SCOUT_V170B_EVIDENCIAS_EXTERNAS_E_CONFLITOS.json');
const videos = load('web/SCOUT_V106_PESQUISA_VIDEOS.json');
const cards = load('web/SCOUT_V98_AUDITORIA_TATICA.json');

assert.equal(supplement.schema, 'SCOUT_V170B_EVIDENCE_AND_CONFLICT_REVIEW');
assert.equal(supplement.priority_cards.length, 5);
assert.deepEqual(supplement.priority_cards.map(c=>c.cap), [50,120,141,234,235]);
assert.equal(videos.cards.length, 246);
assert.equal(cards.cartas.length, 246);
assert.equal(videos.summary.total_videos, 393);
assert.equal(videos.summary.total_videos_unicos, 377);
assert.equal(videos.summary.sem_video, 5);
assert.equal(supplement.coverage_baseline.quarantined_links, 44);
assert.equal(supplement.coverage_baseline.package_compatible_associations, 208);
assert.equal(supplement.coverage_baseline.edition_pending_associations, 185);
assert.equal(supplement.coverage_baseline.visually_confirmed_edition_videos, 0);
assert.equal(supplement.coverage_baseline.card_ids_confirmed_on_video_frames, 0);
assert.equal(supplement.coverage_baseline.pp_training_confirmed_on_video_frames, 0);
assert.equal(supplement.coverage_baseline.pro_player_tournament_verified, 0);
assert.equal(supplement.content_discrimination.require_frame_for_promotion, true);
for (const [key, value] of Object.entries(supplement.safety)) {
  assert.equal(value, true, 'Restrição de segurança V170B não cumprida: '+key);
}
for (const c of supplement.priority_cards) {
  assert(c.original.startsWith('web/cartas/CAP_'));
  assert(fs.existsSync(path.join(root, c.original)), 'Arte não existe '+c.cap);
  assert.match(c.original_sha, /^[0-9a-f]{40}$/);
  assert(c.candidate_videos.length >= 2);
  assert(!/CONFIRMADO|VERIFIED_FRAME|IN_FRAME_VERIFIED/i.test(c.status), 'Vídeo falsamente validado '+c.cap);
  const main = videos.cards.find(x=>x.numero===c.cap);
  assert(main && main.videos.length===0 && main.estado==='pendente', 'CAP candidata promovida indevidamente '+c.cap);
}
const byId = new Map(videos.cards.map(c=>[c.numero,c]));
assert.deepEqual(supplement.additional_conflicts.map(x=>x.cap).sort((a,b)=>a-b), [23,36,79]);
for(const finding of supplement.additional_conflicts) {
  const original=byId.get(finding.cap);
  assert(original, 'Carta conflitante ausente '+finding.cap);
  assert.equal(original.card_id,finding.id);
  assert.equal(original.edicao,finding.local_label);
  assert.match(finding.external_label,/Show Time/);
  assert.match(finding.source,/^https:\/\/pesdb\.net\/efootball\/players\//);
  assert.equal(finding.status,'CONFIRMED_EXTERNAL_LABEL_MISMATCH_NOT_APPLIED');
}
const bentancur = cards.cartas.find(c=>c.numero===120);
assert.equal(bentancur.pp, supplement.priority_cards.find(c=>c.cap===120).catalogue_pp_budget);
const kakita = cards.cartas.find(c=>c.numero===234);
const kumasaka = cards.cartas.find(c=>c.numero===235);
assert.equal(kakita.pp, 62);
assert.equal(kumasaka.pp, 64);
console.log('V170B OK: 246 cartas preservadas; 5 pendentes; 393 associações não promovidas; conflitos documentados.');
console.log('V170B NÃO comprova quadros de vídeo, builds, Player ID, PP competitivo ou pro players.');
