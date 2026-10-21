'use strict';
/* V292: precisão do ESTADO DE PROVA dos ímpetos, sem mudar scores,
 * inventar slot/equipamento ou promover números a gameplay verificado. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const B=require('../web/booster-engine-v103.js');
const S=require('../web/skills-booster-v162.js');
const raw=read('web/SCOUT_V69_AUDITORIA.json'),cards=JSON.parse(raw).cards;
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id+'@'+c.versao)).size,246);
const snapshot=JSON.stringify(cards);
let scenarios=0;
const statuses={},samples=[];
for(const c of cards){
 const record=JSON.stringify(c);
 for(const tactic of B.tactics){
  const rank=B.rank(c,tactic);
  assert(rank.length>0,'Ranking vazio: '+c.numero+' '+tactic);
  const state=rank[0].estado_confianca;
  assert(['PENDENTE_IDENTIDADE','PENDENTE_NATIVAS',
   'BAIXA_SEM_PROVA_NIVEL_PP','BAIXA_SEM_BUILD_CONFERIDA',
   'COMPARACAO_LIMITADA'].includes(state));
  assert(rank.every(x=>x.estado_confianca===state),'Prova não deve variar entre candidatos da mesma edição');
  assert(rank.every(x=>x.evidencias.atributos_finais_comprovados===false));
  assert(rank.every(x=>x.evidencias.identidade_documental===
   (state!=='PENDENTE_IDENTIDADE')));
  assert(rank.every(x=>x.confianca==='pendente'||
   x.confianca==='baixa'||x.confianca==='comparativa_limitada'));
  assert(rank.every(x=>x.status_validacao==='HIPOTESE_COMPETITIVA_SEM_HOMOLOGACAO'));
  assert(rank.every(x=>x.evidencias.score_adicionais===0));
  if(state.startsWith('PENDENTE'))assert(rank.every(x=>x.confianca==='pendente'));
  if(state==='COMPARACAO_LIMITADA')assert(rank.every(x=>x.confianca==='comparativa_limitada'));
  statuses[state]=(statuses[state]||0)+1;
  if(tactic==='posse')samples.push({capture:c.numero,id:c.id,state,first:rank[0].nome,
   next:rank[1]?.nome||null});
  scenarios++;
 }
 assert.equal(JSON.stringify(c),record,'Carta mutada na memória: '+c.numero);
}
assert.equal(scenarios,1230);
assert(Object.keys(statuses).length>=3,'Caminhos de prova heterogêneos precisam ser exercitados');
const martin=cards.find(c=>c.numero===191);
assert(martin&&martin.max_level===26&&martin.pp===50&&martin.treino_proposto_nao_validado);
const original=B.rank(martin,'posse');
assert.equal(original[0].estado_confianca,'BAIXA_SEM_BUILD_CONFERIDA');
const simulatedApproved={...martin,treino_proposto_nao_validado:false};
const corresponding=B.rank(simulatedApproved,'posse');
assert.equal(corresponding[0].estado_confianca,'COMPARACAO_LIMITADA');
assert.deepEqual(original.map(x=>[x.nome,x.score]),corresponding.map(x=>[x.nome,x.score]),
 'Apenas prova alterada: ranking não deve ser reordenado por status');
for(const altered of [
 {...simulatedApproved,id:'PENDENTE - verificar'},
 {...simulatedApproved,versao:'PENDENTE - verificar'}
])assert.equal(B.rank(altered,'posse')[0].estado_confianca,'PENDENTE_IDENTIDADE');
assert.equal(B.rank({...simulatedApproved,habilidades_nativas:null},'posse')[0].estado_confianca,
 'PENDENTE_NATIVAS');
assert.equal(B.rank({...simulatedApproved,max_level:undefined},'posse')[0].estado_confianca,
 'BAIXA_SEM_PROVA_NIVEL_PP');
assert.equal(B.rank({...simulatedApproved,pp_origem:'sem_fonte'},'posse')[0].estado_confianca,
 'BAIXA_SEM_PROVA_NIVEL_PP');
// O adaptador V162 não pode perder origem/nivel, mas não confunde
// recomendação com permissão para gastar ímpetos.
const adapter={capture:martin.numero,id:martin.id,edition:martin.versao,
 role_used:martin.posicao,shown_position:martin.posicao,posicao:martin.posicao,
 native_skills:martin.habilidades_nativas,
 attack_style:martin.estilo_ataque,defence_style:martin.estilo_defesa,
 pp:martin.pp,max_level:martin.max_level,pp_origem:martin.pp_origem,
 training_provisional:martin.treino_proposto_nao_validado,
 recommended_levels:martin.niveis,boost1:martin.impeto_fixo,boost2:martin.impeto_extra};
const wrapped=S.booster(adapter,'posse',B);
assert.equal(wrapped.primary.estado_confianca,'BAIXA_SEM_BUILD_CONFERIDA');
assert.equal(wrapped.able,false);
assert.equal(JSON.stringify(cards),snapshot);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),raw);
assert(read('package.json').includes('test-booster-confidence-v292.cjs'));
assert(read('web/sw.js').includes('v292-booster-proof'));
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v292-booster-confidence-246x5.json'),JSON.stringify({
 schema:'CRAQUE_V292_CONFIDENCE_BOOSTER',cards:246,scenarios,statuses,samples,
 note:'Estabilidade documental não representa elegibilidade real de segundo slot nem desempenho comprovado.'},null,2)+'\n');
console.log('V292 PASS: '+scenarios+' cenários de booster; confiança por identidade/nativas/PP; cartas intactas.');
