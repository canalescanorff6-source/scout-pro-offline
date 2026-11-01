// Fixture histórica anterior à correção autorizada V381; dados atuais são verificados no teste de integração V381.
const {historicalRead}=require('./historical-level-fixtures-v381.cjs');
'use strict';
/* V296 — exigir vínculo explícito da edição em toda confirmação de PP.
 * Provas antigas ficam no armazenamento para reconfirmação, nunca migração implícita. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const catalog=historicalRead(path.join(root,'web/SCOUT_V69_AUDITORIA.json'),'utf8');
const cards=JSON.parse(catalog).cards;
const A=require('../web/craque-progresso-v248.js');
const C=require('../web/craque-progress-consistency-v249.js');
const X=require('../web/craque-progress-transfer-v250.js');
const F=require('../web/craque-ficha-individual-v251.js');
const T=require('../web/scout-multitactic-engine-v220.js');
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id+'@'+c.versao)).size,246);
const snapshot=JSON.stringify(cards);
const map=new Map();
const store={getItem:k=>map.has(k)?map.get(k):null,
 setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};
const receipt=(c,level)=>({
 schema:A.SCHEMA,numero:c.numero,card_id:String(c.id),name:c.name,
 edition:c.versao,level,pp:A.budget(level),confirmed_in_game:true,
 source:'conferência manual no eFootball',confirmed_at:'2026-10-21T12:00:00.000Z'
});
let valid=0,blocked=0;
for(const c of cards){
 const level=Number.isInteger(c.max_level)?c.max_level:
  Math.max(1,Math.min(120,Math.floor(c.pp/2)+1));
 const proof=receipt(c,level),name=C.key(c);
 assert.equal(A.key(c),name);assert.equal(X.key(c),name);
 assert(A.validate(c,proof));assert(C.validated(c,proof));assert(X.valid(c,proof));
 for(const different of [
  {...proof,edition:undefined},{...proof,edition:null},
  {...proof,edition:''},{...proof,edition:'Outra edição — mesmo CAP, ID e nome'}
 ]){
  assert.equal(A.validate(c,different),null,'V248 indevidamente aceita edição incorreta #'+c.numero);
  assert.equal(C.validated(c,different),null,'V249 indevidamente aceita edição incorreta #'+c.numero);
  assert.equal(X.valid(c,different),false,'V250 indevidamente aceita edição incorreta #'+c.numero);
  map.set(name,JSON.stringify(different));
  assert.equal(A.readSaved(c,store),null);
  assert.equal(C.localReview(c,store),null);
  assert.equal(X.readSaved(c,store),null);
  assert.equal(F.localLevelReview(c,store),null);
  blocked++;
 }
 map.set(name,JSON.stringify(proof));
 assert.equal(A.readSaved(c,store).edition,c.versao);
 assert.equal(C.localReview(c,store).edition,c.versao);
 assert.equal(X.readSaved(c,store).edition,c.versao);
 assert.equal(F.localLevelReview(c,store)?.level,level);
 // Mesmo que a chave legada coincida, trocar somente a edição invalida tudo.
 const shifted={...c,versao:'Outra versão da mesma carta'};
 assert.equal(A.readSaved(shifted,store),null);
 assert.equal(C.localReview(shifted,store),null);
 assert.equal(X.readSaved(shifted,store),null);
 assert.equal(F.localLevelReview(shifted,store),null);
 map.delete(name);valid++;
}
assert.equal(valid,246);
assert.equal(blocked,984);
// V250: não importar recibo exportado por versão antiga ou outra edição.
// Conferências originais do dispositivo não podem ser apagadas na tentativa.
const fixture=cards.find(c=>c.numero===191),verified=receipt(fixture,26);
const oldReceipt={...verified};delete oldReceipt.edition;
for(const forbidden of [oldReceipt,{...verified,edition:'Carta de edição diferente'}]){
 const incoming={schema:X.SCHEMA,total:1,records:[forbidden]};
 const oldState=JSON.stringify([...map]);
 assert.throws(()=>X.inspect(incoming,cards,store),/bloqueada|edição/i);
 assert.equal(JSON.stringify([...map]),oldState);
}
const martin=cards.find(c=>c.numero===191);
assert(martin&&martin.max_level===26&&martin.pp===50);
const valid191=receipt(martin,26);
map.set(A.key(martin),JSON.stringify(valid191));
for(const tactic of T.STYLES){
 assert.equal(F.localLevelReview(martin,store)?.pp,50);
 assert.equal(T.styleFor(tactic.id)?.id,tactic.id);
}
const legacy={...valid191};delete legacy.edition;
map.set(A.key(martin),JSON.stringify(legacy));
assert.equal(F.localLevelReview(martin,store),null);
assert.equal(A.readSaved(martin,store),null);
// Guardar registro antigo não o autoriza nem o apaga.
assert.equal(JSON.parse(map.get(A.key(martin))).confirmed_in_game,true);
assert.equal(JSON.stringify(cards),snapshot);
assert.equal(historicalRead(path.join(root,'web/SCOUT_V69_AUDITORIA.json'),'utf8'),catalog);
assert(historicalRead(path.join(root,'package.json'),'utf8').includes('test-progress-edition-v296.cjs'));
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v296-progress-proof-246.json'),
 JSON.stringify({schema:'CRAQUE_V296_PROGRESS_EDITION_PROOF',
  cards:246,receiptValid:valid,receiptRejected:blocked,
  invalidScenarios:['sem_edition','edition_null','edition_vazia','outra_edition'],
  martinelli:{cap:191,maxLevel:26,pp:50,tactics:5},
  catalogModified:false,legacyRecordPolicy:'preservar_e_exigir_reconfirmacao',
  gameplayValidated:false},null,2)+'\n');
console.log('V296 PASS: 246 cartas, 984 recibos falsos/legados bloqueados, 5 estilos de Martinelli preservados, nenhum PP alterado.');