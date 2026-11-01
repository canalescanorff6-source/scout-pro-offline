// Fixture histórica anterior à correção autorizada V381; dados atuais são verificados no teste de integração V381.
const {historicalRead}=require('./historical-level-fixtures-v381.cjs');
'use strict';
/* V303: cinco fichas PP por edição + tática; nunca treino automaticamente homologado. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>historicalRead(path.join(root,p),'utf8');
const T=require('../web/scout-multitactic-engine-v220.js');
const P=require('../web/craque-style-planner-v303.js');
const R=require('../web/skills-booster-v162.js'),B=require('../web/booster-engine-v103.js');
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
assert.equal(cards.length,246);
const before=JSON.stringify(cards);
const styles=['posse','normal','rapido','fora','longo'];
assert.deepEqual(Object.keys(P.STYLES),styles);
let conditional=0,withDifferences=0,threeDifferent=0,recs=0,missing=[];
for(const card of cards){
 const baseline=T.valid(card.niveis)&&T.total(card.niveis)===card.pp?
  card.niveis.slice():null;
 const vectors=new Set();
 for(const tactic of styles){
  const d={...card,shown_position:card.posicao,
   attack_style:card.estilo_ataque,defence_style:card.estilo_defesa,
   native_skills:card.habilidades_nativas,boost1:card.impeto_fixo,boost2:card.impeto_extra};
  const result=P.proposal(d,tactic,baseline);
  if(!result){
   missing.push(card.numero+':'+tactic);
   continue;
  }
  assert(T.valid(result.levels),'Vetor válido: '+card.numero+' '+tactic);
  assert.equal(T.total(result.levels),card.pp,'PP exato: '+card.numero+' '+tactic);
  assert.equal(result.tactic,tactic);
  assert(result.note.includes('não')||result.note.includes('Não')||result.source==='referencia_cadastrada');
  if(tactic==='posse'&&baseline)assert.deepEqual([...result.levels],baseline,
   'Posse deve preservar vetor original: '+card.numero);
  if(tactic!=='posse'){
   assert.equal(result.source,'simulacao_por_estilo');
   if(result.budgetEvidence!=='nivel_pp_informados')conditional++;
  }
  vectors.add(result.levels.join(','));
  const native=R.evaluate(d,tactic,'');
  assert(native.recommendations.length>0,'Candidatas de skills: '+card.numero+' '+tactic);
  assert(!native.equippedConfirmed,'Nunca inferir cinco slots livres');
  const booster=B.rank(d,tactic);
  assert(booster.length>0,'Ranking de ímpetos: '+card.numero+' '+tactic);
  recs++;
 }
 if(vectors.size>1)withDifferences++;
 if(vectors.size>=3)threeDifferent++;
}
assert.deepEqual(missing,[],'Sem PP ou posição em alguma carta, não fabricar build; investigar');
assert(withDifferences>=160,'Fichas continuam iguais em cartas demais: '+withDifferences);
assert(threeDifferent>=130,'Estilos devem gerar perfis próprios: '+threeDifferent);
const martin=cards.find(c=>c.numero===191);
assert.equal(martin.pp,50);assert.equal(martin.max_level,26);
assert(martin.treino_proposto_nao_validado);
const martinModes=styles.map(t=>P.proposal(martin,t));
assert(martinModes.every(x=>x.pp===50&&!x.note.includes('criador')));
assert(martinModes.filter(x=>x.tactic!=='posse').every(x=>x.source==='simulacao_por_estilo'));
const visible=read('web/craque-managers-v302.js');
assert(visible.includes('wrap.open=true'),'Seleção deve estar aberta, não escondida');
assert(visible.includes('card-shell-ready-v302')&&visible.includes('MutationObserver'),
 'Carregamento não pode depender somente de evento que pode ter ocorrido antes');
assert(visible.includes("KEY+':'+capture+'@'+cardId"),'Seleção individual por carta');
const ui=read('web/scout-card-unified-v220.js');
assert(ui.includes('host.CRAQUE_STYLE_PLANNER_V303'),'Motor por tática conectado');
assert(ui.includes('scout-v303-style-summary'),'Diferenças visíveis ao usuário');
assert(ui.includes('scoutpro:manager-selected-v302'),
 'Trocar técnico deve atualizar ficha, habilidades e ímpetos');
const training=read('web/scout-training-unified-v218.js');
assert(training.includes('original?original.slice():suggested?suggested.slice():null'),
 'Posse sem ficha original precisa receber proposta matemática');
assert(training.includes('sourceLabel')&&training.includes('não homologada'));
assert(read('web/sw.js').includes('v303-planner-per-style'),
 'PWA Android precisa invalidar cache ao publicar');
for(const file of ['craque-style-planner-v303.js','craque-managers-v302.js']){
 assert(read('scripts/stamp-bundle-v189.cjs').includes("'"+file+"'"),
  'Fingerprint de integridade deve incluir '+file);
 assert(read('web/sw.js').includes("'./"+file+"'"),'Offline Android: '+file);
}
assert.equal(JSON.stringify(cards),before,'Nenhuma carta original deve ser alterada');
console.log('V303 PASS: 246 cartas x 5 estilos = '+recs+' fichas/sugestões; '+
 withDifferences+' cartas com estilos distintos; '+threeDifferent+
 ' com 3+ vetores; '+conditional+' propostas condicionais. Catálogo original imutável.');
