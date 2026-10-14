'use strict';
/**
 * SCOUT V171 — compare 246 cards, 393 official associations, and 44 quarantined
 * candidates against the original files. This test verifies DATA INTEGRITY;
 * it does not assert that footage was viewed or that a build is competitive.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const matrix=read('web/SCOUT_V171_MATRIZ_EVIDENCIAS_246.json');
const catalogue=read('web/SCOUT_V106_PESQUISA_VIDEOS.json');
const diagnostic=read('web/SCOUT_V170_DIAGNOSTICO_FICHAS_E_EVIDENCIAS.json');
const visual=read('web/SCOUT_V98_AUDITORIA_TATICA.json');
const historic=read('web/SCOUT_V91_RARIDADE_REVISAO.json');
assert.equal(matrix.schema,'SCOUT_V171_FORENSIC_CATALOGUE_NO_FRAME_PROMOTION');
assert.equal(matrix.baseline_commit,'7ff91b725a4bcf6fb24124bc1f36d9e1bc6cd73d');
const cov=matrix.coverage;
assert.equal(matrix.canonical_cards.length,246);
assert.equal(matrix.official_associations.length,393);
assert.equal(matrix.quarantined_leads.length,44);
assert.equal(visual.cartas.length,246);
assert.equal(historic.confirmacoes.total,56);
assert.deepEqual(matrix.priority_pending,[50,120,141,234,235]);

const catByCap=new Map(catalogue.cards.map(c=>[c.numero,c]));
const visByCap=new Map(visual.cartas.map(c=>[c.numero,c]));
const diagByCap=new Map(diagnostic.dados_por_carta.map(c=>[c.numero,c]));
assert.equal(catByCap.size,246);
assert.equal(visByCap.size,246);
assert.equal(diagByCap.size,246);
let associations=0,packageAssociations=0,pendingAssociations=0;
const ids=new Set();
const sharedById=new Map();
let candidateOnly=0,packageCards=0,missingCards=0;
const metadataGameplayPattern=/gameplay|com_partida|partida_coletiva|teste_comparativo|review_de_longo_prazo/;
let gameplayLabels=0,gameplayCards=0;
for(const entry of matrix.canonical_cards) {
  const original=catByCap.get(entry.cap);
  const card=visByCap.get(entry.cap);
  const diag=diagByCap.get(entry.cap);
  assert(original&&card&&diag,'CAP original ou auditada ausente '+entry.cap);
  assert.equal(entry.name,original.nome);
  assert.equal(entry.edition_registered,original.edicao);
  assert.equal(entry.card_id_registered,original.card_id);
  assert.equal(entry.art,diag.imagem_original);
  assert.equal(entry.video_associations,original.videos.length);
  assert.equal(entry.source_category,original.estado);
  assert.equal(entry.frame_verified_videos,0,'Frame alegado sem prova CAP'+entry.cap);
  assert.equal(entry.gameplay_verified_videos,0,'Gameplay alegado sem prova CAP'+entry.cap);
  assert.equal(entry.pp_training_verified_videos,0,'Build alegada sem prova CAP'+entry.cap);
  assert.equal(entry.competitive_pro_verified_videos,0,'Pro alegado sem prova CAP'+entry.cap);
  assert.equal(entry.card_id_numeric,/^\d+$/.test(String(original.card_id)));
  assert.equal(entry.additional_candidate_refs,diag.candidatos_em_quarentena);
  assert.equal(entry.base_stats_registered,diag.atributos_base_documentados);
  assert.equal(entry.native_skills_registered,diag.habilidades_nativas_documentadas);
  assert.equal(entry.body_model_evidence,diag.modelo_corporal_com_evidencia);
  const gameplay=original.videos.filter(v=>metadataGameplayPattern.test(v.tipo_conteudo)).length;
  assert.equal(entry.video_metadata_gameplay_refs,gameplay);
  if(gameplay)gameplayCards++;
  gameplayLabels+=gameplay;
  if(original.estado==='encontrado_por_pacote')packageCards++;
  if(original.estado==='candidato_sem_versao_confirmada')candidateOnly++;
  if(original.estado==='pendente')missingCards++;
  const expected=original.videos.length===0?'MISSING_OFFICIAL_VIDEO':
    original.estado==='encontrado_por_pacote'?'PACKAGE_METADATA_ONLY':'PLAYER_METADATA_ONLY';
  assert.equal(entry.evidence_grade,expected);
  if(!original.videos.length) assert.equal(entry.priority,'P0');
  assert(fs.existsSync(path.join(root,'web',entry.art)),'Arte ausente CAP'+entry.cap);
  associations+=original.videos.length;
  for(const v of original.videos) {
    ids.add(v.video_id);
    if(v.compatibilidade==='pacote_compativel')packageAssociations++;
    else if(v.compatibilidade==='edicao_pendente')pendingAssociations++;
    else assert.fail('Compatibilidade desconhecida: '+v.compatibilidade);
    if(!sharedById.has(v.video_id))sharedById.set(v.video_id,[]);
    sharedById.get(v.video_id).push(entry.cap);
  }
}
assert.equal(packageCards,130); assert.equal(candidateOnly,111); assert.equal(missingCards,5);
assert.equal(associations,393);assert.equal(ids.size,377);
assert.equal(packageAssociations,208);assert.equal(pendingAssociations,185);
assert.equal(gameplayCards,82);assert.equal(gameplayLabels,100);
const associationKeys=new Set();
for(const association of matrix.official_associations) {
  const row=catByCap.get(association.cap);
  const original=row?.videos.find(v=>v.video_id===association.video_id);
  assert(original,'Associação inexistente CAP'+association.cap+': '+association.video_id);
  assert.equal(association.url,original.url);
  assert.equal(association.compatibility_recorded,original.compatibilidade);
  assert.equal(association.kind,original.tipo_conteudo);
  assert.equal(association.grade,'REFERENCE_ONLY');
  for(const key of ['frame_inspected','exact_card_in_frame','card_id_in_frame','pp_build_in_frame','pro_tournament_verified'])
    assert.equal(association[key],false,'Confirmação inventada: '+association.cap+': '+key);
  const ref=association.cap+'@'+association.video_id;
  assert(!associationKeys.has(ref),'Associação repetida '+ref);
  associationKeys.add(ref);
}
const reused=[...sharedById].filter(([,caps])=>caps.length>1);
assert.equal(reused.length,9);
assert.equal(reused.reduce((n,[,caps])=>n+caps.length-1,0),16);
assert.equal(matrix.shared_video_references.length,9);
for(const item of matrix.shared_video_references)
  assert.deepEqual(item.caps,sharedById.get(item.video_id));

const qUrls=new Set();
for(const lead of matrix.quarantined_leads) {
 assert(/^https:\/\//.test(lead.url));
 assert(!qUrls.has(lead.url),'URL candidata duplicada: '+lead.url);
 qUrls.add(lead.url);
 assert(fs.existsSync(path.join(root,lead.source_file)),'Pesquisa excluída: '+lead.source_file);
 assert.equal(lead.frame_inspected,false);
 assert.equal(lead.exact_card_in_frame,false);
 assert.equal(lead.card_id_in_frame,false);
 assert.equal(lead.pp_build_in_frame,false);
 assert.equal(lead.grade,'QUARANTINED_NO_FRAME');
 assert(Array.isArray(lead.target_caps) && lead.target_caps.length,'Lead sem CAP');
 for(const cap of lead.target_caps) assert(catByCap.has(cap),'Lead com CAP inválida '+cap);
 if(lead.video_id)assert(!ids.has(lead.video_id),'Lead já promovido indevidamente '+lead.url);
}
assert.equal(qUrls.size,44);
assert.equal(cov.cards,246);
assert.equal(cov.with_catalogue_video,241);
assert.equal(cov.without_catalogue_video,5);
assert.equal(cov.distinct_videos,377);
assert.equal(cov.official_video_associations,393);
assert.equal(cov.quarantined_links,44);
assert.equal(cov.shared_video_ids,9);
assert.equal(cov.association_overlap,16);
assert.equal(cov.package_compatible_associations,208);
assert.equal(cov.edition_pending_associations,185);
assert.equal(cov.metadata_gameplay_cards,82);
assert.equal(cov.metadata_gameplay_associations,100);
assert.equal(cov.metadata_gameplay_distinct_videos,99);
for(const metric of ['exact_editions_verified_from_video_frames','card_ids_verified_from_video_frames','pp_builds_verified_from_video_frames','pro_tournament_verified']) {
 assert.equal(cov[metric],0,'Métrica de prova sem evidência: '+metric);
}
console.log('V171 OK: 246 cartas, 393 vínculos, 377 vídeos, 44 candidatos isolados, 9 vídeos compartilhados.');
console.log('V171 OK: 130 pacote, 111 candidatos, 5 sem vídeo; 82 cartas com rótulos de gameplay (NÃO comprovados).');
console.log('AVISO: PASSAR NO TESTE NÃO É CERTIFICAR VIDEO, PP, CARD ID, PLAYER ID NEM PRO PLAYER.');
