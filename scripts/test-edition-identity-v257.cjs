// Fixture histórica anterior à correção autorizada V381; dados atuais são verificados no teste de integração V381.
const {historicalRead}=require('./historical-level-fixtures-v381.cjs');
'use strict';
/* V257 — CAP/Card ID/edição não podem divergir entre fontes da mesma ficha. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>historicalRead(path.resolve(__dirname,'..',p),'utf8');
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const E=require('../web/craque-role-intelligence-v233.js');
const T=require('../web/scout-multitactic-engine-v220.js');
const styles=['posse','normal','rapido','fora','longo'];
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id)).size,246);
const original=JSON.stringify(cards);
let inspections=0;
for(const c of cards){
 const card={...c,capture:c.numero,card_id:c.id,edition:c.versao,
  shown_position:c.posicao,recommended_levels:c.niveis};
 const snapshot=JSON.stringify(card);
 assert.deepEqual(E.identityIssues(card),[],'Identidade válida #'+c.numero);
 for(const tactic of styles){
  const result=E.compare(card,tactic,{});
  assert(result.analysis,'Análise para toda edição original');
  assert.deepEqual(result.analysis.identityIssues,[]);
  assert.equal(result.analysis.capture,c.numero);
  assert.equal(result.analysis.id,c.id);
  assert.equal(result.analysis.edition,c.versao);
  inspections++;
 }
 assert.equal(JSON.stringify(card),snapshot,'Nenhuma mutação #'+c.numero);
}
assert.equal(inspections,1230);
assert.equal(JSON.stringify(cards),original);
// Fixture matemática sintética, sem editar o Martinelli real.
const m=cards.find(c=>c.numero===191);
assert(m);
assert.equal(m.max_level,26);
assert.equal(m.pp,50);
const synthetic=[2,0,0,0,0,12,12,0,0,0];
assert.equal(T.total(synthetic),50);
const eligible={...m,capture:191,card_id:m.id,edition:m.versao,
 shown_position:'AC',posicao:'AC',niveis:synthetic.slice(),
 recommended_levels:synthetic.slice()};
assert.equal(E.levelDocumented(eligible),true);
assert.deepEqual(E.identityIssues(eligible),[]);
assert(E.compare(eligible,'posse',{}).proposal,
 'Uma hipótese estritamente documental continua possível');
const variants=[
 ['capture',190,'CAP'],['numero',190,'CAP'],
 ['id','outro_card_id','Card ID'],['card_id','outro_card_id','Card ID'],
 ['edition','Outra edição','Edição'],['versao','Outra edição','Edição']
];
for(const [field,value,label] of variants){
 const bad={...eligible,[field]:value},before=JSON.stringify(bad);
 for(const tactic of styles){
  const out=E.compare(bad,tactic,{});
  assert.equal(out.proposal,null,field+' bloqueado em '+tactic);
  assert.equal(out.analysis.uncertainty,'pendente');
  assert(out.analysis.identityIssues.some(x=>x.includes(label)));
  assert.match(out.reason,/divergentes/);
  assert(out.analysis.tradeoffs.some(x=>x.includes('EDIÇÃO EM CONFLITO')));
 }
 assert.equal(JSON.stringify(bad),before,'Não mutar carta');
}
assert.deepEqual(E.identityIssues({...eligible,capture:'0191'}),[]);
assert.deepEqual(E.identityIssues({...eligible,shown_position:'CA'}),[]);
assert.deepEqual(E.identityIssues({...eligible,card_id:''}),[]);
assert(read('web/craque-role-panel-v233.js').includes('x.identityIssues?.length?out.reason'));
assert(read('web/sw.js').includes('v257-edition-fingerprint'));
assert.equal(JSON.stringify(cards),original);
console.log('V257 PASS: 1230 verificações, 30 bloqueios de identidade e 246 cartas intactas.');
