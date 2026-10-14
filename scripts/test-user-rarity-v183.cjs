'use strict';
const assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path');
const web=path.join(__dirname,'../web');
const read=p=>JSON.parse(fs.readFileSync(path.join(web,p),'utf8'));
const roster=read('SCOUT_V69_AUDITORIA.json');
const tactic=read('SCOUT_V98_AUDITORIA_TATICA.json');
const research=read('SCOUT_V179_NATIVE_SKILLS_RESEARCH.json');
const evidence=read('SCOUT_V182_SKILLS_BOOSTERS_EVIDENCE.json');
const index=fs.readFileSync(path.join(web,'index.html'),'utf8');
const expected=new Map([[75,'SHOW TIME'],[151,'DISTINGUIDO'],[170,'SHOW TIME'],[181,'DISTINGUIDO']]);
const editions=new Map([[75,'Show Time — Daily Bonus 2026 — Luis Díaz'],[170,"Show Time — Extraordinary One 4 Dec '25 — Jan Oblak"]]);
assert.equal(roster.cards.length,246);assert.equal(tactic.cartas.length,246);
assert.equal(roster.summary.native_skills,242);
assert.equal(roster.summary.raridade_confirmada_pelo_usuario,58);
assert.equal(evidence.totais.habilidades_cadastradas,242);
assert.equal(evidence.totais.habilidades_sem_lista,4);
assert.deepEqual(evidence.pendencias_habilidades.map(x=>x.numero),[50,151,181,225]);
for(const [cap,rarity] of expected){
 const card=roster.cards.find(x=>x.numero===cap);
 const html=fs.readFileSync(path.join(web,card.arquivo),'utf8');
 const hit=index.match(new RegExp('<a class="player-card"[^>]*data-cap="'+cap+'"[^>]*>[\\s\\S]*?<\\/a>'));
 assert.equal(card.raridade_confirmada,rarity,'Raridade da carta #'+cap);
 assert.match(card.raridade_confirmacao_origem,/usuario/);
 assert(html.includes('— '+rarity+' | SCOUT PRO'),'Etiqueta visual #'+cap);
 assert(hit && hit[0].includes('data-rarity="'+rarity+'"'),'Raridade do catálogo #'+cap);
 if(editions.has(cap)){
  const label=editions.get(cap),record=research.records.find(x=>x.cap===cap);
  assert.equal(card.versao,label);assert.equal(tactic.cartas.find(x=>x.numero===cap).edicao,label);
  assert(html.includes(label));assert(hit[0].includes(label));
  assert.equal(record.status,'card_id_nome_edicao');
  assert.equal(card.habilidades_nativas,record.skills.join('; '));
  assert.equal(card.habilidades_nativas_origem.confirmacao_no_jogo,false);
  assert.equal(card.impeto_fixo,evidence.cartas.find(x=>x.numero===cap).impeto_fixo_registrado);
 }else{
  assert(!card.habilidades_nativas,'Não importar skills de Show Time para Distinguido #'+cap);
  assert.equal(evidence.cartas.find(x=>x.numero===cap).habilidades_status,'pendente_identidade');
 }
}
const rodri=roster.cards.find(x=>x.numero===225);
assert.equal(rodri.id,'106780940205246','ID Rodri não pode ser trocado sem confirmação inequívoca da carta original');
assert(!rodri.habilidades_nativas,'Skills de Nico O\'Reilly nunca podem ser importadas para Rodri');
assert.equal(evidence.totais.slot_livre_confirmado_diretamente_no_repositorio,0);
console.log('V183 OK: 4 raridades confirmadas, #075/#170 documentadas externamente, 4 bloqueios preservados, Rodri pendente, 246 cartas intactas.');
