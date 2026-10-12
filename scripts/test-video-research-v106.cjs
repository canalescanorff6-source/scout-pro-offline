'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..');
const ledger=JSON.parse(fs.readFileSync(path.join(root,'web/SCOUT_V106_PESQUISA_VIDEOS.json'),'utf8'));
const base=JSON.parse(fs.readFileSync(path.join(root,'web/SCOUT_V69_AUDITORIA.json'),'utf8'));
const arts=JSON.parse(fs.readFileSync(path.join(root,'web/SCOUT_V98_AUDITORIA_TATICA.json'),'utf8'));
const index=new Map(base.cards.map(c=>[c.numero,c]));
const visual=new Map(arts.cartas.map(c=>[c.numero,c]));
assert(['SCOUT_V106_RESEARCH','SCOUT_V107_RESEARCH','SCOUT_V108_RESEARCH'].includes(ledger.schema));
assert.equal(ledger.cards.length,246);
assert.equal(index.size,246);assert.equal(visual.size,246);
const nums=new Set(),seenVideos=new Map();let covered=0,candidates=0,none=0,clips=0;
const frozenOriginal={5:['75T92Osqh9E'],8:['806wGTD7-jI','_z7pZZJJX8E'],11:['4n21m_yDlpM','imaTX9ksg8c'],13:['sI_v0-uRQRo','91nbzXAvlhY'],14:['gzMwwGjkf4Q'],54:['TQCxS8HLpO4','cGKrahoX1l8'],69:['07YW9c0DNlc'],104:['5-j6ltPc-wQ'],143:['1hM2VFFspPU','-bpFTL5azE0'],171:['v1jwycY0hoI','dGLGMYbB9HE','DTpqAQId0vk','bdt3C-Dan5I'],208:['7YFcuU6q8_Y','VrMyH7s5PiY'],246:['voLeIVINK5w','BL1n4E0UXCk']};
const frozenV107={28:['1ToDkl_vn3Q'],32:['fNRsm4rS-rI'],46:['FNWZfM24ZmU','BtZ7iOavJpA','kIOSVg4iWmM'],57:['7XPBk3Cd2VE'],144:['q4Iip8nJUA8','RYczlaoi7Y8'],153:['q4Iip8nJUA8','RYczlaoi7Y8'],155:['MIV4IsuxZlo'],165:['nCrqhfXsxco'],168:['ySblbmxIVMQ'],210:['I_IjKnueXQQ'],216:['DK4oUfwuPDQ']};
for(const c of ledger.cards){
 assert(!nums.has(c.numero),'CAP number duplicated');nums.add(c.numero);
 const src=index.get(c.numero),v=visual.get(c.numero);assert(src,'CAP missing '+c.numero);assert(v?.imagem.startsWith('cartas/CAP_'));
 assert.equal(c.card_id,src.id,'Card ID must remain exact');
 assert.equal(c.edicao,src.versao,'Edition must remain exact');
 assert.equal(c.nome,src.name,'Name must remain exact');
 assert(Array.isArray(c.videos));
 for(const old of frozenOriginal[c.numero]||[])assert(c.videos.some(v=>v.video_id===old),'Previously saved video lost from CAP '+c.numero+': '+old);
 for(const old of frozenV107[c.numero]||[])assert(c.videos.some(v=>v.video_id===old),'V107 video missing from CAP '+c.numero+': '+old);
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
  if(seenVideos.has(video.video_id)){
   assert.equal(seenVideos.get(video.video_id),c.card_id,'Video may only be shared across duplicate CAP records with identical Card ID: '+video.video_id);
  }else seenVideos.set(video.video_id,c.card_id);
  assert.equal(video.card_id_exibido_e_conferido_no_video,false);
  assert.equal(video.desempenho_player_id_analisado,false);
 }
}
assert.deepEqual([covered,candidates,none,clips],[21,8,217,49]);
assert.equal(seenVideos.size,47,'Unique videos count');
assert.equal(ledger.summary.com_video_pacote_compativel,covered);
assert.equal(ledger.summary.com_apenas_candidatos,candidates);
assert.equal(ledger.summary.sem_video,none);
assert.equal(ledger.summary.total_videos,clips);
assert.equal(ledger.summary.total_videos_unicos,seenVideos.size);
assert.equal(ledger.summary.card_ids_verificados_em_quadros_de_video,0);
assert.equal(ledger.summary.cobertura_completa,false);
const html=fs.readFileSync(path.join(root,'web/pesquisa-videos-v106.html'),'utf8');
const js=fs.readFileSync(path.join(root,'web/pesquisa-videos-v106.js'),'utf8');
new (require('node:vm').Script)(js);
for(const id of ['art','name','videos','details','filter','metrics','search','profile'])assert(html.includes('id="'+id+'"'));
assert(js.includes('SCOUT_V106_PESQUISA_VIDEOS.json'));
assert(js.includes('SCOUT_V98_AUDITORIA_TATICA.json'));
assert(fs.readFileSync(path.join(root,'web/index.html'),'utf8').includes('pesquisa-videos-v106.html'));
console.log('V108 OK: 246 cards, 49 CAP-video references (47 unique), all 37 prior entries retained, original arts/IDs intact, no false Player ID validation.');
