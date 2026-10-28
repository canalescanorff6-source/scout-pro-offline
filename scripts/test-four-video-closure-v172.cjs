'use strict';
/**
 * V172: Finaliza a fase documental de quatro cartas sem promover vídeos
 * não inspecionados. Este teste NÃO comprova frames, treino nem partidas.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const closure=read('web/SCOUT_V172_CONCLUSAO_QUATRO_VIDEOS.json');
const ledger=read('web/SCOUT_V106_PESQUISA_VIDEOS.json');
const matrix=read('web/SCOUT_V171_MATRIZ_EVIDENCIAS_246.json');
const ui=fs.readFileSync(path.join(root,'web/pesquisa-videos-v106.js'),'utf8');
const html=fs.readFileSync(path.join(root,'web/pesquisa-videos-v106.html'),'utf8');
assert.equal(closure.schema,'SCOUT_V172_FOUR_VIDEO_RESEARCH_CLOSURE');
assert.deepEqual(closure.scope,[120,141,234,235]);
assert.deepEqual(closure.cases.map(x=>x.cap),closure.scope);
assert.equal(closure.research_phase,'ENCERRADA_COM_DOCUMENTACAO');
assert.equal(closure.video_homologation_phase,'PENDENTE_SEM_QUADROS');
assert.equal(closure.verified_video_exact_editions,0);
assert.equal(closure.new_official_associations,0);
assert.equal(ledger.cards.length,246);
assert.equal(ledger.summary.total_videos,393);
assert.equal(ledger.summary.total_videos_unicos,377);
assert.equal(ledger.summary.sem_video,5);
assert.equal(matrix.coverage.quarantined_links,44);
assert.deepEqual(matrix.priority_pending,[50,120,141,234,235]);
assert(ui.includes('renderReservedVideos(c)')&&ui.includes('renderReservedVideos(card)'));
assert(ui.includes('SCOUT_V172_CONCLUSAO_QUATRO_VIDEOS.json'));
assert(html.includes('id="reserved-videos"')&&html.includes('id="reserved-video-content"'));
const byCap=new Map(ledger.cards.map(c=>[c.numero,c]));
const expected={
  120:{id:'105297',pp:68,external:'https://pesdb.net/efootball/players/rodrigo-bentancur-105297'},
  141:{id:'132386',pp:76,external:'https://pesdb.net/efootball/players/ian-maatsen-132386'},
  234:{id:null,pp:62,external:'https://pesdb.net/efootball/players/kakita-yuki-105903424658357'},
  235:{id:null,pp:64,external:'https://pesdb.net/efootball/players/kumasaka-koki-105903424704710'}
};
for(const item of closure.cases){
 const exp=expected[item.cap],official=byCap.get(item.cap);
 assert(exp&&official,'Carta não existente na lista de pendências');
 assert.equal(official.estado,'pendente');
 assert.equal(official.videos.length,0);
 assert.equal(item.card_id_registered,exp.id);
 if(exp.id) assert.equal(official.card_id,exp.id);
 else assert(!/^\d+$/.test(String(official.card_id)),'ID atribuído sem prova CAP'+item.cap);
 assert.equal(item.registered_pp_budget,exp.pp);
 assert(item.external_identification.sources.includes(exp.external));
 assert(fs.existsSync(path.join(root,item.art)),'Imagem original ausente: '+item.art);
 assert(item.video_leads.length>=2);
 for(const lead of item.video_leads){
   assert(/^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}$/.test(lead.url));
   assert.equal(lead.verified_exact_edition,false);
   assert(lead.reason.length>20,'Candidato sem limitação documentada');
 }
 assert(item.missing_to_homologate.length>30);
}
assert.equal(closure.cases.find(c=>c.cap===141).external_level_pp.levels_found.length,3);
for(const [key,val] of Object.entries(closure.policies))assert.equal(val,true,'Regra absoluta removida: '+key);
console.log('V172 OK: 4 buscas documentais encerradas, 8 links contextuais e 0 vídeo promovido sem frame.');
console.log('SCOUT V172: as 246 fichas, 377 vídeos e 44 reservas permanecem intactas.');
