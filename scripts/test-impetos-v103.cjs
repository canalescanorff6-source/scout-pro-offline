'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const E=require('../web/booster-engine-v103.js');
const a=JSON.parse(fs.readFileSync(path.join(root,'web/SCOUT_V69_AUDITORIA.json'),'utf8'));
const v=JSON.parse(fs.readFileSync(path.join(root,'web/SCOUT_V98_AUDITORIA_TATICA.json'),'utf8'));
const r=E.audit(a.cards);
assert.equal(r.cards.length,246);
assert.deepEqual(r.summary,{total:246,selecionavel:95,possivel:3,nome_registrado:4,indefinido:144});
assert.equal(v.cartas.length,246);
const index=new Map(v.cartas.map(c=>[c.numero,c]));
for(const c of r.cards){
 assert(index.get(c.numero)?.imagem?.startsWith('cartas/CAP_'));
 assert.equal(c.ficha,index.get(c.numero).ficha);
 assert(c.recomendacoes.posse.length>=1&&c.recomendacoes.posse.length<=(c.posicao==='GR'||c.posicao==='GO'?2:3),'Só ímpetos elegíveis não repetidos');
 for(const tactic of E.tactics)for(const rec of c.recomendacoes[tactic]){
  assert(E.BOOSTERS[rec.nome]);
  assert.equal(rec.atributos.length,4);
  assert(Number.isFinite(rec.score));
  if(c.posicao==='GR'||c.posicao==='GO')assert(['Saving','Goalkeeping'].includes(rec.nome));
 }
}
assert.equal(r.cards.find(c=>c.numero===11).status_slot_fonte,'nome_registrado');
assert.equal(r.cards.find(c=>c.numero===1).status_slot_fonte,'selecionavel');
const html=fs.readFileSync(path.join(root,'web/revisao-impetos-v103.html'),'utf8');
assert(html.includes('revisao-impetos-v103.js'));assert(html.includes('booster-engine-v103.js'));
assert(fs.readFileSync(path.join(root,'web/index.html'),'utf8').includes('revisao-impetos-v103.html'));
console.log('V103 OK: 246 cartas, fontes originais preservadas, slots não inferidos como vazios e 3 recomendações heurísticas por tática.');
