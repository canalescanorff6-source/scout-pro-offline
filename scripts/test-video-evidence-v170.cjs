'use strict';

/**
 * Scout PRO V170: audit ALL 246 video research records and every quarantined
 * lead. This is a structural integrity test, NOT proof of video frames.
 * No network requests; safe to run offline in Windows and Android CI.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(root, rel));

const ledger = read('web/SCOUT_V106_PESQUISA_VIDEOS.json');
const visual = read('web/SCOUT_V98_AUDITORIA_TATICA.json');
assert.equal(ledger.cards.length, 246, 'O elenco precisa ter 246 cartas');
assert.equal(visual.cartas.length, 246, 'A auditoria visual precisa ter 246 cartas');

const byNumber = new Map(ledger.cards.map(c => [c.numero, c]));
const artMap = new Map(visual.cartas.map(c => [c.numero, c]));
assert.equal(byNumber.size, 246, 'Há número de carta repetido');
assert.equal(artMap.size, 246, 'Há número visual repetido');
const officialIds = new Set();
let officialLinks = 0;
const categories = {encontrado_por_pacote:0, candidato_sem_versao_confirmada:0, pendente:0};
const problems = [];
const danger = (msg) => problems.push(msg);
for (let n=1;n<=246;n++){
  const card = byNumber.get(n), art = artMap.get(n);
  if (!card || !art) { danger('Carta ou arte ausente: '+n);continue; }
  if (!card.nome || !Array.isArray(card.videos) || !Array.isArray(card.referencias_da_carta)) danger('Ficha da carta inválida: '+n);
  if (!(card.estado in categories)) danger('Estado de pesquisa desconhecido CAP'+n);
  else categories[card.estado]++;
  if (card.nome !== art.nome) danger('Nome divergente CAP'+n+': '+card.nome+' / '+art.nome);
  if (/^\d+$/.test(String(card.card_id)) && /^\d+$/.test(String(art.card_id)) &&
      card.card_id !== art.card_id) danger('Card ID contraditório CAP'+n);
  for (const prop of ['imagem','ficha']) if (!art[prop] || !exists('web/'+art[prop]))
    danger('Arte ou ficha física ausente CAP'+n+': '+prop);
  const count = card.videos.length;
  if (count===0 && card.estado!=='pendente') danger('Carta sem vídeo declarada coberta CAP'+n);
  if (count>0 && card.estado==='pendente') danger('Carta com vídeo declarada pendente CAP'+n);
  if (card.player_id_validado===true && !card.player_id_evidencia)
    danger('Player ID declarado validado sem evidência CAP'+n);
  if (card.build_video_validada===true && !card.build_video_evidencia)
    danger('Build declarada validada sem evidência CAP'+n);
  for(const v of card.videos){
    officialLinks++;
    if (!/^[A-Za-z0-9_-]{11}$/.test(v.video_id||'')) danger('Video ID inválido CAP'+n);
    if (!['https://www.youtube.com/watch?v='+v.video_id,
           'https://www.youtube.com/shorts/'+v.video_id].includes(v.url))
      danger('URL/Video ID divergente CAP'+n+': '+v.url);
    officialIds.add(v.video_id);
    if (v.card_id_exibido_e_conferido_no_video===true && !v.evidencia_quadro_verificavel)
      danger('Card ID alegado sem quadro verificável CAP'+n);
    if (v.desempenho_player_id_analisado===true && !v.evidencia_analise_gameplay)
      danger('Gameplay Player ID alegado sem evidência CAP'+n);
  }
}
const sum = ledger.summary;
assert.equal(sum.total,246);
assert.equal(sum.com_video_pacote_compativel,categories.encontrado_por_pacote);
assert.equal(sum.com_apenas_candidatos,categories.candidato_sem_versao_confirmada);
assert.equal(sum.sem_video,categories.pendente);
assert.equal(sum.total_videos,officialLinks);
assert.equal(sum.total_videos_unicos,officialIds.size);
assert.equal(sum.cobertura_completa, categories.pendente===0 &&
  ledger.cards.every(c=>c.videos.some(v=>v.card_id_exibido_e_conferido_no_video===true)),
  'Cobertura completa não pode ser apenas quantidade de links');

const additional = [
 ['web/SCOUT_V157_LEADS_EXTERNOS.json','leads'],
 ['web/SCOUT_V159_LEADS_VIDEOS_PENDENTES.json','leads'],
 ['web/SCOUT_V159_LEADS_CARTAS_SEM_VIDEO.json','candidates'],
 ['web/SCOUT_V160_LEADS_RESTANTES.json','references'],
 ['web/SCOUT_V161_LEADS_RESTANTES.json','videos'],
 ['web/SCOUT_V163_LEADS_MESSI_ELENCOS_JAPONESES.json','entries'],
 ['web/SCOUT_V164_LEADS_CARTAS_PENDENTES.json','videos'],
 ['web/SCOUT_V165_LEADS_VIDEO_MESSI_COMPETITIVO.json','leads'],
 ['web/SCOUT_V167_LEADS_STANDARD_BENTANCUR_MAATSEN.json','leads'],
 ['web/SCOUT_V169_CINCO_CARTAS_CONFRONTO_EDICOES_VIDEOS.json','new_link']
];
const quarantine = new Map();
const urlId = (url) => {
  const m = url.match(/(?:[?&]v=|\/shorts\/|[?&]id=)([A-Za-z0-9_-]{11})(?:[&#?\/]|$)/);
  return m?.[1] || null;
};
for (const [rel,key] of additional) {
  const doc=read(rel);
  const group=key==='new_link'?[doc[key]]:doc[key];
  assert(Array.isArray(group),rel+' deve ter uma lista de candidatos');
  for(const v of group){
    if (!v || typeof v.url!=='string') {danger('Candidato sem URL: '+rel);continue;}
    if(!/^https:\/\//.test(v.url)) danger('URL de candidato insegura: '+v.url);
    if(quarantine.has(v.url)) danger('URL de candidato duplicada: '+v.url);
    quarantine.set(v.url,rel);
    const id=urlId(v.url);
    const selfId=v.video_id||v.youtube_id||v.media_id;
    if(selfId && id && selfId!==id) danger('ID e URL de candidato divergentes: '+v.url);
    if(id && officialIds.has(id)) danger('Candidato já está no catálogo oficial: '+v.url);
    const targets=v.target_cards||v.caps||[v.cap||v.card_num];
    for(const n of targets) if(!Number.isInteger(n)||n<1||n>246)
      danger('CAP alvo inválido em '+rel+': '+n);
    const confirmed=Object.entries(v).filter(([k,value])=>value===true &&
       /verified|confirmed|validada|conferido|inspected|comprovado|_exact|_visto/i.test(k));
    if(confirmed.length) danger('Candidato em quarentena marcado confirmado sem promoção auditada: '+v.url);
  }
}
if(quarantine.size < 44) danger('Reservas V157 e V159-V169 foram removidas: '+quarantine.size);

const unknownIds=ledger.cards.filter(c=>!/^\d+$/.test(String(c.card_id))).map(c=>c.numero);
const missing=ledger.cards.filter(c=>c.videos.length===0).map(c=>c.numero);
if (problems.length) throw new Error('Falhas de integridade V170 ('+problems.length+'):\n'+problems.slice(0,50).join('\n'));
console.log('SCOUT V170 INTEGRIDADE OK | cartas=246 | artes=246 | vídeos oficiais='+officialLinks+
  ' | vídeos distintos='+officialIds.size+' | candidatos adicionais='+quarantine.size+
  ' | cartas sem vídeo='+missing.join(',')+' | Card IDs pendentes='+unknownIds.length);
console.log('NOTA: verificações estruturais NÃO comprovam vídeo por quadros, identidade da carta, PP, nem pro player.');
