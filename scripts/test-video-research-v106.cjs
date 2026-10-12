'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..');
const ledger=JSON.parse(fs.readFileSync(path.join(root,'web/SCOUT_V106_PESQUISA_VIDEOS.json'),'utf8'));
const base=JSON.parse(fs.readFileSync(path.join(root,'web/SCOUT_V69_AUDITORIA.json'),'utf8'));
const arts=JSON.parse(fs.readFileSync(path.join(root,'web/SCOUT_V98_AUDITORIA_TATICA.json'),'utf8'));
const index=new Map(base.cards.map(c=>[c.numero,c]));
const visual=new Map(arts.cartas.map(c=>[c.numero,c]));
assert.equal(ledger.schema,'SCOUT_V106_RESEARCH');
assert.equal(ledger.cards.length,246);
assert.equal(index.size,246);assert.equal(visual.size,246);
const nums=new Set(),seenVideos=new Set();let covered=0,candidates=0,none=0,clips=0;
for(const c of ledger.cards){
 assert(!nums.has(c.numero),'CAP number duplicated');nums.add(c.numero);
 const src=index.get(c.numero),v=visual.get(c.numero);assert(src,'CAP missing '+c.numero);assert(v?.imagem.startsWith('cartas/CAP_'));
 assert.equal(c.card_id,src.id,'Card ID must remain exact');
 assert.equal(c.edicao,src.versao,'Edition must remain exact');
 assert.equal(c.nome,src.name,'Name must remain exact');
 assert(Array.isArray(c.videos));
 assert.equal(c.player_id_validado,false,'Do not fabricate Player ID based on metadata');
 assert.equal(c.build_video_validada,false,'Do not claim completed build without inspecting footage');
 assert(['encontrado_por_pacote','candidato_sem_versao_confirmada','pendente'].includes(c.estado));
 if(c.estado==='encontrado_por_pacote'){covered++;assert(c.videos.some(x=>x.compatibilidade==='pacote_compativel'))}
 else if(c.estado==='candidato_sem_versao_confirmada'){candidates++;assert(c.videos.every(x=>x.compatibilidade==='edicao_pendente'))}
 else{none++;assert.equal(c.videos.length,0)}
 for(const video of c.videos){
  clips++;
  assert.equal(video.plataforma,'youtube');
  assert(/^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}$/.test(video.url),'Only verified video URLs can be persisted');
  assert(!seenVideos.has(video.video_id),'Duplicate video ID '+video.video_id);seenVideos.add(video.video_id);
  assert.equal(video.card_id_exibido_e_conferido_no_video,false);
  assert.equal(video.desempenho_player_id_analisado,false);
 }
}
assert.deepEqual([covered,candidates,none,clips],[8,4,234,22]);
assert.equal(ledger.summary.com_video_pacote_compativel,covered);
assert.equal(ledger.summary.com_apenas_candidatos,candidates);
assert.equal(ledger.summary.sem_video,none);
assert.equal(ledger.summary.total_videos,clips);
assert.equal(ledger.summary.card_ids_verificados_em_quadros_de_video,0);
assert.equal(ledger.summary.cobertura_completa,false);
const html=fs.readFileSync(path.join(root,'web/pesquisa-videos-v106.html'),'utf8');
const js=fs.readFileSync(path.join(root,'web/pesquisa-videos-v106.js'),'utf8');
new (require('node:vm').Script)(js);
for(const id of ['art','name','videos','details','filter','metrics','search','profile'])assert(html.includes('id="'+id+'"'));
assert(js.includes('SCOUT_V106_PESQUISA_VIDEOS.json'));
assert(js.includes('SCOUT_V98_AUDITORIA_TATICA.json'));
assert(fs.readFileSync(path.join(root,'web/index.html'),'utf8').includes('pesquisa-videos-v106.html'));
console.log('V106 OK: 246 entries, 22 videos, original image and card IDs intact, no fictional professional usage, no premature Player ID conclusions.');
