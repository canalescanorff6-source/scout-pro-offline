'use strict';
/* V178 — skills e boosters visíveis, cinco espaços adicionais, sem usar ímpeto sem slot. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const base=path.resolve(__dirname,'../web');
const S=require(path.join(base,'skills-booster-v162.js'));
const B=require(path.join(base,'booster-engine-v103.js'));
const roster=JSON.parse(fs.readFileSync(path.join(base,'SCOUT_V69_AUDITORIA.json'),'utf8')).cards;
const art=JSON.parse(fs.readFileSync(path.join(base,'SCOUT_V98_AUDITORIA_TATICA.json'),'utf8')).cartas;
assert.equal(roster.length,246);
assert.equal(art.length,246);
assert.equal(new Set(roster.map(c=>c.numero)).size,246);
const card=n=>{const c=roster.find(x=>x.numero===n);assert(c);return {capture:c.numero,id:c.id,shown_position:c.posicao,attack_style:c.estilo_ataque,
 defence_style:c.estilo_defesa,native_skills:c.habilidades_nativas,additional_candidates:c.adicionais_candidatas,
 boost1:c.impeto_fixo,boost2:c.impeto_extra};};
let unknown=0,proposals=0;
for(const c of roster){
 const d=card(c.numero);
 for(const t of ['posse','normal','rapido']){
  const r=S.evaluate(d,t);
  assert(r.recommendations.length>0&&r.recommendations.length<=5,'Até cinco prioridades de habilidades: '+c.numero+' '+t);
  assert.equal(new Set(r.recommendations.map(s=>s.key)).size,r.recommendations.length,'Sem habilidades duplicadas');
  if(!r.nativeKnown)unknown++;
  const native=new Set(String(c.habilidades_nativas||'').split(';').map(S.keyFor).filter(Boolean));
  for(const skill of r.recommendations)assert(!native.has(skill.key),'Duplicou nativa: '+c.numero+' '+skill.name);
  const boost=S.booster(d,t,B);
  if(boost.primary){assert(B.CRAFTABLE.includes(boost.primary.nome));if(!boost.able)assert(boost.equipStatus!=='condicionado_a_slot')}
  proposals++;
 }
}
const Ronaldo=S.booster(card(24),'posse',B);
assert.equal(Ronaldo.able,false,'Big Time Ronaldo possui segundo ímpeto nomeado');
assert(Ronaldo.primary,'Ranking consultivo para Ronaldo sem terceiro slot');
assert.equal(Ronaldo.equipStatus,'comparacao_segundo_fixo');
assert(S.booster(card(81),'posse',B).primary,'Rivaldo recebe indicação teórica sem comprovar slot');
assert.equal(S.booster(card(81),'posse',B).able,false);
assert(S.booster(card(172),'posse',B).primary,'Courtois recebe sugestão consultiva');
assert.equal(S.booster(card(172),'posse',B).able,false);
const CourtoisConfirmado=S.booster(card(172),'posse',B,'vazio');
assert(CourtoisConfirmado.primary,'Após confirmação do usuário, sugerir ímpeto do Courtois');
assert(['Saving','Goalkeeping'].includes(CourtoisConfirmado.primary.nome));
assert.equal(S.booster(card(172),'posse',B,'ausente').able,false,'Ausência impede equipar');
assert.equal(S.booster(card(172),'posse',B,'ausente').equipStatus,'impossivel_na_conta');
assert(S.booster(card(236),'posse',B).primary,'Slot de Eto\'o consta selecionável no catálogo');
assert.equal(S.evaluate(card(40),'posse').nativeKnown,true);
const Yorke=S.evaluate(card(40),'posse').recommendations.map(x=>x.key);
assert(!Yorke.includes('onepass')&&!Yorke.includes('firstshot'),'Não duplicar skills nativas do Yorke');
const panel=fs.readFileSync(path.join(base,'skills-booster-v162.js'),'utf8');
assert(panel.includes('id="v162-source"')&&panel.includes('Adicionais informadas'),'Ficha deve mostrar 5 skills e dois ímpetos');
const app=fs.readFileSync(path.join(base,'app-bridge.js'),'utf8');
assert(app.includes("v162.onerror=showSkillsUnavailable"),'Mostrar erro de carregamento de skills');
const sw=fs.readFileSync(path.join(base,'sw.js'),'utf8');
for(const required of ['skills-booster-v162.js','booster-engine-v103.js','revisao-impetos-v103.js'])
 assert(sw.includes("'./"+required+"'"),'Cache offline precisa incluir '+required);
assert(sw.includes("scout-pro-v177-1-v178"),'Cache novo evita scripts antigos no Android');
assert.equal(fs.readFileSync(path.join(base,'fichas/040_Dwight_Yorke.html'),'utf8').includes('id="scout-v68-data"'),true);
assert.equal(roster.find(c=>c.numero===81).impeto_fixo,'PENDENTE','Não inventar nome do ímpeto de Rivaldo');
assert.equal(roster.find(c=>c.numero===172).impeto_extra,'NENHUM BOOSTER NATIVO CONFIRMADO','Não alterar documento original sem screenshot');
console.log('V178 OK: '+proposals+' avaliações; 246 fichas com até 5 recomendações condicionais e vagas não preenchidas explícitas; '+unknown+' cenários sem skills nativas confirmadas, sem inventar boosters.');
